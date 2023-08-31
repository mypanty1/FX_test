if(store?.getters?.['main/username']=='mypanty1'){
  store.dispatch('dev/setVar',{showToolsPage:true})
};

Vue.component('ToolsPageContent',{
  template:`<div name="ToolsPageContent" class="display-contents">
    <CardBlock>
      <div class="display-flex align-items-center justify-content-space-between gap-8px margin-left-right-12px height-32px">
        <div slot="prefix">
          
        </div>
        <div slot="content">
          <span class="font--15-600">Инструменты</span>
        </div>
        <div slot="postfix">
          
        </div>
      </div>
      <devider-line/>
      <div class="padding-left-right-8px">
        
        <div class="display-flex flex-direction-column">
          <select-el ref="Selector" label="Добавить виджет" :items="widgetsItems" itemKey="name" @input="addItem" clearable/>
          <devider-line v-if="items.length"/>
          <div v-if="items.length" class="display-flex flex-direction-column-reverse gap-8px">
            <template v-for="(item,index) of items">
              <SectionBorder class="padding-8px" :key="index">
                <div class="display-flex justify-content-space-between gap-8px">
                  <div class="font--13-500">{{item.name}}</div>
                  <button-sq icon="close-1" @click="items.splice(index,1)" type="medium"/>
                </div>
                <component :key="item.name" :is="item.is" v-bind="item.props" ref="Widgets"/>
              </SectionBorder>
            </template>
          </div>
          <div v-else class="font--16-500 tone-300 text-align-center height-100px display-flex flex-direction-column justify-content-center">
            Добавить виджет
          </div>
        </div>
        
      </div>
    </CardBlock>
  </div>`,
  data:()=>({
    widgets:[
      {name:'Пинг СЭ',is:'WidgetPing'},
      {name:'Dev',is:'WidgetDev',isDev:true},
      {name:'Device IP',is:'WidgetSnmpTest'},
      {name:'ToEventsMap',is:'ToEventsMap',isDev:true},
    ],
    items:[]
  }),
  created(){},
  watch:{},
  computed:{
    ...mapGetters({
      username:'main/username',
    }),
    someSelected(){return !isEmpty(this.items)},
    isDev(){return this.username=='mypanty1'},
    widgetsItems(){
      const {widgets,isDev}=this;
      return isDev?widgets:widgets.filter(({isDev})=>!isDev);
    }
  },
  methods:{
    addItem(item){
      if(item){
        this.items.push(item)
        this.$refs.Selector.clear()
      };
    }
  },
});
Vue.component('WidgetPing',{
  template:`<div name="WidgetPing">
    <input-el placeholder="10.221.xxx.xxx" :label="label" v-model="ip" :disabled="enable" class="margin-bottom-8px">
      <!--<button-sq slot="postfix" icon="right-link" @click="$router.push({name:'search',params:{text:'@D_IP:'+ip}})" v-if="ip"/>-->
      <div v-if="valid" slot="postfix" class="margin-left-right-8px display-flex">
        <PingLed v-bind="{ip,mr_id}"/>
      </div>
    </input-el>
    <info-value :label="'получено: '+received" :value="'потеряно: '+lost" type="small"/>
    <device-params-item-history :paramDays="pings" :item="config" :limit="count" chartClass="-" chartStyle="border:1px solid #e4e3e3;border-radius:5px;"/>
    <div class="display-flex gap-4px justify-content-center">
      <button-main @click="clear" label="clear" buttonStyle="outlined" size="medium"/>
      <button-main @click="start" label="start" :loading="running" :disabled="!valid||enable||running" buttonStyle="contained" size="medium"/>
      <button-main @click="abort" label="abort" buttonStyle="outlined" size="medium"/>
    </div>
  </div>`,
  data:()=>({
    ip:'',
    config:{
      param:'ping',
      unit:'ms',
    },
    timer:undefined,
    enable:false,
    timeout:1000,
    count:0,
    running:false,
    pings:[],
  }),
  watch:{
    'ip'(ip){
      if(!ip){return}
      this.pings=[];
    },
  },
  computed:{
    ...mapGetters({
      region:'main/region',
      mr_id:'main/mr_id',
      mr:'main/mr',
    }),
    label(){return this.mr?`IP (МР ${this.mr.name})`:`IP`},
    valid(){return this.mr_id&&this.ip.split('.').filter(Boolean).length===4},
    received(){return this.pings.filter(ping=>ping.values[0]>=0).length},
    lost(){return this.pings.filter(ping=>ping.values[0]<0).length},
  },
  methods:{
    ...mapActions({
      doPing:'dnm/doPing',
    }),
    async ping(){
      this.running=true;
      try{
        const {mr_id,ip}=this;
        const result=await this.doPing({mr_id,ip});
        this.running=false;
        this.count++;
        this.pings.push({
          date:this.count,
          values:[result.state=='online'?result.ms:-2]
        });
        if(this.count<100){//ограничение в 99 пингов чтоб не поехала верстка графика
          this.next();
        }else{
          this.abort();
        }
      }catch(error){
        this.abort();
        console.warn('ping.error',error);
      };
    },
    start(){
      if(!this.running&&this.valid){
        this.enable=true;
      };
      this.next();
    },
    next(){
      if(!this.running&&this.enable){
        this.timer=setTimeout(this.ping,this.timeout);
      };
    },
    abort(){
      clearTimeout(this.timer);
      this.enable=false;
      this.running=false;
    },
    clear(){
      this.abort();
      this.count=0;
      this.pings=[];
    },
    close(){//public
      this.abort();
    },
  },
  beforeDestroy(){
    this.abort();
  },
});
Vue.component('WidgetDev',{
  template:`<div name="WidgetUser">
    <input-el placeholder="wfm_username" label="wfm_username" v-model="wfm_username"/>
    <input-el placeholder="fav_username" label="fav_username" v-model="fav_username"/>
  </div>`,
  computed:{
    ...mapGetters({
      getVar:'dev/getVar'
    }),
    wfm_username:{
      get(){return this.getVar('wfm_username')},
      set(wfm_username){this.setVar({wfm_username})}
    },
    fav_username:{
      get(){return this.getVar('fav_username')},
      set(fav_username){this.setVar({fav_username})}
    },
    wfm_username:{
      get(){return this.getVar('wfm_username')},
      set(wfm_username){this.setVar({wfm_username})}
    },
  },
  methods:{
    close(){//public
      
    },
    ...mapActions({
      setVar:'dev/setVar'
    }),
  },
  beforeDestroy(){
    
  },
});
Vue.component('WidgetSnmpTest',{
  template:`<div name="WidgetSnmpTest">
    <input-el :placeholder="placeholder" :label="label" v-model="ip" class="margin-bottom-8px">
      <div v-if="valid" slot="postfix" class="margin-left-right-8px display-flex">
        <PingLed v-bind="{ip,mr_id}"/>
      </div>
    </input-el>

    <loader-bootstrap v-if="loading" :text="'поиск СЭ по IP '+ip"/>
    <div v-else-if="ne&&ne.ip==ip" class="display-flex flex-direction-column">
      <component v-for="([is,props],key) of info" :key="key" :is="is" v-bind="props" class="padding-unset"/>
    </div>
    
  </div>`,
  data:()=>({
    ip:'',
    ne:null,
    loads:{},
  }),
  watch:{
    'ip'(ip){
      this.onChangeIp();
    },
  },
  computed:{
    ...mapGetters({
      region_id:'main/region_id',
      region:'main/region',
      mr_id:'main/mr_id',
      mr:'main/mr',
    }),
    placeholder(){return `${this.region?.br_oam_prefix||'10.221'}.xxx.xxx`},
    label(){return this.mr?`IP (МР ${this.mr.name})`:`IP`},
    valid(){return this.mr_id&&this.ip.split('.').filter(Boolean).length===4},
    loading(){return this.loads[this.ip]},
    info(){
      const {ne}=this;if(!ne){return []};
      const {type,ip,region:{location},name,model,vendor,system_object_id,firmware,description,snmp:{version,community},discovery:{date,status}}=ne;
      const modelText=getModelText(vendor,model,system_object_id);
      const title=getNetworkElementReference(type).title;// || type (if unknown)
      const address=truncateSiteAddress(location);
      return [
        title             &&  ['info-text-sec', {text:title}],
        address           &&  ['info-text-sec', {text:address}],
        ip                &&  ['info-value',    {label:'IP',                value:ip,               withLine:true}],
        name              &&  ['info-value',    {label:'Имя',               value:name,             withLine:true}],
        modelText         &&  ['info-value',    {label:'Model',             value:modelText,        withLine:true}],
        version           &&  ['info-value',    {label:'SNMP Version',          value:version,          withLine:true}],
        community         &&  ['info-value',    {label:'SNMP Community',         value:community,        withLine:true}],
        date              &&  ['info-value',    {label:'Dscv date',         value:date,        withLine:true}],
        status            &&  ['info-value',    {label:'Dscv status',         value:status,        withLine:true}],
        description       &&  ['info-text-sec', {text:description}],
        firmware && !new RegExp(firmware).test(description)          &&  ['info-text-sec', {text:firmware}],
      ].filter(v=>v);
    },
  },
  methods:{
    ...mapActions({
      doPing:'dnm/doPing',
    }),
    onChangeIp(){
      const {ip,valid,ne}=this;
      //if(ne?.ip!==ip){this.ne=null};
      if(!ip||!valid){return};
      this.searchByIp();
    },
    async searchByIp(){
      const {ip,region_id}=this;
      this.$set(this.loads,ip,true);
      let ne_name;
      try {
        const response=this.$cache.getItem(ip)||await httpGet(buildUrl('search_ma',{pattern:`@D_IP:${ip}`},'/call/v1/search/'));
        if(Array.isArray(response?.data)){
         this.$cache.setItem(ip,response)
         const nes=response.data.length?response.data.find(d=>d.devices)?.devices:[response.data];
         const ne=nes.find(device=>device.region.id===region_id);
         if(ne){ne_name=ne.name};
        };
      }catch(error){
        console.warn('search_ma.error',error)
      }
      if(ne_name){
        try {
          const response=this.$cache.getItem(ne_name)||await httpGet(buildUrl('search_ma',{pattern:ne_name},'/call/v1/search/'));
          if(response?.data){
            this.$cache.setItem(ne_name,response)
            if(this.ip==response.data.ip){
              this.ne=response.data;
            }
          }
        }catch(error){
          console.warn('search_ma.error',error)
        }
      }
      this.$set(this.loads,ip,!true);
    },
    close(){//public
      
    },
  },
  beforeDestroy(){
    
  },
});








