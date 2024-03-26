

Vue.component('LbsvAccountBlocksHistory',{
  beforeCreate(){
    this.$mapOptions({
      propsCommentsListItem: {
        authorKey: 'title',
        textKey: 'text',
        dateKey: 'date',
      },
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <title-main text="История блокировок" @open="open=!open"/>
    <template v-if="open">
      <div class="padding-left-right-8px display-flex flex-direction-column gap-8px">
        <span class="font--13-500 tone-500 text-align-center">Временной проме жуток</span>
        
        <div class="display-flex align-items-center gap-8px justify-content-center">
          <input-el label="С" type="date" :value="dateEnd" v-model="dateEnd" :disabled="accountBlockHistoryLoading"/>
          <input-el label="По" type="date" :value="dateStart"  v-model="dateStart" :disabled="accountBlockHistoryLoading"/>
        </div>
        
        <button-main @click="getAccountBlockHistory" :disabled="accountBlockHistoryLoading" label="Загрузить" :loading="accountBlockHistoryLoading" size="full" buttonStyle="contained"/>
        
      </div>
      
      <loader-bootstrap v-if="accountBlockHistoryLoading" text="accountBlockHistoryLoading"/>
      
      <div v-else-if="accountBlockHistory.text" class="padding-left-right-8px">
        <message-el type="info" :text="accountBlockHistory.text" box/>
      </div>
      
      <div v-else-if="accountBlockHistory.rows" class="padding-left-right-8px">
        <CommentsListItems v-bind="{
          items: accountBlockHistoryRows,
          propsCommentsListItem
        }"/>
      </div>
    </template>
  </div>`,
  props:{
    accountID:{type:String,required:true},
    account:{type:Object,required:true},
  },
  data:()=>({
    open:false,
    accountBlockHistory:null,
    accountBlockHistoryLoading:false,
    dateStart:new Date(),
    dateEnd:new Date(),
  }),
  created(){
    const formatDate=(date)=>date.toLocaleDateString().split('.').reverse().join('-')
    
    this.dateStart=formatDate(this.dateStart);
    
    this.dateEnd.setMonth(this.dateEnd.getMonth() - 3)
    this.dateEnd=formatDate(this.dateEnd);
    
    this.getAccountBlockHistory();
  },
  computed:{
    accountBlockHistoryRows(){
      return (this.accountBlockHistory?.rows||[]).map(row=>{
        const {timefrom,timeto,type,username,vglogin,vgid,agrmnum}=row;
        return {
          title: `${vglogin}|${vgid}`,
          text: `${type}`,
          date: `${timefrom || '?'} - ${timeto || '?'}`,
        }
      }).reverse()
    }
  },
  methods:{
    async getAccountBlockHistory(){
      this.accountBlockHistoryLoading=!0;
      const {userid,serverid}=this.account;
      try{
        const response=await httpPost("/call/lbsv/blocks_history",{
          userid,
          serverid,
          start:Datetools.format(this.dateEnd),
          end:Datetools.format(this.dateStart),
        });
        this.accountBlockHistory=response;
      }catch(error){
        console.warn('getAccountBlockHistory.error',error);
      };
      this.accountBlockHistoryLoading=!1;
    },
  }
});

Vue.component("LbsvContent", {
  template:`<section class="display-flex flex-direction-column gap-8px">
    <LbsvAccountMain v-bind="{
      account,
      accountID:accountId,
      agreement,
      flatData,
      flat
    }"/>

    <div class="white-block-100 padding-top-bottom-8px">
      <title-main icon="accidents" text="Работы по абоненту" :attention="hasActiveIncident?'warn':null" @block-click="$router.push({name:'account-events',params:{accountId}})">
        <button-sq icon="right-link" class="pointer-events-none"/>
      </title-main>
    </div>

    <LbsvAccountServiceGroups v-bind="{
      account,
      accountID:accountId,
      mrID:mr_id,
      accountAccessPort,
      serviceGroups,
      accountAccessPortLoading
    }" @onActivate_updateServices="updateAgreementServices"/>

    <LbsvAccountBlocksHistory v-bind="{
      account,
      accountID:accountId,
    }" />
  </section>`,
  props:{
    accountId:{type:String,required:true},
    account:{type:Object,required:true},
    mr_id:{type:Number,required:true},
    flatData:{type:Object,default:null},
    building:{type:Object,default:null},
    entrance:{type:Object,default:null},
    flat:{type:Object,default:null},
  },
  data:()=>({
    equipments:[],
    accountBlockHistory:{},
    accountBlockHistoryLoading:!1,
    accountContractEvents:null,
    accountAccessPort:null,
    accountAccessPortLoading:!1,
    agreementServicesUpdated:{},
  }),
  watch: {
    '$route.params.accountId'(){
      this.init();
    },
  },
  created(){
    this.init();
    this.$root.$on('onChangeEquipment_getAccountEquipments',()=>{
      this.getAccountEquipments();
    });
  },
  computed:{
    serverID(){return this.account?.serverid||0},
    billingTypeID(){return this.account?.billingTypeID||0},
    agreement(){
      const {account,accountId}=this;
      if(!account){return null};
      const clear=(acc)=>String(acc).replace(/-/g,'');
      const agrm=account.agreements.find(agrm=>clear(agrm.account)===clear(accountId));
      return agrm||null;
    },
    agreementServices(){
      const {agreement,agreementServicesUpdated}=this;
      if(!agreement){
        return {};
      };
      return this.account.vgroups.reduce((agreementServices,service)=>{
        if(service.agrmid!=agreement.agrmid){return agreementServices};
        agreementServices[service.vgid]={
          ...service,
          ...agreementServicesUpdated[service.vgid]||{}
        };
        return agreementServices;
      },{});
    },
    serviceError() {
      const {account}=this;
      if(account.vgroups.length===1){
        const error=account.vgroups[0];
        if(error.type==='error'){return 'Услуги не загружены. Попробуйте перезагрузить страницу.'}
        if(error.type==='warning'){return 'Услуги у абонента не найдены.'}
      };
      return '';
    },
    serviceGroups(){
      const vgroups=Object.values(this.agreementServices);
      return LBSV.filteredServiceGroups(vgroups,this.equipments,this.billingTypeID);
    },
    hasActiveIncident() {
      if (!this.accountContractEvents) return false;
      const {active}=this.accountContractEvents;
      return Boolean(active && active.length);
    }
  },
  methods: {
    async updateAgreementServices(){
      const {serverID}=this;
      // this.agreementServicesUpdated={};
      for(const vgid of Object.keys(this.agreementServices)){
        try{
          LBSVService.getVg(serverID,vgid).then(response=>{
            if(!response?.data?.vgid){return};
            this.$set(this.agreementServicesUpdated,response.data.vgid,response.data);
          });
        }catch(error){
          console.warn("updateAgreementService.error",vgid,error);
        };
      };
    },
    async init(){
      this.getAccountAccessPort().then(()=>{
        if(!this.accountAccessPort){return};
        this.getAccountContractEvents();
      });
      this.getAccountEquipments();
      //this.getAccountBlockHistory();
    },
    async getAccountAccessPort(){
      this.accountAccessPortLoading=!0;
      const {accountId:accountNumber}=this;
      try{
        const response=await DeviceService.AccountAccessPort.useCache(accountNumber);
        if(response?.data){
          this.accountAccessPort=response.data;
        };
      }catch(error){
        console.warn('getAccountAccessPort.error',error);
      };
      this.accountAccessPortLoading=!1;
    },
    async getAccountContractEvents(){
      if(!this.accountAccessPort?.device?.nioss_id){return};
      const {region:{mr_id},device:{nioss_id,name}}=this.accountAccessPort;
      try{
        const response=await httpGet(buildUrl("events_by_contract",{
          to:new Date(),
          from:Datetools.addDays(-1),
          id:nioss_id,
          device:name,
          contract:this.agreement?.agrmnumber,
          regionid:mr_id,
          serverid:this.account?.serverid,
        }));
        this.accountContractEvents=response;
      }catch(error){
        console.warn("events_by_contract.error",error);
      };
    },
    async loadClientEquipment() {
      try {
        const {agreement}=this;
        if (!agreement) return;
        const { serverid, userid, agrmid, account } = agreement;
        const response=await LBSVService.getEquipments(serverid,userid,agrmid,account);
        this.equipments = Array.isArray(response?.data)?response.data:[];
      } catch (error) {
        console.warn('loadClientEquipment.error', error);
      }
    },
    async loadCpeDbInfo() {
      try {
        const {agreement,mr_id}=this;
        if (!agreement || !mr_id) return;
        const response=await AxirosService.getCPELastDBInfoByAccount(mr_id,agreement.account)
        if (!response?.data?.length) return;
        this.equipments = [
          ...this.equipments,
          ...response?.data.map(equip => ({
            ...equip,
            model: `${equip.vendor || ''} ${equip.model}`,
            type_id: 4,
            id: equip.sn,
            serial: equip.sn,
            service: 'internet',
            type: 'wifi'
          }))
        ];
      } catch (error) {
        console.warn('loadCpeDbInfo.error', error);
      }
    },
    async getAccountEquipments(){//приоритет у client_equipment, дополняем из get_equipments по equipment.id или equipment.serial
      const {agreement}=this;
      if (!agreement) return;
      await this.loadClientEquipment();
      const {equipments}=this;
      if (!equipments.length || !equipments.find(({ type_id }) => type_id === 4)) await this.loadCpeDbInfo();
      if (!this.equipments.length) return;
      try{
        const smsGwEquipments=await SMSGatewayService.getAccountEquipments(agreement.account);
        this.equipments=SMSGW.extendEquipments(this.equipments,smsGwEquipments);//merge [smsgw equipments] to [lbsv equipments]
      }catch(error){
        console.warn("getAccountEquipments.error",error);
      };
    },
    /*async getAccountBlockHistory(){
      this.accountBlockHistoryLoading=!0;
      const today=new Date();
      let before=new Date();
      before.setMonth(before.getMonth()-3);
      const {userid,serverid}=this.account;
      try{
        const response=await httpPost("/call/lbsv/blocks_history",{
          userid,
          serverid,
          start:Datetools.format(before),
          end:Datetools.format(today),
        });
        this.accountBlockHistory=response;
      }catch(error){
        console.warn('getAccountBlockHistory.error',error);
      };
      this.accountBlockHistoryLoading=!1;
    },*/
  },
});










