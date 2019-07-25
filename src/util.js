import Qs from 'qs'
import axios from 'axios'

export  const dataService =  {
    base_url : '',
    init (base_url){
        this.base_url = base_url;
    },
    isEmpty: function (obj) {
        return (obj === null || undefined === obj || obj === '')
    },
    async create (menuInfo,dataModel,init) {
        dataModel.menuid = menuInfo.menuId;
        dataModel.buttonid = menuInfo.buttonId;
        dataModel.forms = {};
        let param = {
            messageContent:{
                formid:this.isEmpty(menuInfo.forms) ? "":menuInfo.forms,
                menuid: dataModel.menuid,
                stepgroupid: "-3"
            },
            meta:{}
        };
        await axios.post(this.base_url + '/core2/access',
             Qs.stringify({message:encodeURI(JSON.stringify(param))}),  {})
                .then(function (res) {
                    let { trace, msg, code, data } = res.data;
                    if(code == 1){
                        for(let i = 0,item; item = data[i++];){
                            dataModel.forms[item['formID']] = {};
                            for(let key in item['datasetDefs']){
                                dataModel.forms[item['formID']][key] = {data:[],datasourceid:item['datasetDefs'][key]['datasourceid']};
                            }
                        }
                    }else{
                        throw "获取formId配置出错:"+trace
                    }
                })
                .catch(function (error) {
                    throw "获取formId配置出错"
            })
        if(init){
            console.log(dataModel);
            init();
        }
    },
    copy : function(obj){
       return  JSON.parse(JSON.stringify(obj));
    },
    setId : function(obj){
       for(let i = 0,item; item = obj[i++];){
           item['_object_assign_id'] = i;
       }
    },
    access : function (dataparam,dataModel,forms) {
        if(!dataModel){
            throw '请传递dataMode对象!';
        }
        let param = {
            messageContent:{
                isdebug:'1',
                casetype:'1',
                stepgroupid:'-1',
                menuid: dataModel.menuid,
                buttonid: dataModel.buttonid,
                dataparam: dataparam,
                forms: []
            },
            meta:{}
        };
        let fo;
        if(forms){
            for(let key in forms){
                fo = {
                    formid:key,
                    datasets:[   
                    ]
                }
                if(!this.isEmpty(forms[key])){
                    for(let i = 0,item; item = forms[key].split(',')[i++];){
                        fo.datasets.push({
                            datasetid:item,
                            datasourceid: dataModel.forms[key][item].datasourceid
                        })
                    }
                }else{
                    for(let datasetkey in dataModel.forms[key]){
                        fo.datasets.push({
                            datasetid:datasetkey,
                            datasourceid: dataModel.forms[key][datasetkey].datasourceid
                        })
                    }
                }
                param.messageContent.forms.push(fo);
            }
        }else{
            for(let key in dataModel.forms){
                fo = {
                    formid:key,
                    datasets:[   
                    ]
                }
                for(let datasetkey in dataModel.forms[key]){
                    fo.datasets.push({
                        datasetid:datasetkey,
                        datasourceid: dataModel.forms[key][datasetkey].datasourceid
                    })
                }
                param.messageContent.forms.push(fo);
            }
        }
        let _this = this;
       
        return new Promise((resolve, reject) => {
            axios.post(this.base_url + '/core2/access',
                Qs.stringify({message:encodeURI(JSON.stringify(param))}),  {})
                .then(function (res) {
                    let { trace, msg, code, data } = res.data;
                    if(code == 1){
                        for(let i = 0, item; item = data[i++];){
                            _this.setId(item.datarows);
                            dataModel.forms[item.formid][item.datasetid].data = item.datarows;
                            dataModel.forms[item.formid][item.datasetid]._object_assign_data = _this.copy(item.datarows);
                        }
                        resolve(data);
                    }else{
                        reject(trace);
                    }
                })
                .catch(function (error) {
                     reject("请求服务器失败.");
            })
        })
    },
    setSaveFormat(form,datasetkey,fo){
        let fo_dataset = {datasetid: datasetkey};
        let updateRows = [];
        let deleteRows = [];
        let insertRows = [];
        let _data = this.copy(form[datasetkey].data);
        let _object_assign_data = this.copy(form[datasetkey]._object_assign_data);
        
        for(let i = 0; i < _data.length; i++){
            if(this.isEmpty(_data[i]._object_assign_id)){
                insertRows.push(_data[i]);
                //新增
                _data.splice(i, 1); 
                i--;
            }
        }
        let _data_to_object = {};
        for(let i = 0, item; item = _data[i++];){
            _data_to_object[item._object_assign_id] = item;
        }

        for(let i = 0; i < _object_assign_data.length; i++){
            if(!_data_to_object[_object_assign_data[i]._object_assign_id]){
                deleteRows.push(_object_assign_data[i]);
                //删除
                _object_assign_data.splice(i, 1); 
                i--;
            }
        }

        let __object_assign_data_to_object = {};
        for(let i = 0, item; item = _object_assign_data[i++];){
            __object_assign_data_to_object[item._object_assign_id] = item;
        }

        for(let i = 0, item; item = _data[i++];){
            let isUpdate = false;
            for(let key in item){
                if(item[key] != __object_assign_data_to_object[item._object_assign_id][key]){
                    isUpdate = true; break;
                }
            }
            if(isUpdate){
                //修改
                updateRows.push({currentRow:item,originalRow:__object_assign_data_to_object[item._object_assign_id]});
            }
        }
        if(updateRows.length > 0 ){
            fo_dataset.updateRows = updateRows;
        }
        if(deleteRows.length > 0 ){
            fo_dataset.deleteRows = deleteRows;
        }
        if(insertRows.length > 0 ){
            fo_dataset.insertRows = insertRows;
        }
        if(updateRows.length > 0 || deleteRows.length > 0 || insertRows.length > 0){
            fo.vpDeltas.push(fo_dataset);
        }
    },
    save: function  (dataparam,dataModel,forms) {
        if(!dataModel){
            throw '请传递dataMode对象!';
        }
        let param = {
            messageContent:{
                menuid: dataModel.menuid,
                buttonid: dataModel.buttonid,
                dataparam: dataparam,
                forms: []
            },
            meta:{}
        };
        let fo;
        if(forms){
            for(let key in forms){
                fo = {
                    formid:key,
                    vpDeltas:[   
                    ]
                }
                if(!this.isEmpty(forms[key])){
                    for(let i = 0,item; item = forms[key].split(',')[i++];){
                        this.setSaveFormat(dataModel.forms[key],item,fo);
                    }
                }else{
                    for(let datasetkey in dataModel.forms[key]){
                       this.setSaveFormat(dataModel.forms[key],datasetkey,fo);
                    }
                }
                param.messageContent.forms.push(fo);
            }
        }else{
            for(let key in dataModel.forms){
                fo = {
                    formid:key,
                    vpDeltas:[   
                    ]
                }
                for(let datasetkey in dataModel.forms[key]){
                    this.setSaveFormat(dataModel.forms[key],datasetkey,fo);
                }
                param.messageContent.forms.push(fo);
            }
        }
        let _this = this;
        return new Promise((resolve, reject) => {
            axios.post(this.base_url + '/core2/save',
                Qs.stringify({message:encodeURI(JSON.stringify(param))}),  {})
                .then(function (res) {
                    let { trace, msg, code, data } = res.data;
                    if(code == 1){
                        _this.setSaveOk(dataModel,forms);
                        resolve(data);
                    }else{
                        reject(trace);
                    }
                })
                .catch(function (error) {
                     reject("请求服务器失败.");
            })
        })
    },
    setSaveOk(dataModel,forms) {
        if(forms){
            for(let key in forms){
                if(!this.isEmpty(forms[key])){
                    for(let i = 0,item; item = forms[key].split(',')[i++];){
                        this.setId(dataModel.forms[key][item].data);
                        dataModel.forms[key][item]._object_assign_data = this.copy(dataModel.forms[key][item].data);
                    }
                }else{
                    for(let datasetkey in dataModel.forms[key]){
                        this.setId(dataModel.forms[key][datasetkey].data);
                        dataModel.forms[key][datasetkey]._object_assign_data = this.copy(dataModel.forms[key][datasetkey].data);
                    }
                }
            }
        }else{
            for(let key in dataModel.forms){
                for(let datasetkey in dataModel.forms[key]){
                    this.setId(dataModel.forms[key][datasetkey].data);
                    dataModel.forms[key][datasetkey]._object_assign_data = this.copy(dataModel.forms[key][datasetkey].data);
                }
            }
        }
    }
};
