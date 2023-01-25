
const FIX_test_version='FIX_test_30.12.22';
const FIX_test_app_version='FIX_test v1.6';
const dev=!Boolean(window.AppInventor);
if(dev){
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
  if(dev){console.log('buffer.size:',buffer.size)}
  if(buffer.size<max_buffer_size){return};
  const entries=[...buffer.entries()];
  const {region_id,username}=app||{};
  if(dev){console.log('buffer.size==max_buffer_size:',region_id,username,entries)};
  if(region_id===54&&username&&!dev){
    fetch('https://script.google.com/macros/s/AKfycbzV-IEHP2thb4wXGXPwmflsGwT8MJg-pGzXd1zCpekJ3b0Ecal6aTxJddtRXh_qVu0-/exec',{
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({region_id,username,entries})
    })
  }
  buffer.clear()
};

Vue.component('port-bind-user-modal',{//refree
  //template: '#port-bind-user-modal-template',
  template:`<modal-container-custom ref="modal" class="port-bind-user-modal" :wrapperStyle="{'min-height':'unset'}">
    <modal-title title="привязать лицевой счет" :subtitle="data.deviceParams.IP_ADDRESS+' порт '+data.portParams.PORT_NUMBER"/>
    <div style="margin-top:-20px;">
      <port-bind-user-account-input v-model="sample" @search="searchAccount" @erace="erace"/>
      <template v-if="accounts.length>0||searchError.text">
        <span class="port-bind-user-modal__result-title">результат поиска:</span>
        <div v-if="searchError.text" class="port-bind-user-modal__default-offset">
          <message-el :text="searchError.text" type="warn" box/>
        </div>
        <div v-if="accounts.length>0" class="port-bind-user-modal__content">
          <port-bind-user-account-elem
            v-for="account in accounts"
            v-model="resource"
            :account="account" 
            :loading="loading"
            :key="account.agreements.account"
          />
          <title-main v-if="!disabledCPE" :text="loading_cpe?'поиск CPE...':cpeTitle" textSize="medium" :opened="openBindCPE" @block-click="openBindCPE=!openBindCPE">
            <button-sq @click.stop="updateMacs" :icon="loading_cpe?'loading rotating':'refresh'" style="padding-right:27px;"/>
          </title-main>
          <service-activation-cpe ref="service_activation_cpe" v-if="openBindCPE&&!disabledCPE"
            :account="account||tmp_sample"
            :service="service"
            :cpes="cpes" :macs="mac.list"
            :port="data.portInfo" class="mx-3"/>
          
          <port-bind-user-forms 
            v-if="typeOfBind"
            :disabled="loading_cpe"
            :type-of-bind="typeOfBind" 
            :mac-list="mac.list"
            :clientIp="client_ip"
            v-model="mac.selected"
            @setupMacForUser="setupMacForUser"
            @insOnlyMac="insOnlyMac"
            @setBind="setBind"
            @updateClientIp="updateClientIp"
          />

          <div v-else-if="resource&&!typeOfBind" class="port-bind-user-modal__default-offset">
            <message-el text="Привязка этой учетной записи не осуществляется" :type="disabledCPE?'warn':'success'" box />
            <button-main v-if="openBindCPE" :disabled="loading_cpe" @click="addCpe" label="Привязать CPE" buttonStyle="contained" size="full" class="mt-3"/>
          </div>

          <div v-if="result" class="mt-3">
            <div v-if="result.type==='error'" class="port-bind-user-modal__default-offset">
              <message-el :text="result.text.slice(0,120)" type="error" box class="my-3" />
              <div v-if="result.refreedable"><!--add this-->
                <message-el :text="result.refreedable_message" type="warn" box class='my-3' />
                <div v-if="refree_result&&refree_result.refree_message">
                  <message-el :text="refree_result.refree_message" :type="refree_result.type" box class='my-3' />
                </div>
                <div>
                  <button-main label="освободить" @click="refree(result.refree_params)" :disabled="!!refree_loading" :loading="!!refree_loading" buttonStyle="contained" style="margin-left:auto;width:min-content;"/>
                </div>
              </div>
            </div>
            <template v-if="result.type!=='error'">
              <div v-if="result.InfoMessage" class="port-bind-user-modal__default-offset">
                <message-el :text="result.InfoMessage" type="success" box class="my-3"/>
              </div>
              <template v-if="result.Data">
                <info-value v-if="result.Data.ip" :value="result.Data.ip" label="Ip" type="medium" withLine/>
                <info-value v-if="result.Data.gateway" :value="result.Data.gateway" label="Шлюз" type="medium" withLine/>
                <info-value v-if="result.Data.mask" :value="result.Data.mask" label="Маска" type="medium" withLine/>
              </template>
              <link-block v-if="showAccountLink" :text="getAccountNumber()" :search="getAccountNumber()" icon="person"/>
            </template>
          </div>
        </div>
      </template>
      <loader-bootstrap v-if="loading"/>
    </div>
  </modal-container-custom>`,
  props: ['data'],
  data: function () {
    return {
      loading: false,
      sample: '',
      accounts: null,
      resource: null,
      client_ip: null,
      mac: {
        list: [],
        selected: ''
      },
      result: {},
      refree_result:{},//add
      refree_loading:false,//add
      searchError: {},
      tmp_sample: null,
      //add for service-activation-cpe
      disabledCPE:true,//если у account нет vgid
      openBindCPE:false,//show/hide service-activation-cpe
      service:null,//выбранный vgid
      account:'',//с выбора vgid
      modelForTitle:'',//для title шторки
      loading_cpe:false,//поиск cpe
      cpes:[],//найденные по макам с порта
    };
  },
  created() {
    this.erace();
    this.$root.$on('port-bind-user-vgid-elem->port-bind-user-modal:service-changed',data=>{
      if(data.service&&data.service.vgid&&data.account){
        this.service=data.service;
        this.account=data.account;
      }else{
        this.openBindCPE=false;
        this.service=null;
        this.account='';
      };
    });
  },
  watch:{
    'mac.list'(list){//ищем cpe по новым макам
      if(list.length){this.searchInAxiros()};
    },
    'cpes'(cpes){//обновляем шапку если нашелся cpe
      if(cpes.length){this.modelForTitle=cpes[0].model};
    },
    'resource'(value){
      if(value){
        this.getMacList();
      };
    },
    'accounts'(accounts){//блокировка для архивных или криво заведенных
      this.disabledCPE=!accounts.some(account=>account.vgids.length>0);
    },
  },
  computed: {
    cpeTitle(){
      return 'добавить CPE '+(this.modelForTitle||'');
    },
    typeOfBind_orig() {
      const isResource = this.resource && this.resource.type_of_bind;
      return isResource ? this.resource.type_of_bind : null;
    },
    typeOfBind() {//временно для Белгорода
      const [account={}]=this.accounts;
      if(!account){return};
      const {serverid}=account;
      return serverid==112?3:this.resource?.type_of_bind||null;
    },
    showAccountLink() {
      const result = this.result;
      if (!result) return false
      const isResult = result.code == 200 || result.InfoMessage || result.Data;
      const isAccount = this.getAccountNumber();
      return isResult && isAccount
    },
    devicePortParams() {
      return {
        MR_ID: this.data.deviceParams.MR_ID,
        DEVICE_IP_ADDRESS: this.data.deviceParams.IP_ADDRESS,
        DEVICE_SYSTEM_OBJECT_ID: this.data.deviceParams.SYSTEM_OBJECT_ID,
        DEVICE_VENDOR: this.data.deviceParams.VENDOR,
        DEVICE_FIRMWARE: this.data.deviceParams.FIRMWARE,
        DEVICE_FIRMWARE_REVISION: this.data.deviceParams.FIRMWARE_REVISION,
        DEVICE_PATCH_VERSION: this.data.deviceParams.PATCH_VERSION,
        SNMP_PORT_NAME: this.data.portParams.SNMP_PORT_NAME,
      };
    }
  },
  methods: {
    addCpe(){
      this.$refs.service_activation_cpe.changeEquipment();
    },
    updateMacs(){
      this.loading_cpe=true;
      httpGet(buildUrl("port_mac_show",{
        ...this.devicePortParams,
        type:'array'
      },"/call/hdm/")).then(resp=>{
        if(resp.text&&resp.message==='OK'&&resp.text.length){
          this.mac.list=resp.text.filter(mac=>this.clearMac(mac));
        };
        this.loading_cpe=false;
      }).catch(error=>{
        this.loading_cpe=false;
      });
    },
    clearMac(mac=''){//x - временное решение для роли Партнер
      return ((mac.match(/\S{12,17}/gi)||[''])[0].replaceAll(/[^0-9A-Fa-fx]/gi,'').match(/[0-9A-Fa-fx]{12}/gi)||[''])[0];
    },
    searchInAxiros(){
      if(!this.mac.list.length){return};
      this.loading_cpe=true;
      Promise.allSettled([//проходим по каждому маку с порта + подмешиваем его к результату(нужен далее для регистрации)
        ...this.mac.list.map(mac=>httpPost("/call/axiros/cpe_registre",{mac}).then(result=>this.cpes=[...this.cpes,...result.length?result.map(cpe=>({...cpe,mac})):[]])),
      ]).then(resps=>{
        this.loading_cpe=false;
      }).catch(error=>{
        this.loading_cpe=false;
      });
    },
    open(){//public
      this.$refs.modal.open();
      this.$emit('open');
    },
    updateClientIp(value) {
      this.client_ip = value;
    },
    clear() {
      this.accounts = [];
      this.searchError = {};
      this.resource = null;
      this.result = {};
      this.tmp_sample = null
      this.mac.selected='';
    },
    erace() {
      this.sample = '';
      this.clear();
    },
    getAccountNumber() {
      const accounts = this.accounts;
      if (!this.tmp_sample) return false
      const found_agreement = accounts.find((account) => {
        if (!account.agreements) return false;
        if (!account.agreements.account) return false
        const current_account = account.agreements.account.replace(/-/g, '');
        const current_search = this.tmp_sample.replace(/-|\s/g, '');
        return current_account == current_search
      });
      if (found_agreement) return found_agreement.agreements.account
      return false
    },
    async searchAccount() {
      if (this.sample.trim().length === 0) return;
      this.clear();
      this.loading = true;
      const setError = () => {
        this.searchError = {
          type: "warning",
          text: "ЛС не найден"
        }
      }
      try {
        const response = await httpGet(buildUrl("search_ma", { pattern: this.sample }, "/call/v1/search/"));
        if (response.type === 'error') {
          setError()
          return
        }
        const accounts = this.getAccounts(response.data);
        this.accounts = accounts;
        this.tmp_sample = this.sample
        if (accounts.length === 0) setError();
      } catch (error) {
        setError()
        console.error("error load account", error)
      }
      this.loading = false
    },
    getAccounts(response) {
      let data = [];
      if (response && response.lbsv) {
        if (response.lbsv.type === "single") {
          data.push(response.lbsv.data);
        } else {
          data = [...response.lbsv.data];
        }
      }
      const accounts = [];
      data.forEach((account) => {
        const found_agreement = account.agreements.find((item) => {
          const current_account = item.account.replace(/-/g, '');
          const current_search = this.sample.replace(/-|\s/g, '');
          return current_account == current_search
        });
        if (found_agreement) {
          account.agreements = found_agreement;
          account.vgids = this.getInternetResources(account.vgroups);
          account.vgids.sort((a, b) => { return b.vgid - a.vgid });
          account.vgids.sort((a, b) => { return b.dateOn - a.dateOn });
          accounts.push(account);
        }
      });
      return accounts
    },
    getInternetResources(vgroups) {
      var result = [];
      vgroups.forEach(vg => {
        if(!vg.isSession){return};
        const existDateOn = (vg.accondate || vg.accondate !== "0000-00-00 00:00:00");
        vg.dateOn = existDateOn ? new Date(Date.parse(vg.accondate)) : "Нет данных";
        result.push(vg);
      });
      return result;
    },
    setupMacForUser() {
      const params = {
        mac: this.mac.selected,
        port: this.data.portNumber,
        ip: this.data.deviceParams.IP_ADDRESS,
        account: this.sample,
        deviceName: this.data.deviceParams.DEVICE_NAME
      };
      Object.assign(params, this.resource);
      this.serviceMixQuery('ins_mac', params);
    },
    async getMacList() {
      const existTypeOfBind = [2, 5, 7, 9, 10].indexOf(this.resource.type_of_bind) >= 0;
      if(!existTypeOfBind){return};
      this.loading=true;
      const params = { ...this.devicePortParams, type: 'array' };
      try {
        const response = await httpGet(buildUrl("port_mac_show", params, "/call/hdm/"));
        if(response.text&&response.message==='OK'&&response.text.length){
          this.mac.list=response.text.filter(mac=>this.clearMac(mac));
        };
      } catch (error) {
        console.error('Load PortMacShow', error)
      }
      this.loading=false;
    },
    insOnlyMac() {
      const params = {
        mac: this.mac.selected,
        account: this.sample,
        port: this.data.portNumber,
        deviceName: this.data.deviceParams.DEVICE_NAME
      };
      Object.assign(params, this.resource);
      this.serviceMixQuery('ins_only_mac', params);
    },
    setBind(type_of_bind) {
      const params = {
        ip: this.data.deviceParams.IP_ADDRESS,
        port: this.data.portNumber,
        client_ip: this.client_ip,
        mac: this.mac.selected,
        account: this.sample,
        deviceName: this.data.deviceParams.DEVICE_NAME
      };
      Object.assign(params, this.resource);
      if (type_of_bind && params.type_of_bind != 10) params.type_of_bind = type_of_bind
      this.serviceMixQuery('set_bind', params);
    },
    serviceMixQuery(method,params){//replace this method
      this.result={};this.refree_result={};
      if(params.mac/*&&!this.$root.priv('NetworkScrt')*/){
        Object.assign(params,{
          get_mac:{
            port:this.data.portParams,
            device:this.data.deviceParams
          }
        });
      };
      this.loading=true;
      httpPost(`/call/service_mix/${method}`,params).then(response=>{
        this.loading=false;
        this.result=response;
        /*const isData=response&&typeof response.Data=='string'&&response.Data.split('|').length===3;
        if(isData){
          const connect=response.Data.split('|');
          const connectData={
            ip:connect[0],
            gateway:connect[1],
            mask:connect[2]
          };
          this.result={...this.result,Data:connectData};
        };*/
        let log_props=Object.assign({method:method},filterProps(params,'ip,port,mac,account,login,vgid,serverid,type_of_bind'));
        /*Мы не можем отобрать порт у контракта 2495985 так-как он активен.*/
        if(this.result.type=='error'&&this.result.text&&this.result.text.length>0&&this.result.text.indexOf('Мы не можем отобрать порт у контракта ')>=0){
          let contract=parseInt(this.result.text.replace('Мы не можем отобрать порт у контракта ',''),10);
          if(contract>0){contract=contract.toString(10);
            log_props=Object.assign(log_props,{contract:contract});
            this.result.refreedable=true&&!!contract;
            if(this.data.portInfo){
              let date_last=(this.data.portInfo.last_mac&&this.data.portInfo.last_mac.last_at)?Date.parse(this.data.portInfo.last_mac.last_at.split(' ')[0].split('.').reverse().join('-')):Date.now();
              let date_last_text=new Date(date_last).toISOString().slice(0,10);
              //let date_last_text=new Date(date_last).toLocaleDateString();
              switch(this.data.portInfo.state){
                case'busy':case'hub':this.result.refreedable_message='последняя активность '+date_last_text+' , есть риск отжать порт у действующего абонента';break;
                case'closed':this.result.refreedable_message='контракт '+contract+' расторгнут, порт можно освободить';break;
                case'expired':this.result.refreedable_message='неактивен более 3 мес, возможно порт можно освободить';break;
                case'double':this.result.refreedable_message='абонент "переехал" на другой порт, возможно порт можно освободить';break;
                case'new':this.result.refreedable_message='на порту просто новый мак, возможно порт можно освободить';break;
                case'free':this.result.refreedable_message='на порту никогда небыло активности, возможно порт можно освободить';break;
                default:this.result.refreedable_message='статус порта: '+(this.data.portInfo.state||'error')+' , нужно проверить';break;
              };
              log_props=Object.assign(log_props,{state:this.data.portInfo.state,date_last:date_last_text});
            }else{
              this.result.refreedable_message='невозможно определить активность, нужно проверить';
            };
            log_props=Object.assign(log_props,{user_message:this.result.refreedable_message});
            this.result.refree_params={
              method:method,
              params:{
                ip:params.ip,
                port:contract,
                serverid:params.serverid,
                type_of_bind:params.type_of_bind,
                vgid:contract,
                account:null,
                login:null,
                mac:'0000.0000.0000',//for omsk serverid 64
              },
            };
            httpGet(buildUrl('get_user_rate',{serverid:params.serverid,vgid:contract},'/call/aaa/')).then(get_refree_mac=>{/*for omsk serverid 64*/
              this.result.refree_params={
                ...this.result.refree_params,
                params:{
                  ...this.result.refree_params.params,
                  mac:((get_refree_mac&&get_refree_mac.data&&get_refree_mac.data[0]&&get_refree_mac.data[0].macCPE[0])?get_refree_mac.data[0].macCPE[0]:'0000.0000.0000'),/*for omsk serverid 64*/
                },
              };
            });
          };
        }else{
          this.result={...this.result,InfoMessage:this.result.InfoMessage+(this.result.Data.IP?(' IP:'+this.result.Data.IP):'')};
        };
        log_props=Object.assign(log_props,{type:this.result.type,text:this.result.text,IsError:this.result.IsError,InfoMessage:this.result.InfoMessage});
        fetch('https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec',{
          method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify({
            username:this.$root.username||'<username>',
            node_id:node_id||'<node_id>',
            action:'bind',
            method:method+'_'+params.serverid,
            props:log_props,
          })
        });
      }).catch(error=>{
        this.loading=false;
        this.result={
          text:'ошибка при обращении к серверу',
          type:'error'
        };
      });
    },
    refree(data){//add this method
      this.refree_loading=true;
      this.refree_result={};
      httpPost(`/call/service_mix/${data.method}`,data.params).then(refree_response=>{
        this.refree_loading=false;
        this.refree_result=refree_response;
        let log_props=Object.assign({method:data.method},filterProps(data.params,'ip,port,mac,account,login,vgid,serverid,type_of_bind'));
        if(this.refree_result.type=='error'){
          this.refree_result={
            type:'error',
            refree_message:'освободить не удалось',
          };
        }else{//refree_response.Data - особеннось CustomRequest
          this.refree_result={
            type:'success',
            refree_message:'порт освобожден!'+((this.refree_result.Data.IP)?(' тут был абонент с IP:'+this.refree_result.Data.IP):''),
          };
        };
        log_props=Object.assign(log_props,{user_message:this.refree_result.refree_message});
        log_props=Object.assign(log_props,{type:this.result.type,text:this.result.text,IsError:this.result.IsError,InfoMessage:this.result.InfoMessage});
        fetch('https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec',{
          method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify({
            username:this.$root.username||'<username>',
            node_id:node_id||'<node_id>',
            action:'refree',
            method:data.method+'_'+data.params.serverid,
            props:log_props,
          })
        });
      }).catch(error=>{
        this.refree_loading=false;
        this.refree_result={
          type:'error',
          refree_message:'ошибка при обращении к серверу',
        };
      });
    },
  },
});

