//add account op
Vue.component("LbsvContent", {
  template:`<section name="LbsvContent" class="account-page">
    <LbsvAccountMain v-bind="{account,accountId,agreement,flatData,billingInfo,convergentBalance,loading,flat}"/>
    <CardBlock>
      <title-main icon="accidents" text="Работы по абоненту"  :attention="hasActiveIncident ? 'warn' : null" @block-click="toEvents">
        <button-sq icon="right-link" class="pointer-events-none"/>
      </title-main>
    </CardBlock>
    <LbsvServices2 v-bind="{account,accountId,mr_id,cp,groupServiceList}" :loadingCp="loading_search_by_account_or_port"/>
    <account-block-history :history="blockHistory"/>
  </section>`,
  props: {
    accountId: { type: String, required: true },
    account: { type: Object, required: true },
    mr_id: { type: Number, required: true },
    flatData: { type: Object, default: null },
    building: { type: Object, default: null },
    entrance: { type: Object, default: null },
    flat: { type: Object, default: null},
    accountResponse: { type: Object },
  },
  data: () => ({
    session: null,
    equipments: [],
    billingInfo: [],
    convergentBalance: null,
    blockHistory: {},
    events: null,
    loading: {
      account: false,
      vgroups: false,
      blockHistory: false,
    },
    loads:{
      search_by_account:false,
      port:false
    },
    resps:{
      search_by_account:null,
      port:null,
    }
  }),
  watch: {
    account() {
      this.loadStartData();
    },
  },
  created(){
    this.loadStartData();
    this.$root.$on('activation-modal-new->lbsv-account-content:update-cpe',(fakeCpeList)=>{
      if(fakeCpeList&&fakeCpeList.length){
        let cpeIds=fakeCpeList.map(eq=>eq.id);
        let macs=fakeCpeList.map(eq=>this.clearMac(eq.mac));
        if(!this.equipments.find(eq=>cpeIds.includes(eq.id)||macs.includes(this.clearMac(eq.mac)))){
          this.equipments=[...this.equipments,...fakeCpeList];
        };
      }else{
        this.loadClientEquipment();
      };
    });
  },
  computed: {
    port(){return this.resps.port},
    search_by_account(){return this.resps.search_by_account},
    loading_search_by_account_or_port(){return this.loads.search_by_account||this.loads.port},
    cp(){
      return this.search_by_account;
      const {search_by_account,port}=this;
      if(!search_by_account){return};
      if(!port){return search_by_account};
      return Object.assign(search_by_account,{port})
    },
    isB2b() {
      return this.account.type == 1;
    },
    isTooManyInternetServices(){
      return this.groupServiceList?.internet?.services?.length>2;
    },
    agreement() {
      if (!this.account) return "";
      const clear = (acc) => String(acc).replace(/-/g, "");
      const agr = this.account.agreements.find((agr) => clear(agr.account) === clear(this.accountId));
      return agr || null;
    },
    serviceList() {
      if (this.agreement) {
        let agreement = this.agreement;
        return this.account.vgroups.filter(function (service) {
          return service.agrmid === agreement.agrmid;
        });
      }

      return [];
    },
    serviceError() {
      if (this.account.vgroups.length === 1) {
        const error = this.account.vgroups[0];
        if (error.type === "error") {
          return "Услуги не загружены. Попробуйте перезагрузить страницу.";
        }
        if (error.type === "warning") {
          return "Услуги у абонента не найдены.";
        }
      }
      return "";
    },
    internetEq() {
      return this.equipments.filter((e) => e.type_id == 4);
    },
    tvEq() {
      let equipments = this.equipments.filter((e) => [1, 2, 3].includes(parseInt(e.type_id, 10)));
      equipments.forEach((equip) => {
        if (!equip.card || !this.account.vgroups) return;
        this.account.vgroups.forEach((vg) => {
          if (!vg.smartcards) return;
          vg.smartcards.forEach((card) => {
            if (!card.smartcard || !card.smartcard.serial === equip.card) return;
            equip.vg = vg;
          });
        });
      });
      return equipments;
    },
    iptvEq() {
      return this.equipments.filter((e) => e.type_id == 7);
    },
    hybridEq() {
      return this.equipments.filter((e) => e.type_id == 5);
    },
    phoneEq() {
      return this.equipments.filter((e) => e.type_id == 6);
    },
    otherEq() {
      return this.equipments.filter((e) => e.type_id == 0);
    },
    groupServiceList(){
      let servicesBaskets={
        internet:{name:"Интернет",      equipments:this.internetEq, services:[]},
        digittv :{name:"Цифровое ТВ",   equipments:this.tvEq,       services:[]},
        analogtv:{name:"Аналоговое ТВ", equipments:[],              services:[]},
        iptv    :{name:"IPTV",          equipments:this.iptvEq,     services:[]},
        phone   :{name:"Телефония",     equipments:this.phoneEq,    services:[]},
        hybrid  :{name:"ИТВ",           equipments:this.hybridEq,   services:[]},
        other   :{name:"Другие",        equipments:this.otherEq,    services:[]},
      };
      this.serviceList.forEach(abonService=>{
        const servicesBasket=servicesBaskets[abonService.type];
        if(servicesBasket){
          servicesBasket.services.push(abonService);
        };
      });
      let servicesBasketsOnlyWithServicesOrEquipments={};
      for(const [name,params] of Object.entries(servicesBaskets)){
        if(params.services.length||params.equipments.length){servicesBasketsOnlyWithServicesOrEquipments[name]=params};
      };
      //return filtered;
      //раскидываем оборудование по сервисам
      for(let [groupName, groupParams] of Object.entries(servicesBasketsOnlyWithServicesOrEquipments)){
        let services=[];
        for(let service of groupParams.services){
          let equipments=[]// оборудование для добавления в сервис
          groupParams.equipments=groupParams.equipments.map(equipment=>{
            if([service.vgid,service.login].includes(equipment.service_number)){//так как у sms_gateway нет разделения на vgid и login сравниваем с обоими
              equipments.push(equipment);
            }else{
              return equipment;//если оборудование не удалось пристроить в сервис
            };
          }).filter(eq=>eq);//оставляем оборудование которое не удалось пристроить
          services.push({
            ...service,
            equipments,//добавляем оборудование в сервис
          })
        };
        groupParams.services=services;//обновляем дополненные оборудованием сервисы
      };
      return servicesBasketsOnlyWithServicesOrEquipments;
    },
    hasActiveIncident() {
      if (!this.events) return false;
      return Boolean(this.events.active && this.events.active.length);
    },
    currentItem() {
      return this.navItems[this.currentIndex];
    },
    currentIndex() {
      const { id } = this.$route.params;
      if (id) return 0;
      return this.navItems.findIndex(({ fullName }) => fullName === id);
    },
    title() {
      if (!this.$route.params.id) return "кв";
      return `${this.currentItem.name}`;
    },
    isB2b() { // FIXME временное решение для b2b клиентов
      return this.account.type == 1
    }
  },
  methods: {
    clearMac(mac=''){
      return (mac.match(/\w/g)||[]).join('');
    },
    async loadStartData() {
      await this.getSearchCP();
      await this.getPort();
      this.loadAccountEvents();
      this.getEquipments_new();//merge [smsgw equipments] to [lbsv equipments]
      if(!this.isB2b&&!this.isTooManyInternetServices){
        this.getAuthAndSpeed();
      };
      this.loadBlockHistory();
      if (this.agreement && this.agreement.isconvergent) this.getForisData();
    },
    async getSearchCP() {
      this.loads.search_by_account = true;
      const account = this.accountId;
      try {
        const response = await httpGet(buildUrl("search_by_account", { account }, "/call/v1/device/"));
        if (response.type !== "error" ) {
          this.resps.search_by_account = response;
        } else {
          throw new Error(response.text);
        }
      } catch (error) {
        console.warn("search_by_account.error", error);
      }
      this.loads.search_by_account = false;
    },
    async getPort(){
      if(!this.resps.search_by_account){return};
      const {name=''}=this.resps.search_by_account.port;
      if(!name){return};
      if(this.resps.port){return};
      this.loads.port=true;
      this.resps.port=null;
      const cache=this.$cache.getItem(`port/${name}`);
      if(cache){
        this.resps.port=cache;
      }else{
        try{
          const response=await httpGet(buildUrl('search_ma',{pattern:name,component:'lbsv-account-content'},'/call/v1/search/'));
          if(response.data){
            this.$cache.setItem(`port/${name}`,response.data);
            this.resps.port=response.data;
          };
        }catch(error){
          console.warn('search_ma:port.error',error);
        };
      };
      this.loads.port=false;
    },
    async loadAccountEvents(){
      if(!this.resps.search_by_account){return};
      try{
        const response=await httpGet(buildUrl("events_by_contract",{
          to:new Date(),
          from:Dt.addDays(-1),
          id:this.resps.search_by_account?.device?.nioss_id,
          device:this.resps.search_by_account?.device?.name,
          contract:this.agreement?.agrmnumber,
          regionid:this.resps.search_by_account?.region?.mr_id,
          serverid:this.account?.serverid,
        }));
        this.events=response;
      }catch(error){
        console.warn("events_by_contract.error",error);
      };
    },
    async getEquipments_new(){//приоритет у client_equipment, дополняем из get_equipments по equipment.id или equipment.serial
      if(!this.agreement){return};
      try{
        let response=await httpGet(buildUrl("client_equipment",{
          serverid:this.agreement.serverid,
          userid:this.agreement.userid,
          agrmid:this.agreement.agrmid,
          account:this.agreement.account
        },"/call/lbsv/"));
        if(response.type==="error"||!response.length){response=[]};
        this.equipments=response;
      }catch(error){
        console.warn("client_equipment.error",error);
      };
      if(!this.equipments.length){return};
      try{
        let responses=await Promise.allSettled([
          httpGet(buildUrl("get_equipments",{account:this.agreement.account,service_type:'SPD'},"/call/sms_gateway/")),
          httpGet(buildUrl("get_equipments",{account:this.agreement.account,service_type:'CTV'},"/call/sms_gateway/")),
          httpGet(buildUrl("get_equipments",{account:this.agreement.account,service_type:'ITV'},"/call/sms_gateway/")),
          httpGet(buildUrl("get_equipments",{account:this.agreement.account,service_type:'VOIP'},"/call/sms_gateway/")),
          httpGet(buildUrl("get_equipments",{account:this.agreement.account,service_type:'IPTV'},"/call/sms_gateway/")),
        ]).then((responses)=>{
          return responses
            .filter((response)=>response.status==='fulfilled')
            .map((response)=>response.value)
            .map((result)=>{
              if(result.type==="error"||!result.service_equipments){
                return []
              }else{
                return [result.service_equipments].flat()//может прийти {} вместо [{},...]
              }
            });
        });
        //console.log(responses)
        let response={
          service_equipments:responses.flat()
        };
        
        if(!response.service_equipments.length){return};//60910198875
        
        //поднимаем параметры
        let service_equipments=response.service_equipments.map(equipment=>{
          let equipment_parameters=equipment.equipment_parameters||[];//параметров может не быть
          //param.code может быть в разном регистре
          //некоторые параметры могут отсутствовать или value=null
          return {
            ...equipment,
            hardnumber:equipment_parameters.find(param=>param.code.toLowerCase()==='hardnumber')?.value?.value,
            hardtype:equipment_parameters.find(param=>param.code.toLowerCase()==='hardtype')?.value?.value,
            model:equipment_parameters.find(param=>param.code.toLowerCase()==='model')?.value?.value,
            smartcardnumber:equipment_parameters.find(param=>param.code.toLowerCase()==='smartcardnumber')?.value?.value,
            usagetype:equipment_parameters.find(param=>param.code.toLowerCase()==='usagetype')?.value?.value,
            chipid:equipment_parameters.find(param=>param.code.toLowerCase()==='chipid')?.value?.value,
            //для некторых биллингов chipid приходит вместо hardnumber, а в hardnumber приходит серийник или null
            staticip:equipment_parameters.find(param=>param.code.toLowerCase()==='staticip')?.value?.value,//StaticIP
          };
        });
        
        //дополняем client_equipment
        this.equipments=this.equipments.map(equipment=>{
          let service_equipment=service_equipments.find(service_equipment=>[equipment.id,equipment.serial].includes(service_equipment.chipid||service_equipment.hardnumber));
          return {
            ...equipment,
            ...service_equipment?{
              service_equipment,//dev
              service_number:service_equipment.service_number,//для поиска сервиса по vgid или login
              credentials:service_equipment.credentials,//для iptv,voip,spd
              service_type:service_equipment.service_type,//для списка идентификаторов
            }:{}//если не нашелся
          }
        });
      }catch(error){
        console.warn("get_equipments.error",error);
      };
    },
    async getAuthAndSpeed() {
      this.billingInfo = [];
      const { internet } = this.groupServiceList;
      if (!internet) return;
      if (this.isB2b) return; // FIXME временное решение для b2b клиентов
      this.loading.vgroups = true;
      const promises = [];
      const filteredServices = internet.services.filter(
        (service) =>
          service.agrmid === this.agreement.agrmid && service.isSession && [2, 4, 6].includes(Number(service.agenttype))
      );

      for (const service of filteredServices) {
        const { login, serverid, vgid } = service;
        const params = {
          login,
          serverid,
          vgid,
          date: "",
        };
        promises.push(
          httpGet(buildUrl("get_auth_type", params, "/call/aaa/"), true).then((response) => {
            if (response.code == "200" && response.data.length > 0 && response.data[0].auth_type) {
              service.auth_type = response.data[0].auth_type;
            }
          })
        );
        promises.push(
          httpGet(buildUrl("get_user_rate", params, "/call/aaa/"), true).then((response) => {
            const is_data = response.code == "200" && response.data && response.data.length > 0;
            // C точки зрения биллинга, скорость = 0 - это скорость без ограничений(т.е. по тарифу).
            // Требуется при скорости = 0, отображать "Информацию в биллинге".
            if (is_data && (response.data[0].rate || response.data[0].rate == 0)) {
              this.billingInfo.push(response.data);
              service.rate = response.data[0].rate + " Мбит/c";
            }
          })
        );
      }

      await Promise.all(promises);
      this.loading.vgroups = false;
    },
    async loadBlockHistory() {
      this.loading.blockHistory = true;
      const today = new Date();
      let before = new Date();
      before.setMonth(before.getMonth() - 3);
      const params = {
        userid: this.account.userid,
        serverid: this.account.serverid,
        start: Datetools.format(before),
        end: Datetools.format(today),
      };
      try {
        const response = await httpPost("/call/lbsv/blocks_history",params);
        this.blockHistory = response;
      } catch (error) {
        console.error("Load block history:", error);
      }
      this.loading.blockHistory = false;
    },
    async getForisData() {
      try {
        const response = await httpGet(`/call/v1/foris/convergent?msisdn=${this.agreement.convergentmsisdn}`);
        this.convergentBalance = response.balance;
      } catch (error) {
        console.error("Load foris data:", error);
      }
    },
    toEvents() {
      this.$router.push({
        name: "account-events",
        params: {
          accountId: this.accountId,
        },
      });
    },
  },
});

