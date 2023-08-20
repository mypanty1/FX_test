//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionBindRefree.js',type:'text/javascript'}));

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
            :port="data.portInfo" class="margin-left-right-16px"/>
          
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
            <button-main v-if="openBindCPE" :disabled="loading_cpe" @click="addCpe" label="Привязать CPE" buttonStyle="contained" size="full" class="margin-top-16px"/>
          </div>

          <div v-if="result" class="margin-top-16px">
            <div v-if="result.type==='error'" class="port-bind-user-modal__default-offset">
              <message-el :text="result.text.slice(0,120)" type="error" box class="margin-top-bottom-16px" />
              <div v-if="result.refreedable"><!--add this-->
                <message-el :text="result.refreedable_message" type="warn" box class="margin-top-bottom-16px" />
                <div v-if="refree_result&&refree_result.refree_message">
                  <message-el :text="refree_result.refree_message" :type="refree_result.type" box class="margin-top-bottom-16px" />
                </div>
                <div>
                  <button-main label="освободить" @click="refree(result.refree_params)" :disabled="!!refree_loading" :loading="!!refree_loading" buttonStyle="contained" style="margin-left:auto;width:min-content;"/>
                </div>
              </div>
            </div>
            <template v-if="result.type!=='error'">
              <div v-if="result.result_message" class="port-bind-user-modal__default-offset">
                <message-el :text="result.result_message" type="success" box class="my-3"/>
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
    typeOfBind() {
      const [account={}]=this.accounts;
      if(!account){return};
      const {serverid}=account;
      if(serverid==112){
        //return 3;//временно для Белгорода
      }else if(serverid==64){
        //return 10;//временно для Омска
      };
      return this.resource?.type_of_bind||null;
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
    async serviceMixQuery(method,params){//replace this method
      this.result={};
			this.refree_result={};
      if(params.mac){
				params.get_mac={
					port:this.data.portParams,
					device:this.data.deviceParams
				};
      };
			
      this.loading=true;
			const {ip,port,mac,account,login,vgid,serverid,type_of_bind}=params;
			let log_props=Object.assign({method},{ip,port,mac,account,login,vgid,serverid,type_of_bind});
      
      try{
				//const response=await httpPost(`/call/service_mix/${method}`,params);
        const response=await CustomRequest.post(`/call/service_mix/${method}`,params);
				this.result=response;
				
				if(this.result?.type=='error'&&this.result?.text?.length>0&&this.result.text.indexOf('Мы не можем отобрать порт у контракта ')>=0){
					//Мы не можем отобрать порт у контракта 2495985 так-как он активен.
					let contract=parseInt(this.result.text.replace('Мы не можем отобрать порт у контракта ',''));
					if(contract>0){
						contract=contract.toString();
            log_props=Object.assign(log_props,{contract});
            this.$set(this.result,'refreedable',true);
            
						if(this.data.portInfo){
              const date_last=this.data.portInfo?.last_mac?.last_at?Date.parse(this.data.portInfo.last_mac.last_at.split(' ')[0].split('.').reverse().join('-')):Date.now();
              const date_last_text=new Date(date_last).toISOString().slice(0,10);//.toLocaleDateString();
							
							this.$set(this.result,'refreedable_message',{
								'busy'    :`последняя активность ${date_last_text} , есть риск отжать порт у действующего абонента`,
								'hub'     :`последняя активность ${date_last_text} , есть риск отжать порт у действующего абонента`,
								'closed'  :`контракт ${contract} расторгнут, порт можно освободить`,
								'expired' :`неактивен более 3 мес, возможно порт можно освободить`,
								'double'  :`абонент "переехал" на другой порт, возможно порт можно освободить`,
								'new'     :`на порту просто новый мак, возможно порт можно освободить`,
								'free'    :`на порту никогда небыло активности, возможно порт можно освободить`,
							}[this.data.portInfo.state]||`статус порта: ${this.data.portInfo.state||'error'} , нужно проверить`);
							
              log_props=Object.assign(log_props,{state:this.data.portInfo.state,date_last:date_last_text});
            }else{
              this.$set(this.result,'refreedable_message',`невозможно определить активность, нужно проверить`);
            };
						
            log_props=Object.assign(log_props,{user_message:this.result.refreedable_message});
           
					 this.$set(this.result,'refree_params',{
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
            });
						
            httpGet(buildUrl('get_user_rate',{serverid:params.serverid,vgid:contract},'/call/aaa/')).then(response=>{//for omsk serverid 64
              this.result.refree_params={
                ...this.result.refree_params,
                params:{
                  ...this.result.refree_params.params,
                  mac:response?.data?.[0]?.macCPE?.[0]||'0000.0000.0000',//for omsk serverid 64
                },
              };
            });
          };
					
					
				}else{
          this.result={
						...this.result,
						result_message:(this.result?.InfoMessage||'')+(this.result?.Data?.IP?(' IP:'+this.result?.Data?.IP):'')
					};
				};
				
				log_props=Object.assign(log_props,{type:this.result.type,text:this.result.text,IsError:this.result.IsError,InfoMessage:this.result.InfoMessage});
				
				try{
					fetch(`https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec`,{
						method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
						body:JSON.stringify({
							username:this.$root.username||'<username>',
							node_id:window.node_id||'<node_id>',
							action:'bind',
							method:method+'_'+params.serverid,
							props:log_props,
						})
					});
					console.log({
            username:'<username>',
            node_id:'<node_id>',
            action:'bind',
            method:method+'_'+params.serverid,
            props:log_props,
				  })
				}catch(error){
					console.warn('log',error)
				};
				
			}catch(error){
				console.warn('service_mix.error',error);
				this.result={
          text:`ошибка при обращении к ServiceMix`,
          type:'error'
        };
			};
			this.loading=false;
    },
    async refree(data){//add this method
      this.refree_loading=true;
      this.refree_result={};
			const {ip,port,mac,account,login,vgid,serverid,type_of_bind}=data.params
			let log_props=Object.assign({method:data.method},{ip,port,mac,account,login,vgid,serverid,type_of_bind});
			try{
				//const response=await httpPost(`/call/service_mix/${data.method}`,data.params);
        const response=await CustomRequest.post(`/call/service_mix/${data.method}`,data.params);
				if(!response||response?.type=='error'){
          this.refree_result={
            type:'error',
            refree_message:`освободить не удалось`,
          };
        }else{
          this.refree_result={
            type:'success',
						refree_message:`порт освобожден!${((response?.Data?.IP)?(' тут был абонент с IP:'+response?.Data?.IP):'')}`,
          };
        };
				log_props=Object.assign(log_props,{user_message:this.refree_result.refree_message});
        log_props=Object.assign(log_props,{type:this.result.type,text:this.result.text,IsError:this.result.IsError,InfoMessage:this.result.InfoMessage});
				
				try{
					fetch(`https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec`,{
						method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
						body:JSON.stringify({
							username:this.$root.username||'<username>',
							node_id:window.node_id||'<node_id>',
							action:'refree',
							method:data.method+'_'+data.params.serverid,
							props:log_props,
						})
					});
					console.log({
            username:'<username>',
            node_id:node_id||'<node_id>',
            action:'refree',
            method:data.method+'_'+data.params.serverid,
            props:log_props,
				  })
				}catch(error){
					console.warn('log',error)
				};
				
			}catch(error){
				console.warn('service_mix.error',error);
				this.refree_result={
          text:`ошибка при обращении к ServiceMix`,
          type:'error'
        };
			}
			this.refree_loading=false;
    },
  },
});


















