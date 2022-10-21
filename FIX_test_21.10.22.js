/*
javascript:(function(){
  
if(document.title!='Inetcore+'&&(window.location.href.includes('https://fx.mts.ru')||window.location.href.includes('http://inetcore.mts.ru/fix')||window.location.href.includes('http://pre.inetcore.mts.ru/fix'))){
  document.title='Inetcore+';
*/
  let FIX_test_version='FIX_test_21.10.22';
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
    .text-decoration-line-through{text-decoration:line-through !important;}
    .font-family-system-ui{font-family:system-ui !important;}
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
              <div class="display-flex flex-direction-column gap-4px align-items-center" style="display:flex;flex-direction:column;gap:4px;align-items:center;">
                <button-sq icon="pin" type="large" @click="toMap"/>
                <button-sq v-if="loading.nodes_by_coords" icon="loading rotating"/>
                <template v-else>
                  <flat-service-icon v-if="isIptvTech" status="green">
                    <icon-youtube-tv20 class="main-lilac size-24px" style="width:24px;height:24px;"/>
                  </flat-service-icon>
                </template>
              </div>
            </info-text>
            <devider-line />
            
            <!--add-->
            <link-block :actionIcon="openOptions?'up':'down'" icon="card" text="дополнительно" type="large" @block-click="openOptions=!openOptions"/>
            <div v-show="openOptions" class="add-options-block">
              <div style="text-align:right;padding-right:1em;">
                <span id="loader_generatePL" class="myloader" style="display:none;"></span>
                <input type="button" id="btn_save_macs" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="save mac-port">
                <input type="button" id="btn_diff_macs" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="diff mac-port">
                <input type="button" id="btn_break_sessions" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="break all sessions">
                <input type="button" id="btn_refree_all" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="refree all ports">
                <input type="button" id="btn_bind_all" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="bind by diff mac-port">
                <input type="button" id="btn_reboot_ports" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="reboot all ports">
                <input type="button" id="btn_redscv" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="re discovery all">
                <input type="button" id="btn_cabletest" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="cable test all">
                <input type="button" id="btn_generatePL" disabled @click="createSchematicPlan(site.id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
                <input type="button" id="btn_generatePL_woTS" @click="createSchematicPlan(site.id,true)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема без ТС">
                <input type="button" id="btn_drop_errors" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="btn_drop_errors">
                <input type="button" id="btn_uplinks_stat" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="get port-speed-sfp stat">
                <input type="button" id="btn_reply_this" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="btn_reply_this">
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
          nodes_by_coords:[],
        },
        loading:{
          entrances:false,
          entrancesPorts:false,
          devices:false,
          floors:false,
          racks:false,
          plints:false,
          flats:false,
          nodes_by_coords:false,
        },
        infoOpened:false,
        showNav:true,
        entrances_fprange:{'9999999999999999999':'1-1000'},//flats range from user floor plan
        help_show:false,
        openOptions:false,//add
      };
    },
    created(){
      this.getNodesByCoords();
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
          ctv:{active:0,inactive:0},
          iptv:{active:0,inactive:0},
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
      tv_type(){return this.responses.nodes_by_coords?.find(({node_id,uzel_name,node})=>node_id===this.site.node_id||uzel_name===this.site.node||node===this.site.node)?.tv_type||''},
      isIptvTech(){return /iptv/i.test(this.tv_type)},
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
          name:this.outOfNiossRangeFlatsSorted.length?`X • ${this.outOfNiossRangeFlatsSorted[0].number}-${this.outOfNiossRangeFlatsSorted[this.outOfNiossRangeFlatsSorted.length-1].number} кв`:'—',
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
          iconBefore:'entrance-mini',
          iconAfter:Object.values(entrance.blocks).some(bf=>bf)&&'warning main-orange',
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
	      const site_name=siteObj[site_id].nodes[0].name;
	      const address=siteObj[site_id].nodes[0].address;
	      const date=new Date();
	      const title=site_name+' '+date.toLocaleDateString().match(/(\d|\w){1,4}/g).join('.')+' '+date.toLocaleTimeString().match(/(\d|\w){1,4}/g).join('-')+' '+date.getTime().toString(16)+' '+user;
        let bodyObj={
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
      async getNodesByCoords(){
        if(this.tv_type||this.responses.nodes_by_coords?.length){return};
        if(this.loading.nodes_by_coords){return};
        
        //кэш с поиска по карте
        const node_by_coords=this.$cache.getItem(`building/${this.site.node}`);
        if(node_by_coords){
          this.responses.nodes_by_coords=[node_by_coords]
          return
        };
        
        const {latitude,longitude}=this.site.coordinates;
        if(!latitude||!longitude){return}
        const coords=`${latitude},${longitude}`;
        const cache=this.$cache.getItem(`buildings/${coords}`);
        if(cache){
          this.responses.nodes_by_coords=cache;
          return;
        };
        this.loading.nodes_by_coords=true;
        let response=await httpGet(buildUrl("buildings",{zoom:17,coords}, "/call/v1/device/"));
        if(!response.length){response=[]};
        this.$cache.setItem(`buildings/${coords}`,response);
        this.responses.nodes_by_coords=response;
        this.loading.nodes_by_coords=false;
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


document.getElementById('lbsv-account-content-template').innerHTML=`<my-lbsv-account-content v-bind="$props"/>`;
Vue.component("my-lbsv-account-content", {//fix equipment
  template:`<section class="account-page">
	  <lbsv-account-main
	    :account="account"
	    :account-id="accountId"
	    :agreement="agreement"
	    :flat-data="flatData"
	    :billingInfo="billingInfo"
	    :convergentBalance="convergentBalance"
	    :loading="loading"
	    :flat="flat" />
	  <card-block>
	    <title-main
	      @block-click="toEvents"
	      text="Работы по абоненту"
	      icon="accidents"
	      :attention="hasActiveIncident ? 'warn' : null">
	      <button-sq icon="right-link" class="no-events" />
	    </title-main>
	  </card-block>
	  <lbsv-services
	    :account-id="accountId"
	    :account="account"
	    :mr="mr"
	    :cp="cp"
	    :loadingCp="loading_search_by_account_or_port"
	    :groupServiceList="groupServiceList" />
	  <account-block-history :history="blockHistory" />
	</section>`,
  props: {
    accountId: { type: String, required: true },
    account: { type: Object, required: true },
    mr: { type: Number, required: true },
    flatData: { type: Object, default: null },
    building: { type: Object, default: null },
    entrance: { type: Object, default: null },
    flat: { type: Object, default: null}
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
        name: "account_events",
        params: {
          accountId: this.accountId,
        },
      });
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
                <search-link class="device-info__title" :text="device.LINK_DEVICE_NAME">{{getNetworkElementShortName(device.LINK_DEVICE_NAME)}} {{device.LINK_DEVICE_IP_ADDRESS}}</search-link>
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







  
/*
}else{console.log(document.title)};

}());
*/
