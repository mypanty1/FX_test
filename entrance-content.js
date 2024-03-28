
Vue.component('entrance-content',{//todo
  template:`<section class="entrance-content">
    <transition name="screen" mode="out-in" appear>
      <div v-if="!showEvents" key="main">
        <template v-if="ready">
          <EntranceInfo v-bind="{
            entrance,
            site,
            nioss:resps.nioss
          }"
          @load:entrances="reloadEntrances"
          @get:nioss="get_nioss_object" />

          <CardBlock>
            <title-main  @block-click="toggleEvents" icon="accidents" text="Работы" :text2="eventsCount" text2Class="tone-500" :text3="activeEventsCount" text3Class="main-orange" :attention="activeEventsCount?'warn':null">
              <button-sq icon="right-link" class="pointer-events-none" />
            </title-main>
          </CardBlock>

          <entrance-devices v-bind="{
            entrance,
            site,
          }" />

          <entrance-floors v-bind="{
            loading,
            entrance,
            site,
            entrances,
            devices,
            plints,
            ports,
            floors:entranceFloors,
            flats,
            racks:entranceRacks,
          }"
          @load:floors="$emit('load:floors')"
          @load:racks="$emit('load:racks')"
          @load:plints="$emit('load:plints')" />

          <entrance-params v-bind="{
            entrance,
            nioss:resps.nioss
          }" @get:nioss="get_nioss_object" />

        </template>
        <loader-bootstrap v-else class="padding-top-bottom-16px" text="загрузка данных по подъезду"/>
      </div>

      <entrance-events v-else works-on="Работы в подъезде" key="events" v-bind="{
        loading:loading.events||loading.devices||loading.floors,
        events:resps.events
      }"
      @get:events="get_entrance_events"
      @toggle-events="toggleEvents" />

    </transition>
  </section>`,
  props:{
    site:{type:Object,required:true},
    entrance:{type:Object,required:true},
    loading:{type:Object,default:()=>({})},
    entrances:{type:Array,default:()=>([])},
    devices:{type:Array,default:()=>([])},
    plints:{type:Array,default:()=>([])},
    racks:{type:Array,default:()=>([])},
    floors:{type:Array,default:()=>([])},
    flats:{type:Object,default:()=>({})},
    ports:{type:Array,default:()=>([])},
  },
  data:()=>({
    showEvents:false,
    events:null,
    loads:{
      nioss:false,
      events:false,
    },
    resps:{
      nioss:null,
      events:null,
    },
    loadingEvents:false,
  }),
  async created(){
    //await this.get_nioss_object();
    //this.$emit('load:floors');
    //if(!this.floors.length){this.$emit('load:floors')};
    //if(this.readyForEvents){this.get_entrance_events()};
  },
  watch:{
    'readyForEvents'(isReady){
      //if(isReady){this.get_entrance_events()};
    },
    '$route'(){
      this.showEvents=false;
      this.$emit('toggle-nav',true);
    },
  },
  computed:{
    eventsCount(){ return this.resps.events?.length||0},
    activeEventsCount(){
      if(!this.resps.events?.length){return 0};
      return this.resps.events.filter(el=>el.active&&/(incident|accident)/gi.test(el.type)).length;
    },
    ready(){return Boolean(this.entrance&&this.site&&this.devices&&this.resps.nioss)},
    readyForEvents(){return Boolean(this.entranceDevices&&this.entranceFloors)},
    entranceFloors(){
      let entrance=this.floors.find(el=>el.id===this.entrance.id);
      return entrance?entrance.floor:[];
    },
    entranceRacks(){return this.racks.filter(rack=>rack.entrance.id==this.entrance.id)},
    entranceDevices(){return this.devices.filter(ne=>this.entrance.device_list.includes(ne.name))},
  },
  methods: {
    async get_nioss_object(){
      this.loads.nioss=true;
      try{
        const response=await httpGet(buildUrl('get_nioss_object',{object_id:this.entrance.id,cache:!0},'/call/nioss/'),true);
        this.resps.nioss=response||{};
        this.resps.nioss.id=this.entrance.id;
      }catch(error){
        console.warn('get_nioss_object.error',error)
      };
      this.loads.nioss=false;
    },
    async get_entrance_events(dates={from:'',to:''}){
      this.loads.events=true;
      const region_id=this.entrance.region.id;
      let response=await httpPost("/call/v1/device/entrance_history",{
        device_id_list:this.entranceDevices.map(({nioss_id})=>nioss_id),
        account_list:this.entranceFloors.reduce((arr,floor)=>{let accounts=[];for(let flat of floor.flats){for(let client of flat.subscribers){accounts.push(client.account);}};return [...arr, ...accounts];},[]),
        region_id,
        REGION_ID:region_id,//deprecated
        site_id:this.entrance.site_id,
        from: dates.from || Datetools.addDays(-30),
        to: new Date((dates.to || Datetools.now()).setHours(23, 59, 59, 999)),
      });
      if(response.type==='error') throw new Error(response.message);
      if(!response.length){response=[]};
      this.resps.events=response;
      this.loads.events=false;
    },
    reloadEntrances() {
      this.$cache.removeItem(`site_entrance_list/${this.entrance.site_id}`);
      this.$emit('load:entrances');
    },
    toggleEvents() {
      const newState = !this.showEvents;
      this.showEvents = newState;
      this.$emit('toggle-nav', !newState);
    }
  },
});
