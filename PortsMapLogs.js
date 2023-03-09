//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortsMapLogs.js',type:'text/javascript'}));

Vue.component('ports-map',{
  template:`<card-block class="ports-map">
    <title-main :text="title">
      <button-sq :icon="loading.statuses_speed||loading.statuses_cable?'loading rotating':'refresh'" v-if="!unmoutedPorts&&!showDetailed" @click="updateLinksOnPortsCellBase"/>
    </title-main>
    <message-el v-if="ports && !ports.length" text="Порты не найдены" type="warn" box class="my-16" />
    <loader-bootstrap v-if="loading.ports" text="получение портов"/>
    <template v-else-if="ports.length">
      <div class="d-center-x pl-16 pr-8">
        <span class="font--15-500" :class="unmoutedPorts?'tone-500':'tone-900'">Подробная информация</span>
        <div class="ml-auto d-flex-x">
          <button-sq v-if="loading.statuses_speed||loading.statuses_cable||loading.loopback||loading.errors" icon="loading rotating" type="medium"/>
          <switch-el v-model="showDetailed" :disabled="loading.errors||unmoutedPorts"/>
        </div>
      </div>
      <div class="d-center-x pl-16 pr-8" v-if="!unmoutedPorts&&!showDetailed&&xRad_region_id">
        <span class="font--15-500" :class="(!random_account||loading.abon||!serverid)?'tone-500':'tone-900'">Активные сессии(xRad)</span>
        <div class="ml-auto d-flex-x">
          <button-sq v-if="loading.sessions" icon="loading rotating" type="medium"/>
          <switch-el v-model="showSessions" :disabled="!random_account||loading.abon||!serverid||loading.sessions||!xRad_serverid"/>
        </div>
      </div>
      <ports-map-actions v-if="showDetailed&&!loading.ports" :loading="loading" @refresh="refresh" @getStatuses="getStatuses" @getLoopback="getLoopback" @getErrors="getErrors"/>
      <PortsMapContent ref="PortsMapContent" :networkElement="device" :ports="ports" :loading_statuses="loading.statuses_speed" :isUnmount="unmoutedPorts" :errors="responses.errors" :loading="loading" :showDetailed="showDetailed" :showCabelTest="showCabelTest" :showSessions="showSessions" @setDetailedType="setDetailedType" @on-port-status="updatePortStatus"/>
      
      <PortsMapLogs v-if="!unmoutedPorts" :networkElement="device" :ports="unmoutedPorts?[]:ports" class="margin-bottom-8px"/>
      
      <ports-map-legend :showSessions="showSessions" :showDetailed="showDetailed" :detailedType="detailedType" :ports="ports"/>
    </template>
    <dismantled-devices v-if="!noDismantled" :device="device" @get:unmouted-ports="getUnmountDevicePorts" @get:ports="loadCache"/>
  </card-block>`,
  props:{
    device:{type: Object,required:true},
    noDismantled:{type:Boolean,default:false}
  },
  data:()=>({
    responses:{
      ports:null,
      statuses:[],
      loopback:[],
      errors:{},//by port.name
      sessions:[],
      abon:null,
    },
    loading:{
      ports:false,
      statuses_speed:false,
      statuses_cable:false,
      loopback:false,
      errors:false,
      sessions:false,
      abon:false,
    },
    unmoutedPorts:false,
    showDetailed:false,
    showLegend:false,
    showCabelTest:false,
    cacheDate:null,
    cacheLoaded:false,
    detailedType:'cell',
    showSessions:false,
  }),
  async created(){
    this.loadCache();
    if(!this.responses.ports){await this.getDevicePorts()};
    if(!this.responses.statuses.length){await this.getStatuses()};
  },
  watch:{
    'device'(hasDevice){
      if(!hasDevice){return};
      if(!this.cacheLoaded){this.loadCache()};
      if(!this.responses.ports){this.getDevicePorts()};
      if(!this.responses.statuses.length){this.getStatuses()};
    },
    'showDetailed'(isShow){
      if(isShow&&!this.responses.statuses.length){this.getStatuses()};
    },
    'showSessions'(show){
      if(show&&!this.loading.sessions){this.getSessions()};
    },
    'random_account'(account){
      if(account&&!this.responses.abon&&!this.loading.abon){this.getAbon()};
    },
  },
  computed: {
    title() {
      return `Порты ${this.parsedCacheDate}`;
    },
    ports(){
      if(!this.responses.ports){return null};
      return this.responses.ports.map(port=>{
        const infoText=(['number','string'].includes(typeof port.flat)?String(port.flat):'').toLowerCase();
        return ({
          ...port,
          portStatus:this.responses.statuses.find(port_status=>port_status.iface===port.snmp_name),
          portLoopback:this.responses.loopback.find(loopback=>loopback.iface===port.snmp_name),
          infoText,
          infoClass: {
            'map-port__info': true,
            'map-port__info--move': Boolean(infoText),
            'map-port__info--border': Boolean(infoText),
            'map-port__info--new': infoText === 'new',
            'map-port__info--hub': infoText === 'hub',
            'map-port__info--bad': infoText === 'bad',
          },
          session:this.responses.sessions.find(session=>session.snmp_name===port.snmp_name),
        })
      })
    },
    trunks(){
      if(!this.responses.ports){return []};
      return this.responses.ports.filter(port=>port.state==='trunk busy')
    },
    parsedCacheDate() {
      if (!this.cacheDate) return '';
      const time = this.cacheDate.toLocaleTimeString().slice(0, 5);
      return `(кэш ${time})`;
    },
    random_account(){
      for(let port of (this.responses.ports||[])){
        let account=(port.subscriber_list||[]).find(abon=>abon.account)?.account;
        if(account){return account};
      };
    },
    serverid(){
      if(!this.random_account){return};//30700130181 - single/30701063148 - list
      return this.responses.abon?.lbsv?.data?.serverid||this.responses.abon?.lbsv?.data?.[0]?.serverid;
    },
    xRad_serverid(){//TODO переделать ВЕ для фильтра по region_id коммутатора и площадки
      return [
        1,2,3,6,1001,8,9,10,13,14,15,34,35,47,51,52,
        65,70,78,82,83,88,90,92,111,115,116,117,131,
        134,241,133,1004,64,103,108,137,234,101,120,
        121,124,126,127,27,31,109,110,128,129,130,255
      ].includes(parseInt(this.serverid));
    },
    xRad_region_id(){
      return [
        22,28,29,30,33,34,35,91,93,37,40,41,42,43,23,
        24,46,77,52,53,54,55,56,57,58,59,25,2,3,12,14,
        16,18,61,64,66,67,26,68,69,71,72,73,27,86,89,76
      ].includes(this.device.region.id);
    },
  },
  methods:{
    updateLinksOnPortsCellBase(){
      if(this.showDetailed){return};
      if(!this.$refs.PortsMapContent){return};
      this.getStatuses();
    },
    async getAbon(){
      if(!this.xRad_region_id){return};
      if(this.loading.abon){return};
      if(!this.random_account){return};
      if(this.responses.abon){return};
      this.responses.abon=null;
      this.loading.abon=true;
      const cache=this.$cache.getItem(`search_ma:account/${this.random_account}`);
      if(cache&&cache.data){
        this.responses.abon=cache.data;
      }else{
        let response=await httpGet(buildUrl('search_ma',{pattern:this.random_account},'/call/v1/search/'));
        if(response.data){
          this.$cache.setItem(`search_ma:account/${this.random_account}`,response);
          this.responses.abon=response.data;
        };
      };
      this.loading.abon = false;
    },
    async getSessions(){
      if(!this.xRad_region_id){return};//if(!this.device.xrad){return};
      const {device:{name},serverid}=this;
      if(!serverid){return};
      if(this.loading.sessions){return};
      this.responses.sessions=[];
      this.loading.sessions=true;
      try{
        const response=await httpGet(buildUrl('device_sessions',{name,serverid},'/call/v1/device/'));
        if(Array.isArray(response)){
          this.responses.sessions = response;
        };
      }catch(error){
        console.warn('device_sessions.error',error);
      };
      this.loading.sessions = false;
    },
    setDetailedType(type) {
      this.detailedType = type.data;
    },
    async getDevicePorts() {
      if (this.loading.ports) return;
      this.loading.ports = true;
      const device = this.device.name;
      let response;
      try {
        response = await httpGet(buildUrl('device_port_list', { device }));
        this.cacheDate = null;
        const cache = { date: new Date(), response };
        if (Array.isArray(response) && response.length) {
          const CACHE_MINUTES = 60;
          this.$cache.setItem(`ports-map:device_port_list/${device}`, cache, CACHE_MINUTES);
          for(let port of response){//т.к структура идентичная сваливаем порты в кэш
            this.$cache.setItem(`port/PORT-${device}/${port.snmp_number}`,port);
          };
        }
      }catch(error){
        console.warn('device_port_list.error',error);
      };
      this.loading.ports = false;
      this.responses.ports = response || [];
      this.getNeighbors();
    },
    getNeighbors(){//TODO добавить в ответ /call/device/port_info атрибуты запроса
      /*Promise.allSettled([
        ...this.trunks.map(trunk=>{
          return httpGet()
        })
      ])*/
    },
    async getUnmountDevicePorts(device_name, device_id, region_id) {
      this.unmoutedPorts = true;
      this.showDetailed = false;
      this.loading.ports = true;
      const cache = this.$cache.getItem(`ports-map:unmounted_device_port_list/${device_name+'/'+device_id}`);
      if (cache) {
        this.responses.ports = cache
        this.loading.ports = false;
        return;
      }
      try{
        const response = await httpGet(buildUrl('get_history_conn_point_list',{device_id,region_id},'/call/v1/device/'));
        this.responses.ports = response || [];
        this.$cache.setItem(`ports-map:unmounted_device_port_list/${device_name+'/'+device_id}`, response);
      }catch(e){
        console.warn('get_history_conn_point_list.error',e)
      }
      this.loading.ports = false;
    },
    async getStatuses(withCabel = false) {
      if (!this.showCabelTest) this.showCabelTest = withCabel;
      const add = withCabel ? 'cable' : 'speed';
      this.loading['statuses_' + add] = true;
      const params = {
        devices: [{ DEVICE_NAME: this.device.name }],
        add
      };
      this.responses.statuses=[];
      let response;
      try{
        response = await httpPost('/call/hdm/port_statuses', params);
        this.cacheDate = null;
        const cache = { date: new Date(), response };
        this.$cache.setItem(`ports-map:port_statuses/${params.add}/${this.device.name}`, cache);
      }catch(error){
        console.warn('port_statuses.error',error);
      };
      this.loading['statuses_' + add] = false;
      let port_statuses = response&&response[this.device.name]&&response[this.device.name].ports||[];
      if(Array.isArray(port_statuses)){
        this.responses.statuses=port_statuses;
      }else{
        this.responses.statuses=this.responses.statuses.map(port=>{
          return {iface:port.iface};//error
        });
      };
    },
    async getLoopback() {
      this.loading.loopback = true;
      let response;
      try {
        const params = {
          MR_ID: this.device.region.mr_id,
          IP_ADDRESS: this.device.ip,
          SYSTEM_OBJECT_ID: this.device.system_object_id,
          VENDOR: this.device.vendor,
          FIRMWARE: '',//this.device.firmware
          FIRMWARE_REVISION: '',//this.device.firmware_revision
          PATCH_VERSION: '',//this.device.patch_version
        };
        response = await httpPost('/call/hdm/ports_info_loopback', { device: params });
        this.cacheDate = null;
        const cache = { date: new Date(), response };
        this.$cache.setItem(`ports-map:ports_info_loopback/${this.device.name}`, cache);
      } catch (error) {
        console.error('Load loopback:', error);
      }
      this.loading.loopback = false;
      this.responses.loopback = response;
    },
    async getErrors() {
      const PortsMapContent = this.$refs.PortsMapContent;
      if (!PortsMapContent) return;
      this.loading.errors = true;
      const newCache = await PortsMapContent.getErrors();
      this.loading.errors = false;
      if(newCache){
        this.responses.errors = newCache;
        this.cacheDate = null;
        const cache = { date: new Date(), response: newCache };
        this.$cache.setItem(`ports-map:errors/${this.device.name}`, cache);
      }
    },
    async refresh() {
      this.cacheDate = null;
      localStorage.clear();
      await this.getDevicePorts();
      this.getLoopback();
      this.getStatuses();
      this.getErrors();
    },
    loadCache() {
      this.unmoutedPorts = false;
      let cache = null;
      const deviceName = this.device.name;
      const replaceCacheDate = date => {
        const newDate = new Date(date);
        if (!this.cacheDate || newDate < this.cacheDate) {
          this.cacheDate = newDate;
        }
      }
      // Ports
      cache = this.$cache.getItem(`ports-map:device_port_list/${deviceName}`);
      if (cache) {
        this.responses.ports = cache.response||[];
        replaceCacheDate(cache.date);
      }
      // Statuses
      cache = this.$cache.getItem(`ports-map:port_statuses/cable/${deviceName}`);
      if (cache) this.showCabelTest = true;
      if (!cache) cache = this.$cache.getItem(`ports-map:port_statuses/speed/${deviceName}`);
      if (cache) {
        this.responses.statuses = cache.response[deviceName].ports||[];
        replaceCacheDate(cache.date);
      }
      // Loopback
      cache = this.$cache.getItem(`ports-map:ports_info_loopback/${deviceName}`);
      if (cache) {
        this.responses.loopback = cache.response||[];
        replaceCacheDate(cache.date);
      }
      // Errors
      cache = this.$cache.getItem(`ports-map:errors/${deviceName}`);
      if (cache) {
        this.responses.errors = cache.response||[];
        replaceCacheDate(cache.date);
      }
      this.cacheLoaded = true;
      // Show detailed map
      // const { statuses, loopback, errors } = this.responses;
      // if (statuses.length || loopback.length || Object.keys(errors).length) {
      //   this.showDetailed = true;
      // }
    },
    updatePortStatus(port_status){
      if(!port_status?.iface){return};
      this.responses.statuses=[
        ...this.responses.statuses.filter(port=>port.iface!==port_status.iface),
        port_status
      ];
      let new_cache={
        date: new Date(),
        response:{
          [this.device.name]:{
            ip:this.device.ip,
            message:'updatePortStatus',
            name:this.device.name,
            ports:this.responses.statuses,
          }
        }
      };
      this.$cache.setItem(`ports-map:port_statuses/speed/${this.device.name}`,new_cache);
    },
  },
});

