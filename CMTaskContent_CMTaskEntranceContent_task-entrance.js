Vue.component('CMTaskContent', {
  template:`<div class="display-flex flex-direction-column gap-8px">
    <TaskNavbar ref="TaskNavbar" :navItems="tabs" :activeTab="activeTab"  @set:tab="activeTab = $event"  @scroll-content="scrollTo" class="padding-left-right-8px"/>
    <div class="task-tabs" ref="TaskTabs" @scroll="onScroll">
      <div v-for="({is, name}, key) of tabs" :key="key" class="task-tabs__tab">
        <component v-bind="{
          is,
          isActiveTab: activeTab.name === name}"/>
      </div>
    </div>
  </div>`,
  data: () => ({
    activeTab: null,
  }),
  created(){
    this.activeTab = this.tabs[0]
  },
  mounted(){
    this.$refs.TaskNavbar.selectItem(this.tabs[this.taskTabIndex] || this.activeTab);
    this.setTabIndex(this.activeTabIndex);
  },
  watch: {
    'activeTabIndex'(activeTabIndex){
      this.setTabIndex(activeTabIndex);
    }
  },
  computed:{
    activeTabIndex(){
      const {activeTab} = this;
      return this.tabs.findIndex(({name}) => name === activeTab?.name);
    },
    ...mapGetters('cm', [
      'task',
      'siteID',
      'taskLoading',
      'taskAllowSiteMaintenance',
    ]),
    ...mapGetters('cm/Task', [
      'taskTabIndex',
      //'taskTabs'
    ]),
    account(){return this.task.client.account},
    netObjectName(){return this.task.netObjectName},
    tabs(){
      const {account, netObjectName, siteID, taskAllowSiteMaintenance} = this;
      return [
        new TASK.Tab('CMTaskInfo', 'Данные наряда'),
        ...taskAllowSiteMaintenance ? [
          new TASK.Tab('CMTaskSiteMaintenance', 'ТО'),
        ] : [],
        ...WFM.isValidAccount(account) ? [
          new TASK.Tab('CMTaskAccount', 'Абонент'),
          new TASK.Tab('CMTaskAccountPort', 'Порт'),
          new TASK.Tab('CMTaskFindPort', 'Поиск порта')
        ] : [],
        ...netObjectName ? [
          new TASK.Tab('CMTaskNetworkElement', 'СЭ')
        ] : [],
        ...siteID ? [
          new TASK.Tab('CMTaskEntrance', 'Подъезд'),
          new TASK.Tab('CMTaskSiteDrs', 'Схема ДРС'),
          new TASK.Tab('CMTaskSiteDevices', 'Устройства'),
        ] : [],
      ];
    },
  },
  methods:{
    ...mapActions('cm/Task', ['setTabIndex']),
    onScroll(e){
      const scrollLeft=Math.floor(e.srcElement.scrollLeft);
      if(!this.$refs.TaskTabs || !this.$refs.TaskNavbar){return};
      this.activeTab = this.tabs[Math.round(scrollLeft / this.$refs.TaskTabs.offsetWidth)];
      if(this.$refs.TaskNavbar.navLocked){return};
      this.$refs.TaskNavbar.scrollTo({
        left: (scrollLeft / this.$refs.TaskTabs.offsetWidth) * TASK_NAV_ITEM_WIDTH,
      });
    },
    scrollTo(index = 0){
      if(!this.$refs.TaskTabs){return};
      this.$refs.TaskTabs.scroll({
        left: index * this.$refs.TaskTabs.offsetWidth,
        behavior: 'smooth',
      });
      setTimeout(() => {
        if(this.$refs.TaskNavbar){
          this.$refs.TaskNavbar.navLocked = false;
        };
      }, TASK.TABS_SCROLL_TIMEOUT);
    },
    ...mapActions({
      setSiteId: 'nioss/site/setSiteId',
    }),
  },
  beforeDestroy(){
    this.setSiteId();
  }
});