Vue.component('port-bind-user-vgid-elem',{//activatespd
  template:`
  <section>
    <radio-el v-model="resource" :value="service" :label="vgid.login+' • '+vgid.vgid" :name="account.userid" :disabled="loading" class="port-bind-user-modal__vgid-radio"/>
    <info-text-sec v-if="state" :text="state"/>
    <div v-if="vgid.tardescr" class="port-bind-user-modal__info">{{vgid.tardescr}}</div>
    <div v-if="vgid.available_for_activation" style="width:100%;padding:0px 20px;display:inline-flex;justify-content:flex-end;">
      <i v-if="loading_activate" class="ic-24 ic-loading rotating" style="color:#5642bd;width:32px;height:32px;line-height:32px;text-align:center;"></i>
      <i v-else-if="!loading_activate&&result_activate" :class="'fas '+(result_activate.data==1?'fa-check':'fa-times')+' fa-lg'" :style="{color:result_activate.data==1?'#20a471':'#f16b16',width:'32px',height:'32px',lineHeight:'32px',textAlign:'center'}"></i>
      <button-main :label="activatespd?'активировать по sms':'активировать'" v-if="vgid.available_for_activation" @click="activate" :disabled="loading_activate" buttonStyle="outlined" size="content"/>
    </div>
    <devider-line />
  </section>
  `,
  props:{
    vgid: {type:Object,required:true},
    account:{type:Object,required:true},
    loading:{type:Boolean,default:false},
    value:{validator:()=>true},
  },
  data(){
    return {
      loading_activate:false,
      result_activate:null,
    };
  },
  computed:{
    resource:{
      get(){
        return this.value;
      },
      set(value){
        this.$emit('input', value);
        if(value){
          this.$root.$emit('port-bind-user-vgid-elem->port-bind-user-modal:service-changed',{
            service:this.vgid,
            account:this.account.agreements.account,
          });
        };
      }
    },
    service(){
      return {
        vgid:this.vgid.vgid,
        login:this.vgid.login,
        serverid:this.vgid.serverid,
        type_of_bind:this.vgid.type_of_bind,
        agentid:this.vgid.agentid,
        addresses:this.vgid.addresses
      };
    },
    state(){
      if(!this.vgid.statusname){return ''};
      switch(this.vgid.statusname){
        case 'Активна':return this.vgid.statusname+' с '+this.getDate(this.vgid.accondate);
        case 'Отключена':
          if(this.vgid.accoffdate){
            return this.vgid.statusname+' '+this.getDate(this.vgid.accoffdate);
          }else{
            return 'Создан '+this.getDate(this.vgid.changedtariffon);
          };          
        default: return this.vgid.statusname+' '+this.getDate(this.vgid.changedtariffon);
      };
    },
    activatespd(){
      return ['108','64','234'].includes(this.vgid.serverid);
    },
  },
  methods:{
    getDate(str=''){
      if(!str){return ''};
      let date=new Date(Date.parse(str)).toLocaleDateString();
      if(date=='Invalid Date'){return ''};
      return date;
    },
    activate(){
      if(this.activatespd){
        this.activate_sms();
      }else{
        this.activate_lbsv();
      };
    },
    activate_sms(){
      window.AppInventor.setWebViewString(`do:sendSms:direct:+79139801727=activatespd ${this.vgid.vgid}`);
      this.result_activate={data:1};
    },
    activate_lbsv(){
      this.loading_activate=true;
      this.result_activate=null;
      httpPost('/call/lbsv/vg_unblock',{
        serverid:this.vgid.serverid,
        vgid:this.vgid.vgid,
        isSession:this.vgid.isSession,
        agenttype:this.vgid.agenttype
      },true).then(data=>{
        this.result_activate=data;
        this.loading_activate=false;
      }).catch(error=>{
        this.result_activate=null;
        this.loading_activate=false;
      });
    },
  },
});