Vue.component("LbsvServices2",{
  template:`<div name="LbsvServices2">
    <CardBlock v-for="(group, key) in groupServiceList" :key="key" class="mini-card margin-top-0">
      <ServicesTypeHeader @open="opened[key] = !opened[key]" :open="opened[key]" :type="key" />
      <div v-show="opened[key]">
        <CardBlock v-if="key==='internet'">
          <traffic-light-ma v-if="account&&!loadingCp&&cp&&!isGpon" 
            billing-type="lbsv" 
            :lbsv-account="account" 
            :account-device="cp" 
            :account-id="accountId"
            :equipments="group.equipments"
            @update:online-session="refreshOnlineSessions"
            :isB2b="isB2b"
            :isTooManyInternetServices="isTooManyInternetServices"
          />
          <template v-if="cp">
            <template v-if="isGpon">
              <title-main text="Порт OLT" @open="show.serveOltPort=!show.serveOltPort">
                <button-sq v-if="loading.networkElement" icon="loading rotating"/>
              </title-main>
              <device-info v-if="networkElement&&show.serveOltPort" :networkElement="networkElement" :ports="[accessPort]" hideEntrances showLocation addBorder autoSysInfo class="margin-left-right-8px"/>
              
              <title-main text="Абонентский ONT" @open="show.abonOnt=!show.abonOnt">
                <button-sq v-if="loading.onts" icon="loading rotating"/>
              </title-main>
              <OntInfo v-if="abonOnt&&show.abonOnt&&!loading.onts" :ont="abonOnt" :port="accessPort" class="margin-left-right-8px"/>
              <message-el v-if="!loading.onts&&!abonOnt" text="терминал абонента не найден" type="warn" box/>
            </template>

            <template v-else>
              <title-main text="Порт подключения">
                <button-sq v-if="loading.networkElement" icon="loading rotating"/>
              </title-main>
              <device-info v-if="networkElement" :networkElement="networkElement" :ports="[isB2b?port:accessPort]" hideEntrances showLocation addBorder autoSysInfo class="margin-left-right-8px"/>
            </template>
            
          </template>
        </CardBlock>
        
        <CardBlock v-else-if="key=='digittv'">
          <template v-if="op">
            <title-main text="Источник ТВ сигнала">
              <button-sq v-if="loading.deviceOP" icon="loading rotating"/>
            </title-main>
            <device-info v-if="deviceOP" :networkElement="deviceOP" hideEntrances showLocation addBorder autoSysInfo class="margin-left-right-8px"/>
          </template>
        </CardBlock>

        <sessions v-if="key=='internet'" billing-type="lbsv" :lbsv-services="group.services" ref="sessions" :isTooManyInternetServices="isTooManyInternetServices"/>
        <lbsv-services-el class="margin-top-8px" :isB2b="isB2b" :mr_id="mr_id" :account="account" :services="group.services" :account-number="accountId" :isTooManyInternetServices="isTooManyInternetServices"/>
        <!--оборудование которое не смапилось с услугой в lbsv-account-content-->
        <equipment v-for="(equipment,i) of group.equipments" :key="i" :equipment="equipment" :mr_id="mr_id" :account="accountIdAgreement" :services="group.services"/>
      </div>
    </CardBlock>
  </div>`,
  props:{
    account:{type:Object,required:true},
    mr_id:{type:Number},
    cp:{type:Object,default:null},
    groupServiceList:{type:Object,required:true},
    accountId:{type:String,default:''},
    loadingCp:{type:Boolean,default:false},
  },
  data:()=>({
    opened:{
      internet: true,
      analogtv: true,
      digittv:  true,
      iptv:     true,
      phone:    true,
      hybrid:   true,
      other:    true,
    },
    show:{
      serveOltPort:true,
      abonOnt:true,
    },
    loading:{
      networkElement:false,
      onts:false,
      searchOPByAccount:!1,
      deviceOP:!1,
    },
    onts:[],
    networkElement:null,
    port: null,
    op: null,
    deviceOP: null,
  }),
  async created(){
    await this.searchOPByAccount();
    if(this.op){
      await this.getDeviceOP();
    }
  },
  watch:{
    'cp'(cp){
      if (!cp) { return };
      if (!cp?.device?.uzel) {
        this.getNetworkElement();
      } else {//адаптер cp
        this.networkElement=cp.device;
      };
      if (this.isGpon) {
        this.getAuthOnts();
      };
    },
    groupServiceList() {
      if (!this.isB2b) return;
      this.loadDevicePort();
    }
  },
  computed:{
    isB2b(){ // FIXME временное решение для b2b клиентов
      return this.account.type==1;
    },
    isTooManyInternetServices(){
      return this.groupServiceList?.internet?.services?.length>2;
    },
    accountIdAgreement(){
      const parseAccount = (account) => String(account).replace(/-/g, "");
      const agreement = this.account.agreements.find((a) => parseAccount(a.account) == parseAccount(this.accountId));
      return agreement && agreement.account ? agreement.account : this.accountId
    },
    isGpon(){
      if(!this.cp?.port){return};
      return this.cp.port?.name.startsWith('PORT-OLT');
    },
    accessPort(){
      if(!this.cp?.port){return}
      return {
        device_name:this.cp.port.device_name,
        port_name:this.cp.port.name,
        if_index:this.cp.port.snmp_number,
        if_name:this.cp.port.snmp_name,
        if_alias:this.cp.port.snmp_description,
      }
    },
    abonOnt(){//терминал абонента по маку cp, или по серийнику если неполучилось по маку
      const mac=this.cp?.port?.subscriber_list?.mac||this.cp?.port?.subscriber_list?.[0]?.mac||''
      if(!mac){return};
      const cp_mac=mac.match(/[0-9A-Fa-f]/g).join('').toLowerCase();
      return this.onts.find(ont=>ont.macOnu&&cp_mac===ont.macOnu.match(/[0-9A-Fa-f]/g).join('').toLowerCase())||this.onts.find(ont=>ont.serialNum&&cp_mac.slice(6,12)===(parseInt(ont.serialNum.slice(6,12),16)+3).toString(16).toLowerCase())
    },
  },
  methods:{
    async searchOPByAccount(){
      if(!this.accountId){return};
      this.loading.searchOPByAccount=!0;
      this.op=null;
      const account=this.accountId;
      const cache=this.$cache.getItem(`op/${account}`);
      if(cache){
        this.op=cache;
      }else{
        try{
          const response=await httpGet(buildUrl('search_receiver_by_account',{account},'/call/device/'));
          if(Array.isArray(response)&&response[0]){
            this.$cache.setItem(`op/${account}`,response[0]);
            this.op=response[0];
          };
        }catch(error){
          console.warn('search_receiver_by_account.error',error);
        };
      };
      this.loading.searchOPByAccount=!1;
    },
    async getDeviceOP(){
      const deviceName=this.op?.deviceName;
      if(!deviceName){return};
      this.loading.deviceOP=!0;
      const method='get_devices_by_name';
      const key=atok(method,deviceName);
      let response=this.$cache.getItem(key);
      if(Array.isArray(response)&&response[0]){
        this.deviceOP=response[0];
      }else{
        try{
          response=await httpGet(buildUrl(method,{name:deviceName,transliterate:'en'},"/call/v1/device/"));
          if(Array.isArray(response)&&response[0]){
            this.deviceOP=response[0];
            this.$cache.setItem(key,response);
          };
        }catch(error){
          console.warn(`${method}.error`,error);
        }
      }
      this.loading.deviceOP=!1;
    },
    async getNetworkElement(){
      if(!this.cp?.device?.name){return};
      if(this.networkElement){return};
      this.loading.networkElement=true;
      this.networkElement=null;
      const {name=''}=this.cp.device;
      const cache=this.$cache.getItem(`device/${name}`);
      if(cache){
        this.networkElement=cache;
      }else{
        try{
          let response=await httpGet(buildUrl('search_ma',{pattern:name,component:'lbsv-services'},'/call/v1/search/'));
          if(response.data){
            this.$cache.setItem(`device/${name}`,response.data);
            this.networkElement=response.data;
          };
        }catch(error){
          console.warn('search_ma:device.error',error);
        };
      };
      this.loading.networkElement=false;
    },
    async loadDevicePort() {
      const service = this.groupServiceList?.internet?.services[0];
      if (!service) return;
      this.loading.networkElement = true;
      this.networkElement = null;
      const params = { account: this.accountId, orig_id: service.vgid };
      try {
        const response = await httpGet(buildUrl('device_port', params, '/call/v2/device/'));
        this.networkElement = response.device;
        this.port = response.port;
      } catch(error) {
        console.warn('load device_port error: ', error);
      } finally {
        this.loading.networkElement = false;
      }
    },
    async getAuthOnts(){
      if(!this.cp?.device?.name){return};
      if(!this.cp?.port){return};
      if(this.onts.length){return};
      this.loading.onts=true;
      this.onts=[];
      const {device:{name:device_name},port:{snmp_name:port,snmp_number:port_index}}=this.cp;
      try{
        const onts=await httpGet(buildUrl('onu_info',{device_name,port,port_index,component:'lbsv-services'},'/call/hdm/'));
        this.onts=onts.length?onts:[];
      }catch(error){
        console.warn('onu_info.error', error);
      };
      this.loading.onts=false;
    },
    refreshOnlineSessions(){
      if(!this.$refs.sessons){return};
      setTimeout(this.$refs.sessons.refreshSessions,REFRESH_SESSIONS_TIMEOUT);
    }
  }
});
