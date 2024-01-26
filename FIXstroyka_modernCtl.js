
delete ENGINEER_TASKS.lists[ENGINEER_TASKS.B2C_Remedy_WR]
delete ENGINEER_TASKS.b2cEngineerListsItems[ENGINEER_TASKS.B2C_Remedy_WR]
delete ENGINEER_TASKS.lists[ENGINEER_TASKS.B2C_PLANED_DU]
delete ENGINEER_TASKS.b2cEngineerListsItems[ENGINEER_TASKS.B2C_PLANED_DU]

Vue.component("SiteNodeDuDevices",{
  template:`<div>
    <title-main text="Шкафы и оборудование" @open="toggleOpened">
      <button-sq icon="sync" @click="pingAll" />
    </title-main>
    <template v-if="opened">
      <checkbox-el v-if="hasEntrances" label="показать ДРС" v-model="showDrs" reverse class="padding-left-right-8px"/>
      <checkbox-el v-if="countUnmountedDevices" :label="'Не установленное '+(countUnmountedDevices?('('+countUnmountedDevices+')'):'')" v-model="showNotMountDevices" reverse class="padding-left-right-8px"/>
      <div class="padding-8px-16px" v-if="isEngineerModern">
        <button-main @click="onCreateRack" label="Создать шкаф" size="full" buttonStyle="contained" :disabled="!hasEntrances"/>
      </div>
      <template v-if="loading.racks || loading.plints">
        <devider-line />
        <loader-bootstrap text="загрузка данных ДРС"/>
      </template>
      <template v-else>
        <template v-for="({site,entrance,racks,outPlints,hasRacks,hasDevices,hasDrsRacks,hasDrsDevices}) of entrancesProps">
          <template v-if="showDrs?(hasDrsRacks||hasDrsDevices):(hasRacks||hasDevices)">
            <devider-line/>
            <SiteNodeDuDevicesEntrance
              :key="entrance.id"
              v-bind="{site,entrance,racks,outPlints,hasRacks,hasDevices,hasDrsRacks,hasDrsDevices,showDrs,showNotMountDevices,entrances}"
              @open-topology="setPlintAndOpenTopology"
              :ref="'site_devices_entrance_'+entrance.id"/>
          </template>
        </template>
      </template>

      <devider-line v-if="!hasEntrances"/>
      <link-block v-if="!hasEntrances" text="Подключенные квартиры" icon="apartment" actionIcon="right-link" :to="toFlats" />

      <template v-if="devicesOutOfSiteOnlyByNiossAndGpon.length">
        <devider-line/>
        <title-main icon="sent" text="С другого адреса" :text2="devicesOutOfSiteOnlyByNiossAndGpon.length||''" @open="opened_devicesOutOfSiteOnlyByNiossAndGpon=!opened_devicesOutOfSiteOnlyByNiossAndGpon"/>
        <div class="display-flex flex-direction-column gap-8px" v-if="opened_devicesOutOfSiteOnlyByNiossAndGpon">
          <template v-for="(device,i) of devicesOutOfSiteOnlyByNiossAndGpon">
            <device-info :networkElement="device" :ports="getServePonPorts(device.name)" :ref="'device_info_'+device.nioss_id" :entrances="getServeEntrances(device.name)" showLocation addBorder class="border-style-dashed--- margin-left-right-8px"/>
          </template>
        </div>
      </template>
      
      <template v-if="countMountOutDevices||(countUnmountedOutDevices&&showNotMountDevices)">
        <devider-line/>
        <title-main icon="warning" text="Место установки неизвестно" :text2="(countMountOutDevices+(showNotMountDevices?countUnmountedOutDevices:0))||''" @open="openedOutDevices=!openedOutDevices"/>
        <div class="display-flex flex-direction-column gap-8px" v-if="openedOutDevices">
          <template v-for="(device,i) of outDevices">
            <template v-if="!device.ne_status||(device.ne_status&&showNotMountDevices)">
              <device-info :networkElement="device" :entrances="entrances" :ref="'device_info_'+device.nioss_id" showSessions addBorder class="border-style-dashed--- margin-left-right-8px"/>
            </template>
          </template>
        </div>
      </template>

      <template v-if="devicesOutOfSiteButMaybeWrong.length">
        <devider-line/>
        <title-main icon="sent" text="Возможно с другого адреса" :text2="devicesOutOfSiteButMaybeWrong.length||''" @open="opened_devicesOutOfSiteButMaybeWrong=!opened_devicesOutOfSiteButMaybeWrong"/>
        <div class="display-flex flex-direction-column gap-8px" v-if="opened_devicesOutOfSiteButMaybeWrong">
          <template v-for="(device,i) of devicesOutOfSiteButMaybeWrong">
            <device-info :networkElement="device" :ports="getServePonPorts(device.name)" :ref="'device_info_'+device.nioss_id" :entrances="getServeEntrances(device.name)" showLocation addBorder class="border-style-dashed--- margin-left-right-8px"/>
          </template>
        </div>
      </template>
      
      <devider-line/>
      <title-main text="Действия" :opened="openedActions" @block-click="openedActions=!openedActions"/>
      <div v-if="openedActions" class="padding-8px-16px display-flex flex-direction-column gap-4px">
        <button-main @click="pingAll" label="Пинг всего оборудования" size="full" buttonStyle="outlined"/>
        <button-main @click="discoveryAll" label="Опросить все оборудование" size="full" buttonStyle="outlined" hidden="недостаточно данных"/>
        <button-main @click="sessionAll" label="Проверить сессии абонентов" :disabled="!xRad_region_id" size="full" buttonStyle="outlined"/>
      </div>
    </template>

    <modal-container ref="edit_modal_container" @close="clearEditResult">
      <site-entrances-modal ref="edit_modal" :site="site" :entrances="entrances"/>
    </modal-container>

    <modal-container ref="topology_modal_container" @close="unsetPlint">
      <drs-topology-modal ref="topology_modal" :site_id="site.id" :plint="plint"/>
    </modal-container>
  </div>`,
  props:{
    site:{type:Object,required:true},
    loading:{type:Object,default:()=>({})},
    entrances:{type:Array,default:()=>([])},
    ports:{type:Array,default:()=>([])},
    devices:{type:Array,default:()=>([])},
    plints:{type:Array,default:()=>([])},
    racks:{type:Array,default:()=>([])},
  },
  data:()=>({
    opened:true,
    showDrs:false,
    showNotMountDevices:false,
    openedOutDevices:true,
    openedActions:false,
    plint:null,
    devicesOutOfSite:[],//обслуживающие сэ с других сайтов
    opened_devicesOutOfSiteOnlyByNiossAndGpon:true,
    opened_devicesOutOfSiteButMaybeWrong:false,
  }),
  created(){
    const noData=!this.plints.length&&!this.racks.length;
    const isLoading=this.loading.plints||this.loading.racks;
    if(this.opened&& noData && !isLoading){
      this.$emit('load:plints');
      this.$emit('load:racks');
    };
    [...new Set([//без дублей
      //...this.serveDevicesOutOfSite,
      ...this.serveDevicesFromNiossEntrancesAndOutOfSite,
      ...this.serveDevices,
    ])].map(device_name=>this.getDeviceOutOfSite(device_name));
  },
  computed:{
    isEngineerModern(){return this.$store.getters.hasUserPriv('FIXstroyka_modernCtl')},
    devicesForFindPort(){//public, for FindPort in SiteNodeDuContent
      //return this.devicesOutOfSite;
      return [...this.devices,...this.devicesOutOfSiteOnlyByNiossAndGpon];//unicalDevicesOutOfSite
      //return this.devices;
    },
    devicesOnSite(){//имена сэ с площадки
      return this.devices.map(device=>device.name);
    },
    serveDevicesFromNiossEntrancesAndOutOfSite(){//имена сэ со всех подъездов но отсутсвующие на данном сайте, без дублей
      return [...new Set(this.entrances.map(entrance=>entrance.device_list).flat().filter(device_name=>!this.devicesOnSite.includes(device_name)))]
    },
    servePorts(){//обслуживающие порты со всех подъездов, без дублей
      let uniPorts={};
      this.ports.map(port=>uniPorts[port.port_name]=port);
      return Object.keys(uniPorts).map(port_name=>uniPorts[port_name]);
    },
    serveDevices(){//имена сэ с обслуживающих портов но отсутсвующие на данном сайте, без дублей
      return [...new Set(this.servePorts.map(port=>port.device_name).filter(device_name=>!this.devicesOnSite.includes(device_name)))];
    },
    serveDevicesOutOfSite(){//имена обслуживающих сэ с других сайтов 
      return this.serveDevices.filter(device=>!(this.devices.map(device=>device.name)).includes(device));
    },
    entrancesProps(){
      const {site,entrances,devices,plints,racks}=this;
      if(!(entrances&&devices&&plints&&racks)){return};
      return entrances.reduce((entrancesProps,entrance)=>{
        const entranceRacks=racks.filter(rack=>rack.entrance.number==entrance.number);
        const entrancePlints=plints.filter(plint=>plint.entrance_id===entrance.id);
        const outPlints=entrancePlints.filter(plint=>!entranceRacks.some(this.checkInsideRack(plint.name)));
        const racksWithData=entranceRacks.map(rack=>({
          rack,
          onlyDrs:/^CU/i.test(rack.name),
          devices:devices.filter(device=>rack.ne_in_rack.includes(device.name)),
          plints:plints.filter(plint=>plint.rack_id===rack.id),
        })).sort(({onlyDrs})=>onlyDrs?1:-1);
        const noDrsRacks=racksWithData.filter(({onlyDrs})=>!onlyDrs);
        const noDrsDevices=noDrsRacks.some(data=>Boolean(data.devices.length||data.plints.length));
        const drsRacks=racksWithData.filter(({onlyDrs})=>onlyDrs);
        const drsDevices=drsRacks.some(data=>Boolean(data.devices.length||data.plints.length));
        entrancesProps.push({
          site,
          entrance,
          racks:racksWithData,
          outPlints,
          hasRacks:Boolean(noDrsRacks.length),
          hasDevices:Boolean(noDrsDevices),
          hasDrsRacks:Boolean(noDrsRacks.length||drsRacks.length),
          hasDrsDevices:Boolean(noDrsDevices||drsDevices),
        });
        return entrancesProps;
      },[]);
    },
    outDevices(){
      const {devices,racks}=this;
      if(!racks.length){return devices};
      return devices.filter(device=>{
        return !racks.find(rack=>rack.ne_in_rack.includes(device.name))
      })
    },
    countMountOutDevices(){
      return this.outDevices.filter(device=>!device.ne_status).length;
    },
    unmountedOutDevices(){
      return this.outDevices.filter(device => device.ne_status);
    },
    countUnmountedOutDevices(){
      return this.unmountedOutDevices.length;
    },
    toFlats(){
      return {
        name:'noentrance',
        params:{
          site_id:this.$route.params.site_id,
          entrance_id:'noentrance',
          siteProp:this.site,
        },
      };
    },
    hasEntrances() {
      return this.entrances && this.entrances.length > 0
    },
    unmountedDevices(){
      return this.devices.filter(device=>typeof device.ne_status!=='undefined');
    },
    countUnmountedDevices(){
      return this.unmountedDevices.length;
    },
    device_info_refs(){
      return Object.keys(this.$refs).filter(key=>key.startsWith('device_info_')&&this.$refs[key][0]&&this.$refs[key][0].updatePing).map(key=>this.$refs[key][0]);
    },
    site_devices_entrance_refs(){
      return Object.keys(this.$refs).filter(key=>key.startsWith('site_devices_entrance_')&&this.$refs[key][0]&&this.$refs[key][0].pingAll).map(key=>this.$refs[key][0]);
    },
    xRad_region_id(){//TODO переделать ВЕ для фильтра по region_id коммутатора и площадки
      return [
        22,28,29,30,33,34,35,91,93,37,40,41,42,43,23,
        24,46,77,52,53,54,55,56,57,58,59,25,2,3,12,14,
        16,18,61,64,66,67,26,68,69,71,72,73,27,86,89,76
      ].includes(parseInt(this.site.name.split('_')[1]));
    },
    unicalDevicesOutOfSite(){
      return this.devicesOutOfSite.reduce((acc,device)=>{
        if(!acc.find(accdevice=>accdevice.name===device.name)){acc.push(device)};
        return acc
      },[]);
    },
    devicesOutOfSiteOnlyByNiossAndGpon(){//сэ с других сайтов но явно указанных как обслуживающее устройство в Nioss либо по портам GPON
      return this.unicalDevicesOutOfSite.filter(device=>{
        return this.serveDevicesFromNiossEntrancesAndOutOfSite.includes(device.name)||device.name.startsWith('OLT')
      });
    },
    devicesOutOfSiteButMaybeWrong(){//ошибки маппинга из-за некорректно проведенных переездов и дублей маков или препутаны СЭ между площадками
      return this.unicalDevicesOutOfSite.filter(device=>{
        return !this.serveDevicesFromNiossEntrancesAndOutOfSite.includes(device.name)&&!device.name.startsWith('OLT')&&!this.devicesOnSite.includes(device.name)
      });
    },
  },
  methods: {
    onCreateRack() {
      this.$router.push({ name:'create-rack' });
    },
    getServeEntrances(device_name){//обслуживаемые подъезды по текущему device_name, без дублей
      let uniEntrance={};
      this.entrances.filter(entrance=>entrance.device_list.includes(device_name)).map(entrance=>uniEntrance[entrance.name]=entrance);//удаление дублей 
      this.ports.filter(port=>port.device_name===device_name).map(port=>uniEntrance[port.entrance_name]={...port,number:port.entrance_number,device_list:[device_name]});//+ атрибуты подъезда для device-info
      return Object.keys(uniEntrance).map(entrance_name=>uniEntrance[entrance_name]);
    },
    getServePonPorts(device_name){//выборка gpon ports only из servePorts по текущему device_name
      return this.servePorts.filter(port=>port.device_name===device_name&&port.device_name.startsWith('OLT_'));
    },
    async getDeviceOutOfSite(device_name='') {//
      const cache=this.$cache.getItem(`search_ma/${device_name}`);
      if(cache&&cache.data){
        this.devicesOutOfSite.push(cache.data);
      }else{
        let response=await httpGet(buildUrl('search_ma',{pattern:device_name},'/call/v1/search/'));
        if(response.data){
          this.$cache.setItem(`search_ma/${device_name}`,response);
          this.devicesOutOfSite.push(response.data);
        };
      };
      this.$emit('update-devices-for-find-port',this.devicesForFindPort);//devicesOutOfSite
    },
    pingAll(){
      this.device_info_refs.map(ref=>ref.updatePing());
      this.site_devices_entrance_refs.map(ref=>ref.pingAll());
    },
    discoveryAll(){
      this.device_info_refs.map(ref=>ref.discovery());
      this.site_devices_entrance_refs.map(ref=>ref.discoveryAll());
    },
    sessionAll(){//public
      if(!this.xRad_region_id){return };
      this.device_info_refs.map(ref=>ref.get_device_session());
      this.site_devices_entrance_refs.map(ref=>ref.sessionAll());
    },
    toggleOpened() {
      this.opened = !this.opened;
    },
    setPlintAndOpenTopology(plint){
      this.plint=plint;
      const modal=this.$refs.topology_modal_container;
      if(!modal){return};
      modal.open();
    },
    unsetPlint(){
      this.plint=null;
    },
    checkInsideRack(name) {
      return (rack) => rack.ne_in_rack.includes(name);
    },
    openEditModal() {
      const modal = this.$refs.edit_modal_container;
      if (modal) modal.open();
    },
    clearEditResult() {
      const editModal = this.$refs.edit_modal;
      if (!editModal) return;
      if (editModal.result) {
        this.$root.$emit("building:update");
        editModal.result = null;
      }
    }
  },
});

