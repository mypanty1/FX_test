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
		.myportsflex{display:flex;flex-direction:row;flex-wrap:wrap;font-size:10px;line-height:14px;text-align:center;}
		.myportinflex{margin:1px;padding:1px 5px 1px 1px;border:1px solid #000;border-radius:4px;display:grid;grid-gap:2px 2px;width:24%;grid-template-columns:24% 24% 24% 24%;grid-template-rows:min-content min-content auto auto auto auto min-content min-content;}
		.mypstline{height:14px;border-radius:2px;border-top-right-radius:4px;border-top-left-radius:4px;}
		.mypstatus{height:14px;border-radius:2px;border-top-right-radius:4px;border-top-left-radius:4px;}
		.mypnumber{height:30px;border-radius:2px;font-size:20px;line-height:30px;border-top-left-radius:4px;}
		.mylegend{width:40px;height:16px;text-align:center;line-height:16px;font-size:12px;display:inline-block;padding:0px 4px;margin:0px 10px 0px 0px;}
		.mylegendport{height:20px;line-height:10px;width:30px;padding:5px 5px;display:inline-block;margin-right:15px;}
		.myspeed{border-radius:2px;background-color:gray;}
		.myspeed10{background-color:#ffc107;}
		.myspeed100{background-color:#30BA30;/*#28a745*/}
		.myspeed1G{background-color:#42b9cc;}
		.myspeed10G{background-color:#007bff;}
		.myoperstateup{}
		.myoperstatedown{background-color:gray;}
		.myoperstatelowerLayerDown{background-color:gray;}/*Edge-Core FE L2 Switch ES3528M ETH_16KR_00551_1*/
		.myadmstateup{}
		.myadmstatedown{background-color:red;}
		.mypair{text-align:left;padding-left:2px;color:#000;font-family:monospace;line-height:12px;}
		.mypair.pairend-default{background-color:#fff;}
		.mypair.pairend-error{background-color:#faac5d;}
		.mypair.pairend-impedance_error{background-color:#faac5d;}
		.mypair.pairend-open{background-color:#fff;}
		.mypair.pairend-ok{background-color:#fff;}
		.mypair.pairend-no_cable{background-color:#dee2e6;}
		.mypair.pairend-close{background-color:#dee2e6;}
		.mypair.pairend-short{background-color:#faac5d;}
		
		.mypair.xz{}
		.mypair.eq{}
		.mypair.noteq{background-color:#fa8072;}
		
		.mypaira-default{background-color:#eacf9c;}
		.mypairb-default{background-color:#b4f3b4;}
		.mypairc-default{background-color:#c5e3ec;}
		.mypaird-default{background-color:#c78e65;}
		
		.myportok{width:100%;height:100%;}
		.myportwarn{border:1px dashed #000;}
		
		.myportcrc{}
		.iscrc{color:#ff0000;font-weight:900;font-size:11px;}
		.nocrc{}
	`;
	addCSS.appendChild(document.createTextNode(myCSS));document.head.appendChild(addCSS);
	
	/*window.AppInventor.setWebViewString('version_:FX_test_v173.a');*//*fix update, my-account-page*/
	/*window.AppInventor.setWebViewString('version_:FX_test_v173.b');*//*fix update, my-port-page, my-port-bind-user-action*/
	/*window.AppInventor.setWebViewString('version_:FX_test_v173.c');*//*temp fix update2, my-port test*/
	/*window.AppInventor.setWebViewString('version_:FX_test_v173.d');*//*my-services-el(pass for voip), my-login-pass(vgid, activatespd)*/
	/*window.AppInventor.setWebViewString('version_:FX_test_v173.e');*//*my-site-du-wrapper (download)*//*test*/
	window.AppInventor.setWebViewString('version_:FX_test_v173.f');/*fix update, my-account-page*/
	
	let info={};
	info=filterAttrs(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']);
	info.visualViewport=filterAttrs(window.visualViewport,['width','height']);
	info.navigator=filterAttrs(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory');
	info.navigator.connection=filterAttrs(window.navigator.connection,'effectiveType,rtt,downlink,saveData');
	window.navigator.getBattery().then(function(obj){info.navigator.battery=filterAttrs(obj,'charging,chargingTime,dischargingTime,level');});
	function filterAttrs(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};
	
	let username='';
	fetch('/call/main/get_user_data',{
		'method':'POST',
		'headers':{
			'Content-Type':'application/json;charset=utf-8',
			'X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
		},
	}).then(function(resp){return resp.json()}).then(function(user_data){
		if(user_data.data.username){
			username=user_data.data.username;
			if(!dev){
				fetch('https://script.google.com/macros/s/AKfycbxXeWzgHKLS1X0y5SCDVqmbFPkZByfUAFieB5tS-tmQ1Ns3k8zQxr8IUA/exec',{
					'method':'POST',
					'mode':'no-cors',
					'headers':{'Content-Type':'application/json;charset=utf-8'},
					'body':JSON.stringify({
						obj:{
							username:username,
							latitude:user_data.data.latitude,
							longitude:user_data.data.longitude,
							date:new Date(Date.now()).toString(),
							info:info,
						},
					})
				}).then(function(obj){/*console.log(obj)*/}).catch(function(err){console.log(err)}).finally(function(){});
			};
		};
	});
	
	Vue.component('ports-el',{/*потерян при редизайне*/
		template:`
			<div class="ports-el myPorts">
				<div v-if="loading">порты</div><!--modify this, мелкие буквы-->
				<template v-else>
					<div class="device-ports-view-toggle" style="font-variant-caps:unicase;"><!--add style, мелкие буквы-->
						<input @change="changeTab" name="ports-view-toggle" type="checkbox" class="view-toggle" id="ports-view-toggle" :checked="showdetails">
						<label for="ports-view-toggle">
							<div class="ports-view-toggle-background d-flex">
								<div class="col-6 d-flex d-flex justify-content-center align-items-center">компактно</div><!--modify this, мелкие буквы-->
								<div class="col-6 d-flex d-flex justify-content-center align-items-center">подробно</div><!--modify this, мелкие буквы-->
							</div>
						</label>
					</div>
					<template v-if="showdetails">
						<div v-if="isoptical">
							<center>не поддерживается устройством</center><!--modify this, мелкие буквы-->
						</div>
						<div v-else class="ports-request-info-buttons d-flex">
							<!--replace col-5-->
							<div class="col-3 col-status">
							  <button class="btn-send-request d-flex justify-content-center align-items-center" @click="getPortsErrors" :disabled="disableButton">
								<template v-if="loaded.portsErrors">ошибки</template><!--modify this, мелкие буквы-->
								<template v-else>
								  <div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div>
								  <!--delete this
								  Проверяем...
								  -->
								</template>
							  </button>          
							</div>
							<!--replace col-5-->
							<div class="col-3 col-loops">
							  <button class="btn-send-request d-flex justify-content-center align-items-center" @click="detectLoop" :disabled="disableButton">
								<template v-if="loaded.portsLoop">петли</template><!--modify this, мелкие буквы-->
								<template v-else>
								  <div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div>
								  <!--delete this
								  Проверяем...
								  -->
								</template>
							  </button>
							</div>
							<!--move updateAll to after cabletest-->
							<!--replace col-12 col-cable-test-->
							<div class="col-3 col-status">
							  <button class="btn-send-request d-flex justify-content-center align-items-center" @click="loadPortsInfo('cable')" :disabled="disableButton">
								<template v-if="loaded.portsCableTest">кабели</template><!--modify this, мелкие буквы-->
								<template v-else>
								  <div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div>
								  <!--delete this
								  Проверяем...
								  -->
								</template>
							  </button>
							</div>
							<!--move this after cabletest-->
							<div class="col-2 col-update-all" style="margin-left:auto;">
								<button class="btn-send-request d-flex justify-content-center align-items-center" @click="updateAll" :disabled="disableButton">
									<div class="fa fa-redo-alt icon-20"></div>
								</button>
							</div>
						</div>
					</template>
					<template v-if="showdetails && !isoptical">
						<template v-if="error.empty && error.emptyMessage.length">
							<div class="alert alert-danger ports-error">{{ error.emptyMessage }}</div>
						</template>
						<div v-else>
							<div v-if="!loaded.portStatuses" class="progress ports-progress">
								<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
							</div>
						</div>
						<div class="container ports-el-detail">
							<div v-if="isPortsLoaded">
								<div class="myportsflex">
									<div @click="selectPort(port)" v-for="(port, index) in ports" class="myportinflex">
										<div style="grid-area:1/1/2/5;"><div class="mypstline" :class="portClass(port)"></div></div>
										<div style="grid-area:1/1/3/3;"><div class="mypnumber" :class="portClass(port)">{{port.number}}</div></div>
										<div style="grid-area:1/3/2/5;"><div v-if="port.flat" class="mypstatus" :class="portClass(port)">{{port.flat}}</div></div>
										<div style="grid-area:2/3/3/5;"><div v-if="loaded.portStatuses && !error.empty" class="myspeed":class="linkStatusClass(index)" :style="ledActStyle(index)">{{portSpeed(index)}}</div></div>
										<!---->
										<template v-if="loaded.portStatuses && !error.empty && port.port_status">
											<template v-for="(pair, i) in pairs(index)">
												<div v-bind:style="pair.position">
													<div v-if="pair.pair && loaded.portStatuses && !error.empty" class="mypair":class="pair.pairclass">{{pair.number}}:{{pair.pair}} {{pair.metr}}</div>
												</div>
											</template>
										</template>
										
										<div style="grid-area:7/1/8/3;"><div v-if="port.port_crc_in" class="myportcrc":class="port.port_iscrc">{{port.port_crc_in}}</div></div>
										<div style="grid-area:7/3/8/5;"><div v-if="port.port_crc_out" class="myportcrc">/ {{port.port_crc_out}}</div></div>
										<div style="grid-area:8/1/9/5;"><template v-if="port.port_loop && !port.port_loop.loop_status"><div class="port-loop">Петля!</div></template></div>
									</div>
								</div>
							</div>
						</div>
					</template>			
					<template v-if="!showdetails">
						<div class="ports-el-compactly">
							<div class="list-group port-list">
								<div @click="selectPort(port)" v-for="(port, index) in ports" class="list-group-item port font-weight-bold d-flex justify-content-center align-items-center compactly-port-number" :class="portClass(port)" style="border:1px solid #000;width:24%;height:50px;border-radius:4px;margin:2px 0px 0px 2px;">
									<div class="col port-basic-info-row" style="margin:0px 2px 0px 2px;display:grid;grid-template-columns:30% 70%;">
										<div style="grid-area:1/1/2/2;"><div style="opacity:0;" class="led"></div></div>
										<div style="grid-area:1/2/2/3;"><div>{{ port.number }}</div></div>
										<div style="grid-area:2/1/3/3;"><div class="port-desc" style="width:80%"><span>{{ port.flat }}</span></div></div>
									</div>
								</div>
							</div>
						</div>
					</template>
					<div class="legend mt-2">
						<a class="legend-title small-text collapse collapsed show info-block-title display nohover" data-toggle="collapse" href="#collapseLegend">
							<span>Легенда</span>
							<div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
						</a>
						<div class="collapse legend-body" id="collapseLegend">
							<ul class="list-group">
								<template v-if="showdetails">
									<div class="w-100 py-1">length difference threshold (m):</div>
									<li class="list-group-item">
										<div class="form-row">
											<div class="form-group col-3 control">
												<input class="form-control form-control-sm" v-model="pairdelta" v-filter="'[0-9]'" maxlength="3" placeholder="m" type="number">
											</div>
										</div>
									</li>
									<div class="w-100 py-1">статус порта:</div>
								</template>
								<li class="list-group-item"><div class="mylegend myspeed mylegendport port-busy">0</div>занятые</li>
								<li class="list-group-item"><div class="mylegend myspeed mylegendport port-expired">0</div>можно освободить</li>
								<li class="list-group-item"><div class="mylegend myspeed mylegendport port-new">0</div>новый MAC</li>
								<li class="list-group-item"><div class="mylegend myspeed mylegendport port-free">0</div>cвободные</li>
								<li class="list-group-item"><div class="mylegend myspeed mylegendport port-bad">0</div>битые</li>
								<li class="list-group-item"><div class="mylegend myspeed mylegendport port-trunk busy">0</div>тех. занятые</li>
								<li class="list-group-item"><div class="mylegend myspeed mylegendport port-trunk free">0</div>тех. незанятые</li>
								<div class="w-100 py-1">мак на порту:</div>
								<li class="list-group-item"><div class="mylegend myspeed port-new">NEW</div>новый MAC</li>
								<li class="list-group-item"><div class="mylegend myspeed port-hub">HUB</div>больше одного</li>
								<li class="list-group-item"><div class="mylegend myspeed port-expired">MOVE</div>на другом порту</li>
								<template v-if="showdetails">
									<div class="w-100 py-1">состояние порта:</div>
									<li class="list-group-item"><div class="mylegend myspeed myspeed10 myoperstateup">10</div>линк на десятке</li>
									<li class="list-group-item"><div class="mylegend myspeed myspeed100">100</div>линк на сотке</li>
									<li class="list-group-item"><div class="mylegend myspeed myspeed1G">1G</div>гиговый линк</li>
									<li class="list-group-item"><div class="mylegend myspeed myspeed10G">10G</div>10гиговый линк</li>
									<li class="list-group-item"><div class="mylegend myspeed myoperstatedown">down</div>нет линка</li>
									<li class="list-group-item"><div class="mylegend myspeed myadmstatedown">off</div>порт выключен</li>
									<div class="w-100 py-1">ошибки:</div>
									<li class="list-group-item"><div class="legend-port legend-port-state">0 / 0</div>RX / TX</li>
									<li class="list-group-item"><div class="legend-port legend-port-state">999Т</div>ошибок x10³</li>
									<li class="list-group-item"><div class="legend-port legend-port-state">999М</div>ошибок x100³</li>
								</template>
							</ul>
						</div>
					</div>
				</template>
			</div>
		`,
		props:['ports','loading','showdetails','isoptical'],
		data: function () {
		  return {
			portsLoop: [],
			loaded: {
			  portStatuses: false,
			  portsLoop: true,
			  portsErrors: true,
			  portsCableTest: true
			},
			portStatusesRequested: false,
			error: {
			  empty: false,
			  emptyMessage: '',
			},
			pairdelta:4,/*length difference threshold*/
			showShadow: true,
		   }
		},
		computed: {
		  disableButton: function() {
			return !(this.loaded.portStatuses && this.loaded.portsLoop && this.loaded.portsErrors && this.loaded.portsCableTest);
		  },

		  btnShadowClass: function() {
			return this.showShadow ? "btn-shadow" : "";
		  },

		  isPortsLoaded: function() {
			if (!this.loading && this.ports.length && !this.loaded.portStatuses) { 
			  this.loadPortsInfo();
			}
			return !this.loading && this.ports.length;
		  },
		},
		methods:{
			/*EMITS*/
			changeTab:function(){
				this.$emit('change-tab');
			},
			selectPort:function(port){
				this.$emit('select-port',port);
			},
			updateAll:function(){
				if(this.ports){
					for(var i=0;i<this.ports.length;i++){
						if(this.ports[i].port_status){
							delete this.ports[i].port_status;
						}
					}
					this.loadPortsInfo();
				}
			},
			errorsHandler:function(e){
				console.warn(e);
				this.error.emptyMessage="Неизвестная ошибка. Попробуйте обновить порты.";
			},
			loadPortsInfo: function(param_add = 'speed') {
				if (this.portStatusesRequested) return;
				this.portStatusesRequested = true;
				this.loaded.portStatuses = false;
				this.error.empty = false;
				if (param_add == 'cable') {
				  this.loaded.portsCableTest = false;
				}
				if(this.ports && this.ports.length) {
				  var self = this;
				  var device = this.ports[0].device_name;

				  if (!this.ports[0].port_status || param_add == 'cable') {
					if (param_add == 'speed') {
					  var request = httpPost('/call/hdm/port_statuses', { devices: [{DEVICE_NAME: device}]});
					} else {
					  var request = httpPost('/call/hdm/port_statuses', { devices: [{DEVICE_NAME: device}], add: 'cable' });
					}
					request.then(function(data) {
					  if (data[device]) {
						if (data[device].ports) {
							var ports = data[device].ports;
							ports.map( p => {
								let port = self.ports.find(sp => sp.snmp_number == p.index_iface);
								p.status = p.oper_state.includes('up') ? 'up' : 'down';
								if(port){ Vue.set(port, 'port_status', p) };
							});								  
						} else {
						  self.error.empty = true;
						  self.error.emptyMessage = "Не удалось получить информацию о портах";
						}
					  } else { 
						self.error.empty = true;
						self.error.emptyMessage = "Не удалось получить данные с сервера";
					  }
					})
					.catch(function(e) {
					  self.errorsHandler(e);
					  self.error.empty = true;
					})
					.then(function() {
					  self.loaded.portStatuses = true;
					  self.loaded.portsCableTest = true;
					  self.portStatusesRequested = false;
					});
				  } else {
					this.loaded.portStatuses = true;
					this.portStatusesRequested = false;
				  }
				} else {
				  this.portStatusesRequested = false;
				}
			  },
			portSpeed:function(index){
				var portS=this.ports[index].port_status;
				var replace={'':"",'0':"",'10':"10",'100':"100",'1000':"1G",'10000':"10G"};
				if(portS){
					if(portS.high_speed&&portS.oper_state&&portS.admin_state){
						if(portS.admin_state=='up'){
							if(portS.oper_state=='up'){
								return replace[portS.high_speed];
							}else if(portS.oper_state=='lowerLayerDown'){/*Edge-Core FE L2 Switch ES3528M ETH_16KR_00551_1*/
								return 'down';/*'LLD'*/
							}else{
								return portS.oper_state;
							};
						}else{
							return 'off'
						};
					}else{
						return '-';
					}
				}else{
					return '?';
				};
			},
			getPortsErrors:function(){
				this.error.emptyMessage='';
				var self=this;
				var requestsCount=this.ports.length;
				var statusCount=0;
				this.loaded.portsErrors=false;
				this.ports.forEach(function(port){
					(function(port){
						var params={
							device:port.device_name,
							port:port.snmp_name
						};
						httpGet(buildUrl('port_status', params, '/call/hdm/'),false).then(function(data){
							var crc_in=self.numShow(data.IF_IN_ERRORS);
							var crc_out=self.numShow(data.IF_OUT_ERRORS);
							var iscrc=(data.IF_IN_ERRORS>0)?'iscrc':'nocrc';
							Vue.set(port,'port_crc_in',crc_in);
							Vue.set(port,'port_iscrc',iscrc);
							Vue.set(port,'port_crc_out',crc_out);
							self.loaded.portsErrors=requestsCount==++statusCount;
						}).catch(function(e){
							self.errorsHandler(e);
							self.loaded.portsErrors=true;
						});
					}(port));
				});
			},
			numShow: function(errorsCount) {
				var order = { 1: '', 2: 'т', 3: 'м', 4: 'м' };

				if (typeof(errorsCount) == 'string') errorsCount = +errorsCount;
				var value = (errorsCount) ? errorsCount.toLocaleString('ru-RU').split(/\s/g) : [null];

				return isNaN(value[0]) ? '-' : +value[0] + order[value.length];
			  },
			detectLoop:function(){
				this.loaded.portsLoop=false;
				this.error.emptyMessage='';
				var self=this;
				var deviceParams=weedOut(this.ports[0].device,'MR_ID IP_ADDRESS SYSTEM_OBJECT_ID VENDOR FIRMWARE FIRMWARE_REVISION PATCH_VERSION');
				httpPost('/call/hdm/ports_info_loopback',{device:deviceParams}).then(function(data){
					var dataIndex=0;
					if(data){
						for(var i=0;i<self.ports.length;i++){
							if(data[dataIndex]&&self.ports[i].snmp_name==data[dataIndex].iface){
								Vue.set(self.ports[i],'port_loop',data[dataIndex]);
								dataIndex++;
							}else{
								Vue.set(self.ports[i],'port_loop',null);
							}
						}
					}
					self.loaded.portsLoop=true;
				}).catch(function(e){
					self.errorsHandler(e);
					self.loaded.portsLoop=true;
				});
			},
			linkStatusClass:function(index){
				var portS=this.ports[index].port_status;
				var replace={'':"",'0':"",'10':"10",'100':"100",'1000':"1G",'10000':"10G"};
				if(portS){
					if(portS.high_speed&&portS.oper_state&&portS.admin_state){
						return 'myspeed'+replace[portS.high_speed]+' myoperstate'+portS.oper_state+' myadmstate'+portS.admin_state;
					}else{
						return '';
					};
				}else{
					return '';
				};
			},
			ledActStyle:function(index){/*мигание линков*/
				var portSt=this.ports[index].state;
				var portS=this.ports[index].port_status;
				var replace={'':"",'0':"",'10':"10",'100':"100",'1000':"1G",'10000':"10G"};
				if(portS&&portS.admin_state=='up'&&portS.oper_state=='up'&&portS.high_speed){/*HUAWEI S2328P-EI-AC ETH_54KR_00585_3*/
					if(portSt=='trunk free'||portSt=='bad'){/*[BAD],[CABLE_MON]*/
						return '';
					}else{
						return ''/*'animation: link-act-'+replace[portS.high_speed]+' '+(Math.random()*10+1)+'s infinite;';*/
					};
				};
			},
			pairs:function(index){
				var allow_statuses_arr=['close','open','short','ok','no_cable'];
				var pairs=[];
				var show=false;
				if(this.ports[index].port_status){
					var pair=this.ports[index].port_status;
					var paireqv=9999;/*эталон для подсветки разности длин*//*ETH_54KR_00340_8 п22*/
					for(var i=1;i<=4;i++){
						show=show||pair['pair_' + i];
						var pair_len=pair['metr_' + i]?parseInt(pair['metr_' + i],10):'';
						pair_len=isNaN(pair_len)?'':pair_len/*+'M'*/;
						if(paireqv==9999&&pair_len){paireqv=pair_len};/*задание эталона*/
						var pair_end=null;
						var pairClass='default';
						if(pair['pair_'+i]){
							pair_end=pair['pair_'+i].toLowerCase();
							if(allow_statuses_arr.includes(pair_end)){
								pairClass=pair_end;
								pair_end=pair_end;
							}else{
								pairClass='error';
								pair_end='error';
							};
						};
						var pairsEqClass=(paireqv!=9999&&!isNaN(pair_len))?((Math.abs(paireqv-pair_len)>=this.pairdelta)?'noteq':'eq'):'xz';/*определения разницы в парах*/
						var pair_info={
							pairclass:('pairend-'+pairClass)+' '+pairsEqClass,
							position:'grid-area:'+(i+2)+'/1/'+(i+3)+'/5;',
							number:i,
							pair:pair_end,
							metr:pair_len
						};
						pairs.push(pair_info);
					};
				}else{
					return [];
				};
				return show ? pairs : [];
			},
			portClass:function(port){
				return 'port-'+port.state;
			},
		}
	});
	
	/*document.getElementById('port-page-template').innerHTML=`<my-port-page v-bind="$props"/>`;*//*proxy template for my-port-page*/
	Vue.component('my-port-page',{
		template:`
			<section class="port-page">
				<card-block>
					<title-main textSize="large" text="">
						<template slot="text">
							<div class="d-center-y">
								<div class="d-center-y" style="margin-right:6px;">
									<span @click="loadPortStatus" :class="ledClass(status.IF_ADMIN_STATUS)">a</span>
									<span @click="loadPortStatus" :class="ledClass(status.IF_OPER_STATUS)">o</span>
								</div>
								Порт {{localPort.number}}
							</div>
						</template>
						<button-sq icon="refresh" @click="refresh" />
					</title-main>
					<info-subtitle v-if="localPort">
						<span>{{ localPort.snmp_name }}</span>
					</info-subtitle> 
					<devider-line />
					<link-block style="margin-bottom:10px;margin-top:20px;" actionIcon="" icon="port" text="" type="large">
						<template slot="wrap-prefix">
							<i style="align-self:start;" class="ic-24 ic-port link-block__icon" />
						</template>
						<template slot="text">
							<div style="display:flex;flex-direction:column;">
								<div>{{localPort.name}}</div>
								<template v-if="status.IF_SPEED">
									<span style="align-self:start;">
										<i style="font-size:12px;" class="tone-500 ic-speed"/> 
										<span class="tone-500" style="font-size:13px;">
											({{status.IF_SPEED}})
										</span>
									</span>
								</template>
							</div>
						</template>
					</link-block>
					<info-value style="margin-left:31px;" :withLine="true" type="medium" label="Последний выход" :value="lastEnry" />
					<info-value style="margin-left:31px;margin-bottom:20px;" :withLine="true" v-if="localPort.last_mac" type="medium" label="MAC" :value="localPort.last_mac.value" />
					<devider-line />
					<port-vlan v-if="!loading.port && !loading.device" :port="localPort" :device="device" />
					<port-status v-if="!loading.port && !loading.device" :port="localPort" :status="status" :device="device" :loading_status="loading.port_status" @load:status="loadPortStatus" />
					<port-loopback :port="localPort" :device="device" ref="loopback" />
					<link-block actionIcon="right-link" icon="switch" :text="localPort.device_name" :to="'/' + localPort.device_name" type="large"></link-block>
					<devider-line  v-if="localPort.snmp_description" />
					<info-list v-if="localPort.snmp_description" :text="localPort.snmp_description"></info-list>
				</card-block>
				<template v-if="!loading.port && !loading.device">
					<port-actions :disabled="disabledActionBtn" :port="localPort" :status="status" :device="device" :loading_status="loading.status" @load:status="loadPortStatus"></port-actions>
				</template>
				<port-links :links="links"></port-links>
			</section>
		`,
		props: {
			port:Object,
			task:Object,
			building:Object,
			entrance:Object,
			account:Object,
		},
		data:()=>({
			status:{},
			blockOpened:true,
			links:[],
			device:{},
			localPort:{},
			IOErrors:'- / -',
			loading:{
				port:false,
				port_status:true,
				device:true,
			},
		}),
		created(){
			this.initLoad();
		},
		beforeRouteEnter(to,from,next){
			if(!to.params.port){
				next({
					name:'search',
					params:{text:to.params.id},
				});
				return;
			};
			next();
		},
		computed:{
			disabledActionBtn(){
				return this.localPort.is_trunk||this.localPort.is_link||this.loading.port_status;
			},
			isLoading(){
				return Object.values(this.loading).some((l)=>l=== true);
			},
			lastEnry(){
				if(!this.links)return null;
				if(this.links&&this.links.length){
					return this.links.sort((a,b)=>new Date(b.LAST_DATE)-new Date(a.LAST_DATE))[0].LAST_DATE;
				};
				if(this.localPort.last_mac)return this.localPort.last_mac.last_at;
				return null;
			},
		},
		methods:{
			refresh(){
				this.initLoad();
			},
			async initLoad(){
				if(this.port)this.localPort=this.port;
				else await this.loadPort();
				this.loadDevice();
				this.loadPortStatus();
				this.loadLink();
			},
			ledClass(turned){
				if(typeof turned==='undefined') return 'port-led';
				const status=turned ? 'port-led--on':'port-led--off';
				return {
					'port-led':true,
					[status]:true,
				};
			},
			async loadPortStatus(){
				this.loading.port_status=true;
				try{
					const device=this.localPort.device_name;
					const port=this.localPort.snmp_name;
					const url=buildUrl('port_status',{device,port},'/call/hdm/');
					const response=await httpGet(url);
					this.status=response;
				}catch(error){
					console.error('Load port status',error);
				};
				this.loading.port_status = false;
				if(!this.$refs) return;
				this.$refs.loopback.load();
			},
			async loadDevice(){
				this.loading.device=true;
				try{
					const pattern=encodeURIComponent(this.localPort.device_name);
					const url=buildUrl('search',{pattern});
					const response=await httpGet(url);
					this.device=response.data;
				}catch(error){
					console.error('Load device',error);
				};
				this.loading.device = false;
			},
			async loadPort(){
				this.loading.port=true;
				console.log(this.loading.port);
				try{
					const pattern=encodeURIComponent(this.port.snmp_name);
					const url=buildUrl('search',{pattern});
					const response=await httpGet(url);
					this.localPort=response.data;
				}catch(error){
					console.error('Load port', error);
				};
				this.loading.port=false;
				console.log(this.loading.port);
			},
			loadLink:function(){
				const params={
					device:this.localPort.device_name,
					port:this.localPort.name,
					trunk:this.localPort.is_trunk,
					link:this.localPort.is_link,
				};
				httpGet(buildUrl('port_info',params)).then((data)=>{
					this.links=data;
				});
			},
		},
	});
	
	document.getElementById('port-bind-user-action-template').innerHTML=`<my-port-bind-user-action v-bind="$props"/>`;/*proxy template for my-port-bind-user-action*/
	Vue.component('my-port-bind-user-action',{
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
	
	document.getElementById('port-template').innerHTML=`<my-port v-bind="$props"/>`;/*proxy template for my-port*/
	Vue.component('my-port',{/*обновить!, есть редизайн*/
		template:`
			<div v-if="port">
				<div class="info-block port-info port-view">
					<header class="port-view__header" @click="refresh">
						<div class="d-flex align-content-center justify-content-between">
							<div class="port-view__title">порт</div>
							<div><i class="fas fa-redo-alt port-view__refresh-icon"></i></div>
						</div>
						<div class="d-flex align-content-center port-view__number-row">
							<span @click="loadStatus" class="port-view__led" :class="ledClass(port.status.IF_ADMIN_STATUS)">a</span>
							<span @click="loadStatus" class="port-view__led" :class="ledClass(port.status.IF_OPER_STATUS)">o</span>
							<div class="port-view__number">порт {{port.number}}</div>
						</div>
						<div class="port-view__snmp-name">{{port.snmp_name}}<template v-if="port.status.IF_SPEED"><span>• {{port.status.IF_SPEED}}</span></template></div>
						<div class="port-view__name">{{port.name}}</div>
					</header>
					<div class="port-view__to-device" @click="toDevice"><i class="fas fa-network-wired faded mr-3"></i>{{port.device_name}}<i class="fa fa-chevron-right float-right"></i></div>
					<div class="port-view__info">
						<div v-if="lastEnry">{{lastEnry}}<span class="inscription">последний выход</span></div>
						<div v-if="port.last_mac">{{port.last_mac.value}}<span class="inscription">MAC</span></div>
						<div v-if="port.client_ip">{{port.client_ip}}<span class="inscription">IP</span></div>
					</div>
					<port-vlan-old class="port-view__row-info" v-if="portInfoForVlan" :port="portInfoForVlan"></port-vlan-old>
					<div v-if="port.status" class="port-view__row-info" @click="clearErrors">
						<div><span><i class="fa fa-recycle"></i>&nbsp;</span><span>{{IOErrors}}</span></div>
						<span class="port-view__inscription">ошибки</span>
					</div>
					<div v-bind:disabled="loading.loopback" class="port-view__row-info">
						<div>
							<span v-if="loading.loopback"><!--Проверяем...--></span>
							<span v-else><img v-if="port.loopback.detected" src="../f/i/icons/kz.svg" title="Обнаружена петля">{{port.loopback.text||port.loopback.description}}</span>
						</div>
						<span class="port-view__inscription">петля</span>
					</div>
					<div class="port-view__description">{{ port.snmp_description }}</div>
					<div v-show="loading.status||loading.loopback"  class="progress">
						<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				</div>
				<div class="info-block">
					<a class="collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseActions" href="#collapseActions" style="padding: 4px;">
						<span>действия</span>
						<div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div class="collapse" id="collapseActions">
						<div v-if="access.deviceDeviceOr" class="action-block">
							<button @click="restartPort" v-bind:disabled="loading.restart||blockedTechPort" class="btn btn-action btn-row btn-sm">
								<i class="fas fa-power-off"></i>перезагрузить порт<span v-show="port.restartPort" class="text-success float-right"><i class="fa fa-check"></i></span>
							</button>
							<div v-show="loading.restart" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
						</div>
						<div v-if="$root.priv('LanBillingCtl')" class="action-block">
							<button v-bind:disabled="blockedSetPortOnBadPort" class="btn btn-action btn-row btn-sm" @click="setPortForUser()"><i class="fas fa-link"></i>привязать лицевой счет</button>
						</div>
						<div v-if="$root.priv('DeviceDtl')">
							<div class="action-block">
								<button @click="testCable" v-bind:disabled="loading.cabletest||blockedTechPortOperUp" class="btn btn-action btn-row btn-sm"><i class="fas fa-ruler-combined"></i>кабель тест</button>
								<template v-if="port.cabletest">
									<div v-if="port.cabletest.type=='error'" class="alert alert-danger">{{port.cabletest.message}}</div>
									<pre v-if="port.cabletest.type=='info'" class="text-block">{{port.cabletest.text.join('\\n')}}</pre>
								</template>
								<div v-show="loading.cabletest" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
							</div>
							<div class="action-block">
								<button v-bind:disabled="loading.status" @click="showLog()" class="btn btn-action btn-row btn-sm"><i class="fas fa-stream"></i>показать лог</button>
								<div v-show="loading.log" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
							</div>
							<div class="action-block">
								<button @click="showPortMacs" v-bind:disabled="loading.macs||loading.status" class="btn btn-action btn-row btn-sm"><i class="fas fa-at"></i>MAC-адреса</button>
								<template v-if="macs">
									<div v-if="macs.type=='error'" class="alert alert-danger">{{macs.message}}</div>
									<template v-if="macs.type == 'info'">
										<template v-if="macs.not_mac">
											<div>{{ macs.text}}</div>
										</template>
										<template v-else>
											<div v-for="text in macs.text" class="port-view__row">
												<div>{{text}}</div>
												<div class='inscription'>MAC</div>
											</div>
											<div>
												<action-btn v-if="access.deviceDeviceOr" @click.native="clearMac" class="mt-2" :loading="loading.cleanmac" :disabled="loading.cleanmac||loading.status" :success="port.clearMac" :error="clearMacError">очистить MAC</action-btn>
											</div>
										</template>
									</template>
								</template>
								<div v-show="loading.macs" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
							</div>
							<div class="action-block">
								<button @click="addrBindShow" v-bind:disabled="loading.addrBindShow||loading.status" class="btn btn-action btn-row btn-sm"><i class="fas fa-paperclip"></i>связка IP-MAC-PORT</button>
								<template v-if="addrBindEmpty">нет связок</template>
								<template v-if="addrBind.length>0">
									<template v-if="!addrBindShowError">
									<div>
										<template v-for="item in addrBind">
											<div class="port-view__addrbind">
												<div class="port-view__row"><div>{{item.ip}}</div><div class="inscription">IP</div></div>
												<div class="port-view__row"><div>{{item.mac}}</div><div class="inscription">MAC</div></div>
												<div class="port-view__row"><div>{{item.vlan||'null'}}</div><div class="inscription">VLAN</div></div>
												<div class="port-view__row"><div>{{item.bind}}</div><div class="inscription">тип привязки</div></div>
												<div v-if="item.lease" class="port-view__row"><div>{{item.lease}}</div><div class="inscription">Lease / Время аренды</div></div>
											</div>
										</template>
									</div>
									</template>
									<template v-else><div class="alert alert-danger">{{addrBind}}</div></template>
									<div v-if="access.deviceDeviceOr">
										<action-btn @click.native="clearBind" class="mt-2" :loading="loading.clearBind" :disabled="loading.clearBind||loading.status" :success="port.clearBind" :error="clearBindError">очистить связку</action-btn>
									</div>
								</template>
								<div v-show="loading.addrBindShow" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
							</div>
						</div>
					</div>
				</div>
				<div class="info-block port-info">
					<div v-if="loading.link"><span>подключения</span></div>
					<ul class="list-group list-group-flush">
						<li v-for="link in port.link" class="list-group-item">
							<div v-if="link.ACCOUNT" class="link">
								<div :class="{ contract : link.CLOSE_DATE }">
									<div @click="jump(link)" class="link-title"><i class="fa fa-user"></i>Абонент<i class="fa fa-chevron-right float-right"></i></div>
									<div>{{link.ACCOUNT}}<span class="inscription">лицевой счет</span></div>
									<div v-if="link.FLAT_NUMBER" >№ {{link.FLAT_NUMBER}}<span class="inscription">квартира</span></div>
									<div>{{link.START_DATE}}<span class="inscription">заключен</span></div>
									<div v-if="link.CLOSE_DATE">{{link.CLOSE_DATE}}<span class="inscription">расторгнут</span></div>
									<div>{{link.MAC}}<span class="inscription">MAC</span></div>
									<div v-if="link.CLIENT_IP">{{link.CLIENT_IP}}<span class="inscription">IP</span></div>
									<div>{{link.FIRST_DATE}}<span class="inscription">первый выход</span></div>
									<div>{{link.LAST_DATE}}<span class="inscription">последний выход</span></div>
								</div>
							</div>
							<div v-else-if="link.LINK_DEVICE_NAME" class="link">
								<div v-on:click="jump(link)" class="link-title"><i class="fa fa-microchip"></i>{{deviceType(link.LINK_DEVICE_NAME)}}<i class="fa fa-chevron-right float-right"></i></div>
								<div class="mt-2">{{link.LINK_DEVICE_NAME}}<span class="inscription">устройство</span></div>
								<div class="d-flex mt-1">
									{{link.LINK_DEVICE_IP_ADDRESS}} 
									<div v-if='link.LINK_PORT_NUMBER' class="d-flex text-center"><div class="ml-1"> • </div><div class="ml-1 text-c trunk-port-link">{{Number(link.LINK_PORT_NUMBER)}}</div></div> 
									<span class="inscription">IP • порт</span>
								</div>
								<div class="d-flex mt-1"><span class="w-75">{{shortAddress(link.LINK_DEVICE_LOCATION)}}</span><span class="inscription">адрес</span></div>
								<div class="mt-1">
									<div class="d-flex">
										<div v-if="link.LINK_RACK_TYPE" class="rackBox-type"><i v-if="link.LINK_RACK_TYPE=='Антивандальный'" class="fas fa-lock"></i><i v-else class="fas fa-cube"></i></div> 
										<div v-if="link.LINK_ENTRANCE_NO" class="rackBox-floor"><i class="fas fa-door-open"></i>{{link.LINK_ENTRANCE_NO}}</div> 
										<div v-if="link.LINK_RACK_LOCATION" class="rackBox-location">{{link.LINK_RACK_LOCATION}}</div>
									</div>
								</div>
							</div>
							<div v-else-if="link.empty" class="link">
								<div class="link-title">
									<i class="fa fa-circle-notch"></i>
									<template v-if='port.is_trunk'>Технологический порт</template>
									<template v-else>Свободный порт</template>
								</div>
							</div>
							<div v-else class="link">
								<div class="link-title"><i class="fa fa-user-secret"></i></div>
								<div>{{link.MAC}}<span class="inscription">MAC</span></div>
								<div>{{link.FIRST_DATE}}<span class="inscription">первый выход</span></div>
								<div>{{link.LAST_DATE}}<span class="inscription">последний выход</span></div>
							</div>
						</li>
						<li v-if="state=='bad'" class="list-group-item">
							<div class="link-title"><i class="fa fa-window-close"></i>Битый порт</div>
						</li>
						<li v-else-if="state=='free'" class="list-group-item">
							<div class="link-title"><i class="fa fa-expand"></i><template v-if='port.is_trunk'>Технологический порт</template><template v-else>Свободный порт</template></div>
						</li>
					</ul>
					<div v-if="loading.link" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
				</div>
				<div class="modal fade" id="logModal" tabindex="-1" role="dialog">
					<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title" id="exampleModalLabel">Лог</h5>
								<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							</div>
							<div class="modal-body">
								<div v-show="log.status=='success'" style="height: 396px; overflow: scroll;"><p v-for="logLine in log.data">{{logLine}}</p></div>
								<div v-show="log.status=='error'" style="height: 396px; overflow: scroll;"><p class="text-danger">Ошибка получения данных</p></div>
								<div v-if="loading.log" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
								<button type="button" class="btn btn-secondary mt-3" data-dismiss="modal">Закрыть</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
		props:['data'],
		data:function(){
			return {
				loading:{
					link:false,
					status:false,
					cabletest:false,
					cleanmac:false,
					restart:false,
					clean:false,
					loopback:false,
					log:false,
					macs:false,
					addrBindShow:false,
					clearBind:false,
				},
				cabletest:{},
				loopback:{},
				macs:{},
				IOErrors:'- / -',
				log:{
					status:'',
					data:[],
				},
				state:'free',
				device:{},
				port:{},
				clearMacError:false,
				clearBindError:false,
				addrBindShowError:false,
				addrBindEmpty:false,
				addrBind:[],
				access:{
					deviceDeviceOr:this.$root.priv_or(['DeviceCtl', 'DeviceCtlLite']),
				},
			};
		},
		created:function(){
			if(this.data){
				const data=Array.isArray(this.data)?this.data[0]:this.data;
				this.port=data;
				if(data.device){
					this.device=data.device;
					this.loadStatus();
				}else{
					this.loadDevice(()=>{this.loadStatus();});
				};
			};
			switch(this.data.state){
				case'bad':
					this.state='bad';
				break;
				case'free':
				case'trunk free':
					this.state='free';
				break;
				default:
					this.state='busy';
			};
			if(!this.data.link&&this.state=='busy')this.loadLink();
			this.port.status={};
			this.port.loopback={};
		},
		computed:{
			/*
			blockedSetButton:function(){
				return this.port.is_trunk||this.port.is_link||this.loading.status;
			},
			*/
			blockedTechPort: function () {
				return this.port.is_trunk||this.port.is_link||this.loading.status;
			},
			blockedSetPortOnBadPort: function () {
				return this.port.state=='bad'||this.port.status.IF_ADMIN_STATUS==false||this.loading.status;
			},
			blockedTechPortOperUp: function () {
				return ((this.port.is_trunk||this.port.is_link)&&this.port.status.IF_OPER_STATUS)||this.loading.status;
			},
			portParams:function(){
				return {
					SNMP_PORT_NAME:this.port.snmp_name,
					PORT_NUMBER:this.port.number,
				};
			},
			deviceParams:function(){
				const keys='MR_ID IP_ADDRESS SYSTEM_OBJECT_ID VENDOR FIRMWARE FIRMWARE_REVISION PATCH_VERSION DEVICE_NAME';
				return weedOut(this.device,keys);
			},
			lastEnry(){
				const {port}=this;
				if(!port)return null;
				if(port.link&&port.link.length){
					return port.link.sort((a,b)=>new Date(b.LAST_DATE)-new Date(a.LAST_DATE))[0].LAST_DATE;
				};
				if(port.last_mac)return port.last_mac.last_at;
				return null;
			},
			portInfoForVlan(){
				if(Object.keys(this.device).length==0)return false;
				const data=this.port;
				const device=this.device;
				return {
					mr_id:device.MR_ID,
					ip_address:device.IP_ADDRESS,
					system_object_id:device.SYSTEM_OBJECT_ID,
					vendor:device.VENDOR,
					port:data.snmp_name,
					name:data.name
				};
			},
			portObj:function(){/*for portObj, for set-port-modal*/
				return {
					region:this.device.REGION_ID,
					state:this.port.state,
					subscriber_list:this.port.subscriber_list,
					last_mac:this.port.last_mac,
				};
			},
		},
		methods:{
			shortAddress:function(addr){return addr.split(', ').reverse()[1].replace(/\s/g,'')+' '+addr.split(', ').reverse()[0].replace(/\s/g,'')},/*ул.БорисаБогаткова д.194/2*/
			refresh:function(){
				this.$root.clean();
				this.$root.find(this.port.name);
			},
			loadLink:function(){
				if(this.port.link)return;
				this.loading.link=true;
				const params={
					device:this.port.device_name,
					port:this.port.name,
					trunk:this.port.is_trunk,
					link:this.port.is_link,
				};
				httpGet(buildUrl('port_info',params)).then((data)=>{
					this.port.link=data;
					if(data&&data.length==0)this.state='free';
					this.loading.link=false;
				});
			},
			loadStatus:function(){
				if(this.loading.status)return;
				this.port.status={};
				this.port.status.text='загружается...';
				this.loading.status=true;
				const params={
					device:this.port.device_name,
					port:this.port.snmp_name,
				};
				httpGet(buildUrl('port_status',params,'/call/hdm/'),true).then((data,isMsg)=>{
					var numShow=function(val){return isNaN(val)?'-':+val};
					if(isMsg)this.port.status.text='не удалось получить';
					else this.port.status = data;
					this.IOErrors=numShow(data.IF_IN_ERRORS)+' / '+numShow(data.IF_OUT_ERRORS);
					this.loading.status=false
					/*
					if(data.data){
						this.port.status=data.data;
						this.IOErrors=numShow(data.IF_IN_ERRORS)+' / '+numShow(data.IF_OUT_ERRORS);
					}else{
						this.port.status.text='не удалось получить';
					};
					this.loading.status = false;
					*/
				});
				this.detectLoop();
			},
			jump:function(link){
				if(link.ACCOUNT){
					this.$root.jump(link.ACCOUNT);
				}else if(link.LINK_DEVICE_NAME){
					this.$root.jump(link.LINK_DEVICE_NAME);
				};
			},
			ledClass:function(turned){
				if(typeof turned==='undefined')return '';
				return turned?'on port-view__led--on':'off port-view__led--off';
			},
			toDevice:function(){
				this.$root.jump(this.port.device_name,true);
			},
			restartPort:function(){
				this.loading.restart=true;
				this.port.restartPort=false;
				this.loadDevice(()=>{
					const params={
						port:this.portParams,
						device:this.deviceParams
					};
					httpPost('/call/hdm/port_reboot',params).then((data)=>{
						this.loading.restart=false;
						if(data.message==='OK'){
							this.data.restartPort=true;
							this.loadStatus();
						};
					});
				});
			},
			addrBindShow(){
				this.loading.addrBindShow=true;
				this.addrBindShowError=false;
				this.addrBindEmpty=false;
				const params={
					port:this.portParams,
					device:this.deviceParams
				};
				httpPost('/call/hdm/addrbind_show',params).then((response)=>{
					if(response.message=='OK'){
						this.addrBind=response.text;
						if(this.addrBind.length===0){
							this.addrBindEmpty=true;
						};
					}else{
						this.addrBindShowError=true;
						this.addrBind=response.text;
					};
					this.loading.addrBindShow=false;
				}).catch(()=>{
					this.addrBindShowError=true;
					this.addrBind=response.text;
					this.loading.addrBindShow=false;
				});
			},
			clearBind(){
				this.loading.clearBind=true;
				this.port.clearBind=false;
				this.clearBindError=false;
				const params={
					port:this.portParams,
					device:this.deviceParams,
				};
				httpPost('/call/hdm/clear_bind',params).then((data)=>{
					if(data.message==='OK'){
						this.port.clearBind=true;
						this.loadStatus();
						this.addrBindShow();
					}else{
						this.clearBindError=true;
					};
					this.loading.clearBind=false;
				}).catch(()=>{
					this.clearBindError=true;
				});
			},
			clearMac(){
				this.loading.cleanmac=true;
				this.port.clearMac=false;
				this.clearMacError=false;
				this.loadDevice(()=>{
					const params={
						port:this.portParams,
						device:this.deviceParams,
					};
					httpPost('/call/hdm/clear_macs_on_port',params).then((data)=>{
						this.loading.cleanmac=false;
						if(data.message==='OK'){
							this.port.clearMac=true;
							this.loadStatus();
							this.showPortMacs()
						}else{
							this.clearMacError=true;
						};
					}).catch(()=>{
						this.clearMacError=true;
					});
				});
			},
			testCable:function(){
				this.loading.cabletest=true;
				this.port.cabletest={};
				this.loadDevice(()=>{
					const params={
						port:this.portParams,
						device:this.deviceParams,
					};
					httpPost('/call/hdm/port_cable_test',params).then((data)=>{
						this.port.cabletest=data;
						this.loading.cabletest=false;
					});
				});
			},
			loadDevice:function(callback){
				const is_device=!(Object.keys(this.device).length>0);
				if(is_device){
					const params={
						pattern:encodeURIComponent(this.port.device_name),
					};
					httpGet(buildUrl('search',params)).then((response)=>{
						this.device=response.data;
						this.$nextTick(()=>{
							callback();
						});
					});
				}else{
					callback();
				};
			},
			clearErrors:function(){
				this.loading.status=true;
				this.port.status={};
				this.loadDevice(()=>{
					const params={
						port:this.portParams,
						device:this.deviceParams,
					};
					httpPost('/call/hdm/port_error_clean',params).then(()=>{
						this.loading.status=false;
						this.loadStatus();
					});
				});
			},
			detectLoop:function(){
				this.loading.loopback=true;
				this.port.loopback={};
				this.loadDevice(()=>{
					const params={
						port:this.portParams,
						device:this.deviceParams,
					};
					httpPost('/call/hdm/port_info_loopback',params,true).then((data)=>{
						this.data.loopback=data;
						this.loading.loopback=false;
					});
				});
			},
			showLog(){
				$('#logModal').modal('toggle');
				this.loading.log=true;
				this.log.status='';
				const params={
					port:this.portParams,
					device:this.deviceParams,
				};
				httpPost('/call/hdm/log_short',params).then((data)=>{
					if(data.message==='OK'){
						Object.assign(this.log,{
							status:'success',
							data:data.text,
						});
					}else if(data.error){
						Object.assign(this.log,{
							status:'error',
							data:data.text,
						});
					};
					this.loading.log=false;
				});
			},
			setPortForUser:function(){
				this.$root.showModal({
					title:'выбор ЛС',
					data:{
						portNumber:this.port.number,
						portParams:this.portParams,
						deviceParams:this.deviceParams,
						portReBindData:this.portObj,/*add portReBindData, for set-port-modal*/
					},
					component:'set-port-modal',
				});
			},
			showPortMacs:function(){
				this.loading.macs=true;
				const params={
					port:this.portParams,
					device:this.deviceParams,
				};
				httpPost('/call/hdm/port_mac_show',params).then((data)=>{
					if(typeof data.text=='string'){
						this.macs=data;
						this.macs.not_mac=data.text;
					}else{
						this.macs=data;
					};
					this.loading.macs=false;
				});
			},
			deviceType(name){
				if(/ETH/i.test(name))return 'Коммутатор';
				if(/OP/i.test(name))return 'Оптический приемник';
				return 'Устройство';
			},
		},
	});
	
	Vue.component('set-port-modal',{/*обновить!, есть редизайн*/
	  template:`
		<div class="container-fluid">
			<div class="search-ctrl box-shadow-none search-account-modal" style="height:unset;">
				<div class="input-group">
					<!--modify this, мелкие буквы-->
					<input id="searchPanelAccount" v-filter="'[0-9-]'" v-model.lazy="sample" @keyup.enter="searchAccount" type="text" class="form-control" placeholder="найти">
					<div class="input-group-append">
						<button v-on:click="audio" v-if="audioShow" class="btn btn-audio btn-erase" type="button"><i class="fas fa-microphone"></i></button>
						<button v-on:click="erace" class="btn btn-erase" type="button"><i class="fas fa-times"></i></button>
						<button v-on:click="searchAccount" class="btn btn-search" type="button"><i class="fas fa-search"></i></button>
					</div>
				</div>
			</div>
			<div v-if="account">
				<p class="small-text">результат поиска:</p><!--modify this, мелкие буквы-->
				<div v-if="account.isError" v-html="account.text" class="alert alert-warning" role="alert"></div>
				<div v-else>
					<div class="account-block account-info" v-for="acc in account.data">
						<!--replace this
						<span class="account-header">
							<i class="fa fa-user"></i> {{ acc.agreements.account }}
						</span>
						-->
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
											<!--replaced this fragment-->
											<span class="custom-control-label custom-control-empty">{{vg.login}} • {{vg.vgid}}</span>
											<div v-if="true||vg.serverid=='108'" class="full-fill">
												<button @click="activateSpd(vg.vgid)" v-bind:disabled="loading||vg.serverid!='108'" type="submit" class="btn btn-primary btn-sm" style="margin-left:20px;">активировать {{vg.vgid}}</button>
											</div>
											<div class="small-text">{{vg.accondate}}<span class="inscription"> создан</span></div>
											<div class="small-text">{{vg.tardescr}}</div>
											<div v-if="vg.addresses&&vg.addresses[0]&&(shortAddress(vg.addresses[0].address)!=shortAddress(acc.address))" class="small-text">{{shortAddress(vg.addresses[0].address)}}</div>
											<!--replaced this fragment-->
										</div>
									</label>
								</div>
							</div>
							
							
							<!--add комок,порт-->
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
								<!--replace this fragment-->
								<input class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23" placeholder="override">
								<!--replace this fragment-->
								<!--modify this fragment-->
								<select id="macs" class="form-control form-control-sm" v-model="mac.selected">
									<option v-for="mc in mac.list">{{ mc }}</option>
								</select>
								<!--modify this fragment-->
								<button @click="setupMacForUser()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-3" type="submit">связать mac</button><!--modify this, мелкие буквы-->
							</div>
							<div v-else-if="typeOfBind == 3 || typeOfBind == 6 || typeOfBind == 8" class="form-row">
								<input v-if="typeOfBind == 6" class="form-control form-control-sm mb-2" v-filter="'[0-9\.]'" v-model="client_ip" maxlength="15">
								<button @click="setBind(3)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill" type="submit">связать счет</button><!--modify this, мелкие буквы-->
								<button v-if="typeOfBind == 8" @click="setBind(8)" v-bind:disabled="loading" class="btn mt-2 btn-primary btn-sm btn-fill" type="submit">выделить IP(не нажимать!)</button><!--modify this, мелкие буквы-->
							</div>
							<div v-else-if="typeOfBind == 5" class="form-row">
								<button @click="setBind(3)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-1" type="submit">связать счет</button><!--modify this, мелкие буквы-->
								<!--replace this fragment-->
								<input class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23" placeholder="override">
								<!--replace this fragment-->
								<!--modify this fragment-->
								<select id="macs" class="form-control form-control-sm" v-model="mac.selected">
									<option v-for="mc in mac.list">{{ mc }}</option>
								</select>
								<!--modify this fragment-->
								<button @click="insOnlyMac()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">связать mac</button><!--modify this, мелкие буквы-->
							</div>
							<div v-else-if="typeOfBind == 7 || typeOfBind == 9" class="form-row"><!--region78, type 9-->
								<!--replace this fragment-->
								<input class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23" placeholder="override">
								<!--replace this fragment-->
								<!--modify this fragment-->
								<select id="macs" class="form-control form-control-sm" v-model="mac.selected">
									<option v-for="mc in mac.list">{{ mc }}</option>
								</select>
								<!--modify this fragment-->
								<button v-if="typeOfBind == 7" @click="setBind(7)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">перепривязать mac</button><!--modify this, мелкие буквы-->
								<button v-if="typeOfBind == 9" @click="setBind(9)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">связать mac</button><!--modify this, мелкие буквы-->
							</div>
							<div v-else-if="typeOfBind == null"></div>
							<div v-else>
								<div class="alert alert-warning mt-2" role="alert">выбраная учетная запись не нуждается в привязке</div><!--modify this, мелкие буквы-->
							</div>

					  </div>
					  <div v-else>
							<div class="alert alert-warning mt-2" role="alert">не найдено не одной учетной записи, доступной для привязки</div><!--modify this, мелкие буквы-->
					  </div>
					</div>
					<div v-if="result" class="mt-3 response-block">
						<!--modify this-->
						<div v-if="result.type=='error'">
							<div v-html="result.text.slice(0,120)" class="alert alert-danger" role="alert"></div>
							<!--add this fragment-->
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
							<!--add this fragment-->
						</div>
						<div v-else>
							<div v-if="typeOfBind == 1 && result.code == 200 " class="alert alert-success" role="alert">
							Счет {{ sample }} успешно привязан к порту {{ data.portNumber}} ({{ data.deviceParams.IP_ADDRESS }})
							</div>
							<div v-if="typeOfBind != 1 && result.InfoMessage" class="alert alert-success" role="alert" v-html="result.InfoMessage"></div>
							<div v-if="typeOfBind != 1 && result.Data">
								<div v-if="result.Data.ip" class="small-text">{{ result.Data.ip }}<span class="inscription"> ip</span></div><!--modify this, мелкие буквы-->
								<div v-if="result.Data.gateway" class="small-text">{{ result.Data.gateway }}<span class="inscription"> шлюз</span></div><!--modify this, мелкие буквы-->
								<div v-if="result.Data.mask" class="small-text">{{ result.Data.mask }}<span class="inscription"> маска</span></div><!--modify this, мелкие буквы-->
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
	
	document.getElementById('account-page-template').innerHTML=`<my-account-page v-bind="$props"/>`;/*proxy template for my-account-page*/
	Vue.component('my-account-page',{
		template:`
			<section class="account-page">
				<template  v-if="ready">
					<card-block>
						<title-main :text="account.ACCOUNT" icon="person" />
						<info-subtitle>
							<div class="d-center-y">
								<span v-if="order" style="text-transform: capitalize;">{{order.customer}}</span>
								<span v-else-if="account && localAccount" style="text-transform: capitalize;">{{localAccount.name}}</span>
								<template v-if='flat || account.FLAT_NUMBER'><span style="padding: 0 4px">•</span><i class='ic-20 ic-apartment'></i><span style="padding-left: 4px;">{{ flat || account.FLAT_NUMBER }} кв.</span></template>
							</div>
						</info-subtitle>
						<template v-if='localAccount'>
							<devider-line />
							<info-text-icon :text='computedAddress' type='medium' icon=''/>
							<devider-line />
							<a v-if='phone' class="call-link mb-3" :href="'tel:'+getPhoneWithPlus(localAccount.mobile)">
							<div>
								<div class="tone-900 font--15-500 call-link__number">{{getPhoneWithPlus(localAccount.mobile)}}</div>
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
								<info-value icon='phone' :value="localAccount.convergentmsisdn" type='extra' label='конвергент' />
								<info-value icon='purse' :value='convergentBalance' type='extra' label='баланс' />
							</template>
						</template>
						<devider-line />
						<link-block text="информация в биллинге" icon="server" actionIcon="expand"  @block-click="openBillingInfo" />
						<billing-info-modal ref='billingInfo' :billingInfo='billingInfo' :loading='loading.vgroups' />
						<!--<link-block text="информация в биллинге" icon="server" actionIcon="expand"  @block-click="openBillingInfo_old"/>-->
						<link-block text="отправить смс с новым паролем" icon="sms" actionIcon="expand" @block-click="openSendSmsModal" />
						<send-sms-modal ref='sendSms' :account='account.ACCOUNT' />
					</card-block>
					<card-block v-if='localAccount'>
						<link-block actionIcon='right-link' icon='accidents' text='недоступность' textSize='large' @block-click='toEvents' />
					</card-block>
					<div v-if='agreement'>
						<card-block v-for='(group, key) in groupServiceList' :key='key' class='mini-card mt-0'>
							<title-main class='mb-2' icon='eth' :text='group.name' textSize='large' @open="opened[key] = !opened[key]" />
							<div v-show="opened[key]">
								<card-block v-if='key == "internet"'>
									<title-main text='Порт' textSize='medium'></title-main>
									<traffic-light-el v-if="localAccount" :data="account" :account="localAccount" :sessions="[]"/>
									<link-block v-if='account.PORT_NAME' actionIcon='right-link' icon="port" :text="account.PORT_NAME" :search="account.PORT_NAME"></link-block>
									<!--<link-block v-if='account.PORT_NAME' actionIcon='right-link' icon="port" :text="account.PORT_NAME" :to="'/' + encodeURIComponent(account.PORT_NAME)"></link-block>-->
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
		props:{
			order:Object,
			building:Object,
			entrance:Object,
			account:Object,
			flat:Number,
		},
		data:()=>({
			localAccount:null,
			session:null,
			equipments:null,
			opened:{
				internet:true,
				tv:true,
				iptv:true,
				phone:true,
				hybrid:true,
				other:true,
			},
			billingInfo:[],
			loading:{
				account:false,
				vgroups:false,
				locks:false,
			},
			convergentBalance:null,
			locks:{},
			events:null,
		}),
		watch:{
			account:function(val, old){
				if(val&&val.ACCOUNT){
					this.localAccount=null;
					this.loadLbsvAccount();
				};
			}
		},
		created(){
			if(this.account)this.loadLbsvAccount();
		},
		computed:{
			ready() {
				return this.account&&this.account.ACCOUNT;
			},
			balance(){
				let balance=this.agreement.balance;
				let str=balance.integer+'.'+balance.fraction+' ₽';
				if(balance.minus)return '-'+str;
				return str;
			},
			lastPay(){
				const lastsum=this.agreement.lastsum||'';
				const lastpaydate=this.agreement.lastpaydate||'';
				const rub=lastsum?'₽':'';
				const point=lastpaydate?'•':'';
				return `${lastsum} ${rub} ${point} ${lastpaydate}`;
			},
			agreement(){
				if(!this.localAccount)return null;
				let account=this.account.ACCOUNT;
				return this.localAccount.agreements.find(function(agr){
					return agr.account.replace(/-/g,'')==account.replace(/-/g,'');
				});
			},
			computedAddress(){
				if(!this.localAccount)return '';
				if(this.agreement){
					const service=this.localAccount.vgroups.find((s)=>s.agrmid==this.agreement.agrmid&&s.connaddress);
					if(service)return service.vgaddress||service.connaddress;
				};
				let address={};
				if(Array.isArray(this.localAccount.addresses)){
					address=this.localAccount.addresses.find((a)=>a.address)||{};
				};
				return this.localAccount.address||address.address||'';
			},
			serviceList(){
				if(this.agreement){
					let agreement=this.agreement;
					return this.localAccount.vgroups.filter(function(service){
						return service.agrmid==agreement.agrmid;
					});
				};
				return [];
			},
			serviceError(){
				if(this.localAccount.vgroups.length===1){
					const error=this.localAccount.vgroups[0];
					if(error.type==='error'){
						return 'услуги не загружены. попробуйте перезагрузить страницу.';
					};
					if(error.type==='warning'){
						return 'услуги у абонента не найдены.';
					};
				};
				return '';
			},
			internetEq(){
				if (!this.equipments) return [];
				return this.equipments.filter((e)=>e.type_id==4);
			},
			tvEq(){
				if(!this.equipments) return [];
				let equipments=this.equipments.filter((e)=>[1, 2, 3].includes(parseInt(e.type_id, 10)));
				equipments.forEach((equip)=>{
					if (!equip.card||!this.localAccount.vgroups) return;
					this.localAccount.vgroups.forEach((vg)=>{
						if(!vg.smartcards) return;
						vg.smartcards.forEach((card)=>{
							if(!card.smartcard||!card.smartcard.serial==equip.card) return;
							equip.vg=vg;
						});
					});
				});
				return equipments;
			},
			iptvEq(){
				if(!this.equipments)return [];
				return this.equipments.filter((e)=>e.type_id==7);
			},
			hybridEq(){
				if(!this.equipments)return [];
				return this.equipments.filter((e)=>e.type_id==5);
			},
			phoneEq(){
				if(!this.equipments)return [];
				return this.equipments.filter((e)=>e.type_id==6);
			},
			otherEq(){
				if(!this.equipments)return [];
				return this.equipments.filter((e)=>e.type_id==0);
			},
			groupServiceList(){
				let services={
					internet:{
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
					const service=services[s.type];
					if(service){
						service.services.push(s);
					}else{
						console.warn('Service not found:', s.type);
					};
				});
				const filtered={};
				for(const [name, params] of Object.entries(services)){
					if(params.services.length) filtered[name]=params;
				};
				return filtered;
			},
			phone(){
				const phone=this.localAccount.mobile||this.localAccount.phone;
				return phone;
			},
			hasActiveIncident(){
				if(!this.events)return false;
				return Boolean(this.events.active&&this.events.active.length);
			},
			currentItem(){
				return this.navItems[this.currentIndex];
			},
			currentIndex(){
				const {id}=this.$route.params;
				if(id)return 0;
				return this.navItems.findIndex(({fullName})=>fullName===id);
			},
			title(){
				const {id}=this.$route.params;
				if(!id)return 'кв';
				return `${this.currentItem.name}`;
			},
		},
		methods:{
			getPhoneWithPlus(phone){
				return getPhoneWithPlus(phone);
			},
				
			async loadLbsvAccount(){
				this.loading.account=true;
				if(!this.localAccount||this.localAccount.account_numbers.includes(this.account.ACCOUNT)){
					await httpGet('/call/lbsv/search?text='+this.account.ACCOUNT+'&type=account&city=any').then((data)=>{
						const account=data.type==='list'?data.data.find((data)=>data.agreements[0]&&data.agreements[0].archive === '0'):data.data;
						this.localAccount=account;
					});
				}
				this.loadClientEquipment();
				this.getAuthAndSpeed();
				this.loadLocks();
				if(this.localAccount.isconvergent)this.getForisData();
				this.loading.account=false;
			},
			loadClientEquipment(){
				if(this.equipments)return;
				const params={
					serverid:this.agreement.serverid,
					userid:this.agreement.userid,
					agrmid:this.agreement.agrmid,
				};
				httpGet(buildUrl('client_equipment',params,'/call/lbsv/')).then((data)=>{
					if(data.type=='error') console.warn(data);
					else this.equipments=data;
				});
			},
			async getAuthAndSpeed(){
				const {internet}=this.groupServiceList;
				if(!internet) return;
				this.loading.vgroups=true;
				const promises=[];
				const filteredServices=internet.services.filter((service)=>service.agrmid==this.agreement.agrmid&&service.isSession&&[2, 4, 6].includes(Number(service.agenttype)));

				for(const service of filteredServices){
					const {login,serverid,vgid}=service;
					const params={login,serverid,vgid,date:''};
					promises.push(
						httpGet(buildUrl('get_auth_type',params,'/call/aaa/'),true).then((response)=>{
							if (response.code=='200'&&response.data.length>0&&response.data[0].auth_type){
								service.auth_type = response.data[0].auth_type;
							}
						})
					);
					promises.push(
						httpGet(buildUrl('get_user_rate',params,'/call/aaa/'),true).then((response)=>{
							const is_data=response.code=='200'&&response.data&&response.data.length>0;
							if(is_data&&(response.data[0].rate||response.data[0].rate==0)){
								this.billingInfo.push(response.data);
								/*Object.assign(this.billingInfo[0],{'service':service,'agreement':this.agreement});*/
								service.rate=response.data[0].rate+' Мбит/c';
							}
						})
					);
				}
				await Promise.all(promises);
				this.loading.vgroups=false;
			},
			openBillingInfo(){
				this.$refs.billingInfo.open();
			},
			openBillingInfo_old(){
				/*const {billingInfo,loading}=this;*/
				this.$root.showModal({
					title:`настройки профиля абонента`,
					component:'account-billing-modal',
					data:{
						billingInfo:this.billingInfo,
						loading:this.loading.vgroups,
					},
				});
			},
			openSendSmsModal(){
				if(!this.account)return;
				this.$refs.sendSms.open();
			},
			callTo(){
				const phone=this.getPhoneWithPlus(this.localAccount.mobile);
				window.open(`tel:${phone}`,'_self');
			},
			getForisData(){
				httpGet(`/call/foris/account?text=${this.localAccount.convergentmsisdn}&type=phone`).then(response=>{
					if(response.data&&response.data.length>0){
						let forisAcc=response.data[0];
						this.getConvergentBalance(forisAcc);
					}
				})
			},
			getConvergentBalance(acc){
				const account=acc.personal_account_number;
				const url=buildUrl('balance_by_account',{account},'/call/foris/');
				httpGet(url).then(response=>{
					this.convergentBalance=response.amount
				}).finally(()=>{
					
				})
			},
			toEvents(){
				let account=this.localAccount;
				account.ACCOUNT=this.account.ACCOUNT;
				account.MR_ID=this.account.MR_ID;
				account.DEVICE_NIOSS_ID=this.account.DEVICE_NIOSS_ID;
				account.DEVICE_NAME=this.account.DEVICE_NAME;
				this.$router.push({
					name:'account_events',
					params:{
						id:this.account.ACCOUNT,
						data:account,
					},
				});
				return;
			},
			loadLocks(){
				const today=new Date();
				let before=new Date();
				before.setMonth(before.getMonth()-3);
				const params={
					userid:this.localAccount.userid,
					serverid:this.localAccount.serverid,
					start:Datetools.format(before),
					end:Datetools.format(today),
				};
				httpGet(buildUrl('blocks_history',params,'/call/lbsv/')).then((data)=>{
					this.loading.locks=false;
					this.locks=data;
				});
			},
			async loadAccountEvents(){
				const params={
					to:new Date(),
					from:Dt.addDays(-1),
					contract:this.agreement.agrmnumber,
					id:this.account.DEVICE_NIOSS_ID,
					device:this.account.DEVICE_NAME,
					regionid:this.account.MR_ID,
					serverid:this.localAccount.serverid,
				};
				const response=await httpGet(buildUrl('events_by_contract',params));
				this.events=response;
			}
		},
	});
	
	Vue.component('account-billing-modal',{/*потерян при редизайне*/
		template:`
			<div class="account-billing-modal">
				<p v-if="data.loading">данные еще на загружены</p>
				<template v-else-if="billingInfo">
					<div v-for="billing in billingInfo">
						<div class="container-fluid">
							<div class="form-row">
								<div class="form-group col-5 control">
									<span>login:</span>
								</div>
								<div class="form-group col-7 control">
									<input class="form-control form-control-sm" v-model="serviceForBind.login" disabled>
								</div>
							</div>
							<div class="form-row">
								<div class="form-group col-6 control">
									<span>service id:</span>
								</div>
								<div class="form-group col-6 control">
									<input class="form-control form-control-sm" v-model="serviceForBind.vgid" v-filter="'[0-9]'" disabled>
								</div>
							</div>
						</div>
						<div class="container-fluid">
							<div class="form-row">
								<div class="form-group col-9 control">
									<span>коммутатор</span>
									<input class="form-control form-control-sm" v-model="params.sw" v-filter="'[0-9\.]'" maxlength="14" placeholder="коммутатор">
								</div>
								<div class="form-group col-3 control">
									<span>порт</span>
									<input class="form-control form-control-sm" v-model="params.port" v-filter="'[0-9]'" maxlength="2" placeholder="порт">
								</div>
							</div>
							<div class="form-row">
								<div class="form-group col-12 control">
									<input type="button" class="btn btn-primary btn-sm btn-fill" value="привязать" @click="testBind('port',serviceForBind.type_of_bind)" :disabled="!serviceForBind">
								</div>
							</div>
						</div>
						<div class="container-fluid">
							<div class="form-row">
								<div class="form-group col-6 control">
									<span>MAC-адрес</span>
									<input class="form-control form-control-sm" v-model="params.mac" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23" placeholder="MAC-адрес">
									<input type="button" class="btn btn-primary btn-sm btn-fill" value="привязать" @click="testBind('mac',serviceForBind.type_of_bind)" :disabled="!serviceForBind">
								</div>
								<div class="form-group col-6 control">
									<span>IP-адрес</span>
									<input class="form-control form-control-sm" v-model="params.ip" v-filter="'[0-9\.]'" maxlength="15" placeholder="IP-адрес">
									<input type="button" class="btn btn-primary btn-sm btn-fill" value="привязать" @click="testBind('ip',serviceForBind.type_of_bind)" :disabled="!serviceForBind">
								</div>
							</div>
						</div>
						<div v-if="loading" class="progress mt-2">
							<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
						</div>
						<div v-if="resultBind">
							<div v-if="resultBind.type=='error'" class="rebinderr alert":class="resultBind.alertClass" role="alert">
								<div>{{ resultBind.alertText }}</div>
							</div>
							<div v-else-if="resultBind.InfoMessage" class="rebindok alert":class="resultBind.alertClass" role="alert">
								<div>{{ resultBind.alertText }}</div>
							</div>
						</div>
						<template v-for="item in items" v-if="showItem(item, billing[item])">
							<div class="container-fluid">
								<div class="form-row">
									<div class="form-group col-12 control">
										<div class="d-flex justify-content-between py-2 border-bottom billing-item">
											<span :class="{ 'billing-port': item === 'portNumber' }">{{ getValue(billing[item]) }}</span>
											<span>{{ getTitle(item) }}</span>
										</div>
									</div>
								</div>
							</div>
						</template>
						<template v-for="item in itemsWithFormat" v-if="showItem(item.key, billing[item.key])">
							<div class="container-fluid">
								<div class="form-row">
									<div class="form-group col-12 control">
										<div class="d-flex justify-content-between py-2 border-bottom billing-item" >
											<span :class="{ 'billing-port': item === 'portNumber' }">
												<template v-if='Array.isArray(getValueByItem(item, billing))'>
													<template v-for='arr_item in getValueByItem(item, billing)'>
														<div>{{arr_item}}</div>
													</template>
												</template>
												<template v-else>
													{{ getValueByItem(item, billing)}}
												</template>
											</span>
											<span class='text-right'>{{item.title}}</span>
										</div>
									</div>
								</div>
							</div>
						</template>
					</div>
				</template>
				<p v-else>Данные отсутствуют</p>
			</div>
		`,
		props:['data'],
		data(){
			return {
				items:[
					/*'portNumber',*//*exclude this*/
					/*'deviceIP',*//*exclude this*/
					/*'deviceMac',*//*exclude this*/
					/*'macCPE',*//*exclude this*/
					/*'ip',*//*exclude this*/
					'innerVLan',
					'outerVLan',
				],
				resultBind:{},/*add this*/
				loading:false,/*add this*/
				params:{/*add this*/
					sw:'',
					port:'',
					mac:'',
					ip:''
				},
				itemsWithFormat:{
					maxSessions:{
						title:'макс. кол. сессий',
						key:'maxSessions'
					},
					accOnDateFirst:{
						title:'дата активации',
						key:'accOnDateFirst',
						format:this.formatDate
					},
					blockDate:{
						title:'дата начала блокировки',
						key:'blockDate',
						format:this.formatDate
					},
					deviceSegment:{
						title:'сегмент',
						key:'deviceSegment',
						format:(val)=>val.split(",")
					}
				},
			};
		},
		computed:{
			billingInfo(){
				this.clear();/*add clear*/
				if(this.data.billingInfo[0]){
					this.params.sw=this.data.billingInfo[0].deviceIP;/*add parameter*/
					this.params.port=this.data.billingInfo[0].portNumber;/*add parameter*/
					this.params.mac=(this.data.billingInfo[0].macCPE[0])?(this.data.billingInfo[0].macCPE[0]):'';/*add parameter*/
					this.params.ip=(this.data.billingInfo[0].ip&&this.data.billingInfo[0].ip.length>0)?(this.data.billingInfo[0].ip[0].IP):'';/*add parameter*/
				};
				return this.data.billingInfo;
			},
			serviceForBind(){/*for rebind*/
				if(this.billingInfo[0].service){
					return this.billingInfo[0].service;
				}else{
					return false;
				};
			},
			accountForBind(){/*for rebind*/
				if(this.billingInfo[0].agreement){
					return this.billingInfo[0].agreement.account;
				}else{
					return false;
				};
			},
		},
		methods:{
			formatDate(value){
				const date=new Date(value);
				if(!date)return '';
				return Datetools.format(date,'datetime')
			},
			showItem(key,value){
				if(!value)return false;
				const filters=['deviceId'];
				if(filters.includes(key))return false;
				if(Array.isArray(value))return !!value.length;
				if(typeof value==='object')return !!Object.values(value).length;
				return !!value;
			},
			getTitle(name){
				if(/portNumber/i.test(name))return 'Номер порта';
				if(/deviceIP/i.test(name))return 'IP коммутатора';
				if(/deviceMac/i.test(name))return 'MAC коммутатора';
				if(/ip/i.test(name))return 'IP-адрес';
				if(/macCPE/i.test(name))return 'MAC-адрес';
				if(/innerVLan/i.test(name))return 'vlan_inner';
				if(/outerVLan/i.test(name))return 'vlan_outer';
				return name;
			},
			getValue(value){
				if(Array.isArray(value)&&value.length>0){
					if(value[0].IP)return value.map(i=>i.IP).join(", ");
					return value.join(", ");
				};
				if(typeof value==='object')return String(value);
				return value;
			},
			getValueByItem(item,billing){
				let value=billing[item.key];
				if(!value)return '';
				if(item.format){
					value=item.format(value);
				};
				return this.getValue(value);
			},
			/*add clear*/
			clear:function(){
				this.resultBind={};
			},
			/*add test bind*/
			testBind:function(btn,type){
				if(this.serviceForBind&&this.accountForBind){
					var testBind_params={/*обязательные параметры*/
						vgid:this.serviceForBind.vgid,
						serverid:this.serviceForBind.serverid,
						login:this.serviceForBind.login,/*for logging only*/
						account:this.accountForBind,/*for logging only*/
						type_of_bind:this.serviceForBind.type_of_bind,/*be modifed in select actions*/
					};
					var dop_params={
						ip:this.params.sw, 
						port:this.params.port,
						mac:this.params.mac,
						client_ip:this.params.ip,
					};
					/*params and select actions*/
					switch(btn){/*кнопка*/
						case 'port':
							switch(type){/*тип привязки*/
								case 3:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port'),3);
								break;
								case 5:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port mac'),3);
								break;
								case 7:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port mac'),7);;
								break;
								case 8:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port'),3);
								break;
								case 9:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port mac'),9);
								break;
								case 10:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port mac'),10);
								break;
							}
						break;
						case 'mac':
							switch(type){/*тип привязки*/
								case 2:
									this.test_set_bind/*test_ins_mac*/(testBind_params,'ins_mac',weedOut(dop_params, 'ip port mac'));
								break;
								case 3:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port'),3);
								break;
								case 5:
									this.test_set_bind/*test_ins_only_mac*/(testBind_params,'ins_only_mac',weedOut(dop_params, 'mac'));
								break;
								case 7:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port mac'),7);
								break;
								case 9:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port mac'),9);
								break;
								case 10:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port mac'),10);
								break;
							}
						break;
						case 'ip':
							switch(type){/*тип привязки*/
								case 3:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port'),3);
								break;
								case 6:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port client_ip'),3);
								break;
								case 8:
									this.test_set_bind(testBind_params,'set_bind',weedOut(dop_params, 'ip port'),8);
								break;
							}
						break;
					};
				};
			},
			test_set_bind:function(prm,mode,dop_prm,type){
				Object.assign(prm,dop_prm);
				if(type){prm.type_of_bind=type};
				this.loading = true;
				this.resultBind = {};
				var self = this;
				httpPost('/call/service_mix/'+mode, prm, true).then(function(data) {
					self.resultBind = data;
					if(data.type=='error'){
						data.alertClass='alert-warning';
						data.alertText=data.text;
					}else if(data.InfoMessage){
						data.alertClass='alert-success';
						data.alertText=data.InfoMessage;
					};
					if(data.type=='error'&&data.text){/*логирование*/
						window.AppInventor.setWebViewString('string_4:(error_CardInfo) account:'+prm.account+' login:'+prm.login+' id:'+prm.vgid+' sw:'+prm.ip+' p:'+prm.port+' mac:'+prm.mac+' client_ip:'+prm.client_ip+' serverid:'+prm.serverid+' agentid:'+prm.agentid+' type_of_bind:'+prm.type_of_bind+' text:'+data.text);
					}else{
						window.AppInventor.setWebViewString('string_4:(success_CardInfo) account:'+prm.account+' login:'+prm.login+' id:'+prm.vgid+' sw:'+prm.ip+' p:'+prm.port+' mac:'+prm.mac+' client_ip:'+prm.client_ip+' serverid:'+prm.serverid+' agentid:'+prm.agentid+' type_of_bind:'+prm.type_of_bind+' text:'+data.InfoMessage);
					};
					self.loading = false;
				},function(){ 
					self.loading = false;
					self.resultBind = {alertText:'ошибка при обращении к серверу Inetcore', alertClass:'alert-danger'};
				});
			},
		},
	});
	
	document.getElementById('services-el-template').innerHTML=`<my-services-el v-bind="$props"/>`;/*proxy template for my-services-el*/
	Vue.component('my-services-el',{
		template:`
			<card-block>
				<title-main text="услуги и оборудование"/>
				<!--div class="font--16-500 tone-900">  </!--div-->
				<!--div v-if="false" class="tone-900 size-16 ml-auto"><button class="btn"> Активировать </button></!--div-->
				<div v-for="service in services" :key="service.vgid">
					<link-block actionIcon="" :icon="icon(service)" type="medium">
						<template slot="text">
							<span class="tone-900">{{typeService(service)}}</span> 
							<span :class="stateClass(service)"> • {{ service.statusname }} </span>
						</template>
					</link-block> 
					<div class="ml-4 pl-1">
						<info-subtitle :text="service.tarif||service.tardescr"/>
						<info-subtitle v-if="service.type=='internet'&&service.auth_type||service.rate" :text="authAndSpeed(service)"/>
						<login-pass class='ml-3' v-if="service.type=='internet'||service.type=='phone'" :service="service" :billingid="account.billingid"></login-pass>
						<div class="ml-3">
							<div class="mt-2 w-75">
								<button-main v-if="service.available_for_activation" @click="activate(service)" buttonStyle="outlined" :disabled=false label="Активировать" loadingText="" size="full"></button-main>
							</div>
						</div>
						<account-iptv-code class="ml-3" v-if="service.iptv_code" :account="accountNumber" :login="service.login" />
					</div>
					<devider-line class="mt-3"/>
				</div>
			</card-block>
		`,
		props:{
			account:Object,
			services:Array,
			name:String,
			accountNumber:String,
		},
		data:()=>({
			opened:true,
		}),
		computed:{
			
		},
		methods:{
			typeService(service){
				switch(service.type){
					case 'internet':
						return 'интернет';
					case 'tv':
						return 'телевидение';
					case 'phone':
						return 'телефония';
					case 'hybrid':
						return 'ИТВ';
					case 'iptv':
						return 'IPTV';
					default:
						return 'другое';
				};
			},
			icon(service){
				switch(service.type){
					case 'internet':
						return 'eth';
					case 'tv':
						return 'tv';
					case 'phone':
						return 'phone-1';
					case 'hybrid':
						return 'tv';
					default:
						return 'amount';
				};
			},
			stateClass(service){
				return service.status=='0'||(service.billing_type==4&&service.status=='12')?'main-green':'main-red';
			},
			activate(vg){
				this.$root.showModal({
					title:'активация услуги',
					data:vg,
					component:'activation-modal',
				});
			},
			authAndSpeed(service){
				const auth_type=service.auth_type;
				const rate=service.rate;
				if(auth_type&&rate){
					return `${auth_type} • ${rate}`;
				}else{
					if(!auth_type)return `${rate}`;
					if(!rate)return `${auth_type}`;
				};
			}
		}
	});
	
	document.getElementById('login-pass-template').innerHTML=`<my-login-pass v-bind="$props"/>`;/*proxy template for my-login-pass*/
	Vue.component('my-login-pass',{
		template:`
			<div>
				<template v-if="isSamatlor">
					<div v-if="service.blkdate" class="line-row pl-3">
						{{ service.blkdate }}
						<span class="inscription">дата блокировки</span>
					</div>
					<div>
						<div v-show="!loading" class="font-13"><span class="tone-500">Логин • </span><span>{{service.login}} • </span><span>{{service.vgid}}</span></div>
						<div v-show="loading">
							<i class="ic-20 ic-loading rotating"></i>
						</div>
					</div>
					<div class="w-75 mt-2">
						<button-main @click="reset" :class="{ password:show }" buttonStyle="outlined" :disabled=false :icon="icon" :label="label" :loading="loading||resetting" loadingText="" size="full"></button-main>
					</div>
				</template>
				<template v-else>
					<div v-show="!loading" class="font--13-500"><span class="tone-500">Логин • </span><span>{{service.login}} • </span><span>{{service.vgid}}</span></div>
					<div v-show="loading"><i class="ic-20 ic-loading rotating"></i></div>
					<div class="w-75 mt-2">
						<div v-if="service.serverid=='108'||service.serverid=='103'">
							<button @click="activateSpd(service.vgid)" v-bind:disabled="loading" type="button" class="btn btn-sm">activatespd</button>
						</div>
						<button-main @click="load" :class="{ password:show }" buttonStyle="outlined" :disabled=false :icon="icon" :label="label" :loading="loading" loadingText="" size="full"></button-main>
					</div>
				</template>
			</div>
		`,
		props: {
			service: Object,
			billingid: Number,
		},
		data:()=>({
			loading:false,
			show:false,
			passwd:null,
			resetting:false
		}),
		created:function(){
			if(this.isSamatlor)this.getSamatlorLogin();
		},
		computed:{
			isSamatlor:function(){
				return this.billingid==6014;
			},
			label(){
				if(this.isSamatlor){
					if(this.show)return this.passwd;
					return 'сбросить пароль';
				}else{
					if(this.show)return this.passwd||'Нет пароля';
					return 'запросить пароль';
				}
			},
			icon(){
				return this.show?'':'unlock'
			}
		},
		methods:{
			activateSpd:function(idZakaza){
				window.AppInventor.setWebViewString('sms_tel_:+79139801727');
				window.AppInventor.setWebViewString('sms_text:activatespd '+idZakaza);
				window.AppInventor.setWebViewString('sms_type:direct'/*approve*/);
			},
			load:function(){
				this.passwd=this.service.pass;
				this.loading=true;
				this.show=true;
				this.loading=false;
			},
			getSamatlorLogin:function(){
				this.service.login='';
				this.loading=true;
				let params={
					serverid:this.service.serverid,
					vgid:this.service.vgid
				};
				httpGet(buildUrl('samatlor_equip_login',params,'/call/lbsv/')).then(data=>{
					this.passwd=data.password;
					this.service.login=data.login;
					this.show=false;
					if(data.status=='5'){
						this.service.status=5;
						this.service.status_name='заблокирован(трафик)';
						this.service.statusname='заблокирован(трафик)';
						this.service.blkdate=data.blkdate;
					};
					this.loading=false;
				});
			},
			reset:function(){
				this.resetting=true;
				let params={
					serverid:this.service.serverid,
					vgid:this.service.vgid,
					update:{
						pass:this.passwd
					}
				};
				httpPost('/call/lbsv/extend_service',params,true).then(data=>{
					if(data.type=='error'){
						this.passwd = 'функционал не поддерживается';
					};
					this.show=true;
					this.resetting=false;
				});
			}
		}
	});
	
	document.getElementById('site-du-wrapper-template').innerHTML=`<my-site-du-wrapper v-bind="$props"/>`;/*proxy template for my-site-du-wrapper*/
	Vue.component('my-site-du-wrapper',{
		template:`
			<main>
				<transition name="slide-page" mode="out-in" appear>
					<div v-if="showNav">
						<page-navbar title="Домовой узел" @refresh="refresh"/>
						<card-block>
							<nav-slider :items="navItems" :loading="loading.entrances"/>
							<devider-line/>
							<info-text :title="site.address" :text="site.node"/>
							<div style="text-align:right;padding-right:1em;margin-top:-2em;">
								<input type="button" id="btn_downloadPL" @click="generate(site.id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:0.9;" value="download">
							</div>
							<devider-line/>
							<link-block text="Топология сети" icon="topology" actionIcon="right-link" :to="toTopology"/>
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
				buildBuilding(siteid);
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
	
	function buildBuilding(siteid='9135155036813485134'){
		if(document.getElementById('delete_me_after_download')){document.getElementById('delete_me_after_download').remove()};/*удалить если есть*/
		let headers={'Content-Type':'application/json;charset=utf-8','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').getAttribute('content'),};
		document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeEnd',`
			<div style="display:none;" id="delete_me_after_download">
				<div class="tile tile-search">
					<input type="text" style="height:14pt;width:100%;font-size:14pt;" id="input_search" value="`+siteid+`">
					<div style="display:inline-flex;width:100%;">
						<input id="btn_clsOne" type="button" value="clear">
						<input id="btn_clsAll" type="button" value="clear all">
						<input id="btn_search" type="button" value="search">
						<div class="loader-line hide" id="loader"></div>
					</div>
				</div>
			</div>`);
		let sites={};
		function resetSiteObj(nodes={}){return {nodes:nodes,entrances:{},racks:{},devices:{},ppanels:{},loads:{}}};
		function loader(siteid='unknown',state=true,object='unknown'){
			let bar=document.getElementById('loader');
			if(state){
				bar.innerHTML=siteid+'.'+object;bar.classList.remove('hide');sites[siteid].loads[object]=false;
			}else{
				bar.innerHTML='';bar.classList.add('hide');sites[siteid].loads[object]=true;
				/*console.log('sites.'+siteid+'.loads.'+object,sites[siteid].loads[object]);*/
			};
		};
		function val(v=''){return v?v:''};
		document.getElementById('input_search').addEventListener('keydown',function(e){if(e.keyCode===13){document.getElementById('btn_search').click()}});
		document.getElementById('btn_search').addEventListener('click',function(){
			document.getElementById('input_search').value.split(' ').map(function(patterns){patterns.split(',').map(function(pattern){/*todo сделать регулярку разделителей*/
				fetch('/call/device/search',{'method':'POST','headers':headers,'body':JSON.stringify({'pattern':pattern}),}).then(resp=>resp.json()).then(function(data){
					if(data.data){
						switch(data.data.key){
							case'building':/*по имени узла*/
								switch(data.data.type){
									case'building':/*ду0000000054КР-00340*/
									case'building_mu':/*му0000000054КР-00340*/
										createBuildingTile([data.data.data]);
									break;
									case'warning':/*ду00054КР-00340*/
									default:
										createErrorTile(data.data);
								};
							break;
							case'building_id':/*по id площадки*/
								switch(data.data.type){
									case'building_list':/*9135155037513569210*/
										createBuildingTile(data.data.data);
									break;
									case'building':/*9135155037413562085*/
									case'building_mu':/*8101638987013413752*/
										createBuildingTile([data.data.data]);
									break;
									case'warning':/*9135155037813569214*/
									default:
										createErrorTile(data.data);
								};
							break;
							default:
								createErrorTile(data.data);
						};
					}else{
						createErrorTile({pattern:pattern});
					};
				}).catch(function(err){console.log(err)}).finally(function(){});
			})});
		});
		document.getElementById('btn_clsOne').addEventListener('click',clsOne);function clsOne(){document.getElementsByClassName('tile-result')[0].remove()};
		document.getElementById('btn_clsAll').addEventListener('click',function(){sites={};while(document.getElementsByClassName('tile-result').length>0){clsOne()}});
		
		document.getElementById('btn_search').click();/*автозапуск*/
		
		function createErrorTile(s_data){/*ошибку поиска*/
			document.getElementsByClassName('tile-search')[0].insertAdjacentHTML('afterEnd',`
				<div class="tile tile-result `+((s_data.data)?('tile-unknown'):('tile-warning'))+`">
					<div class="el-head">
						<div>pattern:<span>`+s_data.pattern+`</span></div>
						<div>key:<span>`+s_data.key+`</span></div>
						<div>type:<span>`+s_data.type+`</span></div>
						<div>text:<span>`+s_data.text+`</span></div>
						<div>data:<span>`+s_data.data+`</span></div>
					</div>
				</div>`);
		};
		function createTestTile(s_data){/*list*/
			let dataStr='';
			for(let param in s_data.data){dataStr+=`<div>&nbsp;&nbsp;&nbsp;`+param+`:<span>`+s_data.data[param]+`</span></div>`};
			document.getElementsByClassName('tile-search')[0].insertAdjacentHTML('afterEnd',`
				<div class="tile tile-result tile-unknown">
					<div class="el-head">
						<div>pattern:<span>`+s_data.pattern+`</span></div>
						<div>key:<span>`+s_data.key+`</span></div>
						<div>type:<span>`+s_data.type+`</span></div>
						<div>data:</div>`
						+dataStr+`
					</div>
				</div>`);
		};
		function createBuildingTile(nodes){/*building*/
			sites[nodes[0].id]=resetSiteObj(nodes);
			if(document.getElementById(nodes[0].id)){document.getElementById(nodes[0].id).remove()};/*удалить дубль если есть*/
			document.getElementsByClassName('tile-search')[0].insertAdjacentHTML('afterEnd',`
				<div class="tile tile-result tile-building" id="`+nodes[0].id+`">
					<div>
						<input id="btn_updEntrances_`+nodes[0].id+`" type="button" value="upd">
						<input id="btn_download_`+nodes[0].id+`" type="button" value="download" disabled>
						<span title="`+nodes[0].name+` Sites_and_Devices" style="margin-left:10px;"><a href="https://nioss/common/uobject.jsp?tab=_Sites+and+Devices&object=`+nodes[0].id+`" target="_blank">`+nodes[0].name+` (`+nodes[0].address+`)</a></span>
					</div>
					<div class="content-x-scroll"><div class="entrances-grid" id="`+nodes[0].id+`.entrances"></div></div>
					<div>
						<input id="btn_updDevices_`+nodes[0].id+`" type="button" value="upd">
						<input id="btn_pingAll_`+nodes[0].id+`" type="button" value="ping">
						`+createNodeTitle(nodes)+`
					</div>
					<div class="content-x-scroll"><div class="devices-without" id="`+nodes[0].id+`.devices_without"></div></div>
					<div>
						<span title="NIOSS ММРД" style="margin-left:10px;"><a href="https://nioss/solutions/customers/mts/excel/ei_tools.jsp" target="_blank">NIOSS ММРД</a></span>
					</div>
					<div class="content-x-scroll"><div class="mmrd-field">
						<div>Подъезды:</div>
						<table>
							<thead>
								<tr>
									<th></th>
									<th style="min-width:115px;">Object_id</th>
									<th style="min-width:110px;">Имя</th>
									<th style="min-width:100px;">Родитель</th>
									<th>Номер подъезда</th>
									<th>Количество этажей</th>
									<th>Диапазон квартир в подъезде</th>
									<th>Количество стояков</th>
									<th>Каблирован от сетевого элемента ШПД</th>
									<th>Каблирован от сетевого элемента КТВ</th>
									<th>Наименование блок фактора ШПД</th>
									<th>Наименование блок фактора КТВ</th>
									<th>Наименование блок фактора ТФ/VoIP</th>
									<th>Примечание</th>
									<th>Описание</th>
								</tr>
							</thead>
							<tbody id="`+nodes[0].id+`.entrances_table"></tbody>
						</table>
					</div></div>
					<div class="content-x-scroll"><div class="mmrd-field">
						<div>Шкафы:</div>
						<table>
							<thead>
								<tr>
									<th></th>
									<th style="min-width:115px;">Object_id</th>
									<th style="min-width:110px;">Имя</th>
									<th style="min-width:100px;">Родитель</th>
									<th>Тип Шкафа</th>
									<th>Этаж</th>
									<th>Расположение</th>
									<th>Вне этажное размещение</th>
									<th>Номер ДРС</th>
									<th>Тип замка</th>
									<th>Номер ключа</th>
									<th>Примечание</th>
									<th>Описание объекта</th>
								</tr>
							</thead>
							<tbody id="`+nodes[0].id+`.racks_table"></tbody>
						</table>
					</div></div>
					<div class="content-x-scroll"><div class="mmrd-field">
						<div>Устройства:</div>
						<table>
							<thead>
								<tr>
									<th></th>
									<th style="min-width:115px;">Object_id</th>
									<th style="min-width:110px;">Имя</th>
									<th style="min-width:100px;">Родитель</th>
									<th>Тип</th>
									<th>Шкаф</th>
									<th>Псевдоним</th>
									<th>IP Адрес (текст)</th>
									<th>SNMP Community</th>
									<th>Version SNMP</th>
									<th>VENDOR</th>
									<th>MODEL</th>
									<th>Обслуживаемые подъезды</th>
									<th>Примечание</th>
									<th>Описание объекта</th>
								</tr>
							</thead>
							<tbody id="`+nodes[0].id+`.devices_table"></tbody>
						</table>
					</div></div>
					<div class="content-x-scroll"><div class="mmrd-field">
						<div>Патч-панели:</div>
						<table>
							<thead>
								<tr>
									<th></th>
									<th style="min-width:115px;">Object_id</th>
									<th style="min-width:110px;">Имя</th>
									<th style="min-width:100px;">Родитель</th>
									<th>Модель устройства</th>
									<th>Тип ДРС</th>
									<th>Шкаф</th>
									<th>Номер Этажа</th>
									<th>Расположение</th>
									<th>Номер ДРС</th>
									<th>Тип МПК</th>
									<th>Длинна МПК</th>
									<th>Охрана</th>
									<th>Количество задействованных пар UTP/FTP=1 Port Ethernet</th>
									<th>Вышестоящий элемент ДРС</th>
									<th>Описание объекта</th>
								</tr>
							</thead>
							<tbody id="`+nodes[0].id+`.ppanels_table"></tbody>
						</table>
					</div></div>
				</div>`);
			document.getElementById('btn_updEntrances_'+nodes[0].id).addEventListener('click',function(){getEntrances(nodes[0].id)});
			document.getElementById('btn_download_'+nodes[0].id).addEventListener('click',function(){downloadPL(preparePL(nodes[0].id))});
			getEntrances(nodes[0].id);
			/*document.getElementById('btn_updDevices_'+nodes[0].id).addEventListener('click',function(){getDevices(nodes[0].id)});*//*пропадают устройства 9135155037513569210*/
			/*document.getElementById('btn_pingAll_'+nodes[0].id).addEventListener('click',function(){getPings(nodes[0].id)});*//*нет getPings*/
		};
		function createNodeTitle(nodes){/*ссылки на узлы ду/му в доме*/
			let title='';
			for(let node of nodes){
				title+=`<span title="`+node.node+` Параметры" style="margin-left:10px;"><a href="https://nioss/common/uobject.jsp?tab=_Parameters&object=`+node.uzel_id+`" target="_blank">`+node.node+`</a></span>`;
			};
			return title;
		};
		function getEntrances(siteid){/*сетка падиков*/
			document.getElementById(siteid+'.entrances').innerHTML=``;/*очистка для upd*/
			loader(siteid,true,'site_entrance_list_'+siteid);
			fetch('/call/device/site_flat_list',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(entrances){
				if(entrances.type=='floors'&&entrances.data.length>0){/*наличие падиков*/
					for(let entrance of entrances.data.filter(function(item){return !item.nioss_error})){/*перебор падиков*/
						loader(siteid,true,'entrance_'+entrance.ENTRANCE_NAME);
						sites[siteid].entrances[entrance.ENTRANCE_ID]=entrance;
						sites[siteid].entrances[entrance.ENTRANCE_ID].SITE_ID=siteid;/*костыль для таблицы*/
						document.getElementById(siteid+'.entrances').insertAdjacentHTML('beforeEnd',createEntrance(entrance));
						for(let floor of entrance.floor){/*перебор этажей*/
							document.getElementById(entrance.ENTRANCE_ID+((+floor.number>0)?'.over':'.under')).insertAdjacentHTML('beforeEnd',createFloor(entrance.ENTRANCE_ID,floor.number,'',floor.first,floor.last,floor.flats));
							for(let flat of floor.flats){/*перебор хат*/
								let flatHtml=document.getElementById(entrance.ENTRANCE_ID+'.flat_'+flat.number);
								flatHtml.classList.add('on-service');
								for(let service of flat.services){/*перебор услуг в квартире*/
									switch(service.service_id){
										case'1':
											flatHtml.classList.add('inet');
											document.getElementById(entrance.ENTRANCE_ID+'.flat_'+flat.number+'.spd').classList.add(service.status);
										break;
										case'2':
										case'4':
										case'16':
											flatHtml.classList.add('tv');
											document.getElementById(entrance.ENTRANCE_ID+'.flat_'+flat.number+'.tv').classList.add(service.status);
										break;
										case'8':
											flatHtml.classList.add('voip');
											document.getElementById(entrance.ENTRANCE_ID+'.flat_'+flat.number+'.spd').classList.add(service.status);
										break;
									};
								};
								for(let account of flat.subscribers){
									flatHtml.classList.add('account_'+account.account.match(/\d/g).join(''));
									document.getElementById(entrance.ENTRANCE_ID+'.flat_'+flat.number+'.number').innerHTML=`<a href="http://inetcore.mts.ru/#/`+account.account+`" target="_blank">`+flat.number+`</a>`;
								};
							};
						};
						if(entrance.floor.length<=entrance.FLOOR_COUNT){/*фейковые этажи для выравнивание падиков по низу*/
							for(var f_number=0;f_number<entrance.floor[0].number;f_number++){
								document.getElementById(entrance.ENTRANCE_ID+((f_number>0)?'.over':'.under')).insertAdjacentHTML('beforeEnd',createFloor(entrance.ENTRANCE_ID,f_number));
							};
						};
						loader(siteid,false,'entrance_'+entrance.ENTRANCE_NAME);
						loader(siteid,true,'get_nioss_object_'+entrance.ENTRANCE_ID);
						fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:entrance.ENTRANCE_ID,object:'entrance'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
							Object.assign(sites[siteid].entrances[entrance.ENTRANCE_ID],nioss_data.data);
							entranceToRow(siteid,entrance.ENTRANCE_ID);
							document.getElementById(toKP(entrance.ENTRANCE_ID)+'_title').addEventListener('click',function(event){/*openModal(getType(entrance.ENTRANCE_NAME),site.entrances[entrance.ENTRANCE_ID],'update');event.stopPropagation();*/});
						}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+entrance.ENTRANCE_ID)});
					};
					
					loader(siteid,true,'site_rack_list_'+siteid);
					fetch('/call/device/site_rack_list',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(racks_data){let racks=racks_data.data;
						for(let rack of racks.filter(function(item){return !item.nioss_error})){
							loader(siteid,true,'rack_'+rack.RACK_NAME);
							sites[siteid].racks[rack.RACK_ID]=rack;
							let container=rack.ENTRANCE_ID+'.'+((rack.OFF_FLOR=='Подвал')?'podval':(rack.OFF_FLOR=='Чердак')?'cherdak':(rack.OFF_FLOR=='Технический этаж')?'tehetag':('floor_'+rack.FLOOR))+((isCU(rack.RACK_NAME))?'.rk':(isL(rack.RACK_NAME))?'.racks':'.racks');
							if(!document.getElementById(container)){/*если шкаф на этаже вне подъезда*//*ду0000000054КР-02878*/
								document.getElementById(rack.ENTRANCE_ID+((rack.OFF_FLOR=='Подвал'||rack.FLOOR<=0)?'.under':'.over')).insertAdjacentHTML('beforeEnd',createFloor(rack.ENTRANCE_ID,rack.FLOOR,((rack.OFF_FLOR=='Подвал')?'podval':(rack.OFF_FLOR=='Чердак')?'cherdak':(rack.OFF_FLOR=='Технический этаж')?'tehetag':'')));
							};
							document.getElementById(container).insertAdjacentHTML('beforeEnd',createRack(rack));
							loader(siteid,false,'rack_'+rack.RACK_NAME);
							loader(siteid,true,'get_nioss_object_'+rack.RACK_ID);
							fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:rack.RACK_ID,object:'rack'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
								Object.assign(sites[siteid].racks[rack.RACK_ID],nioss_data.data);
								rackToRow(siteid,rack.RACK_ID);
								document.getElementById(toKP(rack.RACK_ID)+'_title').addEventListener('click',function(event){/*openModal(getType(rack.RACK_NAME),site.racks[rack.RACK_ID],'update');event.stopPropagation();*/});
							}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+rack.RACK_ID)});
						};
						
						getDevices(siteid);
						
						loader(siteid,true,'patch_panels_'+siteid);
						fetch('/call/device/patch_panels',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(plints_data){let plints=plints_data.data;
							let ppanels=plints;for(let pp of ppanels){ppanels=ppanels.concat(pp.children);};/*поднятие из топологии*/
							for(let pp of ppanels.filter(function(item){return !item.nioss_error})){
								loader(siteid,true,'ppanel_'+pp.name);
								sites[siteid].ppanels[pp.id]=pp;
								if(pp.rack_id=='0'){/*вне шкафа*//*type-PP without*/
									let container=pp.entrance_id+'.floor_'+pp.n_floor+'.rk';
									if(!document.getElementById(container)){/*если на этаже вне подъезда*/
										document.getElementById(pp.entrance_id+((pp.n_floor<=0)?'.under':'.over')).insertAdjacentHTML('beforeEnd',createFloor(pp.entrance_id,pp.n_floor));
									};
									document.getElementById(container).insertAdjacentHTML('beforeEnd',createPP(pp));
								}else{
									let container=document.getElementById(pp.rack_id+'.devices_pp');
									if(container){/*если есть такой шкаф*/
										container.insertAdjacentHTML('beforeEnd',createPP(pp));
										document.getElementById(toKP(pp.name)+'_title').addEventListener('click',function(event){/*openModal(getType(pp.name),site.ppanels[pp.id],'update');event.stopPropagation();*/});
									}else{
										/*засунуть в фейковый шкаф, видимый из подъезда*/
									};
								};
								loader(siteid,false,'ppanel_'+pp.name);
								loader(siteid,true,'get_nioss_object_'+pp.id);
								fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:pp.id,object:'device'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
									Object.assign(sites[siteid].ppanels[pp.id],nioss_data.data);
									ppanelToRow(siteid,pp.id);
									document.getElementById(toKP(pp.name)+'_title').addEventListener('click',function(event){/*openModal(getType(pp.name),site.ppanels[pp.id],'update');event.stopPropagation();*/});
								}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+pp.id)});
							};
						}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'patch_panels_'+siteid)});
					}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'site_rack_list_'+siteid);});
				}else if(entrances.type=='flats'&&entrances.data.length>0){/*9135155036813479184*/
					console.log('entrances.type==flats');
					loader(siteid,true,'flats_'+siteid);
					document.getElementById(siteid+'.entrances').insertAdjacentHTML('beforeEnd',`<div>нет подъездов!</div><div class="floor-flats floor-fake" id="`+siteid+`.flats"></div>`);
					for(let flat of entrances.data){/*перебор хат*/
						document.getElementById(siteid+'.flats').insertAdjacentHTML('beforeEnd',createEmptyFlats(siteid,flat.number,flat.number));
						let flatHtml=document.getElementById(siteid+'.flat_'+flat.number);
						flatHtml.classList.add('on-service');
						for(let service of flat.services){/*перебор услуг в квартире*/
							switch(service.service_id){
								case'1':
									flatHtml.classList.add('inet');
									document.getElementById(siteid+'.flat_'+flat.number+'.spd').classList.add(service.status);
								break;
								case'2':
								case'4':
								case'16':
									flatHtml.classList.add('tv');
									document.getElementById(siteid+'.flat_'+flat.number+'.tv').classList.add(service.status);
								break;
								case'8':
									flatHtml.classList.add('voip');
									document.getElementById(siteid+'.flat_'+flat.number+'.spd').classList.add(service.status);
								break;
							};
						};
						for(let account of flat.subscribers){
							flatHtml.classList.add('account_'+account.account.match(/\d/g).join(''));
							document.getElementById(siteid+'.flat_'+flat.number+'.number').innerHTML=`<a href="http://inetcore.mts.ru/#/`+account.account+`" target="_blank">`+flat.number+`</a>`;
						};
					};
					loader(siteid,false,'flats_'+siteid);
					getDevices(siteid);
				}else{
					console.log(entrances.type);
					getDevices(siteid);
				};
			}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'site_entrance_list_'+siteid)});
			
			testLoadPL(siteid);
		};
		function getDevices(siteid){/*перенести device_info, или fetchAll*/
			document.getElementById(siteid+'.devices_without').innerHTML=``;/*очистка для upd*/
			loader(siteid,true,'devices_'+siteid);
			fetch('/call/device/devices',{'method':'POST','headers':headers,'body':JSON.stringify({'siteid':siteid}),}).then(function(resp){return resp.json()}).then(function(devices_data){let devices=devices_data.data;
				devices.map(function(device){
					loader(siteid,true,'device_'+device.DEVICE_NAME);
					sites[siteid].devices[device.DEVICE_NIOSS_ID]=device;
					let inrack=document.getElementById(toKP(device.DEVICE_NAME));
					if(inrack){/*если есть в шкафу*/
						document.getElementById(inrack.getAttribute('inrack')+'.devices_ne').insertAdjacentHTML('beforeEnd',createDevice(device));
					}else{
						document.getElementById(siteid+'.devices_without').insertAdjacentHTML('beforeEnd',createDevice(device));
					};
					document.getElementById(toKP(device.DEVICE_NAME)+'.led').addEventListener('click',function(){getPing(device)});
					if(device.IP_ADDRESS){getPing(device);};
					loader(siteid,false,'device_'+device.DEVICE_NAME);
					loader(siteid,true,'device_info_'+device.DEVICE_NAME);
					fetch('/call/device/device_info',{'method':'POST','headers':headers,'body':JSON.stringify({'device':device.DEVICE_NAME}),}).then(function(resp){return resp.json()}).then(function(device_info){
						Object.assign(sites[siteid].devices[device.DEVICE_NIOSS_ID],device_info.data[0]);
						/*
						switch(getType(device.DEVICE_NAME)){
							case'ETH':case'MPLS':
								loader(true);error('device_port_list ...');
								fetch('/call/device/device_port_list',{'method':'POST','headers':headers,'body':JSON.stringify({'device':device.DEVICE_NAME}),}).then(function(resp){return resp.json()}).then(function(ports_data){
									sites[siteid].devices[device.DEVICE_NIOSS_ID].portsArr=ports_data.data;
								}).catch(function(err){
									console.log(err);
									loader(false);error('error: device_port_list');
								}).finally(function(){loader(false);});
							break;
							case'OP':case'FAMP':
								loader(true);error('ctv_config_prm_list ...');
								fetch('/call/device/ctv_config_prm_list',{'method':'POST','headers':headers,'body':JSON.stringify({'name':device.DEVICE_NAME}),}).then(function(resp){return resp.json()}).then(function(ktv_prm_data){
									sites[siteid].devices[device.DEVICE_NIOSS_ID].ktvParams=ktv_prm_data.data;
								}).catch(function(err){
									console.log(err);
									loader(false);error('error: ctv_config_prm_list');
								}).finally(function(){loader(false);});
								if(device.IP_ADDRESS){
									loader(true);error('ktv_fsurvey ...');
									fetch('/call/hdm/ktv_fsurvey',{'method':'POST','headers':headers,'body':JSON.stringify(device),}).then(function(resp){return resp.json()}).then(function(ktv_data){
										sites[siteid].devices[device.DEVICE_NIOSS_ID].ktvStatus=ktv_data.data.data;
									}).catch(function(err){
										console.log(err);
										loader(false);error('error: ktv_fsurvey');
									}).finally(function(){loader(false);});
								};
							break;
							default:
						};
						*/
						loader(siteid,true,'get_nioss_object_'+device.DEVICE_NIOSS_ID);
						fetch('/call/nioss/get_nioss_object',{'method':'POST','headers':headers,'body':JSON.stringify({object_id:device.DEVICE_NIOSS_ID,object:'device'}),}).then(function(resp){return resp.json()}).then(function(nioss_data){
							Object.assign(sites[siteid].devices[device.DEVICE_NIOSS_ID],nioss_data.data);
							deviceToRow(siteid,device.DEVICE_NIOSS_ID);
							document.getElementById(toKP(device.DEVICE_NAME)+'_title').addEventListener('click',function(event){/*openModal(getType(device.DEVICE_NAME),site.devices[device.DEVICE_NIOSS_ID],'update');event.stopPropagation();*/});
						}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'get_nioss_object_'+device.DEVICE_NIOSS_ID)});
					}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'device_info_'+device.DEVICE_NAME)});
				});
			}).catch(function(err){console.log(err)}).finally(function(){loader(siteid,false,'devices_'+siteid)});
		};
		function createEntrance(entranceObj){/*падик*/
			return `
				<div class="floors-over" id="`+entranceObj.ENTRANCE_ID+`.over" style="grid-column:`+(+entranceObj.ENTRANCE_NO+1)+`/`+(+entranceObj.ENTRANCE_NO+2)+`;grid-row:2/3;">
					<div class="entrance-head" style="order:9999;">
						<div class="entrance-title" id="`+entranceObj.ENTRANCE_ID+`_title" title="`+entranceObj.ENTRANCE_NAME+` Sites_and_Devices">
							<a href="https://nioss/common/uobject.jsp?tab=_Sites+and+Devices&object=`+entranceObj.ENTRANCE_ID+`" target="_blank">`+createEntranceTitle(entranceObj)+`</a>
							<input style="width:15px;margin-left:5px;" type="text" value="`+entranceObj.ENTRANCE_NO+`" disabled>
						</div>
						<div>
							<input style="width:15px;" type="text" value="`+entranceObj.FLOOR_COUNT+`" disabled>
							<input style="width:30px;margin-left:10px;" type="text" value="`+entranceObj.FLAT_FROM+`" disabled>
							<input style="width:30px;margin-left:5px;" type="text" value="`+entranceObj.FLAT_TO+`" disabled>
						</div>
					</div>
					`+createFloor(entranceObj.ENTRANCE_ID,'','cherdak')+`
					`+createFloor(entranceObj.ENTRANCE_ID,'','tehetag')+`
				</div>
				<div class="floors-under" id="`+entranceObj.ENTRANCE_ID+`.under" style="grid-column:`+(+entranceObj.ENTRANCE_NO+1)+`/`+(+entranceObj.ENTRANCE_NO+2)+`;grid-row:3/4;">
					`+createFloor(entranceObj.ENTRANCE_ID,'','podval')+`
				</div>`;
		};
		
		function createFloor(entrance_id,number='0',type='',flat_first=0,flat_last=0,flats=[]){/*этаж падика*/
			let floor={
				'cherdak':{name:'cherdak',order:'1001',title:'Ч',flats:createNoFlats('чердак'),variant:''},
				'tehetag':{name:'tehetag',order:'1000',title:'Т',flats:createNoFlats('тех. этаж'),variant:''},
				'podval':{name:'podval',order:'1000',title:'П',flats:createNoFlats('подвал'),variant:''},
				'':{
					name:'floor_'+number,
					order:((Math.abs(+number)+10)*10),
					title:number,
					flats:((flat_first&&flat_last||flats.length>0)?createEmptyFlats(entrance_id,flat_first,flat_last):createNoFlats()),
					variant:(+number%2==0)?'floor-even':'floor-neven',
				},
			}[type];
			return `
				<div class="floor `+floor.name+`" id="`+entrance_id+`.`+floor.name+`" style="order:`+floor.order+`;">
					<div class="floor-number">`+floor.title+`</div>
					<div class="floor-objects" id="`+entrance_id+`.`+floor.name+`.objects">
						<div class="floor-racks" id="`+entrance_id+`.`+floor.name+`.racks"></div>
						<div class="floor-racks floor-rk" id="`+entrance_id+`.`+floor.name+`.rk"></div>
						<div class="floor-flats `+floor.variant+`" id="`+entrance_id+`.`+floor.name+`.flats">
							`+floor.flats+`
						</div>
					</div>
				</div>`;
		};
		function createNoFlats(name=''){return `<div class="flat-none">`+name+`</div>`};
		function createEmptyFlats(entrance_id,f_first,f_last){/*заготовки квартир на этаж*/
			let newFlatsRow='';
			for(let flat=f_first;flat<f_last+1;flat++){
				newFlatsRow+=`<div class="flat" id="`+entrance_id+`.flat_`+flat+`" style="order:`+flat+`;">
					<div id="`+entrance_id+`.flat_`+flat+`.number">`+flat+`</div>
					<div class="flat-service" id="`+entrance_id+`.flat_`+flat+`.spd">шпд</div>
					<div class="flat-service" id="`+entrance_id+`.flat_`+flat+`.tv">тв</div>
				</div>`
			};		
			return newFlatsRow;
		};
		function createRack(rackObj){/*шкаф*/
			/*let kpname=toKP(rackObj.RACK_NAME);*/
			let devices={ne:``,	pp:``};
			for(let device of rackObj.NE_IN_RACK){
				if(isPP(device)||isCR(device)){
					devices.pp+=createPP({name:device,inrack:rackObj.RACK_NAME,ghost:'ghost'});
				}else{
					devices.ne+=createDevice({DEVICE_NAME:device,IP_ADDRESS:'',inrack:rackObj.RACK_NAME,ghost:'ghost'});
				};
			};
			let title=`<span class="title-norm">`+createRackTitle(rackObj)+`</span><span class="title-short">`+createRackTitle(rackObj)+`</span>`;
			return `
				<div class="rack `+((rackObj.RACK_NAME)?(`type-`+getType(rackObj.RACK_NAME)):`type-unknown`)+`" id="`+rackObj.RACK_ID+`" style="order:`+((rackObj.N_RACK_SITE)?rackObj.N_RACK_SITE:getNum(rackObj.RACK_NAME))+`;">
					<div class="rack-head">
						<div class="rack-title" id="`+rackObj.RACK_ID+`_title">
							<a href="https://nioss/ncobject.jsp?id=`+rackObj.RACK_ID+`" target="_blank">`+title+`</a>
						</div>
					</div>
					<div class="rack-devices" id="`+rackObj.RACK_NAME+`.devices_ne">`+devices.ne+`</div>
					<div class="rack-devices" id="`+rackObj.RACK_ID+`.devices_pp">`+devices.pp+`</div>
				</div>`;
		};
		function createPP(ppObj){/*патчпанель*/
			let kpname=toKP(ppObj.name);
			if(document.getElementById(kpname)){document.getElementById(kpname).remove();};/*удаление ранее созданного от шкафа*/
			let title=`<span class="title-norm">`+createPPTitle(ppObj)+`</span><span class="title-short">`+createPPTitle(ppObj)+`</span>`;
			let inrack=(ppObj.inrack)?(`inrack="`+ppObj.inrack+`"`):'';
			return `
				<div class="device type-`+getType(kpname)+((ppObj.rack_id=='0')?` without`:``)+((ppObj.ghost)?` ghost`:``)+`" id="`+kpname+`" `+inrack+`>
					<div class="device-head">
						<div class="device-title" id="`+kpname+`_title">
							<a href="https://nioss/ncobject.jsp?id=`+ppObj.id+`" target="_blank">`+title+`</a>
						</div>
					</div>
				</div>`;
		};
		function createDevice(deviceObj){/*устройство*/
			let kpname=toKP(deviceObj.DEVICE_NAME);
			if(document.getElementById(kpname)){document.getElementById(kpname).remove();};/*удаление ранее созданного от шкафа*/
			let title=`<span class="title-norm">`+createDeviceTitleIP(deviceObj)+`</span><span class="title-short">`+createDeviceTitle(deviceObj)+`</span>`;
			let inrack=(deviceObj.inrack)?(`inrack="`+deviceObj.inrack+`"`):'';
			return `
				<div class="device type-`+getType(kpname)+((deviceObj.ghost)?` ghost`:``)+`" id="`+kpname+`" `+inrack+`>
					<div class="device-head">
						<div class="device-title" id="`+kpname+`_title">
							<a href="https://nioss/ncobject.jsp?id=`+deviceObj.DEVICE_NIOSS_ID+`" target="_blank">`+title+`</a>
						</div>
						<div class="device-led" id="`+kpname+`.led"></div>
					</div>
				</div>`;
		};
		function getPing(device){
			let led=document.getElementById(toKP(device.DEVICE_NAME)+'.led');
			led.classList.remove('online','offline','nomon');
			fetch('/call/hdm/device_ping',{'method':'POST','headers':headers,'body':JSON.stringify({'device':device}),}).then(function(resp){return resp.json()}).then(function(ping){
				switch(ping.data.code){
					case'200':led.classList.add('online');break;
					case'400':led.classList.add('offline');break;
					default:led.classList.add('nomon');
				};
			}).catch(function(err){console.log(err)}).finally(function(){});
		};
		
		function entranceToRow(siteId,objId){
			let obj=sites[siteId].entrances[objId];
			let cabled={
				spd:val(obj.DEVICE_LIST.filter(d=>isETH(d)).join('|')),
				ktv:val(obj.DEVICE_LIST.filter(d=>isOP(d)||isA(d)).join('|')),
			};
			document.getElementById(siteId+'.entrances_table').insertAdjacentHTML('afterBegin',`
				<tr id="`+objId+`.row">
					<td></td>
					<td attr="Object_id">`+obj.ENTRANCE_ID+`</td>
					<td attr="Имя">`+obj.resource_business_name+`</td>
					<td attr="Родитель">`+sites[siteId].nodes[0].name+`</td>
					
					<td class="edtbl" attr="Номер подъезда">`+obj.NomerPodezda+`</td>
					<td class="edtbl" attr="Количество этажей">`+obj.KolichestvoEtashei+`</td>
					<td class="edtbl" attr="Диапазон квартир в подъезде">`+obj.DiapazonKvartirvPodezde+`</td>
					<td class="edtbl" attr="Количество стояков">`+val(obj.KolischestvoStoyakov)+`</td>
					<td attr="Каблирован от сетевого элемента ШПД">`+cabled.spd+`</td>
					<td attr="Каблирован от сетевого элемента КТВ">`+cabled.ktv+`</td>
					<td class="edtbl" attr="Наименование блок фактора ШПД"></td>
					<td class="edtbl" attr="Наименование блок фактора КТВ"></td>
					<td class="edtbl" attr="Наименование блок фактора ТФ/VoIP"></td>
					
					<td attr="Примечание" class="edtbl">`+val(obj.Primechanie)+`</td>
					<td attr="Описание">`+val(obj.description)+`</td>
				</tr>`);
		};
		function rackToRow(siteId,objId){
			let obj=sites[siteId].racks[objId];
			document.getElementById(siteId+'.racks_table').insertAdjacentHTML('afterBegin',`
				<tr id="`+objId+`.row">
					<td></td>
					<td attr="Object_id">`+obj.RACK_ID+`</td>
					<td attr="Имя">`+obj.resource_business_name+`</td>
					<td attr="Родитель">`+sites[siteId].entrances[obj.parent.NCObjectKey].resource_business_name+`</td>
					<td attr="Тип Шкафа">`+obj.TipShkafa+`</td>
					
					<td class="edtbl" attr="Этаж">`+obj.Etazh+`</td>
					<td class="edtbl" attr="Расположение">`+val(obj.RaspologenieShkaf)+`</td>
					<td class="edtbl" attr="Вне этажное размещение">`+val(obj.VneEtashnoeRazmechenie)+`</td>
					<td class="edtbl" attr="Номер ДРС">`+''+`</td>
					<td class="edtbl" attr="Тип замка">`+val(obj.T_LOCK)+`</td>
					<td class="edtbl" attr="Номер ключа">`+val(obj.NomerKlucha)+`</td>
					
					<td attr="Примечание" class="edtbl">`+val(obj.ShifrKlucha)+`</td>
					<td attr="Описание объекта">`+val(obj.description)+`</td>
				</tr>`);
		};
		function deviceToRow(siteId,objId){
			let obj=sites[siteId].devices[objId];
			let cabled='';for(let id in sites[siteId].entrances){if(sites[siteId].entrances[id].DEVICE_LIST){for(let device_name of sites[siteId].entrances[id].DEVICE_LIST){if(toKP(device_name)==obj.resource_business_name){if(cabled.length){cabled+=','};cabled+=sites[siteId].entrances[id].NomerPodezda;};};};};
			document.getElementById(siteId+'.devices_table').insertAdjacentHTML('afterBegin',`
				<tr id="`+objId+`.row">
					<td></td>
					<td attr="Object_id">`+obj.DEVICE_NIOSS_ID+`</td>
					<td attr="Имя">`+obj.resource_business_name+`</td>
					<td attr="Родитель">`+sites[siteId].nodes[0].name+`</td>
					<td attr="Тип">`+getType(obj.resource_business_name)+`</td>
					
					<td class="edtbl" attr="Шкаф">`+((obj.ShkafPP)?(sites[siteId].racks[obj.ShkafPP.NCObjectKey].resource_business_name||''):'')+`</td>
					<td class="edtbl" attr="Псевдоним">`+val(obj.Alias)+`</td>
					<td class="edtbl" attr="IP Адрес (текст)">`+val(obj.IP_ADDRESS)+`</td>
					<td class="edtbl" attr="SNMP Community">`+val(obj.SNMP_COMMUNITY)+`</td>
					<td class="edtbl" attr="Version SNMP">`+val(obj.SNMP_VERSION)+`</td>
					<td class="edtbl" attr="VENDOR">`+val(obj.VENDOR)+`</td>
					<td class="edtbl" attr="MODEL">`+val(obj.MODEL)+`</td>
					<td attr="Обслуживаемые подъезды">`+cabled+`</td>
					
					<td attr="Примечание" class="edtbl">`+val(obj.Primechanie)+`</td>
					<td attr="Описание объекта">`+val(obj.description)+`</td>
				</tr>`);
		};
		function ppanelToRow(siteId,objId){
			let obj=sites[siteId].ppanels[objId];
			document.getElementById(siteId+'.ppanels_table').insertAdjacentHTML('afterBegin',`
				<tr id="`+objId+`.row">
					<td></td>
					<td attr="Object_id">`+obj.id+`</td>
					<td attr="Имя">`+obj.resource_business_name+`</td>
					<td attr="Родитель">`+sites[siteId].entrances[obj.parent.NCObjectKey].resource_business_name+`</td>
					<td attr="Модель устройства">`+obj.model+`</td>
					
					<td attr="Тип ДРС">`+((obj.TipDRS=='Transit')?'Транзитный':'Конечный')+`</td>
					<td class="edtbl" attr="Шкаф">`+((obj.ShkafPP)?(sites[siteId].racks[obj.ShkafPP.NCObjectKey].resource_business_name||''):'')+`</td>
					<td class="edtbl" attr="Номер Этажа">`+val(obj.NomerEtazha)+`</td>
					<td class="edtbl" attr="Расположение">`+val(obj.Raspologenie)+`</td>
					<td class="edtbl" attr="Номер ДРС">`+''+`</td>
					<td class="edtbl" attr="Тип МПК">`+''+`</td>
					<td class="edtbl" attr="Длинна МПК">`+''+`</td>
					<td class="edtbl" attr="Охрана">`+''+`</td>
					<td attr="Количество задействованных пар UTP/FTP=1 Port Ethernet">`+val(obj.KolichestvoZadeystvovannixParUtpFtpNaPortEth)+`</td>
					<td class="edtbl" attr="Вышестоящий элемент ДРС">`+''+`</td>
					
					<td attr="Описание объекта">`+val(obj.description)+`</td>
				</tr>`);
		};
		
		function dev_createInput(type='text',name='',values=[['','','']],disabled=''){
			switch(type){
				case'select':
					let options='';for(let value of values){options+=`<option value="`+value[0]+`" `+((value[3])?`disabled="`+value[3]+`"`:``)+`>`+value[1]+`</option>`;};
					return `<select name="`+name+`">`+options+`</select>`;
				break;
				case'text':
				default:
					return `<input type="text" name="`+(name||values[0][0])+`" value="`+values[0][1]+`" `+((disabled||values[0][3])?`disabled="`+disabled||values[0][3]+`"`:``)+`>`;
			};
		};
		
		function getType(name){return name.replace(/\W/g,'_').split('_')[0]};/*тип устройства*/
		function getNum(name){return name.replace(/\W/g,'_').split('_').reverse()[0]};/*номер устройства*/
		function toKP(name){return name.replace('KR','КР')};/*to Ru*/
		function toKR(name){return name.replace('КР','KR')};/*to En*/
		function isETH(name){return(getType(name)=='ETH')?true:false};
		function isOP(name){return(getType(name)=='OP')?true:false};
		function isA(name){return(getType(name)=='A')?true:false};
		function createEntranceTitle(e){return getType(e.ENTRANCE_NAME)+'#'+getNum(e.ENTRANCE_NAME)};/*P#2*/
		function createDeviceTitleIP(d){return getType(d.DEVICE_NAME)+'#'+getNum(d.DEVICE_NAME)+((d.IP_ADDRESS)?('&nbsp;..'+d.IP_ADDRESS.split('.')[2]+'.'+d.IP_ADDRESS.split('.')[3]):'')};/*ETH#14 ..153.168*/
		function createDeviceTitle(d){return getType(d.DEVICE_NAME)+'#'+getNum(d.DEVICE_NAME)};/*ETH#12*//*A#02*/
		function isPP(name){return(getType(name)=='PP')?true:false};
		function isCR(name){return(getType(name)=='CR')?true:false};
		function createPPTitle(p){return getType(p.name)+'#'+getNum(p.name)};/*PP#34*//*CR#202*/
		function createRackTitle(r){return getType(r.RACK_NAME)+'#'+getNum(r.RACK_NAME)};/*L#2*//*CU#46*/
		function isL(name){return(getType(name)=='L')?true:false};
		function isCU(name){return(getType(name)=='CU')?true:false};
		
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
					alert('план-схема отправлена на '+username+'@mts.ru')
				}else{
					timer=setTimeout(testLoad,100);
				};
			};
		};
		function downloadPL(obj){
			fetch('https://script.google.com/macros/s/AKfycbxl1S7H0iftlsBt8Tx-gL0zE-qwbwSN4TsUBpPqdIe9uMWtwgHfNGXb/exec',{
				'method':'POST',
				'mode':'no-cors',
				'headers':{'Content-Type':'application/json;charset=utf-8'},
				'body':JSON.stringify(obj)
			}).then(function(obj){/*console.log(obj)*/}).catch(function(err){console.log(err)}).finally(function(){});
			document.getElementById('delete_me_after_download').remove();
		};
		function preparePL(siteid){
			let title=sites[siteid].nodes[0].name+' '+new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString()+' '+username;
			return {
				username:username,
				sitename:sites[siteid].nodes[0].name,
				address:sites[siteid].nodes[0].address,
				title:title,
				html:`
					<!doctype html>
					<head>
						<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
						<title>`+title+`</title>
						<style type="text/css">
							body{height:100%;background-color:#f1f1f1;display:flex;flex-direction:column;box-sizing:border-box;}
							body{font-family:arial;color:#000;font-size:8pt;line-height:8pt;}
							input[type="checkbox"]{}
							input[type="text"]{height:8px;font-size:8pt;text-align:left;padding:1px;}
							input[type="button"]{height:20px;padding:1px;}
								
								.tile{box-shadow:0px 7px 16px 0px rgba(0,0,0,0.12);margin-bottom:8px;padding:8px;}
								.tile-search{background-color:#fff;order:-1;display:flex;flex-direction:column;}
									.loader-line{width:100%;padding-left:1em;background-color:#35a6dc;background-image:linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);background-size:1rem 1rem;animation:progress-bar-stripes 1s linear infinite;}
									@keyframes progress-bar-stripes{from{background-position:1rem 0}to{background-position:0 0}}
								.tile-result{}
								.tile-warning{background-color:#fee;}
								.tile-unknown{background-color:#fed;}
								.tile-building{background-color:#fff;}
								.tile-building>*{margin-bottom:2px;}
									.content-x-scroll{overflow-x:auto;overflow-y:hidden;}
										.entrances-grid{display:grid;grid-column-gap:2px;width:min-content;}
											.floors-over{display:flex;flex-direction:column-reverse;}
												.entrance-head{background-color:#eee;border: 1px solid #000;min-width:114px;}
													.entrance-title{}
											.floors-under{display:flex;flex-direction:column;}
												.floor{display:inline-grid;grid-template-columns: 20px auto;background-color:#eee;border-left:1px solid #000;border-right:1px solid #000;border-top:1px solid #ccc;}
												.floor.cherdak{border-top:unset;}
												.floor.tehetag{}
												.floor.floor_0{border-top:1px solid #000;}
												.floor.podval{border-bottom:1px solid #000;}
													.floor-number{font-size:14px;line-height:14px;height:14px;color:gray;margin:auto;}
													.floor-objects{}
														.floor-racks{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:space-around;}
														.floor-racks.floor-rk{flex-wrap:nowrap;}
															.rack{width:max-content;height:fit-content;min-height:23px;margin:1px;border:1px solid #000;border-radius:2px;background-color:#aaa;}
																.type-L{width:104px;}
																.type-CU{width:48px;}
																	.rack-head{}
																		.rack-title{}
																	.rack-devices{display:flex;flex-direction:column;}
																		.device{width:100px;margin-left:1px;margin-right:1px;margin-bottom:1px;border:1px solid #000;background-color:#fff;display:flex;flex-direction:column;}
																		.type-CU .device{width:44px;}
																		.type-ETH{background-color:#eff;}
																		.type-OP{background-color:#ffe;}
																		.type-A{background-color:#ffe;}
																		.type-SBE{background-color:#eef;}
																		.type-OSW{background-color:#eef;}
																		.type-FAMP{background-color:#eef;}
																		.type-MBH{background-color:#eef;}
																		.type-MPLS{background-color:#eef;}
																		.type-OLT{background-color:#eef;}
																		.type-IP{background-color:#fef;}
																		.type-CPE{background-color:#fef;}
																		.type-Voip{background-color:#fef;}
																		.type-CR{background-color:#ddd;}
																		.type-PP{background-color:#ddd;}
																		.without{width:44px;margin-top:1px;}
																			.device-head{display:inline-flex;}
																				.device-title{}
																					.title-norm{display:block;}
																					.type-CU .title-norm{display:none;}
																					.without .title-norm{display:none;}
																					.title-short{display:none;}
																					.type-CU .title-short{display:block;}
																					.without .title-short{display:block;}
																				.device-led{width:6px;min-width:6px;margin-left:auto;}
																				.device-led.online{background-color:green;}
																				.device-led.offline{background-color:red;}
																				.device-led.nomon{background-color:#ddd;}
														.floor-flats{display:flex;flex-direction:row;flex-wrap:nowrap;}
														.floor-flats.floor-even{justify-content:space-between;}
														.floor-flats.floor-neven{justify-content:space-around;}
														.floor-flats.floor-fake{flex-wrap:wrap;width:580px;}
															.flat-none{width:100%;height:16px;line-height:16px;margin:auto;text-align:center;color:#a2a2a2;}
															.flat{width:24px;min-width:24px;height:30px;margin:1px;border:1px solid #a2a2a2;color:#a2a2a2;border-radius:2px;text-align:center;}
															.flat.on-service{border-color:#000;}
															.flat.inet{}
															.flat.tv{}
															.flat.voip{}
																.flat-service{display:none;line-height:7pt;}
																.flat-service.red{display:block;color:tomato;}
																.flat-service.green{display:block;color:forestgreen;}
										
										
										.devices-without{/*display:flex;*//*flex-direction:column;*/}
										
										
										.mmrd-field{display:flex;flex-direction:column;width:max-content;}
										.mmrd-field>table{border-collapse:collapse;margin-bottom:1em;width:fit-content;}
										.mmrd-field>table>thead{}
										.mmrd-field>table>thead tr{}
										.mmrd-field>table>thead tr th{border:1px solid #000;background-color:#ffe4b5;}
										.mmrd-field>table>tbody{}
										.mmrd-field>table>tbody tr{}
										.mmrd-field>table>tbody tr td{border:1px solid #000;background-color:#e0e0e0;}
										.mmrd-field>table>tbody tr td.edtbl{background-color:unset;}
										.mmrd-field>table>tbody tr td.edt{background-color:#ffff00;}
							
							.hide{display:none;}
							.ghost{opacity:0.3;}
						</style>
						<script name="delete_me">window.site=`+JSON.stringify(sites[siteid])+`;</script>
						<script name="delete_me">
							function hideBtns(){
								document.body.removeAttribute('onload');
								console.log(window.site.nodes[0].name,window.site);
								for(let btn of document.querySelectorAll('input[type="button"]')){
									btn.classList.add('hide');btn.setAttribute('disabled','disabled');
								};
								let del=document.getElementsByName('delete_me');
								while(del.length>0){del[0].remove()};
							};
						</script>
					</head>
					<body onload="hideBtns()">
						`+((document.getElementById(siteid))?(document.getElementById(siteid).outerHTML):`<div>error<div>`)+`
					</body>`,
			};
		};
		
	};
	
	/*
	}else{console.log(document.title)};

}());
*/
