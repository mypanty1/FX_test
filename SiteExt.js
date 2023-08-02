Vue.component('SiteExt',{
  template:`<div class="display-contents">
    <link-block :actionIcon="open_ext?'up':'down'" icon="card" text="дополнительно" type="large" @block-click="open_ext=!open_ext"/>
    <div v-show="open_ext" class="padding-left-right-16px">
      <SitePlanDownload v-bind="$props"/>
    </div>
    <devider-line />
    <template v-if="!entrance_id">
      <link-block :actionIcon="open_pings?'up':'down'" icon="factors" text="доступность" type="large" @block-click="open_pings=!open_pings">
        <div slot="postfix" class="display-flex align-items-center gap-4px">
          <span v-if="loadingSomePing" class="ic-20 ic-loading rotating tone-500"></span>
          <template v-else>
            <div v-if="countOfflineOrError" class="display-flex align-items-center gap-2px">
              <span class="font--13-500 tone-500">{{countOfflineOrError}}</span>
              <span class="ic-20 ic-warning main-orange"></span>
            </div>
            <div v-if="countOnline" class="display-flex align-items-center gap-2px">
              <span class="font--13-500 tone-500">{{countOnline}}</span>
              <span class="ic-20 ic-status main-green"></span>
            </div>
          </template>
        </div>
      </link-block>
      <div v-show="open_pings" class="padding-left-right-16px">
        <PingGroup ref="PingGroup" :items="items" @count-not-online="countOfflineOrError=$event" @count-online="countOnline=$event" @loading-some="loadingSomePing=$event"/>
      </div>
      <devider-line />
    </template>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    entrances:{type:Array,default:()=>([]),required:true},
    entrance_id:{type:String,default:''},
  },
  data:()=>({
    open_ext:false,
    open_pings:false,
    countOfflineOrError:false,
    countOnline:false,
    loadingSomePing:false,
  }),
  created(){
    const {site_id}=this;
    this.getSiteNetworkElements({site_id});
  },
  computed:{
    ...mapGetters({
      getNetworkElementsBySiteId:'site/getNetworkElementsBySiteId',
    }),
    networkElements(){return this.getNetworkElementsBySiteId(this.site_id)},
    items(){
      const {site_id,site:{node_id}={},networkElements}=this;
      console.log(site_id,node_id,networkElements);
      return Object.values(select(networkElements,{
        site_id,
        node_id,
        ip:(ip)=>!!ip,
      })).reduce((items,ne)=>{
        const {mr_id,ip,vendor,model,sysObjectID}=ne;
        items[ip]={ip,mr_id,text:getModelText(vendor,model,sysObjectID)};
        return items;
      },{})
    },
  },
  methods:{
    ...mapActions({
      getSiteNetworkElements:'site/getSiteNetworkElements',
    }),
  }
});

Vue.component('SitePlanDownload',{//плансхема
  template:`<div name="SitePlanDownload">
    <div class="display-flex align-items-center gap-4px justify-content-flex-end">
      <span id="loader_generatePL" class="spd-loader" style="display:none;"></span>
      <input type="button" id="btn_generatePL" disabled @click="createSchematicPlan(site_id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
      <input type="button" id="btn_generatePL_woTS" @click="createSchematicPlan(site_id,true)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема без ТС">
    </div>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    entrances:{type:Array,default:()=>([]),required:true},
    entrance_id:{type:String,default:''},
  },
  data:()=>({
    openOptions:false,
  }),
  mounted(){
    (function(id='SitePlanDownload'){
      document.getElementById(id)?.remove();
      const el=Object.assign(document.createElement('style'),{type:'text/css',id});
      el.appendChild(document.createTextNode(`
        .spd-loader {
          width:18px;
          height:18px;
          border:2px dashed cadetblue;
          border-left-color:crimson;
          border-right-color:coral;
          border-top-color:cornflowerblue;
          border-radius:50%;
          animation:spd-loader-spinner 0.99s linear infinite;
        }
        @keyframes spd-loader-spinner {
          to {
            transform:rotate(360deg)
          }
        }
      `));
      document.body.insertAdjacentElement('afterBegin',el);
    }());
  },
  computed:{},
  methods:{
    async getSite(site_id,hideTS=false){
      console.log('getSite('+site_id+','+hideTS+')');
      const result={
        [site_id]:{
          nodes:[],
          _sites:{},
          _nodes:{},
          entrances:{},
          racks:{},
          devices:{},
          unmount_devices:{},
          ppanels:{},
        },
      };
      const gets=[];
      const dict={};

      return Promise.allSettled([
        this.$cache.getItem(`building/${site_id}`)?Promise.resolve(this.$cache.getItem(`building/${site_id}`)):httpGet(buildUrl('search_ma',{pattern:site_id},'/call/v1/search/')),
        this.$cache.getItem(`site_flat_list/${site_id}`)?Promise.resolve(this.$cache.getItem(`site_flat_list/${site_id}`)):httpGet(buildUrl('site_flat_list',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`devices/${site_id}`)?Promise.resolve(this.$cache.getItem(`devices/${site_id}`)):httpGet(buildUrl('devices',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`get_unmount_devices/${site_id}`)?Promise.resolve(this.$cache.getItem(`get_unmount_devices/${site_id}`)):httpGet(buildUrl('get_unmount_devices',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`site_rack_list/${site_id}`)?Promise.resolve(this.$cache.getItem(`site_rack_list/${site_id}`)):httpGet(buildUrl('site_rack_list',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`patch_panels/${site_id}`)?Promise.resolve(this.$cache.getItem(`patch_panels/${site_id}`)):httpGet(buildUrl('patch_panels',{site_id,without_tree:true},'/call/v1/device/')),
      ]).then((responses)=>{
        const results=[];
        for(const response of responses){
          results.push(response.status==='fulfilled'?(response.value.length?response.value:[response.value]):[]);
        };
        return {
          nodes:results[0],
          entrances:results[1],
          devices:results[2],
          unmount_devices:results[3],
          racks:results[4],
          ppanels:results[5],
        };
      }).then(results=>{
        for(const name in results){
          switch(name){
            case 'nodes':
              result[site_id].nodes=results[name].length?(results[name][0].type!=='building_list'?[results[name][0].data]:results[name][0].data):[];
              //gets.push(httpGet(buildUrl('get_nioss_object',{object_id:site_id,object:'site'},'/call/nioss/')));
              //dict[gets.length-1]='_sites/'+site_id+'/nioss';
              for(const node of result[site_id].nodes){
                //gets.push(httpGet(buildUrl('get_nioss_object',{object_id:node.uzel_id,object:'node'},'/call/nioss/')));
                //dict[gets.length-1]='_nodes/'+node.uzel_id+'/nioss';
              };
            break;
            case 'entrances':
              for(const entrance of results[name].filter(item=>!item.nioss_error)){
                if(hideTS){
                  entrance.floor=entrance.floor.map(floor=>{
                    floor.flats=floor.flats.map(flat=>{
                      flat.subscribers=flat.subscribers.map(subscriber=>{
                        subscriber.account='x-xxx-xxxxxxx';
                        subscriber.services=subscriber.services.map(service=>{
                          service.msisdn='7xxxxxxxxxx';
                          return service;
                        });
                        return subscriber;
                      });
                      flat.services=flat.services.map(service=>{
                        service.msisdn='7xxxxxxxxxx';
                        return service;
                      });
                      return flat;
                    });
                    return floor;
                  });
                };
                //gets.push(httpGet(buildUrl('get_nioss_object',{object_id:entrance.id,object:'entrance'},'/call/nioss/')));
                //dict[gets.length-1]=name+'/'+entrance.id+'/nioss';
                result[site_id][name][entrance.id]=entrance;
              };
            break;
            case 'devices':
              for(const device of results[name]){
                //gets.push(httpGet(buildUrl('get_nioss_object',{object_id:device.nioss_id,object:'device'},'/call/nioss/')));
                //dict[gets.length-1]=name+'/'+device.nioss_id+'/nioss';
                if(['ETH','OP','CPE','FAMP','SBE','FTRM','IP','MPLS','OLT','MBH'].includes(device.name.split('_')[0].split('-')[0])){
                  gets.push(httpGet(buildUrl('search_ma',{pattern:device.name},'/call/v1/search/')));
                  dict[gets.length-1]=name+'/'+device.nioss_id;
                };
                gets.push(httpGet(buildUrl('get_dismantled_devices',{device_name:device.name},'/call/v1/device/')));
                dict[gets.length-1]=name+'/'+device.nioss_id+'/devices';
                if(['ETH','MPLS','MBH','OLT'].includes(device.name.split('_')[0].split('-')[0])){
                  if(!hideTS){
                    gets.push(httpGet(buildUrl('device_port_list',{device:device.name},'/call/device/')));
                    dict[gets.length-1]=name+'/'+device.nioss_id+'/ports';
                    //gets.push(httpGet(buildUrl('get_history_conn_point_list',{device_id:643651,region_id:54},'/call/v1/device/')));
                    //dict[gets.length-1]=name+'/'+device.nioss_id+'/conn_point_list';
                  };
                };
                result[site_id][name][device.nioss_id]=device;
              };
            break;
            case 'unmount_devices':
              for(const device of results[name]){
                //gets.push(httpGet(buildUrl('get_nioss_object',{object_id:device.device_nioss_id,object:'device'},'/call/nioss/')));
                //dict[gets.length-1]=name+'/'+device.device_nioss_id+'/nioss';
                result[site_id][name][device.device_nioss_id]={
                  site_id:device.site_id,
                  uzel:{id:device.uzel_id,name:device.uzel_name},
                  nioss_id:device.device_nioss_id,
                  name:device.device_name,
                  ip:device.ip_address,
                  display:device.display_name,
                  ne_status:device.ne_status,
                  snmp:{version:device.snmp_version,community:device.snmp_community},
                  region:results['devices'][0]?.region||{code:"",id:0,location:"",mr_id:0,name:""},
                  access_mode:null,
                  description:"",
                  discovery:{date:"",type:"",status:"",text:""},
                  firmware:"",
                  firmware_revision:null,
                  model:"",
                  system_object_id:"",
                  type:"",
                  upstream_ne:"",
                  vendor:"",
                };
              };
            break;
            case 'racks':
              for(const rack of results[name].filter(item=>!item.nioss_error)){
                //gets.push(httpGet(buildUrl('get_nioss_object',{object_id:rack.id,object:'rack'},'/call/nioss/')));
                //dict[gets.length-1]=name+'/'+rack.id+'/nioss';
                result[site_id][name][rack.id]=rack;
              };
            break;
            case 'ppanels':
              for(const pp of results[name].filter(item=>!item.nioss_error)){
                //gets.push(httpGet(buildUrl('get_nioss_object',{object_id:pp.id,object:'plint'},'/call/nioss/')));
                //dict[gets.length-1]=name+'/'+pp.id+'/nioss';
                result[site_id][name][pp.id]=pp;
              };
            break;
            default:break;
          };
        };
        return Promise.allSettled(gets);
      }).then(responses=>{
        responses.map((response,index)=>{
          const value=response.status==='fulfilled'?response.value:{};
          const path=dict[index].split('/');
          result[site_id][path[0]][path[1]]={
            ...result[site_id][path[0]][path[1]],
            ...path.length>2?{[path[2]]:value}:value,
          };
        });
        return result;
      });
    },
    async createSchematicPlan(site_id,hideTS=true){
      //document.getElementById('btn_generatePL').setAttribute('disabled','disabled');
      document.getElementById('btn_generatePL_woTS').setAttribute('disabled','disabled');
      document.getElementById('loader_generatePL').style.display='inline-table';

      const siteObj=await this.getSite(site_id,hideTS);
      const user=this.$root.username||'<username>';
      const site_name=siteObj[site_id].nodes[0].name;
      const address=siteObj[site_id].nodes[0].address;
      const date=new Date();
      const title=site_name+' '+date.toLocaleDateString().match(/(\d|\w){1,4}/g).join('.')+' '+date.toLocaleTimeString().match(/(\d|\w){1,4}/g).join('-')+' '+date.getTime().toString(16)+' '+user;
      const bodyObj={
        username:user,
        node_id,
        sitename:site_name,site_name,
        address,
        siteid:site_id,site_id,
        title,
        json:JSON.stringify(siteObj,null,2),
        html:'',
      };

      if(!FIX_test_DEV){
        if(user&&user!=='<username>'){
          fetch('https://script.google.com/macros/s/AKfycbzyyWn_TMArC9HcP2NzwGhgKUCMJK2QBQ3BEY3U8c37pQJS5fHh3TKz0Xya9V5Eq1Sm-g/exec',{
            method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
            body:JSON.stringify(bodyObj)
          });
        }else{
          return;
        };
      }else{
        const json=new Blob([bodyObj.json],{type:'text/plain'});
        const a=document.createElement('a');
        a.href=URL.createObjectURL(json);
        a.download=bodyObj.title+'.json';
        a.click();
        a.remove();
      };

      //document.getElementById('btn_generatePL').removeAttribute('disabled');
      document.getElementById('btn_generatePL_woTS').removeAttribute('disabled');
      document.getElementById('loader_generatePL').style.display='none';
    },
  }
});
