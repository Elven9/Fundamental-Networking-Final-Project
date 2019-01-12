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
            @change="updateDataAndMarker(selectedRange, false, true)">
          </el-date-picker>
          <div id="time-diagram-container" v-loading="isLoadDiagram"><canvas id="time-diagram"></canvas></div>
          <el-table
            :data="distancesInfo"
            empty-text="暫無資料"
            style="width: 100%">
            <el-table-column
              prop="destination_address"
              label="目的地"
              min-width="180">
            </el-table-column>
            <el-table-column
              prop="original_address"
              label="出發地"
              min-width="180">
            </el-table-column>
            <el-table-column
              prop="distance"
              label="距離"
              min-width="100">
            </el-table-column>
            <el-table-column
              prop="duration"
              label="時間"
              min-width="100">
            </el-table-column>
          </el-table>
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
      isLoadMap: false,
      isLoadDiagram: false,
      distancesInfo: []
    }
  },
  methods: {
    async updateDataAndMarker(timeRange, toForceLoad=false, toLoadTimeDiagram=false) {
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

      // Update Map Markers
      this.gpsDatum.forEach(d => {
        this.addMarker({
          lat: Number(d.lat),
          lng: Number(d.lng)
        })
      })

      if (toLoadTimeDiagram) this.drawTimeDiagram();

      this.isLoadMap = false;
    },
    addMarker(position) {
      const newMarker = new google.maps.Marker({
        position,
        map: this.map
      });
      this.markers.push();
    },
    clearMap() {
      this.gpsDatum = [];
      this.vibrationDatum = [];
      // Clear Map and datum
      this.markers.forEach(m => {
        m.setMap(null);
      })
      this.markers = []
    },
    async drawTimeDiagram() {
      this.isLoadDiagram = true;
      // Data Process
      let xData = []
      let yData = []
      let originalData = this._.shuffle(this._.cloneDeep(this.gpsDatum));
      this.distancesInfo = [];
      for (let i = 0; i < originalData.length; i += 2) {
        if (i+1 === originalData.length) break;

        // Process Data
        let data = await this.$axios.get(encodeURI(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${originalData[i].lat},${originalData[i].lng}&destinations=${originalData[i+1].lat},${originalData[i+1].lng}&key=AIzaSyDXSltm-NZbSuE_VDkFylZWMgt_CxUKsgE`))
        xData.push(data.data.rows[0].elements[0].distance.text);
        yData.push(data.data.rows[0].elements[0].duration.value / 60);

        // Parse data
        data.data.destination_address = data.data.destination_addresses[0];
        data.data.original_address = data.data.origin_addresses[0];
        data.data.distance = data.data.rows[0].elements[0].distance.text;
        data.data.duration = data.data.rows[0].elements[0].duration.text;
        delete data.data.rows;
        delete data.data.destination_addresses;
        delete data.data.origin_addresses;
        delete data.data.status
        this.distancesInfo.push(data.data);
      }

      // Create Canvas
      let parentDiv = document.getElementById('time-diagram-container');
      parentDiv.childNodes[0].remove();
      parentDiv.appendChild(document.createElement('canvas'));
      let canvas = parentDiv.childNodes[0];
      canvas.setAttribute("id", "time-diagram");
      var ctx = canvas.getContext("2d");

      var timeDiagram = new Chart(ctx, {
        type: 'line',
        data: {
          labels: xData,
          datasets: [{
            label: '時間',
            data: yData
          }]
        },
        options: {
          title: {
            display: true,
            text: '距離-時間圖'
          }
        }
      });

      this.isLoadDiagram = false;
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

  #main-map {
    width: 100%;
    height: 500px;
    margin-bottom: 20px;
  }

  .inner-tab {
    min-height: 300px;

    #time-diagram {
      width: 100%;
      height: 400px;
    }
  }
}
</style>

