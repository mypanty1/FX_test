//TODO add
Vue.component("ForisAccountMain", {
  template:`<CardBlock name="ForisAccountMain" v-if="account">
    <title-main>
      <div slot="prefix">
        <IcIcon name="status" :class="!agreement.closedon?'main-green':'main-red'"/>
      </div>
      <span slot="text" class="display-flex align-items-center gap-5px">
        <span>{{accountId}}</span>
        <span v-if="agreement?.closedon" class="font--12-400 tone-500">расторгнут {{agreement.closedon}}</span>
        <span v-if="!!msisdn&&!agreement?.closedon" class="lbsv-account__convergent">Конвергент</span>
      </span>
    </title-main>
    <devider-line/>
    <info-text-icon icon="" :text="formatedAddress" type="medium"/>
    <devider-line/>
    <title-main icon="person" :text="account.name" textClass="text-transform-capitalize"/>
    <div v-if="agreement && phone === msisdn">
      <account-call v-if="!!msisdn" :phone="msisdn" :isConvergent="!!msisdn" class="margin-bottom-16px" showSendSms/>
    </div>
    <div v-else>
      <account-call v-if="!!msisdn" :phone="msisdn" :isConvergent="!!msisdn" class="margin-bottom-16px" showSendSms/>
      <account-call v-if="phone" :phone="phone" class="margin-bottom-16px" showSendSms/>
    </div>

    <devider-line v-if="agreement"/>
    <template v-if="agreement">
      <info-value icon="purse" :label="balanceLabel" :value="balance" :minus="agreement.balance.minus" type="extra"/>
      <info-value icon="purse" v-if="msisdn && convergentBalance" :label="balanceLabelConvergent" :value="convergentBalance+' ₽'" :minus="convergentBalance < 0" type="extra"/>
      <info-value icon="clock" v-if="agreement.lastpaydate" label="Платеж" :value="lastPayText" type="extra"/>
    </template>
    <devider-line/>
      
    <link-block icon="sms" text="Смс с новым паролем" @block-click="openSendSmsModal" action-icon="expand"/>
    <send-sms-modal ref="sendSms" :account="accountId"/>
    <template v-if="favBtnProps">
      <devider-line/>
      <FavBtnLinkBlock v-bind="favBtnProps"/>
    </template>
  </CardBlock>`,
  props:{
    account:{type:Object,default:null},
    agreement:{type:Object,default:null},
    flatData:{type:Object,default:null},
    loading:{type:Object,required:true},
    billingInfo:{type:Array,default:()=>[]},
    //convergentBalance:{type:[String,Number],default:null},
    accountId:{type:String,default:''},
    flat:{type:Object,default:null}
  },
  data:()=>({
    msisdn:'',
    convergentBalance:null,
  }),
  created(){
    this.getConvergent();
  },
  computed: {
    favBtnProps(){
      if(!this.account||!this.agreement){return};
      const {agreement,agreement:{account},msisdn}=this;
      return {
        title:`Абонент ${truncateSiteAddress(this.formatedAddress).replace(/(, )/,',')}`,
        name:account,
        id:account,
        path:`/${account}`,//если открыт из наряда
        descr:[
          objectToTable(filterKeys(this.account,{
            '!1':['ЛС',account],
            name:'Абонент|-',
            mobile:['Тлф',(m,account)=>account.mobile||account.phone],
            '!2':['Конвергент',msisdn||'-']
          })),
          objectToTable(filterKeys(this.agreement,Object.values(agreement.services||{}).map(({vgroups=[]}={})=>vgroups||[]).flat().reduce((services,service)=>{
            if(!service||service.status=='10'){return services};
            services[service.vgid]=[`${service.serviceclassname} [${service.vgid}]`,`${([1,4,5,6].includes(service.billing_type)?`${service.login} `:'')}${service.agentdescr}`]
            return services;
          },{})))
        ].join('\n'),
      }
    },
    addr_type2(){//0-прописки, 1-проживания, 2-доставки счетов
      if(!this.account?.vgroups?.[0]||!this.agreement){return ""};
      const addresses=this.account.vgroups.find(service=>service.agrmid==this.agreement.agrmid&&service.addresses.find(address=>address?.type==2))?.addresses||[];
      const addr_type2=addresses?.find(address=>address?.type==2)?.address;
      return addr_type2||''
    },
    computedAddress() {
      if (!this.account) return "";
      if (this.agreement) {
        const service = this.account.vgroups.find((s) => s.agrmid == this.agreement.agrmid && s.connaddress);
        if (service) return service.vgaddress || service.connaddress;
      }
      let address = {};
      if (Array.isArray(this.account.addresses)) {
        address = this.account.addresses.find((a) => a.address) || {};
      }
      return this.account.address || address.address || "";
    },
    formatedAddress(){
      const address=this.addr_type2||this.computedAddress;
      if(!address){return ''};
      return address.split(',').map(elem=>elem.trim()).filter(v=>v).join(", ")
    },
    balance(){
      const {balance}=this.agreement;
      return `${balance.minus?'-':''}${balance.integer}.${balance.fraction} ₽`;
    },
    lastPayText(){
      const lastsum=this.agreement.lastsum||'';
      const lastpaydate=this.agreement.lastpaydate||'';
      return `${lastsum} ${lastsum?'₽':''} ${lastpaydate?'•':''} ${lastpaydate}`;
    },
    phone(){return this.account.mobile||this.account.phone},
    balanceLabel(){return `Баланс (ЛС ${this.accountId})`},
    balanceLabelConvergent(){return `Баланс (+${this.msisdn})`},
  },
  methods: {
    openSendSmsModal() {
      this.$refs.sendSms.open();
    },
    async getConvergent(){
      await this.getMsisdn();
      if(this.msisdn){
        this.getConvergentBalance();
      };
    },
    async getMsisdn(){
      const {agreement:{account}={}}=this;
      if(!account){return};
      try{
        const response=await httpGet(buildUrl("get_user_phone",{agrm_num:account},"/call/sri/"));
        this.msisdn = response?.return?.indexOf('not found') === -1 ? response.return : '';
      }catch(error){
        console.warn("get_user_phone.error",error);
      };
    },
    async getConvergentBalance(){
      const {msisdn}=this;
      if(!msisdn){return};
      try{
        const response=await httpGet(buildUrl("convergent",{msisdn},"/call/v1/foris/"));
        this.convergentBalance=response.balance;
      }catch (error){
        console.warn("convergent.error",error);
      };
    },
  },
});

