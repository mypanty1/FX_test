document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/FixIptvCodeAndCredentials.js',type:'text/javascript'}));

Vue.component("lbsv-service-el", {//fix iptv code and add credentials
  template: "#lbsv-service-el-template",
  template:`<section>
    <title-main textClass="font--13-500" :text="typeService" :text2="service.statusname" :text2Class="stateClass" :textSub="service.agentdescr" textSubClass="tone-500 font--12-400">
      <i slot="icon" class="ic-20" :class="['ic-'+icon,stateClass]"></i>
      <button-sq v-if="service.type=='internet'" :icon="loading.get_user_rate?'loading rotating':(user_rate&&user_rate.length&&!user_rate[0].isError)?'info':'warning tone-300'" type="large" @click="testAndOpenModalOrLoadInfo"/>
    </title-main>
    <billing-info-modal ref="billing_info_modal" :billing-info="[user_rate||[]]" :loading="loading.get_user_rate"/>
    
    <title-main textClass="tone-500 font--12-400" :text="service.tarif||service.tardescr" textSubClass="font--13-500" textSub1Class="tone-500" :textSub="auth_type||rate" :textSub2="auth_type?rate:''" :style="(auth_type||rate)?'':'margin:-10px 0px;'">
      <button-sq :icon="(loading.get_auth_type||loading.get_user_rate)?'loading rotating':''" type="medium"/>
    </title-main>
    
    <div class="mx-3" style="display:grid;gap:4px;grid-template-columns:1fr 1fr 1fr 1fr;">
      <lbsv-login-pass v-if="serviceHasPassword" :service="service" :billingid="account.billingid" style="grid-area: 1/1/2/5;"/>
      <title-main v-else textClass="font--16-500" :text1Class="[1,4,5,6].includes(service.billing_type)?'':'tone-500'" :text2Class="[2,3].includes(service.billing_type)?'':'tone-500'" :text="service.login||service.vgid" :text2="service.login?service.vgid:''" style="grid-area: 1/1/2/5;"/>

      <template v-if="service.available_for_activation">
        <button-main style="grid-area: 2/1/3/3;" label="Активировать(old)" @click="activate" button-style="outlined" size="full"/>
        <button-main style="grid-area: 2/3/3/5;" label="Активировать" @click="openModal('service_activation_modal')" button-style="outlined" size="full"/>
      </template>
      <template>
        <button-main style="grid-area: 3/1/4/3;" label="Заменить AO" @click="openModal('equipment_replace_modal')" button-style="outlined" size="full"/>
        <button-main style="grid-area: 3/3/4/5;" label="Привязать AO" @click="openModal('equipment_add_modal')" button-style="outlined" size="full"/>
      </template>

      <account-iptv-code v-if="serviceType==='IPTV'" :account="accountNumber" :service="service" style="grid-area: 4/1/5/5;"/>
      
      <equipment-credentials v-for="(credentials,hardnumber,i) in credentialsByEquipments" :credentials="credentials" :hardnumber="hardnumber" :key="i" :style="{'grid-area': (5+i)+'/1/'+(6+i)+'/5'}"/>
    </div>

    <info-text-sec v-if="service.descr" :text="service.descr" rowClass="font--12-400" rowStyle="color:#918f8f;"/>

    <!--если есть оборудование которое смапилось с услугой в lbsv-account-content-->
    <title-main v-if="service.equipments&&service.equipments.length" @open="open_eq=!open_eq" text="Оборудование" :text2="service.equipments.length" textClass="font--13-500"/>
    <template v-if="open_eq">
      <template v-for="(equipment,i) of service.equipments">
        <devider-line style="margin:0px 16px;"/>
        <equipment :key="i" :equipment="equipment" :account="accountNumber" :mr="mr" :services="[service]"/>
      </template>
    </template>
    
    <modal-container ref="modal">
      <activation-modal :service="service" :account="accountNumber"/>
    </modal-container>

    <modal-container-custom ref="service_activation_modal" :footer="false" :wrapperStyle="{'min-height':'auto'}">
      <service-activation-modal @close="closeModal('service_activation_modal')" :service="service" :account="accountNumber" :serviceType="serviceType" :serviceName="typeService"/>
    </modal-container-custom>

    <modal-container-custom ref="equipment_replace_modal" :footer="false">
      <equipment-replace-modal @close="closeModal('equipment_replace_modal')" :service="service" :account="accountNumber" :serviceType="serviceType" :serviceParams="serviceParams"/>
    </modal-container-custom>

    <modal-container-custom ref="equipment_add_modal" :footer="false">
      <equipment-add-modal @close="closeModal('equipment_add_modal')" :service="service" :account="accountNumber" :serviceType="serviceType" :serviceParams="serviceParams"/>
    </modal-container-custom>

  </section>`,
  props: {
    account: { type: Object, required: true },
    accountNumber: { type: String, required: true },
    service: { type: Object, required: true },
    mr: { type: Number },
    isB2b: Boolean,
    isTooManyInternetServices: Boolean,
  },
  data: () => ({
    auth_type: "",
    user_rate: null,
    rate: "",
    loading: {
      get_auth_type: false,
      get_user_rate: false,
      get_params: false,
    },
    serviceParams: [],
    open_eq: true,
  }),
  computed: {
    isInernet() {
      return this.service.type == "internet" && this.service.isSession;
    },
    typeService() {
      return {
        "internet":"Интернет",
        "tv":"Телевидение",
        "analogtv":"Аналоговое ТВ",
        "digittv":"Цифровое ТВ",
        "phone":"Телефония",
        "hybrid":"ИТВ",
        "iptv":"IPTV",
        "other":"Другое",
      }[this.service.type]||this.service.serviceclassname;
    },
    serviceType() {
      switch (this.service.type) {
        case "phone":
          return "VOIP";
        case "digittv":
          return "CTV";
        case "internet":
        case "ott":
          return "SPD";
        case "iptv":
          return "IPTV";
        case "hybrid":
          return "ITV";
        case "analogtv":
        case "other":
        default:
          return;
      }
    },
    icon() {
      switch (this.service.type) {
        case "internet":
          return "eth";
        case "tv":
        case "analogtv":
        case "digittv":
        case "hybrid":
          return "tv";
        case "phone":
          return "phone-1";
        case "other":
        default:
          return "amount";
      }
    },
    serviceHasPassword() {
      return this.service.type == "internet" || this.service.type == "phone";
    },
    stateClass() {
      return this.service.status == "0" ||
        (this.service.billing_type == 4 && this.service.status == "12")
        ? "main-green"
        : "main-red";
    },
    authAndSpeed() {
      const fields = [this.auth_type, this.rate];
      if (fields.length == 1) {
        return fields[0];
      }
      return fields.filter((field) => field).join(" • ");
    },
    credentialsByEquipments(){
      const {equipments}=this.service;
      return equipments.reduce((credentialsBySerial,equipment)=>{
        const {credentials,service_equipment:{hardnumber=''}}=equipment;
        if(credentials&&hardnumber){
          credentialsBySerial[hardnumber]=credentials
        };
        return credentialsBySerial
      },{});
    },
  },
  created() {
    if (this.isInernet && !this.isB2b && !this.isTooManyInternetServices) {
      this.getAuthAndSpeed();
    }
    this.getParams();
  },
  methods: {
    testAndOpenModalOrLoadInfo() {
      if (this.loading.get_user_rate) {
        return;
      }
      if (!this.user_rate && this.isInernet) {
        this.getAuthAndSpeed();
      } else {
        this.openModal("billing_info_modal");
      }
    },
    getAuthAndSpeed() {
      let params = {
        login: this.service.login,
        vgid: this.service.vgid,
        serverid: this.service.serverid,
      };

      this.loading.get_auth_type = true;
      httpGet(buildUrl("get_auth_type", params, "/call/aaa/"), true)
        .then((response) => {
          this.loading.get_auth_type = false;
          if (
            response.code == "200" &&
            response.data &&
            response.data.length &&
            response.data[0].auth_type
          ) {
            this.auth_type = response.data[0].auth_type;
          }
        })
        .catch((error) => {
          console.warn("get_auth_type:error", error);
          this.loading.get_auth_type = false;
        });

      this.loading.get_user_rate = true;
      httpGet(buildUrl("get_user_rate", params, "/call/aaa/"), true)
        .then((response) => {
          this.loading.get_user_rate = false;
          if (
            response.code == "200" &&
            response.data &&
            response.data.length &&
            (response.data[0].rate || response.data[0].rate == 0)
          ) {
            this.rate = response.data[0].rate + " Мбит/c";
            this.user_rate = response.data;
          } else {
            this.user_rate = [response]; //временный костыль чтобы показать ошибку
          }
        })
        .catch((error) => {
          console.warn("get_user_rate:error", error);
          this.loading.get_user_rate = false;
        });
    },
    getParams() {
      if (!this.accountNumber || !this.serviceType) return;
      this.loading.get_params = true;
      httpGet(
        buildUrl(
          "get_params",
          {
            account: this.accountNumber,
            service_type: this.serviceType,
          },
          "/call/sms_gateway/"
        )
      )
        .then((result) => {
          this.loading.get_params = false; //result=dev_getParams['20410086886']['SPD'].data;
          if (
            !result.isError &&
            result.result_code === "OK" &&
            result.parameters
          ) {
            this.serviceParams = result.parameters;
          }
        })
        .catch((error) => {
          console.warn(error);
          this.loading.get_params = false;
        });
    },
    activate() {
      this.$refs.modal.open();
    },
    openModal(ref = "") {
      if (ref && this.$refs[ref]) {
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

//[Vue warn]: Invalid prop: type check failed for prop "credentials". Expected Array, got Object.
Vue.component('equipment-credentials',{//30105741270
  template:`<div v-if="isCredentials&&parsed.activationcode" class="my-1">
    <button-main @click="show=!show" :icon="show?'':'unlock'" :label="show?parsed.activationcode:activationcodeBtnTitle" :class="show?'password':''" size="full" button-style="outlined"/>
  </div>`,
  props:{
    credentials:{type:[Array,Object],default:null,required:true},
    hardnumber:{type:String,default:''},
  },
  data:()=>({
    show:false,
  }),
  computed:{
    isCredentials(){
      return !!this.credentials;
    },
    credentialsAsArray(){
      return Array.isArray(this.credentials)?this.credentials:[this.credentials];
    },
    parsed(){
      return this.credentialsAsArray.reduce((parsed,credential)=>{
        const {code,value:{value}}=credential;
        parsed[code.toLowerCase()]=value;
        return parsed
      },{});
      //login - iptv,spd
      //password - voip,spd
      //phonenumber - voip
      //activationcode - iptv
    },
    activationcodeBtnTitle(){
      const title=['Код активации'];
      if(this.hardnumber){title.push('для',this.hardnumber)};
      return title.join(' ');
    }
  },
});


