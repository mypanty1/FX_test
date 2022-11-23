/*
javascript:(function(){
  
if(document.title!='Inetcore+'&&(window.location.href.includes('https://fx.mts.ru')||window.location.href.includes('http://inetcore.mts.ru/fix')||window.location.href.includes('http://pre.inetcore.mts.ru/fix'))){
  document.title='Inetcore+';
*/
let FIX_test_version='FIX_test_09.11.22';
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
	@keyframes myloader-spinner{to{transform:rotate(360deg)}}`;
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

					<title-main v-if="!!fvno_group_descr" icon="circle-1" text="сеть стороннего оператора" text1Class="font--13-500" @open="show_fvno_group_descr=!show_fvno_group_descr" :opened="show_fvno_group_descr" class="mt-m8 bg-main-lilac-light">
						<button-sq icon="mark-circle" type="large" @click="show_fvno_group_descr=!show_fvno_group_descr"/>
					</title-main>
					<info-text-icon v-if="show_fvno_group_descr" icon="info" :text="fvno_group_descr" :class="{'bg-main-lilac-light':!!fvno_group_descr}"/>

					<info-text :title="site.address" :text="site.name+' • '+site.node" class="mb-m8" :class="{'bg-main-lilac-light':!!fvno_group_descr,'mt-m8':!fvno_group_descr}">
						<div class="display-flex flex-direction-column gap-4px align-items-center">
							<button-sq icon="pin" type="large" @click="toMap"/>
							<button-sq v-if="loading.nodes_by_coords" icon="loading rotating"/>
							<template v-else>
								<flat-service-icon v-if="isIptvTech" status="green">
									<icon-youtube-tv20 class="main-lilac size-24px"/>
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
							<input type="button" id="btn_save_macs" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="save mac-port">
							<input type="button" id="btn_diff_macs" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="diff mac-port">
							<input type="button" id="btn_break_sessions" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="break all sessions">
							<input type="button" id="btn_refree_all" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="refree all ports">
							<input type="button" id="btn_bind_all" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="bind by diff mac-port">
							<input type="button" id="btn_reboot_ports" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="reboot all ports">
							<input type="button" id="btn_redscv" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="re discovery all">
							<input type="button" id="btn_cabletest" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="cable test all">
							<input type="button" id="btn_generatePL" disabled @click="createSchematicPlan(site.id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
							<input type="button" id="btn_generatePL_woTS" @click="createSchematicPlan(site.id,true)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема без ТС">
							<input type="button" id="btn_drop_errors" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="btn_drop_errors">
							<input type="button" id="btn_uplinks_stat" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="get port-speed-sfp stat">
							<input type="button" id="btn_reply_this" disabled style="font-family:arial;font-size:8pt;padding:1px;opacity:0;" value="btn_reply_this">
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
			show_fvno_group_descr:false,
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
		fvno_group_descr(){return getFvnoGroupDescr(this.site?.node)},
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
			let user=this.$root.username||'<username>';
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

document.getElementById('port-content-template').innerHTML=`<my-port-content v-bind="$props"/>`;
Vue.component('my-port-content', {//add device widget
  //template: '#port-content-template',
	template:`<section class="port-content">
    <template v-if="!showSfp">
      <card-block style="padding:unset;">
        <loader-bootstrap v-if="loading.device" text="устройство загружается"/>
        <device-info v-else-if="device?.name" :networkElement="device" showLocation hideEntrances/>
      </card-block>
      <card-block>
        <title-main text="" class="mt-m8 mb-m8">
          <div slot="text" class="d-center-y">
            <div class="d-center-y mr-8">
              <span :class="getLedClass(loading.port_status,status)" style="width:50px;" @click="loadPortStatus">{{getLedText(loading.port_status,status)}}</span>
            </div>
            <span>{{localPort.snmp_name}}</span>
          </div>
          <button-sq icon="refresh" v-if="showRefresh"  @click="refresh"/>
        </title-main>
        <info-text-sec v-if="snmp_description" :title="snmp_description"/>
        <devider-line/>

        <link-block icon="speed" :text="status.IF_SPEED||'получение...'" @block-click="loadPortStatus" actionIcon="refresh"/>
        <port-vlan v-if="!loading.port&&!loading.device" :port="localPort" :device="device" :start="!device.slowCli"/>
        <port-status v-if="!loading.port&&!loading.device" :port="localPort" :status="status" :device="device" :loading_status="loading.port_status" @load:status="loadPortStatus"/>
        <port-loopback :port="localPort" :device="device" ref="loopback"/>
        <link-block icon="topology" text="Топология сети" actionIcon="right-link" :to="toTopology"/>
        <link-block icon="sfp-port" v-if="hasSfp" text="SFP модуль (DDM)" @block-click="toggleSfp" actionIcon="right-link"/>
        
      </card-block>

      <port-actions v-if="!loading.port&&!loading.device" :disabled="disabledActionBtn" :disableAction="disableAction" :port="localPort" :status="status" :device="device" :loading_status="loading.status" @load:status="loadPortStatus"/>

      <port-links :port="localPort" :devices="devices" :macs="macs" :loading_devices="loading.devices" :loading_macs="loading.macs"/>
    </template>
    <port-sfp v-else :port="localPort" :device="device" @toggle-sfp="toggleSfp"/>
  </section>`,
  props: {
    port: Object,
    showRefresh: {
      type: Boolean,
      default: false
    },
  },
  data: () => ({
    status: {},
    blockOpened: true,
    showSfp: false,
    devices:[],
    macs:[],
    device: {},
    localPort: {},
    IOErrors: '- / -',
    loading: {
      port: false,
      port_status: true,
      device: true,
      devices:false,
      macs:false,
    },
  }),
  created() {
    this.initLoad();
  },
  activated() {
    this.showSfp = false;
  },
  computed: {
    snmp_description(){//исключение для старых huawei, дефолтный дескрипшен не пустой
      return (this.localPort.snmp_description||'').includes('HUAWEI, Quidway Series,')?'':this.localPort.snmp_description;
    },
    loading_port_status(){return this.loading.port_status},
    disabledActionBtn(){
      const {is_trunk,is_link}=this.localPort;
      return [is_trunk&&is_link,is_link,this.loading_port_status].some(t=>t);
    },
    disableAction(){
      const {loading_port_status}=this;
      const {is_trunk,is_link,state}=this.localPort;
      const isTechPort=is_trunk||is_link;
      const isTechPortLinkUp=isTechPort&&this.status.IF_OPER_STATUS;
      const isBad=state==='bad';
      return {
        restart:isTechPortLinkUp||loading_port_status||isBad,
        bind_user:false,
        cable_test:isTechPortLinkUp||loading_port_status,
        log:false,
        clear_mac:isTechPort||loading_port_status,
        addr_bind:isTechPort||loading_port_status,
      }
    },
    isLoading() {
      return Object.values(this.loading).some((l) => l === true);
    },
    lastEnry() {
      if (!this.links) return null;
      if (this.links && this.links.length) {
        return this.links.sort((a, b) => new Date(b.LAST_DATE) - new Date(a.LAST_DATE))[0].LAST_DATE;
      }
      if (this.localPort.last_mac) return this.localPort.last_mac.last_at;
      return null;
    },
    hasSfp(){
      const {is_trunk,is_sfp_ddm}=this.localPort
      return is_sfp_ddm||is_trunk;
    },
    toTopology() {
      return {
        name: 'net-topology',
        params: {
          type: 'port',
          id: this.port.name,
          portProp: this.port,
          deviceProp: this.device,
        }
      }
    }
  },
  methods: {
    refresh() {
      this.initLoad();
    },
    async initLoad() {
      if (this.port) this.localPort = this.port;
      else await this.loadPort();
      const promises = [
        this.loadLink(),
        this.loadDevice(),
        this.loadPortStatus()
      ];
      await Promise.all(promises);
      if (this.$refs) {
        const LOOP_TIMEOUT = 1500;
        setTimeout(() => {
          this.$refs.loopback?.load();
        }, LOOP_TIMEOUT);
      }
    },
    ledClass(turned) {
      if (typeof turned === 'undefined') return 'port-content__led';
      const status = turned ? 'port-content__led--on' : 'port-content__led--off';
      return {
        'port-content__led': true,
        [status]: true,
      };
    },
    getLedClass(loading=true,status){
      return {
        'port-content__led':true,
        'port-content__led--off':!loading&&!status.IF_ADMIN_STATUS,
        'port-content__led--on':!loading&&status.IF_ADMIN_STATUS&&status.IF_OPER_STATUS,
      }
    },
    getLedText(loading=true,status){
      if(loading){return '...'};
      if(!status.IF_ADMIN_STATUS){return 'off'};
      if(status.IF_OPER_STATUS){return 'up'}else{return 'down'};
    },
    async loadPortStatus(){
      this.loading.port_status = true;
      try{
        const device = this.localPort.device_name;
        const port_ifindex = this.localPort.snmp_number;
        const url = buildUrl('port_status_by_ifindex', { device, port_ifindex }, '/call/hdm/');
        const response = await httpGet(url);
        this.status = response;
      }catch(error){
        console.warn('port_status.error',error);
      }
      this.loading.port_status = false;
    },
    async loadDevice(){
      this.loading.device = true;
      try{
        const response = await httpGet(buildUrl('search_ma',{ pattern:encodeURIComponent(this.localPort.device_name)},'/call/v1/search/'));
        this.device={
          ...response.data,
          slowCli:['FIBERHOME','HUAWEI'].includes(response.data.vendor),
          title:`${this.shortName(response.data.name)} • ${response.data.ip}`,
        };
      }catch(error){
        console.warn('search_ma:device.error', error);
      }
      this.loading.device = false;
    },
    shortName(name=''){
      return getNetworkElementShortName(name);
    },
    async loadPort(){
      this.loading.port = true;
      try{
        const response = await httpGet(buildUrl('search_ma',{ pattern:encodeURIComponent(this.port.name)},'/call/v1/search/'));
        this.localPort = response.data;
      }catch(error){
        console.warn('search_ma:port.error', error);
      }
      this.loading.port = false;
    },
    async loadLink(){
      try{
        this.loading.devces=true;
        const devices=await httpGet(buildUrl('port_info',{
          device:this.localPort.device_name,
          port:this.localPort.name,
          trunk:true,component:'port-content'
        }));this.devices=devices.length?devices:[];
        this.loading.devces=false;
        this.loading.macs=true;
        const macs=await httpGet(buildUrl('port_info',{
          device:this.localPort.device_name,
          port:this.localPort.name,
          trunk:false,component:'port-content'
        }));this.macs=macs.length?macs:[];
        this.loading.macs=false;
      }catch(error){
        console.warn('port_info.error', error);
      }
    },
    toggleSfp() {
      const show = !this.showSfp;
      this.showSfp = show;
      this.$emit('set:nav', !show);
    }
  },
});





Vue.component('session-el',{//redesign, need add padding-unset or create custom table
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
        <info-value v-if="ip" class="padding-unset" style="padding:unset;" label="IP" :value="ip" withLine data-ic-test="session_ip"/>
        <info-value v-if="macIsValid" class="padding-unset" style="padding:unset;" label="MAC" :value="mac" withLine data-ic-test="session_mac"/>
        <info-text-sec v-if="macVendor" class="padding-unset" style="padding:unset;" :text="macVendor"/>
        <info-value v-if="port" class="padding-unset" style="padding:unset;" label="Agent Circuit ID" :value="AgentCircuitID" withLine />
        <info-value v-if="device" class="padding-unset" style="padding:unset;" label="Agent Remote ID" :value="AgentRemoteID" withLine />
        <info-text-sec v-if="deviceMacVendor" class="padding-unset" style="padding:unset;" :text="deviceMacVendor"/>
        <info-value v-if="nas" class="padding-unset" style="padding:unset;" label="BRAS/BSR" :value="nas" withLine data-ic-test="session_nas"/>
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

Vue.component('session-history-modal',{//fix params
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
          <info-value label="BRAS/BSR" :value="entry.nas" type="large" withLine></info-value>
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
Vue.component('session-logs-modal', {//fix params
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
          <info-value label='BRAS/BSR' :value='entry.nas' type='large' withLine></info-value>
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





//fix iptv code and add credentials
Vue.component("lbsv-service-el", {
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
    pq:'',
    date:'',
    loading:false,
  }),
  getters:{
    pq:state=>state.pq,
    date:state=>new Date(Date.parse(state.date)),
    loading:state=>state.loading,
  },
  mutations:{
    set_response(state,response={}){
      state.pq=response?.pq||'';
      state.date=response?.date||'';
    },
    set_loading(state,loading=false){
      state.loading=loading;
    },
  },
  actions:{
    async getPq({state,rootGetters,commit},props){
      const username=rootGetters['main/username'];
      commit('set_loading',true);
      try{
        const url='https://script.google.com/macros/s/AKfycbyFZx3LaE77_0n-Hne597ky5P1SyrmeReaKrndXURqKhGJE6qNDjfi455OBuFcWvwaK/exec';
        const response=await fetch(`${url}?username=${username}`).then(resp=>resp.json());//await new Promise(r=>setTimeout(r,30000));
        commit('set_response',response);
      }catch(error){
        console.warn('getPq:error',error);
      }
      commit('set_loading',false);
    },
    sendLog({state,rootGetters},{account='',phone='',sms=''}={}){
      const username=rootGetters['main/username'];
      const region_id=rootGetters['main/region_id'];
      fetch('https://script.google.com/macros/s/AKfycbwl2YHpVTeUevuwTqgkm2OmP-sf78EXd91yI4neh1MrmVHA6_M_Pq8dYE7JIwyxwIsL/exec',{
        method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json;charset=utf-8"},
        body:JSON.stringify({username,region_id,account,phone,sms})
      })
    }
  },
})
function getPhoneWithPlus(phone=''){
  phone=phone.replace(/\D/g,'');
  if(!phone){return phone};
  switch(phone[0]){
    case '8':
    case '7':return `+7${phone.slice(1)}`;
    default:return phone.length==10?`+7${phone}`:phone;//номер без +7 или 8
  };
};
Vue.component('send-kion-pq',{
  template:`<div v-if="pq||loading" style="background-color:#d1dfed;" class="display-flex flex-direction-column margin-left-right-16px margin-top-bottom-8px bg-minor-200--- border-radius-8px padding-4px">
    <loader-bootstrap v-if="loading" text="получение промокода KION"/>
    <template v-else-if="pq">
      <span class="font--12-400">Отправить промокод KION</span>
      <div class="display-inline-flex column-gap-4px justify-content-space-between">
        <div class="display-inline-flex align-items-center">
          <span class="tone-900 font--15-500">{{phones[0]}}</span>
        </div>
        <div class="display-inline-flex column-gap-4px">
          <div @click="sendSms(phones[0])" v-longclick="sendSms(phones[0],'approve')" style="background-color:#284059;" class="bg-main-green--- size-30px border-radius-4px display-flex align-items-center justify-content-center">
            <i class="tone-100 ic-24 ic-sms"></i>
          </div>
        </div>
      </div>
      <span class="font--12-400">{{pq}} от {{date.toLocaleString()}}</span>
    </template>
  </div>`,
  props:{
    phone:{type:String,default:''},
    account:{type:String,default:''},
  },
  created(){
    if(!this.pq&&!this.loading){
      this.getPq()
    };
  },
  computed:{...mapGetters({
      username:'main/username',
    }),
    phones(){
      return this.phone.split(/[,;]/ig).filter(s=>s).map(phone=>getPhoneWithPlus(phone)).filter(t=>t.length>6)
    },
    ...mapGetters({
      isApp:'app/isApp',
      pq:'kion/pq',
      date:'kion/date',
      loading:'kion/loading',
    }),
    sms(){return `http://kion.ru/code?pq=${this.pq}`},
  },
  methods:{
    ...mapActions({
      sendToApp:'app/sendToApp',
      getPq:'kion/getPq',
      sendLog:'kion/sendLog',
    }),
    sendSms(phone='',mode='direct'){//mode direct or approve
      if(!phone){return};
      if(!this.pq){return};
      const {account,sms}=this;
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
    <div v-if="phone">
      <send-kion-pq :phone="phone" :account="accountId" class="mb-3"/>
    </div>
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










/*
}else{console.log(document.title)};

}());
*/
