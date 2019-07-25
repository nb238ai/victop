</template>

<script>
import {dataService} from './util'
export default {
  name: 'app',
  data () {
    return {
      dataModel:{},
      msg: 'Welcome to Your Vue.js App111'
    }
  },
  methods: {
    test () {
       let _this = this;
      dataService.access({},this.dataModel,{demo:''})
      .then(function (res) {
         _this.dataModel.forms['demo']['1'].data[0].personname = "update";
         _this.dataModel.forms['demo']['1'].data.splice(1, 1); 
      dataService.save({},_this.dataModel,{demo:''})
      })
      .catch(function (error) {
          alert(error)
      })
    }
  },
  created(){
      // dataService.init('http://192.168.110.231:2333/victop-dataset-cloud-hcbd-client-jinlk/victop-cloud-hcbd-client');
      // dataService.create({menuId:'demo',buttonId:'5',forms:'Format,demo'},this.dataModel,this.test);
     
     
  }
}
</script>

<style>
</style>
