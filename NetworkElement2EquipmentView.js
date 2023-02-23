//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/NetworkElement2EquipmentView.js',type:'text/javascript'}));
function objectToQuery(...params){
  try{
    function objectToPairs(rootKey,object){
      function createPair(key,value){return typeof value==='object'?objectToPairs(key,value).join('&'):`${key}=${value}`};
      if(Array.isArray(object)){
        return !object.length?[`${rootKey}=`]:object.reduce((pairs,value)=>[...pairs,createPair(rootKey?`${rootKey}[]`:'',value)],[]);
      }else{
        const keys=Object.keys(object||{});
        return !keys.length?[`${rootKey}=`]:keys.reduce((pairs,key)=>[...pairs,createPair(rootKey?rootKey+`[${key}]`:key,object[key])],[])
      };
    };
    return params.map(object=>objectToPairs('',object)).flat().join('&');
  }catch({message}){//Maximum call stack size exceeded
    console.warn({message,params})
    return ''
  }
};
Vue.component('EquipmentView',{
  template:`<div name="EquipmentView" class="display-content">
    <loader-bootstrap v-if="loading" height="72" text="поиск изображения"/>
    <div v-else-if="src" class="display-flex align-items-center justify-content-center">
      <div class="position-relative">
        <img :src="src" style="width:340px;">
        <div class="position-absolute" style="inset:0px;"></div>
      </div>
    </div>
  </div>`,
  props:{
    type:{type:String,required:true},
    equipment_id:{type:String,required:true},
    object:{type:Object,default:null},
  },
  data:()=>({
    loading:false,
    equipment:null,
  }),
  created(){
    this.getEquipmentView();
  },
  watch:{
    'equipment_id'(equipment_id){
      if(!equipment_id){return};
      this.getEquipmentView();
    },
  },
  computed:{
    src(){return this.equipment?.src||''},
    isEmpty(){return this.equipment?.isEmpty},
  },
  methods:{
    async getEquipmentView(){
      const {equipment_id,type,object}=this;
      if(!equipment_id){return};
      this.equipment=null;
      const cache=this.$cache.getItem(`img_src/${equipment_id}`);
      if(cache){
        this.equipment=cache||null;
        return;
      };
      this.loading=true;
      try{
        const query=objectToQuery({equipment_id,type,object});console.log({equipment_id,type,object},query);
        const response=await fetch(`https://script.google.com/macros/s/AKfycby26qbmgJjIAi1CGSj9sg9EBkn7mTsw5htXQk4G_DqUnncmuaBQn_wC54fYRHPaqMRa/exec?${query}`).then(resp=>resp.json());
        if(response){
          this.equipment=response;
          this.$cache.setItem(`img_src/${equipment_id}`,response);
        };
      }catch(error){
        console.warn('getEquipmentView.error',error)
      };
      this.loading=false;
    },
  },
});