Vue.component('ToEventsMap',{
  template:`<div name="ToEventsMap">
    <input-el placeholder="templateId" label="templateId" v-model="templateId" :disabled="!isDev"/>
    <link-block icon="amount" text="ToEventsMap" @block-click="$router.push({name:'events-map',params:{templateId}})" actionIcon="right-link" type="medium"/>
  </div>`,
  data:()=>({
    templateId:'nsk-gpon-test-2'
  }),
  created(){},
  computed:{
    ...mapGetters({
      region_id:'main/region_id',
      username:'main/username',
    }),
    isDev(){return this.username=='mypanty1'},
  },
  methods:{
    close(){//public
      
    },
  },
  beforeDestroy(){
    
  },
});
Vue.component('EventsMapPage',{
  template:`<EventsMapGpon2 v-bind="$props"/>`,
  props:{
    templateId:{type:[String,Number],default:'',required:true}
  },
  data:()=>({
    isYmaps:false
  }),
  beforeRouteEnter(to,from,next){
    document.querySelector(`#ptvtb-app`).style.maxWidth='unset';
    document.querySelector(`#ptvtb-app > div[name="AppLogo"] > a`).style.display='none';
    document.querySelector(`#ptvtb-app > header[name="TheAppHeader"]`).style.display='none';
    next(vm=>{
      vm.isYmaps=vm.addYmapsSrc();
    });
  },
  beforeRouteUpdate(to,from,next){
    this.isYmaps=this.addYmapsSrc();
    next()
  },
  methods:{
    addYmapsSrc(){
      const id='ya-map';
      if(document.querySelector(`#${id}`)){return true};
      const src=document.querySelector(`meta[name="mapuri"]`)?.content;
      if(!src){console.warn('Not found ymaps uri');return};
      return document.querySelector(`head`).appendChild(Object.assign(document.createElement('script'),{type:'text/javascript',src,id}));
    },
  },
  beforeRouteLeave(to,from,next){
    document.querySelector(`#ptvtb-app`).style.maxWidth='';
    document.querySelector(`#ptvtb-app > div[name="AppLogo"] > a`).style.display='';
    document.querySelector(`#ptvtb-app > header[name="TheAppHeader"]`).style.display='';
    //document.querySelector(`#ya-map`)?.remove();
    next()
  },
});
app.$router.addRoutes([{
  path:'/events-map/:templateId',
  name:'events-map',
  component:Vue.component('EventsMapPage'),
  props:true,
}]);
//app.$router.push({name:'events-map',params:{templateId:'nsk-gpon-test-2'}})

const NSK_OLT_LIST_ITEMS=[
  'OLT_KR_54_10907_1',
  null,//separator
  'OLT_KR_54_02758_1',
  null,//separator
  'OLT_KR_54_02757_1',
  'OLT_KR_54_02757_2',
  null,//separator
  'OLT_KR_54_02546_1',
  null,//separator
  'OLT_KR_54_01832_1',
  null,//separator
  'OLT_KR_54_01799_1',
  null,//separator
  'OLT_KR_54_0760_1',
  null,//separator
  'OLT_KR_54_0513_1',
];
const NSK_OLTs=NSK_OLT_LIST_ITEMS.reduce((selectedItems,item)=>item?Object.assign(selectedItems,{[item]:null}):selectedItems,{});

const CACHE_1HOUR=60;
const CACHE_1DAY=CACHE_1HOUR*24;

