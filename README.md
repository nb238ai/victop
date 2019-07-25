# victop 新取数保存通用插件 -- vue版本

使用步骤:

  1.npm i vp-data-service
  
  2.在vue项目的根文件(App.vue)进行插件的初始化(进行后台地址的配置)
      2.1 引入插件
        import {dataService} from 'vp-data-service';
      2.2 初始化(在created事件中执行)
        dataService.init('后台java项目地址');
  
  3.在功能模块中具体使用:
    3.1 引入插件
      import {dataService} from 'vp-data-service';
      
    3.2 先在data对象中定义个dataModel对象(此步骤是为了让dataModel和页面进行双向绑定)
       data() {
        return{
          dataModel: {};
        }
       }
    
     3.3 调用插件,创建真实的dataModel对象
       dataService.create(
          {menuId:'demo',buttonId:'5',forms:'Format,demo'},
          this.dataModel,
          this.init
       );
       方法有3个参数
        第一个参数
          参数类型为对象, 3个key,
            menuId 菜单id,
            buttonId:默认先用5吧,
            forms:可选择创建该menuId下指定的formid,多个formid用逗号分隔(可传'',则初始化menuId下所有的formid)
        第二个参数 
          传入3.2步骤定义的dataModel对象
        第三个参数
          传入初始化后需要执行的方法对象(可不传)
          
      3.4 进行取数操作
        dataService.access({},this.dataModel,{demo:''})
          .then(function (res) {
            //进入这里,代表取数成功
          })
          .catch(function (error) {
              //取数失败,error为具体错误信息
          })
          方法参数说明：
            第一个参数  取数的查询条件(dataParam),没有就传空对象
            第二个参数  定义好的dataModel对象
            第三个参数 
              设定查询的formid及datasetid(不传,会则查询dataModel对象里,所有的formid)
              格式为  {"具体的formid":"datasetid"},多个datasetid用逗号分隔
              例子: {"formid1":"id1,id2","formid2":"id1"}
              
        3.5 进行保存操作
           dataService.save({},_this.dataModel,{demo:''})
            .then(function (res) {
              //进入这里,代表成功
            })
           .catch(function (error) {
              //失败,error为具体错误信息
            })
          方法参数说明：
            第一个参数  (dataParam),没有就传空对象,一般用来给自定义服务传递参数
            第二个参数  定义好的dataModel对象
            第三个参数 
              设定保存的formid及datasetid(不传,会则保存dataModel对象里,所有的formid)
              格式为  {"具体的formid":"datasetid"},多个datasetid用逗号分隔
              例子: {"formid1":"id1,id2","formid2":"id1"}
              
              
      4.dataModel对象格式
        {
          menuid: '菜单id',
          buttonid: '按钮id',
          forms: {
            'formid':{
              'datasetid':{
                data:[]//此datasetid绑定的数据
              }
            }
          }
        }
        举例说明:
          比如我用formid为 demo   datasetid为 demo1 进行取数
          则调用取数方法以后,
          具体的数据在: this.dataModel.forms['demo']['demo1'].data
          界面上也可以直接用这个对象来进行绑定.
          
          保存/修改/删除
          也是一样,直接对具体的数据进行删除或者修改或者新增就可以了
        
       