//after 09.03.23
Vue.component('PortsMap_090323',{
  template:`<CardBlock name="PortsMap" class="ports-map">
    <title-main :text="title">
      <button-sq :icon="loading.statuses_speed||loading.statuses_cable?'loading rotating':'refresh'" v-if="!unmoutedPorts&&!showDetailed" @click="updateLinksOnPortsCellBase"/>
    </title-main>
    <message-el v-if="ports && !ports.length" text="Порты не найдены" type="warn" box class="my-16" />
    <loader-bootstrap v-if="loading.ports" text="получение портов"/>
    <template v-else-if="ports.length">
      <div class="d-center-x pl-16 pr-8">
        <span class="font--15-500" :class="unmoutedPorts?'tone-500':'tone-900'">Подробная информация</span>
        <div class="ml-auto d-flex-x">
          <button-sq v-if="loading.statuses_speed||loading.statuses_cable||loading.loopback||loading.errors" icon="loading rotating" type="medium"/>
          <switch-el v-model="showDetailed" :disabled="loading.errors||unmoutedPorts"/>
        </div>
      </div>
      <div class="d-center-x pl-16 pr-8" v-if="!unmoutedPorts&&!showDetailed&&xRad_region_id">
        <span class="font--15-500" :class="(!random_account||loading.abon||!serverid)?'tone-500':'tone-900'">Активные сессии(xRad)</span>
        <div class="ml-auto d-flex-x">
          <button-sq v-if="loading.sessions" icon="loading rotating" type="medium"/>
          <switch-el v-model="showSessions" :disabled="!random_account||loading.abon||!serverid||loading.sessions||!xRad_serverid"/>
        </div>
      </div>
      <ports-map-actions v-if="showDetailed&&!loading.ports" :loading="loading" @refresh="refresh" @getStatuses="getStatuses" @getLoopback="getLoopback" @getErrors="getErrors"/>
      <PortsMapContent ref="PortsMapContent" :networkElement="device" :ports="ports" loading_statuses="loading.statuses_speed" :isUnmount="unmoutedPorts" :errors="responses.errors" :loading="loading" :showDetailed="showDetailed" :showCabelTest="showCabelTest" :showSessions="showSessions" @setDetailedType="setDetailedType" @on-port-status="updatePortStatus"/>
      
			<PortsMapLogs v-if="!unmoutedPorts" :networkElement="device" :ports="unmoutedPorts?[]:ports" class="margin-bottom-8px"/>
			
			<ports-map-legend :showSessions="showSessions" :showDetailed="showDetailed" :detailedType="detailedType" :ports="ports"/>
    </template>
    <dismantled-devices v-if="!noDismantled" :device="device" @get:unmouted-ports="getUnmountDevicePorts" @get:ports="loadCache"/>
  </CardBlock>`,
  props:{
    device:{type: Object,required:true},
    noDismantled:{type:Boolean,default:false}
  },
  data:()=>({
    responses:{
      ports:null,
      statuses:[],
      loopback:[],
      errors:{},//by port.name
      sessions:[],
      abon:null,
    },
    loading:{
      ports:false,
      statuses_speed:false,
      statuses_cable:false,
      loopback:false,
      errors:false,
      sessions:false,
      abon:false,
    },
    unmoutedPorts:false,
    showDetailed:false,
    showLegend:false,
    showCabelTest:false,
    cacheDate:null,
    cacheLoaded:false,
    detailedType:'cell',
    showSessions:false,
  }),
  async created(){
    this.loadCache();
    if(!this.responses.ports){await this.getDevicePorts()};
    if(!this.responses.statuses.length){await this.getStatuses()};
  },
  watch:{
    'device'(hasDevice){
      if(!hasDevice){return};
      if(!this.cacheLoaded){this.loadCache()};
      if(!this.responses.ports){this.getDevicePorts()};
      if(!this.responses.statuses.length){this.getStatuses()};
    },
    'showDetailed'(isShow){
      if(isShow&&!this.responses.statuses.length){this.getStatuses()};
    },
    'showSessions'(show){
      if(show&&!this.loading.sessions){this.getSessions()};
    },
    'random_account'(account){
      if(account&&!this.responses.abon&&!this.loading.abon){this.getAbon()};
    },
  },
  computed: {
    title() {
      return `Порты ${this.parsedCacheDate}`;
    },
    ports(){
      if(!this.responses.ports){return null};
      return this.responses.ports.map(port=>{
        const infoText=(['number','string'].includes(typeof port.flat)?String(port.flat):'').toLowerCase();
        return ({
          ...port,
          portStatus:this.responses.statuses.find(port_status=>port_status.iface===port.snmp_name),
          portLoopback:this.responses.loopback.find(loopback=>loopback.iface===port.snmp_name),
          infoText,
          infoClass: {
            'map-port__info': true,
            'map-port__info--move': Boolean(infoText),
            'map-port__info--border': Boolean(infoText),
            'map-port__info--new': infoText === 'new',
            'map-port__info--hub': infoText === 'hub',
            'map-port__info--bad': infoText === 'bad',
          },
          session:this.responses.sessions.find(session=>session.snmp_name===port.snmp_name),
        })
      })
    },
    trunks(){
      if(!this.responses.ports){return []};
      return this.responses.ports.filter(port=>port.state==='trunk busy')
    },
    parsedCacheDate() {
      if (!this.cacheDate) return '';
      const time = this.cacheDate.toLocaleTimeString().slice(0, 5);
      return `(кэш ${time})`;
    },
    random_account(){
      for(let port of (this.responses.ports||[])){
        let account=(port.subscriber_list||[]).find(abon=>abon.account)?.account;
        if(account){return account};
      };
    },
    serverid(){
      if(!this.random_account){return};//30700130181 - single/30701063148 - list
      return this.responses.abon?.lbsv?.data?.serverid||this.responses.abon?.lbsv?.data?.[0]?.serverid;
    },
    xRad_serverid(){//TODO переделать ВЕ для фильтра по region_id коммутатора и площадки
      return [
        1,2,3,6,1001,8,9,10,13,14,15,34,35,47,51,52,
        65,70,78,82,83,88,90,92,111,115,116,117,131,
        134,241,133,1004,64,103,108,137,234,101,120,
        121,124,126,127,27,31,109,110,128,129,130,255
      ].includes(parseInt(this.serverid));
    },
    xRad_region_id(){
      return [
        22,28,29,30,33,34,35,91,93,37,40,41,42,43,23,
        24,46,77,52,53,54,55,56,57,58,59,25,2,3,12,14,
        16,18,61,64,66,67,26,68,69,71,72,73,27,86,89,76
      ].includes(this.device.region.id);
    },
  },
  methods:{
    updateLinksOnPortsCellBase(){
      if(this.showDetailed){return};
      if(!this.$refs.PortsMapContent){return};
      this.getStatuses();
    },
    async getAbon(){
      if(!this.xRad_region_id){return};
      if(this.loading.abon){return};
      if(!this.random_account){return};
      if(this.responses.abon){return};
      this.responses.abon=null;
      this.loading.abon=true;
      const cache=this.$cache.getItem(`search_ma:account/${this.random_account}`);
      if(cache&&cache.data){
        this.responses.abon=cache.data;
      }else{
        let response=await httpGet(buildUrl('search_ma',{pattern:this.random_account},'/call/v1/search/'));
        if(response.data){
          this.$cache.setItem(`search_ma:account/${this.random_account}`,response);
          this.responses.abon=response.data;
        };
      };
      this.loading.abon = false;
    },
    async getSessions(){
      if(!this.xRad_region_id){return};//if(!this.device.xrad){return};
      const {device:{name},serverid}=this;
      if(!serverid){return};
      if(this.loading.sessions){return};
      this.responses.sessions=[];
      this.loading.sessions=true;
      try{
        const response=await httpGet(buildUrl('device_sessions',{name,serverid},'/call/v1/device/'));
        if(Array.isArray(response)){
          this.responses.sessions = response;
        };
      }catch(error){
        console.warn('device_sessions.error',error);
      };
      this.loading.sessions = false;
    },
    setDetailedType(type) {
      this.detailedType = type.data;
    },
    async getDevicePorts() {
      if (this.loading.ports) return;
      this.loading.ports = true;
      const device = this.device.name;
      let response;
      try {
        response = await httpGet(buildUrl('device_port_list', { device }));
        this.cacheDate = null;
        const cache = { date: new Date(), response };
        if (Array.isArray(response) && response.length) {
          const CACHE_MINUTES = 60;
          this.$cache.setItem(`ports-map:device_port_list/${device}`, cache, CACHE_MINUTES);
          for(let port of response){//т.к структура идентичная сваливаем порты в кэш
            this.$cache.setItem(`port/PORT-${device}/${port.snmp_number}`,port);
          };
        }
      }catch(error){
        console.warn('device_port_list.error',error);
      };
      this.loading.ports = false;
      this.responses.ports = response || [];
      this.getNeighbors();
    },
    getNeighbors(){//TODO добавить в ответ /call/device/port_info атрибуты запроса
      /*Promise.allSettled([
        ...this.trunks.map(trunk=>{
          return httpGet()
        })
      ])*/
    },
    async getUnmountDevicePorts(device_name, device_id, region_id) {
      this.unmoutedPorts = true;
      this.showDetailed = false;
      this.loading.ports = true;
      const cache = this.$cache.getItem(`ports-map:unmounted_device_port_list/${device_name+'/'+device_id}`);
      if (cache) {
        this.responses.ports = cache
        this.loading.ports = false;
        return;
      }
      try{
        const response = await httpGet(buildUrl('get_history_conn_point_list',{device_id,region_id},'/call/v1/device/'));
        this.responses.ports = response || [];
        this.$cache.setItem(`ports-map:unmounted_device_port_list/${device_name+'/'+device_id}`, response);
      }catch(e){
        console.warn('get_history_conn_point_list.error',e)
      }
      this.loading.ports = false;
    },
    async getStatuses(withCabel = false) {
      if (!this.showCabelTest) this.showCabelTest = withCabel;
      const add = withCabel ? 'cable' : 'speed';
      this.loading['statuses_' + add] = true;
      const params = {
        devices: [{ DEVICE_NAME: this.device.name }],
        add
      };
      this.responses.statuses=[];
      let response;
      try{
        response = await httpPost('/call/hdm/port_statuses', params);
        this.cacheDate = null;
        const cache = { date: new Date(), response };
        this.$cache.setItem(`ports-map:port_statuses/${params.add}/${this.device.name}`, cache);
      }catch(error){
        console.warn('port_statuses.error',error);
      };
      this.loading['statuses_' + add] = false;
      let port_statuses = response&&response[this.device.name]&&response[this.device.name].ports||[];
      if(Array.isArray(port_statuses)){
        this.responses.statuses=port_statuses;
      }else{
        this.responses.statuses=this.responses.statuses.map(port=>{
          return {iface:port.iface};//error
        });
      };
    },
    async getLoopback() {
      this.loading.loopback = true;
      let response;
      try {
        const params = {
          MR_ID: this.device.region.mr_id,
          IP_ADDRESS: this.device.ip,
          SYSTEM_OBJECT_ID: this.device.system_object_id,
          VENDOR: this.device.vendor,
          FIRMWARE: '',//this.device.firmware
          FIRMWARE_REVISION: '',//this.device.firmware_revision
          PATCH_VERSION: '',//this.device.patch_version
        };
        response = await httpPost('/call/hdm/ports_info_loopback', { device: params });
        this.cacheDate = null;
        const cache = { date: new Date(), response };
        this.$cache.setItem(`ports-map:ports_info_loopback/${this.device.name}`, cache);
      } catch (error) {
        console.error('Load loopback:', error);
      }
      this.loading.loopback = false;
      this.responses.loopback = response;
    },
    async getErrors() {
      const PortsMapContent = this.$refs.PortsMapContent;
      if (!PortsMapContent) return;
      this.loading.errors = true;
      const newCache = await PortsMapContent.getErrors();
      this.loading.errors = false;
      if(newCache){
        this.responses.errors = newCache;
        this.cacheDate = null;
        const cache = { date: new Date(), response: newCache };
        this.$cache.setItem(`ports-map:errors/${this.device.name}`, cache);
      }
    },
    async refresh() {
      this.cacheDate = null;
      localStorage.clear();
      await this.getDevicePorts();
      this.getLoopback();
      this.getStatuses();
      this.getErrors();
    },
    loadCache() {
      this.unmoutedPorts = false;
      let cache = null;
      const deviceName = this.device.name;
      const replaceCacheDate = date => {
        const newDate = new Date(date);
        if (!this.cacheDate || newDate < this.cacheDate) {
          this.cacheDate = newDate;
        }
      }
      // Ports
      cache = this.$cache.getItem(`ports-map:device_port_list/${deviceName}`);
      if (cache) {
        this.responses.ports = cache.response||[];
        replaceCacheDate(cache.date);
      }
      // Statuses
      cache = this.$cache.getItem(`ports-map:port_statuses/cable/${deviceName}`);
      if (cache) this.showCabelTest = true;
      if (!cache) cache = this.$cache.getItem(`ports-map:port_statuses/speed/${deviceName}`);
      if (cache) {
        this.responses.statuses = cache.response[deviceName].ports||[];
        replaceCacheDate(cache.date);
      }
      // Loopback
      cache = this.$cache.getItem(`ports-map:ports_info_loopback/${deviceName}`);
      if (cache) {
        this.responses.loopback = cache.response||[];
        replaceCacheDate(cache.date);
      }
      // Errors
      cache = this.$cache.getItem(`ports-map:errors/${deviceName}`);
      if (cache) {
        this.responses.errors = cache.response||[];
        replaceCacheDate(cache.date);
      }
      this.cacheLoaded = true;
      // Show detailed map
      // const { statuses, loopback, errors } = this.responses;
      // if (statuses.length || loopback.length || Object.keys(errors).length) {
      //   this.showDetailed = true;
      // }
    },
    updatePortStatus(port_status){
      if(!port_status?.iface){return};
      this.responses.statuses=[
        ...this.responses.statuses.filter(port=>port.iface!==port_status.iface),
        port_status
      ];
      let new_cache={
        date: new Date(),
        response:{
          [this.device.name]:{
            ip:this.device.ip,
            message:'updatePortStatus',
            name:this.device.name,
            ports:this.responses.statuses,
          }
        }
      };
      this.$cache.setItem(`ports-map:port_statuses/speed/${this.device.name}`,new_cache);
    },
  },
});



