<template>
  <div class="home">
    <h1>機車防盜器 luluElvLouRayANto</h1>
    <div id="main-map" v-loading="isLoadMap"></div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date"></i>地點紀錄</span>
        <div class="inner-tab">
          <p>選取/新增使用中時間</p>
          <el-date-picker
            v-model="range"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            @change="addSelectedRange(range)">
          </el-date-picker>
          <p v-for="t in selectedUsage" :key="t.id">{{ `${t.start.format("dddd, MMMM Do YYYY, h:mm:ss a")} ~ ${t.end.format("dddd, MMMM Do YYYY, h:mm:ss a")}` }}</p>
          <el-button style="width:200px;margin-top:20px;margin-bottom:20px" @click="selectedUsage = []; range=null" type="primary" plain>清除時間紀錄</el-button>
          <p>時間區間</p>
          <el-date-picker
            v-model="selectedRange"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            @change="updateDataAndMarker(selectedRange)">
          </el-date-picker>
          <!-- <div v-loading="isLoadDiagram"><canvas id="time-diagram"></canvas></div> -->
          <el-table
            :data="distancesInfo"
            empty-text="暫無資料"
            style="width: 100%"
            height="400">
            <el-table-column
              prop="isAuthorized"
              label="使用狀態"
              min-width="70">
              <template slot-scope="scope">
                <el-tag
                  :type="!scope.row.isAuthorized? 'danger' : 'primary'"
                  disable-transitions>{{scope.row.isAuthorized ? '正常' : '被偷'}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="formatted_address"
              label="紀錄地點"
              min-width="180">
            </el-table-column>
            <el-table-column
              prop="time"
              label="時間"
              min-width="180">
            </el-table-column>
            <el-table-column
              prop="lat"
              label="緯度"
              min-width="100">
            </el-table-column>
            <el-table-column
              prop="lng"
              label="經度"
              min-width="100">
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <!-- <el-tab-pane>
        <span slot="label"><i class="el-icon-bell"></i>震動資料</span>
        <div class="inner-tab">

        </div>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  },
  data() {
    return {
      map: null,
      markers: [],
      originalDatum: [],
      selectedRange: null,
      isLoadMap: false,
      distancesInfo: [],
      range: null,
      selectedUsage: []
    }
  },
  methods: {
    async updateDataAndMarker(timeRange, toForceLoad=false) {
      var data;
      try {
        if (timeRange) {
          // 時間處理
          const startTime = this.$moment(timeRange[0]).format('YYYY-MM-DD HH:mm:ss')
          const endTime = this.$moment(timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
          data = await this.$axios.get(encodeURI(`https://iot.martinintw.com/api/v1/data/12345617?date_filter=${startTime}+-+${endTime}`)); 
        } else {
          if (toForceLoad) data = await this.$axios.get('https://iot.martinintw.com/api/v1/data/12345617');
          else {
            this.clearMap();
            this.isLoadMap = false;
            return;
          }
        }
      } catch(err) {
        console.log(err)
        this.isLoadMap = false;
        return;
      }

      this.clearMap();

      // Update Data
      data.data.forEach(d => {
        this.originalDatum.push(d);
      })

      this.drawTimeDiagram();
    },
    addSelectedRange(range) {
      this.selectedUsage.push({
        start: this.$moment(range[0]),
        end: this.$moment(range[1])
      })
    },
    addMarker(position) {
      const newMarker = new google.maps.Marker({
        position,
        map: this.map
      });
      this.markers.push(newMarker);
    },
    clearMap() {
      console.log('fdsaf')
      this.originalDatum = [];
      // Clear Map and datum
      this.markers.forEach(m => {
        m.setMap(null);
      })
      this.markers = []
    },
    async drawTimeDiagram() {
      this.isLoadMap = true;
      this.distancesInfo = [];

      // Helper Function
      let isInUsageTimeRange = (time) => {
        for (let j = 0; j < this.selectedUsage.length; j++) {
          const target = this.$moment(time);
          if (target.isAfter(this.selectedUsage[j].start) && target.isBefore(this.selectedUsage[j].end)) {
            return true;
          }
        }
        return false;
      }

      // Flag
      let isAuthorized = true;

      for (let i = 0; i < this.originalDatum.length; i += 1) {
        let data;
        // Check if data is generated by vibration.
        if (this.originalDatum[i].lat === "") {
          // Check if authorized
          if (!isInUsageTimeRange(this.originalDatum[i].created_at)) {
            // Not Authorized
            isAuthorized = false;
          } else {
            isAuthorized = true;
          }
          // Create Payload
          data = {
            formatted_address: '(震動資料)',
            lat: '/',
            lng: '/',
            time: this.$moment(this.originalDatum[i].created_at).format("dddd, MMMM Do YYYY, h:mm:ss a"),
            isAuthorized: isAuthorized
          }
        } else {
          // Get Data from google
          let info = await this.$axios.get(encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.originalDatum[i].lat},${this.originalDatum[i].lng}&key=AIzaSyC2IVFgbupvZjOn_hWVsyc_lpvaj9clOfw`))
          if (!isAuthorized && isInUsageTimeRange(this.originalDatum[i].created_at)) {
            // Not Authorized
            isAuthorized = true;
          }
          // Add Marker
          if (!isAuthorized) {
            this.addMarker({
              lat: Number(this.originalDatum[i].lat),
              lng: Number(this.originalDatum[i].lng)
            })
          }
          // Prepare Payload
          data = {
            formatted_address: info.data.results[0].formatted_address,
            lat: info.data.results[0].geometry.location.lat,
            lng: info.data.results[0].geometry.location.lng,
            time: this.$moment(this.originalDatum[i].created_at).format("dddd, MMMM Do YYYY, h:mm:ss a"),
            isAuthorized: isAuthorized
          }
        }
        // Parse data
        this.distancesInfo.push(data);
      }

      this.isLoadMap = false;
    }
  },
  async mounted() {
    // Load Google Map Api
    this.map = new google.maps.Map(document.getElementById('main-map'), {
      center: {
        lat: 24.793270,
        lng: 120.992995
      },
      zoom: 15,
      disableDefaultUI: true
    })
    this.drawTimeDiagram()
  }
}
</script>

<style lang="scss" scoped>
.home {
  margin-left: 10%;
  margin-right: 10%;
  margin-top: 50px;
  margin-bottom: 30px;

  h1 {
    color: bisque;
    font-weight: 500;
  }

  #main-map {
    width: 100%;
    height: 500px;
    margin-bottom: 20px;
  }

  .inner-tab {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    text-align: start;

    #time-diagram {
      width: 100%;
      height: 400px;
    }
  }
}
</style>

