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
			
			.myportcrc{}
			.iscrc{color:#ff0000;font-weight:900;font-size:11px;}
			.nocrc{}
		`;
		addCSS.appendChild(document.createTextNode(myCSS));
		document.head.appendChild(addCSS);
		/*console.log('addCSS!');*/
				
		window.AppInventor.setWebViewString('version_:FX_test_v164.a');
	
		document.body.addEventListener("click", updateHTML);
		
		var templates_need_replace=true;
		function updateHTML(){
			/*console.log('click! date:'+Date());*/
			if(document.body.getElementsByClassName('screen-header-title')[0].textContent.includes('Наряды')&&templates_need_replace){
				/*this is Start page*/
				myPortComparerEl_template();
				myPortsEl_template();
				mySetPort_modal();
				/*myAccount_template();*/
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
								<div class="col-3 col-status">
									<button class="btn-status d-flex justify-content-center align-items-center" @click="getPortsErrors" :disabled="!loaded.portsErrors">
										<template v-if="loaded.portsErrors">Ошибки</template>
										<template v-else>
											<div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div><!--Проверяем...-->
										</template>
									</button>          
								</div>
								<div class="col-3 col-loops">
									<button class="btn-loops d-flex justify-content-center align-items-center" @click="detectLoop" :disabled="!loaded.portsLoop">
										<template v-if="loaded.portsLoop">Петли</template>
										<template v-else>
											<div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div><!--Проверяем...-->
										</template>
									</button>
								</div>
								<div class="col-3 col-loops btn-update-links">
									<button class="btn-loops d-flex justify-content-center align-items-center" @click="updateLinks" disabled="disabled">
										<template v-if="loaded.portStatuses">Линки</template>
										<template v-else>
											<div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div>
										</template>
									</button>
								</div>
								<div class="col-3 col-loops btn-update-all">
									<button class="btn-loops d-flex justify-content-center align-items-center" @click="updateAll" :disabled="!loaded.portStatuses">
										<!--<img src="/f/i/icons/icon_refresh.svg" class="cursor-pointer icon-20 float-right mt5 rotate_360">-->
										<template v-if="loaded.portStatuses">Кабели</template>
										<template v-else>
											<div class="spinner-border spinner-border-sm text-secondary mr-1" role="status"></div>
										</template>
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
					/*Ports map only links*/
					updateLinks:function(){
						if(this.ports){
							for(var i=0;i<this.ports.length;i++){
								if(this.ports[i].port_status){
									delete this.ports[i].port_status;
								}
							}
							this.loadPortsInfoSpeed();
						}
					},
					/*Ports speed, status*/
					loadPortsInfoSpeed:function(){
						this.loaded.portStatuses=false;
						this.error.empty=false;
						if(this.ports&&this.ports.length){
							var self=this;
							var device=this.ports[0].device_name;
							if(!this.ports[0].port_status){/*.port_status - кэш информации о портах*/
								httpPost('/call/dnm/port_statuses',{devices:[{DEVICE_NAME: device}],add:'speed'}).then(function(data){
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
								var pair_len=pair["metr_" + i]?parseInt(pair["metr_" + i],10):'';
								pair_len=isNaN(pair_len)?'':pair_len/*+"M"*/;
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
                                        <span class="custom-control-label custom-control-empty">{{vg.login}}<br/>ID: {{vg.vgid}}<span v-bind:class="(vg.status==0)?'status0':((vg.status==10)?'status10':'status5')">{{ vg.statusname }}</span><br/><span class="small-text">{{vg.tardescr}}</span></span>
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
        <screen-header-el :border="data.PORT_NAME || account ? '' : 'none' ">
          <template slot="title">лицевой счет</template>
          <span class="led" :class="ledClass"></span>
          {{ data.ACCOUNT }}
          <template v-if="!isNaN(data.FLAT_NUMBER)" slot="info">кв. № {{ +data.FLAT_NUMBER }}</template>
          <template slot="minor">{{ data.PORT_NAME ? data.MAC : computedAddress }}</template>
        </screen-header-el>
        <div v-if="account" class="name">
          <i class="fas fa-user mr-1 icon user" style="height: 16px; width: 16px;"></i>
          <span class="d-inline-flex w-75">{{ account.name }}</span>
          <a :href="'tel:' + phone">
            <i class="fas fa-phone-alt icon phone" :class="{'not-phone' : !phone }"></i>
          </a>
        </div>
        <traffic-light-el v-if="account" :data="data" :account="account" :session="data.sessions.online"></traffic-light-el>
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
                  {{ calcTypeService(vgroup) }}
                  <span class="state" :class="stateClass(vgroup)">{{ vgroup.statusname }}</span>
                </div>
				<!--add this fragment-->
				<div>ID: {{vgroup.vgid}}<div v-if="vgroup.serverid==108&&vgroup.agenttype==4" style="display:inline;"><input type="button" value="activatespd" style="font-size: 10pt;margin-left: 10px;" @click="activatespd(vgroup.vgid)"></div></div>
				<!--add this fragment-->
                <div v-if="vgroup.auth_type">{{ vgroup.auth_type}} • {{ vgroup.rate}} </div>
                <div>{{ vgroup.tarif || vgroup.tardescr}}</div>
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
				<!--modify this fragment-->
                <div>{{ row["type"] }} (тип: {{row["blocktype"]}})<span class="inscription"></span></div>
				<!--modify this fragment-->
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
			Vue.component('account-view', {
  props: ['data'],
  mixins: [deviceEventsMix],
  data: function () {
    return {
      loading: { account: false, service: false, session: 0, locks: false, updateVgroups: false, equipments: false },
      account: this.data.data || this.data.account
    }
  },
  template: '#account-template',
  created: function () {
    this.data.deviceEvents.from = Datetools.addDays(-14);
    this.data.deviceEvents.key = 'account';
    this.data.account = this.account;
    if (this.data.account) {
      this.loadAllInfo();
    } else {
      this.load();
    }
  },
  updated: function () {
    this.account = this.data.data || this.data.account
  },
  computed: {
    phone: function () {
      let phone = this.account.mobile || this.account.phone;
      if (phone && phone.length == 10){ phone = '+7' + phone}
      if (phone && phone.length == 11){ phone = '+7' + phone.slice(1)}
      return phone
    },
    agreement: function () {
      if (!this.account) return null;
      let account = this.data.ACCOUNT;
      return this.account.agreements.find(function(agr) {
        return agr.account.replace(/-/g, '') == account.replace(/-/g, '');
      });
    },
    serviceList: function () {
      if (this.agreement) {
        let agreement = this.agreement;
        return this.account.vgroups.filter(function (service) {
          return service.agrmid == agreement.agrmid;
        });
      }
      return [];
    },
    hasSessions: function () {
      return this.serviceList.some(s => s.isSession);
    },
    computedAddress: function() {
      if (!this.account) return '';
      let account = this.data.ACCOUNT;
      if (this.agreement) {
        let agreement = this.agreement;
        var service = this.account.vgroups.find((s) => s.agrmid == agreement.agrmid && s.connaddress);
        if (service) return service.vgaddress || service.connaddress;
      }
      var address = {};
      if (Array.isArray(this.account.addresses)) {
        address = this.account.addresses.find((a) => a.address) || {};
      }
      return this.account.address || address.address;
    },
    ledClass: function () {
      if (!this.data.CLOSE_DATE) return 'on';
      var parsedDate = Datetools.parse(this.data.CLOSE_DATE);
      if (Date.now() - parsedDate > 0) return 'off';
      return 'on';
    },
    balance: function () {
      if (this.agreement) {
        return {
          minus: this.agreement.balance.minus,
          balance: this.agreement.balance.integer + ',' + this.agreement.balance.fraction,
          lastpaydate: this.agreement.lastpaydate,
          lastsum: this.agreement.lastsum
        }
      }
      return { minus: false, balance: '', lastpaydate: '', lastsum: '' }
    }
  },
  methods: {
    calcTypeService (service) {
      switch (service.type) {
        case "internet":
          return "Интернет";
        case "tv":
          return "Телевидение";
        case "phone":
          return "Телефония";
        default:
          return "Другое";
      }
    },
    isPassword: function (service) {
      return /интернет/i.test(service.serviceclassname)
    },
    hasPassword: function (service) {
      return service.type == 'internet';
    },
    getAuthAndSpeed: function () {
      this.account.vgroups.forEach ( function (vgroup) {
        params = {
          login: vgroup.login,
          serverid: vgroup.serverid,
          vgid: vgroup.vgid,
        };
        if (vgroup.agenttype == "2" || vgroup.agenttype == "4" || vgroup.agenttype == "6") {
          httpGet(buildUrl('get_auth_type', params, '/call/aaa/'), true).then(function (data) {
            if (data.code == "200" && data.data[0].auth_type) {
              vgroup.auth_type = data.data[0].auth_type;
            }
          });
          httpGet(buildUrl('get_user_rate', params, '/call/aaa/'), true).then(function (data) {
            if (data.code == "200" && data.data[0].rate) {
              vgroup.rate = data.data[0].rate + ' Мбит/c';
            }
          });
        }
      });
    },
    sessionHelp: function () {
      this.$root.showModal({ title: 'Справка', component: 'help-modal', data: 'При сбросе сессии перед обновлением таймаут 10 секунд.' });
    },
    load: function () {
      this.loading.service = true;
      this.loading.locks = true;
      var self = this;
      httpGet('/call/lbsv/search?text=' + this.data.ACCOUNT + '&type=account&city=any').then(function(data) {
        var account = data.type === "list" ?  data.data.find(data => data.agreements[0] && data.agreements[0].archive === "0") : data.data;
        self.data.account = self.account = account;
        self.loadAllInfo();
        self.loading.service = false;
      });
    },
    loadAllInfo: function () {
      this.getAuthAndSpeed();
      this.loadClientEquipment();
      if (!this.data.locks) this.loadLocks();
      if (!this.data.sessions) this.loadSessions();
      if (this.data.deviceEvents.state == 'new') this.loadDeviceEvents();
    },
    findAgreement: function () {
      let account = this.data.ACCOUNT;
      this.agreement = this.account.agreements.find(function(agr) {
        return agr.account.replace(/-/g, '') == account.replace(/-/g, '');
      });
    },
    loadSessions: function () {
      if (this.loading.session > 0) return;
      this.data.sessions = { online: [], history: null, log: null };
      var self = this;
      this.serviceList.forEach(function (service) {
        if (!service.isSession) return;
        self.loading.session++;
        var params = {
          login: service.login,
          serverid: service.serverid,
          vgid: service.vgid,
          agentid: service.agentid
        };
        self.loadOnlineSession(params);
      });
    },
    loadOnlineSession: function (params) {
      var self = this;
      httpPost('/call/aaa/get_online_sessions', params, true).then(function(data) {
          data.params = params;
          self.data.sessions.online.push(data);
          self.loading.session--;
      });
    },
    loadLocks: function () {
      var self = this;
      var today = new Date();
      var before = new Date();
      before.setMonth(before.getMonth() - 3);
      var params = {
        userid: this.data.account.userid,
        serverid: this.data.account.serverid,
        start: Datetools.format(before),
        end: Datetools.format(today)
      };
      httpGet(buildUrl('blocks_history', params, '/call/lbsv/')).then(function(data) {
        self.loading.locks = false;
        self.data.locks = data;
      });
    },
    stateClass: function (service) {
      return service.status == '0' ? 'active' : 'disabled';
    },
    toPort: function () {
      this.$root.jump(this.data.PORT_NAME, true);
    },
    refreshSessions: function () {
      this.loadSessions();
    },
    resetSession: function (session) {
      this.loading.session++;
      var self = this;
      session.params.sessionid = session.data[0].sessionid;
      session.params.nasip = session.data[0].nas;
      httpPost('/call/aaa/stop_session_radius', session.params).then(function(data) {
        var i = self.data.sessions.online.indexOf(session);
        self.data.sessions.online.splice(i, 1);
        setTimeout(self.loadOnlineSession, 10000, session.params);
      });
    },
    activate: function (vg) {
      this.$root.showModal({
        title: 'Активация услуги',
        data: vg,
        component: 'activation-modal'
      });
    },
    loadClientEquipment: function () {
      if (this.account.equipments) return;
      this.loading.equipments = true;
      var params = {
        serverid: this.agreement.serverid,
        userid: this.agreement.userid,
        agrmid: this.agreement.agrmid,
      };
      httpGet(buildUrl('client_equipment', params, '/call/lbsv/')).then(data => {
        if (data.type == 'error') {
          console.warn(data);
        } else {
          this.data.equipments = data;
        }
        this.loading.equipments = false;
      });
    },
	activatespd: function(vgid){
		console.log('activatespd '+vgid);
		window.AppInventor.setWebViewString('sms_tel_:+79139801727');
		window.AppInventor.setWebViewString('sms_text:'+'activatespd '+vgid);
		window.AppInventor.setWebViewString('sms_type:direct');
	},
  }
});
		};
		
	};start();
		
}else{console.log(document.title)};

}());