//TODO ref
Vue.component('ForisAccountContent2', {
  template:`<section name="ForisAccountContent2" class="account-page">
    <CardBlock>
      <title-main>
        <div v-if="accountStatus" slot="prefix"><i class="ic-20 ic-status main-green"></i></div>
        <div v-else slot="prefix"><div class="ic-20 ic-status main-red"></div></div>
        <span slot="text">
          <span>{{account.personal_account_number}}</span>
        </span>
        <span slot="text" v-if="account.msisdn">
          <span> • </span> 
          <span class="lbsv-account__convergent">Конвергент</span>
        </span> 
      </title-main>

      <loader-bootstrap v-if="loading.resources" text="получение данных по абоненту"/>

      <template v-if="computedAddress">
        <devider-line />
        <info-text-icon :text="computedAddress" type="medium" icon=""/>
        <devider-line />
      </template>
      <title-main :text="account.customer_name" icon="person" class="text-transform-capitalize" />
      
      <account-call v-if="!phoneCheck" :isConvergent="account.msisdn" :phone="account.msisdn" class="margin-bottom-16px" showSendSms/>
      <account-call v-if="contactPhone && account.msisdn != contactPhone" :phone="contactPhone" class="margin-bottom-16px" showSendSms/>
      
      <devider-line />
      <info-value icon="purse" :value="balance" type="extra" label="Баланс"/>
      <info-value icon="clock" :value="lastPayment" type="extra" label="Платеж" />
      
      <link-block @block-click="openBillingInfo" text="Информация в биллинге" icon="server" action-icon="expand" />
      <billing-info-modal ref="billingInfo" :billing-info="billingInfo" :loading="loading.resources" />
    </CardBlock>
    <!--
    <ForisAccountMain v-bind="{account,accountId,agreement,flatData,billingInfo,convergentBalance,loading,flat}"/>
    -->
    <CardBlock>
      <title-main icon="accidents" text="Работы по абоненту"  :attention="hasActiveIncident ? 'warn' : null" @block-click="toEvents">
        <button-sq icon="right-link" class="pointer-events-none"/>
      </title-main>
    </CardBlock>
    <foris-services v-if="!loading.accountDevice" :loading-account-device="loading.accountDevice" :account="account" :resources="resources" :account-device="accountDevice" :loading="loading.resources"/>
    <foris-account-block-history :history="blockHistory"/>
  </section>`,
  props:{
    account:{type:Object,default:null,required:true},
    accountId:{type:String,default:'',required:true},
  },
  data:()=>({
    events: '',
    contactPhone: null,
    accountDevice: null,
    resources: {
      mobile: [],
      internet: [],
      other: [],
      hybrid: [],
      tv: [],
      iptv: [],
      phone: [],
      smart_home: []
    },
    last_payment: null,
    loading: {
      contacts: false,
      accountDevice: false,
      resources: false,
      blockHistory: false
    },
    billingInfo: [],
    blockHistory: [],
  }),
  mounted() {
    this.loadContacts()
    this.loadAccountDevice();
    this.loadResources();
    this.getPayments();
    this.loadBlockHistory();
  },
  computed: {
    computedAddress() {
      if (this.loading.resources) return '';
      let address = this.account.address;
      const internetWithAddress = this.resources.internet.find(service => service.address);
      if (internetWithAddress) {
        address = internetWithAddress.address;
      } else {
        for (const key in this.resources) {
          const serviceWithAddress = this.resources[key].find(service => service.address);
          if (serviceWithAddress) { address = serviceWithAddress.address }
        }
      }
      if (!address) return ''
      return address
        .split(',')
        .map(elem => elem.trim())
        .filter(elem => elem)
        .join(", ")
    },
    hasActiveIncident() {
      if (!this.events) return false;
      return Boolean(this.events.active && this.events.active.length);
    },
    lastPayment() {
      const payment = this.last_payment;
      if (!payment) return null;
      const amount = payment.amount ? `+ ${payment.amount} ₽` : '';
      const date = payment.date_of_payment;
      return `${amount} ${date}`;
    },
    balance() {
      return this.account.balance ? this.account.balance + " ₽" : '-'
    },
    accountStatus() {
      const personalAccountStatus = [...this.account.customer.personal_accounts];
      const status = personalAccountStatus.some(item =>  
        item.personal_account_status === "Активен");
      return status
    },
    phoneCheck() {
      const phoneCheck = this.account.msisdn.startsWith("76");
      return phoneCheck
    }
  },
  methods: {
    openBillingInfo() {
      this.$refs.billingInfo.open();
    },
    toEvents() {
      this.$router.push({
        name: "account-events",
        params: {
          accountId: this.account.personal_account_number,
        },
      });
    },
    async loadAccountEvents() {
      const account = this.account;
      const accountDevice = this.accountDevice
      const params = {
        to: new Date(),
        from: Dt.addDays(-1),
        contract: account.contract_number,
        device: accountDevice ? accountDevice.device.name : null,
        id: accountDevice ? accountDevice.device.nioss_id : null,
        regionid: accountDevice ? accountDevice.region.mr_id : null,
        serverid: account.serverid,
      };
      try {
        const method = params.device ? 'events_by_contract' : 'events_by_contract_without_shpd';
        const response = await httpGet(buildUrl(method, params));
        this.events = response;
      } catch (error) {
        console.error("Load account events:", error);
      }
    },
    async loadContacts() {
      this.loading.contacts = true;
      const { personal_account_number } = this.account
      const url = buildUrl('contacts', { personal_account_number }, '/call/v1/foris/')
      try {
        const data = await CustomRequest.get(url);
        this.contactPhone = data.phone
      } catch (error) {
        console.error('Error load contacts')
      }
      this.loading.contacts = false;
    },
    async loadAccountDevice() {
      this.loading.accountDevice = true;
      const account = this.account.personal_account_number
      const url = buildUrl('search_by_account', { account }, '/call/v1/device/')
      try {
        const data = await CustomRequest.get(url);
        if (data.type != 'error') {
          this.accountDevice = data
        }
      } catch (error) {
        console.error('Error load account device')
      }
      this.loadAccountEvents();
      this.loading.accountDevice = false;
    },
    async loadResources() {
      this.loading.resources = true;
      const { personal_account_number } = this.account

      const url = buildUrl('resources', { personal_account_number }, '/call/v1/foris/')
      try {
        const data = await CustomRequest.get(url);
        // convert lbsv type
        if (Array.isArray(data.internet) && data.internet.length > 0) {
          data.internet = data.internet.map(service => {
            service.device = service.device.map(device => ({
              ...device,
              id: device.serial,
              serial: null,
              type: 'wifi'
            }))
            return service
          })
        }
        this.resources = await this.getLoginPass(data);
        this.resources = await this.getAuthAndSpeed(this.resources);
      } catch (error) {
        console.error('Error load account resources', error)
      }
      this.loading.resources = false;
    },
    async getPayments() {
      this.loading.payments = true;
      const personal_account_number = this.account.personal_account_number;
      const url = buildUrl('payments', { personal_account_number, last: true }, '/call/v1/foris/')
      try {
        const data = await CustomRequest.get(url);
        this.last_payment = data;
      } catch (error) {
        console.error('load payments', error);
      }
      this.loading.payments = false;
    },
    async getLoginPass(resources){
      if(resources.length===0){return};
      const promises=[];
      const exisdData=response=>response.code=="200"&&response.data&&response.data.length>0;
      try{
        for(const service of resources.internet){
          promises.push(
            httpGet(buildUrl('get_login',{msisdn:service.msisdn,serverid:this.account.serverid},'/call/aaa/'),true).then(response=>{
              if(exisdData(response)&&response.data[0].login){
                service.login=response.data[0];
              };
            })
          );
        };
        await Promise.all(promises);
      }catch(error){
        console.warn("get_login.error",error);
      }
      return resources;
    },
    async getAuthAndSpeed(resources) {
      const account = this.account;
      this.billingInfo = [];
      if (resources.length === 0) return;
      const promises = [];
      const exisdData = response => response.code == "200" && response.data && response.data.length > 0;
      try {
        for (const service of resources.internet) {
          if(!service.login?.login){continue};
          const params = {
            login: service.login.login,//#2700175 need get_login before
            vgid: service.msisdn,
            serverid: account.serverid,
            date: "",
          };
          promises.push(
            httpGet(buildUrl("get_auth_type", params, "/call/aaa/"), true).then((response) => {
              if (exisdData(response) && response.data[0].auth_type) {
                service.auth_type = response.data[0].auth_type;
              }
            })
          );
          promises.push(
            httpGet(buildUrl("get_user_rate", params, "/call/aaa/"), true).then((response) => {
              // C точки зрения биллинга, скорость = 0 - это скорость без ограничений(т.е. по тарифу).
              // Требуется при скорости = 0, отображать "Информацию в биллинге".
              if (exisdData(response) && (response.data[0].rate || response.data[0].rate == 0)) {
                this.billingInfo.push(response.data);
                service.rate = response.data[0].rate + " Мбит/c";
              }
            })
          );
        }
        await Promise.all(promises);
      } catch (error) {
        console.error("getAuthAndSpeed :", error);
      }
      return resources
    },
    async loadBlockHistory() {
      this.loading.blockHistory = true;
      const { personal_account_number } = this.account
      const today = new Date();
      let before = new Date();
      before.setMonth(before.getMonth() - 3);
      const params = {
        personal_account_number,
        from: Datetools.format(before),
        to: Datetools.format(today),
      };
      const url = buildUrl('blocks_history', params, '/call/v1/foris/')
      try {
        const response = await CustomRequest.get(url);
        this.blockHistory = response||[];
      } catch (error) {
        console.error('Error load hystory of blocks')
      }
      this.loading.blockHistory = false;
    }
  },
  beforeRouteEnter(to, from, next) {
    if (!to.params.account) {
      next({
        name: 'search',
        params: { text: to.params.accountId },
      });
      return;
    }
    next();
  },
});

