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
      const id=`ya-map`;
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
  ['OLT_KR_54_10907_1','OLT_KR_54_10907_1 • Huawei MA5800-X2 • Россия, обл. Новосибирская, р-н Новосибирский, п Ложок, ул. Тесла, контейнер связи',[54.842842,83.181644],18],
  null,//separator
  ['OLT_KR_54_02758_1','OLT_KR_54_02758_1 • FiberHome AN5516-04 • Россия, обл. Новосибирская, г. Новосибирск, тер Тополек СНТ (Первомайский р-н), термошкаф',[54.906,83.04819],18],
  null,//separator
  ['OLT_KR_54_02757_1','OLT_KR_54_02757_1 • FiberHome AN5516-04 • Россия, обл. Новосибирская, р-н Коченевский, тер НСТ Энергия-3, ул. Первая, термошкаф',[55.19775,82.8258],18],
  ['OLT_KR_54_02757_2','OLT_KR_54_02757_2 • Huawei MA5800-X2 • Россия, обл. Новосибирская, р-н Коченевский, тер НСТ Энергия-3, ул. Первая, термошкаф',[55.19775,82.8258],18],
  null,//separator
  ['OLT_KR_54_02546_1','OLT_KR_54_02546_1 • FiberHome AN5516-04 • Россия, обл. Новосибирская, г. Новосибирск, тер. снт Строймашевец, д. 6',[54.905731,83.058411],18],
  null,//separator
  ['OLT_KR_54_01832_1','OLT_KR_54_01832_1 • FiberHome AN5516-04 • Россия, обл. Новосибирская, р-н Новосибирский, дп Мочище, ул. Шведова, д. 1/к.1',[55.18269,82.88427],18],
  null,//separator
  ['OLT_KR_54_01799_1','OLT_KR_54_01799_1 • FiberHome AN5516-06 • Россия, обл. Новосибирская, г. Новосибирск, ул. Большевистская, д. 126',[54.99023,82.97477],18],
  null,//separator
  ['OLT_KR_54_0760_1','OLT_KR_54_0760_1 • FiberHome AN5516-06 • Россия, обл. Новосибирская, г. Новосибирск, тер Ивушка СНТ (советский р-н), опора',[54.88922,83.05083],18],
  null,//separator
  ['OLT_KR_54_0513_1','OLT_KR_54_0513_1 • unknown • Россия, обл. Новосибирская, р-н Коченевский, 18,695 км северо-восточнее дома 4 по Майская ул, Катково с, башня',[55.19552,82.79891],18],
  ['OLT_59KR_01979_1','OLT_59KR_01979_1 • FiberHome AN5516-06 • Россия, край Пермский, г. Пермь, ул. Космонавта Леонова, д. 56А',[57.966267,56.174858],18],
];
const NSK_OLTs=NSK_OLT_LIST_ITEMS.reduce((selectedItems,item)=>item?Object.assign(selectedItems,{[item[0]]:null}):selectedItems,{});

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
class PolygonGeometry {
  constructor(coordinates){
    this.type='Polygon'
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
  PON:50,
  OLT:20,
  AREA:10,
};
const EVENTS_MAP_ICONS={
  //OLT:'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTUuNTk3IDU1LjU5NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTUuNTk3IDU1LjU5NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBvbHlnb24gc3R5bGU9ImZpbGw6I0YzRDU1QjsiIHBvaW50cz0iMjcuNTk3LDcuNzkgMy41OTcsNDkuNzkgNTIuNTk3LDQ5Ljc5ICIvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzU1NjA4MDsiIGQ9Ik01NS40NTgsNTAuMzA3TDQ0LjE5NiwzMS4wODZsLTAuNzctMS4zMTRMMjguNDksNC4yODJjLTAuMzg2LTAuNjU5LTEuMzM5LTAuNjU2LTEuNzIxLDAuMDA1DQoJTDEyLjM2MywyOS4xOGwtMS4yMTQsMi4wOTdMMC4xMzUsNTAuMzEyYy0wLjM4NCwwLjY2NCwwLjA5NSwxLjQ5NSwwLjg2MiwxLjQ5NWgyNi42MjdoMjYuOTc0DQoJQzU1LjM2OSw1MS44MDcsNTUuODQ4LDUwLjk3MSw1NS40NTgsNTAuMzA3eiBNNi40NDYsNDcuODA3bDguMDk5LTEzLjk5NWw0Ljk1Mi04LjU1OWw4LjM4OS0xNC40OTdsOC41NjMsMTQuNjEzbDQuODQ5LDguMjc0DQoJbDguMjk5LDE0LjE2NEg2LjQ0NnoiLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiNFNkU3RTg7IiBkPSJNNDQuNTM4LDMwLjc3N0w0NC41MzgsMzAuNzc3Yy05LjM3Myw5LjM3My0yNC41NjksOS4zNzMtMzMuOTQxLDBsMCwwbDAsMA0KCUMxOS45NjksMjEuNDA1LDM1LjE2NSwyMS40MDUsNDQuNTM4LDMwLjc3N0w0NC41MzgsMzAuNzc3eiIvPg0KPGNpcmNsZSBzdHlsZT0iZmlsbDojNDhBMERDOyIgY3g9IjI3LjU5NyIgY3k9IjMwLjc5IiByPSI2Ii8+DQo8Y2lyY2xlIHN0eWxlPSJmaWxsOiM1NTYwODA7IiBjeD0iMjcuNTk3IiBjeT0iMzAuNzkiIHI9IjMiLz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K',
  //ONT:'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnLWljb24iIHN0eWxlPSJ3aWR0aDogMWVtOyBoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04MzcuODE4MTgyIDc5MS4yNzI3MjdjMCAyNS42Njk4MTgtMjAuODc1NjM2IDQ2LjU0NTQ1NS00Ni41NDU0NTUgNDYuNTQ1NDU1SDIzMi43MjcyNzNjLTI1LjY2OTgxOCAwLTQ2LjU0NTQ1NS0yMC44NzU2MzYtNDYuNTQ1NDU1LTQ2LjU0NTQ1NXYtOTMuMDkwOTA5aDY1MS42MzYzNjR2OTMuMDkwOTA5ek0yNDguNTc2IDIyNi4wMjQ3MjdBNDYuNzc4MTgyIDQ2Ljc3ODE4MiAwIDAgMSAyOTQuNjMyNzI3IDE4Ni4xODE4MThoNDM0LjczNDU0NmE0Ni43NzgxODIgNDYuNzc4MTgyIDAgMCAxIDQ2LjA1NjcyNyAzOS44NDI5MDlMODM3LjMyOTQ1NSA2NTEuNjM2MzY0SDE4Ni42NzA1NDVsNjEuOTA1NDU1LTQyNS42MTE2Mzd6IG01NzIuOTA0NzI3LTYuNzAyNTQ1QTkzLjA5MDkwOSA5My4wOTA5MDkgMCAwIDAgNzI5LjM2NzI3MyAxMzkuNjM2MzY0SDI5NC42MzI3MjdhOTMuMDkwOTA5IDkzLjA5MDkwOSAwIDAgMC05Mi4xMTM0NTQgNzkuNjg1ODE4TDEzOS42MzYzNjQgNjUxLjYzNjM2NHYxMzkuNjM2MzYzYTkzLjA5MDkwOSA5My4wOTA5MDkgMCAwIDAgOTMuMDkwOTA5IDkzLjA5MDkwOWg1NTguNTQ1NDU0YTkzLjA5MDkwOSA5My4wOTA5MDkgMCAwIDAgOTMuMDkwOTA5LTkzLjA5MDkwOXYtMTM5LjYzNjM2M0w4MjEuNDgwNzI3IDIxOS4zMjIxODJ6IiBmaWxsPSIjMjFBM0REIiAvPjxwYXRoIGQ9Ik0yNTYgNzQ0LjcyNzI3M2g0Ni41NDU0NTV2NDYuNTQ1NDU0aC00Ni41NDU0NTV2LTQ2LjU0NTQ1NHogbTkzLjA5MDkwOSAwaDQ2LjU0NTQ1NXY0Ni41NDU0NTRoLTQ2LjU0NTQ1NXYtNDYuNTQ1NDU0eiBtOTMuMDkwOTA5IDBoNDYuNTQ1NDU1djQ2LjU0NTQ1NGgtNDYuNTQ1NDU1di00Ni41NDU0NTR6IG05My4wOTA5MDkgMGg0Ni41NDU0NTV2NDYuNTQ1NDU0aC00Ni41NDU0NTV2LTQ2LjU0NTQ1NHogbTkzLjA5MDkwOSAwaDQ2LjU0NTQ1NXY0Ni41NDU0NTRoLTQ2LjU0NTQ1NXYtNDYuNTQ1NDU0eiBtOTMuMDkwOTA5IDBoNDYuNTQ1NDU1djQ2LjU0NTQ1NGgtNDYuNTQ1NDU1di00Ni41NDU0NTR6TTQ1NC44NDIxODIgNTAwLjMxNzA5MWMtMTIuNDA0MzY0IDguNjEwOTA5LTI2Ljc2MzYzNiAxMi44OTMwOTEtNDMuMTI0MzY0IDEyLjg5MzA5MS0yMC40OCAwLTM2LjAyNjE4Mi03LjAyODM2NC00Ni42NjE4MTgtMjEuMDYxODE4LTEwLjYzNTYzNi0xNC4wMzM0NTUtMTUuOTY1MDkxLTM0LjM1MDU0NS0xNS45NjUwOTEtNjAuOTUxMjczIDAtMjUuNjkzMDkxIDUuMTQzMjczLTQ1LjgwMDcyNyAxNS40NTMwOTEtNjAuMzIyOTA5IDEwLjMwOTgxOC0xNC41MjIxODIgMjYuMDQyMTgyLTIxLjc4MzI3MyA0Ny4xNzM4MTgtMjEuNzgzMjczIDcuNjEwMTgyIDAgMTUuMTUwNTQ1IDAuOTc3NDU1IDIyLjYyMTA5MSAyLjkwOTA5MSA3LjQ3MDU0NSAxLjk1NDkwOSAxMy40OTgxODIgNC41MTQ5MDkgMTguMDM2MzY0IDcuNzI2NTQ1bC02LjA1MDkwOSAxNC40NTIzNjRhNjguOTMzODE4IDY4LjkzMzgxOCAwIDAgMC0zNC42MDY1NDYtOC45NmMtMTQuNTY4NzI3IDAtMjUuMzkwNTQ1IDUuMjgyOTA5LTMyLjQ4ODcyNyAxNS44NDg3MjctNy4wOTgxODIgMTAuNTY1ODE4LTEwLjYzNTYzNiAyNy4yNzU2MzYtMTAuNjM1NjM2IDUwLjEyOTQ1NSAwIDQzLjkxNTYzNiAxNC4zNTkyNzMgNjUuODYxODE4IDQzLjEyNDM2MyA2NS44NjE4MTggMTIuMTcxNjM2IDAgMjQuNjQ1ODE4LTMuNzIzNjM2IDM3LjM5OTI3My0xMS4xNzA5MDlsNS43MjUwOTEgMTQuNDI5MDkxeiBtMjMuMTA5ODE4LTE0OC4yMDA3MjdoNDAuMDk4OTA5YzE1LjE1MDU0NSAwIDI3LjI5ODkwOSAzLjgxNjcyNyAzNi4zOTg1NDYgMTEuNDAzNjM2IDkuMTIyOTA5IDcuNjMzNDU1IDEzLjY4NDM2NCAxOC4xNTI3MjcgMTMuNjg0MzYzIDMxLjUxMTI3MyAwIDEzLjQyODM2NC00LjUzODE4MiAyNC4xNTcwOTEtMTMuNjE0NTQ1IDMyLjE4NjE4Mi05LjA3NjM2NCA4LjAyOTA5MS0yMC45Njg3MjcgMTIuMDU1MjczLTM1LjY3NzA5MSAxMi4wNTUyNzJoLTIyLjUyOHY3MC45MTJoLTE4LjM4NTQ1NVYzNTIuMTE2MzY0eiBtMTguMzg1NDU1IDcxLjE0NDcyN2gxOS45MjE0NTRjMjEuNTczODE4IDAgMzIuMzcyMzY0LTkuMDUzMDkxIDMyLjM3MjM2NC0yNy4xMTI3MjcgMC04LjM3ODE4Mi0yLjkzMjM2NC0xNS4xMjcyNzMtOC43OTcwOTEtMjAuMjkzODE5LTUuODY0NzI3LTUuMTQzMjczLTEzLjQyODM2NC03LjcyNjU0NS0yMi42OTA5MDktNy43MjY1NDVoLTIwLjgyOTA5MXY1NS4xMzMwOTF6TTY3NC45MDkwOTEgNTEwLjE4NDcyN2gtODIuNTcxNjM2VjM1Mi4xMTYzNjRoODEuOTJ2MTYuMDExNjM2aC02My41MzQ1NDZ2NDguOTY1ODE4aDYxLjA0NDM2NHYxNi4wMTE2MzdoLTYxLjA0NDM2NHY2MS4wNDQzNjNINjc0LjkwOTA5MXYxNi4wMzQ5MDl6IiBmaWxsPSIjMjFBM0REIiAvPjwvc3ZnPg==',
  OLT:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NS41OTcgNTUuNTk3Ij48cGF0aCBmaWxsPSIjZjNkNTViIiBkPSJtMjcuNTk3IDcuNzktMjQgNDJoNDl6Ii8+PHBhdGggZmlsbD0iIzU1NjA4MCIgZD0iTTU1LjQ1OCA1MC4zMDcgNDQuMTk2IDMxLjA4NmwtLjc3LTEuMzE0TDI4LjQ5IDQuMjgyYS45OTUuOTk1IDAgMCAwLTEuNzIxLjAwNUwxMi4zNjMgMjkuMThsLTEuMjE0IDIuMDk3TC4xMzUgNTAuMzEyYS45OTYuOTk2IDAgMCAwIC44NjIgMS40OTVoNTMuNjAxYS45OTYuOTk2IDAgMCAwIC44Ni0xLjV6bS00OS4wMTItMi41IDguMDk5LTEzLjk5NSA0Ljk1Mi04LjU1OSA4LjM4OS0xNC40OTcgOC41NjMgMTQuNjEzIDQuODQ5IDguMjc0IDguMjk5IDE0LjE2NEg2LjQ0NnoiLz48cGF0aCBmaWxsPSIjZTZlN2U4IiBkPSJNNDQuNTM4IDMwLjc3N2MtOS4zNzMgOS4zNzMtMjQuNTY5IDkuMzczLTMzLjk0MSAwIDkuMzcyLTkuMzcyIDI0LjU2OC05LjM3MiAzMy45NDEgMHoiLz48Y2lyY2xlIGZpbGw9IiM0OGEwZGMiIGN4PSIyNy41OTciIGN5PSIzMC43OSIgcj0iNiIvPjxjaXJjbGUgZmlsbD0iIzU1NjA4MCIgY3g9IjI3LjU5NyIgY3k9IjMwLjc5IiByPSIzIi8+PC9zdmc+',
  ONT:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04MzcuODE4IDc5MS4yNzNjMCAyNS42Ny0yMC44NzUgNDYuNTQ1LTQ2LjU0NSA0Ni41NDVIMjMyLjcyN2MtMjUuNjcgMC00Ni41NDUtMjAuODc1LTQ2LjU0NS00Ni41NDV2LTkzLjA5MWg2NTEuNjM2djkzLjA5ek0yNDguNTc2IDIyNi4wMjVhNDYuNzc4IDQ2Ljc3OCAwIDAgMSA0Ni4wNTctMzkuODQzaDQzNC43MzRhNDYuNzc4IDQ2Ljc3OCAwIDAgMSA0Ni4wNTcgMzkuODQzbDYxLjkwNSA0MjUuNjExSDE4Ni42NzFsNjEuOTA1LTQyNS42MTF6bTU3Mi45MDUtNi43MDNhOTMuMDkgOTMuMDkgMCAwIDAtOTIuMTE0LTc5LjY4NkgyOTQuNjMzYTkzLjA5IDkzLjA5IDAgMCAwLTkyLjExNCA3OS42ODZsLTYyLjg4MyA0MzIuMzE0djEzOS42MzdhOTMuMDkgOTMuMDkgMCAwIDAgOTMuMDkxIDkzLjA5aDU1OC41NDZhOTMuMDkgOTMuMDkgMCAwIDAgOTMuMDktOTMuMDlWNjUxLjYzNmwtNjIuODgyLTQzMi4zMTR6IiBmaWxsPSIjMjFBM0REIi8+PHBhdGggZD0iTTI1NiA3NDQuNzI3aDQ2LjU0NXY0Ni41NDZIMjU2di00Ni41NDZ6bTkzLjA5IDBoNDYuNTQ2djQ2LjU0NmgtNDYuNTQ1di00Ni41NDZ6bTkzLjA5MiAwaDQ2LjU0NXY0Ni41NDZoLTQ2LjU0NXYtNDYuNTQ2em05My4wOSAwaDQ2LjU0NnY0Ni41NDZoLTQ2LjU0NXYtNDYuNTQ2em05My4wOTIgMGg0Ni41NDV2NDYuNTQ2aC00Ni41NDV2LTQ2LjU0NnptOTMuMDkgMEg3Njh2NDYuNTQ2aC00Ni41NDV2LTQ2LjU0NnptLTI2Ni42MTItMjQ0LjQxYy0xMi40MDQgOC42MTEtMjYuNzYzIDEyLjg5My00My4xMjQgMTIuODkzLTIwLjQ4IDAtMzYuMDI2LTcuMDI4LTQ2LjY2Mi0yMS4wNjItMTAuNjM2LTE0LjAzMy0xNS45NjUtMzQuMzUtMTUuOTY1LTYwLjk1IDAtMjUuNjk0IDUuMTQzLTQ1LjgwMiAxNS40NTMtNjAuMzI0IDEwLjMxLTE0LjUyMiAyNi4wNDItMjEuNzgzIDQ3LjE3NC0yMS43ODMgNy42MSAwIDE1LjE1Ljk3NyAyMi42MiAyLjkwOSA3LjQ3MSAxLjk1NSAxMy41IDQuNTE1IDE4LjAzNyA3LjcyN2wtNi4wNSAxNC40NTJhNjguOTM0IDY4LjkzNCAwIDAgMC0zNC42MDctOC45NmMtMTQuNTY5IDAtMjUuMzkgNS4yODMtMzIuNDg5IDE1Ljg0OS03LjA5OCAxMC41NjUtMTAuNjM2IDI3LjI3NS0xMC42MzYgNTAuMTMgMCA0My45MTUgMTQuMzYgNjUuODYgNDMuMTI1IDY1Ljg2IDEyLjE3MSAwIDI0LjY0Ni0zLjcyMyAzNy40LTExLjE3bDUuNzI0IDE0LjQzem0yMy4xMS0xNDguMmg0MC4wOTljMTUuMTUgMCAyNy4yOTkgMy44MTYgMzYuMzk4IDExLjQwMyA5LjEyMyA3LjYzMyAxMy42ODUgMTguMTUzIDEzLjY4NSAzMS41MTEgMCAxMy40MjktNC41MzggMjQuMTU3LTEzLjYxNSAzMi4xODYtOS4wNzYgOC4wMy0yMC45NjggMTIuMDU2LTM1LjY3NyAxMi4wNTZoLTIyLjUyOHY3MC45MTJINDc3LjkzVjM1Mi4xMTZ6bTE4LjM4NSA3MS4xNDRoMTkuOTIyYzIxLjU3NCAwIDMyLjM3Mi05LjA1MyAzMi4zNzItMjcuMTEzIDAtOC4zNzgtMi45MzItMTUuMTI3LTguNzk3LTIwLjI5My01Ljg2NS01LjE0NC0xMy40MjgtNy43MjctMjIuNjktNy43MjdoLTIwLjgzdjU1LjEzM3ptMTc4LjU3MiA4Ni45MjRoLTgyLjU3MlYzNTIuMTE2aDgxLjkydjE2LjAxMmgtNjMuNTM0djQ4Ljk2Nmg2MS4wNDR2MTYuMDExaC02MS4wNDR2NjEuMDQ1aDY0LjE4NnYxNi4wMzV6IiBmaWxsPSIjMjFBM0REIi8+PC9zdmc+',
  PON:'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiMyMUEzREQiIGQ9Ik0xMDE5LjcxMiAxNzIuN2MwLTkzLjU3NS03NS44NTYtMTY5LjQzMi0xNjkuNDMtMTY5LjQzMkgxNzIuNTlDNzkuMDE3IDMuMjY4IDMuMTYgNzkuMTI1IDMuMTYgMTcyLjd2Njc3LjY5YzAgOTMuNTc0IDc1Ljg1NyAxNjkuNDMxIDE2OS40MyAxNjkuNDMxaDY3Ny42OTJjOTMuNTc0IDAgMTY5LjQzLTc1Ljg1NyAxNjkuNDMtMTY5LjQzVjE3Mi42OThabS04NC44MSA2NDcuOTUyYzAgNjMuODAxLTUxLjcyIDExNS41MjItMTE1LjUyIDExNS41MjJIMjAyLjMyOWMtNjMuOCAwLTExNS41MjEtNTEuNzItMTE1LjUyMS0xMTUuNTIyVjIwMy42YzAtNjMuODAxIDUxLjcyLTExNS41MjIgMTE1LjUyLTExNS41MjJoNjE3LjA1NWM2My44IDAgMTE1LjUyMSA1MS43MiAxMTUuNTIxIDExNS41MjJ2NjE3LjA1MmgtLjAwMVpNODM1LjM2IDU3MS44MjdjLTI3LjcxMyAyNy43MDEtNzIuNjI0IDI3LjcwMS0xMDAuMzI0IDAtOC4wMDctOC4wMDctMTMuNDItMTcuNTE3LTE2LjgwNS0yNy41NjNINjA3LjczM2MtNi40NTMgMTkuMDQxLTE4LjUwNyAzNS40My0zNC4wNTUgNDcuNTA1bDcyLjE4OCAxMjUuMDM2YzEwLjk3NS0yLjU1MyAyMi42MzMtMi44MzIgMzQuMjgyLjI4OCAzNy44MzUgMTAuMTQzIDYwLjMwMiA0OS4wMzggNTAuMTU4IDg2Ljg4My0xMC4xMzUgMzcuODQ1LTQ5LjA0IDYwLjMtODYuODg0IDUwLjE1Ny0zNy44NDYtMTAuMTM0LTYwLjMwMi00OS4wMjktNTAuMTU3LTg2Ljg3NCAzLjE4Ni0xMS45MTYgOS40NjEtMjIuMDY5IDE3LjQyNy0zMC40MDNsLTczLjQ3NC0xMjcuMjUzYy04LjE1NSAyLjExOC0xNi41OTcgMy41NDMtMjUuNDI1IDMuNTQzLTIwLjYyNSAwLTM5Ljc4Ni02LjE5NS01NS44LTE2Ljc4NEwzMDAuMzY4IDc1MS45ODhjNS4zOTMgMTAuMDA2IDguNzM4IDIxLjI2OCA4LjczOCAzMy40NDEgMCAzOS4xNzItMzEuNzU4IDcwLjk0LTcwLjk0IDcwLjk0cy03MC45NC0zMS43NjgtNzAuOTQtNzAuOTRjMC0zOS4xOSAzMS43NTgtNzAuOTQxIDcwLjk0LTcwLjk0MSAxMi4yMTIgMCAyMy41MzUgMy4zNjUgMzMuNTcgOC44MDlsMTU1LjU3OC0xNTUuNTc4Yy0xMC42MzgtMTYuMDM0LTE2Ljg2NC0zNS4yNDQtMTYuODY0LTU1LjkxOCAwLTIwLjgwMiA2LjI4NC00MC4xMjIgMTcuMDMzLTU2LjIxNEwzMTAuMDM2IDMzOC4xNTNjLTEyLjE0MyA3LjI0NS0yNi4yOTYgMTEuNS00MS40NjggMTEuNS00NC43NzMgMC04MS4wNzQtMzYuMzAxLTgxLjA3NC04MS4wNzUgMC00NC43ODMgMzYuMzAyLTgxLjA3NCA4MS4wNzQtODEuMDc0IDQ0Ljc3NCAwIDgxLjA3NiAzNi4yOTEgODEuMDc2IDgxLjA3NCAwIDE0Ljg5NS00LjA4OCAyOC44MS0xMS4xMDYgNDAuODE0bDExNy43MDMgMTE3LjY5M2MxNS45NjQtMTAuNDkxIDM1LjAyNi0xNi42MjYgNTUuNTUyLTE2LjYyNiAxMC42MSAwIDIwLjgyMyAxLjY0MiAzMC40MzIgNC42Nmw2Mi43MzYtMTA4LjY1N2MtNS43My02LjY5LTEwLjIzNC0xNC41ODgtMTIuNjY3LTIzLjY2My04LjY5LTMyLjQzMiAxMC41Ni02NS43ODQgNDMuMDAyLTc0LjQ3NCAxMS45MjYtMy4xOTYgMjMuOTYtMi41NTQgMzQuODY2IDEuMDggNC4yOTUtLjU4NCA4Ljc4OC4xMTggMTIuODI2IDIuNDU0IDQuMDY4IDIuMzQ2IDYuOTM5IDUuOTI5IDguNTcgOS45NzYgOC41MTIgNy42MSAxNS4wMzQgMTcuNjM2IDE4LjIwMSAyOS40ODMgOC43IDMyLjQ0LTEwLjU2IDY1Ljc4NC00Mi45OTIgNzQuNDgzLTkuMDI1IDIuNDE2LTE4LjA2MSAyLjQ3NC0yNi42NzEuODkxbC02Mi40NSAxMDguMTYzYzE5Ljc3NCAxNi45NDMgMzIuODU4IDQxLjM1OSAzNS4wMzUgNjguODcyaDEwNC4xNzNjMy4wNzktMTEuNzc3IDguOTQ3LTIzIDE4LjE4LTMyLjIyNCAyNy43MDItMjcuNzEyIDcyLjYxMy0yNy43MTIgMTAwLjMyNSAwIDE0LjM1IDE0LjM1IDIxLjExIDMzLjMyMyAyMC41ODUgNTIuMTM2IDAgLjExOC4wNC4yMzcuMDQuMzU2IDAgMS40ODUtLjE4OSAyLjkyLS40ODUgNC4zMTUtMS40OTUgMTUuODc1LTcuOTg2IDMxLjM2My0yMC4xNCA0My41MTdaIi8+PC9zdmc+',
};

class PortSubscriberInfo {
  constructor(subscriber={}){
    this.accountId=subscriber.account||''
    this.mac=subscriber.mac||''
    this.flatNumber=subscriber.flat||''
    this.abonName=subscriber.name||''
    this.abonType=subscriber.type||''
  }
};
class PortInfo {
  constructor(port={}){
    this.deviceName=port.device_name||''
    this.devicePortName=port.name||''
    this.ifIndex=port.snmp_number||0
    this.ifName=port.snmp_name||''
    this.ifAlias=port.snmp_description||''
  }
};

function sortPointsToArea(points=[]){
  const centroid_lat=points.reduce((sum,[lat])=>sum+lat,0)/points.length;
  const centroid_lon=points.reduce((sum,[,lon])=>sum+lon,0)/points.length;
  const calc=points.reduce((calc,[lat,lon])=>{
    const adjacent=lat-centroid_lat;
    const opposite=lon-centroid_lon;
    const hypotenuse=Math.sqrt(adjacent**2+opposite**2);
    const sin=Math.abs(opposite)/hypotenuse;
    let angle=(Math.asin(sin)*180.0)/Math.PI;//rad to deg
    if(adjacent<0&&opposite>0){
      angle=180-angle;
    }else if(adjacent<0&&opposite<0){
      angle+=180;
    }else if(adjacent>0&&opposite<0){
      angle=360-angle;
    };
    calc.push([angle,hypotenuse,lat,lon]);
    return calc
  },[]);
  calc.sort(([a1,h1],[a2,h2])=>a1-a2+h1-h2);//sort by angle and dist center-point
  calc.push(calc[0]);//add first as last, close line
  return calc.map(([angle,hypotenuse,lat,lon])=>[lat,lon]);
};

store.registerModule('gpon2',{
  namespaced:true,
  state:()=>({
    loads:{},
    sitesNodesInfo:{},
    devices:{},
    devicesInfo:{},
    devicesPorts:{},
    devicesPortsLinks:{},
    devicesPortsDdm:{},
    devicesPortsOnts:{},
    devicesPortsInfo:{},
    objectsInfo:{},
    timer:null,
    started:false,
    userActionPause:false,
    setObjectInfoPause:false,
  }),
  getters:{
    timer:state=>state.timer,
    started:state=>state.started,
    userActionPause:state=>state.userActionPause,
    setObjectInfoPause:state=>state.setObjectInfoPause,
    loads:state=>state.loads,
    sitesNodesInfo:state=>state.sitesNodesInfo,
    devices:state=>state.devices,
    devicesList:(state,getters)=>Object.entries(getters.devices).filter(([deviceName,selected])=>selected).map(([deviceName])=>deviceName),
    devicesCount:(state,getters)=>getters.devicesList.length,
    devicesInfo:state=>state.devicesInfo,
    getDeviceInfo:(state,getters)=>(deviceName)=>getters.devicesInfo[deviceName],
    getDeviceSiteCoordinates:(state,getters)=>(deviceName)=>{
      const siteNode=getters.sitesNodesInfo[getters.getDeviceInfo(deviceName)?.uzel?.name];
      if(!siteNode){return};
      return [siteNode.coordinates.latitude,siteNode.coordinates.longitude]
    },
    devicesPortsInfo:state=>state.devicesPortsInfo,
    devicesPorts:state=>state.devicesPorts,
    devicesPortsLinks:state=>state.devicesPortsLinks,
    devicesPortsDdm:state=>state.devicesPortsDdm,
    devicesPortsOnts:state=>state.devicesPortsOnts,
    objectsInfo:state=>state.objectsInfo,
    getDevicePorts:state=>(deviceName)=>state.devicesPorts[deviceName]||[],
    getDevicePortsHasAbons:(state,getters)=>(deviceName)=>getters.getDevicePorts(deviceName).filter(({subscriber_list})=>subscriber_list?.length),
    getDevicePort:(state,getters)=>(deviceName,devicePortName)=>getters.getDevicePorts(deviceName).find(({name})=>name===devicePortName),
    getDeviceAbons:(state,getters)=>(deviceName)=>{
      return getters.getDevicePortsHasAbons(deviceName).reduce((abons,port)=>{
        for(const sub of port.subscriber_list||[]){
          abons.push({...new PortSubscriberInfo(sub),...new PortInfo(port)});
        };
        return abons
      },[])
    },
    getObjectInfo:(state,getters)=>(objectId)=>getters.objectsInfo[objectId],
    getDevicePortAbons:(state,getters)=>(deviceName,devicePortName)=>{
      const port=getters.getDevicePort(deviceName,devicePortName);
      if(!port){return []};
      return (port.subscriber_list||[]).map(sub=>{
        return {...new PortSubscriberInfo(sub),...new PortInfo(port)};
      });
    },
    getDeviceObjectsInfo:(state,getters)=>(deviceName)=>select(getters.objectsInfo,{deviceName}),
    getDevicePortAreaCoordinates:(state,getters)=>(deviceName,devicePortName)=>{
      const abonsInfo=getters.getDeviceObjectsInfo(deviceName);
      const portAbons=getters.getDevicePortAbons(deviceName,devicePortName);
      
      const points=portAbons.reduce((points,{accountId})=>{
        const [lat,lon]=abonsInfo[accountId]?.coordinates||[];
        if(!lat||!lon){return points};
        points.push([lat,lon]);
        return points;
      },[]);
      return points.length>2?[sortPointsToArea(points),[]]:null;
    },
    //getDevicePortsLinksList:state=>(deviceName)=>state.devicesPortsLinks[deviceName]||[],
    //getDevicePortsDdm:state=>(deviceName)=>state.devicesPortsDdm[deviceName]||[],
    //getDevicePortsOntList:state=>(deviceName)=>state.devicesPortsOnts[deviceName]||[],
    //getAbon:(state,getters)=>(accountId)=>getters.abonsInfo[accountId],
    //getDeviceAbons:(state,getters)=>(deviceName)=>select(getters.abonsInfo,{deviceName}),
    //getDeviceAbonsList:(state,getters)=>(deviceName)=>Object.keys(select(getters.abonsInfo,{deviceName})),
    //getDevicePortAbons:(state,getters)=>(deviceName,ifIndexOrName)=>select(getters.abonsInfo,{deviceName,ifIndex:ifIndexOrName},{deviceName,ifName:ifIndexOrName}),
  },
  mutations:{
    setVal(state,[key,value]){
      if(!key){return};
      Vue.set(state,key,value);
    },
    setItem(state,[path,value]){
      const [section,key]=path.split('/');//console.log({section,key,value})
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
    setUserActionPause({commit},value){
      commit('setVal',['userActionPause',Boolean(value)]);
      console.log('userActionPause',Boolean(value))
    },
    setObjectInfoPause({commit},value){
      commit('setVal',['setObjectInfoPause',Boolean(value)]);
      console.log('setObjectInfoPause',Boolean(value))
    },
    async update({commit,getters,dispatch},setMapObjects){
      if(getters.userActionPause||getters.setObjectInfoPause){
        //await new Promise(resolve=>setTimeout(resolve,22222));
      }else{
        await Promise.allSettled(getters.devicesList.map(deviceName=>dispatch('updateDevice',{deviceName,setMapObjects})));
      };
      commit('setVal',['timer',setTimeout(()=>{
        dispatch('update',setMapObjects);
      },10000)]);
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
        setMapObjects();
        await dispatch('getDeviceObjectsInfo',deviceName);
        setMapObjects();
        await Promise.allSettled([
          dispatch('getSiteNodeInfo',device.uzel.name),
          dispatch('getDevicePorts',deviceName)
        ]);
        setMapObjects();
        /*for(const {name:devicePortName} of getters.getDevicePortsList(deviceName)){
          dispatch('getDevicePortInfo',{deviceName,devicePortName,trunk:false});
        };
        await dispatch('getDevicePortsLinks',deviceName);
        await dispatch('getDevicePortsDdm',deviceName);
        for(const {snmp_number:ifIndex,snmp_name:ifName} of getters.getDevicePortsList(deviceName)){
          await dispatch('getDevicePortOnts',{deviceName,ifIndex,ifName});
        };*/
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDeviceInfo({getters,commit},deviceName){
      if(!deviceName){console.warn('getDeviceInfo.error.deviceName');return};
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
    async getSiteNodeInfo({getters,commit},nodeName){
      if(!nodeName){console.warn('getSiteNodeInfo.error.nodeName');return};
      const loadKey=`sitesNodesInfo-${nodeName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`siteNodeInfo-${nodeName}`);
      if(cache){
        commit('setItem',['sitesNodesInfo/'+nodeName,Object.freeze(cache)]);
      }else{
        try{
          const response=await httpGet(buildUrl('search_ma',{pattern:nodeName},'/call/v1/search/'));
          if(response?.data?.id){
            localStorageCache.setItem(`siteNodeInfo-${nodeName}`,response.data,CACHE_1DAY);
            commit('setItem',['sitesNodesInfo/'+nodeName,Object.freeze(response.data)]);
          };
        }catch(error){
          console.warn('search_ma.error',error);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePorts({getters,commit},deviceName){
      if(!deviceName){console.warn('getDevicePorts.error.deviceName');return};
      const loadKey=`device_port_list-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      const cache=localStorageCache.getItem(`device_port_list/${deviceName}`)||localStorageCache.getItem(`ports-map:device_port_list/${deviceName}`);
      if(cache?.response){
        commit('setItem',['devicesPorts/'+deviceName,Object.freeze(cache.response)]);
      }else{
        try{
          const response=await httpGet(buildUrl('device_port_list',{device:deviceName},'/call/device/'));
          if(Array.isArray(response)){
            const cache={date:new Date(),response};
            localStorageCache.setItem(`device_port_list/${deviceName}`,cache,CACHE_1HOUR);
            for(const port of response){//т.к структура идентичная сваливаем порты в кэш
              localStorageCache.setItem(`port/PORT-${port.device_name}/${port.snmp_number}`,port);
            };
            commit('setItem',['devicesPorts/'+deviceName,Object.freeze(response)]);
          }else{
            commit('setItem',['devicesPorts/'+deviceName,[]]);
          };
        }catch(error){
          console.warn('device_port_list.error',error);
          commit('setItem',['devicesPorts/'+deviceName,[]]);
        };
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getObjectInfo({getters,commit},objectId=''){
      if(!objectId){console.warn('getObjectInfo.error.objectId');return};
      const ids=Array.isArray(objectId)?objectId:objectId?.split(',');
      if(!ids.length){return};
      for(const objectId of ids){
        const loadKey=`getObjectInfo-${objectId}`;
        commit('setItem',['loads/'+loadKey,true]);
      };
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbzWu5nNAkKO7H7hgd9tAjg4srIf430lZdU1HTauUP7MNjNPoZAyoVlpHsMGhNjL0NPn/exec?action=select_objectId&objectId=${ids.join(',')}`).then(r=>r.json())
        if(response){
          for(const [objectId,objectInfo] of Object.entries(response)){
            commit('setItem',['objectsInfo/'+objectId,objectInfo]);
          };
        };
      }catch(error){
        console.warn('getObjectInfo.error',error);
      };
      for(const objectId of ids){
        const loadKey=`getObjectInfo-${objectId}`;
        commit('setItem',['loads/'+loadKey,!true]);
      };
    },
    async getDeviceObjectsInfo({getters,commit},deviceName=''){
      if(!deviceName){console.warn('getDeviceObjectsInfo.error.deviceName');return};
      const loadKey=`getDeviceObjectsInfo-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbzWu5nNAkKO7H7hgd9tAjg4srIf430lZdU1HTauUP7MNjNPoZAyoVlpHsMGhNjL0NPn/exec?action=select_deviceName&deviceName=${deviceName}`).then(r=>r.json())
        if(response){
          for(const [_deviceName,objectsInfo] of Object.entries(response)){
            for(const [objectId,objectInfo] of Object.entries(objectsInfo)){
              commit('setItem',['objectsInfo/'+objectId,objectInfo]);
            };
          };
        };
      }catch(error){
        console.warn('getDeviceObjectsInfo.error',error);
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
    async getDevicePortsLinks({getters,commit},deviceName=''){
      if(!deviceName){console.warn('getDevicePortsLinks.error.deviceName');return};
      const loadKey=`port_statuses-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpPost(buildUrl('port_statuses',{},'/call/hdm/'),{devices:[{DEVICE_NAME:deviceName}]});
        if(Array.isArray(response?.[deviceName]?.ports)){
          commit('setItem',['devicesPortsLinks/'+deviceName,Object.freeze(response[deviceName].ports)]);
        }else{
          commit('setItem',['devicesPortsLinks/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('port_statuses.error',error);
        commit('setItem',['devicesPortsLinks/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortsDdm({getters,commit},deviceName){
      if(!deviceName){console.warn('getDevicePortsDdm.error.deviceName');return};
      const loadKey=`sfp_info-${deviceName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpGet(buildUrl('sfp_info',{device_name:deviceName},'/call/hdm/'));
        if(Array.isArray(response)){
          commit('setItem',['devicesPortsDdm/'+deviceName,Object.freeze(response)]);
        }else{
          commit('setItem',['devicesPortsDdm/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('sfp_info.error',error);
        commit('setItem',['devicesPortsDdm/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async getDevicePortOnts({getters,commit},{deviceName,ifIndex,ifName}={}){
      if(!deviceName){console.warn('getDevicePortOnts.error.deviceName');return};
      if(!ifIndex){console.warn('getDevicePortOnts.error.ifIndex');return};
      if(!ifName){console.warn('getDevicePortOnts.error.ifName');return};
      const loadKey=`onu_info-${deviceName}-${ifIndex}-${ifName}`;
      if(getters.loads[loadKey]){return};
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await httpGet(buildUrl('onu_info',{device_name:deviceName,port:ifName,port_index:ifIndex},'/call/hdm/'));
        if(Array.isArray(response)){
          commit('setItem',['devicesPortsOnts/'+deviceName,Object.freeze(response)]);
        }else{
          commit('setItem',['devicesPortsOnts/'+deviceName,[]]);
        };
      }catch(error){
        console.warn('sfp_info.error',error);
        commit('setItem',['devicesPortsOnts/'+deviceName,[]]);
      };
      commit('setItem',['loads/'+loadKey,!1]);
    },
    async setObjectInfo({getters:{getObjectInfo},commit,dispatch},{objectId='',objectType='',...props}={}){
      if(!objectId){console.warn('setObjectInfo.error.objectId');return};
      if(!objectType){console.warn('setObjectInfo.error.objectType');return};
      dispatch('setObjectInfoPause',!0);
      commit('setItem',['objectsInfo/'+objectId,{objectId,objectType,...getObjectInfo(objectId)||null,...props}]);
      const loadKey=`setObjectInfo-${objectId}`;
      commit('setItem',['loads/'+loadKey,!0]);
      try{
        const response=await fetch(`https://script.google.com/macros/s/AKfycbzWu5nNAkKO7H7hgd9tAjg4srIf430lZdU1HTauUP7MNjNPoZAyoVlpHsMGhNjL0NPn/exec`,{
          method:'POST',mode:'no-cors',
          headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify({objectId,objectType,...props})
        });
        dispatch('getObjectInfo',objectId);
      }catch(error){
        console.warn('setObjectInfo.error',error);
      };
      commit('setItem',['loads/'+loadKey,!1]);
      dispatch('setObjectInfoPause',!1);
    },
  },
});

function mountBalloonView(properties={}){
  return new Vue({
    store,
    template:`<div name="YMapsBalloon">
      <div>objectId: {{objectId}}</div>
      <div>objectType: {{objectType}}</div>
      <template v-if="objectType=='abon'">
        <pre>description: {{abonInfo?.description}}</pre>
      </template>
      <device-info v-else-if="objectType=='device'" :networkElement="getDeviceInfo(objectId)" addBorder autoSysInfo hideEntrances showLocation/>
      <device-info v-else-if="objectType=='port'" :networkElement="getDeviceInfo(deviceName)" :ports="[getDevicePort(deviceName,devicePortName)]" addBorder autoSysInfo hideEntrances showLocation/>
      <OntInfo v-else-if="objectType=='ont'" v-bind="{ont:{},port:getDevicePort(deviceName,devicePortName)}"/>
    </div>`,
    data:()=>({
      ...properties,
    }),
    created(){
      (function(id=`YMapsBalloon-css`){
        document.getElementById(id)?.remove();
        const el=Object.assign(document.createElement('style'),{type:'text/css',id});
        //нужно задать размеры начально
        el.appendChild(document.createTextNode(`
          [name="YMapsBalloon"]{
            width:300px;
            height:300px;
            font-family:Inter;
            font-size:11px;
            line-height:12px;
          }
        `));
        document.body.insertAdjacentElement('afterBegin',el);
      }());
    },
    mounted(){},
    computed:{
      ...mapGetters({
        getDeviceInfo:'gpon2/getDeviceInfo',
        getObjectInfo:'gpon2/getObjectInfo',
        getDevicePort:'gpon2/getDevicePort',
      }),
      abonInfo(){return this.objectType=='abon'?this.getObjectInfo(this.accountId):null},
    },
    destroyed(){},
  }).$mount(`[name="YMapsBalloon"]`);
};
function mountHintView(properties={}){
  return new Vue({
    store,
    template:`<div name="YMapsHint">
      <div>objectId: {{objectId}}</div>
      <div>objectType: {{objectType}}</div>
      <template v-if="objectType=='abon'">
        <pre>description: {{abonInfo?.description}}</pre>
      </template>
      <device-info v-else-if="objectType=='device'" :networkElement="getDeviceInfo(objectId)" addBorder autoSysInfo hideEntrances showLocation/>
      <device-info v-else-if="objectType=='port'" :networkElement="getDeviceInfo(deviceName)" :ports="[getDevicePort(deviceName,devicePortName)]" addBorder autoSysInfo hideEntrances showLocation/>
      <OntInfo v-else-if="objectType=='ont'" v-bind="{ont:{},port:getDevicePort(deviceName,devicePortName)}"/>
    </div>`,
    data:()=>({
      ...properties,
    }),
    created(){
      (function(id=`YMapsHint-css`){
        document.getElementById(id)?.remove();
        const el=Object.assign(document.createElement('style'),{type:'text/css',id});
        el.appendChild(document.createTextNode(`
        .ymaps-2-1-79-hint--- {
          padding: 0 !important;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 !important;
          border: 0 !important;
          max-width: 270px;
        }
        .ymaps-2-1-79-hint__text--- {
          padding: 8px 16px !important;
          background: #fff !important;
          font: inherit important;
          display: block;
          float: initial;
          color: #212121;
          font-size: 14px;
          line-height: 20px;
        }
          [name="YMapsHint"]{
            min-width:200px;
            min-height:100px;
            width:fit-content;
            height:fit-content;
            font-family:Inter;
            font-size:11px;
            line-height:12px;
          }
        `));
        document.body.insertAdjacentElement('afterBegin',el);
      }());
    },
    mounted(){},
    computed:{
      ...mapGetters({
        getDeviceInfo:'gpon2/getDeviceInfo',
        getObjectInfo:'gpon2/getObjectInfo',
        getDevicePort:'gpon2/getDevicePort',
      }),
      abonInfo(){return this.objectType=='abon'?this.getObjectInfo(this.accountId):null},
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
    //zoom:16,center:[55.19882141102037, 82.82566161923812],//Снт
    zoom:16,center:[54.99015329190864, 82.97480896759986],//Зар
    //zoom:19,center:[54.99390617498407, 82.96689562644377],//polygon test
    geocodeLoading:false,
    address:'',
    addressInfoButton:null,
    controlListBox:null,
    bounds:null,
    cursor:null,
    mapObjects:{},
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
      getDeviceSiteCoordinates:'gpon2/getDeviceSiteCoordinates',
      getDeviceAbons:'gpon2/getDeviceAbons',
      getObjectInfo:'gpon2/getObjectInfo',
      getDevicePortsHasAbons:'gpon2/getDevicePortsHasAbons',
      getDevicePortAreaCoordinates:'gpon2/getDevicePortAreaCoordinates',
    }),
  },
  methods:{
    ...mapActions({
      startUpdate:'gpon2/startUpdate',
      setUserActionPause:'gpon2/setUserActionPause',
      addDevice:'gpon2/addDevice',
      delDevice:'gpon2/delDevice',
      setObjectInfo:'gpon2/setObjectInfo',
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
          const [deviceName,content,coordinates,zoom]=item||[];
          return !item?new window.ymaps.control.ListBoxItem({
            options:{
              type:'separator'
            }
          }):new window.ymaps.control.ListBoxItem({
            data:{
              content,
              deviceName,
              coordinates,
              zoom,
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
        const content=listBoxItem.data.get('content');
        const deviceName=listBoxItem.data.get('deviceName');
        const coordinates=listBoxItem.data.get('coordinates');
        const zoom=listBoxItem.data.get('zoom');
        const selected=listBoxItem.state.get('selected');
        console.log('ymap.controlListBox.[select,deselect].{content,selected}',content,selected);
        if(selected){
          this.addDevice(deviceName);
          if(coordinates){this.center=coordinates};
          if(zoom){this.zoom=zoom};
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
        const coords=event.get('coords');//console.log('ymap.mousemove.coords',coords);
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
        this.ymap.balloon.customView=mountBalloonView(event.originalEvent.target.properties.getAll());
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
        this.ymap.hint.customView=mountHintView(event.originalEvent.target.properties.getAll());
      });
    },
    async getSampleAddressCoordinates(sample){
      if(!window.ymaps){return new GeocodeResult(sample)};
      this.geocodeLoading=true;
      const response=await window.ymaps.geocode(sample,{json:true,results:1});
      this.geocodeLoading=!true;
      return new GeocodeResult(sample,response)
    },
    async setAddressByCoordinates(coordinates){return
      if(this.geocodeLoading){return};
      const {address}=await this.getSampleAddressCoordinates(coordinates);
      this.address=address;
    },
    getBounds(){
      return this.bounds=this.ymap.getBounds();
    },
    addMapObject(object){
      if(!object){return};
      //console.log('addMapObject',object.properties.get('objectId'));
      this.ymap.geoObjects.add(object);
    },
    delMapObject(object){
      if(!object){return};
      console.log('delMapObject',object.properties.get('objectId'));
      this.ymap.geoObjects.remove(object);
    },
    setMapObjectCoordinates(objectId,coordinates){
      const mapObject=this.mapObjects[objectId];
      if(!mapObject){return};
      mapObject.geometry.setCoordinates(coordinates);
      //console.log('setMapObjectCoordinates',objectId,coordinates);
    },
    setMapObjects(){
      const {devices,mapObjects}=this;
      for(const [deviceName,isSelected] of Object.entries(devices)){
        if(isSelected){
          this.setMapObjectDevice(deviceName);
        }else{
          const toDel={};
          this.ymap.geoObjects.each(object=>{
            if(object.properties.get('deviceName')==deviceName){
              toDel[object.properties.get('objectId')]=object;
            };
          });
          for(const [objectId,object] of Object.entries(toDel)){
            delete mapObjects[objectId];
            this.delMapObject(object);
          };
        };
      };
      this.invalidateMapObjects();
    },
    invalidateMapObjects(){
      const curr=Date.now();
      const toDel={};
      this.ymap.geoObjects.each(object=>{
        const diff=object.properties.get('lastUpdate')-curr;
        if(diff>60000){
          toDel[object.properties.get('objectId')]=object;
        };
      });
      for(const [objectId,object] of Object.entries(toDel)){
        delete mapObjects[objectId];
        this.delMapObject(object);
      };
    },
    setMapObjectDevice(deviceName){
      const {mapObjects}=this;
      const device=this.getDeviceInfo(deviceName);
      if(!device){return};
      
      const coordinates=this.getDeviceSiteCoordinates(deviceName);
      if(!coordinates){return};
      const [latitude,longitude]=coordinates||[];
      if(!latitude||!longitude){return};
      
      if(!mapObjects[deviceName]){
        this.addMapObject(mapObjects[deviceName]=new window.ymaps.Placemark([latitude,longitude],{
          objectId:deviceName,
          objectType:'device',
          deviceName,
        },{
          balloonPanelMaxMapArea:0,
          hideIconOnBalloonOpen:false,
          openEmptyBalloon:true,
          openEmptyHint:true,
          balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsBalloon"></div>`),
          hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsHint"></div>`),
          zIndex:EVENTS_MAP_ZINDEX.OLT,
          iconLayout:'default#image',
          iconImageHref:EVENTS_MAP_ICONS.OLT,
          iconShape:new CircleIconShape(24),
          ...new IconImageSizeOffset(48),
        }));
      }else{
        
      };
      mapObjects[deviceName].properties.set('lastUpdate',Date.now());
      
      for(const {accountId,devicePortName} of this.getDeviceAbons(deviceName)){
        this.setMapObjectDevicePortAbon(deviceName,devicePortName,accountId);
      };
      for(const {name:devicePortName} of this.getDevicePortsHasAbons(deviceName)){
        this.setMapObjectDevicePort(deviceName,devicePortName);
      };
    },
    setMapObjectDevicePortAbon(deviceName,devicePortName,accountId){
      const {mapObjects}=this;
      let [latitude,longitude]=this.getObjectInfo(accountId)?.coordinates||[];
      if(!latitude||!longitude){
        const coordinates=this.getDeviceSiteCoordinates(deviceName);
        if(!coordinates){return};
        const [_latitude,_longitude]=coordinates;
        if(!_latitude||!_longitude){return};
        latitude=_latitude+0.0004;
        longitude=_longitude+0.0008;
        //const lat=Math.random()*0.0004;
        //const lon=Math.random()*0.0008;
        //latitude=_latitude+(Math.random()>0.5?lat:-lat);
        //longitude=_longitude+(Math.random()>0.5?lon:-lon);
      };
      if(!mapObjects[accountId]){
        this.addMapObject(mapObjects[accountId]=new window.ymaps.Placemark([latitude,longitude],{
          objectId:accountId,
          objectType:'abon',
          accountId,
          deviceName,
          devicePortName,
        },{
          draggable:true,
          balloonPanelMaxMapArea:0,
          hideIconOnBalloonOpen:false,
          openEmptyBalloon:true,
          openEmptyHint:true,
          balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsBalloon"></div>`),
          hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsHint"></div>`),
          zIndex:EVENTS_MAP_ZINDEX.ONT,
          iconLayout:'default#image',
          iconImageHref:EVENTS_MAP_ICONS.ONT,
          iconShape:new RectangleIconShape(24),
          ...new IconImageSizeOffset(48),
        }));
        
        mapObjects[accountId].events.add('dragstart',(event)=>{
          console.log('marker.events.dragstart');
          this.setUserActionPause(!0);
        });
        mapObjects[accountId].events.add('drag',(event)=>{
          console.log('marker.events.drag');
        });
        mapObjects[accountId].events.add('dragend',(event)=>{
          console.log('marker.events.dragend');
          const target=event.get('target');
          
          const coordinates=target.geometry.getCoordinates();
          const deviceName=target.properties.get('deviceName');
          const devicePortName=target.properties.get('devicePortName');
          this.setObjectInfo({objectId:accountId,objectType:'abon',coordinates,deviceName,devicePortName});
          this.setMapObjectDevicePort(deviceName,devicePortName);
          
          this.setUserActionPause(!1);
        });
      }else{
        this.setMapObjectCoordinates(accountId,[latitude,longitude]);
      };
      mapObjects[accountId].properties.set('lastUpdate',Date.now());
    },
    setMapObjectDevicePort(deviceName,devicePortName){
      const {mapObjects}=this;
      const coordinates=this.getDevicePortAreaCoordinates(deviceName,devicePortName);
      //console.log(devicePortName,coordinates);
      if(!coordinates){
        this.setMapObjectDevicePortPoint(deviceName,devicePortName);
      }else{
        if(mapObjects[devicePortName]?.geometry?.getType()==='Point'){
          this.delMapObject(mapObjects[devicePortName]);
          delete mapObjects[devicePortName];
        };
        this.setMapObjectDevicePortArea(deviceName,devicePortName);
      };
    },
    setMapObjectDevicePortPoint(deviceName,devicePortName){
      const {mapObjects}=this;
      let [latitude,longitude]=this.getObjectInfo(devicePortName)?.coordinates||[];
      if(!latitude||!longitude){
        const coordinates=this.getDeviceSiteCoordinates(deviceName);
        if(!coordinates){return};
        const [_latitude,_longitude]=coordinates;
        if(!_latitude||!_longitude){return};
        latitude=_latitude+0.0002;
        longitude=_longitude+0.0004;
      };
      
      if(!mapObjects[devicePortName]){
        this.addMapObject(mapObjects[devicePortName]=new window.ymaps.Placemark([latitude,longitude],{
          objectId:devicePortName,
          objectType:'port',
          deviceName,
          devicePortName,
        },{
          draggable:true,
          balloonPanelMaxMapArea:0,
          hideIconOnBalloonOpen:false,
          openEmptyBalloon:true,
          openEmptyHint:true,
          balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsBalloon"></div>`),
          hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsHint"></div>`),
          zIndex:EVENTS_MAP_ZINDEX.PON,
          iconLayout:'default#image',
          iconImageHref:EVENTS_MAP_ICONS.PON,
          iconShape:new RectangleIconShape(18),
          ...new IconImageSizeOffset(36),
        }));
        
        mapObjects[devicePortName].events.add('dragstart',(event)=>{
          console.log('marker.events.dragstart');
          this.setUserActionPause(!0);
        });
        mapObjects[devicePortName].events.add('drag',(event)=>{
          console.log('marker.events.drag');
        });
        mapObjects[devicePortName].events.add('dragend',(event)=>{
          console.log('marker.events.dragend');
          const target=event.get('target');
          
          const coordinates=target.geometry.getCoordinates();
          const deviceName=target.properties.get('deviceName');
          const devicePortName=target.properties.get('devicePortName');
          this.setObjectInfo({objectId:devicePortName,objectType:'port',coordinates,deviceName});
          //this.setMapObjectDevicePort(deviceName,devicePortName);
          this.setMapObjectCoordinates(devicePortName,coordinates);
          
          this.setUserActionPause(!1);
        });
      }else{
        this.setMapObjectCoordinates(devicePortName,[latitude,longitude]);
      };
      mapObjects[devicePortName].properties.set('lastUpdate',Date.now());
    },
    setMapObjectDevicePortArea(deviceName,devicePortName){
      const {mapObjects}=this;
      const coordinates=this.getDevicePortAreaCoordinates(deviceName,devicePortName);
      if(!coordinates){return};
      if(!mapObjects[devicePortName]){
        this.addMapObject(mapObjects[devicePortName]=new window.ymaps.Polygon(coordinates,{
          objectId:devicePortName,
          objectType:'port',
          deviceName,
          devicePortName,
        },{
          balloonPanelMaxMapArea:0,
          hideIconOnBalloonOpen:false,
          openEmptyBalloon:true,
          openEmptyHint:true,
          balloonContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsBalloon"></div>`),
          hintContentLayout:window.ymaps.templateLayoutFactory.createClass(`<div name="YMapsHint"></div>`),
          zIndex:EVENTS_MAP_ZINDEX.AREA,
          fillColor:'#00FF0020',
          //strokeColor:'#0000FF',
          //strokeWidth:1,
          //strokeStyle:'dash'
          strokeColor:'#00FF0020',
          strokeWidth:48,
          strokeStyle:'solid',
          interactivityModel: 'default#transparent',
        }));
      }else{
        this.setMapObjectCoordinates(devicePortName,coordinates);
      };
      mapObjects[devicePortName].properties.set('lastUpdate',Date.now());
    },
  },
  beforeDestroy(){
    this.ymap.balloon.customView?.$destroy();
    this.ymap.hint.customView?.$destroy();
    this.ymap?.destroy();
  },
});






