Vue.component("PortsMapLogsPortLinkEventsChart",{
  template:`<div name="PortsMapLogsPortLinkEventsChart">
    <div class="display-flex align-items-center justify-content-space-between">
      <span class="font--12-400">{{port.snmp_name||''}}</span>
      <span class="font--12-400">{{linkDownCounterText||''}}</span>
    </div>
    <div class="display-flex align-items-center flex-direction-row-reverse" style="background:#a9a9a938">
      <div v-for="(ev,index) of events" :key="index" :style="getStyle(ev,index)" class="min-height-20px"></div>
    </div>
  </div>`,
  props:{
    events:{type:Array,default:()=>[]},
    dateMax:{type:Object,default:null},
    dateMin:{type:Object,default:null},
    port:{type:Object,default:()=>({})},
  },
  data:()=>({}),
  computed:{
    total(){
      const {dateMin,dateMax}=this;
      if(!dateMin||!dateMax){return 0};
      return dateMax.time-dateMin.time;
    },
    countLinkDown(){return this.events.filter(({state})=>!state).length},
    linkDownCounterText(){
      if(!this.countLinkDown){return};
      return [
        `${this.countLinkDown} ${plural(['падение','падения','падений'],this.countLinkDown)} линка`,
      ].join(' ');
    },
  },
  methods:{
    getDurationDays(ms){
      ms=ms/1000;
      const days=Math.floor(ms/60/60/24);
      const hours=Math.floor(ms/60/60)-(days*24);
      const minutes=Math.floor(ms/60)-(hours*60)-(days*24*60);
      return [days,hours,minutes];
    },
    getStyle(ev,index=0){
      if(!this.total){return};
      const prev=this.events[index-1];
      const percent=prev?Math.floor((prev.time-ev.time)*99/this.total)||1:0
      return {
        width:!prev?`1%`:`${percent}%`,
        background:ev.state?'#228b224d':'#778899'
      };
    }
  }
});

