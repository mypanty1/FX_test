//fix ppr entrance
Vue.component('CMTaskEntrance',{//временно костыль через CMTaskEntranceContent (аналог task-entrance), переделать по готовности окружения
  template:`<div class="display-flex flex-direction-column gap-8px">
    <div v-if="!siteID" class="white-block-100 padding-8px">
      <message-el text="в наряде отсутствует адрес" box type="warn"/>
    </div>
    <CMTaskEntranceContent v-else ref="CMTaskEntranceContent" v-bind="{siteID,flatNum}" @onLoading="loading=$event"/>
  </div>`,
  props:{
    isActiveTab:{type:Boolean,default:false},
  },
  data:()=>({
    scrollTimeout:null,
    loading:false,
  }),
  watch:{
    'isActiveTab'(isActiveTab){
      if (isActiveTab && !this.loading){
        this.onActiveTabScrollEnd();
      }else{
        clearTimeout(this.scrollTimeout);
      };
    },
  },
  computed:mapGetters('cm',[
    'flatNum',
    'siteID',
  ]),
  methods:{
    async onActiveTabScrollEnd(){
      if(!this.siteID||this.loading){return};
      this.loading=true;
      await this.$refs.CMTaskEntranceContent.loadAllData();
      this.loading=false;
    },
  },
  beforeDestroy(){
    clearTimeout(this.scrollTimeout);
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
        <div class="white-block-100" v-for="entrance of entrances" :key="entrance.id">
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
        </div>
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