Vue.component('site-ps',{//плансхема
  template:`<div class="display-contents">
    <link-block :actionIcon="openOptions?'up':'down'" icon="card" text="дополнительно" type="large" @block-click="openOptions=!openOptions"/>
    <div v-show="openOptions" class="add-options-block">
      <div style="text-align:right;padding-right:1em;">
        <span id="loader_generatePL" class="myloader" style="display:none;"></span>
        <input type="button" id="btn_generatePL" disabled @click="createSchematicPlan(site_id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
        <input type="button" id="btn_generatePL_woTS" @click="createSchematicPlan(site_id,true)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема без ТС">
      </div>
      <div class="t-cols" style="padding-left:1em;padding-top:1em;">
        <div class="t-col" style="order:-1;">
          <div class="t-cth t-ct-0"></div>
          <div class="t-ctd t-ct-0"></div>
          <div class="t-ctd t-ct-0"></div>
          <div class="t-ctd t-ct-0"></div>
          <div class="t-ctd t-ct-0"></div>
          <div class="t-ctd t-ct-0"></div>
          <div class="t-ctd t-ct-0" style="height:2px;"></div>
          <div class="t-ctd t-ct-0"></div>
        </div>
        <div class="t-col" style="order:1;">
          <div class="t-cth t-cmw4">сервис</div>
          <div class="t-ctd">Интернет ШПД</div>
          <div class="t-ctd">Телевидение КТВ</div>
          <div class="t-ctd">Телевидение DVB-C</div>
          <div class="t-ctd">Телевидение IPTV</div>
          <div class="t-ctd">Tелефония VoIP</div>
          <div class="t-ctd" style="height:2px;"></div>
          <div class="t-ctd">Абоненты</div>
        </div>
        <div class="t-col" style="order:2;">
          <div class="t-cth t-cmw4">активен</div>
          <div class="t-ctd">{{stats.spd.active}}</div>
          <div class="t-ctd">{{stats.ktv.active}}</div>
          <div class="t-ctd">{{stats.ctv.active}}</div>
          <div class="t-ctd">{{stats.iptv.active}}</div>
          <div class="t-ctd">{{stats.tlf.active}}</div>
          <div class="t-ctd" style="height:2px;"></div>
          <div class="t-ctd"></div>
        </div>
        <div class="t-col" style="order:3;">
          <div class="t-cth t-cmw4">отключен</div>
          <div class="t-ctd">{{stats.spd.inactive}}</div>
          <div class="t-ctd">{{stats.ktv.inactive}}</div>
          <div class="t-ctd">{{stats.ctv.inactive}}</div>
          <div class="t-ctd">{{stats.iptv.inactive}}</div>
          <div class="t-ctd">{{stats.tlf.inactive}}</div>
          <div class="t-ctd" style="height:2px;"></div>
          <div class="t-ctd"></div>
        </div>
        <div class="t-col" style="order:4;">
          <div class="t-cth t-cmw4">всего</div>
          <div class="t-ctd">{{stats.spd.active+stats.spd.inactive}}</div>
          <div class="t-ctd">{{stats.ktv.active+stats.ktv.inactive}}</div>
          <div class="t-ctd">{{stats.ctv.active+stats.ctv.inactive}}</div>
          <div class="t-ctd">{{stats.iptv.active+stats.iptv.inactive}}</div>
          <div class="t-ctd">{{stats.tlf.active+stats.tlf.inactive}}</div>
          <div class="t-ctd" style="height:2px;"></div>
          <div class="t-ctd">{{stats.accounts.length}}</div>
        </div>
      </div>
    </div>
    <devider-line />
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    entrances:{type:Array,default:()=>([]),required:true},
    entrance_id:{type:String,default:''},
  },
  data:()=>({
    openOptions:false,//add
  }),
  mounted(){
    createStyleElement('site-ps-css',`
    .display-contents{display:contents;}
    .add-options-block{}
      .t-cols{display:inline-flex;font-family:arial;color:#000;font-size:8pt;line-height:8pt;}
        .t-col{display:flex;flex-direction:column;}
          .t-cth{height:12px;border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;background-color:#ffe4b5;padding: 0px 1px 0px 1px;text-align:center;order:-1;}
          .t-ctd{height:12px;border-right:1px solid #000;border-bottom:1px solid #000;background-color:#e0e0e0;padding: 0px 1px 0px 1px;}
          .t-ctd>input[type="button"]{height:12px;padding:0px;font-size:7pt;}
          .t-cth>input[type="button"]{height:12px;padding:0px;font-size:7pt;}
          .t-cth>input[type="file"]{height:10px;padding:0px;font-size:7pt;width:inherit;}
          .t-cth.t-ct-0{border-left:1px solid #000;border-top:1px solid #000;}
          .t-ctd.t-ct-0{border-left:1px solid #000;}
          
          .t-cw2{width:2em;}.t-cmw2{min-width:2em;}
          .t-cw3{width:3em;}.t-cmw3{min-width:3em;}
          .t-cw4{width:4em;}.t-cmw4{min-width:4em;}
          .t-cw5{width:5em;}.t-cmw5{min-width:5em;}
          .t-cw6{width:6em;}.t-cmw6{min-width:6em;}
          .t-cw7{width:7em;}.t-cmw7{min-width:7em;}
          .t-cw8{width:8em;}.t-cmw8{min-width:8em;}
          .t-cw9{width:9em;}.t-cmw9{min-width:9em;}
          .t-cw10{width:10em;}.t-cmw10{min-width:10em;}
          .t-cw11{width:11em;}.t-cmw11{min-width:11em;}
          .t-cw12{width:12em;}.t-cmw12{min-width:12em;}
          .t-cw13{width:13em;}.t-cmw13{min-width:13em;}
          .t-cw14{width:14em;}.t-cmw14{min-width:14em;}
          .t-cw18{width:18em;}.t-cmw18{min-width:18em;}
          .t-cw19{width:19em;}.t-cmw19{min-width:19em;}
          .t-cw20{width:20em;}.t-cmw20{min-width:20em;}
    
    .myloader{width:20px;height:20px;border:2px dashed cadetblue;border-left-color:crimson;border-right-color:coral;border-top-color:cornflowerblue;border-radius:50%;vertical-align:middle;margin-right:2px;animation:myloader-spinner 0.99s linear infinite;display:inline-table;}
    @keyframes myloader-spinner{to{transform:rotate(360deg)}}
    `)
  },
  computed:{
    stats(){//add
      let stats={
        accounts:[],
        spd:{active:0,inactive:0},
        ktv:{active:0,inactive:0},
        ctv:{active:0,inactive:0},
        iptv:{active:0,inactive:0},
        tlf:{active:0,inactive:0},
      };
      const entrance=this.entrances.find(({id})=>id==this.entrance_id)
      const entrances=entrance?[entrance]:this.entrances;
      entrances.forEach(entrance=>{
        entrance.floor.forEach(floor=>{
          floor.flats.forEach(flat=>{
            flat.subscribers.forEach(subscriber=>{
              stats.accounts.push(subscriber.account);
              subscriber.services.forEach(service=>{
                switch(service.service_id){
                  case'1':
                    stats.spd[service.status==='green'?'active':'inactive']++;
                  break;
                  case'4':
                    stats.ktv[service.status==='green'?'active':'inactive']++;
                  break;
                  case'2':
                    stats.ctv[service.status==='green'?'active':'inactive']++;
                  break;
                  case'16':
                    stats.iptv[service.status==='green'?'active':'inactive']++;
                  break;
                  case'8':
                    stats.tlf[service.status==='green'?'active':'inactive']++;
                  break;
                };
              });
            });
          });
        });
      });
      stats.accounts=[...new Set(stats.accounts.filter(account=>account))];
      return stats;
    },
  },
  methods:{
    async getSite(site_id,hideTS=false){//add
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
    async createSchematicPlan(site_id,hideTS=true){//add
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

      if(!dev){
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




Vue.component('device-ping',{//user ip ping and go
  template:`<div>
    <input-el placeholder="10.221.xxx.xxx" :label="input_label" v-model="overrideIp" :disabled="enable" class="mb-8">
      <button-sq slot="postfix" icon="right-link" @click="goToDevice" v-if="device_info?.name&&device_info?.ip==ip"/>
    </input-el>
    <info-value :label="'получено: '+received" :value="'потеряно: '+lost" type="small"/>
    <device-params-item-history :paramDays="pings" :item="config" :limit="count" chartClass="-" chartStyle="border:1px solid #e4e3e3;border-radius:5px;"/>
    <div style="display:inline-flex;gap:4px;width:100%;justify-content:center;">
      <button-main @click="clear" label="clear" buttonStyle="outlined" size="medium"/>
      <button-main @click="start" label="start" :loading="running" :disabled="!available||enable||running" buttonStyle="contained" size="medium"/>
      <button-main @click="stop" label="stop" buttonStyle="outlined" size="medium"/>
    </div>
  </div>`,
  props:{
    device:{type:Object,default:null,required:true},
  },
  data:()=>({
    overrideIp:'',
    device_info:null,
    config:{
      param:'ping',
      unit:'ms',
    },
    timer:undefined,
    enable:false,
    timeout:1000,
    count:0,
    running:false,
    pings:[],
  }),
  created(){
    if(this.device?.ip){this.overrideIp=this.device.ip};
  },
  watch:{
    'ip'(ip){
      if(ip){
  this.pings=[]
  if(ip!==this.device?.ip&&ip.match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/)){
    this.getDeviceInfo();
  }
      };
    },
  },
  computed:{
    ip(){
      return this.overrideIp||this.device?.ip;
    },
    available(){
      return this.device?.region?.mr_id&&this.ip;
    },
    received(){return this.pings.filter(ping=>ping.values[0]>=0).length},
    lost(){return this.pings.filter(ping=>ping.values[0]<0).length},
    device_model(){
      return (this.device_info?.model&&this.device_info.model.length>20?(this.device_info.system_object_id||'').replace('.1.3.6.1.4.1.','').replaceAll('.','-'):(this.device_info.model||'')).replace('Quidway ','').trim()
    },
    input_label(){
      let label='IP';
      if(!this.device_info){return label};
      if(this.device_info.ip!==this.ip){return label};
      if(!this.device_model){return this.device_info.name};
      return this.device_info.name+' • '+this.device_model;
    },
  },
  methods:{
    device_ping(){
      this.running=true;
      httpPost(`/call/hdm/device_ping?ip=${this.ip}&fresh=${randcode(20)}`,{
        device:{
          MR_ID:this.device.region.mr_id,
          IP_ADDRESS:this.ip,
          SYSTEM_OBJECT_ID:null,
          VENDOR:null
        }
      }).then(data=>{
        this.running=false;
        this.count++;
        this.pings.push({
          date:this.count,
          values:data.code=='200'?[parseFloat(data.ping_info)]:[-2],//TODO ref device-params-item-history
        });
        if(this.count<100){//ограничение в 99 пингов чтоб не поехала верстка графика
          this.next();
        }else{
          this.stop();
        }
      }).catch(error=>{
        this.stop();
        console.log(error);
      });
    },
    start(){
      if(!this.running&&this.available){
        this.enable=true;
      };
      this.next();
    },
    next(){
      if(!this.running&&this.enable){
        this.timer=setTimeout(this.device_ping,this.timeout);
      };
    },
    stop(){
      clearTimeout(this.timer);
      this.enable=false;
      this.running=false;
    },
    clear(){
      this.stop();
      this.count=0;
      this.pings=[];
    },
    async getDeviceInfo(){
      this.device_info=null;
      const resp=await httpGet(buildUrl('search_ma',{pattern:this.ip},'/call/v1/search/')).catch(console.warn);
      if(!resp.data){return};
      let devices=resp.data?.length?resp.data.find(d=>d.devices)?.devices:[resp.data];
      if(!devices){return};
      //devices.forEach(device=>this.$cache.setItem(`device/${device?.name}`,device));//no snmp and discovery
      let device=devices.find(device=>device.region.id===this.device.region.id);
      if(!device||device?.ip!==this.ip){return};
      this.device_info=device;
      /*const resp2=await httpGet(buildUrl('search_ma',{pattern:this.device_info?.name},'/call/v1/search/')).catch(console.warn);
      if(!resp2.data){return};
      this.device_info=resp2.data;
      this.$cache.setItem(`device/${this.device_info?.name}`,this.device_info);*/
    },
    goToDevice(){
      if(!this.device_info?.name){return};
      this.$router.push({name:'search',params:{text:this.device_info.name}});
    },
  },
});

Vue.component("port-links",{//test actual abon state from siebel
  template:`<card-block>
    <loader-bootstrap v-if="loading_devices" text="поиск подключенных устройств"/>
    <template v-if="!loading_devices&&devices.length">
      <title-main icon="tech-port" :text="devicesTitle"/>
      <div v-for="(device,i) of devices" :key="i+'_'+device.LINK_DEVICE_NAME">
        <div class="mx-3">
          <div class="rack-box">
            <div class="rack-box__link">
              <div class="rack-box__type" style="border-style: solid;">
                <!--переделать на ШДУ-->
                <i v-if="device.LINK_type=='Антивандальный'" class="fas fa-lock"></i>
                <i v-else class="fas fa-cube"></i>
              </div>
              <div class="rack-box__floor">
                <i class="fas fa-door-open"></i>{{device.LINK_ENTRANCE_NO}}
              </div>
              <!--device.LINK_RACK_LOCATION переделать на целевые атрибуты-->
              <div class="rack-box__location">{{device.LINK_RACK_LOCATION||'неизвестно'}}</div>
            </div>
            <article class="device-info">
              <header class="device-info__header">
                <div v-if="device.LINK_PORT_NUMBER" class="mr-1">
                  <div class="d-flex align-items-center justify-content-center m-0 trunk-port-link" style="font-size: 11px;">{{Number(device.LINK_PORT_NUMBER)}}</div>
                </div>
                <!--переделать на route-->
                <search-link class="device-info__title" :text="device.LINK_DEVICE_NAME">  {{device.LINK_DEVICE_IP_ADDRESS}}</search-link>
              </header>
              <div class="device-info__main">
                <!--address-->
                <div class="device-info__entrances">{{device.LINK_DEVICE_LOCATION}}</div>
              </div>
              <footer class="device-info__params">
                <info-value label="Имя" :value="device.LINK_DEVICE_NAME" type="small" />
              </footer>
            </article>
          </div>
        </div>
      </div>
    </template>
    <devider-line v-if="devices.length&&macs.length"/>
    <loader-bootstrap v-if="loading_macs" text="загрузка истории по порту"/>
    <template v-if="!loading_macs&&macs.length">
      <title-main icon="tech-port" text="На порту"/>
      <div v-for="(mac,i) of macs" :key="i+'_'+mac.MAC">
        <template v-if="mac.ACCOUNT">
          <template v-if="active_internets[mac.ACCOUNT]">
            <link-block icon="person main-green" :text="accountHeader(mac)" type="large" actionIcon="right-link" :to="'/'+mac.ACCOUNT"/>
            <info-text-sec v-for="(tarif,key) of active_internets[mac.ACCOUNT].tarifs" :text="tarif" :key="key"/>
            <info-value label="Активирован" withLine type="medium">
              <span slot="value" class="main-green">{{active_internets[mac.ACCOUNT].dateFrom}}</span>
            </info-value>
          </template>
          <template v-else>
            <link-block :icon="'person '+(mac.CLOSE_DATE?'main-red':'main-green')" :text="accountHeader(mac)" type="large" actionIcon="right-link" :to="'/'+mac.ACCOUNT"/>

            <info-value v-if="mac.START_DATE&&mac.CLOSE_DATE" :label="dateOnly(mac.START_DATE)" :withLine="true" type="medium">
              <span slot="value" class="main-red">{{dateOnly(mac.CLOSE_DATE)}}</span>
            </info-value>
            <template v-else>
              <info-value v-if="mac.CLOSE_DATE" label="Расторгнут" :withLine="true" type="medium">
                <span slot="value" class="main-red">{{dateOnly(mac.CLOSE_DATE)}}</span>
              </info-value>
              <info-value v-if="mac.START_DATE" label="Активирован" :withLine="true" type="medium">
                <span slot="value" class="main-green">{{dateOnly(mac.START_DATE)}}</span>
              </info-value>
            </template>
          </template>
        </template>

        <template v-if="mac.MAC&&mac.CLIENT_IP">
          <info-text-sec v-if="ouis[mac.MAC]" :text="ouis[mac.MAC]"/>
          <info-value :label="mac.MAC" :value="mac.CLIENT_IP" :withLine="true" type="medium"/>
          <info-text-sec v-if="ptrs[mac.CLIENT_IP]" :text="ptrs[mac.CLIENT_IP]" style="text-align:right;"/>
        </template>
        <template v-else>
          <info-text-sec v-if="ptrs[mac.CLIENT_IP]" :text="ptrs[mac.CLIENT_IP]" style="text-align:right;"/>
          <info-value v-if="mac.CLIENT_IP" label="IP" :value="mac.CLIENT_IP" :withLine="true" type="medium"/>
          <info-text-sec v-if="ouis[mac.MAC]" :text="ouis[mac.MAC]"/>
          <info-value v-if="mac.MAC" label="MAC" :value="mac.MAC" :withLine="true" type="medium"/>
        </template>

        <info-value v-if="mac.FIRST_DATE&&mac.LAST_DATE" :label="timePlusDate(mac.FIRST_DATE)" :value="timePlusDate(mac.LAST_DATE)" :withLine="true" type="medium"/>
        <template v-else>
          <info-value v-if="mac.FIRST_DATE" label="Первый выход" :value="timePlusDate(mac.FIRST_DATE)" :withLine="true" type="medium"/>
          <info-value v-if="mac.LAST_DATE" label="Последний выход" :value="timePlusDate(mac.LAST_DATE)" :withLine="true" type="medium"/>
        </template>

        <devider-line v-if="i<macs.length-1" style="margin:8px 16px;"/>
      </div>
    </template>
  </card-block>`,
  props:{
    port:{type:Object,required:true},
    devices:{type:Array,default:()=>([])},
    macs:{type:Array,default:()=>([])},
    loading_devices:{type:Boolean,default:false},
    loading_macs:{type:Boolean,default:false},
  },
  data:()=>({
    ouis:{},
    ptrs:{},
    resps:{
      networkElements:{},
      accounts:{}
    },
  }),
  created(){
    this.getNetworkElements();//by port
  },
  watch:{
    'macs'(){
      this.getAbons();
      this.getMacVendorLookup();
      this.getReverseDNSLookup();
    },
    'devices'(){
      this.getNetworkElements();
    }
  },
  computed:{
    devicesTitle(){
      if(!this.devices.length){return 'Технологический порт'};
      if(this.devices[0].LINK_DEVICE_NAME){return this.getNetworkElementTitle(this.networkElements[this.devices[0].LINK_DEVICE_NAME]?.type)};
      return 'Свободный порт';
    },
    networkElements(){return this.resps.networkElements},
    networkElement(){return this.networkElements[this.port.device_name]},
    active_internets(){
      return Object.values(this.resps.accounts).reduce((active_internets,account)=>{
        const {dateFrom,personalAccountStatus,accountNumber,products=[]}=account;
        const active_internet_services=products.reduce((active_internet_services,product)=>{
          const {services=[]}=product;
          active_internet_services.push(...services.filter(({name,statusCode})=>name==='Интернет'&&statusCode==='0').map(({tariff})=>tariff))
          return active_internet_services
        },[]);
        active_internets[accountNumber]=active_internet_services.length?{
          dateFrom,personalAccountStatus,accountNumber,tarifs:[...new Set(active_internet_services)]
        }:null
        return active_internets
      },{});
    }
  },
  methods:{
    async getMacVendorLookup(){
      let macList=[...new Set(this.macs.map(mac=>mac.MAC))];
      if(!macList.length){return};
      this.ouis=await this.test_getMacVendorLookup(macList);
    },
    getReverseDNSLookup(){
      [...new Set(this.macs.filter(mac=>mac.CLIENT_IP&&!['10','192','172','100'].includes(mac.CLIENT_IP.split('.')[0])))].map(mac=>{
        fetch(`https://dns.google/resolve?name=${[...mac.CLIENT_IP.split('.').reverse(),'in-addr.arpa'].join('.')}&type=ptr`).then(r=>r.json()).then(data=>{
          if(data.Answer&&data.Answer.length){
            let PTR=data.Answer.find(RR=>RR.type&&RR.type==12);//Resource Record Type == PTR (12) :domain name pointer
            if(PTR&&PTR.data){
              this.ptrs={...this.ptrs,[mac.CLIENT_IP]:(PTR.data+'.').split(' ')[0].replace('..','')};
            };
          };
        }).catch(e=>console.warn(e.toString()));
      });
    },
    getPtrs(){
      [...new Set(this.macs.filter(mac=>mac.CLIENT_IP&&!['10','192','172','100'].includes(mac.CLIENT_IP.split('.')[0])))].map(mac=>{
        fetch(`https://api.whois.vu/?s=ip&q=${mac.CLIENT_IP}`).then(r=>r.json()).then(data=>{
          if(data.hostname!==data.ip){
            this.ptrs={...this.ptrs,[data.ip]:data.hostname};
          };
        }).catch(e=>console.warn(e.toString()));
      });
    },
    timePlusDate(date=''){return date.split(' ').reverse().join(' • ')},
    dateOnly(date=''){return date.split(' ')[0]},
    async getNetworkElement(device_name=''){
      if(!device_name){return};
      if(this.resps.networkElements[device_name]){return};
      const cache=this.$cache.getItem(`device/${device_name}`);
      if(cache){
        this.$set(this.resps.networkElements,device_name,cache);
      }else{
        const response=await httpGet(buildUrl('search_ma',{pattern:device_name},'/call/v1/search/'));
        if(response.data){
          this.$cache.setItem(`device/${device_name}`,response.data);
          this.$set(this.resps.networkElements,device_name,response.data);
        };
      };
    },
    getNetworkElements(){
      const {device_name=''}=this.port;
      const names=[device_name,...this.devices.map(ne=>ne.LINK_DEVICE_NAME)];
      Promise.allSettled(names.map(name=>this.getNetworkElement(name)));
    },
    getNetworkElementShortName(name){return getNetworkElementShortName(name)},
    getNetworkElementTitle(type){
      const title=getNetworkElementReference(type)?.title||'неизвестный СЭ'
      return `На порту ${title}`;
    },
    accountHeader(mac){
      if(!mac){return};
      if(!mac.ACCOUNT){return};
      return mac.ACCOUNT+(mac.FLAT_NUMBER?(' • кв.'+mac.FLAT_NUMBER):'');
    },
    getAbons(){
      const accounts=this.macs.map(mac=>mac.ACCOUNT).filter(a=>a);
      Promise.allSettled(accounts.map(account=>this.getAccountFromSiebel(account)));
    },
    async getAccountFromSiebel(account){
      if(!account){return};
      if(this.resps.accounts[account]){return};
      const cache=this.$cache.getItem(`siebel:account/${account}`);
      if(cache){
        this.$set(this.resps.accounts,account,cache);
      }else{
        try{
          const response=await httpGet(buildUrl('search_api',{accountNumber:account,search_type:'account'},'/call/v1/siebel/'));
          if(response?.accountNumber){
            this.$cache.setItem(`siebel:account/${account}`,response);
            this.$set(this.resps.accounts,account,response);
          };
        }catch(error){
          console.warn('siebel:error',error);
        };
      };
    },
  }
});