class GeocodeResult {
  constructor(sample,response){
    this.sample=sample
    this.address=response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text||''
    this.coordinates=response?.GeoObjectCollection?.metaDataProperty?.GeocoderResponseMetaData?.Point?.coordinates||null
    if(Array.isArray(this.coordinates)){this.coordinates.reverse()};
    console.log(this)
  }
};
class FeatureCollection {
  constructor(features){
    this.type='FeatureCollection'
    this.features=features
  }
};
class PointGeometry {
  constructor(coordinates){
    this.type='Point'
    this.coordinates=coordinates
  }
};
class CircleIconShape {
  constructor(radius){
    this.type='Circle'
    this.coordinates=[0, 0]
    this.radius=radius
  }
};
class RectangleIconShape {
  constructor(half){
    this.type='Rectangle'
    this.coordinates=[[-half,-half],[half,half]]
  }
};
class IconImageSizeOffset {
  #size;
  constructor(_size=48){
    const size=this.#size=_size||48
    const offset=-size/2
    this.iconImageSize=[size,size]
    this.iconImageOffset=[offset,offset]
  }
  get size(){
    return this.#size
  }
  get radius(){
    return this.#size / 2
  }
};
const EVENTS_MAP_ZINDEX={
  ONT:100,
  OLT:20,
  AREA:10,
};
const EVENTS_MAP_ICONS={
  OLT:'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTUuNTk3IDU1LjU5NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTUuNTk3IDU1LjU5NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBvbHlnb24gc3R5bGU9ImZpbGw6I0YzRDU1QjsiIHBvaW50cz0iMjcuNTk3LDcuNzkgMy41OTcsNDkuNzkgNTIuNTk3LDQ5Ljc5ICIvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzU1NjA4MDsiIGQ9Ik01NS40NTgsNTAuMzA3TDQ0LjE5NiwzMS4wODZsLTAuNzctMS4zMTRMMjguNDksNC4yODJjLTAuMzg2LTAuNjU5LTEuMzM5LTAuNjU2LTEuNzIxLDAuMDA1DQoJTDEyLjM2MywyOS4xOGwtMS4yMTQsMi4wOTdMMC4xMzUsNTAuMzEyYy0wLjM4NCwwLjY2NCwwLjA5NSwxLjQ5NSwwLjg2MiwxLjQ5NWgyNi42MjdoMjYuOTc0DQoJQzU1LjM2OSw1MS44MDcsNTUuODQ4LDUwLjk3MSw1NS40NTgsNTAuMzA3eiBNNi40NDYsNDcuODA3bDguMDk5LTEzLjk5NWw0Ljk1Mi04LjU1OWw4LjM4OS0xNC40OTdsOC41NjMsMTQuNjEzbDQuODQ5LDguMjc0DQoJbDguMjk5LDE0LjE2NEg2LjQ0NnoiLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiNFNkU3RTg7IiBkPSJNNDQuNTM4LDMwLjc3N0w0NC41MzgsMzAuNzc3Yy05LjM3Myw5LjM3My0yNC41NjksOS4zNzMtMzMuOTQxLDBsMCwwbDAsMA0KCUMxOS45NjksMjEuNDA1LDM1LjE2NSwyMS40MDUsNDQuNTM4LDMwLjc3N0w0NC41MzgsMzAuNzc3eiIvPg0KPGNpcmNsZSBzdHlsZT0iZmlsbDojNDhBMERDOyIgY3g9IjI3LjU5NyIgY3k9IjMwLjc5IiByPSI2Ii8+DQo8Y2lyY2xlIHN0eWxlPSJmaWxsOiM1NTYwODA7IiBjeD0iMjcuNTk3IiBjeT0iMzAuNzkiIHI9IjMiLz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K',
  ONT:'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnLWljb24iIHN0eWxlPSJ3aWR0aDogMWVtOyBoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04MzcuODE4MTgyIDc5MS4yNzI3MjdjMCAyNS42Njk4MTgtMjAuODc1NjM2IDQ2LjU0NTQ1NS00Ni41NDU0NTUgNDYuNTQ1NDU1SDIzMi43MjcyNzNjLTI1LjY2OTgxOCAwLTQ2LjU0NTQ1NS0yMC44NzU2MzYtNDYuNTQ1NDU1LTQ2LjU0NTQ1NXYtOTMuMDkwOTA5aDY1MS42MzYzNjR2OTMuMDkwOTA5ek0yNDguNTc2IDIyNi4wMjQ3MjdBNDYuNzc4MTgyIDQ2Ljc3ODE4MiAwIDAgMSAyOTQuNjMyNzI3IDE4Ni4xODE4MThoNDM0LjczNDU0NmE0Ni43NzgxODIgNDYuNzc4MTgyIDAgMCAxIDQ2LjA1NjcyNyAzOS44NDI5MDlMODM3LjMyOTQ1NSA2NTEuNjM2MzY0SDE4Ni42NzA1NDVsNjEuOTA1NDU1LTQyNS42MTE2Mzd6IG01NzIuOTA0NzI3LTYuNzAyNTQ1QTkzLjA5MDkwOSA5My4wOTA5MDkgMCAwIDAgNzI5LjM2NzI3MyAxMzkuNjM2MzY0SDI5NC42MzI3MjdhOTMuMDkwOTA5IDkzLjA5MDkwOSAwIDAgMC05Mi4xMTM0NTQgNzkuNjg1ODE4TDEzOS42MzYzNjQgNjUxLjYzNjM2NHYxMzkuNjM2MzYzYTkzLjA5MDkwOSA5My4wOTA5MDkgMCAwIDAgOTMuMDkwOTA5IDkzLjA5MDkwOWg1NTguNTQ1NDU0YTkzLjA5MDkwOSA5My4wOTA5MDkgMCAwIDAgOTMuMDkwOTA5LTkzLjA5MDkwOXYtMTM5LjYzNjM2M0w4MjEuNDgwNzI3IDIxOS4zMjIxODJ6IiBmaWxsPSIjMjFBM0REIiAvPjxwYXRoIGQ9Ik0yNTYgNzQ0LjcyNzI3M2g0Ni41NDU0NTV2NDYuNTQ1NDU0aC00Ni41NDU0NTV2LTQ2LjU0NTQ1NHogbTkzLjA5MDkwOSAwaDQ2LjU0NTQ1NXY0Ni41NDU0NTRoLTQ2LjU0NTQ1NXYtNDYuNTQ1NDU0eiBtOTMuMDkwOTA5IDBoNDYuNTQ1NDU1djQ2LjU0NTQ1NGgtNDYuNTQ1NDU1di00Ni41NDU0NTR6IG05My4wOTA5MDkgMGg0Ni41NDU0NTV2NDYuNTQ1NDU0aC00Ni41NDU0NTV2LTQ2LjU0NTQ1NHogbTkzLjA5MDkwOSAwaDQ2LjU0NTQ1NXY0Ni41NDU0NTRoLTQ2LjU0NTQ1NXYtNDYuNTQ1NDU0eiBtOTMuMDkwOTA5IDBoNDYuNTQ1NDU1djQ2LjU0NTQ1NGgtNDYuNTQ1NDU1di00Ni41NDU0NTR6TTQ1NC44NDIxODIgNTAwLjMxNzA5MWMtMTIuNDA0MzY0IDguNjEwOTA5LTI2Ljc2MzYzNiAxMi44OTMwOTEtNDMuMTI0MzY0IDEyLjg5MzA5MS0yMC40OCAwLTM2LjAyNjE4Mi03LjAyODM2NC00Ni42NjE4MTgtMjEuMDYxODE4LTEwLjYzNTYzNi0xNC4wMzM0NTUtMTUuOTY1MDkxLTM0LjM1MDU0NS0xNS45NjUwOTEtNjAuOTUxMjczIDAtMjUuNjkzMDkxIDUuMTQzMjczLTQ1LjgwMDcyNyAxNS40NTMwOTEtNjAuMzIyOTA5IDEwLjMwOTgxOC0xNC41MjIxODIgMjYuMDQyMTgyLTIxLjc4MzI3MyA0Ny4xNzM4MTgtMjEuNzgzMjczIDcuNjEwMTgyIDAgMTUuMTUwNTQ1IDAuOTc3NDU1IDIyLjYyMTA5MSAyLjkwOTA5MSA3LjQ3MDU0NSAxLjk1NDkwOSAxMy40OTgxODIgNC41MTQ5MDkgMTguMDM2MzY0IDcuNzI2NTQ1bC02LjA1MDkwOSAxNC40NTIzNjRhNjguOTMzODE4IDY4LjkzMzgxOCAwIDAgMC0zNC42MDY1NDYtOC45NmMtMTQuNTY4NzI3IDAtMjUuMzkwNTQ1IDUuMjgyOTA5LTMyLjQ4ODcyNyAxNS44NDg3MjctNy4wOTgxODIgMTAuNTY1ODE4LTEwLjYzNTYzNiAyNy4yNzU2MzYtMTAuNjM1NjM2IDUwLjEyOTQ1NSAwIDQzLjkxNTYzNiAxNC4zNTkyNzMgNjUuODYxODE4IDQzLjEyNDM2MyA2NS44NjE4MTggMTIuMTcxNjM2IDAgMjQuNjQ1ODE4LTMuNzIzNjM2IDM3LjM5OTI3My0xMS4xNzA5MDlsNS43MjUwOTEgMTQuNDI5MDkxeiBtMjMuMTA5ODE4LTE0OC4yMDA3MjdoNDAuMDk4OTA5YzE1LjE1MDU0NSAwIDI3LjI5ODkwOSAzLjgxNjcyNyAzNi4zOTg1NDYgMTEuNDAzNjM2IDkuMTIyOTA5IDcuNjMzNDU1IDEzLjY4NDM2NCAxOC4xNTI3MjcgMTMuNjg0MzYzIDMxLjUxMTI3MyAwIDEzLjQyODM2NC00LjUzODE4MiAyNC4xNTcwOTEtMTMuNjE0NTQ1IDMyLjE4NjE4Mi05LjA3NjM2NCA4LjAyOTA5MS0yMC45Njg3MjcgMTIuMDU1MjczLTM1LjY3NzA5MSAxMi4wNTUyNzJoLTIyLjUyOHY3MC45MTJoLTE4LjM4NTQ1NVYzNTIuMTE2MzY0eiBtMTguMzg1NDU1IDcxLjE0NDcyN2gxOS45MjE0NTRjMjEuNTczODE4IDAgMzIuMzcyMzY0LTkuMDUzMDkxIDMyLjM3MjM2NC0yNy4xMTI3MjcgMC04LjM3ODE4Mi0yLjkzMjM2NC0xNS4xMjcyNzMtOC43OTcwOTEtMjAuMjkzODE5LTUuODY0NzI3LTUuMTQzMjczLTEzLjQyODM2NC03LjcyNjU0NS0yMi42OTA5MDktNy43MjY1NDVoLTIwLjgyOTA5MXY1NS4xMzMwOTF6TTY3NC45MDkwOTEgNTEwLjE4NDcyN2gtODIuNTcxNjM2VjM1Mi4xMTYzNjRoODEuOTJ2MTYuMDExNjM2aC02My41MzQ1NDZ2NDguOTY1ODE4aDYxLjA0NDM2NHYxNi4wMTE2MzdoLTYxLjA0NDM2NHY2MS4wNDQzNjNINjc0LjkwOTA5MXYxNi4wMzQ5MDl6IiBmaWxsPSIjMjFBM0REIiAvPjwvc3ZnPg==',
  
};
class OltPoint {
  #objectId;
  constructor(deviceName,coordinates,other={}){
    const {options={},properties={}}=other
    this.type='Feature'
    this.id=this.#objectId=deviceName;
    this.geometry=new PointGeometry(coordinates)
    this.properties={
      objectId:this.id,
      deviceName,
      ...properties,
    }
    this.options={
      balloonPanelMaxMapArea:0,
      hideIconOnBalloonOpen:false,
      zIndex:EVENTS_MAP_ZINDEX.OLT,
      iconLayout:'default#image',
      iconImageHref:EVENTS_MAP_ICONS.OLT,
      iconShape:new CircleIconShape(24),
      ...new IconImageSizeOffset(48),
      ...options,
    }
  }
  get objectId(){
    return this.#objectId
  }
};
class OntPoint {
  #objectId;
  constructor(accountId,coordinates,other={}){
    const {options={},properties={}}=other
    this.type='Feature'
    this.id=this.#objectId=accountId;
    this.geometry=new PointGeometry(coordinates)
    this.properties={
      objectId:this.id,
      accountId,
      ...properties,
    }
    this.options={
      balloonPanelMaxMapArea:0,
      hideIconOnBalloonOpen:false,
      zIndex:EVENTS_MAP_ZINDEX.ONT,
      iconLayout:'default#image',
      iconImageHref:EVENTS_MAP_ICONS.ONT,
      iconShape:new RectangleIconShape(24),
      ...new IconImageSizeOffset(48),
      ...options,
    }
  }
  get objectId(){
    return this.#objectId
  }
};

