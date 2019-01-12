<template>
  <div class="home">
    <div id="main-map" v-loading="isLoadMap"></div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-date"></i>時間選擇</span>
        <div class="inner-tab">
          <el-date-picker
            v-model="selectedRange"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            @change="updateDataAndMarker(selectedRange)">
          </el-date-picker>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-bell"></i>震動資料</span>
        <div class="inner-tab">

        </div>
      </el-tab-pane>
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
      gpsDatum: [],
      vibrationDatum: [],
      gpsDatum: [],
      selectedRange: null,
      isLoadMap: false
    }
  },
  methods: {
    async updateDataAndMarker(timeRange, toForceLoad=false) {
      this.isLoadMap = true;
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
        if (d.lat !== "" && d.lng !== "") this.gpsDatum.push(d)
        else this.vibrationDatum.push(d)
      })

      this.gpsDatum.forEach(d => {
        this.addMarker({
          lat: Number(d.lat),
          lng: Number(d.lng)
        })
      })

      this.isLoadMap = false;
    },
    addMarker(position) {
      this.markers.push(new google.maps.Marker({
        position,
        map: this.map
      }));
    },
    clearMap() {
      this.gpsDatum = [];
      this.vibrationDatum = [];
      // Clear Map and datum
      this.markers.forEach(m => {
        m.setMap(null);
      })
      this.markers = []
    }
  },
  async mounted() {
    // Load Google Map Api
    this.map = new google.maps.Map(document.getElementById('main-map'), {
      center: {
        lat: 24.793270,
        lng: 120.992995
      },
      zoom: 15
    })
  }
}
</script>

<style lang="scss" scoped>
.home {
  margin-left: 10%;
  margin-right: 10%;
  margin-top: 50px;
  margin-bottom: 30px;

  #main-map {
    width: 100%;
    height: 500px;
    margin-bottom: 20px;
  }

  .inner-tab {
    min-height: 300px;
  }
}
</style>