Vue.component('session-el',{//redesign, need .padding-unset or create custom table
  //template:'#session-el-template',
  template:`<section>
    <loader-bootstrap v-if="loads.get_online_sessions" text="получение сессии абонента"/>
    <loader-bootstrap v-else-if="loads.stop_session_radius" text="сброс сессии абонента"/>
    <div v-else-if="session" class="margin-left-16px margin-right-16px display-flex flex-direction-column gap-4px">
      
      <message-el :text="!start?'Оффлайн':('Онлайн c '+start)" :type="!start?'warn':'success'" box/>

      <div v-if="sessionid" class="display-flex align-items-center justify-content-center">
        <span class="font-size-12px">{{sessionid}}</span>
      </div>
      
      <div class="display-flex flex-direction-column">
        <info-value v-if="ip" class="padding-unset" label="IP" :value="ip" withLine data-ic-test="session_ip"/>
        <info-value v-if="macIsValid" class="padding-unset" label="MAC" :value="mac" withLine data-ic-test="session_mac"/>
        <info-text-sec v-if="macVendor" class="padding-unset" :text="macVendor"/>
        <info-value v-if="port" class="padding-unset" label="Agent Circuit ID" :value="AgentCircuitID" withLine />
        <info-value v-if="device" class="padding-unset" label="Agent Remote ID" :value="AgentRemoteID" withLine />
        <info-text-sec v-if="deviceMacVendor" class="padding-unset" :text="deviceMacVendor"/>
        <info-value v-if="nas" class="padding-unset" label="BRAS/BSR" :value="nas" withLine data-ic-test="session_nas"/>
      </div>

      <div class="display-flex justify-content-space-between gap-4px margin-bottom-8px">
        <button-main @click="openSessionHistory" button-style="outlined" :disabled="false" icon="history" label="История" loading-text="" size="large" data-ic-test="session_history_btn" />
        <button-main @click="stop_session_radius" button-style="outlined" :disabled="!start" icon="refresh" label="Сброс" loading-text="" size="large" data-ic-test="session_reset_btn" />
        <button-main @click="openAuthLogs" button-style="outlined" :disabled="false" icon="log" label="Логи" loading-text="" size="large" data-ic-test="session_logs_btn" />
      </div>
      
      <session-history-modal ref="sessionHistory" :session="session" :params="params"/>
      <session-logs-modal ref="sessionLogs" :session="session" :params="params"/>

    </div>
  </section>`,
  props:{
    params:{type:Object,required:true},
  },
  data:()=>({
    resps:{
      get_online_sessions:null,
      stop_session_radius:null
    },
    loads:{
      get_online_sessions:false,
      stop_session_radius:false
    },
    ouis:{},
  }),
  watch:{
    'mac'(mac){
      if(mac&&this.macIsValid){this.getMacVendorLookup(mac)};
    },
    'deviceMac'(deviceMac){
      if(deviceMac){this.getMacVendorLookup(deviceMac)};
    },
  },
  created(){ 
    this.get_online_sessions() 
  },
  computed:{
    loading(){return Object.values(this.loads).some(v=>v)},
    session(){return this.resps.get_online_sessions?.data?.[0]||this.resps.get_online_sessions},
    device(){return this.session?.device||''},
    deviceStr(){return `${this.device||''}`},
    deviceMac(){return ((this.deviceStr.match(/^[a-f0-9]{12}$/gi)?.[0]||'').match(/.{4}/gi)||[]).join('.')},
    AgentRemoteID(){
      const {deviceStr,deviceMac}=this;
      if(deviceMac){//30150037478 - default format
        return deviceMac;
      };
      const isNotHex=/\W/i.test(deviceStr);
      if(isNotHex){//10702046999 - ascii format
        return deviceStr
      };
      return deviceStr.match(/.{2}/gi).map(b=>{
        b=b.padStart(2,0);
        try{//60910533888 - custom format
          return unescape('%'+b);
        }catch(error){
          return b
        };
      }).join('');
    },
    ip(){return this.session?.ip||''},
    mac(){return this.session?.mac||''},
    nas(){return this.session?.nas||''},
    port(){return this.session?.port||''},
    AgentCircuitID(){return `${this.port||''}`},
    sessionid(){return this.session?.sessionid||''},
    start(){return this.session?.start||''},
    macIsValid(){return this.mac&&this.mac!=='0000.0000.0000'},
    macVendor(){return this.ouis[this.mac]},
    deviceMacVendor(){return this.ouis[this.deviceMac]},
  },
  methods:{
    async get_online_sessions(){
      this.resps.get_online_sessions=null;
      this.loads.get_online_sessions=true;
      const {params}=this;
      try{
        const response=await httpGet(buildUrl('get_online_sessions',params,'/call/aaa/'))
        this.resps.get_online_sessions=response;
      }catch(error){
        console.warn("get_online_sessions.error",error);
      };
      this.loads.get_online_sessions=false;
    },
    async stop_session_radius(){
      this.resps.stop_session_radius=null;
      this.loads.stop_session_radius=true;
      const {serverid,agentid,vgid,login,descr}=this.params;
      const {sessionid,dbsessid,nas}=this.session;
      try{
        const response=await httpGet(buildUrl('stop_session_radius',{serverid,agentid,vgid,login,descr,sessionid,dbsessid,nasip:nas},'/call/aaa/'));
        if(response.message=='OK'){
          this.session=null;
          setTimeout(this.get_online_sessions,10000);
        };
        this.resps.stop_session_radius=response;
      }catch(error){
        console.warn("stop_session_radius.error",error);
      };
      this.loads.stop_session_radius=false;
    },
    openSessionHistory() {
      this.$refs.sessionHistory.open();
    },
    openAuthLogs() {
      this.$refs.sessionLogs.open();
    },
    getOnlineSession(){//public
      this.get_online_sessions()
    },
    async getMacVendorLookup(mac=''){
      if(!mac){return};
      const ouis=await this.test_getMacVendorLookup([mac]);
      this.ouis={...this.ouis,...ouis};
    },
  }
});

