//fix iptv creds
Vue.component('LbsvService',{
  beforeCreate(){
    this.$mapOptions({
      ASRT_BILLING_TYPE_ID:LBSV.ASRT_BILLING_TYPE_ID,
      ASRT_PACKAGE_TYPE_INET:LBSV.ASRT_PACKAGE_TYPE_INET,
      SERVICE_TYPE_INTERNET:LBSV.SERVICE_TYPE_INTERNET
    })
  },
  template:`<section class="white-block-100 padding-top-bottom-8px">
    <template v-if="billingTypeID==ASRT_BILLING_TYPE_ID">
      <div class="display-flex align-items-center gap-8px margin-left-right-8px justify-content-space-between">
        <title-main textClass="font--13-500" :text="typeService" :text2="service.statusname" :text2Class="stateClass" class="padding-unset"/>
        <template v-if="service.packagetypeid==ASRT_PACKAGE_TYPE_INET">
          <LbsvParentServiceActivation v-if="isAvailableForActivation" v-bind="{
            accountNumber,
            serviceNumber:service.vgid
          }" @onActivate_updateServices="$emit('onActivate_updateServices')"/>
          <button-sq v-else :icon="serviceProfileLoading?'loading rotating':(serviceProfile&&serviceProfile.length&&!serviceProfile[0].isError)?'info':'warning tone-300'" :disabled="serviceProfileLoading" type="large" @click="testAndOpenModalOrLoadInfo"/>
        </template>
      </div>
      <div class="tone-500 font--12-400 margin-left-right-8px">{{service.agentdescr}}</div>
    </template>
    
    <template v-else>
      <title-main textClass="font--13-500" :text="typeService" :text2="service.statusname" :text2Class="stateClass" :textSub="service.agentdescr" textSubClass="tone-500 font--12-400">
        <span slot="icon" class="ic-20" :class="['ic-'+icon,stateClass]"></span>
        <button-sq v-if="service.type==SERVICE_TYPE_INTERNET.type" :icon="serviceProfileLoading?'loading rotating':(serviceProfile&&serviceProfile.length&&!serviceProfile[0].isError)?'info':'warning tone-300'" :disabled="serviceProfileLoading" type="large" @click="testAndOpenModalOrLoadInfo"/>
      </title-main>
    </template>

    <billing-info-modal ref="billing_info_modal" v-bind="{
      billingInfo:[serviceProfile||[]],
      loading:serviceProfileLoading
    }"/>

    <div v-if="billingTypeID==ASRT_BILLING_TYPE_ID" class="display-flex flex-direction-column gap-8px padding-left-right-16px">
      <div class="font--12-400 tone-500">{{service.tarif||service.tardescr}}</div>
      <div v-if="isChildService && !isAvailableForActivation" class="display-flex align-items-center gap-2px">
        <div class="font--13-500 tone-500">{{serviceAuthType}}</div>
        <div v-if="serviceAuthType&&rateText" class="font--13-500 tone-500"> • </div>
        <div class="font--13-500">{{rateText}}</div>
      </div>
      <AsrtLoginPassword v-if="service.type==SERVICE_TYPE_INTERNET.type" v-bind="{
        login:service.login,
        pass:isChildService?service.pass:'',
      }" class="margin-left-8px"/>
    </div>
    
    <title-main v-if="billingTypeID!==ASRT_BILLING_TYPE_ID" textClass="tone-500 font--12-400" :text="service.tarif||service.tardescr" textSubClass="font--13-500" textSub1Class="tone-500" :textSub="serviceAuthType||rateText" :textSub2="serviceAuthType?rateText:''" :style="(serviceAuthType||rateText)?'':'margin:-10px 0px;'">
      <button-sq :icon="(serviceAuthTypeLoading||serviceProfileLoading)?'loading rotating':''" type="medium"/>
    </title-main>
    
    <div class="margin-left-right-18px" style="display:grid;gap:4px;grid-template-columns:1fr 1fr 1fr 1fr;">
      <template v-if="service.type==SERVICE_TYPE_INTERNET.type && billingTypeID!=ASRT_BILLING_TYPE_ID">
        <lbsv-login-pass v-if="serviceHasPassword" :service="service" :billingid="account.billingid" style="grid-area: 1/1/2/5;"/>
      </template>
      
      <template v-if="billingTypeID!=ASRT_BILLING_TYPE_ID">
        <title-main v-if="!isSamatlor" textClass="font--16-500" v-bind="{
          text1Class:[1,4,5,6].includes(billingTypeID)?'':'tone-500',
          text2Class:[2,3].includes(billingTypeID)?'':'tone-500',
          text:service.login||service.vgid,
          text2:service.login?service.vgid:'',
        }" style="grid-area: 1/1/2/5;"/>
        
        <template v-if="isAvailableForActivation">
          <button-main style="grid-area: 2/1/3/3;" label="Активировать(old)" @click="activate" button-style="outlined" size="full"/>
          <button-main style="grid-area: 2/3/3/5;" label="Активировать" @click="openModal('service_activation_modal')" :loading="serviceParamsLoading" button-style="outlined" size="full"/>
        </template>
        <template>
          <button-main style="grid-area: 3/1/4/3;" label="Заменить AO" @click="openModal('equipment_replace_modal')" :loading="serviceParamsLoading" button-style="outlined" size="full"/>
          <button-main style="grid-area: 3/3/4/5;" v-if="isAvailableForActivation" label="Привязать AO" @click="openModal('equipment_add_modal')" :loading="serviceParamsLoading" button-style="outlined" size="full"/>
        </template>
      </template>
      
      <account-iptv-code v-if="isIPTV" v-bind="{
        account:accountNumber,
        service,
      }" style="grid-area: 4/1/5/5;"/>
      
      <EquipmentCredentials v-for="(credentials,hardnumber,i) in credentialsByEquipments" :key="i" v-bind="{
        credentials,
        hardnumber
      }" :style="{'grid-area': (5+i)+'/1/'+(6+i)+'/5'}"/>
    </div>

    <info-text-sec v-if="service.descr && billingTypeID!==ASRT_BILLING_TYPE_ID" :text="service.descr" rowClass="font--12-400" rowStyle="color:#918f8f;"/>

    <!--дочерние услуги-->
    <div v-if="billingTypeID==ASRT_BILLING_TYPE_ID&&service.packagetypeid==ASRT_PACKAGE_TYPE_INET" class="display-flex flex-direction-column">
      <template v-for="(childService,vgid,i) in childServices">
        <div class="divider-line margin-top-8px"/>
        <LbsvService :key="vgid" v-bind="{
          account,
          accountNumber,
          service:childService,
          mrID,
          isTooManyInternetServices
        }" v-on="{
          onServiceAuthType:($event)=>serviceAuthType=$event,
          onServiceAuthTypeLoading:($event)=>serviceAuthTypeLoading=$event,
          onServiceProfile:($event)=>serviceProfile=$event,
          onServiceProfileLoading:($event)=>serviceProfileLoading=$event
        }"/>
      </template>
    </div>
    
    <!--оборудование под услугой-->
    <template v-if="hasEquipments">
      <title-main text="Оборудование" @open="open_eq=!open_eq" :text2="equipments.length" textClass="font--13-500"/>
      <template v-if="open_eq">
        <template v-for="(equipment,key) of equipments">
          <div class="divider-line"/>
          <equipment :key="key" v-bind="{
            equipment,
            account:accountNumber,
            mr_id:mrID,
            services:[service],
            canDeleteEquipment:billingTypeID!=ASRT_BILLING_TYPE_ID
          }"/>
        </template>
      </template>
    </template>
    
    <modal-container ref="modal">
      <activation-modal v-bind="{
        service,
        account:accountNumber,
      }"/>
    </modal-container>
    <modal-container-custom v-if="serviceParams" ref="service_activation_modal" :footer="false" :wrapperStyle="{'min-height':'auto'}">
      <service-activation-modal @close="closeModal('service_activation_modal')" v-bind="{
        service,
        account:accountNumber,
        serviceType,
        serviceName:typeService
      }"/>
    </modal-container-custom>
    <modal-container-custom v-if="serviceParams" ref="equipment_replace_modal" :footer="false">
      <equipment-replace-modal @close="closeModal('equipment_replace_modal')" v-bind="{
        service,
        account:accountNumber,
        serviceType,
        serviceParams
      }"/>
    </modal-container-custom>
    <modal-container-custom v-if="serviceParams" ref="equipment_add_modal" :footer="false">
      <equipment-add-modal @close="closeModal('equipment_add_modal')" v-bind="{
        service,
        account:accountNumber,
        serviceType,
        serviceParams
      }"/>
    </modal-container-custom>
  </section>`,
  props:{
    account:{type:Object,required:true},
    accountNumber:{type:String,required:true},
    service:{type:Object,required:true},
    mrID:{type:Number},
    isTooManyInternetServices:Boolean,
  },
  data:()=>({
    serviceAuthType:'',
    serviceAuthTypeLoading:!1,
    serviceProfile:null,
    serviceProfileLoading:!1,
    serviceParams:null,
    serviceParamsLoading:!1,
    open_eq:true,
  }),
  created(){
    if(this.isInernet && !this.isTooManyInternetServices){
      this.getServiceAuthType();
      this.getServiceProfile();
      this.getServiceParams();
    }
  },
  watch:{
    'serviceAuthType'(value){
      if(this.isChildService){
        this.$emit('onServiceAuthType',value);
      };
    },
    'serviceAuthTypeLoading'(value){
      if(this.isChildService){
        this.$emit('onServiceAuthTypeLoading',value);
      };
    },
    'serviceProfile'(value){
      if(this.isChildService){
        this.$emit('onServiceProfile',value);
      };
    },
    'serviceProfileLoading'(value){
      if(this.isChildService){
        this.$emit('onServiceProfileLoading',value);
      };
    },
  },
  computed:{
    billingTypeID(){return this.account?.billingTypeID||0},
    childServices(){return this.service.childServices||{}},
    equipments(){return this.service.equipments||[]},
    hasEquipments(){return Boolean(this.equipments.length)},
    isChildService(){
      return this.service.packagetypeid==LBSV.ASRT_PACKAGE_TYPES.cs_login;
    },
    rateText(){
      const {serviceProfile}=this;
      return serviceProfile?.[0].rate?`${serviceProfile?.[0].rate} Мбит/c`:'';
    },
    isInernet(){
      return this.service.type == LBSV.SERVICE_TYPE_INTERNET.type && this.service.isSession;
    },
    typeService(){
      return LBSV.SERVICE_TYPEs[this.service.type]?.name||this.service.serviceclassname;
    },
    serviceType(){
      return LBSV.SERVICE_TYPEs[this.service.type]?.serviceType;
    },
    isIPTV(){
      return this.serviceType==SMSGW.SERVICE_TYPEs.IPTV
    },
    icon(){
      return LBSV.SERVICE_TYPEs[this.service.type]?.icon||'amount'
    },
    serviceHasPassword(){
      const {type,agenttype}=this.service;
      const isWrongPasswordService=this.billingTypeID==LBSV.ASRT_BILLING_TYPE_ID&&agenttype==1;//40206469306
      return [
        LBSV.SERVICE_TYPEs.internet.type,
        LBSV.SERVICE_TYPEs.phone.type
      ].includes(type) && !isWrongPasswordService;
    },
    isSamatlor(){
      return this.service.type==LBSV.SERVICE_TYPE_INTERNET.type&&this.account.billingid==6014
    },
    isActive(){
      const {status}=this.service;
      return status=='0'||(this.billingTypeID==4&&status=='12')
    },
    isAvailableForActivation(){
      const {available_for_activation,status}=this.service;
      return available_for_activation || status=='10'// || status=='1'
    },
    stateClass(){
      return this.isActive?'main-green':'main-red';
    },
    credentialsByEquipments(){
      return this.equipments.reduce((credentialsBySerial,equipment)=>{
        const {credentials,serviceEquipment:{hardnumber=''}}=equipment;
        if(credentials&&hardnumber){
          credentialsBySerial[hardnumber]=credentials
        };
        return credentialsBySerial
      },{});
    },
  },
  methods: {
    testAndOpenModalOrLoadInfo() {
      const {account,accountNumber,service,billingTypeID}=this;
      const agreement=account.agreements.find(({agrmid})=>agrmid==service.agrmid);
      const reportData={
        accountID:accountNumber,
        mrID:account.mr_id,
        serverID:account.serverid,
        billingTypeID,
        billingInst:account.billinginst,
        typeOfBindID:account.typeOfBindID,
        xRad:account.xRad,
        agrm:{
          agrmID:service.agrmid,
          account:agreement?.account,
          agrmNumber:agreement?.agrmnumber,
          vg:{
            vgID:service.vgid,
            login:service.login,
            parentID:service.parentid,
            packageTypeID:service.packagetypeid,
            status:service.status,
            agentType:service.agenttype,
            authType:[this.serviceAuthType],
            profile:this.serviceProfile?.[0],
          },
        }
      };
      if(!this.serviceProfile){
        this.$report(['click/billingInfo/preLoadInfo',reportData],this.getServiceProfile());
        return
      };
      this.$report({'click.billingInfo.openModal':reportData},this.$refs.billing_info_modal?.open());
    },
    async getServiceAuthType(){
      const {serverid,vgid,login}=this.service;
      this.serviceAuthTypeLoading=!0;
      try {
        const response=await AAAService.getServiceAuthType(serverid,vgid,login);
        if(response.code=="200"&&response.data&&response.data.length&&response.data[0].auth_type){
          this.serviceAuthType = response.data[0].auth_type;
        };
      }catch(error){
        console.warn('getServiceAuthType',error)
      };
      this.serviceAuthTypeLoading=!1;
    },
    async getServiceProfile(){
      const {serverid,vgid,login}=this.service;
      this.serviceProfileLoading=!0;
      try {
        const response=await AAAService.getServiceProfile(serverid,vgid,login);
        if(Array.isArray(response?.data)&&response.data[0]&&(response.data[0].rate||response.data[0].rate==0)){
          this.serviceProfile=response.data;
        }else{
          this.serviceProfile=[response]; //временный костыль чтобы показать ошибку
        };
      }catch(error){
        console.warn('getServiceProfile',error)
      };
      this.serviceProfileLoading=!1;
    },
    async getServiceParams(){
      const {accountNumber,serviceType}=this;
      if(!accountNumber||!serviceType){return};
      this.serviceParamsLoading=!0;
      try {
        const response=await SMSGatewayService.ServiceParams.useCache(accountNumber,serviceType);
        if(Array.isArray(response?.data?.parameters)){
          this.serviceParams = response.data.parameters;
        };
      }catch(error){
        console.warn('getServiceParams',error)
      };
      this.serviceParamsLoading=!1;
    },
    activate(){
      this.$refs.modal.open();
    },
    async openModal(ref=""){
      if(!this.serviceParams){
        await this.getServiceParams();
      };
      if(!this.serviceParams){return};
      if(ref&&this.$refs[ref]){
        this.$refs[ref].open();
      }
    },
    closeModal(ref = "") {
      if (ref && this.$refs[ref]) {
        this.$refs[ref].close();
      }
    },
  },
});
