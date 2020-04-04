javascript:(function(){
	
if(document.title != 'Inetcore+' && ((window.location.href.indexOf('https://fx.mts.ru/fix')>=0)||(window.location.href.indexOf('http://inetcore.mts.ru/fix')>=0)||(window.location.href.indexOf('http://pre.inetcore.mts.ru/fix')>=0)||(window.location.href.indexOf('http://release-20-6.test.inetcore.mts.ru/fix')>=0))){
	document.title = 'Inetcore+';
	
	function start(){
		var addCSS = document.createElement('style');
		addCSS.type = 'text/css';
		const myCSS = `			
			.status10{margin-left:10px;font-weight:600;color:darkorange;}/*Отключена*/
			.status5{margin-left:10px;font-weight:600;color:darkred;}/*Заблокирована*/
			.status0{margin-left:10px;font-weight:600;color:darkgreen;}/*Активна*/
			
			.mycompareddevice{border:1px solid black;border-radius:6px;margin:2px 0px;}
			.mycomparedport{border:1px solid darkgray;border-radius:6px;margin:2px;display:none;}
			.mycomparedport.ethernetCsmacd{display:block;}
			.mycomparedport.gigabitEthernet{display:block;}
			
			.led.myoon{background-color:#30BA30;}
			.led.myodown{background-color:gray;}
			.led.myaon{}
			.led.myadown{background-color:red;}
			
			.myportsflex{display:flex;flex-direction:row;flex-wrap:wrap;font-size:10px;line-height:14px;text-align:center;}
			.myportinflex{margin:1px;padding:2px 5px 2px 2px;border:1px solid #000;border-radius:4px;display:grid;grid-gap:2px 2px;width:24%;grid-template-columns:24% 24% 24% 24%;grid-template-rows:min-content min-content auto auto auto auto min-content min-content;}
			.mypstline{height:14px;border-radius:2px;border-top-right-radius:4px;border-top-left-radius:4px;}
			.mypstatus{height:14px;border-radius:2px;border-top-right-radius:4px;border-top-left-radius:4px;}
			.mypnumber{height:30px;border-radius:2px;font-size:20px;line-height:30px;border-top-left-radius:4px;}
			.mylegend{width:40px;height:16px;text-align:center;line-height:16px;font-size:12px;display:inline-block;padding:0px 4px;margin:0px 10px 0px 0px;}
			.mylegendport{height:20px;line-height:10px;width:30px;padding:5px 5px;display:inline-block;margin-right:15px;}
			.myspeed{border-radius:2px;background-color:gray;}
			.myspeed10{background-color:#ffc107;}
			.myspeed100{background-color:#28a745;}
			.myspeed1G{background-color:#42b9cc;}
			.myspeed10G{background-color:#007bff;}
			.myoperstateup{}
			.myoperstatedown{background-color:gray;}
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
			
			.mypaira-default{background-color:#eacf9c;}
			.mypairb-default{background-color:#b4f3b4;}
			.mypairc-default{background-color:#c5e3ec;}
			.mypaird-default{background-color:#c78e65;}
			
			.myportok{width:100%;height:100%;}
			.myportwarn{border:1px dashed #000;}
		`;
		addCSS.appendChild(document.createTextNode(myCSS));
		document.head.appendChild(addCSS);
		/*console.log('addCSS!');*/
				
		window.AppInventor.setWebViewString('version_:FX_test_v163');
		
		document.body.addEventListener("click", updateHTML);
		
		var templates_need_replace=true;
		function updateHTML(){
			/*console.log('click! date:'+Date());*/
			if(document.body.getElementsByClassName('screen-header-title')[0].textContent=='Домовой узел'){
				/*this is du*/
			}else if(document.body.getElementsByClassName('screen-header-title')[0].textContent=='коммутатор'){
				/*this is sw*/
			}else if(document.body.getElementsByClassName('screen-header-title')[0].textContent=='оптический приемник'){
				/*this is op*/
			}else if(document.body.getElementsByClassName('screen-header-title')[0].textContent.includes('Наряды')&&templates_need_replace){
				/*this is Start page*/
				myOrders_template();
				myPortComparerEl_template();
				myPortsEl_template();
				myPort_template();
				mySetPort_modal();
				myAccount_template();
				templates_need_replace=false;
			};
		};
		
		function myPortComparerEl_template(){
			document.getElementById('port-comparer-el-template').innerHTML=`
				<div v-if="devices">
					<div class="line-row">
						<span class="pl-4 pb-2 position-relative">
							<input v-model="showAll" name="all-ports-check" type="checkbox" class="check-mts" id="all-ports-check">
							<label for="all-ports-check">Отображать все порты</label>
							<input v-model="withCableTest" name="with-cable-test" type="checkbox" class="check-mts" id="with-cable-test" :disabled="loading">
							<label for="with-cable-test">C кабель-тестом</label>
						</span>
					</div>
					<div class="line-row">
						<button @click="loadPortStatuses(false)" class="btn btn-sm btn-action" :disabled="disableSaveBtn">
							<i class="fas fa-save"></i> Cохранить
						</button>
						<button @click="loadPortStatuses(true)" class="btn btn-sm btn-action" :disabled="disableCompareBtn">
							<i class="fas fa-list"></i> Cравнить
						</button>
						<button @click="help" class="btn btn-title float-right">
							<i class="fas fa-info"></i>
						</button>
					</div>
					<div class="bar-info">
						<div v-show="saved" class="note small-text">
							<div>сохранено: {{ timestamp }};
								<span>{{ words(deviceList) }}</span>
							</div>
						</div>
					</div>
					<div v-if="saved">
						<div v-for="device in deviceList">
							<div v-if="device.message" class="alert alert-warning mutation-alert">
								<div>
									<span class="font-weight-bold">{{ device.name }}</span>
									{{ device.ip }}
								</div>
								<div>{{ device.message }}</div>
							</div>
						</div>
					</div>
					<div v-if="compared">
						<div class="note small-text">
							{{ changeWord(changed) }}
							{{ changed }}
							{{ portWord(changed) }}
						</div>
					</div>
					<div v-for="(device, index) in deviceList" class="mycompareddevice">
						<h5 style="padding-top:unset;margin-bottom:unset;"><span class="small-text">коммутатор </span><span>{{ device.ip }}</span><span class="small-text">&nbsp;(&nbsp;{{ device.ports.length }}&nbsp;)</span></h5>
						<div v-for="(item, index) in device.ports">
							<div v-show="showAll || item.changed" class="mycomparedport":class="item.type_iface+' '+classChangeEntry(item)">
								<div v-if="item.loading" class="port">загрузка...</div>
								<div v-else @click="toPort(item)" class="port":class="classChangeEntry(item)">
									<span class="led":class="(item.status=='up')?'on':'disable'"></span>
									<span class="device status":class="item.status" style="font-size:unset;">link {{ item.status }}</span>
									<span class="number">{{ item.iface.replace('1/','порт ') }}</span>
									<div class="float-right"><i class="fas fa-chevron-right"></i></div>
									<div class="minor-text" style="text-align-last:left;">
										<div v-if="item.pair_1" class="mypair">pair 1: {{ item.pair_1 }} {{ item.metr_1 }}</div>
										<div v-if="item.pair_2" class="mypair">pair 2: {{ item.pair_2 }} {{ item.metr_2 }}</div>
										<div v-if="item.pair_3" class="mypair">pair 3: {{ item.pair_3 }} {{ item.metr_3 }}</div>
										<div v-if="item.pair_4" class="mypair">pair 4: {{ item.pair_4 }} {{ item.metr_4 }}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		};
		
		function myOrders_template(){
			Vue.component('orders-view', {
			  template: '#orders-template',
			  props: ['data'],
			  data: function () {
				return {
				  date: new Date(),
				  orderList: [],
				  
				  statusList: {
					assigned: {text: 'Назначен', check: false},
					sent: {text: 'Отправлен', check: true},
					transit: {text: 'В пути', check: true},
					inProgress: {text: 'В работе', check: true},
					done: {text: 'Выполнен', check: true},
					none: {text: 'Не выполнен', check: false},
					canceled: {text: 'Отменен', check: false},
					preSent: {text: 'Предв. Отправлен', check: true},
					resolved: {text: 'Завершен', check: false}
				  },

				  loading: false
				}
			  },
			  created: function () {
				/*this.showSetting();*/
			  },
			  computed: {
				filterOrder: function () {
				  var self = this;
				  return this.orderList.filter(function (order) {
					for ( var key in self.statusList ) {
					  if (self.statusList[key].text == order.status && self.statusList[key].check) return order;
					}
				  });
				},
			  },
			  methods: {
				showSetting: function () {
				  this.$root.showModal({ title: 'Наряды', data: this, component: 'order-modal' });
				},
				load: function () {
				  if (this.loading) return;
				  this.loading = true;
				  this.orderList.splice(0, this.orderList.length);
				  var self = this;
				  httpGet('/call/wfm/engineer_tasks?date=' + this.date).then(function (data) {
					switch (data.type) {
					  case 'warning':
						self.$root.message = data.text;
						break;
					  case 'error':
						self.$root.message = data.error;
						break;
					  default:
						self.orderList = data;
						break;
					}
					self.loading = false;
				  });
				},
				showPreviousDay: function () {
				  this.date = Dt.addDays(-1, this.date);
				  this.load();
				},
				selectOrder: function (order) {
				  this.$root.showModal({ title: order.tasktype + ' ' + order.NumberOrder, data: order, component: 'order-details-modal' });
				}
			  }
			});
		};
		
		function myPortsEl_template(){
			document.getElementById('ports-el-template').innerHTML=`
				<div class="ports-el myPorts">
					<div v-if="loading">Порты</div>
					<template v-else>
						<div class="device-ports-view-toggle">
							<input @change="changeTab" name="ports-view-toggle" type="checkbox" class="view-toggle" id="ports-view-toggle" :checked="showdetails">
							<label for="ports-view-toggle">
								<div class="ports-view-toggle-background d-flex">
									<div class="col-6 d-flex d-flex justify-content-center align-items-center">Компактно</div>
									<div class="col-6 d-flex d-flex justify-content-center align-items-center">Подробно</div>
								</div>
							</label>
						</div>
						<template v-if="showdetails">
							<div v-if="isoptical">
								<center>Не поддерживается устройством</center>
							</div>
							<div v-else class="ports-request-info-buttons d-flex">
								<div class="col-5 col-status">
									<button class="btn-status d-flex justify-content-center align-items-center" @click="getPortsErrors" :disabled="!loaded.portsErrors">
										<template v-if="loaded.portsErrors">Ошибки</template>
										<template v-else>
											<div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div>Проверяем...
										</template>
									</button>          
								</div>
								<div class="col-5 col-loops">
									<button class="btn-loops d-flex justify-content-center align-items-center" @click="detectLoop" :disabled="!loaded.portsLoop">
										<template v-if="loaded.portsLoop">Петли</template>
										<template v-else>
											<div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div>Проверяем...
										</template>
									</button>
								</div>
								<div class="col-2 col-loops btn-update-all">
									<button class="btn-loops d-flex justify-content-center align-items-center" @click="updateAll" :disabled="!loaded.portStatuses">
										<img src="/f/i/icons/icon_refresh.svg" class="cursor-pointer icon-20 float-right mt5 rotate_360">
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
											<div style="grid-area:1/1/3/3;"><div class="mypnumber" :class="portClass(port)">{{ port.number }}</div></div>
											<div style="grid-area:1/3/2/5;"><div v-if="port.flat" class="mypstatus" :class="portClass(port)">{{ port.flat }}</div></div>
											<div style="grid-area:2/3/3/5;"><div v-if="loaded.portStatuses && !error.empty" class="myspeed":class="'myspeed'+portSpeed(index)+' myoperstate'+port.port_status.oper_state+' myadmstate'+port.port_status.admin_state">{{ (port.port_status.admin_state=='up')?((port.port_status.oper_state=='up')?portSpeed(index):port.port_status.oper_state):"off" }}</div></div>
											
											<template v-if="loaded.portStatuses && !error.empty && port.port_status">
												<template v-for="(pair, i) in pairs(index)">
													<div v-bind:style="pair.position">
														<div v-if="pair.pair && loaded.portStatuses && !error.empty" class="mypair":class="pair.pairclass">{{pair.number}}:{{pair.pair}} {{pair.metr}}</div>
													</div>
												</template>
											</template>
											
											<!--<div style="grid-area:3/1/7/5;"><div v-if="loaded.portStatuses && !error.empty" class="myportok":class="portMetrStatusClass(index)"></div></div>-->
											<div style="grid-area:7/1/8/5;"><div v-if="port.port_errors">{{ port.port_errors}}</div></div>
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
											<div style="grid-area:1/1/2/2;"><div class="led"></div></div>
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
									<li class="list-group-item"><div class="mylegend myspeed mylegendport port-busy">0</div>занятые</li>
									<li class="list-group-item"><div class="mylegend myspeed mylegendport port-expired">0</div>можно освободить</li>
									<li class="list-group-item"><div class="mylegend myspeed mylegendport port-new">0</div>новый MAC</li>
									<li class="list-group-item"><div class="mylegend myspeed mylegendport port-free">0</div>cвободные</li>
									<li class="list-group-item"><div class="mylegend myspeed mylegendport port-bad">0</div>битые</li>
									<li class="list-group-item"><div class="mylegend myspeed mylegendport port-trunk busy">0</div>тех. занятые</li>
									<li class="list-group-item"><div class="mylegend myspeed mylegendport port-trunk free">0</div>тех. свободные</li>
									<div class="w-100 py-1">Статусы порта:</div>
									<li class="list-group-item"><div class="mylegend myspeed port-new">NEW</div>новый MAC</li>
									<li class="list-group-item"><div class="mylegend myspeed port-hub">HUB</div>hub (возможно)</li>
									<li class="list-group-item"><div class="mylegend myspeed port-expired">MOVE</div>переезд</li>
									<template v-if="showdetails">
										<div class="w-100 py-1">Link speed:</div>
										<li class="list-group-item"><div class="mylegend myspeed myspeed10 myoperstateup">10</div>линк на десятке</li>
										<li class="list-group-item"><div class="mylegend myspeed myspeed100">100</div>линк на сотке</li>
										<li class="list-group-item"><div class="mylegend myspeed myspeed1G">1G</div>гиговый линк</li>
										<li class="list-group-item"><div class="mylegend myspeed myspeed10G">10G</div>10гиговый линк</li>
										<li class="list-group-item"><div class="mylegend myspeed myoperstatedown">down</div>Link down</li>
										<li class="list-group-item"><div class="mylegend myspeed myadmstatedown">off</div>Port disabled</li>
										<div class="w-100 py-1">Ошибки:</div>
										<li class="list-group-item"><div class="legend-port legend-port-state">- / -</div>Тест ошибок не запускался</li>
										<li class="list-group-item"><div class="legend-port legend-port-state">0 / 0</div>Прием / Передача</li>
										<li class="list-group-item"><div class="legend-port legend-port-state">999Т</div>999 тысяч ошибок</li>
										<li class="list-group-item"><div class="legend-port legend-port-state">999М</div>999 миллионов ошибок</li>
									</template>
								</ul>
							</div>
						</div>
					</template>
				</div>
			`;
			Vue.component('ports-el',{
				template:'#ports-el-template',
				props:['ports','loading','showdetails','isoptical'],
				data:function(){
					return{
						portsLoop:[],
						loaded:{
							portStatuses:false,
							portsLoop:true,
							portsErrors:true,
						},
					error:{
						empty:false,
						emptyMessage:'',
					},
					showShadow:true,
					}
				},
				computed:{
					btnShadowClass:function(){
						return this.showShadow?"btn-shadow":"";
					},
					isPortsLoaded:function(){
						if(this.ports){
							this.loadPortsInfo();
							return true;
						}
						return false;
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
					/*Ports map*/
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
					/*Ports speed, status, cable test*/
					loadPortsInfo:function(){
						this.loaded.portStatuses=false;
						this.error.empty=false;
						if(this.ports&&this.ports.length){
							var self=this;
							var device=this.ports[0].device_name;
							if(!this.ports[0].port_status){/*.port_status - кэш информации о портах*/
								httpPost('/call/dnm/port_statuses',{devices:[{DEVICE_NAME: device}],add:'cable'}).then(function(data){
									if(!data[device])throw new Error("Не удалось получить данные с сервера");
									if(!data[device].ports)throw new Error("Не удалось получить информацию о портах");
									var ports=data[device].ports;
									for(var i=0;i<self.ports.length;i++){
										if(ports[i]){
											ports[i].status=ports[i].oper_state.includes('up')?'up':'down';
										}else{
											console.warn('UNDEFINED',i);
										}
										Vue.set(self.ports[i],'port_status',ports[i]);
									}
									self.loaded.portStatuses=true;
								}).catch(function(e){
									self.errorsHandler(e);
									self.error.empty=true;
									self.loaded.portStatuses=true;
								});
							}else{
								self.loaded.portStatuses=true;
							}
						}
					},
					portSpeed:function(index){
						var replace={'':"",'0':"",'10':"10",'100':"100",'1000':"1G",'10000':"10G"};
						if(this.ports[index].port_status){
							return replace[this.ports[index].port_status.high_speed];
						}else{
							return '-';
						}
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
									port:port.snmp_number
								};
								httpGet(buildUrl('port_status', params),false).then(function(data){
									var errors=self.numShow(data.IF_IN_ERRORS)+' / '+self.numShow(data.IF_OUT_ERRORS);
									Vue.set(port,'port_errors',errors);
									self.loaded.portsErrors=requestsCount==++statusCount;
								}).catch(function(e){
									self.errorsHandler(e);
									self.loaded.portsErrors=true;
								});
							}(port));
						});
					},
					numShow:function(errorsCount){
						var order={1:'',2:'т',3:'м',4:'м'};
						if(typeof(errorsCount)=='string'){errorsCount=+errorsCount};
						var value=errorsCount.toLocaleString('ru-RU').split(/\s/g);
						return isNaN(value[0])?'-':+value[0]+order[value.length];
					},
					detectLoop:function(){
						this.loaded.portsLoop=false;
						this.error.emptyMessage='';
						var self=this;
						var deviceParams=weedOut(this.ports[0].device,'MR_ID IP_ADDRESS SYSTEM_OBJECT_ID VENDOR FIRMWARE FIRMWARE_REVISION PATCH_VERSION');
						httpPost('/call/dnm/ports_info_loopback',{device:deviceParams}).then(function(data){
							var dataIndex=0;
							if(data){
								for(var i=0;i<self.ports.length;i++){
									if(data[dataIndex]&&self.ports[i].snmp_name==data[dataIndex].iface){
										Vue.set(self.ports[i],'port_loop',data[dataIndex]);
										dataIndex++;
									}else{
										Vue.set(self.ports[i],'port_loop',null); /*FIX Тут на самом деле функция определения петли отключена*/
									}
								}
							}else{
								/*Если null, то устройство вообще не поддерживает такую функцию*/
							}
							self.loaded.portsLoop=true;
						}).catch(function(e){
							self.errorsHandler(e);
							self.loaded.portsLoop=true;
						});
					},
					pairs:function(index){
						var allow_statuses_arr=['close','open','short','ok','no_cable'];
						var pairs=[];
						var show=false;
						if(this.ports[index].port_status){
							var pair=this.ports[index].port_status;
							for(var i=1;i<=4;i++){
								show=show||pair["pair_" + i];
								var pair_len=pair["metr_" + i]?parseInt(pair["metr_" + i],10):'-';
								pair_len=isNaN(pair_len)?'-':pair_len+"M";
								var pair_end=null;
								var cssClass="default";
								if(pair["pair_"+i]){
									pair_end=pair["pair_"+i].toLowerCase();
									if(allow_statuses_arr.includes(pair_end)){
										cssClass=pair_end;
										pair_end=pair_end;
									}else{
										cssClass="error";
										pair_end="error";
									};
								};
								var pair_info={
									pairclass:"pairend-"+cssClass,
									position:"grid-area:"+(i+2)+"/1/"+(i+3)+"/5;",
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
					portMetrStatusClass(index){/*неиспользуется, переделать на подсветку ошибок на порту*/
						if(this.loaded.portStatuses&&!this.error.empty&&this.ports[index].port_status){
							var arr=[];
							var pair=this.ports[index].port_status;
							for(var i=1;i<=4;i++){
								if (pair["metr_"+i]){
									arr.push(parseInt(pair["metr_"+i],10));
								};
							};
							if(arr.length>1){
								arr=arr.sort();
								return Math.abs(arr[0]-arr[arr.length-1])>5?"port-pairs-info-warn":"port-pairs-info-ok";
							}else{
								return "port-pairs-info-ok";
							};
						}else{
							return "port-pairs-info-ok";
						};
					},
					portClass:function(port){
						return 'port-'+port.state;
					},
				}
			});
		};
		
		function myPort_template(){
			document.getElementById('port-template').innerHTML=`
				<div v-if="data">
					<div class="info-block port-info">
						<screen-header-el @click="refresh">
							<template slot="title">порт № {{ data.number }}</template>
							<span @click="loadStatus" class="led big" :class="ledClass(data.status.IF_ADMIN_STATUS)">a</span>
							<span @click="loadStatus" class="led big" :class="ledClass(data.status.IF_OPER_STATUS)">o</span>
							{{ data.snmp_name }}
							<template slot="info">№ {{ data.number }}<span class="speed">{{ data.status.IF_SPEED ? '(' + data.status.IF_SPEED + ')' : '' }}</span></template>
							<template slot="minor">{{ data.name }}</template>
						</screen-header-el>
						<div @click="toDevice">
							<i class="fas fa-network-wired faded mr-1"></i>{{ data.device_name }}<i class="fa fa-chevron-right float-right"></i>
						</div>
						<div v-if="data.last_mac">{{ data.last_mac.last_at }}<span class="inscription">последний выход</span></div>
						<div v-if="data.last_mac">{{ data.last_mac.value }}<span class="inscription">последний MAC</span></div>
						<div v-bind:disabled="loading.status" v-show="data.status" class="snmp-status">
							<span v-on:click="clearErrors"><i class="fa fa-recycle"></i></span>
							<span class="speed">{{ IOErrors }}</span>
							<span class="inscription">ошибки</span>
						</div>
						<div v-bind:disabled="loading.loopback" class="snmp-status">
							<span v-if="loading.loopback">Проверяем...</span>
							<span v-else><img v-if="data.loopback.detected" src="../f/i/icons/kz.svg" title="Обнаружена петля">{{ data.loopback.text }}</span>
							<span class="inscription">петля</span>
						</div>
						<div class="small-text">{{ data.snmp_description }}</div>
						<div v-show="loading.status || loading.loopback" class="progress">
							<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
						</div>
					</div>
					
					<div class="info-block">
						<a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseActions" href="#collapseActions">
							<span>Действия</span>
							<div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
						</a>
						<div class="collapse" id="collapseActions">
							<div class="action-block">
								<button @click="restartPort" v-bind:disabled="loading.restart || blockedSetButton" class="btn btn-action btn-row btn-sm">
									<i class="fas fa-power-off"></i>Перезагрузить порт<span v-show="data.restartPort" class="text-success float-right"><i class="fa fa-check"></i></span>
								</button>
								<div v-show="loading.restart" class="progress">
									<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
								</div>
							</div>
							<div class="action-block">
								<button v-bind:disabled="blockedSetPortForUser" class="btn btn-action btn-row btn-sm" @click="setPortForUser()">
									<i class="fas fa-link"></i>Привязать лицевой счет
								</button>
							</div>
							<div class="action-block">
								<button @click="testCable" v-bind:disabled="loading.cabletest || blockedSetButton" class="btn btn-action btn-row btn-sm">
									<i class="fas fa-ruler-combined"></i>Кабель тест
								</button>
								<template v-if="data.cabletest">
									<div v-if="data.cabletest.type == 'error'" class="alert alert-danger">{{ data.cabletest.message }}</div>
									<pre v-if="data.cabletest.type == 'info'" class="text-block">{{ data.cabletest.text.join('\\n') }}</pre>
								</template>
								<div v-show="loading.cabletest" class="progress">
									<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
								</div>
							</div>
							<div class="action-block">
								<button v-bind:disabled="blockedSetButton" @click="showLog()" class="btn btn-action btn-row btn-sm">
									<i class="fas fa-stream"></i>Показать лог
								</button>
								<div v-show="loading.log" class="progress">
									<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
								</div>
							</div>
							<div class="action-block">
								<button @click="showPortMacs" v-bind:disabled="loading.macs || blockedSetButton" class="btn btn-action btn-row btn-sm">
									<i class="fas fa-at"></i>MAC-адреса
								</button>
								<template v-if="macs">
									<div v-if="macs.type == 'error'" class="alert alert-danger">{{ macs.message }}</div>
									<pre v-if="macs.type == 'info'" class="text-block">{{ macs.text.join('\\n') }}</pre>
								</template>
								<div v-show="loading.macs" class="progress">
									<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
								</div>
							</div>
						</div>
					</div>

					<div class="info-block port-info">
						<div v-if="loading.link"><span>Подключения</span></div>
						<ul class="list-group list-group-flush">
							<li v-for="link in data.link" class="list-group-item">
								<div v-if="link.ACCOUNT" class="link">
									<div :class="{ contract : link.CLOSE_DATE }">
										<div @click="jump(link)" class="link-title">
											<i class="fa fa-user"></i>Абонент<i class="fa fa-chevron-right float-right"></i>
										</div>
										<div>{{ link.ACCOUNT }}<span class="inscription">лицевой счет</span></div>
										<div v-if="link.FLAT_NUMBER">№ {{ link.FLAT_NUMBER }}<span class="inscription">квартира</span></div>
										<div>{{ link.START_DATE }}<span class="inscription">заключен</span></div>
										<div v-if="link.CLOSE_DATE">{{ link.CLOSE_DATE }}<span class="inscription">расторгнут</span></div>
										<div>{{ link.MAC }}<span class="inscription">MAC</span></div>
										<div>{{ link.FIRST_DATE }}<span class="inscription">первый выход</span></div>
										<div>{{ link.LAST_DATE }}<span class="inscription">последний выход</span></div>
									</div>
								</div>
								<div v-else-if="link.LINK_DEVICE_NAME" class="link">
									<div v-on:click="jump(link)" class="link-title">
										<i class="fa fa-microchip"></i>Устройство<i class="fa fa-chevron-right float-right"></i>
									</div>
									<div>{{ link.LINK_DEVICE_NAME }}<span class="inscription">устройство</span></div>
									<div>{{ link.LINK_PORT_NAME }}<span class="inscription">порт</span></div>
									<div>{{ link.LINK_SNMP_PORT_NAME }}<span class="inscription">SNMP имя порта</span></div>
								</div>
								<div v-else-if="link.empty" class="link">
									<div class="link-title">
										<i class="fa fa-circle-notch"></i>Свободный порт
									</div>
								</div>
								<div v-else class="link">
									<div class="link-title">
										<i class="fa fa-user-secret"></i>
									</div>
									<div>{{ link.MAC }}<span class="inscription">MAC</span></div>
									<div>{{ link.FIRST_DATE }}<span class="inscription">первый выход</span></div>
									<div>{{ link.LAST_DATE }}<span class="inscription">последний выход</span></div>
								</div>
							</li>
							<li v-if="state == 'bad'" class="list-group-item">
								<div class="link-title">
									<i class="fa fa-window-close"></i>Битый порт
								</div>
							</li>
							<li v-else-if="state == 'free'" class="list-group-item">
								<div class="link-title">
									<i class="fa fa-expand"></i>Свободный порт
								</div>
							</li>
						</ul>
						<div v-if="loading.link" class="progress">
							<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
						</div>
					</div>
					
					<div class="modal fade" id="logModal" tabindex="-1" role="dialog">
						<div class="modal-dialog" role="document">
							<div class="modal-content">
								<div class="modal-header">
									<h5 class="modal-title" id="exampleModalLabel">Лог</h5>
									<button type="button" class="close" data-dismiss="modal" aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
								<div class="modal-body">
									<div v-show="log.status == 'success'" style="height: 396px; overflow: scroll;">
										<p v-for="logLine in log.data">{{logLine}}</p>
									</div>
									<div v-show="log.status == 'error'" style="height: 396px; overflow: scroll;">
										<p class="text-danger">Ошибка получения данных</p>
									</div>
									<div v-if="loading.log" class="progress">
										<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
									</div>
									<button type="button" class="btn btn-secondary mt-3" data-dismiss="modal">Закрыть</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		};
		
		function mySetPort_modal(){
			document.getElementById('set-port-modal').innerHTML=`
				<div class="container-fluid">
        <div class="search-ctrl box-shadow-none search-account-modal">
            <div class="input-group">
                <input id="searchPanelAccount" v-filter="'[0-9-]'" v-model.lazy="sample" @keyup.enter="searchAccount" type="text" class="form-control" placeholder="Найти">
                <div class="input-group-append">
                    <button v-on:click="audio" v-if="audioShow" class="btn btn-audio btn-erase" type="button"><i class="fas fa-microphone"></i></button>
                    <button v-on:click="erace" class="btn btn-erase" type="button"><i class="fas fa-times"></i></button>
                    <button v-on:click="searchAccount" class="btn btn-search" type="button"><i class="fas fa-search"></i></button>
                </div>
            </div>
        </div>
        <div v-if="account">
            <p class="small-text">Результат поиска:</p>
            <div v-if="account.isError" v-html="account.text" class="alert alert-warning" role="alert"></div>
            <div v-else>
                <div class="account-block account-info" v-for="acc in account.data">
                    <span class="account-header">
                        <i class="fa fa-user"></i> {{ acc.agreements.account }}
                    </span>
                    <div>
                        <span class="small-text">{{ acc.address }}</span>
                    </div>
                    <div v-show="acc.phone" class="small-text">
                        {{ acc.phone }}
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
                    <div v-if="acc.vgids.length > 0">
                        <div class="form-row">
                            <div class="mt-2 full-fill">Учетная запись для связи:</div>
                            <div class="form-group full-fill custom-control-radio" v-for="vg in acc.vgids">
                                <label>
                                    <div class="custom-control custom-checkbox my-1 mr-sm-2">
                                        <input type="radio" class="custom-control-input" 
                                                v-bind:disabled="loading"
                                                v-bind:id="vg.vgid" 
                                                v-bind:name="acc.userid" 
                                                @change="getMacList"
                                                v-bind:value="{vgid: vg.vgid, login: vg.login, serverid: vg.serverid, type_of_bind: vg.type_of_bind, agentid: vg.agentid}" 
                                                v-model="resource">
											<!--replaced this fragment-->
                                        <span class="custom-control-label custom-control-empty">{{ vg.login }}<br/>ID: {{ vg.vgid }}<span v-bind:class="(vg.status==0)?'status0':((vg.status==10)?'status10':'status5')">{{ vg.statusname }}</span><br/><span class="small-text">{{ vg.tardescr }}</span></span>
											<!--replaced this fragment-->
										</input>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div v-if="typeOfBind == 2" class="form-row">
                            <input list="macs" class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23">
                            <datalist id="macs">
                                <option v-for="mc in mac.list">{{ mc }}</option>
                            </datalist>
                            <button @click="setupMacForUser()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-3" type="submit">Связать mac</button>
                        </div>
                        <div v-else-if="typeOfBind == 3 || typeOfBind == 6 || typeOfBind == 8" class="form-row">
                            <input v-if="typeOfBind == 6" class="form-control form-control-sm mb-2" v-filter="'[0-9\.]'" v-model="client_ip" maxlength="15">
                            <button @click="setBind(3)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill" type="submit">Связать счет</button>
                            <button v-if="typeOfBind == 8" @click="setBind(8)" v-bind:disabled="loading" class="btn mt-2 btn-primary btn-sm btn-fill" type="submit">Выделить IP</button>
                        </div>
                        <div v-else-if="typeOfBind == 5" class="form-row">
                            <button @click="setBind(3)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-1" type="submit">Связать счет</button>
                            <input list="macs" class="form-control form-control-sm mt-3" v-filter="'[0-9a-fA-F\:\.]'" v-model="mac.selected" maxlength="23">
                            <datalist id="macs">
                                <option v-for="mc in mac.list">{{ mc }}</option>
                            </datalist>
                            <button @click="insOnlyMac()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">Связать mac</button>
                        </div>
                        <div v-else-if="typeOfBind == 7 || typeOfBind == 9" class="form-row">
                            <input list="macs" class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23">
                            <datalist id="macs">
                                <option v-for="mc in mac.list">{{ mc }}</option>
                            </datalist>
                            <button v-if="typeOfBind == 7" @click="setBind(7)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">Перепривязать mac</button>
                            <button v-if="typeOfBind == 9" @click="setBind(9)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">Связать mac</button>
                        </div>
                        <div v-else-if="typeOfBind == null"></div>
                        <div v-else>
                            <div class="alert alert-warning mt-2" role="alert">Выбраная учетная запись не нуждается в привязке</div>
                        </div>

                  </div>
                  <div v-else>
                        <div class="alert alert-warning mt-2" role="alert">
                            Не найдено не одной учетной записи, доступной для привязки.
                        </div>
                  </div>
                </div>
                <div v-if="result" class="mt-3 response-block">
                    <div v-if="result.isError">
                        <div v-html="result.text.slice(0,120)" class="alert alert-danger" role="alert"></div>
                    </div>
                    <div v-else>
                        <div v-if="typeOfBind == 1 && result.code == 200 " class="alert alert-success" role="alert">
                        Счет {{ sample }} успешно привязан к порту {{ data.portNumber}} ({{ data.deviceParams.IP_ADDRESS }})
                        </div>
                        <div v-if="typeOfBind != 1 && result.InfoMessage" class="alert alert-success" role="alert" v-html="result.InfoMessage"></div>
                        <div v-if="typeOfBind != 1 && result.Data">
                            <div v-if="result.Data.ip" class="small-text">{{ result.Data.ip }}<span class="inscription"> Ip</span></div>
                            <div v-if="result.Data.gateway" class="small-text">{{ result.Data.gateway }}<span class="inscription"> Шлюз</span></div>
                            <div v-if="result.Data.mask" class="small-text">{{ result.Data.mask }}<span class="inscription"> Маска</span></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div v-if="loading" class="progress mt-2">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
        </div>
    </div>
			`;
		};
		
		function myAccount_template(){
			document.getElementById('account-template').innerHTML=`
			  <div v-if="data">
				  <div class="info-block account-info">
					<screen-header-el :border="data.PORT_NAME ? '' : 'none' ">
					  <template slot="title">лицевой счет</template>
					  <span class="led" :class="ledClass"></span>
					  {{ data.ACCOUNT }}
					  <template v-if="!isNaN(data.FLAT_NUMBER)" slot="info">кв. № {{ +data.FLAT_NUMBER }}</template>
					  <template slot="minor">{{ data.PORT_NAME ? data.MAC : computedAddress }}</template>
					</screen-header-el>
					<div v-if="account" class="name">
					  <i class="fas fa-user mr-1 icon user" style="height: 16px; width: 16px;"></i>
					  {{ account.name }}
					  <a :href="'tel:' + account.phone">
						<i class="fas fa-phone-alt icon phone"></i>
					  </a>
					</div>
					<div v-show="data.PORT_NAME">
					  <div @click="toPort">
						<i class="fas fa-ethernet faded mr-1"></i>
						{{ data.PORT_NAME }}
						<i class="fa fa-chevron-right float-right"></i>
					  </div>
					  <div v-show="data.FIRST_DATE">
						{{ data.FIRST_DATE }}
						<span class="inscription">первый выход</span>
					  </div>
					  <div v-show="data.LAST_DATE">
						{{ data.LAST_DATE }}
						<span class="inscription">последний выход</span>
					  </div>
					  <div v-if="loading.account" class="progress">
						<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					  </div>
					</div>
				  </div>
				  <div v-if="hasSessions" class="info-block account-info">
					<div class="clearfix">
					  <span class="card-title">Сессии</span>
					  <button @click="refreshSessions" :disabled="loading.session > 0" class="btn btn-title float-right">
						<i class="fas fa-sync-alt"></i>
					  </button>
					  <button @click="sessionHelp" class="btn btn-title float-right">
						<i class="fas fa-info"></i>
					  </button>
					</div>
					<ul v-if="data.sessions" class="list-group list-group-flush">
					  <li v-for="(session, index) in data.sessions.online" class="list-group-item px-0">
						<session-el :session="session" :lock="loading.session > 0"></session-el>
					  </li>
					</ul>
					<div v-if="loading.session > 0" class="progress">
					  <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				  </div>

					<div class="info-block account-info">
					  <div @click="toDeviceEvents(data.ACCOUNT)" :disabled="deviceEventLoading">
						Недоступность
						<span class="float-right"><i class="fa fa-chevron-right media-middle"></i></span>
						<template v-if="hasActiveDeviceEvent">
						  <span class="float-right" style="margin: 0 10px;">
							<i class="fas fa-exclamation-triangle red"></i>
						  </span>
						  <span class="float-right small-text mt-1">{{ maxDeviceEventDuration }}</span>
						</template>
					  </div>
					  <div v-if="deviceEventLoading" class="progress">
						<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					  </div>
					</div>

				  <div class="info-block account-info">
					<a class="card-body collapse collapsed show info-block-title display nohover d-flex" data-toggle="collapse" data-target="#collapseServices" href="#collapseServices">
					  <div class="d-flex justify-content-between card-title-complex">
						<div>Услуги</div>
						<div v-if="data.account" class="body-hidden" :class="balance.minus ? 'text-danger' : 'text-black-50'">
						  <span v-show="balance.minus">-</span>
						  <span>{{ balance.balance }} ₽ </span>
						</div>
					  </div>
					  <div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div class="collapse" id="collapseServices">
					  <div v-if="data.account">
						<div :class="{'text-danger' : balance.minus}">
						  <span v-show="balance.minus">-</span>
						  <span>{{ balance.balance }} ₽ </span>
						  <span class="inscription">баланс</span>
						</div>
						<div> {{ balance.lastsum }} ₽ {{ balance.lastpaydate }} <span class="inscription">последний платеж</span></div>
					  </div>
					  <hr>
					  <ul v-if="data.account" class="list-group list-group-flush">
						<li v-for="vgroup in serviceList" class="list-group-item">
						  <div class="link">
							<div class="font-weight-bold">
							  {{ vgroup.serviceclassname }}
							  <span class="state" :class="stateClass(vgroup)">{{ vgroup.statusname }}</span>
							</div>
							<!--add this fragment-->
							<div>ID: {{ vgroup.vgid }}</div>
							<!--add this fragment-->
							<div>{{ vgroup.tarif }}</div>
							<passwd-el v-if="hasPassword(vgroup)" :service="vgroup" :billingid="account.billingid"></passwd-el>
							<button v-if="vgroup.available_for_activation" @click="activate(vgroup)" class="btn btn-primary btn-fill mt-2" type="submit">Активировать</button>
						  </div>
						</li>
					  </ul>
					</div>
					<div v-if="loading.service || loading.updateVgroups" class="progress">
					  <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				  </div>

				  <div class="info-block account-info">
					<a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseBlockHistory" href="#collapseBlockHistory">
					  <span>История блокировок</span>
					  <div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div class="collapse" id="collapseBlockHistory">
					  <div v-if="data.locks && data.locks.text" class="small-text">{{ data.locks.text }}</div>
					  <ul v-if="data.locks" class="list-group list-group-flush">
						<li v-for="row in data.locks.rows" class="list-group-item">
						  <div class="link">
						    <!--add this fragment-->
						    <div>ID: {{ row["vgid"] }}<span class="inscription"></span></div>
							<!--add this fragment-->
							<div>{{ row["timefrom"] }} - {{ row["timeto"] }}<span class="inscription"></span></div>
							<div>{{ row["vglogin"] }} ({{ row["agrmnum"] }})<span class="inscription"></span></div>
						    <div>{{ row["type"] }} (тип: {{row["blocktype"]}})<span class="inscription"></span></div>
						  </div>
						</li>
					  </ul>
					</div>
					<div v-if="loading.locks" class="progress">
					  <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				  </div>
				  <div class="info-block account-info">
					<a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapse-equipment" href="#collapse-equipment">
					  <span>Абонентское оборудование</span>
					  <div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div class="collapse" id="collapse-equipment">
					  <ul v-if="data && data.equipments" class="list-group list-group-flush">
						<li v-for="equipment in data.equipments" class="list-group-item">
						  <equipment-el :equipment="equipment" :key="equipment.id"></equipment-el>
						</li>
					  </ul>
					  <div v-if="!data.equipments || data.equipments.length == 0" class="text-muted">не найдено</div>
					</div>
					<div v-if="loading.equipments" class="progress">
					  <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				  </div>
			  </div>
			`;
		};
		
	};start();
		
}else{console.log(document.title)};

}());