Vue.component('entrance-devices', {
  template:`<CardBlock class="entrance-devices">
    <title-main text="Обслуживающее оборудование" :opened="opened" @block-click="opened=!opened"/>
    <devider-line v-if="opened" />
    <keep-alive>
      <div>
        <div class="padding-8px-16px" v-if="isEngineerModern">
          <button-main @click="onCreateRack" label="Создать шкаф" size="full" buttonStyle="contained"/>
          <button-main
            @click="onCreatePlintOrPatchPanel"
            label="Создать плинт / патч-панель"
            class="margin-top-8px"
            size="full"
            buttonStyle="contained"/>
        </div>
        <racks-of-entrance-v3 v-if="opened" :entrance="entrance" :site="site" :drs="false" @open-topology="setPlintAndOpenTopology"/>
      </div>
    </keep-alive>

    <modal-container ref="topology_modal_container" @close="unsetPlint">
      <drs-topology-modal ref="topology_modal" :site_id="site.id" :plint="plint"/>
    </modal-container>
  </CardBlock>`,
  props: {
    entrance: { type: Object, required: true },
    site: { type: Object, required: true },
  },
  data: () => ({
    opened: false,
    plint:null,
  }),
  computed:{
    isEngineerModern(){return this.$store.getters.hasUserPriv('FIXstroyka_modernCtl')},
  },
  methods: {
    setPlintAndOpenTopology(plint){
      this.plint=plint;
      const modal=this.$refs.topology_modal_container;
      if(!modal){return};
      modal.open();
    },
    unsetPlint(){
      this.plint=null;
    },
    onCreateRack() {
      this.$router.push({ name:'create-entrance-rack', params: { entrance: this.entrance } });
    },
    onCreatePlintOrPatchPanel() {
      this.$router.push({ name:'create-patch-panel-or-plint', params: { entrance: this.entrance, siteProp: this.site, entranceProp: this.entrance } });
    },
  }
});
