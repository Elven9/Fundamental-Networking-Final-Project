<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <p>
      For a guide hwfhwjeofjwwfwlkf and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank">vue-cli documentation</a>.
    </p>
    <h1>Essential Links</h1>
    <p>{{descriptionData}}</p>
    <div class="temp">
      <div class="box1"></div>
      <div class="box2"></div>
      <div class="box3">
        <div class="small-box"></div>
        <div class="big-box">
          <div class="content-box"></div>
          <div class="content-box2"></div>
        </div>
        <div class="small-box"></div>
      </div>
    </div>
    <p class="font-setting">word with font style</p>
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
      descriptionData: '',
      updatedDesc: '',
      age: 18,
      name: "Louis"
    }
  },
  methods: {
    callApiOnce() {
      /** 
       * 注意
       * 1. 資料型態，只有 let 或是 const
       * 2. string 可以用單引號、雙引號、冒號鍵旁邊的引號
       * 3. this.$axios.get(url)
       * 4. 善用開發者工具
      */
      this.$axios.get(`https://data.taipei/opendata/datalist/apiAccess?scope=datasetMetadataSearch`).then(response => {
        console.log(response); // 可以開 console 看
        // 注意 this
        const categories = response.data.result.results;
        this.descriptionData = categories[0].description;
      });
    },
    callApiMulti() {
      /**
       * 定時 call API ，更新資訊
       * 注意
       * 1. setInterval => 定時動作
       */

      setInterval(() => {
        const paramId = "961ca397-4a59-45e8-b312-697f26b059dc";
        this.$axios.get(`https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=${paramId}`).then(response => {
          console.log(response); // 可以開 console 看
          this.descriptionData = response.data.result.limit; // 把 this.descriptionData 覆蓋掉
        });
      }, 1000);
    }
  },
  mounted() {
    // 網頁 Load 完後你要做什麼事
    this.callApiOnce();
    this.callApiMulti();
  }
}
</script>

<style scoped>
.temp {
  width: 100vw;
  height: 300px;
  background-color: #8acbbb;
}
.box1 {
  width: 100%;
  height: 30px;
  background-color: #dbff3d;
}
.box2 {
  width: 100%;
  height: 60px;
  background-color: #c9f658;
}
.box3 {
  width: 100%;
  height: calc(100% - 90px);
  background-color: #55968f;
  display: flex;
  flex-direction: row;
  justify-content: center;
  /* align-items: center;  */
}
.small-box {
  width: 50px;
  height: 100%;
  background: #a6e3e9;
}
.big-box {
  width: calc(100% - 100px);
  height: 100%;
  background-color: #1111112e;

  display: flex;
  flex-direction: column;
}
.content-box {
  width: 100%;
  height: 50%;
  background-color: rgba(203, 241, 245, .5);
}
.font-setting {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 20px;
}
</style>