Vue.component("PortsMapLogs",{
  template:`<section name="PortsMapLogs">
    <link-block :actionIcon="open?'down':'up'" icon="log" text="Логи портов" :textSub="titleText" textSubClass="tone-500 font--12-400" type="large" @block-click="open=!open"/>
    <div v-show="open" class="margin-left-right-16px">
      <loader-bootstrap v-if="loading" text="получение логов с коммутатора"/>
      <message-el v-else-if="error" text="Ошибка получения данных" :subText="error" box type="warn"/>
      <template v-else>
        <div class="display-flex flex-direction-column gap-1px">
          <template v-for="(portEvents,portId,index) in portsEvents.events">
            <devider-line v-if="index" m="unset"/>
            <PortsMapLogsPortLinkEventsChart :key="portId" :events="portEvents.events" :port="portEvents.port" :dateMax="portsEvents.dateMax" :dateMin="portsEvents.dateMin"/>
          </template>
        </div>
        <div class="display-flex align-items-center justify-content-space-between">
          <span class="font--12-400">{{portsEvents.dateMin?.formatted}}</span>
          <span class="font--12-400" v-if="portsEvents.dateMin?.formatted&&portsEvents.dateMax?.formatted" arrow>⟹</span>
          <span class="font--12-400">{{portsEvents.dateMax?.formatted}}</span>
        </div>
      </template>
    </div>
  </section>`,
  props:{
    networkElement:{type:Object,default:()=>({}),required:true},
    ports:{type:Array,default:()=>([]),required:true},
  },
  data:()=>({
    open:false,
    loading:false,
    error:'',
    log:[],
    portsLogs:{},
  }),
  computed:{
    vendorLinkRegexp(){//IFNET
      switch(this.networkElement.vendor){
        case 'D-LINK':return {
          linkup_regexp:/link up/i,
          linkdn_regexp:/link down/i,
        };
        case 'EDGE-CORE':return {
          linkup_regexp:/link-up/i,
          linkdn_regexp:/link-down/i,
        };
        case 'FIBERHOME':return {
          linkup_regexp:/LinkUP|OperStatus=\[up\]/i,
          linkdn_regexp:/LinkDown|OperStatus=\[down\]/i,
        };
        case 'HUAWEI':return {
          linkup_regexp:/into UP state/i,
          linkdn_regexp:/into DOWN state/i,
        };
        case 'H3C':return {
          linkup_regexp:/changed to up/i,
          linkdn_regexp:/changed to down/i,
        };
        default:return {
          linkup_regexp:/[^a-zA-Z0-9]up[^a-zA-Z0-9]/i,
          linkdn_regexp:/[^a-zA-Z0-9]down[^a-zA-Z0-9]/i,
        };
      };
    },
    vendorPortsRegexp(){
      return this.ports.map(port=>{
        return this.getVendorPortRegexp(port)
      })
    },
    portsEvents(){
      return Object.entries(this.portsLogs).reduce((portsEvents,[portId,portLogs])=>{
        if(!portLogs.length){return portsEvents};
        const portEvents=portLogs.reduce((portEvents,{logDate,logPort,portIsFinded,isLinkUp,isLinkDn})=>{
          if(portIsFinded&&logDate&&(isLinkUp||isLinkDn)){
            const {formatted,time}=logDate;
            portEvents.events.push({
              time,
              date:formatted,
              state:!!isLinkUp,
            });
            if(time>portsEvents.dateMax.time){
              portsEvents.dateMax=logDate;
            };
            if(!portsEvents.dateMin.time||time<portsEvents.dateMin.time){
              portsEvents.dateMin=logDate
            };
            portEvents.port=logPort.port;
          };
          return portEvents
        },{events:[],port:null});
        if(portEvents.events.length&&portEvents.port){
          portsEvents.events[portId]=portEvents;
        };
        return portsEvents
      },{events:{},dateMax:{time:0},dateMin:{time:0}})
    },
    titleText(){
      const {dateMax:{time:timeMax},dateMin:{time:timeMin}}=this.portsEvents;
      if(!timeMax||!timeMin){return};
      const ms=(timeMax-timeMin)/1000;
      const days=Math.floor(ms/60/60/24);
      const hours=Math.floor(ms/60/60)-(days*24);
      const minutes=Math.floor(ms/60)-(hours*60)-(days*24*60);
      const duration=[
        days?`${days} ${plural(['день','дня','дней'],days)}`:'',
        hours?`${hours} ${plural(['час','часа','часов'],hours)}`:'',
        minutes?`${minutes} ${plural(['мин.','мин.','мин.'],minutes)}`:'',
      ].filter(v=>v).join(' ');
      return [
        duration?`за`:'',
        duration
      ].filter(v=>v).join(' ');
    }
  },
  watch:{
    'log'(){
      this.portsLogs=this.log.reduce((ports,row,row_index)=>{
        const parsed={...this.parseRow(row),row_index};
        if(parsed.portIsFinded&&ports[parsed.logPort?.port?.snmp_number]){
          ports[parsed.logPort.port.snmp_number].push(parsed)
        };
        return ports;
      },this.ports.reduce((ports,port)=>({...ports,[port.snmp_number]:[]}),{}))
    },
    'open'(){
      if(this.open){
        this.refresh();
      }
    }
  },
  methods:{
    getVendorPortRegexp(port){
      if(['D-LINK','EDGE-CORE'].includes(this.networkElement.vendor)){
        const portText=`Port ${port.snmp_number}`;
        return {port,portText,regexp:new RegExp(`[^a-zA-Z]${portText}[^0-9]`,'i')};
      }else{
        const portText=`${port.snmp_name}`;//FiberHome, Huawei, H3C
        return {port,portText,regexp:new RegExp(`[^a-zA-Z]${portText}[^0-9]`)};
      }
    },
    parseLogPort(row=''){
      let parsed=null;
      for(const {port,portText,regexp} of this.vendorPortsRegexp){
        const _parsed=row.match(regexp)?.[0];
        if(_parsed){
          parsed={port,portText,regexp}
          break
        };
      };
      return parsed;
    },
    parseLogDate(row=''){
      let parsed='';
      for(const regexp of [
        /\d{2}:\d{2}:\d{2}\s\d{4}-\d{2}-\d{2}/,//750] 17:27:39 2023-03-07 - Edge-Core
        /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}/,//438    Mar  6 10:21:17:LinkStatus-6 - D-Link 1210 (no y, parsed as 2001)
        /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/,//58318 2023-02-23 15:21:48 - D-Link 3200
        /\d{4}\/\d{2}\/\d{2}\s\s\d{2}:\d{2}:\d{2}/,//2457   2023/03/08  14:43:24 - D-Link 3026
        /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}/,//2023/02/17 18:09:21 - FiberHome
        /\w{3}\s{1,2}\d{1,2}\s\d{4}\s\d{2}:\d{2}:\d{2}/,//Mar  7 2023 23:56:41+07:00 - Huawei 2328
        /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}:\d{3}\s\d{4}/,//%Mar  1 02:08:55:598 2013 - H3C
        /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}/,//Mar  7 20:11:58+03:00 - Huawei 5300 (no y, parsed as 2001)
      ]){
        parsed=row.match(regexp)?.[0];
        if(parsed){break};
      };
      const time=Date.parse(parsed)
      const date=new Date(time);
      if(!date||date=='Invalid Date'){return}
      const formatted=[
        date.toLocaleDateString('ru',{year:'2-digit',month:'2-digit',day:'2-digit'}),
        date.toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
      ].join(' '); 
      return {parsed,time,date,formatted};
    },
    parseRow(row){
      const bgPort='#4682b4';//steelblue
      const cText='#f0f8ff';//aliceblue
      const bgLinkUp='#228b22';//forestgreen
      const bgLinkDn='#778899';//lightslategray
      const bgDate='#5f9ea0';//cadetblue
      let logDate=null;
      let logPort=null;
      let portIsFinded=false;
      let isLinkUp=false;
      let isLinkDn=false;
      
      const texts=[];
      
      logDate=this.parseLogDate(row)||null;
      let _texts_date_around=!logDate?.date?[row]:` ${row}`.split(logDate.parsed);
      let _texts_after_date=[];
      if(_texts_date_around.length>=2&&logDate?.formatted){
        const [text0_before_date,...__texts_after_date]=_texts_date_around;
        _texts_after_date=__texts_after_date;
        texts.push(...[
          /*{text:text0_before_date},*/
          {
            text:logDate.formatted,
            style:{
              'background-color':bgDate,
              'color':cText,
            }
          },
        ]);
      }else{
        _texts_after_date=_texts_date_around;
      };
      
      logPort=this.parseLogPort(row)||null;
      
      const _texts_port_around=!logPort?.port?_texts_after_date:`${_texts_after_date.join(' ')}  `.split(logPort.regexp);
      let _texts_after_port=[];
      portIsFinded=false;
      if(_texts_port_around.length>=2&&logPort?.port){
        const [text0_before_port,...__texts_after_port]=_texts_port_around;
        _texts_after_port=__texts_after_port;
        texts.push(...[
          {text:text0_before_port},
          {
            text:logPort.portText,
            style:{
              'background-color':bgPort,
              'color':cText,
            }
          },
        ]);
        portIsFinded=true;
      }else{
        _texts_after_port=_texts_port_around;
      };
      
      const {linkup_regexp,linkdn_regexp}=this.vendorLinkRegexp;
      const _row_after_port=_texts_after_port.join('');
      const _texts_linkup_around=_row_after_port.split(linkup_regexp);
      const _texts_linkdn_around=_row_after_port.split(linkdn_regexp);
      isLinkUp=_texts_linkup_around.length>=2;
      isLinkDn=_texts_linkdn_around.length>=2;
      const _texts_link_around=isLinkUp?_texts_linkup_around:isLinkDn?_texts_linkdn_around:_texts_after_port;
      const [text0_before_link,..._texts_after_link]=_texts_link_around;
      if(isLinkUp||isLinkDn){
        texts.push(...[
          {text:text0_before_link},
          {
            text:isLinkUp?'LinkUp':'LinkDown',
            style:{
              'background-color':isLinkUp?bgLinkUp:bgLinkDn,
              'color':cText,
            }
          },
          ..._texts_after_link.map(text=>text.split(' ').filter(v=>v).map(text=>({text}))).flat(),
        ]);
      }else{
        isLinkUp=false;
        isLinkDn=false;
        texts.push(..._texts_after_port.map(text=>text.split(' ').filter(v=>v).map(text=>({text}))).flat())
      };
      
      return {row,texts,logDate,portIsFinded,isLinkUp,isLinkDn,logPort}
    },
    refresh(){
      this.getLogShort();
    },
    async getLogShort(){
      this.loading=true;
      this.error="";
      this.log=[];
      try{
        const response=await httpPost(buildUrl('log_short',objectToQuery({
          mr_id:this.networkElement.region.mr_id,
          ip:this.networkElement.ip,
        }),'/call/hdm/'),{
          port:{},//required
          device:{
            MR_ID:this.networkElement.region.mr_id,
            IP_ADDRESS:this.networkElement.ip,
            SYSTEM_OBJECT_ID:this.networkElement.system_object_id,
            VENDOR:this.networkElement.vendor,
            DEVICE_NAME:this.networkElement.name,
            FIRMWARE:this.networkElement.firmware,
            FIRMWARE_REVISION:this.networkElement.firmware_revision,
            PATCH_VERSION:this.networkElement.patch_version,
            //name:this.networkElement.name
          }
        });
        if(response.message==="OK"&&Array.isArray(response.text)){
          if(this.networkElement.vendor=='H3C'){//temp, need reverse
            this.log=response.text.reverse();
          }else{
            this.log=response.text;
          };
        }else if(response.error){
          this.error=response.text;
        }
      }catch(error){
        this.error='unexpected';
        console.warn("log_short.error",error)
      };
      this.loading=false;
    },
  },
});





