Vue.component('NetworkElement2',{
  template:`<section name="NetworkElement2">
    <page-navbar v-if="showHeader&&showHeaderByRoute" :title="title" :postfix="postfix"/>
    
    <card-block>
      <device-info :networkElement="networkElement" :entrances="resps.entrances" disabled autoSysInfo/>
      <message-el v-if="showDiscoveryStatus&&discoveryError" :text="discovery.text" :type="discovery.type" :subText="discovery.error" box/>
      
      <template v-if="!hideEquipmentView&&username=='mypanty1'&&networkElement.system_object_id">
        <devider-line/>
        <title-main icon="сube" text="Внешний вид" @block-click="openEquipmentView=!openEquipmentView" :opened="openEquipmentView"/>
        <!--<link-block icon="сube" text="Внешний вид" @block-click="openEquipmentView=!openEquipmentView" :actionIcon="openEquipmentView?'up':'down'" type="large"/>-->
        <div v-show="openEquipmentView"><!--<collapse-slide :opened="openEquipmentView">-->
          <EquipmentView type="networkElement" :equipment_id="networkElement.system_object_id" :object="networkElement"/>
        </div><!--</collapse-slide>-->
      </template>
      
      <template v-if="!hideLocation">
        <devider-line/>
        <title-main icon="info" text="Расположение и информация" @block-click="openLocation=!openLocation" :opened="openLocation"/>
        <collapse-slide :opened="openLocation">
          <rack-header v-if="rack&&canBeInRack" :rack="rack"/>
          <p v-else class="font--13-500 tone-900" style="padding: 0px 16px 8px; margin: 0;">Вне шкафа</p>
          <devider-line p="0 16px"/>
          <link-block icon="du" :text="networkElement.uzel.name" :search="networkElement.uzel.name" />
          <p class="font--13-500 tone-900" style="padding: 0 16px 16px 16px; margin: 0;">{{networkElement.region.location}}</p>
        </collapse-slide>
      </template>

      <template v-if="showTopology">
        <devider-line/>
        <link-block icon="topology" text="Топология сети" actionIcon="right-link" :to="topologyRoute"/>
      </template>
      
      <template v-if="showEqAndAttFromDb">
        <devider-line/>
        <loader-bootstrap v-if="loads.ctv_config_prm_list" height="72" text="поиск рекомендуемых настроек"/>
        <template v-if="resps.ctv_config_prm_list">
          <info-value label="Маска" :value="ctv_config_prm_list.mask" type="small"  withLine/>
          <info-value label="Шлюз" :value="ctv_config_prm_list.gw" type="small"  withLine/>
        </template>
        <info-value v-if="networkElement?.snmp?.community" label="snmp community" :value="networkElement?.snmp?.community" type="small"  withLine/>
        <info-value v-if="networkElement?.snmp?.version" label="snmp version" :value="networkElement?.snmp?.version" type="small"  withLine/>
        <template v-if="resps.ctv_config_prm_list">
          <info-value label="Аттенюатор" :value="ctv_config_prm_list.att" type="small"  withLine/>
          <info-value label="Эквалайзер" :value="ctv_config_prm_list.eq" type="small"  withLine/>
        </template>
      </template>

      <template v-if="showUpstreamNe">
        <devider-line/>
        <link-block icon="superior" text="Вышестоящие устройства" :text2="upstream_ne.length||''" @block-click="open_upstream_ne_modal" actionIcon="expand">
          <button-sq slot="postfix" class="mx-m16" v-if="!has_upstream_ne">
            <i class="ic-20 ic-warning main-orange"></i>
          </button-sq>
        </link-block>
        <modal-container ref="upstream_ne_modal">
          <h6 class="t-a-c mb-16">Вышестоящие устройства</h6>
          <template v-for="(name,i) of upstream_ne">
            <device-info v-if="upstreamNetworkElements[name]" :networkElement="upstreamNetworkElements[name]" showLocation hideEntrances noMinimap addBorder autoSysInfo class="mx-16 mb-8 py-8">
              <button-sq slot="link" @click="closeModalAndGoToNetworkElement(name)" class="m-m10">
                <i class="ic-24 ic-right-link main-lilac"></i>
              </button-sq>
            </device-info>
            <link-block v-else :text="name" :textSub="upstreamNetworkElements[name]?.region?.location" textSubClass="font--13-500 tone-500 t-a-l" @block-click="closeModalAndGoToNetworkElement(name)" class="mb-8"/>
          </template>
          <message-el v-if="!has_upstream_ne" type="warn" text="Отсутствуют!" box class="mx-16"/>
        </modal-container>
      </template>
    </card-block>
    
    <card-block>
      <title-main text="Работы" icon="accidents" :attention="hasActiveIncident?'warn':null" @block-click="toEvents">
        <button-sq icon="right-link" class="no-events"/>
      </title-main>
    </card-block>

    <template v-for="(section,i) of sections">
      <component :is="section.component" :key="i+'-'+section.component" v-bind="section.props" v-on="section.listeners"/>
    </template>

    <card-block>
      <device-notes :device="networkElement" :niossDevice="resps.nioss" :racks="resps.racks" :loading="loads.nioss||loads.racks" @refresh="getNetworkElementData"/>
    </card-block>
  </section>`,
  props:{
    deviceProp:{type:Object,required:true},
    device_id:String,
    rack_id:String,
    rackProp:{type:Object,default:null},
    showHeader:{type:Boolean,default:true},
    hideLocation:{type:Boolean,default:false},
    hideEquipmentView:{type:Boolean,default:false},
  },
  data:()=>({
    discovery:{status:'',type:'',text:'',error:''},
    resps: {
      entrances:null,
      racks:null,
      events:null,
      nioss:null,
      ctv_config_prm_list:null
    },
    loads: {
      entrances:false,
      racks:false,
      events:false,
      nioss:false,
      discovery:false,
      ctv_config_prm_list:false
    },
    upstreamNetworkElements:{},
    openLocation:false,
    openEquipmentView:false,
  }),
  created(){
    this.getNetworkElementData();
  },
  watch:{
    'upstream_ne'(upstream_ne){
      if(!upstream_ne?.length){return};
      if(this.showUpstreamNe){this.getUpstreamNe()};
    }
  },
  computed:{
    ...mapGetters({
      hasUserPriv:'main/hasUserPriv',
      username:'main/username'
    }),
    loading(){return Object.values(this.loads).some(l=>l)},
    networkElement(){return this.deviceProp},
    networkElementType(){return this.networkElement?.type},
    networkElementName(){return this.networkElement?.name||this.device_id||this.$route.params.device_id},
    networkElementPrefix(){return getNetworkElementPrefix(this.networkElementName)},
    networkElementIndex(){return getNetworkElementIndex(this.networkElementName)},
    networkElementShortName(){return getNetworkElementShortName(this.networkElementName)},
    networkElementReference(){return getNetworkElementReference(this.networkElementType)},
    postfix(){
      const {networkElementPrefix,title}=this;
      if(networkElementPrefix==title){return};
      if(!networkElementPrefix){return};
      return `(${networkElementPrefix})`
    },
    title(){return this.networkElementReference.title},
    hasActiveIncident(){return !!(this.resps.events?.active||[]).filter(event=>/(incident|accident)/gi.test(event.type)).length},
    serveEntrances(){return this.networkElementReference.set.includes('!entrances')},
    showEqAndAttFromDb(){return this.networkElementReference.set.includes('!eq_and_att_from_db')},
    canBeInRack(){return this.networkElementReference.set.includes('!can_be_in_rack')},
    showHeaderByRoute(){
      const {name}=this.$route;
      return !/in-rack/.test(name);
    },
    showTopology(){return this.networkElementReference.set.includes('!topology')},
    showUpstreamNe(){return this.networkElementReference.set.includes('!upstream_ne')},
    showDiscoveryStatus(){return this.networkElementReference.set.includes('discovery')},
    discoveryError(){return this.discovery.status!=='SUCCESSFULLY'},
    topologyRoute(){return {name:'net-topology',params:{type:'device',id:this.networkElementName,deviceProp:this.networkElement,entrancesProps:this.resps.entrances}}},
    upstream_ne(){
      const {upstream_ne=''}=this.networkElement;
      if(!upstream_ne?.length){return []};
      return upstream_ne.split(',');
    },
    has_upstream_ne(){return !!this.upstream_ne?.length},
    ctv_config_prm_list(){
      const {ctv_config_prm_list}=this.resps
      if(!ctv_config_prm_list){return null};
      const checkNoData=(v='',u='')=>['number','string'].includes(typeof v)?`${v} ${u}`.trim():'Нет данных';
      const {GATEWAY,SUB_MASK,ATTENUATOR,EQUALIZER}=ctv_config_prm_list;
      return {
        gw:checkNoData(GATEWAY),
        mask:checkNoData(SUB_MASK),
        att:checkNoData(ATTENUATOR,'dB'),
        eq:checkNoData(EQUALIZER,'dB'),
      };
    },
    rack(){
      const {networkElementName,rackProp,canBeInRack}=this;
      if(!canBeInRack){return};
      if(rackProp){return rackProp};
      const {racks}=this.resps;
      if(!racks){return};
      return racks.find(rack=>rack.ne_in_rack.includes(networkElementName))
    },
    sections(){
      const {networkElement,networkElementReference:{set},discovery,loads,doNetworkElementDiscovery}=this;
      const {site_id,nioss_id}=networkElement;
      const sections=[];
      for(const section of set){
        if(/!/.test(section)){continue};
        switch(section){
          case 'ktv_params':
            sections.push(...[
              {component:'ktv-params',props:{networkElement}},
            ]);
          break;
          case 'ports_map':
            sections.push(...[
              {component:'ports-map',props:{device:networkElement,ref:'ports-map'}},
            ]);
          break;
          case 'olt_cards':
            sections.push(...[
              {component:'olt-cards',props:{device:networkElement}},
            ]);
          break;
          case 'discovery':
            sections.push(...[
              {component:'device-actions',props:{device:networkElement,discovery,loading:loads},listeners:{'get:discovery':doNetworkElementDiscovery}},
            ]);
          break;
        };
      };
      return sections
    },
  },
  methods:{
    async getNetworkElementData(){
      this.setDiscovery();
      if(this.serveEntrances){this.getSiteEntrances()};
      //if(this.canBeInRack&&!this.rack&&!this.hideLocation){this.getSiteRacks()};
      if(this.canBeInRack){this.getSiteRacks()};
      if(this.showEqAndAttFromDb){this.getKtvConfigPrmList()};
      if(this.showUpstreamNe){this.getUpstreamNe()};
      this.get_nioss_object();
      this.getNetworkElementEvents();
    },
    async getNetworkElementEvents({dates}={}){
      const {name:device,nioss_id:id}=this.networkElement
      if(!dates){
        const now=new Date();
        dates={from:now,to:now};
      };
      const {from,to}=dates;
      this.loads.events=true;
      this.resps.events=null;
      try{
        const response=await httpGet(buildUrl("event_list",{from,to,id,device,filter:true},"/call/device/"));
        if(Array.isArray(response)){
          this.resps.events=response;
        }
      }catch(error){
        console.warn("event_list.error",error);
      }
      this.loads.events=false;
    },
    setDiscovery({error=''}={}){
      const {discovery}=this.networkElement;
      if(!discovery){return};
      if(!discovery.status){discovery.status='NONE'};
      const unsuccess='UNSUCCESSFULLY';
      const status=error?unsuccess:discovery.status;
      const discoveryTypeText={
        SUCCESSFULLY  :{type:'success', text:'Успешный опрос'},
        UNSUCCESSFULLY:{type:'warn',    text:'Опросить не удалось'},
        NONE          :{type:'info',    text:'Устройство не проходило опрос'},
      };
      const {type='',text=''}=discoveryTypeText[status]||discoveryTypeText[unsuccess]||{};
      const discoveryDateArray=discovery.date.split(/[.: ]/);
      const createTime=new Date(discoveryDateArray[2],`${discoveryDateArray[1] - 1}`,discoveryDateArray[0],discoveryDateArray[3],discoveryDateArray[4],0,0);
      const currentTime=new Date(createTime.getTime()-(createTime.getTimezoneOffset()*60*1000+180*60*1000)).toLocaleString("ru",{day:'numeric',month:'numeric',year:'numeric',hour:'numeric',minute:'numeric'});
      const date=error||discovery.status==='NONE'?'':currentTime;
      this.discovery={
        status,
        error,
        type,
        text:`${text} ${date}`,
      };
    },
    async getSiteEntrances(){
      const {site_id}=this.networkElement;
      if(!site_id){return}
      this.loads.entrances=true;
      const cache=this.$cache.getItem(`site_entrance_list/${site_id}`);
      if(cache){
        this.resps.entrances=cache;
      }else{
        try{
          let response=await httpGet(buildUrl('site_entrance_list',{site_id},'/call/v1/device/'));
          this.resps.entrances=response;
          if(!response.length){response=[]};
          this.$cache.setItem(`site_entrance_list/${site_id}`,response);
        }catch(error){
          console.warn("site_entrance_list.error",error);
        }
      };
      this.loads.entrances=false;
    },
    async getSiteRacks(){
      const {site_id}=this.networkElement;
      if(!site_id){return}
      this.loads.racks=true;
      const cache=this.$cache.getItem(`site_rack_list/${site_id}`);
      if(cache){
        this.resps.racks=cache;
      }else{
        try{
          let response=await httpGet(buildUrl('site_rack_list',{site_id},'/call/v1/device/'));
          this.resps.racks=response;
          if(!response.length){response=[]};
          this.$cache.setItem(`site_rack_list/${site_id}`,response);
        }catch(error){
          console.warn("site_rack_list.error",error);
        }
      };
      this.loads.racks=false;
    },
    async get_nioss_object(){
      const {nioss_id:object_id=''}=this.networkElement;
      if(!object_id){return};
      const cache=this.$cache.getItem(`get_nioss_object/${object_id}`);
      if(cache){
        this.resps.nioss=cache;
        return;
      };
      this.loads.nioss=true;
      try{
        const response=await httpGet(buildUrl("get_nioss_object",{object_id,object:'device'},"/call/nioss/"),true);
        if(response?.parent){this.$cache.setItem(`get_nioss_object/${object_id}`,response)};
        this.resps.nioss=response||null;
      }catch(error){
        console.warn("get_nioss_object.error",error);
      }
      this.loads.nioss=false;
    },
    toEvents() {
      this.$router.push({
        name:"device_events",
        params:{
          id:this.networkElement.nioss_id,
          deviceProp:this.networkElement
        },
      });
    },
    async doNetworkElementDiscovery(){
      const {ne_status='',region:{mr_id=0},name='',ip='',system_object_id='',vendor='',snmp:{version='',community=''}}=this.networkElement;
      if(ne_status){//для демонтированных и остальных которых нет в current
        this.setDiscovery({error:'СЭ не введен в эксплуатацию'});
        return;
      };
      const discovery_params={
        ip,mr_id,
        MR_ID:mr_id,
        DEVICE_NAME:name,
        IP_ADDRESS:ip,
        SYSTEM_OBJECT_ID:system_object_id,
        VENDOR:vendor,
        SNMP_VERSION:version,
        SNMP_COMMUNITY:community,
      };
      const isValid=Object.entries(discovery_params).every(([key,value])=>{
        if(["VENDOR","SYSTEM_OBJECT_ID"].includes(key)){return true};
        return value;
      });
      if(!isValid){
        this.setDiscovery({error:"Недостаточно данных NIOSS для опроса"});
        return;
      };

      this.loads.discovery=true;
      try{
        const response=await httpPost(buildUrl('dev_discovery',objectToQuery({ip,name}),'/call/hdm/'),{device:discovery_params});
        if(response.code!=200){throw new Error(response.message)};
        this.$cache.removeItem(`device/${name}`);
        if(typeof this.$refs.ports_map?.getDevicePorts==='function'){
          await this.$refs.ports_map.getDevicePorts();
        };
        return this.$router.replace({name:"search",params:{text:this.networkElementName}});
      }catch(error) {
        console.warn("dev_discovery.error",error);
        this.setDiscovery({error:error.message});
      }
      this.loads.discovery=false;
    },
    getUpstreamNe(){
      const {upstream_ne}=this;
      for(const device_name of upstream_ne){
        this.getUpstreamNetworkElement(device_name);
      };
    },
    async getUpstreamNetworkElement(name){
      if(!name){return};
      if(this.upstreamNetworkElements[name]){return};
      const cache=this.$cache.getItem(`device/${name}`);
      if(cache){
        this.upstreamNetworkElements={...this.upstreamNetworkElements,[name]:cache};
      }else{
        let response=await httpGet(buildUrl('search_ma',{pattern:name},'/call/v1/search/'));
        if(response.data){
          this.$cache.setItem(`device/${name}`,response.data);
          this.upstreamNetworkElements={...this.upstreamNetworkElements,[name]:response.data};
        };
      };
    },
    async getKtvConfigPrmList(){
      const {name}=this.networkElement;
      if(!name){return};
      this.loads.ctv_config_prm_list=true;
      let response=this.$cache.getItem(`ctv_config_prm_list/${name}`);
      if(!response){
        try{
          response=await httpGet(buildUrl('ctv_config_prm_list',{name},'/call/device/'))
          this.$cache.setItem(`ctv_config_prm_list/${name}`,response);
        }catch(error) {
          console.warn('ctv_config_prm_list.error',error);
        }
      };
      this.resps.ctv_config_prm_list=response;
      this.loads.ctv_config_prm_list=false;
    },
    open_upstream_ne_modal(){
      this.$refs.upstream_ne_modal.open();
    },
    close_upstream_ne_modal(){
      this.$refs.upstream_ne_modal.close();
    },
    closeModalAndGoToNetworkElement(network_element_name){
      this.close_upstream_ne_modal();
      this.goToNetworkElement(network_element_name);
    },
    goToNetworkElement(network_element_name=''){
      if(!network_element_name){return};
      const networkElement=this.upstreamNetworkElements[network_element_name]||null
      this.$router.push({
        name:"network-element",
        params:{
          device_id:network_element_name,
          deviceProp:networkElement,
        },
      });
    },
  },
  beforeRouteEnter(to,from,next){
    if(!to.params.deviceProp?.snmp?.port){///call/v1/device/devices возвращает без данных для snmp
      next({name:'search',params:{text:to.params.device_id}});
      return;
    };
    next();
  },
  beforeRouteUpdate(to,from,next){
    if(!to.params.deviceProp?.snmp?.port){///call/v1/device/devices возвращает без данных для snmp
      next({name:'search',params:{text:to.params.device_id}});
      return;
    };
    next();
  },
});
app.$router.addRoutes([
  {
    path:'/network-element-2/:device_id',
    name:'network-element-2',
    component:Vue.component('NetworkElement2'),
    props:true
  },
  {
    path: "/rack-2/:rack_id",
    component: Vue.component("rack-wrapper"),
    props: true,
    children: [
      { path: "", name: "rack-2", exact: true, props: true, component: Vue.component("rack-content") },
      {
        path:"network-element-2/:device_id",
        name:"network-element-in-rack-2",
        component:Vue.component("NetworkElement2"),
        props:true,
      },
      {
        path: "plint-2/:device_id",
        name: "rackPlint-2",
        props: true,
        component: Vue.component("rack-slide-plint"),
      },
    ],
  },
]);
app.$watch('$route',({name,params})=>{
  if(app.$store.getters['main/username']!=='mypanty1'){return};
  if(name==='network-element'){
    app.$router.replace({
      name: "network-element-2",
      params
    });
  }else if(name==='network-element-in-rack'){
    app.$router.replace({
      name: "network-element-in-rack-2",
      params
    });
  };
});