Vue.component('session-history-modal',{//fix params, need create custom table
  //template:'#session-history-template',
  template:`<modal-container-custom ref="sessionHistory">
    <div class="mx-auto mt-8 w-75">
      <h3 class="font--18-600 tone-900 d-center-x mb-8">История сессий</h3>
      <h5 class="font--13-500-140 tone-500 text-center m-auto">Выберите временной промежуток</h5>
    </div>
    <div>
      <div class="mx-16">
        <div class="d-center-x py-16">
          <input-el :value="history.start" label="Начало" type="date"  v-model="history.start" class="mr-8" data-ic-test="session_history_date_from"/>
          <input-el :value="history.end" label="Конец" type="date" v-model="history.end" class="ml-8" data-ic-test="session_history_date_to"/>
        </div>
        <button-main @click="get_sessions" :disabled="loading" label="Загрузить" :loading="loading" size="full" buttonStyle="contained" data-ic-test="session_history_load_btn" />
        <device-params-item-history v-if="history.data?.length" :paramDays="sessions" :item="{param:'traffic',unit:'Gb',valueUnit:'Gb'}" :limit="sessions?.length" chartStyle="border:1px solid #e4e3e3;border-radius:5px;"/>
      </div>
      <template v-for="entry in history.data">
        <devider-line></devider-line>
        <div>
          <div class="font--13-500-140 tone-900 px-16"> {{ entry.start }} <span class="tone-500"> • </span> {{ entry.end || "-" }}</div>
          <div class="font--13-500-140 tone-900 px-16"> {{ entry.elapsed || "-" }} <span class="tone-500"> • </span> {{ entry.bytes }} </div>
          <info-value label="IP" :value="entry.ip" type="large" withLine data-ic-test="session_history_ip"></info-value>
          <info-value label="MAC" :value="entry.mac" type="large" withLine data-ic-test="session_history_mac"></info-value>
          <info-value label="BRAS" :value="entry.nas" type="large" withLine></info-value>
          <info-value label="Тип трафика" :value="entry.catdescr" type="large" withLine></info-value>
        </div>
      </template>
    </div>
    <div class="px-16" v-if="Array.isArray(history.data) && history.data.length == 0">
      <message-el :text="message.text" :box="true" :type="message.type"></message-el>
    </div>
  </modal-container-custom>`,
  props:{
    session:{type:Object,required:true},
    params:{type:Object,required:true},
  },
  data(){
    const formatDate=(date,day=0)=>{date.setDate(date.getDate()-day);return date.toLocaleDateString().split('.').reverse().join('-')}
    return {
      history:{
        data:null,
        start:formatDate(new Date(),5),
        end:formatDate(new Date())
      },
      loading:false,
    };
  },
  computed:{
    sessions(){
      return Object.values((this.history.data||[]).reduceRight((sessions,session)=>{
        const {bytes='',start='',elapsed=''}=session;
        let {end=''}=session;
        const [valueInUnits='0',units='']=bytes.split(' ');
        const valueInt=parseInt(valueInUnits)||0;
        const value={Kb:valueInt*1000,Mb:valueInt*1000000,Gb:valueInt*1000000000}[units]||valueInt;

        const [date='',time='']=start.split(' ');

        if(!end&&elapsed){//2-041-0091100 - elapsed вместо end //"11ч 56м 21с"//"21м 20с"//"1ч "
          const {sec=0,min=0,hor=0}=elapsed.split(' ').reduce((hms,item)=>Object.assign(hms,{[item.includes('ч')?'hor':item.includes('м')?'min':item.includes('с')?'sec':'?']:parseInt(item)||0}),{sec:0,min:0,hor:0});
          const [DD=0,MM=0,YYYY=0]=date.split('.');
          const session_start_MMDDYYYY=[[MM,DD,YYYY].join('.'),time].join(' ');
          end=new Date(Date.parse(session_start_MMDDYYYY||0)+(sec+min*60+hor*3600)*1000);
          end=[[`${end.getDate()}`,`${end.getMonth()+1}`,`${end.getFullYear()}`].map(n=>n.padStart(2,0)).join('.'),[`${end.getHours()}`,`${end.getMinutes()}`].map(n=>n.padStart(2,0)).join(':')].join(' ');
        };

        const sessions_on_date=sessions[date];
        return Object.assign(sessions,{
          [date]:{
            date,
            start:sessions_on_date?.start||start,
            end,
            valuesRow:[
              ...sessions_on_date?.valuesRow||[],
              {value,units:'bytes',title:bytes},
            ]
          }
        });
      },{}));
    },
    message(){
      const {start,end}=this.history;
      if(start==end){
        return {type:'info',text: `Завершенных сессий ${start} нет`}
      };
      if(new Date(start)>new Date(end)){
        return {type:'warn',text:'Выбраны неверные даты'}
      };
      return {type:'info',text:'Завершенных сессий в указанный период нет'}
    },
  },
  methods:{
    open(){//public
      this.$refs.sessionHistory.open();
    },
    async get_sessions(){
      this.loading=true;
      this.history.data=null;
      const {sessionid}=this.session;
      const {login,serverid,vgid,descr}=this.params;
      let {start:dtfrom,end:dtto}=this.history;
      try{
        const response=await httpGet(buildUrl('get_sessions',{sessionid,login,serverid,vgid,descr,dtfrom,dtto},'/call/aaa/'));
        this.history.data=response?.rows||[];
      }catch(error){
        console.warn('get_sessions.error',error);
      };
      this.loading=false;
    },
  }
});
Vue.component('session-logs-modal', {//fix params, need create custom table
  //template: '#session-logs-template',
  template:`<modal-container ref='sessionLogs'>
    <div class="mx-auto mt-8 w-75">
      <h3 class="font--18-600 tone-900 d-center-x mb-8">
        Логи авторизации
      </h3>
    </div>
    <div>

      <div>
        <div class='d-center-x px-16 py-16'>
          <input-el :value='logs.date' label='Дата' type='date'  v-model='logs.date'/>
        </div>

        <div class='px-16 pb-16'>
          <button-main @click="load" :disabled="loading" label='Загрузить' :loading='loading' size='full' buttonStyle='contained'></button-main>
        </div>
      </div>
      <template v-if='logs.data' v-for="entry in logs.data">
        <devider-line></devider-line>
        <div class='py-16'>
          <div class='font--13-500-140 tone-900 px-16'> {{ entry.log }} ({{ entry.count }})</div>
          <info-value :label='entry.enter_login' :value='entry.last' type='large' withLine></info-value>
          <info-value label='MAC' :value='entry.mac' type='large' withLine></info-value>
          <info-value label='BRAS' :value='entry.nas' type='large' withLine></info-value>
        </div>
      </template>
    </div>

    <div class='px-16' v-if="Array.isArray(logs.data) && logs.data.length == 0">
      <message-el :text="'Авторизаций '+logs.date+' не было'" :box='true' type='info'></message-el>
    </div>
  </modal-container>`,
  props: {
    session:{type:Object,required:true},
    params:{type:Object,required:true},
  },
  data: function () {
    const formatDate = (date) => date.toLocaleDateString().split('.').reverse().join('-');
    return {
      logs: {
        data: null,
        date: formatDate(new Date())
      },
      loading: false,
    };
  },
  methods: {
    // public
    open() {
      this.$refs.sessionLogs.open();
    },

    load: function () {
      this.loading = true;
      this.logs.data = null;
      const {login,serverid,vgid,descr}=this.params;
      httpGet(buildUrl('get_radius_log',{login,serverid,vgid,descr,date:this.logs.date}, '/call/aaa/')).then(data => {
        this.logs.data = data.rows;
        this.loading = false;
      }).catch(e => {
        console.error(e)
        this.loading = false;
      });
    }
  }
});






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
Vue.component('send-kion-pq',{
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
    createStyleElement('send-kion-pq-css',`
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

Vue.component("lbsv-account-main", {//add send-kion-pq
  //template: "#lbsv-account-main-template",
  template:`<card-block v-if="account">
    <title-main>
      <div slot="prefix">
        <i class="ic-20 ic-status" :class="!agreement.closedon?'main-green':'main-red'"></i>
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
    
    <send-kion-pq :phone="phone" :phones="[account?.mobile,account?.phone,agreement?.convergentmsisdn]" :account="accountId"/>
    
    <devider-line v-if="agreement"/>
    <template v-if="agreement">
      <info-value icon="purse" :value="balance" type="extra" :label="'Баланс (ЛС '+accountId+')'" :minus="agreement.balance.minus"/>
      <info-value v-if="agreement && agreement.convergentmsisdn && convergentBalance" icon="purse" :value="convergentBalance+' ₽'" type="extra" :label="'Баланс (+'+agreement.convergentmsisdn+')'" :minus="convergentBalance < 0 ? true : false"/>
      <info-value v-if="agreement.lastpaydate" icon="clock" :value="lastPay" type="extra" label="Платеж" />
    </template>
    <devider-line />
      
    <link-block @block-click="openBillingInfo" text="Информация в биллинге" icon="server" action-icon="expand" />
    <billing-info-modal ref="billingInfo" :billing-info="billingInfo" :loading="loading.vgroups" />
    <link-block @block-click="openSendSmsModal" text="Смс с новым паролем" icon="sms" action-icon="expand" />
    <send-sms-modal ref="sendSms" :account="accountId" />
  </card-block>`,
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
      const address = this.computedAddress;
      if (!address) return ''
      return address
        .split(',')
        .map(elem => elem.trim())
        .filter(elem => elem)
        .join(", ")
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

Vue.component('task-main-account',{//add send-kion-pq
  //template:'#task-main-account-template',
  template:`<div>
    <card-block>
      <title-main :text="task.tasktype" icon="task">
        <div class="d-center-y" style="padding-right: 12px;">
          <span class="tone-900" style="white-space: nowrap; padding-right: 8px;">{{ task.Assignment }}</span>
          <i class="ic-20 ic-timer tone-500"></i>
        </div>
      </title-main>

      <info-subtitle>
        <span>
          <i v-if="operationIcons.tv" class="ic-16 ic-tv"></i>
          <i v-if="operationIcons.internet" class="ic-16 ic-eth"></i>
          <i v-if="operationIcons.phone" class="ic-16 ic-sim"></i>
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
            <i class="ic-20 ic-warning"></i>
          </div>
          <span class="font-size-14px">Блок-фактор</span>
        </div>
      </link-block>
    </card-block>

    <card-block>
      <title-main :text="task.customer" icon="person" style="text-transform: capitalize;" />
      <account-call :phone="task.ContactPhoneNumber" :descr="task.customer" showSendSms/>
      <send-kion-pq :phones="[task.ContactPhoneNumber]" :account="task.clientNumber"/>
      <info-list icon="timer" :text="task.Appointment" comment="(ожидания клиентом)" />
    </card-block>

    <card-block>
      <title-main :text="site?.address||task.AddressSiebel" class="mt-8">
        <button-sq type="large" icon="pin" @click="toMap"/>
      </title-main>
      <info-list icon="apartment" v-if="entrance" :text="titleEntranceFloorFlat"/>
      <devider-line />
      <link-block icon="du" :text="site?.node||task.siteid" :search="site?.node||task.siteid" type="medium" />
      <link-block icon="home" actionIcon="expand" text="Инфо по площадке и доступу" @block-click="open_modal_site_info" type="medium" />
    </card-block>

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
//app?.$store?.commit('main/set_userData',{...app.$store.getters['main/userData'],username:"igmuravi"})
let sendStateTimer=null;
let savePositionTimer=null;
const stateBuffer=new Set();

if(app?.$store?.getters?.['main/username']){
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
    const sites=getSitesCache();
    const tasks=getTasksCache();
    
    getSitesToCacheIfNotPresent({tasks,sites});
    
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



Vue.component("SiteNodePage2",{
  template:`<section>
    <page-navbar :title="title" @refresh="refresh" />
    <card-block>
      <info-text :title="site.address" :text="site.name+' • '+site.node">
        <button-sq icon="pin" type="large" @click="toMap"/>
      </info-text>
    </card-block>
    <card-block>
      <title-main text="Устройства">
        <button-sq icon="refresh" type="large" @click="pingAll"/>
      </title-main>
      <devider-line />
      <loader-bootstrap v-if="loading.networkElements" text="загрузка данных по оборудованию"/>
      <template v-for="(networkElement,i) of networkElements">
        <devider-line v-if="i" class="mx-3"/>
        <device-info :ref="'device_info_'+networkElement.nioss_id" :networkElement="networkElement" showDisplayName hideEntrances/>
      </template>
      <message-el v-if="!loading.networkElements&&!networkElements?.length" text="Нет устройств" type="warn" class="margin-left-16px margin-right-16px" box/>
    </card-block>
    <site-info :site="site"/>
  </section>`,
  props: {
    siteProp: { type: Object, required: true },
  },
  data() {
    return {
      site: this.siteProp,
      loading: {
        networkElements: false
      },
      networkElements: [],
    };
  },
  created() {
    this.getNetworkElements();
  },
  computed:{
    title(){return `узел ОС типа ${this.site.type}`},
    device_info_refs(){
      return Object.keys(this.$refs).filter(key=>key.startsWith('device_info_')&&this.$refs[key][0]&&this.$refs[key][0].ping).map(key=>this.$refs[key][0]);
    },
  },
  methods: {
    pingAll(){
      this.device_info_refs.map(ref=>ref.ping());
    },
    refresh() {
      this.networkElements=[];
      this.getNetworkElements();
    },
    async getNetworkElements() {
      const params = { site_id: this.site.id };
      const url = buildUrl("devices", params, "/call/v1/device/");
      this.loading.networkElements = true;
      try {
        const response = await CustomRequest.get(url);
        if (Array.isArray(response)) {
          this.networkElements = response.filter((el) => el.uzel.name === this.site.node);
          this.networkElements=this.networkElements.map(networkElement=>({...networkElement,...{notAll:true}}));
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.warn("devices.error", error);
      }
      this.loading.networkElements = false;
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
  beforeRouteEnter(to, from, next) {
    if (!to.params.siteProp) {
      next({
        name: "search",
        params: { text: to.params.id },
      });
      return;
    }
    next();
  },
});
app.$router.addRoutes([
  {
    path:'/site-node-2/:id',
    name:'site-node-2',
    component:Vue.component('SiteNodePage2'),
    props:true
  }
]);
app.$watch('$route',({name,params})=>{
  if(name==='site-node'){
    app.$router.replace({
      name: "site-node-2",
      params
    });
  };
})