//for tasks
Vue.component('foris-account-content', {
  template:`<ForisAccountContent2 v-bind="$props"/>`
});

Vue.component("account-wrapper2", {
  template:`<div name="account-wrapper2">
    <page-navbar :title="title" @refresh="refresh" />
    <account-header v-bind="{accountId,flat,loading,key}"/>
    <transition v-if="showContent" name="slide-page" mode="out-in">
      <keep-alive>
        <router-view v-bind="{accountId,flat,key}" :account="currentData.account" :mr_id="currentData?.account?.mr_id" @change-account="goToCurrentAccount"/>
      </keep-alive>
    </transition>
  </div>`,
  props: {
    accountId: { type: String, required: true },
    flatProp: { type: Object, default: null },
    accountResponse: { type: Object, default: null },
  },
  data() {
    return {
      flat: this.flatProp,
      accountResponses: {},
      loading: {
        flat: false,
      },
      showLocation: false,
      infoOpened: false,
    };
  },
  created() {
    if (this.accountResponse) this.accountResponses[this.accountId] = this.accountResponse;
    if (!this.flat) this.loadFlat(this.accountId);
  },
  watch: {
    "$route.params.accountId": function (newId, oldId) {
      if (newId === oldId) return;
      this.loadAccount(newId);
      if (this.needLoadFlat(newId)) {
        this.loadFlat(newId);
      }
    },
    "$route.name": function (newName, oldName) {
      if (oldName !== 'account-flat2') return;
      this.loadAccount(this.accountId);
      if (this.needLoadFlat(this.accountId)) {
        this.loadFlat(this.accountId);
      }
    },
  },
  computed: {
    currentData() {
      const response = this.accountResponses[this.accountId];
      if (!response) return { billing: null, account: null };
      const foris = response['v1::foris'];
      const lbsv = response['lbsv'];
      return {
        billing: foris ? 'foris' : 'lbsv',
        account: foris ? foris.data : lbsv.data
      }
    },
    title() {
      const flatNumber = this.flat ? this.flat.number : '';
      if (this.$route.name === "flat2") return `Кв. ${flatNumber}`;
      return this.accountId;
    },
    key() {
      if (this.$route.name === "account-flat2") return `${this.accountId}_flat`;
      if (this.$route.name === "account-proxy2") return `account-proxy2`;
      return this.accountId;
    },
    showContent() {
      const routeName = this.$route.name;
      if (routeName === 'account-proxy2') return true;
      if (routeName === 'account-flat2') return Boolean(this.flat);
      if (['account-lbsv2', 'account-foris2'].includes(routeName)) {
        return Boolean(this.currentData);
      }
    }
  },
  methods: {
    async loadFlat(accountId) {
      if (this.loading.flat) return;
      this.flat = null;
      this.loading.flat = true;
      let response = this.$cache.getItem(`flat_client_service_list/${accountId}`);
      if (response) {
        this.parseFlat(response);
      } else {
        try {
          //#INFO flat_number: '' - Обязательно пустая строка требование бэка
          const params = { account: accountId, flat_number: "" };
          response = await httpGet(buildUrl("flat_client_service_list", params, '/call/v1/device/'));
          if (response.type === "error") throw new Error(response.text);//foris: text: "Data has not been received"
          this.$cache.setItem(`flat_client_service_list/${accountId}`, response);
          this.parseFlat(response);
        } catch (error) {
          console.warn("flat_client_service_list.error", error);
        }
      }
      this.parseFlat(response);
      this.loading.flat = false;
    },
    parseFlat(response = []) {
      if (Array.isArray(response) && response.length) {
        this.flat = response[0];
      } else {
        this.flat = null;
      }
    },
    async loadAccount(accountId) {
      if (this.accountResponses[accountId] || this.loading[accountId]) return;
      this.loading[accountId] = true;
      let response = this.$cache.getItem(`search_ma/${accountId}`);
      if (response) {
        this.parseAccount(response);
      } else {
        try {
          response = await httpGet(buildUrl("search_ma", { pattern: accountId }, "/call/v1/search/"));
          if (response.type === "error") throw new Error(response.text);
          this.$cache.setItem(`search_ma/${accountId}`, response.data);
          this.parseAccount(response.data);
        } catch (error) {
          console.error("Load account:", error);
        }
      }
      this.loading[accountId] = false;
    },
    parseAccount(response) {
      this.accountResponses = { ...this.accountResponses, [this.accountId]: response };
      // this.goToCurrentAccount();
    },
    refresh() {
      localStorage.clear();
      document.location.reload();
    },
    needLoadFlat(accountId) {
      if (!this.flat || !this.flat.subscribers) return true;
      const clear = x => x.replace(/-/g, "");
      return !this.flat.subscribers.some(client => clear(client.account) === clear(accountId));
    },
    goToCurrentAccount() {
      const { account, billing } = this.currentData;
      if (billing === 'lbsv') {
        this.$router.replace({
          name: "account-lbsv2",
          params: {
            accountId: this.accountId,
            account,
            mr_id: account.mr_id
          },
        });
      } else if (billing === 'foris') {
        this.$router.replace({
          name: 'account-foris2',
          params: {
            accountId: this.accountId,
            account,
            mr_id: account.mr_id
          }
        });
      } else {
        console.error('No account data');
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    const accountId = to.params.accountId;
    if (this.needLoadFlat(accountId)) this.loadFlat(accountId);
    next();
  },
  beforeRouteEnter(to, from, next) {
    const rightName = ['account-proxy2', 'account-lbsv2', 'account-foris2'].includes(to.name);
    if (rightName && !to.params.accountResponse) {
      next({
        name: "search",
        params: { text: to.params.accountId },
      });
      return;
    }
    next();
  },
});

router.addRoutes([
  {//абонент
    path:'/account2',
    component:Vue.component('account-wrapper2'),
    props:true,
    children:[
      {
        path:'flat2/:accountId',
        name:'account-flat2',
        exact:true,
        props:true,
        component:Vue.component('account-flat-content'),
      },
      {
        path: 'lbsv2/:accountId',
        name: 'account-lbsv2',
        exact: true,
        props: true,
        component: Vue.component('lbsv-account-content'),
      },
      {
        path:'foris2/:accountId',
        name:'account-foris2',
        exact:true,
        props:true,
        component:Vue.component('ForisAccountContent2'),
      },
      {
        path:':accountId',
        name:'account-proxy2',
        exact:true,
        props:true,
        component:Vue.component('account-proxy'),
      },
    ],
  }
]);

router.beforeEach((to,from,next)=>{
  if(to.name=='account-flat'){
    next({...to,name:'account-flat2'})
  }else if(to.name=='account-lbsv'){
    next({...to,name:'account-lbsv2'})
  }else if(to.name=='account-foris'){
    next({...to,name:'account-foris2'})
  }else if(to.name=='account-proxy'){
    next({...to,name:'account-proxy2'})
  }else{
    next()
  };
});
























