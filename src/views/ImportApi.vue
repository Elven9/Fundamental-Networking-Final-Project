<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <p>{{descriptionData}}</p>
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
      updatedDesc: ''
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
       * 1. setInterval
       */

      setInterval(() => {
        const paramId = "961ca397-4a59-45e8-b312-697f26b059dc";
        this.$axios.get(`https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=${paramId}`).then(response => {
          console.log(response); // 可以開 console 看
        });
      }, 1000);
    }
  },
  mounted() {
    this.callApiOnce();
    this.callApiMulti();
  }
}
</script>