store.registerModule('gpon2',{
  namespaced:true,
  state:()=>({
    loads:{},
    sites:{},
    devices:{},
    devicesInfo:{},
    devicesPortsList:{},
    devicesPortsLinkList:{},
    devicesPortsDdmList:{},
    devicesPortsOntList:{},
    devicesPortsInfo:{},
    abons:{},
    timer:null,
    started:false,
    userPause:false,
    abonPause:false,
  }),
  getters:{
    timer:state=>state.timer,
    started:state=>state.started,
    userPause:state=>state.userPause,
    abonPause:state=>state.abonPause,
    loads:state=>state.loads,
    sites:state=>state.sites,
    devices:state=>state.devices,
    devicesList:(state,getters)=>Object.entries(getters.devices).filter(([deviceName,selected])=>selected).map(([deviceName])=>deviceName),
    devicesCount:(state,getters)=>getters.devicesList.length,
    devicesInfo:state=>state.devicesInfo,
    getDeviceInfo:(state,getters)=>(deviceName)=>getters.devicesInfo[deviceName],
    getDeviceSiteCoords:(state,getters)=>(deviceName)=>{
      const site=getters.sites[getters.getDeviceInfo(deviceName)?.site_id];
      if(!site){return};
      return [parseFloat(site.LatitudeWGS),parseFloat(site.LongitudeWGS)]
    },
    devicesPortsInfo:state=>state.devicesPortsInfo,
    devicesPortsList:state=>state.devicesPortsList,
    devicesPortsLinkList:state=>state.devicesPortsLinkList,
    devicesPortsDdmList:state=>state.devicesPortsDdmList,
    devicesPortsOntList:state=>state.devicesPortsOntList,
    abons:state=>state.abons,
    getDevicePortsList:state=>(deviceName)=>state.devicesPortsList[deviceName]||[],
    getDevicePortsLinkList:state=>(deviceName)=>state.devicesPortsLinkList[deviceName]||[],
    getDevicePortsDdmList:state=>(deviceName)=>state.devicesPortsDdmList[deviceName]||[],
    getDevicePortsOntList:state=>(deviceName)=>state.devicesPortsOntList[deviceName]||[],
    getDevicePortsAbons:(state,getters)=>(deviceName)=>getters.getDevicePortsList(deviceName).reduce((subscriber,_port)=>{
      const {subscriber_list,name,snmp_name,snmp_number,snmp_description,device_name}=_port;
      const port={
        deviceName:device_name,
        devicePortName:name,
        ifIndex:snmp_number,
        ifName:snmp_name,
        ifAlias:snmp_description,
      };
      for(const {account:accountId,mac} of subscriber_list){
        subscriber[accountId]={accountId,mac,...port};
      };
      return subscriber
    },{}),
    getAbon:(state,getters)=>(accountId)=>getters.abons[accountId],
    getDeviceAbons:(state,getters)=>(deviceName)=>select(getters.abons,{deviceName}),
    getDevicePortAbons:(state,getters)=>(deviceName,ifIndexOrName)=>select(getters.abons,{deviceName,ifIndex:ifIndexOrName},{deviceName,ifName:ifIndexOrName}),
  },
  mutations:{
    setVal(state,[key,value]){
      if(!key){return};
      Vue.set(state,key,value);
    },
    setItem(state,[path,value]){
      const [section,key]=path.split('/');
      if(!key){return};
      Vue.set(state[section],key,value);
    },
  },
  actions:{
    startUpdate({commit,getters,dispatch},setMapObjects){
      if(getters.started){return};
      commit('setVal',['started',!0]);
      dispatch('update',setMapObjects);
    },
    setUserPause({commit},value){
      commit('setVal',['userPause',Boolean(value)]);
      console.log('userPause',Boolean(value))
    },
    setAbonPause({commit},value){
      commit('setVal',['abonPause',Boolean(value)]);
      console.log('abonPause',Boolean(value))
    },
    async update({commit,getters,dispatch},setMapObjects){
      if(getters.userPause||getters.abonPause){
        await new Promise(resolve=>setTimeout(resolve,22222));
      }else{
        await Promise.allSettled(getters.devicesList.map(deviceName=>dispatch('updateDevice',{deviceName,setMapObjects})));
      };
      commit('setVal',['timer',setTimeout(()=>{
        dispatch('update',setMapObjects);
      },22222)]);
    },
    async addDevice({commit,dispatch},deviceName=''){
      commit('setItem',['devices/'+deviceName,!0]);
    },
    async delDevice({commit,dispatch},deviceName=''){
      commit('setItem',['devices/'+deviceName,!1]);
    },
    async updateDevice({commit,getters,dispatch},{deviceName='',setMapObjects=()=>{}}={}){
      const loadKey=`updateDevice-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      await dispatch('getDeviceInfo',deviceName);
      const device=getters.getDeviceInfo(deviceName);
      if(device){
        await dispatch('getDeviceAbons',deviceName);
        setMapObjects();
        await Promise.allSettled([
          dispatch('getSite',device.site_id),
          dispatch('getDevicePortsList',deviceName)
        ]);
        setMapObjects();
        /*for(const {name:devicePortName} of getters.getDevicePortsList(deviceName)){
          dispatch('getDevicePortInfo',{deviceName,devicePortName,trunk:false});
        };
        await dispatch('getDevicePortsLinkList',deviceName);
        await dispatch('getDevicePortsDdmList',deviceName);
        for(const {snmp_number:ifIndex,snmp_name:ifName} of getters.getDevicePortsList(deviceName)){
          await dispatch('getDevicePortOntList',{deviceName,ifIndex,ifName});
        };*/
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDeviceInfo({getters,commit},deviceName){
      if(!deviceName){return};
      const loadKey=`search_ma-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`device/${deviceName}`);
      if(cache){
        commit('setItem',['devicesInfo/'+deviceName,Object.freeze(cache)]);
      }else{
        try{
          const response=await httpGet(buildUrl('search_ma',{pattern:deviceName},'/call/v1/search/'));
          if(response?.data){
            localStorageCache.setItem(`device/${deviceName}`,response.data,CACHE_1HOUR);
            commit('setItem',['devicesInfo/'+deviceName,Object.freeze(response.data)]);
          };
        }catch(error){
          console.warn('search_ma.error',error);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getSite({getters,commit},siteId){
      if(!siteId){return};
      const loadKey=`get_nioss_object-${siteId}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`site-${siteId}`);
      if(cache){
        commit('setItem',['sites/'+siteId,Object.freeze(cache)]);
      }else{
        try{
          const response=await httpGet(buildUrl('get_nioss_object',{object_id:siteId,object:'site'},'/call/nioss/'));
          if(response?.resource_business_name){
            localStorageCache.setItem(`site-${siteId}`,response,CACHE_1DAY);
            commit('setItem',['sites/'+siteId,Object.freeze(response)]);
          };
        }catch(error){
          console.warn('get_nioss_object.error',error);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortsList({getters,commit},deviceName){
      const loadKey=`device_port_list-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`device_port_list/${deviceName}`)||localStorageCache.getItem(`ports-map:device_port_list/${deviceName}`);
      if(cache?.response){
        commit('setItem',['devicesPortsList/'+deviceName,Object.freeze(cache.response)]);
      }else{
        try{
          const response=await httpGet(buildUrl('device_port_list',{device:deviceName},'/call/device/'));
          if(Array.isArray(response)){
            const cache={date:new Date(),response};
            localStorageCache.setItem(`device_port_list/${deviceName}`,cache,CACHE_1HOUR);
            for(const port of response){//т.к структура идентичная сваливаем порты в кэш
              localStorageCache.setItem(`port/PORT-${port.device_name}/${port.snmp_number}`,port);
            };
            commit('setItem',['devicesPortsList/'+deviceName,Object.freeze(response)]);
          }else{
            commit('setItem',['devicesPortsList/'+deviceName,[]]);
          };
        }catch(error){
          console.warn('device_port_list.error',error);
          commit('setItem',['devicesPortsList/'+deviceName,[]]);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getAbons({getters,commit},accountId=''){
      if(!accountId){return};
      const accounts=Array.isArray(accountId)?accountId:accountId?.split(',');
      if(!accounts.length){return};
      for(const accountId of accounts){
        const loadKey=`getAbon-${accountId}`;
        commit('setItem',['loads/'+loadKey,true]);
      };
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbyCr8L8OZDTTVuiQp4j_5chhXIMc1Wkzyt_6cCzMFrOdw0zjr0lhJGTawYzuStEpB7S/exec?action=select_accountId&accountId=${accounts.join(',')}`).then(r=>r.json())
        if(response){
          for(const [accountId,info] of Object.entries(response)){
            commit('setItem',['abons/'+accountId,info]);
          };
        };
      }catch(error){
        console.warn('getAbons.error',error);
      };
      for(const accountId of accounts){
        const loadKey=`getAbon-${accountId}`;
        commit('setItem',['loads/'+loadKey,!true]);
      };
    },
    async getDeviceAbons({getters,commit},deviceName=''){
      if(!deviceName){return};
      const loadKey=`getDeviceAbons-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbyCr8L8OZDTTVuiQp4j_5chhXIMc1Wkzyt_6cCzMFrOdw0zjr0lhJGTawYzuStEpB7S/exec?action=select_deviceName&deviceName=${deviceName}`).then(r=>r.json())
        if(response){
          for(const [_deviceName,abons] of Object.entries(response)){
            for(const [_accountId,abon] of Object.entries(abons)){
              commit('setItem',['abons/'+_accountId,abon]);
            };
          };
        };
      }catch(error){
        console.warn('getDeviceAbons.error',error);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortInfo({getters,commit},{deviceName,devicePortName,trunk=false}={}){
      if(!deviceName||!devicePortName){return};
      const loadKey=`port_info-${devicePortName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`port_info:cp/${devicePortName}`);
      if(cache){
        commit('setItem',['devicesPortsInfo/'+devicePortName,Object.freeze(cache)]);
      }else{
        try{
          const response=await httpGet(buildUrl('port_info',{device:deviceName,port:devicePortName,trunk},'/call/device/'));
          if(Array.isArray(response)){
            localStorageCache.setItem(`port_info:cp/${devicePortName}`,response,CACHE_1HOUR);
            commit('setItem',['devicesPortsInfo/'+devicePortName,Object.freeze(response)]);
          }else{
            commit('setItem',['devicesPortsInfo/'+devicePortName,[]]);
          };
        }catch(error){
          console.warn('search_ma.error',error);
          commit('setItem',['devicesPortsInfo/'+devicePortName,[]]);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortsLinkList({getters,commit},deviceName){
      if(!deviceName){return};
      const loadKey=`port_statuses-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpPost(buildUrl('port_statuses',{},'/call/hdm/'),{devices:[{DEVICE_NAME:deviceName}]});
        if(Array.isArray(response?.[deviceName]?.ports)){
          commit('setItem',['devicesPortsLinkList/'+deviceName,Object.freeze(response[deviceName].ports)]);
        }else{
          commit('setItem',['devicesPortsLinkList/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('port_statuses.error',error);
        commit('setItem',['devicesPortsLinkList/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortsDdmList({getters,commit},deviceName){
      if(!deviceName){return};
      const loadKey=`sfp_info-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpGet(buildUrl('sfp_info',{device_name:deviceName},'/call/hdm/'));
        if(Array.isArray(response)){
          commit('setItem',['devicesPortsDdmList/'+deviceName,Object.freeze(response)]);
        }else{
          commit('setItem',['devicesPortsDdmList/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('sfp_info.error',error);
        commit('setItem',['devicesPortsDdmList/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortOntList({getters,commit},{deviceName,ifIndex,ifName}={}){
      if(!deviceName||!ifIndex||!ifName){return};
      const loadKey=`onu_info-${deviceName}-${ifIndex}-${ifName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpGet(buildUrl('onu_info',{device_name:deviceName,port:ifName,port_index:ifIndex},'/call/hdm/'));
        if(Array.isArray(response)){
          commit('setItem',['devicesPortsOntList/'+deviceName,Object.freeze(response)]);
        }else{
          commit('setItem',['devicesPortsOntList/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('sfp_info.error',error);
        commit('setItem',['devicesPortsOntList/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async setAbon({getters:{getAbon},commit,dispatch},{accountId='',...props}={}){
      if(!accountId){return};
      const abon=getAbon(accountId);
      if(!abon){return};
      dispatch('setAbonPause',!0);
      commit('setItem',['abons/'+accountId,{...abon,...props}]);
      const loadKey=`setAbon-${accountId}`;
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbyCr8L8OZDTTVuiQp4j_5chhXIMc1Wkzyt_6cCzMFrOdw0zjr0lhJGTawYzuStEpB7S/exec`,{
          method:'POST',mode:'no-cors',
          headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify({accountId,...props})
        });
        dispatch('getAbons',accountId);
      }catch(error){
        console.warn('setAbon.error',error);
      };
      commit('setItem',['loads/'+loadKey,!1]);
      dispatch('setAbonPause',!1);
    },
  },
});

function customBalloonAndHint($el){
  const {width,height}=$el.getBoundingClientRect();
  Object.assign($el.parentElement.parentElement.style,{width:`${width}px`,height:`${height}px`});//balloon
  Object.assign($el.parentElement.parentElement.parentElement.style,{padding:'unset',margin:'unset'});//balloon
  Object.assign($el.parentElement.parentElement.parentElement.parentElement.style,{'background':'unset'});//balloon only
  Object.assign($el.parentElement.parentElement.parentElement.parentElement.style,{'box-shadow':'unset','-webkit-box-shadow':'unset','-moz-box-shadow':'unset'});//hint only
  Object.assign($el.parentElement.parentElement.parentElement.parentElement.firstChild.firstChild.style,{width:'20px',height:'20px',margin:'2px'});//balloon
  Object.assign($el.parentElement.parentElement.parentElement.parentElement.parentElement.style,{top:`${-height-10}px`,padding:'unset'});//balloon
};
function mountBalloonView(){
  return new Vue({
    store,
    template:`<div name="YMapsBalloon">
      <div>objectId: {{objectId}}</div>
      <div>objectType: {{objectType}}</div>
      <pre v-if="abon">{{abon}}</pre>
      <pre v-if="device">{{device}}</pre>
    </div>`,
    data:()=>({
      objectId:null,
      objectType:null,
    }),
    created(){
      (function(id=`YMapsBalloon-css`){
        document.getElementById(id)?.remove();
        const el=Object.assign(document.createElement('style'),{type:'text/css',id});
        el.appendChild(document.createTextNode(`
          [name="YMapsBalloon"]{
            width: 300px;
            height: 200px;
            background: #ffffffdd;
            border-radius: 4px;
            border: 1px solid #1d1ad7;
            padding: 4px;
            font-family: auto;
            font-size: 11px;
            line-height: 12px;
          }
        `));
        document.body.insertAdjacentElement('afterBegin',el);
      }());
      this.objectId=this.objectId||document.querySelector(`[name="YMapsBalloon"][object-id]`)?.getAttribute(`object-id`);
      this.objectType=document.querySelector(`[name="YMapsBalloon"][object-type]`)?.getAttribute(`object-type`);
    },
    mounted(){customBalloonAndHint(this.$el)},
    computed:{
      ...mapGetters({
        getDeviceInfo:'gpon2/getDeviceInfo',
        getAbon:'gpon2/getAbon',
      }),
      abon(){return this.objectType=='account'?this.getAbon(this.objectId):null},
      device(){return this.objectType=='device'?this.getDeviceInfo(this.objectId):null},
    },
    destroyed(){},
  }).$mount(`[name="YMapsBalloon"]`);
};
function mountHintView(){
  return new Vue({
    store,
    template:`<div name="YMapsHint">
      <div>objectId: {{objectId}}</div>
      <div>objectType: {{objectType}}</div>
      <template v-if="abon">
        <pre>lbsvAddress: {{abon.lbsvAddress}}</pre>
        <pre>decription: {{abon.decription}}</pre>
      </template>
      <pre v-if="device">{{device}}</pre>
    </div>`,
    data:()=>({
      objectId:null,
      objectType:null,
    }),
    created(){
      (function(id=`YMapsHint-css`){
        document.getElementById(id)?.remove();
        const el=Object.assign(document.createElement('style'),{type:'text/css',id});
        el.appendChild(document.createTextNode(`
          [name="YMapsHint"]{
            min-width: 200px;
            height: auto;
            background: #ffffffdd;
            border-radius: 4px;
            border: 1px solid #1d1ad7;
            padding: 4px;
            font-family: auto;
            font-size: 11px;
            line-height: 12px;
          }
        `));
        document.body.insertAdjacentElement('afterBegin',el);
      }());
      this.objectId=document.querySelector(`[name="YMapsHint"][object-id]`)?.getAttribute(`object-id`);
      this.objectType=document.querySelector(`[name="YMapsHint"][object-type]`)?.getAttribute(`object-type`);
    },
    mounted(){customBalloonAndHint(this.$el)},
    computed:{
      ...mapGetters({
        getDeviceInfo:'gpon2/getDeviceInfo',
        getAbon:'gpon2/getAbon',
      }),
      abon(){return this.objectType=='account'?this.getAbon(this.objectId):null},
      device(){return this.objectType=='device'?this.getDeviceInfo(this.objectId):null},
    },
    destroyed(){},
  }).$mount(`[name="YMapsHint"]`);
};
//app.$children[3].$children[0].ymap.balloon
Vue.component('EventsMapGpon2',{
  template:`<div name="EventsMapGpon2" class="position-relative" style="height:100vh;width:100vw;">
    <div name="YMap" class="position-absolute inset-0" style="width:100%;height:100%;"></div>
  </div>`,
  props:{
    templateId:{type:[String,Number],default:'',required:true}
  },
  mounted(){
    this.awaitYmapsReady();
  },
  data:()=>({
    ymapsReadyTimer:null,
    isYmapsReady:false,
    isYmapsInit:false,
    ymap:null,
    type:'yandex#map',
    center:[55.19882141102037, 82.82566161923812],
    zoom:16,
    geocodeLoading:false,
    address:'',
    addressInfoButton:null,
    controlListBox:null,
    bounds:null,
    objectManager1:null,
    cursor:null,
    hintLayout:null,
    markers:{},
  }),
  created(){
    this.startUpdate(this.setMapObjects);
  },
  watch:{
    'type'(type){
      this.ymap.setType(type)
    },
    'center'(newCenter){
      this.ymap.setCenter(newCenter,this.zoom);
      this.setAddressByCoordinates(newCenter);
      //this.setMapObjects();
    },
    'zoom'(newZoom){
      this.ymap.setCenter(this.center,newZoom);
      this.setAddressByCoordinates(this.center);
      //this.setMapObjects();
    },
    'address'(address){
      this.addressInfoButton.data.set('content',address);
    },
    'devicesList'(){
      this.setMapObjects();
    }
  },
  computed:{
    ...mapGetters({
      devices:'gpon2/devices',
      devicesList:'gpon2/devicesList',
      devicesCount:'gpon2/devicesCount',
      getDeviceInfo:'gpon2/getDeviceInfo',
      getDeviceSiteCoords:'gpon2/getDeviceSiteCoords',
      getDeviceAbons:'gpon2/getDeviceAbons',
    }),
  },
  methods:{
    ...mapActions({
      startUpdate:'gpon2/startUpdate',
      setUserPause:'gpon2/setUserPause',
      addDevice:'gpon2/addDevice',
      delDevice:'gpon2/delDevice',
      setAbon:'gpon2/setAbon',
    }),
    awaitYmapsReady(){
      setTimeout(()=>{
        if(!Boolean(window.ymaps)){return this.awaitYmapsReady()};
        if(this.ymap){return};
        window.ymaps.ready(()=>{
          this.initYmaps();
        });
      },111);
    },
    async initYmaps(){
      const {type,center,zoom,address}=this;
      
      this.hintLayout=window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsHint" object-id="{{properties.objectId}}" object-type="device"></div>`,{
        getShape:function(){//сдвиг от края
          const el=this.getElement();
          if(!el){return}
          const {offsetWidth,offsetHeight}=el.firstChild;
          return new window.ymaps.shape.Rectangle(new window.ymaps.geometry.pixel.Rectangle([[0,0],[offsetWidth,offsetHeight]]));
        },
        customView:null,
        build:function(){
          this.constructor.superclass.build.call(this);
          this.customView=mountHintView();
          console.log(this)
        },
        clear:function(){
          this.customView?.$destroy();
          this.constructor.superclass.clear.call(this);
        },
      });
      
      this.addressInfoButton=new window.ymaps.control.Button({
        data:{
          content:address,
        },
        options:{
          position:{top:8,left:8},
          size:'small',
          maxWidth:'unset',
          selectOnClick:false,
        },
        state:{
          enabled:false,
        },
      });
      
      this.controlListBox=new window.ymaps.control.ListBox({
        data:{
          content:`Не выбран`,
        },
        items:NSK_OLT_LIST_ITEMS.map(item=>{
          return !item?new window.ymaps.control.ListBoxItem({
            options:{
              type:'separator'
            }
          }):new window.ymaps.control.ListBoxItem({
            data:{
              content:item,
              deviceName:item
            },
          })
        }),
        options:{
          position:{top:40,left:8},
          size:'small',
          maxWidth:'unset',
        },
      });
      this.controlListBox.events.add(['select','deselect'],(event)=>{
        const listBoxItem=event.get('target');
        const deviceName=listBoxItem.data.get('deviceName');
        if(!deviceName){return};
        const content=listBoxItem.data.get('content');
        const selected=listBoxItem.state.get('selected');
        console.log('ymap.controlListBox.[select,deselect].{content,selected}',content,selected);
        if(selected){
          this.addDevice(deviceName);
        }else{
          this.delDevice(deviceName);
        };
        const {devicesCount}=this;
        event.originalEvent.currentTarget.data.set('content',devicesCount?`Выбрано ${devicesCount}`:`Не выбран`);
      });
      
      this.ymap=new window.ymaps.Map(document.querySelector(`div[name="YMap"]`),{
        type,
        center,
        zoom,
        controls:[
          this.addressInfoButton,
          this.controlListBox,
          new window.ymaps.control.TypeSelector({
            //mapTypes:['yandex#map','yandex#satellite','yandex#hybrid'],
            options:{
              position:{top:8,right:40},
              size:'small',
              panoramasItemMode:'off',
            },
          }),
          new window.ymaps.control.GeolocationControl({
            options:{
              position:{top:8,right:8},
              size:'small',
            },
          }),
          new window.ymaps.control.ZoomControl({
            options:{
              position:{top:40,right:8},
              size:'large',
            },
          }),
          new window.ymaps.control.RulerControl({
            options:{
              position:{bottom:8,right:8},
              size:'small',
            },
          }),
        ].filter(Boolean),
      },{
        autoFitToViewport:'always',
        avoidFractionalZoom:false,
        maxZoom:19,
        minZoom:12,//14,
        //restrictMapArea:[[],[]],
        yandexMapAutoSwitch:false,
      });
      
      document.querySelector(`.ymaps-2-1-79-copyrights-pane`)?.remove();
      
      //ymap.events
      this.ymap.events.add('boundschange',(event)=>{
        const newCenter=event.get('newCenter');console.log('ymap.boundschange.newCenter',newCenter);
        const newZoom=event.get('newZoom');console.log('ymap.boundschange.newZoom',newZoom);
        this.center=newCenter;
        this.zoom=newZoom;
      });
      this.ymap.events.add('mouseenter',(event)=>{
        this.cursor=event.originalEvent.map.cursors.push('crosshair');
      });
      this.ymap.events.add('mousemove',(event)=>{
        const coords=event.get('coords');console.log('ymap.mousemove.coords',coords);
        this.setAddressByCoordinates(coords);
      });
      this.ymap.events.add('mouseleave',(event)=>{
        this.cursor?.remove();
      });
      this.ymap.events.add('typechange',(event)=>{
        const type=event.originalEvent.map.getType();console.log('ymap.typechange.type',type);
        this.type=type;
      });
      this.ymap.events.add('click',(event)=>{
        const coords=event.get('coords');console.log('ymap.click.coords',coords);
        this.center=coords;
      });
      this.ymap.events.add('contextmenu',(event)=>{//rclick
        const coords=event.get('coords');console.log('ymap.contextmenu.coords',coords);
      });
      
      //ymap.balloon.events
      this.ymap.balloon.events.add('click',(event)=>{
        console.log('ymap.balloon.click',event);
      });
      this.ymap.balloon.events.add('contextmenu',(event)=>{//rclick
        console.log('ymap.balloon.contextmenu',event);
      });
      this.ymap.balloon.events.add('close',(event)=>{
        console.log('ymap.balloon.close',event);
        this.ymap.balloon.customView?.$destroy();
      });
      this.ymap.balloon.events.add('open',(event)=>{
        console.log('ymap.balloon.open',event);
        this.ymap.balloon.customView=mountBalloonView();
      });
      
      //ymap.hint.events
      this.ymap.hint.events.add('click',(event)=>{
        console.log('ymap.hint.click',event);
      });
      this.ymap.hint.events.add('contextmenu',(event)=>{//rclick
        console.log('ymap.hint.contextmenu',event);
      });
      this.ymap.hint.events.add('close',(event)=>{
        console.log('ymap.hint.close',event);
        this.ymap.hint.customView?.$destroy();
      });
      this.ymap.hint.events.add('open',(event)=>{
        console.log('ymap.hint.open',event);
        this.ymap.hint.customView=mountHintView();
      });
      
      //OLTs
      this.objectManager1=new window.ymaps.ObjectManager({});
      this.objectManager1.properties.set('objectId',randcode(20));
      this.objectManager1.objects.events.add('click',async(event)=>{
        this.ymap.balloon.close();
        const objectId=event.get('objectId');
        const {geometry:{coordinates},properties,options}=this.objectManager1.objects.getById(objectId);
        console.log('ymap.objectManager1.click.objectId,coordinates,properties,options',objectId,coordinates,properties,options);
        
        //await this.ymap.balloon.open(coordinates,`<div name="YMapsBalloon" object-id="${objectId}" object-type="device"></div>`);
        //this.ymap.balloon.customView=mountBalloonView();
        this.ymap.balloon.open(coordinates,`<div name="YMapsBalloon" object-id="${objectId}" object-type="device"></div>`)
      });
      this.addGeoObject(this.objectManager1);
    },
    async getSampleAddressCoordinates(sample){
      if(!window.ymaps){return new GeocodeResult(sample)};
      this.geocodeLoading=true;
      const response=await window.ymaps.geocode(sample,{json:true,results:1});
      this.geocodeLoading=!true;
      return new GeocodeResult(sample,response)
    },
    async setAddressByCoordinates(coordinates){
      if(this.geocodeLoading){return};
      const {address}=await this.getSampleAddressCoordinates(coordinates);
      this.address=address;
    },
    getBounds(){
      return this.bounds=this.ymap.getBounds();
    },
    addGeoObject(geoObject){
      if(!geoObject){return};
      this.ymap.geoObjects.add(geoObject);
    },
    delGeoObject(geoObject){
      if(!geoObject){return};
      this.ymap.geoObjects.remove(geoObject);
    },
    setMarkerCoordinates(objectId,coordinates){
      const marker=this.markers[objectId];
      if(!marker){return};
      marker.geometry.setCoordinates(coordinates);
    },
    setMapObjects(){
      const {devicesList}=this;
      if(this.objectManager1){
        this.setOLTs();
        /*this.objectManager1.setFilter((object)=>{
          return devicesList.includes(object.properties.deviceName)
        });*/
      };
      this.setAbons();
      //https://yandex.ru/dev/maps/jsbox/2.1/polygon
    },
    async setOLTs(){
      const {devicesList,hintLayout}=this;
      for(const object of this.objectManager1.objects.getAll()){
        if(!devicesList.includes(object.properties.deviceName)){
          this.objectManager1.remove(object);
        };
      };
      for(const deviceName of devicesList){
        const device=this.getDeviceInfo(deviceName);
        const coordinates=this.getDeviceSiteCoords(deviceName);
        if(!coordinates){continue};
        if(!this.objectManager1.objects.getById(deviceName)){
          this.objectManager1.add(new FeatureCollection([new OltPoint(deviceName,coordinates,{
            properties:{
              deviceName,
            },
            options:{
              //hintLayout,
              hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsHint" object-id="${deviceName}" object-type="device"></div>`),
              //balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsBalloon" object-id="${deviceName}" object-type="device"></div>`),
              openEmptyBalloon:true,
            }
          })]));
        }else{
          //const object=this.objectManager1.objects.getById(deviceName);
          //object.geometry.coordinates=coordinates;
          //this.objectManager1.objects.setObjectOptions(deviceName,{})
        };
      };
    },
    setAbons(){
      const {devices,markers,hintLayout}=this;
      for(const [deviceName,isSelected] of Object.entries(devices)){
        const abons=this.getDeviceAbons(deviceName);
        for(const [_accountId,abon] of Object.entries(abons)){
          const {accountId,coordinates}=abon;
          
          if(!isSelected){
            this.delGeoObject(markers[accountId]);
            continue
          };
          
          let [latitude,longitude]=coordinates||[];
          if(!latitude||!longitude){
            const coordinates=this.getDeviceSiteCoords(deviceName);
            if(!coordinates){continue};
            const [_latitude,_longitude]=coordinates;
            //const lat=Math.random()*0.01;
            //const lon=Math.random()*0.02;
            //latitude=_latitude+(Math.random()>0.5?lat:-lat);
            //longitude=_longitude+(Math.random()>0.5?lon:-lon);
            latitude=_latitude+0.001;
            longitude=_longitude+0.002;
          };
          if(!latitude||!longitude){continue};
          
          if(markers[accountId]){
            this.setMarkerCoordinates(accountId,[latitude,longitude])
          }else{
            this.addGeoObject(markers[accountId]=new ymaps.Placemark([latitude,longitude],{
              objectId:accountId,
              accountId
            },{
              balloonPanelMaxMapArea:0,
              hideIconOnBalloonOpen:false,
              zIndex:EVENTS_MAP_ZINDEX.ONT,
              iconLayout:'default#image',
              iconImageHref:EVENTS_MAP_ICONS.ONT,
              iconShape:new RectangleIconShape(24),
              ...new IconImageSizeOffset(48),
              //hintLayout,
              hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsHint" object-id="${accountId}" object-type="account"></div>`),
              draggable:true,
              openEmptyBalloon:true,
              balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsBalloon" object-id="${accountId}" object-type="account"></div>`),
            }));
            
            markers[accountId].events.add('dragstart',(event)=>{
              console.log('marker.events.dragstart.target');
              this.setUserPause(!0);
            });
            markers[accountId].events.add('drag',(event)=>{
              console.log('marker.events.drag.target');
            });
            markers[accountId].events.add('dragend',(event)=>{
              const target=event.get('target');
              const coordinates=target.geometry.getCoordinates();
              console.log('marker.events.dragend.target',coordinates);
              this.setAbon({accountId,coordinates});
              this.setUserPause(!1);
            });
            
            /*markers[accountId].events.add('balloonopen',(event)=>{
              const target=event.get('target');
              target.balloon.customView=mountBalloonView();
            });
            markers[accountId].events.add('balloonclose',(event)=>{
              const target=event.get('target');
              target.balloon.customView?.$destroy();
            });
            
            markers[accountId].events.add('hintopen',(event)=>{
              const target=event.get('target');
              target.hint.customView=mountHintView();
            });
            markers[accountId].events.add('hintclose',(event)=>{
              const target=event.get('target');
              target.hint.customView?.$destroy();
            });*/
          };
        };
      };
    },
  },
  beforeDestroy(){
    this.ymap.balloon.customView?.$destroy();
    this.ymap?.destroy();
  },
});























