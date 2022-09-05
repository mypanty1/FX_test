/*
javascript:(function(){
  
if(document.title!='Inetcore+'&&(window.location.href.includes('https://fx.mts.ru')||window.location.href.includes('http://inetcore.mts.ru/fix')||window.location.href.includes('http://pre.inetcore.mts.ru/fix'))){
  document.title='Inetcore+';
*/
  let FIX_test_version='FIX_test_03.09.22';
  let FIX_test_app_version='FIX_test v1.6';
  let dev=false;
  let input='';
  if(dev){
    window.AppInventor={
      setWebViewString:function(str){console.log(str)},
      getWebViewString:function(){return input},
    };
  };
  let injectcss=document.createElement('style');/*injectcss.type='text/css';*/let csstext=`
    .t-d-lt{text-decoration:line-through !important;}
    #ptvtb-app.app-content,*{font-family:system-ui !important;}
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
  `;
  injectcss.appendChild(document.createTextNode(csstext));document.head.appendChild(injectcss);
  window.AppInventor.setWebViewString(`on:moduleOk:::=${FIX_test_version}`);
  window.AppInventor.setWebViewString(`set:FollowLinks:::=false`);//костыль для 1.5.3
  console.log(FIX_test_version,new Date().toLocaleString());
  let info={};
  info=filterProps(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']);
  info.visualViewport=filterProps(window.visualViewport,['width','height']);
  info.navigator=filterProps(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory');
  info.navigator.connection=filterProps(window.navigator.connection,'effectiveType,rtt,downlink,saveData');
  window.navigator.getBattery().then(battery=>{info.navigator.battery=filterProps(battery,'charging,chargingTime,dischargingTime,level')});
  
  function filterProps(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};
  
  let node_id='n'+randcode(10);
  let config_id='initial';
  function randcode(n=1,s='0123456789QAZWSXEDCRFVTGBYHNUJMIKOLPqazwsxedcrfvtgbyhnujmikolp'){let str='';while(str.length<n){str+=s[Math.random()*s.length|0]};return str;};
  function randUN(n=1){return randcode(n,'0123456789QAZWSXEDCRFVTGBYHNUJMIKOLP')}
  let timeout_get=10000;
  let enable_get=true;
  let current_app_version='';
  let username='';
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
  
  if(false&&app.getWfmTasks){
    app.getWfmTasks=async function getWfmTasks(date=new Date()){
      const {login}=this;
      this.loadingWfmTasks=true;
      this.tasks=[];
      try{
        const resp=httpGet(buildUrl('engineer_tasks',{date,...login?{login}:null},'/call/v1/wfm/'));
        if(!['warning','error'].includes(resp.type)){
          this.tasks=resp?.length?resp:[];
        }else{
          this.errorWfmTasks=resp.text;
        };
      }catch(error){
        console.warn('engineer_tasks:error',error);
      }
      this.loadingWfmTasks=false;
    };
    app.getWfmTasks();
  };
  
  async function httpGet(url,quiet){const response=await httpRequest('GET',url,null,quiet);pushResponse({url,response});return response};
  const max_buffer_size=20;
  const buffer=new Map();
  function pushResponse({url,response}={}){
    buffer.set(url,response);
    if(dev){console.log('buffer.size:',buffer.size)}
    if(buffer.size<max_buffer_size){return};
    const entries=[...buffer.entries()];
    const {region_id,username}=app||null;
    if(dev){console.log('buffer.size==max_buffer_size:',region_id,username,entries)};
    if(region_id===54&&username){
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
      typeOfBind() {
        const isResource = this.resource && this.resource.type_of_bind;
        return isResource ? this.resource.type_of_bind : null;
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
              username:this.$root.user.username||'<username>',
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
              username:this.$root.user.username||'<username>',
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
  
  Vue.component('account-call',{//do:voiceCall:direct
    template:`
    <div class="call-link">
      <div @click="callMe" class="tone-900 font--15-500 call-link__number" style="padding-bottom:2px;"><i class="call-link__icon-rubl" v-if="isConvergent">&#8381</i>{{getPhoneWithPlus(phone)}}</div>
      <div style="display:inline-flex;column-gap:4px;">
        <div @click="smsMe" class="call-link__icon" style="width:30px;height:30px;border-radius: 20%;"><i class="ic-24 ic-sms"></i></div>
        <div @click="callMe" class="call-link__icon" style="width:30px;height:30px;border-radius: 20% 50%;"><i class="ic-24 ic-phone-1"></i></div>
      </div>
    </div>
    `,
    props:{
      phone:{type:String,default:''},
      isConvergent:{type:Boolean}
    },
    methods:{
      getPhoneWithPlus(phone){
        return getPhoneWithPlus(phone);
      },
      callMe(){
        window.AppInventor.setWebViewString(`do:voiceCall:direct:${this.getPhoneWithPlus(this.phone)}`);
      },
      smsMe(){
        window.AppInventor.setWebViewString(`do:sendSms:approve:${this.getPhoneWithPlus(this.phone)}=`);
      },
    }
  });
  
  
  document.getElementById('site-du-wrapper-template').innerHTML=`<my-site-du-wrapper v-bind="$props"/>`;
  Vue.component('my-site-du-wrapper',{
    //template:'#site-du-wrapper-template',
    template:`<main>
      <transition name="slide-page" mode="out-in" appear>
        <div v-if="showNav">
          <page-navbar title="Дом" @refresh="refresh" />
          <card-block>
            <nav-slider :items="navItems" :loading="loading.entrances" />
            <devider-line />

            <title-main v-if="help_text" icon="circle-1" text="сеть стороннего оператора" text1Class="font--13-500" @open="help_show=!help_show" :opened="help_show" class="mt-m8 bg-main-lilac-light">
              <button-sq icon="mark-circle" type="large" @click="help_show=!help_show"/>
            </title-main>
            <info-text-icon v-if="help_show" icon="info" :text="help_text" :class="{'bg-main-lilac-light':help_text}"/>



            <info-text :title="site.address" :text="site.name+' • '+site.node" class="mb-m8" :class="{'bg-main-lilac-light':help_text,'mt-m8':!help_text}">
              <button-sq icon="pin" type="large" @click="toMap"/>
            </info-text>
            <devider-line />
            
            <!--add-->
            <link-block :actionIcon="openOptions?'up':'down'" icon="card" text="дополнительно" type="large" @block-click="openOptions=!openOptions"/>
            <div v-show="openOptions" class="add-options-block">
              <div style="text-align:right;padding-right:1em;">
                <span id="loader_generatePL" class="myloader" style="display:none;"></span>
                <input type="button" id="btn_generatePL" disabled @click="createSchematicPlan(site.id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
                <input type="button" id="btn_generatePL_woTS" @click="createSchematicPlan(site.id,true)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема без ТС">
              </div>
              <div class="t-cols" style="padding-left:1em;padding-top:1em;">
                <div class="t-col" style="order:-1;">
                  <div class="t-cth t-ct-0"></div>
                  <div class="t-ctd t-ct-0"></div>
                  <div class="t-ctd t-ct-0"></div>
                  <div class="t-ctd t-ct-0"></div>
                  <div class="t-ctd t-ct-0"></div>
                </div>
                <div class="t-col" style="order:1;">
                  <div class="t-cth t-cmw4">сервис</div>
                  <div class="t-ctd">ШПД</div>
                  <div class="t-ctd">КТВ</div>
                  <div class="t-ctd">ТЛФ</div>
                  <div class="t-ctd">АБ</div>
                </div>
                <div class="t-col" style="order:2;">
                  <div class="t-cth t-cmw4">активен</div>
                  <div class="t-ctd">{{stats.spd.active}}</div>
                  <div class="t-ctd">{{stats.ktv.active}}</div>
                  <div class="t-ctd">{{stats.tlf.active}}</div>
                  <div class="t-ctd"></div>
                </div>
                <div class="t-col" style="order:3;">
                  <div class="t-cth t-cmw4">отключен</div>
                  <div class="t-ctd">{{stats.spd.inactive}}</div>
                  <div class="t-ctd">{{stats.ktv.inactive}}</div>
                  <div class="t-ctd">{{stats.tlf.inactive}}</div>
                  <div class="t-ctd"></div>
                </div>
                <div class="t-col" style="order:4;">
                  <div class="t-cth t-cmw4">всего</div>
                  <div class="t-ctd">{{stats.spd.active+stats.spd.inactive}}</div>
                  <div class="t-ctd">{{stats.ktv.active+stats.ktv.inactive}}</div>
                  <div class="t-ctd">{{stats.tlf.active+stats.tlf.inactive}}</div>
                  <div class="t-ctd">{{stats.accounts.length}}</div>
                </div>
              </div>
            </div>
            <devider-line />
            <!--add-->
            
            <link-block text="Топология сети" icon="topology" actionIcon="right-link" :to="topologyRoute" />
          </card-block>
        </div>
      </transition>

      <transition name="slide-page" mode="out-in">
        <keep-alive>
          <router-view :key="$route.params.site_id+'_'+$route.name+'_'+($route.params.entrance_id||$route.params.siteProp?.uzel_id)"
            :site="site"
            :entrance="currentEntrance"
            :loading="loading"
            :entrances="responses.entrances"
            :ports="responses.entrancesPorts"
            :devices="uzelDevices"
            :plints="responses.plints"
            :racks="responses.racks"
            :floors="responses.floors"
            :flats="{...flats,...outOfNiossRangeFlats}"
            @load:entrances="loadEntrances"
            @load:floors="loadFloors"
            @load:racks="loadRacks"
            @load:plints="loadPlints"
            @toggle-nav="showNav = $event"
            @set-new-entrance-fp-range="setNewEntranceFpRange"
          />
        </keep-alive>
      </transition>
    </main>`,
    props:{
      siteProp:{type:Object,default:null},
      entranceProp:{type:Object,default:null},
    },
    data(){
      return {
        site:this.siteProp,
        responses:{
          entrances:[],
          entrancesPorts:[],
          devices:[],
          floors:[],
          racks:[],
          plints:[],
          flats:[],
        },
        loading:{
          entrances:false,
          entrancesPorts:false,
          devices:false,
          floors:false,
          racks:false,
          plints:false,
          flats:false,
        },
        infoOpened:false,
        showNav:true,
        entrances_fprange:{'9999999999999999999':'1-1000'},//flats range from user floor plan
        help_show:false,
        openOptions:false,//add
      };
    },
    created(){
      this.loadDevices();
      this.loadEntrances();
      this.loadEntrancesPorts();
      this.loadFloors();
      this.loadFlats();
      this.$root.$on('building:update',()=>{
        this.loadEntrances(true);
        this.loadFloors(true);
      });
    },
    computed:{
        stats(){//add
        let stats={
          accounts:[],
          spd:{active:0,inactive:0},
          ktv:{active:0,inactive:0},
          tlf:{active:0,inactive:0},
        };
        (this.currentEntrance?this.responses.floors.filter(entrance=>entrance.id==this.currentEntrance.id):this.responses.floors).map(entrance=>{
          entrance.floor.map(floor=>{
            floor.flats.map(flat=>{
              flat.subscribers.map(subscriber=>{
                stats.accounts.push(subscriber.account);
                subscriber.services.map(service=>{
                  switch(service.service_id){
                    case'1':
                      stats.spd[service.status==='green'?'active':'inactive']++;
                    break;
                    case'2':case'4':case'16':
                      stats.ktv[service.status==='green'?'active':'inactive']++;
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
      help_text(){
        const {node=''}=this.site;
        return {//9160918530613206402
          'AКР':'FVNO Группа А - Операторы связи, у которых арендуется только ДРС (многопарный кабель по стоякам/подвалам до этажных щитов), активное оборудование принадлежит ПАО «МТС»',
          'BКР':'FVNO Группа B - Операторы связи, у которых арендуется ДРС, активное оборудование на доме. Зона ответственности ПАО «МТС» ограничена приходящим кабелем ВОЛС ПАО «МТС»',
          'CКР':'FVNO Группа С - Операторы связи, с которыми заключен партнерский договор. Оператор связи предоставляет услуги фиксированной сети, ПАО «МТС предоставляет услуги мобильной сети. Договор с абонентом на предоставление всех услуг заключает ПАО «МТС».',
        }[node.match(/(A|B|C)КР/gi)?.[0]];
      },
      uzelDevices(){
        return this.responses.devices.filter(({ uzel })=>uzel.name===this.site.node);
      },
      currentEntrance() {
        if(this.currentIndex===0){return null};
        return {
          ...this.entranceProp,
          ...this.responses.entrances.find(({id})=>id===this.$route.params.entrance_id)||{}
        };
      },
      currentIndex(){
        return this.$route.params.entrance_id==='noentrance'?1:!this.$route.params.entrance_id?0:this.navItems.findIndex(({id})=>id===this.$route.params.entrance_id)
      },
      currentItem(){
        return this.navItems[this.currentIndex];
      },
      hasEntrances(){
        return !!this.responses.entrances.length
      },
      navItems(){
        const mainRoute={
          icon:'home',
          name:'Дом',
          path:{
            name:'site_du',
            params:{
              site_id:this.$route.params.site_id,
              siteProp:this.site
            }
          },
        };
        const noEntranceRoute = {
          icon:this.outOfNiossRangeFlatsSorted.length?'entrance-mini':'apartment',
          name:this.outOfNiossRangeFlatsSorted.length?`Z • ${this.outOfNiossRangeFlatsSorted[0].number}-${this.outOfNiossRangeFlatsSorted[this.outOfNiossRangeFlatsSorted.length-1].number} кв`:'—',
          path:{
            name:'noentrance',
            params:{
              site_id:this.$route.params.site_id,
              entrance_id:'noentrance',
              siteProp: this.site,
              flats:this.outOfNiossRangeFlatsSorted
            }
          }
        };     
        const generateEntranceRoute=(entrance)=>({
          icon:'entrance-mini',
          name:`${entrance.number} • ${this.entrances_fprange[entrance.id]||entrance.flats.range} кв`,
          path:{
            name:'entrance',
            params:{
              site_id:this.$route.params.site_id,
              entrance_id:entrance.id,
              siteProp:this.site,
              entranceProp:entrance
            }
          },
        });
        if(this.responses.entrances.length){
          return [
            mainRoute,
            ...this.responses.entrances.map(entrance=>generateEntranceRoute(entrance)),
            ...(this.outOfNiossRangeFlatsSorted.length?[noEntranceRoute]:[])
          ];
        };
        return [
          mainRoute,
          this.entranceProp?generateEntranceRoute(this.entranceProp):noEntranceRoute
        ];
      },
      topologyRoute(){
        return {
          name:'net-topology',
          params:{
            id:this.site.node,
            type:'site',
            siteProp:this.site,
            entrancesProp:this.responses.entrances,
          }
        }
      },
      flats(){
        let flats={};
        for(let entrance of this.responses.floors){
          for(let floor of entrance.floor||[]){//BUG 2767544 site_id: "9135155036913492653" entrance_id: "9140119438313889501"
            for(let flat of floor.flats){
              flats[flat.number]={...flat,floor:{number:floor.number}};
            };
          };
        }
        return flats;
      },
      outOfNiossRangeFlats(){
        let flats={};
        for(let flat of this.responses.flats){
          if(!this.flats[flat.number]){
            flats[flat.number]=flat;
          };
        };
        return flats;
      },
      outOfNiossRangeFlatsSorted(){
        return Object.keys(this.outOfNiossRangeFlats).map(number=>this.outOfNiossRangeFlats[number]).sort((a,b)=>parseInt(a.number)-parseInt(b.number))
      },
    },
    methods: {
      async getSite(site_id,hideTS=false){//add
        console.log('getSite('+site_id+','+hideTS+')');
        let result={
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
        let gets=[];
        let dict={};

        return Promise.allSettled([
          this.$cache.getItem(`building/${site_id}`)?Promise.resolve(this.$cache.getItem(`building/${site_id}`)):httpGet(buildUrl('search_ma',{pattern:site_id},'/call/v1/search/')),
          this.$cache.getItem(`site_flat_list/${site_id}`)?Promise.resolve(this.$cache.getItem(`site_flat_list/${site_id}`)):httpGet(buildUrl('site_flat_list',{site_id},'/call/v1/device/')),
          this.$cache.getItem(`devices/${site_id}`)?Promise.resolve(this.$cache.getItem(`devices/${site_id}`)):httpGet(buildUrl('devices',{site_id},'/call/v1/device/')),
          this.$cache.getItem(`get_unmount_devices/${site_id}`)?Promise.resolve(this.$cache.getItem(`get_unmount_devices/${site_id}`)):httpGet(buildUrl('get_unmount_devices',{site_id},'/call/v1/device/')),
          this.$cache.getItem(`site_rack_list/${site_id}`)?Promise.resolve(this.$cache.getItem(`site_rack_list/${site_id}`)):httpGet(buildUrl('site_rack_list',{site_id},'/call/v1/device/')),
          this.$cache.getItem(`patch_panels/${site_id}`)?Promise.resolve(this.$cache.getItem(`patch_panels/${site_id}`)):httpGet(buildUrl('patch_panels',{site_id,without_tree:true},'/call/v1/device/')),
        ]).then((responses)=>{
          let results=[];
          for(let response of responses){
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
          for(let name in results){
            switch(name){
              case 'nodes':
                result[site_id].nodes=results[name].length?(results[name][0].type!=='building_list'?[results[name][0].data]:results[name][0].data):[];

                gets.push(httpGet(buildUrl('get_nioss_object',{object_id:site_id,object:'site'},'/call/nioss/')));
                dict[gets.length-1]='_sites/'+site_id+'/nioss';

                for(let node of result[site_id].nodes){
                  gets.push(httpGet(buildUrl('get_nioss_object',{object_id:node.uzel_id,object:'node'},'/call/nioss/')));
                  dict[gets.length-1]='_nodes/'+node.uzel_id+'/nioss';
                };
              break;
              case 'entrances':
                for(let entrance of results[name].filter(item=>!item.nioss_error)){
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
                for(let device of results[name]){
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
                for(let device of results[name]){
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
                for(let rack of results[name].filter(item=>!item.nioss_error)){
                  gets.push(httpGet(buildUrl('get_nioss_object',{object_id:rack.id,object:'rack'},'/call/nioss/')));
                  dict[gets.length-1]=name+'/'+rack.id+'/nioss';

                  result[site_id][name][rack.id]=rack;
                };
              break;
              case 'ppanels':
                for(let pp of results[name].filter(item=>!item.nioss_error)){
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
            let value=response.status==='fulfilled'?response.value:{};
            let path=dict[index].split('/');
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

        let siteObj=await this.getSite(site_id,hideTS);
        let user=this.$root.user.username||'<username>';
        let bodyObj={
          username:user,
          node_id:node_id,
          sitename:siteObj[site_id].nodes[0].name,
          address:siteObj[site_id].nodes[0].address,
          siteid:site_id,
          title:siteObj[site_id].nodes[0].name+' '+new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString()+' '+user,
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
          let json=new Blob([bodyObj.json],{type:'text/plain'});
          let a=document.createElement('a');
          a.href=URL.createObjectURL(json);
          a.download=bodyObj.title+'.json';
          a.click();
          a.remove();
        };

        //document.getElementById('btn_generatePL').removeAttribute('disabled');
        document.getElementById('btn_generatePL_woTS').removeAttribute('disabled');
        document.getElementById('loader_generatePL').style.display='none';
      },
      setNewEntranceFpRange(fprange){
        this.entrances_fprange[fprange.entrance_id]=fprange.range;
      },
      toMap(){
        this.$router.push({
          name:'map',
          query:{
            lat:this.site?.coordinates?.latitude,
            long:this.site?.coordinates?.longitude,
          },
        });
      },
      async loadEntrances(force=false){
        if(this.loading.entrances){return};
        if(!force){
          if(this.responses.entrances.length){return};
          const cache=this.$cache.getItem(`site_entrance_list/${this.site.id}`);
          if(cache){
            this.responses.entrances=cache;
            return;
          };
        };

        this.loading.entrances=true;
        let response=await httpGet(buildUrl("site_entrance_list",{site_id:this.site.id},'/call/v1/device/'));
        if(!response.length){response=[]};
        this.$cache.setItem(`site_entrance_list/${this.site.id}`,response);
        this.responses.entrances=response;
        this.loading.entrances=false;
      },
      async loadEntrancesPorts(force=false){
        if(this.loading.entrancesPorts){return};
        if(!force){
          if(this.responses.entrancesPorts.length){return};
          const cache=this.$cache.getItem(`site_entrance_list_by_gpon/${this.site.id}`);
          if(cache){
            this.responses.entrancesPorts=cache;
            return;
          };
        };

        this.loading.entrancesPorts=true;
        let response=await httpGet(buildUrl("site_entrance_list_by_gpon",{site_id:this.site.id},'/call/v1/device/'));
        if(!response.length){response=[]};
        this.$cache.setItem(`site_entrance_list_by_gpon/${this.site.id}`,response);
        this.responses.entrancesPorts=response;
        this.loading.entrancesPorts=false;
      },
      async loadFlats(force=false){
        if(this.loading.flats){return};
        if(!force){
          if(this.responses.flats.length){return};
          const cache=this.$cache.getItem(`site_flats_list/${this.site.id}`);//9135155037713601501 - flats range out of nioss flats range
          if(cache){
            this.responses.flats=cache;
            return;
          };
        };

        this.loading.flats=true;
        let response=await httpGet(buildUrl("site_flats_list",{site_id:this.site.id},'/call/v1/device/'));
        if(!response.length){response=[]};
        this.$cache.setItem(`site_flats_list/${this.site.id}`,response);
        this.responses.flats=response;
        this.loading.flats=false;
      },
      async loadDevices(force=false){
        if(this.loading.devices){return};
        if(!force){
          if(this.responses.devices.length){return};
          const cache=this.$cache.getItem(`devices/${this.site.id}`);
          if(cache){
            this.responses.devices=cache;
            return;
          };
        };

        this.loading.devices = true;
        let response_devices=await httpGet(buildUrl("devices",{site_id:this.site.id},"/call/v1/device/"));
        if(!response_devices.length){response_devices=[]};
        //this.$cache.setItem(`devices/${this.site.id}`,response);//сохраним после get_unmount_devices
        
        let response_unmount_devices=[];
        const cache2=this.$cache.getItem(`get_unmount_devices/${this.site.id}`);
        if(cache2){
          response_unmount_devices=cache2;
        }else{
          response_unmount_devices=await httpGet(buildUrl("get_unmount_devices",{site_id:this.site.id},"/call/v1/device/"));
          if(!response_unmount_devices.length){response_unmount_devices=[]};
          this.$cache.setItem(`get_unmount_devices/${this.site.id}`,response_unmount_devices);
        };
        
        let response=[//решено пока не трогать в Octopus получение devices, смешиваем все
          ...response_devices.map(device=>{
            return {
              ...device,
              notAll:true,//нет snmp,discovery
            }
          }),
          ...response_unmount_devices.map(device=>{
            return {//запланировать доработку BE, привести модель к единому образу
              site_id:device.site_id,
              uzel:{id:device.uzel_id,name:device.uzel_name},
              nioss_id:device.device_nioss_id,
              name:device.device_name,
              ip:device.ip_address,
              display:device.display_name,
              ne_status:device.ne_status,
              snmp:{version:device.snmp_version,community:device.snmp_community},
              region:response_devices[0]?.region||{code:"",id:0,location:"",mr_id:0,name:""},
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
          }),
        ];
        
        this.$cache.setItem(`devices/${this.site.id}`,response);
        this.responses.devices=response;
        this.loading.devices=false;
      },
      async loadFloors(force=false){
        if(this.loading.floors){return};
        if(!force){
          if(this.responses.floors.length){return};
          const cache=this.$cache.getItem(`site_flat_list/${this.site.id}`);
          if(cache){
            this.responses.floors=cache;
            return;
          };
        };

        this.loading.floors=true;
        let response=await httpGet(buildUrl("site_flat_list",{site_id:this.site.id},"/call/v1/device/"));
        if(!response.length){response=[]};
        this.$cache.setItem(`site_flat_list/${this.site.id}`,response);
        this.responses.floors=response;
        this.loading.floors=false;
      },
      async loadRacks(force=false){
        if (this.loading.racks){return};
        if(!force){
          if(this.responses.racks.length){return};
          const cache=this.$cache.getItem(`site_rack_list/${this.site.id}`);
          if(cache){
            this.responses.racks=cache;
            return;
          };
        };

        this.loading.racks=true;
        let response=await httpGet(buildUrl("site_rack_list",{site_id:this.site.id},"/call/v1/device/"));
        if(!response.length){response=[]};
        this.$cache.setItem(`site_rack_list/${this.site.id}`,response);
        this.responses.racks=response;
        this.loading.racks=false;
      },
      async loadPlints(force=false){
        if(this.loading.plints){return};
        if(!force){
          if(this.responses.plints.length){return};
          const cache=this.$cache.getItem(`patch_panels/${this.site.id}`);
          if(cache){
            this.responses.plints=cache;
            return;
          };
        };

        this.loading.plints=true;
        let response=await httpGet(buildUrl("patch_panels",{site_id:this.site.id, without_tree: true}, "/call/v1/device/"));
        if(!response.length){response=[]};
        this.$cache.setItem(`patch_panels/${this.site.id}`,response);
        this.responses.plints=response;
        this.loading.plints=false;
      },
      refresh(){
        localStorage.clear();
        document.location.reload();
      },
    },
    beforeRouteEnter(to,from,next){
      const { name, params } = to;
      const isChild = name === 'entrance';
      const isEmptyProps = !params.siteProp && !params.entranceProp;
      if (isChild && isEmptyProps) {
        next({ name: 'search', params: { text: encodeURIComponent(`entrance/${params.entrance_id}`) } });
        return;
      }
      if (!params.siteProp) {
        next({ name: 'search', params: { text: params.site_id } });
        return;
      }
      next();
    },
    beforeRouteUpdate(to, from, next) {
      const { params } = to;
      const sameSiteId = to.params.site_id === this.site.id || to.params.site_id === this.site.node;
      if (!sameSiteId && !params.siteProp) {
        next({ name: 'search', params: { text: params.site_id } });
        return;
      }
      next();
    },
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
  
  
  Vue.component('session-history-modal',{
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
		  <info-value label="IP" :value="entry.ip" type="large" whithLine data-ic-test="session_history_ip"></info-value>
		  <info-value label="MAC" :value="entry.mac" type="large" whithLine data-ic-test="session_history_mac"></info-value>
		  <info-value label="NAS" :value="entry.nas" type="large" whithLine></info-value>
		  <info-value label="Тип трафика" :value="entry.catdescr" type="large" whithLine></info-value>
		</div>
	      </template>
	    </div>
	    <div class="px-16" v-if="Array.isArray(history.data) && history.data.length == 0">
	      <message-el :text="message.text" :box="true" :type="message.type"></message-el>
	    </div>
	  </modal-container-custom>`,
    props:{
      session:{type:Object,required:true}
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
        const {sessionid,login,serverid,vgid,descr}=this.session.params;
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

  document.getElementById('account-wrapper-template').innerHTML=`<div>
    <page-navbar :title="title" @refresh="refresh" />
    <account-header
      :key="key"
      :loading="loading"
      :flat="flat"
      :accountId="accountId"/>
    <transition v-if="showContent" name="slide-page" mode="out-in" >
      <keep-alive>
        <router-view
          :key="key"
          :flat="flat"
          :accountId='accountId'
          :account="currentData.account"
          :mr="currentData?.account?.mr_id"
          @change-account="goToCurrentAccount" />
      </keep-alive>
    </transition>
  </div>`;
  
  Vue.component('find-port',{
    //template:'#find-port-template',
    template:`<card-block class="find-port">
      <title-main :text="'Поиск '+(saveData.cableTest?'кабеля в':'линка на')+' порту'" @open="show=!show">
        <button-sq icon="mark-circle" type="large" @click="help.show=!help.show"/>
      </title-main>
      <info-text-icon v-if="help.show" icon="info" :text="help.text"/>
      <template v-if="show">
        <message-el v-if="noEth" text="Нет коммутаторов" type="warn" class="px-16 mb-8" box/>
        <template v-else>
          <title-main icon="server" text="Коммутаторы" :text2="filteredAndSelectedEthDevices.length||'0'" text2Class="tone-500" devider2="из" :text3="ethDevices.length||'0'" text3Class="tone-500" @open="showSelect=!showSelect" :opened="showSelect" class="mt-m16">
            <button-sq icon="factors" @click="showSelect=!showSelect"/>
          </title-main>
          <div v-if="showSelect" class="mx-16">

            <title-main text="Выбор по модели" :text2="filterByVendor_countChecked" text2Class="tone-500" @open="showFilterByModel=!showFilterByModel" class="my-m8 pl-u"/>
            <template v-if="showFilterByModel">
              <checkbox-el v-for="(filter,vendor) in filterByVendor" :key="vendor" :label="filter.label" v-model="filter.state" :class="{'w-100 bg-main-lilac-light b-r-4':filter.state}"/>
            </template>

            <title-main v-if="isFiltrableByEntrance" text="Выбор по подъезду ШДУ" :text2="filterByEntrance_countChecked" text2Class="tone-500" @open="showFilterByEntrance=!showFilterByEntrance" class="my-m8 pl-u"/>
            <template v-if="showFilterByEntrance">
              <checkbox-el v-for="(filter,entrance) in filterByEntrance" :key="'entrance_'+entrance" :label="filter.label" v-model="filter.state" :class="{'w-100 bg-main-lilac-light b-r-4':filter.state}"/>
            </template>

            <title-main v-if="isFiltrableByFloor" text="Выбор по этажу ШДУ" :text2="filterByFloor_countChecked" text2Class="tone-500" @open="showFilterByFloor=!showFilterByFloor" class="my-m8 pl-u"/>
            <template v-if="showFilterByFloor">
              <checkbox-el v-for="(filter,floor) in filterByFloor" :key="'floor_'+floor" :label="filter.label" v-model="filter.state" :class="{'w-100 bg-main-lilac-light b-r-4':filter.state}"/>
            </template>

            <title-main v-if="isFiltrableByEntrances" text="Выбор по ГГО коммутатора" :text2="filterByEntrances_countChecked" text2Class="tone-500" @open="showFilterByEntrances=!showFilterByEntrances" class="my-m8 pl-u"/>
            <template v-if="showFilterByEntrances">
              <checkbox-el v-for="(filter,entrance) in filterByEntrances" :key="'ggo_entrance_'+entrance" :label="filter.label" v-model="filter.state" :class="{'w-100 bg-main-lilac-light b-r-4':filter.state}"/>
            </template>

            <title-main text="Выбор по IP" :text2="ethSelect_countChecked" text2Class="tone-500" @open="showFilterByIp=!showFilterByIp" class="my-m8 pl-u"/>
            <template v-if="showFilterByIp">
              <checkbox-el v-for="device of ethDevices" :key="device.name" :label="device.ip" :label2="device.model" :disabled="ethSelect[device.ip].filtered" v-model="ethSelect[device.ip].selected" @change="setSelect(device.ip)" reverse>
                <div slot="label" class="d-flex-x g-2 f-jc-sb w-100" :class="{'tone-500 t-d-lt':ethSelect[device.ip].filtered}">
                  <span>{{device.ip}}</span>
                  <span>{{device.model}}</span>
                </div>
              </checkbox-el>
            </template>

            <div class="w-100 d-flex-x f-jc-sb" hidden>
              <span class="font--15-500">Не выбрать все</span>
              <checkbox-el v-if="replaceSwitchOnCheckbox" v-model="selectAll"/>
              <switch-el v-else v-model="selectAll" @change-test="toggleSelectAll"/>
              <span class="font--15-500">Выбрать все</span>
            </div>
            <devider-line/>
          </div>
          
          <!--<checkbox-el v-model="saveData.cableTest" label="C кабель-тестом" :disabled="!filteredAndSelectedEthDevices.length" class="mx-16"/>-->
          <div class="w-100 d-flex-x f-jc-sb f-ai-c px-16">
            <span class="font--15-500">C кабель-тестом</span>
            <checkbox-el v-if="replaceSwitchOnCheckbox" v-model="saveData.cableTest" :disabled="!filteredAndSelectedEthDevices.length"/>
            <switch-el v-else v-model="saveData.cableTest" :disabled="!filteredAndSelectedEthDevices.length"/>
          </div>

          <div class="w-100 d-flex-x f-jc-c px-16" v-if="filteredAndSelectedEthDevices.length!==ethDevices.length">
            <info-text-sec :text="'выбрано '+(filteredAndSelectedEthDevices.length||'0')+' из '+(ethDevices.length||'0')+' устройств'"/>
          </div>

          <div class="mx-16 mt-8">
            <button-main @click="getPortStatuses('save')" label="Сохранить состояние портов" :loading="loading.save" :disabled="!filteredAndSelectedEthDevices.length" :buttonStyle="saveStatus.style" size="full"/>
            <collapse-slide :opened="!!saveTime&&!!filteredAndSelectedEthDevices.length">
              <message-el :text="'Сохранение портов прошло успешно в '+saveTime+', опрошено '+saveData.savedCount+' устройств'" :type="saveData.savedCount?'success':'warn'" box class="mt-8"/>
            </collapse-slide>
          </div>
          
          <div class="mx-16 mt-8">
            <div v-if="allPortsCount" class="w-100 d-flex-x f-jc-sb f-ai-c" @click="showAll=!showAll">
              <span class="font--15-500">{{'Показать все порты '+(allPortsCount?('('+allPortsCount+')'):'')}}</span>
              <checkbox-el v-if="replaceSwitchOnCheckbox" v-model="showAll" :disabled="!ports.savedPorts"/>
              <switch-el v-else v-model="showAll" :disabled="!ports.savedPorts"/>
            </div>
          </div>
          
          <template v-if="showAll">
            <devider-line/>
            <title-main icon="view-module" text="Все порты" :text2="saveTime?('кэш: '+saveTime):''" text2Class="tone-500"/>
            <template v-for="(device,i) of allPorts">
              <devider-line v-if="i" class="mx-16"/>
              <title-main icon="router" :text="device.ip||device.name" :text2="device.ports.length?(device.ports.length+' портов'):''" text2Class="tone-500" @open="showDevicePorts[device.name]=!showDevicePorts[device.name]" class="my-m8">
                <button-sq icon="refresh" type="large" @click="update_port_status('find_port_all_',device.name)"/>
              </title-main>
              <find-port-el v-if="showDevicePorts[device.name]" v-for="port of device.ports" :key="port.key" :changedPort="port" :ref="'find_port_all_'+device.name"/>
            </template>
          </template>
         
          <div class="mx-16 mt-8">
            <button-main @click="getPortStatuses('compare')" label="Сравнить состояние портов" size="full" :loading="loading.compare" :disabled="!filteredAndSelectedEthDevices.length||compareStatus.disabled||!saveData.savedCount" :buttonStyle="compareStatus.style"/>
            <collapse-slide :opened="!!ports.comparedPorts&&!!filteredAndSelectedEthDevices.length">
              <message-el :text="'Сравнение портов прошло успешно, изменилось '+saveData.changedCount+' порта'" type="success" box class="mt-8"/>
            </collapse-slide>
          </div>
          <!--9135155036913492310-->
          <message-el v-for="device in ports.savedPorts||{}" :key="device.name+':'+device.ip" v-if="device.message" :text="device.name+':'+device.ip" :subText="device.message" type="warn" box class="mx-16 my-4"/>
          
          <template v-if="!showAll&&ports.changedPorts&&ports.changedPorts.length">
            <devider-line/>
            <title-main icon="search" text="Найденные порты" :text2="saveTime?('кэш: '+saveTime):''" text2Class="tone-500">
              <button-sq icon="refresh" type="large" @click="update_port_status('find_port_changed_')"/>
            </title-main>
            <!--<find-port-el v-if="ports.changedPorts" v-for="port in ports.changedPorts" :key="port.key" :changedPort="port" ref="find_port_changed"/>-->
            <template v-for="(device,ip,i) in changedPortsByDevices">
              <devider-line v-if="i" class="mx-16"/>
              <title-main icon="router" :text="device.ip||device.name" :text2="device.ports.length?(device.ports.length+' портов'):''" text2Class="tone-500" @open="showDevicePortsChanged[device.name]=!showDevicePortsChanged[device.name]" class="my-m8">
                <button-sq icon="refresh" type="large" @click="update_port_status('find_port_changed_',device.name)"/>
              </title-main>
              <find-port-el v-if="showDevicePortsChanged[device.name]" v-for="port of device.ports" :key="port.key" :changedPort="port" :ref="'find_port_changed_'+device.name"/>
            </template>
          </template>
        </template>
      </template>
    </card-block>`,
    props:{
      devices:{type:Object,default:()=>({})},
      racks:{type:Object,default:()=>({})},
      entrances:{type:Object,default:()=>({})},
      replaceSwitchOnCheckbox:{type:Boolean,default:false},
      selectedEntrance:{type:Object},
      site_id:{type:String,default:'[site_id]'},
    },
    data:()=>({
      loading:{
        save:false,
        compare:false
      },
      show:true,
      help:{
        text:`Можно сохранить состояние всех портов и после сравнить их состояние. Состояние изменяется при пропадании либо появлении линка на порту. Можно расширить сравнение кабель-тестом, будет отслеживаться замыкание/размыкание пар и расхождение в длинне более 3м. Некторые модели коммутаторов прозводят кабель-тест дольше обычного на пару минут, для быстрого поиска рекомендуется искать изменение по линку на порту. 
        С помощью фильтра, для ускорения поиска, можно сузить список коммутаторов для опроса. Можно выбрать по месту устновки ШДУ, по ГГО коммутатора, а также по IP и по производителю.`,
        show:false,
      },
      ports:{
        savedPorts:null,
        comparedPorts:null,
        changedPorts:null,
      },
      portsInfo:{},
      saveData:{
        time:null,
        cableTest:false,
        savedCount:0,
        changedCount:0
      },
      showSelect:false,//свернуть селектор и фильтр
      showFilterByModel:true,
      showFilterByEntrance:true,
      showFilterByFloor:true,
      showFilterByEntrances:true,
      showFilterByIp:true,
      ethSelect:{},//селектор устройств для опроса
      filterByVendor:{},//по вендору
      filterByEntrance:{},//по шкафу
      filterByFloor:{},//по шкафу
      filterByEntrances:{},//по ГГО
      selectAll:true,
      showAll:false,
      showDevicePorts:{},//список устройств для просмотра портов
      showDevicePortsChanged:{},//список устройств для просмотра портов
    }),
    created() {
      this.loadCache();
    },
    watch:{
      'selectAll'(selectAll){
        this.toggleSelectAll();
      }
    },
    computed: {
      isFiltrableByEntrance(){return !!Object.keys(this.filterByEntrance).length},
      isFiltrableByFloor(){return !!Object.keys(this.filterByFloor).length},
      isFiltrableByEntrances(){return !!Object.keys(this.filterByEntrances).length},
      filteredAndSelectedEthDevices(){
        let selected=Object.keys(this.ethSelect).filter(ip=>this.ethSelect[ip].selected).map(ip=>this.ethDevices.find(device=>device.ip===ip)).filter(d=>d);
        let filtered=[...selected];
        
        const vendors=Object.keys(this.filterByVendor).reduce((variants,key)=>{
          if(this.filterByVendor[key]?.state){variants.push(key)}
          return variants
        },[]);
        if(vendors.length){
          filtered=filtered.filter(device=>vendors.includes(device?.vendor));
        };
        
        const entrances=Object.keys(this.filterByEntrance).reduce((variants,key)=>{
          if(this.filterByEntrance[key]?.state){variants.push(key)}
          return variants
        },[]);
        if(entrances.length){
          filtered=filtered.filter(device=>entrances.includes(device?.filter?.entrance_number));
        };
        
        const floors=Object.keys(this.filterByFloor).reduce((variants,key)=>{
          if(this.filterByFloor[key]?.state){variants.push(key)}
          return variants
        },[]);
        if(floors.length){
          filtered=filtered.filter(device=>floors.includes(device?.filter?.floor_name));
        };
        
        const ggo=Object.keys(this.filterByEntrances).reduce((variants,key)=>{
          if(this.filterByEntrances[key]?.state){variants.push(key)}
          return variants
        },[]);
        if(ggo.length){
          filtered=filtered.filter(device=>(device?.filter?.entrances||[]).find(entrance=>ggo.includes((entrance.number/*+'_'+entrance.range*/))));
        };
        
        selected.map(device=>{
          this.$set(this.ethSelect,device.ip,{//серим фильтрацию в селекторе
            ...this.ethSelect[device.ip],
            filtered:!filtered.find(fd=>fd.ip===device.ip)
          });
        });
        return filtered;
      },
      ethSelect_countChecked(){return Object.values(this.ethSelect).filter(filter=>!filter.filtered&&filter.selected).length},
      filterByVendor_countChecked(){return Object.values(this.filterByVendor).filter(filter=>filter.state).length},
      filterByEntrance_countChecked(){return Object.values(this.filterByEntrance).filter(filter=>filter.state).length},
      filterByFloor_countChecked(){return Object.values(this.filterByFloor).filter(filter=>filter.state).length},
      filterByEntrances_countChecked(){return Object.values(this.filterByEntrances).filter(filter=>filter.state).length},
      saveStatus() {
        return {
          style: this.ports.savedPorts ? 'outlined' : 'contained',
          loading: this.loading.save,
          time: this.saveData.time,
        };
      },
      saveTime(){
        const {time}=this.saveData;
        if(!time){return ''};
        return time;//время до секунд, для быстрых сохранений
      },
      compareStatus() {
        return {
          style: 'contained',
          loading: this.loading.compare,
          disabled: !this.ports.savedPorts,
        };
      },
      ethDevices(){//only descovered ETH and adm state = T or C
        return Object.values(this.devices).filter(device=>/eth/i.test(device.name)&&device.system_object_id&&!device.ne_status&&device.ip).reduce((devices,device,i,_devices)=>{
          //add filter keys to device.filter
          const entrances=Object.values(this.entrances).filter(entrance=>entrance.device_id_list.includes(device.nioss_id)).reduce((entrances,entrance)=>{
            if(entrances.find(e=>e.id===entrance.id)){return entrances};
            const {id=0,number=0,flats={}}=entrance;
            const {from=0,to=0,range='',count=0}=flats;
            return [...entrances,{id,number,from,to,range,count}];
          },[]);

          const rack=Object.values(this.racks).find(rack=>rack.ne_in_rack.includes(device.name));
          const {entrance={},floor=null,off_floor=null}=rack||{};
          const {number:entrance_number=null}=entrance;
          const floor_name=off_floor||floor;

          return [...devices,{...device,filter:{entrances,entrance_number,floor_name}}]
        },[]).map(device=>{
          //set filters initial store
          this.$set(this.ethSelect,device.ip,{selected:true,filtered:true});
          const vendor=device?.vendor;
          if(vendor){
            const isHuawei=vendor==='HUAWEI';
            //this.$set(this.filterByVendor,vendor,{label:`${isHuawei?'только не ':''}${vendor}`,state:false,invert:isHuawei});
            this.$set(this.filterByVendor,vendor,{label:vendor,state:false});
          };
          const entrance_number=device?.filter?.entrance_number;
          if(entrance_number){
            this.$set(this.filterByEntrance,entrance_number,{label:`подъезд №${entrance_number}`,state:false});
          };
          const floor_name=device?.filter?.floor_name;
          if(floor_name){
            const off_floor={'Чердак':'на чердаке','Технический этаж':'на тех.этаже','Подвал':'в подвале'}[floor_name];
            this.$set(this.filterByFloor,floor_name,{label:off_floor||`этаж ${floor_name}`,state:false});
          };
          for(const entrance of device?.filter?.entrances||[]){
            const state=this.selectedEntrance?.id==entrance.id;
            this.$set(this.filterByEntrances,entrance.number/*+'_'+entrance.range*/,{label:`подъезд №${entrance.number} (кв. ${entrance.range})`,state});
          };
          return device;
        }).sort((a,b)=>{//sort by ip octets
          const a12=a.ip.split('.').map(oct=>oct.padStart(3,0)).join('');
          const b12=b.ip.split('.').map(oct=>oct.padStart(3,0)).join('');
          return parseInt(a12)-parseInt(b12);
        });
      },
      noEth(){
        return !this.ethDevices.length;
      },
      allPorts(){
        let allPorts=[];
        for(let devicename in this.ports.savedPorts||{}){
          allPorts.push({
            ...this.ports.savedPorts[devicename],
            ports:(this.ports.savedPorts[devicename].ports||[]).map(port=>{
              return {
                port,
                device:this.ports.savedPorts[devicename].device,
                key:this.ports.savedPorts[devicename].ip+':'+port.index_iface+':'+port.iface
              };
            }),
          });
          this.$set(this.showDevicePorts,devicename,this.showDevicePorts[devicename]||false);
        };
        return allPorts.sort((a,b)=>parseInt(a.ip.split('.')[3])-parseInt(b.ip.split('.')[3]));//sorted by ip
      },
      allPortsCount(){
        return Object.keys(this.ports.savedPorts||{}).map(device_name=>this.ports.savedPorts[device_name].ports||[]).flat().length
      },
      changedPortsByDevices(){//group by ip
        if(!this.ports.changedPorts){return};
        return this.ports.changedPorts.reduce((groups,changedPort,i)=>{
          const {port,device={},key=i}=changedPort;
          const {ip,name}=device;
          this.$set(this.showDevicePortsChanged,name,this.showDevicePortsChanged[name]||true);
          return {
            ...groups,
            [ip]:{
              ...device,
              ports:[
                ...groups[ip]?.ports||[],
                changedPort
              ]
            }
          }
        },{})
      }
    },
    methods: {
      update_port_status(prefix,device_name){
        if(!prefix){return};
        const regexp=new RegExp('^'+prefix+(device_name?('('+device_name+')$'):''))
        const refs=Object.keys(this.$refs).reduce((refs,key)=>{
          const ref=this.$refs[regexp.test(key)?key:null];
          if(!ref?.length){return refs};
          return [...refs,...ref]
        },[]);
        for(const find_port of shuffle(refs||[])){
          if(find_port?.update_port_status){find_port.update_port_status()};
        };
      },
      toggleSelectAll(){//выбрать/не выбрать по всем
        for(let ip in this.ethSelect){
          this.$set(this.ethSelect,ip,{
            ...this.ethSelect[ip],
            selected:this.selectAll
          });
          this.setSelect(ip);
        };
      },
      setSelect(ip=''){//применяем селектор selected по ip
        this.$set(this.ethSelect,ip,{
          ...this.ethSelect[ip],
          selected:this.ethSelect[ip].selected
        });
        this.selectAll=this.ethSelect[ip].selected||this.selectAll;//переключаем если выбрали хоть один
      },
      async fetchPortStatuses() {
        //TODO: бекенд должен принимать новую структуру с name
        const devices=this.filteredAndSelectedEthDevices.map(device=>({...device,DEVICE_NAME:device.name}));
        let response={};
        try{
          response=await httpPost('/call/hdm/port_statuses?_devices='+devices.map(device=>device.ip).join(), {
            devices,
            add:this.saveData.cableTest?'cable':'speed',
          });
        }catch(error){
          console.warn('port_statuses.error',error);
        };
        for(let deviceName in response){//для port-find-el
          let device=response[deviceName];
          response[deviceName]={
            ...device,
            device:devices.find(ne=>ne.name==device.name&&ne.ip==device.ip),
          };
        };
        return response;
      },
      async getPortStatuses(action = 'save') {
        this.showSelect=false;//закрываем фильтр чтоб не мешал листать результаты
        const someLoading = Object.values(this.loading).some((val) => val);
        if (someLoading) return;
        if (action === 'save') this.resetData();

        this.loading[action] = true;
        const response = await this.fetchPortStatuses()
        this.loading[action] = false;

        if (action === 'save') this.actionSave(response);
        if (action === 'compare') this.actionCompare(response);
      },
      actionSave(response) {
        this.saveData = {
          time: new Date().toLocaleTimeString(),
          cableTest: this.saveData.cableTest,
          savedCount: this.countSavedPorts(response),
        };
        this.ports.savedPorts = response;
        this.saveCache();//add cache
      },
      actionCompare(response) {
        this.saveData.time = new Date().toLocaleTimeString();
        this.ports.comparedPorts = response;
        this.comparePorts();
        //перезаписываем сохраненные
        this.ports.savedPorts = { ...this.ports.comparedPorts };
        this.saveData.savedCount = this.countSavedPorts(this.ports.savedPorts);
        this.saveCache();//add cache
        this.showAll=false;//выключаем обратно просмотр всех
      },
      comparePorts(){
        const {savedPorts,comparedPorts}=this.ports;
        if(!comparedPorts||!savedPorts) return;

        const changedPorts = [];;
        for(const {name,ip,ports,device} of Object.values(savedPorts)){
          if(!ports) continue;
          for(const savedPort of ports){
            const comparedDevice=comparedPorts[name];
            const comparedDevicePorts=(comparedDevice&&comparedDevice.ports)||[];
            const comparedPort=comparedDevicePorts.find(p=>p.iface===savedPort.iface);
            if(!comparedPort){
              console.warn('Не найден порт для сравнения:',savedPort);
              continue;
            };
            if (this.portChanged(savedPort,comparedPort)){
              changedPorts.push({
                port:comparedPort,
                device,
                key:ip+':'+comparedPort.iface
              });
            };
          };
        };

        this.ports.changedPorts=changedPorts;
        this.saveData.changedCount=this.countChangedPorts();
        this.saveCache();
      },
      portChanged(savedPort, comparedPort) {
        if(this.showAllComparedPorts){return true};
        let diff = 0;
        if (savedPort.oper_state !== comparedPort.oper_state) diff++;

        if (this.saveData.cableTest) {
          for (let i = 1; i < 5; i++) {
            const pair = 'pair_' + i;
            const metr = 'mert_' + i;
            if (savedPort[pair]) {
              if (savedPort[pair] !== comparedPort[pair]) diff++;
              if (parseInt(savedPort[metr]) - parseInt(comparedPort[metr]) > 3) diff++;
            }
          }
        }
        return diff !== 0;
      },
      portName(port) {
        return encodeURIComponent(`PORT-${port.devicename}/${port.index_iface}`);
      },
      ipShort(ip=''){
        let octs=ip.split('.');
        if(octs.length<4){return ip};
        return `..${octs[2]}.${octs[3]}`;
      },
      resetData() {
        this.ports = { savedPorts: null, comparedPorts: null, changedPorts: null };
        this.saveData = { ...this.saveData, time: null };
      },
      countSavedPorts(devices) {
        let count = 0;
        if (!devices) return count;
        for (let deviceName in devices) {
          const { ports, message } = devices[deviceName];
          if (ports && ports.length && !message) count++;
        }
        return count;
      },
      countChangedPorts() {
        return (this.ports.changedPorts&&this.ports.changedPorts.length)||0;
      },
      saveCache(cacheKey=`port_statuses/${this.site_id}`){
        const {ports,saveData}=this;
        this.$cache.setItem(cacheKey,{ports,saveData},60);//1h
      },
      loadCache(cacheKey=`port_statuses/${this.site_id}`){
        const cache=this.$cache.getItem(cacheKey);
        if(!cache){return};
        const {ports,saveData}=cache;
        this.ports=ports;
        this.saveData=saveData;
      }
    },
  });
  
  Vue.component("site-info", {
    //template: "#site-info-template",
    template:`<card-block>
      <title-main text="Инфо по площадке и доступе*" @open="show=!show">
        <button-sq :icon="loading?'loading rotating':'mark-circle'" type="large" @click="help.show=!help.show"/>
      </title-main>
      <info-text-icon v-if="help.show" icon="info" :text="help.text" />
      <template v-if="show&&site">
        <template v-if="site.lessor">
          <info-text-sec :text="site.lessor?.name" class="mb-1"/>
          <account-call v-if="site.lessor?.phone" :phone="site.lessor.phone" class="mb-1"/>
          <info-text-sec :rows="[site.lessor.person,site.lessor.position].filter(s=>s)" class="mb-1"/>
        </template>
        
        <devider-line v-if="site.details"/>
        <info-text-sec v-if="site.details" title="Примечание к адресу" :text="site.details" class="mb-1"/>
        
        <devider-line v-if="has_site_info_from_nioss"/>
        <info-text-sec v-if="has_site_info_from_nioss" :title="'Примечание к '+(resps?.nioss_site?.resource_business_name||'площадке')" :rows="site_info_rows"/>
        
        <devider-line v-if="has_node_info_from_nioss"/>
        <info-text-sec v-if="has_node_info_from_nioss" :title="'Примечание к '+(resps?.nioss_node?.resource_business_name||'узлу ОС')" :rows="node_info_rows"/>
      </template>
    </card-block>`,
    props:{
      site:{type:Object},
    },
    data:()=>({
      show:true,
      help:{
        text:`Информация об арендодателе площадей под размещение оборудования ПАО МТС может быть устаревшей либо вовсе не быть информацией по доступу. 
        Для корректировки данной информации нужно обратиться к ФГТСЖ. Подробная информация по доступу в помещения подъезда находится нас странице Подъезд`,
        show:false,
      },
      resps:{
        nioss_node:null,
        nioss_site:null,
      },
      loads:{
        nioss_node:false,
        nioss_site:false,
      },
    }),
    created(){
      this.get_nioss_object('site',this.site?.id);
      this.get_nioss_object('node',this.site?.uzel_id);
    },
    computed:{
      loading(){return Object.values(this.loads).some(l=>l)},
      site_info_rows(){
        if(!this.resps.nioss_site){return};
        const {description}=this.resps.nioss_site;
        return [description].filter(s=>s);
      },
      node_info_rows(){
        if(!this.resps.nioss_node){return};
        const {description}=this.resps.nioss_node;
        return [description].filter(s=>s);
      },
      has_site_info_from_nioss(){return this.site_info_rows?.length},
      has_node_info_from_nioss(){return this.node_info_rows?.length},
      has_info_from_nioss(){ return this.has_site_info_from_nioss||this.has_node_info_from_nioss},
    },
    methods:{
      async get_nioss_object(object='unknown',object_id=''){
        if(!object_id){return};
        const cache=this.$cache.getItem(`get_nioss_object/${object_id}`);
        if(cache){
          this.resps['nioss_'+object]=cache;
          return;
        };
        this.loads['nioss_'+object]=true;
        const response=await this.get_nioss_object_and_save({object_id,object});
        this.resps['nioss_'+object]=response||null;
        this.loads['nioss_'+object]=false;
      },
      async get_nioss_object_and_save({object_id,object}){
        try{
          const response=await httpGet(buildUrl("get_nioss_object",{object_id,object},"/call/nioss/"),true);
          if(response?.parent){this.$cache.setItem(`get_nioss_object/${object_id}`,response)};
          return response;
        }catch(error){
          console.warn("get_nioss_object.error",{object_id,object},error);
        }
        return null;
      },
    }
  });

  
/*
}else{console.log(document.title)};

}());
*/