Vue.component('CMTaskEntranceContent',{//временно костыль через entrance-content (аналог task-entrance), переделать по готовности окружения
  template:`<div class="display-flex flex-direction-column gap-8px">
    <loader-bootstrap v-if="loadingSome" text="загрузка данных адреса"/>
    <template v-else>
      <entrance-content v-if="entrance&&site"
        v-bind="{
          entrance,
          site,
          loading:loads,
          entrances,
          devices,
          racks,
          plints,
          floors,
          flats:{...flatsInRange,...outOfNiossRangeFlats},
          ports
        }" 
        @load:floors="getFloors"
        @load:entrances="getEntrances"
        @load:racks="getRacks"
        @load:plints="getPlints"
      />
      
      <template v-else-if="entrances.length&&site">
        <CardBlock v-for="entrance of entrances" :key="entrance.id">
          <title-main :text="getEntranceTitle(entrance)" :opened="openedEntrance === entrance.id"  @open="toggleOpened(entrance.id)"/>
          <entrance-content v-show="openedEntrance === entrance.id"
            v-bind="{
              entrance,
              site,
              loading:loads,
              entrances,
              devices,
              racks,
              plints,
              floors,
              flats:{...flatsInRange,...outOfNiossRangeFlats},
              ports
            }" 
            @load:floors="getFloors"
            @load:entrances="getEntrances"
            @load:racks="getRacks"
            @load:plints="getPlints"
            class="margin-top-8px"
          />
        </CardBlock>
      </template>
      
      <entrance-flats-alon v-if="showAloneFlats" v-bind="{
        devices,
        siteProp:site,
        flats:outOfNiossRangeFlatsSorted,
      }"/>
    </template>
  </div>`,
  props:{
    siteID:{type:String,default:'',required:true},
    flatNum:{type:Number,default:0,required:true},
  },
  data:()=>({
    site:null,
    entrances:[],
    floors:[],
    flats:[],
    ports:[],
    plints:[],
    devices:[],
    racks:[],
    loads:{
      site:!1,
      entrances:!1,
      ports:!1,
      floors:!1,
      flats:!1,
      devices:!1,
      plints:!1,
      racks:!1,
    },
    entrance:null,
    openedEntrance:'',
  }),
  watch:{
    'loadingSome'(loadingSome){
      this.$emit('onLoading',loadingSome);
    },
    'allLoaded'(allLoaded){//изолировано
      // const {site,entrances,entrance,floors,flats,ports,plints,devices,racks}=this;
      // const contentData={site,entrances,entrance,floors,flats,ports,plints,devices,racks};
      // this.$emit('onContent',!allLoaded?Object.fromEntries(Object.keys(contentData).map(key=>[key,null])):contentData);
    },
  },
  computed:{
    loadingSome(){
      const {site,entrances,floors,devices,flats,plints,racks}=this.loads;
      return [site,entrances,floors,devices,flats,...!this.entrance?[plints,racks]:[]].some(Boolean);
    },
    allLoaded(){
      return [
        Boolean(this.site),
        Boolean(this.entrances),
        Boolean(this.devices),
        Boolean(this.floors),
        Boolean(this.entrance ? true : this.racks),
        Boolean(this.entrance ? true : this.plints),
      ].every(Boolean);
    },
    showAloneFlats(){
      return !this.entrances.length&&!this.entrance&&this.site&&this.outOfNiossRangeFlatsSorted.length;
    },
    flatsInRange(){
      return this.floors.reduce((flatsInRange,entrance)=>{
        for(let floor of entrance.floor||[]){//9135155037713593629 кривой подъезд
          for(let flat of floor.flats){
            flatsInRange[flat.number]={
              ...flat,
              floor:{
                number:floor.number
              }
            };
          };
        };
        return flatsInRange
      },{});
    },
    outOfNiossRangeFlats(){
      const {flatsInRange}=this;
      return this.flats.reduce((flats,flat)=>{
        if(!flatsInRange[flat.number]){
          flats[flat.number]=flat;
        };
        return flats
      },{});
    },
    outOfNiossRangeFlatsSorted(){
      const {outOfNiossRangeFlats}=this;
      return Object.keys(outOfNiossRangeFlats).map(number=>outOfNiossRangeFlats[number]).sort((a,b)=>parseInt(a.number)-parseInt(b.number))
    },
  },
  methods:{
    getEntranceTitle(entrance){
      return `Подъезд №${entrance.number} • кв. ${entrance.flats.range}`
    },
    toggleOpened(entr) {
      this.openedEntrance = this.openedEntrance === entr ? '' : entr;
    },
    async loadAllData(){
      await Promise.allSettled([
        this.getSite(),
        this.getDevices(),
        this.getFloors(),
        this.getFlats(),
        this.getEntrances(),
        this.getEntrancesPorts(),
        this.getRacks(),
        this.getPlints(),
      ]);
    },
    async getSite(){
      if(this.loads.site){return};
      this.loads.site=!0;
      try{
        const response = await SearchService.searchMa(this.siteID);
        if(response?.data?.data){
          this.site=NIOSS.selectNodeDuAsSite(response.data.data)
        };
      }catch(error) {
        console.warn('getSite.error',error);
      };
      this.loads.site=!1;
    },
    async getDevices(){
      if(this.loads.devices){return};
      this.loads.devices=!0;
      try{
        const response = await DeviceService.SiteDevices.useCache(this.siteID);
        if(Array.isArray(response?.data)){
          this.devices = response.data;
        };
      }catch(error) {
        console.warn('getDevices.error',error);
      };
      this.loads.devices=!1;
    },
    async getEntrancesPorts(){
      if(this.loads.ports){return};
      this.loads.ports=!0;
      try{
        const response = await DeviceService.SiteEntrancesPorts.useCache(this.siteID);
        if(Array.isArray(response?.data)){
          this.ports = response.data;
        };
      }catch(error) {
        console.warn('getEntrancesPorts.error',error);
      };
      this.loads.ports=!1;
    },
    async getFloors(){
      if(this.loads.floors){return};
      this.loads.floors=!0;
      try{
        const response = await DeviceService.SiteEntrancesFlats.useCache(this.siteID);
        if(Array.isArray(response?.data)){
          this.floors = response.data;
        };
      }catch(error) {
        console.warn('getFloors.error',error);
      };
      this.loads.floors=!1;
    },
    async getFlats(){
      if(this.loads.flats){return};
      this.loads.flats=!0;
      try{
        const response = await DeviceService.SiteFlats.useCache(this.siteID);
        if(Array.isArray(response?.data)){
          this.flats = response.data;
        };
      }catch(error) {
        console.warn('getFlats.error',error);
      };
      this.loads.flats=!1;
    },
    async getEntrances(){
      if(this.loads.entrances){return};
      this.loads.entrances=!0;
      try{
        const response = await DeviceService.SiteEntrances.useCache(this.siteID);
        if(Array.isArray(response?.data)){
          this.entrances = response.data;
          this.selectEntrance();
        };
      }catch(error) {
        console.warn('getEntrances.error',error);
      };
      this.loads.entrances=!1;
    },
    selectEntrance(){
      const {flatNum,entrances}=this;
      this.entrance=entrances.find(entrance=>flatNum>=entrance.flats.from&&flatNum<=entrance.flats.to);
    },
    async getRacks(){
      if(this.loads.racks){return};
      this.loads.racks=!0;
      try{
        const response = await DeviceService.SiteRacks.useCache(this.siteID);
        if(Array.isArray(response?.data)){
          this.racks = response.data;
        };
      }catch(error) {
        console.warn('getRacks.error',error);
      };
      this.loads.racks=!1;
    },
    async getPlints(){
      if(this.loads.plints){return};
      this.loads.plints=!0;
      try{
        const response = await DeviceService.SitePatchPanels.useCache(this.siteID);
        if(Array.isArray(response?.data)){
          this.plints = response.data;
        };
      }catch(error) {
        console.warn('getPlints.error',error);
      };
      this.loads.plints=!1;
    },
  }
});
Vue.component('task-entrance',{//deprecated
  template:`<div>
    <loader-bootstrap v-if="loadingSome" text="загрузка данных подъезда"/>
    <template v-else>
      <entrance-content v-if="entrance&&site"
        v-bind="{
          entrance,
          site,
          loading,
          entrances,
          devices,
          racks,
          plints,
          floors,
          flats:{...flats,...outOfNiossRangeFlats},
          ports: responses.entrancesPorts
        }" 
        @load:floors="getFloors"
        @load:entrances="getEntrances"
        @load:racks="getRacks"
        @load:plints="getPlints"
      />
      <template v-else-if="entrances.length&&site">
        <CardBlock v-for="entrance of entrances" :key="entrance.id">
          <title-main :text="getEntranceTitle(entrance)" :opened="openedEntrance === entrance.id"  @open="toggleOpened(entrance.id)"/>
          <entrance-content v-show="openedEntrance === entrance.id"
            v-bind="{
              entrance,
              site,
              loading,
              entrances,
              devices,
              racks,
              plints,
              floors,
              flats:{...flats,...outOfNiossRangeFlats},
              ports: responses.entrancesPorts
            }" 
            @load:floors="getFloors"
            @load:entrances="getEntrances"
            @load:racks="getRacks"
            @load:plints="getPlints"
            class="margin-top-8px"
          />
        </CardBlock>
      </template>

      <entrance-flats-alon v-if="showAloneFlats" v-bind="{
        devices,
        siteProp:site,
        flats:outOfNiossRangeFlatsSorted,
      }"/>
    </template>
  </div>`,
  props:{
    task:{type:Object,required:true},
    isActiveTab:{type:Boolean,default:false},
  },
  data:()=>({
    site:null,
    entrances:[],
    entrance:null,
    floors:[],
    responses:{
      flats:[],
      entrancesPorts:[],
    },
    plints:[],
    devices:[],
    racks:[],
    loading:{
      site:false,
      entrances:false,
      entrancesPorts:false,
      floors:false,
      flats:false,
      devices:false,
      plints:false,
      racks:false,
    },
    openedEntrance:'',
    scrollTimeout:null,
  }),
  watch:{
    'isActiveTab'(isActiveTab){
      if(isActiveTab&&!this.loadingSome){
        this.scrollTimeout=setTimeout(()=>this.onActiveTabScrollEnd(),TASK.TABS_SCROLL_TIMEOUT);
      }else{
        clearTimeout(this.scrollTimeout);
      };
    },
    'entrance'(entrance){
      this.$emit('task-entrance',entrance);
    },
  },
  computed:{
    loadingSome(){
      let keys = ['site', 'entrances', 'floors', 'devices','flats'];
      if (!this.entrance) {
        keys = [...keys, 'plints', 'racks'];
      }
      return keys.some(key => this.loading[key]);
    },
    allLoaded(){
      return [
        Boolean(this.site),
        Boolean(this.entrances),
        Boolean(this.devices),
        Boolean(this.floors),
        Boolean(this.entrance ? true : this.racks),
        Boolean(this.entrance ? true : this.plints),
      ].every(v => v);
    },
    flat() {
      let i = this.task.AddressSiebel.search(/кв\./gi);
      if (i == -1) return 0;
      let flat = this.task.AddressSiebel.substring(i + 4).replace(/\D/g, '');
      return Number(flat);
    },
    showAloneFlats(){
      return !this.entrances.length&&!this.entrance&&this.site&&this.outOfNiossRangeFlatsSorted.length;
    },
    flats(){
      let flats={};
      for(let entrance of this.floors){//this.responses.floors
        for(let floor of entrance.floor||[]){//9135155037713593629 кривой подъезд
          for(let flat of floor.flats){
            flats[flat.number]={...flat,floor:{number:floor.number}};
          };
        };
      }
      return flats;
    },
    outOfNiossRangeFlats(){
      let flats={};
      for(let flat of this.responses.flats){
        if(!this.flats[flat.number]){
          flats[flat.number]=flat;
        };
      };
      return flats;
    },
    outOfNiossRangeFlatsSorted(){
      return Object.keys(this.outOfNiossRangeFlats).map(number=>this.outOfNiossRangeFlats[number]).sort((a,b)=>parseInt(a.number)-parseInt(b.number))
    },
  },
  methods: {
    getEntranceTitle(entrance){
      return `Подъезд №${entrance.number} • кв. ${entrance.flats.range}`
    },
    toggleOpened(entr) {
      this.openedEntrance = this.openedEntrance === entr ? '' : entr;
    },
    onActiveTabScrollEnd(){
      this.loadAllData();
    },
    async loadAllData(){
      this.getSite();
      this.getDevices();
      this.getFloors();
      this.getFlats();
      this.getEntrances();
      this.getEntrancesPorts();
      this.getRacks();
      this.getPlints();
    },
    async getSite(){
      if(this.loading.site){return};
      this.loading.site=true;
      try{
        const response = await SearchService.searchMa(this.task.siteid);
        if(response?.data?.data){
          this.site = NIOSS.selectNodeDuAsSite(response.data.data)
        };
      }catch(error) {
        console.warn('getSite.error',error);
      };
      this.loading.site=false;
    },
    async getDevices(){
      if(this.loading.devices){return};
      this.loading.devices=true;
      try{
        const response = await DeviceService.SiteDevices.useCache(this.task.siteid);
        if(Array.isArray(response?.data)){
          this.devices = response.data;
        };
      }catch(error) {
        console.warn('getDevices.error',error);
      };
      this.loading.devices=false;
    },
    async getEntrancesPorts(){
      if(this.loading.entrancesPorts){return};
      this.loading.entrancesPorts=true;
      try{
        const response = await DeviceService.SiteEntrancesPorts.useCache(this.task.siteid);
        if(Array.isArray(response?.data)){
          this.responses.entrancesPorts = response.data;
        };
      }catch(error) {
        console.warn('getEntrancesPorts.error',error);
      };
      this.loading.entrancesPorts=false;
    },
    async getFloors(){
      if(this.loading.floors){return};
      this.loading.floors=true;
      try{
        const response = await DeviceService.SiteEntrancesFlats.useCache(this.task.siteid);
        if(Array.isArray(response?.data)){
          this.floors = response.data;
        };
      }catch(error) {
        console.warn('getFloors.error',error);
      };
      this.loading.floors=false;
    },
    async getFlats(){
      if(this.loading.flats){return};
      this.loading.flats=true;
      try{
        const response = await DeviceService.SiteFlats.useCache(this.task.siteid);
        if(Array.isArray(response?.data)){
          this.responses.flats = response.data;
        };
      }catch(error) {
        console.warn('getFlats.error',error);
      };
      this.loading.flats=false;
    },
    async getEntrances(){
      if(this.loading.entrances){return};
      this.loading.entrances=true;
      try{
        const response = await DeviceService.SiteEntrances.useCache(this.task.siteid);
        if(Array.isArray(response?.data)){
          this.getEntrance(response.data);
        };
      }catch(error) {
        console.warn('getEntrances.error',error);
      };
      this.loading.entrances=false;
    },
    getEntrance(response){
      this.entrances=Array.isArray(response)?response:[];
      this.entrance=this.entrances.find(entrance=>this.flat>=entrance.flats.from&&this.flat<=entrance.flats.to);
    },
    async getRacks(){
      if(this.loading.racks){return};
      this.loading.racks=true;
      try{
        const response = await DeviceService.SiteRacks.useCache(this.task.siteid);
        if(Array.isArray(response?.data)){
          this.racks = response.data;
        };
      }catch(error) {
        console.warn('getRacks.error',error);
      };
      this.loading.racks = false;
    },
    async getPlints(){
      if(this.loading.plints){return};
      this.loading.plints=true;
      try{
        const response = await DeviceService.SitePatchPanels.useCache(this.task.siteid);
        if(Array.isArray(response?.data)){
          this.plints = response.data;
        };
      }catch(error) {
        console.warn('getPlints.error',error);
      };
      this.loading.plints=false;
    },
  },
  beforeDestroy(){
    clearTimeout(this.scrollTimeout);
  }
});

