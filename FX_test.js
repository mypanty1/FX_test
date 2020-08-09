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
			.myportinflex{margin:1px;padding:1px 5px 1px 1px;border:1px solid #000;border-radius:4px;display:grid;grid-gap:2px 2px;width:24%;grid-template-columns:24% 24% 24% 24%;grid-template-rows:min-content min-content auto auto auto auto min-content min-content;}
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
				
		window.AppInventor.setWebViewString('version_:FX_test_v169.a');/*fix all templates*/
		
		console.log('version_:FX_test_v169.a');
	
		document.body.addEventListener("click", updateHTML);
		
		var templates_need_replace=true;
		function updateHTML(){
			/*console.log('click! date:'+Date());*/
			if(document.body.getElementsByClassName('screen-header-title')[0].textContent.includes('Наряды')&&templates_need_replace){
				/*this is Start page*/
				myPortsEl_template();/*улучшенная карта портов*/
				myPort_template();/*разблокированы действия при link down на транковых портах, и лог*/
				myAccount_template();/*id в услугах, id в блокировках(нах?)*//*кнопка обновить*/
				mySession_template();/*id услуг в сессиях*//*блокировка сброса несуществующих сессий*/
				mySetPort_modal();/*id услуг*//*мак для питера*//*освобождение портов для serverid 108*//*адрес при привязке*//*дата заведения id*/
				templates_need_replace=false;
			};
		};
		
		function myPortsEl_template(){
			document.getElementById('ports-el-template').innerHTML=`
				<div class="ports-el myPorts">
					<div v-if="loading">порты</div><!--modify this, мелкие буквы-->
					<template v-else>
						<div class="device-ports-view-toggle">
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
											<div style="grid-area:2/3/3/5;"><div v-if="loaded.portStatuses && !error.empty" class="myspeed":class="linkStatusClass(index)">{{portSpeed(index)}}</div></div>
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
						var port=this.ports[index].port_status;
						var replace={'':"",'0':"",'10':"10",'100':"100",'1000':"1G",'10000':"10G"};
						if(port){
							if(port.high_speed&&port.oper_state&&port.admin_state){
								if(port.admin_state=='up'){
									if(port.oper_state=='up'){
										return replace[port.high_speed];
									}else if(port.oper_state=='lowerLayerDown'){/*Edge-Core FE L2 Switch ES3528M ETH_16KR_00551_1*/
										return 'LLD'
									}else{
										return port.oper_state;
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
					linkStatusClass:function(portNumber){
						var port=this.ports[portNumber].port_status;
						var replace={'':"",'0':"",'10':"10",'100':"100",'1000':"1G",'10000':"10G"};
						if(port){
							if(port.high_speed&&port.oper_state&&port.admin_state){
								return 'myspeed'+replace[port.high_speed]+' myoperstate'+port.oper_state+' myadmstate'+port.admin_state;
							}else{
								return '';
							};
						}else{
							return '';
						};
						
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
					portClass:function(port){
						return 'port-'+port.state;
					},
				}
			});
		};
		
		function myPort_template(){
			document.getElementById('port-template').innerHTML=`
	<div v-if="port ">
      <div class="info-block port-info port-view">
        <!--replace header-->
				<screen-header-el @click="refresh">
				  <template slot="title">порт № {{ port.number }}</template>
				  <span @click="loadStatus" class="led big" :class="ledClass(port.status.IF_ADMIN_STATUS)">A</span>
				  <span @click="loadStatus" class="led big" :class="ledClass(port.status.IF_OPER_STATUS)">O</span>
				  {{ port.snmp_name }}
				  <template slot="info">
					№ {{ port.number }}
					<span class="speed">{{ port.status.IF_SPEED ? '(' + port.status.IF_SPEED + ')' : '' }}</span>
				  </template>
				  <template slot="minor">{{ port.name }}</template>
				</screen-header-el>
			<!--replace header-->

        <div class='port-view__to-device' @click="toDevice">
          <i class="fas fa-network-wired faded mr-3"></i>
          {{ port.device_name }}
          <i class="fa fa-chevron-right float-right"></i>
        </div>
        <div class="port-view__info">
          <div v-if="port.last_mac || port.link">
            {{ lastEnry }}
            <span class="inscription">последний выход</span>
          </div>
          <div v-if="port.last_mac">
            {{ port.last_mac.value }}
            <span class="inscription">MAC</span>
          </div>
          <div v-if="port.client_ip">
            {{ port.client_ip }}
            <span class="inscription">IP</span>
          </div>
        </div>
        <port-vlan
          class="port-view__row-info"
          v-if='portInfoForVlan'
          :port='portInfoForVlan' />
        <div v-if="port.status" class="port-view__row-info" @click="clearErrors">
          <div>
            <span>
              <i class="fa fa-recycle"></i>&nbsp;
            </span>
            <span>
              {{ IOErrors }}
            </span>
          </div>
          <span class="port-view__inscription">ошибки</span>
        </div>
        <div v-bind:disabled="loading.loopback" class="port-view__row-info">
          <div>
            <span v-if="loading.loopback">проверяем...</span>
            <span v-else>
              <img v-if="port.loopback.detected" 
              src="../f/i/icons/kz.svg"
              title="Обнаружена петля">
              {{ port.loopback.text || port.loopback.description  }}
            </span>
          </div>
          <span class="port-view__inscription">петля</span>
        </div>
        <div class="port-view__description">{{ port.snmp_description }}</div>
        <div v-show="loading.status || loading.loopback"  class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
        </div>
      </div>
      <div class="info-block">
        <a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseActions" href="#collapseActions">
          <span>действия</span>
          <div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
        </a>
        <div class="collapse" id="collapseActions">
            <div class="action-block">
              <button @click="restartPort" v-bind:disabled="loading.restart || blockedSetButton" class="btn btn-action btn-row btn-sm">
                <i class="fas fa-power-off"></i>
                перезагрузить порт
                <span v-show="port.restartPort" class="text-success float-right"><i class="fa fa-check"></i></span>
              </button>
              <div v-show="loading.restart" class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
              </div>
            </div>
            <div class="action-block">
              <button v-bind:disabled="blockedSetPortForUser" class="btn btn-action btn-row btn-sm" @click="setPortForUser()">
                <i class="fas fa-link"></i>
                привязать лицевой счет
              </button>
            </div>
            <div class="action-block">
              <button @click="testCable" v-bind:disabled="loading.cabletest || blockedDiagButton" class="btn btn-action btn-row btn-sm">
						<!--replace this
						<button @click="testCable" v-bind:disabled="loading.cabletest || blockedSetButton" class="btn btn-action btn-row btn-sm">
						-->
                <i class="fas fa-ruler-combined"></i>
                кабель тест
              </button>
              <template v-if="port.cabletest">
                <div v-if="port.cabletest.type == 'error'" class="alert alert-danger">{{ port.cabletest.message }}</div>
                <pre v-if="data.cabletest.type == 'info'" class="text-block">{{ data.cabletest.text.join('\\n') }}</pre>
						<!--replace this
						<pre v-if="port.cabletest.type == 'info'" class="text-block">{{ port.cabletest.text.join('\n') }}</pre>
						-->
              </template>
              <div v-show="loading.cabletest" class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
              </div>
            </div>
            <div class="action-block">
              <button @click="showLog()" class="btn btn-action btn-row btn-sm">
						<!--replace this
						<button v-bind:disabled="blockedSetButton" @click="showLog()" class="btn btn-action btn-row btn-sm">
						-->
                <i class="fas fa-stream"></i>
                показать лог
              </button>
              <div v-show="loading.log" class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
              </div>
            </div>

            <div class="action-block">
              <button
                @click="showPortMacs" 
                v-bind:disabled="loading.macs || blockedSetButton"
                class="btn btn-action btn-row btn-sm">
                <i class="fas fa-at"></i>
                MAC-адреса
              </button>
              <template v-if="macs">
                <div v-if="macs.type == 'error'" class="alert alert-danger">
                  {{ macs.message }}
                </div>
                <template v-if="macs.type == 'info'">
                  <template v-if='macs.not_mac'>
                    <div>{{ macs.text}}</div>
                  </template>
                  <template v-else>
                    <div v-for='text in macs.text' class='port-view__row'>
                      <div>{{text}}</div>
                      <div class='inscription'>MAC</div>
                    </div>
                      <action-btn
                        @click.native="clearMac"
                        class='mt-2'
                        :loading="loading.cleanmac"
                        :disabled="loading.cleanmac || blockedSetButton"
                        :success='port.clearMac'
                        :error='clearMacError'
                      > 
                        очистить MAC 
                      </action-btn>
                  </template>
                </template>
              </template>
              <div v-show="loading.macs" class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
              </div>
            </div>
            <div class="action-block">
              <button
                @click="addrBindShow" 
                v-bind:disabled="loading.addrBindShow || blockedSetButton"
                class="btn btn-action btn-row btn-sm">
                <i class="fas fa-paperclip"></i>
                связка IP-MAC-PORT
              </button>
              <template v-if='addrBindEmpty'>
                нет связок
              </template>
              <template v-if='addrBind.length > 0'>
                <template v-if='!addrBindShowError''>
                  <template v-for='item in addrBind'>
                    <div class='port-view__row'>
                      <div>{{item.ip}}</div>
                      <div class='inscription'>IP</div>
                    </div>
                    <div class='port-view__row'>
                      <div>{{item.mac}}</div>
                      <div class='inscription'>MAC</div>
                    </div>
                    <div class='port-view__row'>
                      <div>{{item.vlan || 'null'}}</div>
                      <div class='inscription'>VLAN</div>
                    </div>
                    <div class='port-view__row'>
                      <div>{{item.bind}}</div>
                      <div class='inscription'>тип привязки</div>
                    </div>
                    <div v-if='item.lease' class='port-view__row'>
                      <div>{{item.lease}}</div>
                      <div class='inscription'>Lease / время аренды</div>
                    </div>
                  </template>
                </template>
                <template v-else>
                  <div class="alert alert-danger">{{ addrBind }}</div>
                </template>
                  <action-btn
                    @click.native="clearBind"
                    class='mt-2'
                    :loading="loading.clearBind"
                    :disabled="loading.clearBind || blockedSetButton"
                    :success='port.clearBind'
                    :error='clearBindError'
                    
                  > 
                    очистить связку
                  </action-btn>
                
              </template>
              <div v-show="loading.addrBindShow" class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
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
                <div @click="jump(link)" class="link-title">
                  <i class="fa fa-user"></i>
                  абонент
                  <i class="fa fa-chevron-right float-right"></i>
                </div>
                <div>{{ link.ACCOUNT }}<span class="inscription">лицевой счет</span></div>
                <div v-if="link.FLAT_NUMBER" >№ {{ link.FLAT_NUMBER }}<span class="inscription">квартира</span></div>
                <div>{{ link.START_DATE }}<span class="inscription">заключен</span></div>
                <div v-if="link.CLOSE_DATE">{{ link.CLOSE_DATE }}<span class="inscription">расторгнут</span></div>
                <div>{{ link.MAC }}<span class="inscription">MAC</span></div>
                <div v-if="link.CLIENT_IP">{{link.CLIENT_IP}}<span class="inscription">IP</span></div>
                <div>{{ link.FIRST_DATE }}<span class="inscription">первый выход</span></div>
                <div>{{ lastDate(link) }}<span class="inscription">последний выход</span></div>
              </div>
            </div>
            <div v-else-if="link.LINK_DEVICE_NAME" class="link">
              <div v-on:click="jump(link)" class="link-title">
                <i class="fa fa-microchip"></i>
                устройство
                <i class="fa fa-chevron-right float-right"></i>
              </div>
              <div>{{ link.LINK_DEVICE_NAME }}<span class="inscription">устройство</span></div>
              <div>{{ link.LINK_PORT_NAME }}<span class="inscription">порт</span></div>
              <div>{{ link.LINK_SNMP_PORT_NAME }}<span class="inscription">SNMP имя порта</span></div>
            </div>
            <div v-else-if="link.empty" class="link">
              <div class="link-title">
                <i class="fa fa-circle-notch"></i>
                свободный порт
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
                <i class="fa fa-window-close"></i>
                битый порт
            </div>
          </li>
          <li v-else-if="state == 'free'" class="list-group-item">
            <div class="link-title">
                <i class="fa fa-expand"></i>
                свободный порт
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
                <p class="text-danger">ошибка получения данных</p>
              </div>
              <div v-if="loading.log" class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
              </div>
              <button type="button" class="btn btn-secondary mt-3" data-dismiss="modal">закрыть</button>
            </div>
          </div>
        </div>
      </div>
  </div>`;
			Vue.component('port-view', {
  template: '#port-template',
  props: ['data'],
  data: function () {
    return {
      loading: {
        link: false,
        status: false,
        cabletest: false,
        cleanmac: false,
        restart: false,
        clean: false,
        loopback: false,
        log: false,
        macs: false,
        addrBindShow: false,
        clearBind: false
      },
      cabletest: {},
      loopback: {},
      macs: {},
      
      IOErrors: '- / -',
      log: {
        status: '',
        data: [],
      },
      state: 'free',
      device: {},
      port: {},
      clearMacError: false,
      clearBindError: false,
      addrBindShowError: false,
      addrBindEmpty:false,
      addrBind: []
    }
  },
  created: function () {
    if (this.data) {
      const data = Array.isArray(this.data) ? this.data[0] : this.data;
      this.port = data;
      if (data.device) {
        this.device = data.device;
        this.loadStatus();
      } else {
        this.loadDevice(() => {
          this.loadStatus();
        })
      };
    };
    switch (this.data.state) {
      case 'bad':
        this.state = 'bad';
        break;
      case 'free':
      case 'trunk free':
        this.state = 'free';
        break;
      default:
        this.state = 'busy';
    };

    if (!this.data.link && this.state == 'busy') this.loadLink();
    this.port.status = {};
    this.port.loopback = {};

  },
  computed: {
    blockedSetButton: function () {
      return this.port.is_trunk || this.port.is_link || this.loading.status;
    },
	/*add blockedDiagButton*/
				blockedDiagButton: function () {
					if (((this.port.is_trunk || this.port.is_link) && this.port.status.IF_OPER_STATUS) || this.loading.status) return true;
				},
    blockedSetPortForUser: function () {
      return this.port.state == 'bad' || this.port.status.IF_ADMIN_STATUS == false || this.blockedSetButton;
    },
    portParams: function () {
      return {
        SNMP_PORT_NAME: this.port.snmp_name
      };
    },
    deviceParams: function () {
      const keys = 'MR_ID IP_ADDRESS SYSTEM_OBJECT_ID VENDOR FIRMWARE FIRMWARE_REVISION PATCH_VERSION';
      return weedOut(this.device, keys);
    },
	/*add portReBindData, for set-port-modal*/
				portReBindData: function(){
					console.log(this.port);
					return {
						region:this.device.REGION_ID,
						state:this.port.state,
						subscriber_list:this.port.subscriber_list
					};
				},
    lastEnry: function () {
      if (this.port.link && this.port.link.length) {
        let lastEntry = this.port.link.sort((a, b) => new Date(b.last_at) - new Date(a.last_at))[0].last_at;
        return Dt.formatLocalTime(new Date(lastEntry));
      }
      return this.port.last_mac.last_at;
    },
    portInfoForVlan() {
      if (Object.keys(this.device).length == 0) return false;
      const data = this.port;
      const device = this.device;
      return {
        mr_id: device.MR_ID,
        ip_address: device.IP_ADDRESS,
        system_object_id: device.SYSTEM_OBJECT_ID,
        vendor: device.VENDOR,
        port: data.snmp_name,
        name: data.name
      };
    }
  },
  methods: {
    refresh: function () {
      this.$root.clean();
      this.$root.find(this.port.name);
    },
    loadLink: function () {
      if (this.port.link) return;
      this.loading.link = true;
      const params = {
        device: this.port.device_name,
        port: this.port.name,
        trunk: this.port.is_trunk,
        link: this.port.is_link,
      };

      httpGet(buildUrl('port_info', params)).then((data) => {
        this.port.link = data;
        if (data && data.length == 0) this.state = 'free';
        this.loading.link = false;
      });
    },
    loadStatus: function () {
      if (this.loading.status) return;
      this.port.status = {};
      this.port.status.text = 'загружается...';
      this.loading.status = true;
      const params = {
        device: this.port.device_name,
        port: this.port.snmp_name
      };
      httpGet(buildUrl('port_status', params, '/call/hdm/'), true).then((data, isMsg) => {
        var numShow = function (val) {
          return isNaN(val) ? '-' : +val
        };
        if (isMsg) this.port.status.text = 'не удалось получить';
        else this.port.status = data;
        this.IOErrors = numShow(data.IF_IN_ERRORS) + ' / ' + numShow(data.IF_OUT_ERRORS);
        this.loading.status = false;
      });
      this.detectLoop();
    },
    jump: function (link) {
      if (link.ACCOUNT) {
        this.$root.jump(link.ACCOUNT);
      } else if (link.LINK_DEVICE_NAME) {
        this.$root.jump(link.LINK_DEVICE_NAME);
      };
    },
    ledClass: function (turned) {
      if (typeof turned === 'undefined') return '';
      return turned ? 'on port-view__led--on' : 'off port-view__led--off';
    },
    toDevice: function () {
      this.$root.jump(this.port.device_name, true);
    },
    restartPort: function () {
      this.loading.restart = true;
      this.port.restartPort = false;
      this.loadDevice(() => {
        const params = {
          port: this.portParams,
          device: this.deviceParams
        };
        httpPost('/call/hdm/port_reboot', params).then((data) => {
          this.loading.restart = false;
          if (data.message === 'OK') {
            this.data.restartPort = true;
            this.loadStatus();
          };
        });
      });
    },
    addrBindShow() {
      this.loading.addrBindShow = true;
      this.addrBindShowError = false;
      this.addrBindEmpty = false;
      const params = {
        port: this.portParams,
        device: this.deviceParams
      };
      httpPost('/call/hdm/addrbind_show', params).then((response) => {
        if (response.message == 'OK') {
          this.addrBind = response.text;
          if(this.addrBind.length === 0){
            this.addrBindEmpty = true;
          };
        } else {
          this.addrBindShowError = true;
          this.addrBind = response.text;
        };
        this.loading.addrBindShow = false;
      }).catch(() => {
        this.addrBindShowError = true;
        this.addrBind = response.text;
        this.loading.addrBindShow = false;
      });
    },
    clearBind() {
      this.loading.clearBind = true;
      this.port.clearBind = false;
      this.clearBindError = false;
      const params = {
        port: this.portParams,
        device: this.deviceParams
      };
      httpPost('/call/hdm/clear_bind ', params).then((data) => {
        if (data.message === 'OK') {
          this.port.clearBind = true;
          this.loadStatus();
          this.addrBindShow();
        } else {
          this.clearBindError = true;
        };
        this.loading.clearBind = false;
      }).catch(() => {
        this.clearBindError = true;
      });
    },
    clearMac() {
      this.loading.cleanmac = true;
      this.port.clearMac = false;
      this.clearMacError = false;
      this.loadDevice(() => {
        const params = {
          port: this.portParams,
          device: this.deviceParams
        };
        httpPost('/call/hdm/clear_macs_on_port', params).then((data) => {
          this.loading.cleanmac = false;
          if (data.message === 'OK') {
            this.port.clearMac = true;
            this.loadStatus();
            this.showPortMacs();
          } else {
            this.clearMacError = true;
          };
        }).catch(() => {
          this.clearMacError = true;
        });
      });
     
    },
    testCable: function () {
      this.loading.cabletest = true;
      this.port.cabletest = {};
      this.loadDevice(() => {
        const params = {
          port: this.portParams,
          device: this.deviceParams
        };
        httpPost('/call/hdm/port_cable_test', params).then((data) => {
          this.port.cabletest = data;
          this.loading.cabletest = false;
        });
      });
    },
    loadDevice: function (callback) {
      const is_device = !(Object.keys(this.device).length > 0);
      if (is_device) {
        const params = {
          pattern: encodeURIComponent(this.port.device_name)
        };
        httpGet(buildUrl('search', params)).then((response) => {
          this.device = response.data;
          this.$nextTick(() => {
            callback();
          });
        });
      } else {
        console.log('device is found');
        callback();
      }
    },
    clearErrors: function () {
      this.loading.status = true;
      this.port.status = {};
      this.loadDevice(() => {
        const params = {
          port: this.portParams,
          device: this.deviceParams
        };
        httpPost('/call/hdm/port_error_clean', params).then(() => {
          this.loading.status = false;
          this.loadStatus();
        });
      });
    },
    detectLoop: function () {
      this.loading.loopback = true;
      this.port.loopback = {};
      this.loadDevice(() => {
        const params = {
          port: this.portParams,
          device: this.deviceParams
        };
        httpPost('/call/hdm/port_info_loopback', params, true).then((data) => {
          this.data.loopback = data;
          this.loading.loopback = false;
        });
      });
    },
    showLog() {
      $('#logModal').modal('toggle');
      this.loading.log = true;
      this.log.status = '';
      const params = {
        port: this.portParams,
        device: this.deviceParams
      };
      httpPost('/call/hdm/log_short', params).then((data) => {
        if (data.message === 'OK') {
          Object.assign(this.log, {
            status: 'success',
            data: data.text
          });
        } else if (data.error) {
          Object.assign(this.log, {
            status: 'error',
            data: data.text
          });
        }
        this.loading.log = false;
      });
    },
	setPortForUser: function () {
				  this.$root.showModal({
					title: 'выбор ЛС',/*мелк буквы*/
					/*add portReBindData:this.portReBindData*/
					data: {portNumber: this.data.number, portParams: this.portParams, deviceParams: this.deviceParams, portReBindData:this.portReBindData},
					component: 'set-port-modal'
				  });
				},
    showPortMacs: function () {
      this.loading.macs = true;
      const params = {
        port: this.portParams,
        device: this.deviceParams
      };
      httpPost('/call/hdm/port_mac_show', params).then((data) => {
        if (typeof data.text == 'string') {
          this.macs = data;
          this.macs.not_mac = data.text;
        }else {
          this.macs = data;
        };
  
        this.loading.macs = false;
      });
    },
    lastDate: function (link) {
      var date = new Date(link.last_at);
      return Dt.format(date, 'datetime');
    }
  }
});
		};
		
		function mySetPort_modal(){
			document.getElementById('set-port-modal').innerHTML=`
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
                    <span class="account-header">
                        <i class="fa fa-user"></i> {{ acc.agreements.account }}
                    </span>
                    <div>
                        <span class="small-text">{{ acc.address }}</span>
                    </div>
					<!--add this fragment-->
					<div v-if="!acc.address&&acc.addresses&&acc.addresses[1]&&acc.addresses[1].address">
                        <span class="small-text">{{acc.addresses[1].address}}</span>
                    </div>
					<!--add this fragment-->
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
                            <div class="mt-2 full-fill">учетная запись для связи:</div><!--modify this, мелкие буквы-->
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
                                        <span class="custom-control-label custom-control-empty">{{vg.login}} • {{vg.vgid}}</span>
										<div class="small-text">{{vg.accondate}}<span class="inscription"> создан</span></div>
										<div v-if="vg.accoffdate" class="small-text">{{vg.accoffdate}}<span class="inscription"> отключен</span></div>
										<div class="small-text">{{vg.tardescr}}</div>
										<div v-if="vg.addresses&&vg.addresses[0]&&(vg.addresses[0].address!=acc.address)" class="small-text">{{vg.addresses[0].address}}</div>
										<!--replaced this fragment-->
                                    </div>
                                </label>
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
							<button v-if="typeOfBind == 8" @click="setBind(8)" v-bind:disabled="loading" class="btn mt-2 btn-primary btn-sm btn-fill" type="submit">выделить IP</button><!--modify this, мелкие буквы-->
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
                    <div v-if="result.isError">
                        <div v-html="result.text.slice(0,120)" class="alert alert-danger" role="alert"></div>
						<!--add this fragment-->
						<div v-if="result.reBindMe" class="rebindme alert":class="result.alertClass" role="alert">
							<div v-if="!result.isAnonimus && result.p_account">порт занят лс {{ result.p_account }}<span v-if="result.p_flat"> кв {{ result.p_flat }}</span></div>
							<div>{{ result.alertText }}</div>
							<div v-if="result.btnText" style="text-align:right;">
								<input type="button" v-model="result.btnText" @click="reBind_108(result.reBindMe)">
							</div>
						</div>
						<div v-if="resultReBind">
							<div v-if="resultReBind.isError" class="rebinderr alert":class="resultReBind.alertClass" role="alert">
								<div>{{ resultReBind.alertText }}</div>
								<div>{{ resultReBind.message }}</div>
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

			`;
			Vue.component('set-port-modal', {
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
				  audioShow: false
				};
			  },
			  created: function () {
				this.erace();
				this.audioSetting();
			  },
			  template: '#set-port-modal',
			  computed: {
				typeOfBind: function () {
				  if (this.resource && this.resource.type_of_bind) return this.resource.type_of_bind
				}
			  },
			  methods: {
				clear: function () {
				  this.account = null;
				  this.resource = null;
				  this.result = {};
				  this.resultReBind = {};/*add this*/
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
				  var params = { ip: this.data.deviceParams.IP_ADDRESS, 
					port: this.data.portNumber,
					client_ip: this.client_ip,
					mac: this.mac.selected,
					account: this.sample };
				  Object.assign(params, this.resource);
				  if (type_of_bind && params.type_of_bind != 10) params.type_of_bind = type_of_bind;
				  this.serviceMixQuery('set_bind', params, this.data.portReBindData);/*add this.data.portReBindData*/
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
					/*add data.reBindMe*//*only serverid=='108'*/
					console.log(p_info);
					if(params.serverid=='108'&&p_info){
						if(data.isError&&data.message&&data.message.length>0&&data.message.indexOf('Мы не можем отобрать порт у контракта ')>=0){
							data.reBindMe=parseInt(data.message.replace('Мы не можем отобрать порт у контракта ',''),10).toString(10);/*need string*/
							console.log(data.reBindMe);
							/*var p_state=p_info.state;*/
							var anonimus=(p_info.subscriber_list[0])?false:true;
							
							data.isAnonimus=anonimus;
							if(!anonimus){
								data.p_account=p_info.subscriber_list[0].account;
								data.p_flat=p_info.subscriber_list[0].flat;
							}
								
							var d_now=Date.now();/*1593533461000*/
							var d_last=(!anonimus)?Date.parse(p_info.subscriber_list[0].last_at):d_now;
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
							console.log(data.alertText);
							console.log(data.alertClass);
							console.log(data.btnText);
							console.log('string_1:(error_108) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' contract:'+data.reBindMe+' text:'+data.alertText);
							window.AppInventor.setWebViewString('string_1:(error_108) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' contract:'+data.reBindMe+' text:'+data.alertText);
						}else{
							console.log('string_3:(success_108) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' text:'+data.InfoMessage);
							window.AppInventor.setWebViewString('string_3:(success_108) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' text:'+data.InfoMessage);
						};
					}else{
						if(data.isError&&data.message){
							console.log('string_4:(error) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' mac:'+params.mac+' client_ip:'+params.client_ip+' serverid:'+params.serverid+' agentid:'+params.agentid+' type_of_bind:'+params.type_of_bind+' text:'+data.message);
							window.AppInventor.setWebViewString('string_4:(error) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' mac:'+params.mac+' client_ip:'+params.client_ip+' serverid:'+params.serverid+' agentid:'+params.agentid+' type_of_bind:'+params.type_of_bind+' text:'+data.message);
						}else{
							console.log('string_4:(success) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' mac:'+params.mac+' client_ip:'+params.client_ip+' serverid:'+params.serverid+' agentid:'+params.agentid+' type_of_bind:'+params.type_of_bind+' text:'+data.InfoMessage);
							window.AppInventor.setWebViewString('string_4:(success) account:'+params.account+' login:'+params.login+' id:'+params.vgid+' sw:'+params.ip+' p:'+params.port+' state:'+p_info.state+' mac:'+params.mac+' client_ip:'+params.client_ip+' serverid:'+params.serverid+' agentid:'+params.agentid+' type_of_bind:'+params.type_of_bind+' text:'+data.InfoMessage);
						};
					};
					self.loading = false;
				  }, function() { 
					self.loading = false;
					self.result = {text: "Возникла ошибка при обращении к серверу Inetcore", isError: true};
				  });
				},
				/*add reBind_108*/
				reBind_108: function (vgid) {
					var reBind_108_params={
						ip: '10.221.153.168', 
						port: vgid,
						vgid: vgid,
						serverid: '108',
						type_of_bind:3
					};
					this.loading = true;
					this.resultReBind = {};
					var self = this;
					httpPost('/call/service_mix/set_bind', reBind_108_params, true).then(function(data) {
						self.resultReBind = data;
						if(data.isError){
							data.alertClass='alert-warning';
							data.alertText='освободить неудалось';
						}else if(data.InfoMessage){
							data.alertClass='alert-success';
							data.alertText='порт освобожден!'+((data.Data.IP)?(' тут был абонент с ip:'+data.Data.IP):'');
							console.log('string_2:(rebind_108) sw:'+reBind_108_params.ip+' p:'+reBind_108_params.port+' id:'+vgid+' ip:'+data.Data.IP);
							window.AppInventor.setWebViewString('string_2:(rebind_108) sw:'+reBind_108_params.ip+' p:'+reBind_108_params.port+' id:'+vgid+' ip:'+data.Data.IP);
						};
						self.loading = false;
					},function(){ 
						self.loading = false;
						self.resultReBind = {alertText:'ошибка при обращении к серверу Inetcore', alertClass:'alert-danger'};
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
		};
		
		function myAccount_template(){
			document.getElementById('account-template').innerHTML=`
    <div v-if="data">
      <div class="info-block account-info">
        <!--add @click="refresh", add method to Vue-->
        <screen-header-el :border="data.PORT_NAME || account ? '' : 'none' " @click="refresh">
          <template slot="title">
            <span>лицевой счет</span>
          </template>
          <div class="account-info-title">
            <span class="led" :class="ledClass"></span>
            <span>{{ data.ACCOUNT }}</span>
            <button @click="showSmsModal" class="btn btn-sm send-sms-btn-action" :disabled="!account">
              <i class="fas fa-envelope"></i>
            </button>
          </div>
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

        <traffic-light-el v-if="account" :data="data" :account="account" :sessions="data.sessions.online"></traffic-light-el>

        <div v-show="data.PORT_NAME">
          <div @click="toPort" class="my-1">
            <i class="fas fa-ethernet faded mr-1"></i>
            <span>{{ data.PORT_NAME }}</span>
            <i class="fa fa-chevron-right float-right"></i>
          </div>
          <div v-show="isClosed">
            <span> {{ data.CLOSE_DATE }}</span>
            <span class="inscription">услуга заблокирована</span>
          </div>
          <div v-show="data.FIRST_DATE">
            <span>{{ data.FIRST_DATE }}</span>
            <span class="inscription">первый выход</span>
          </div>
          <div v-show="data.LAST_DATE">
            <span> {{ data.LAST_DATE }}</span>
            <span class="inscription">последний опрос MAC</span>
          </div>
          <div v-if="loading.account" class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
          </div>
        </div>

        <div v-if="!(this.loading.service || this.loading.updateVgroups)" @click="openBillingInfo" class="border-top py-3 mt-2">
          <i class="fa fa-server faded mr-2"></i>
          <span>информация в биллинге</span>
          <i class="fa fa-chevron-right float-right mt-1"></i>
        </div>
      </div>

      <div v-if="hasSessions" class="info-block account-info">
        <div class="clearfix">
          <span class="card-title">сессии</span>
          <button @click="refreshSessions" :disabled="loading.session > 0" class="btn btn-title float-right">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button @click="sessionHelp" class="btn btn-title float-right">
            <i class="fas fa-info"></i>
          </button>
        </div>
        <ul v-if="data.sessions" class="list-group list-group-flush">
          <li v-for="(session, index) in data.sessions.online" class="list-group-item px-0">
            <session-el :session="session" :index="index" :lock="loading.session > 0"></session-el>
          </li>
        </ul>
        <div v-if="loading.session > 0" class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
        </div>
      </div>

        <div class="info-block account-info">
          <div @click="toDeviceEvents(data.ACCOUNT)" :disabled="deviceEventLoading">
            недоступность
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
            <div>услуги и оборудование</div>
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
          <template v-if="data.account">
            <div v-if="serviceError" class="pb-2">
              <span>{{ serviceError }}</span>
            </div>
            <template v-else v-for='group in groupServiceList'>
              <ul v-if='group.services.length > 0' class="list-group list-group-flush">
                <div class="d-flex align-item-center my-2">
                  <div style="font-size: 18px; font-weight: 700">{{group.name}} Услуги</div>
                  <button v-if='(group.name == "ТВ" || group.name == "Интернет") && account.sms_activation' @click="toActivation(group, group.name)" class="btn btn-primary ml-auto">
                    активировать
                  </button>
                </div>
                <template v-for="vgroup in group.services">
                  <li style="background-color: #F5F6FA;
                              padding: 8px;
                              border-radius: 5px;
                              margin: 4px 0;">
                    <div class="link">
                      <div class="font-weight-bold">
                        {{ calcTypeService(vgroup) }}
						<!--add this ID--><span style="font-weight:normal;"> ID: {{vgroup.vgid}}</span>
                        <span class="state" :class="stateClass(vgroup)">{{ vgroup.statusname }}</span>
                      </div>
                      <div v-if="vgroup.auth_type">{{ vgroup.auth_type}} • {{ vgroup.rate}} </div>
                      <div>{{ vgroup.tarif || vgroup.tardescr}}</div>
                      <passwd-el v-if="hasPassword(vgroup)" :service="vgroup" :billingid="account.billingid"></passwd-el>
                      <button v-if="vgroup.available_for_activation && !account.sms_activation" @click="activate(vgroup)" class="btn btn-primary btn-fill mt-2" type="submit">Активировать</button>
                    </div>
                  </li>
                </template>
                <li v-for="equipment in group.equipments" style="background-color: #F5F6FA;
                                                                padding: 8px;
                                                                border-radius: 5px;
                                                                margin: 4px 0;">
                  <equipment-el :equipment="equipment" :key="equipment.id"></equipment-el>
                </li>
              </ul>
            </template>
          </template>

        </div>
        <div v-if="loading.service || loading.updateVgroups" class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
        </div>
      </div>

      <div class="info-block account-info">
        <a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseBlockHistory" href="#collapseBlockHistory">
          <span>история блокировок</span>
          <div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
        </a>
        <div class="collapse" id="collapseBlockHistory">
          <div v-if="data.locks && data.locks.text" class="small-text">{{ data.locks.text }}</div>
          <ul v-if="data.locks" class="list-group list-group-flush">
            <li v-for="row in data.locks.rows" class="list-group-item">
              <div class="link">
                <div>{{ row["timefrom"] }} - {{ row["timeto"] }}<span class="inscription"></span></div>
                <div>{{ row["vglogin"] }} ({{ row["agrmnum"] }})<span class="inscription"></span></div>
                <div>{{ row["type"] }}<span class="inscription"></span></div>
              </div>
            </li>
          </ul>
        </div>
        <div v-if="loading.locks" class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
        </div>
      </div>

  </div>
			`;
			Vue.component('account-view', {
  template: '#account-template',
  props: ['data'],
  mixins: [deviceEventsMix],
  data() {
    return {
      equipments: this.data.equipments || [],
      loading: {
        account: false,
        service: false,
        session: 0,
        locks: false,
        updateVgroups: false,
        equipments: false,
      },
      account: this.data.data || this.data.account,
    };
  },
  created() {
    this.data.deviceEvents.from = Datetools.addDays(-14);
    this.data.deviceEvents.key = 'account';
    this.data.account = this.account;
    if (this.data.account) {
      this.loadAllInfo();
    } else {
      this.load();
    };
  },
  updated() {
    this.account = this.data.data || this.data.account;
  },
  computed: {
    phone() {
      let phone = this.account.mobile || this.account.phone;
      if (phone && phone.length == 10) phone = '+7' + phone;
      if (phone && phone.length == 11) phone = '+7' + phone.slice(1);
      return phone;
    },
    agreement() {
      if (!this.account) return null;
      let account = this.data.ACCOUNT;
      return this.account.agreements.find(function (agr) {
        return agr.account.replace(/-/g, '') == account.replace(/-/g, '');
      });
    },
    serviceList() {
      if (this.agreement) {
        let agreement = this.agreement;
        return this.account.vgroups.filter(function (service) {
          return service.agrmid == agreement.agrmid;
        });
      };
      return [];
    },
    serviceError() {
      if (this.account.vgroups.length === 1) {
        const error = this.account.vgroups[0];
        if (error.type === 'error') {
          return 'услуги не загружены. попробуйте перезагрузить страницу.';
        };
        if (error.type === 'warning') {
          return 'услуги у абонента не найдены.';
        };
      };
      return '';
    },
    internetEq() {
      return this.equipments.filter((e) => e.type_id == 4);
    },
    tvEq() {
      return this.equipments.filter((e) => [1, 2, 3, 5, 7].includes(e.type_id));
    },
    phoneEq() {
      return this.equipments.filter((e) => e.type_id == 6);
    },
    otherEq() {
      return this.equipments.filter((e) => e.type_id == 0);
    },
    groupServiceList() {
      let services = {
        internet: {
          name: 'интернет',
          equipments: this.internetEq,
          services: [],
        },
        tv: {
          name: 'ТВ',
          equipments: this.tvEq,
          services: [],
        },
        phone: {
          name: 'телефония',
          equipments: this.phoneEq,
          services: [],
        },
        other: {
          name: 'иные',
          equipments: this.otherEq,
          services: [],
        },
      };
      this.serviceList.forEach((s) => {
        services[s.type].services.push(s);
      });
      return services;
    },
    hasSessions() {
      return this.serviceList.some((s) => s.isSession);
    },
    computedAddress() {
      if (!this.account) return '';
      if (this.agreement) {
        const service = this.account.vgroups.find(
          (s) => s.agrmid == this.agreement.agrmid && s.connaddress
        );
        if (service) return service.vgaddress || service.connaddress;
      }
      let address = {};
      if (Array.isArray(this.account.addresses)) {
        address = this.account.addresses.find((a) => a.address) || {};
      };
      return this.account.address || address.address;
    },
    ledClass() {
      if (!this.agreement) return '';
      if (this.agreement.closedon) return 'off';
      if (!this.serviceList) return '';
      const blockedServices = this.serviceList.filter((s) => s.status == 10 && new Date(s.accondate) < Date.now());
      if (this.serviceList.length == blockedServices.length && this.serviceList.length != 0)return 'off';
      return 'on';
    },
    balance() {
      if (this.agreement) {
        return {
          minus: this.agreement.balance.minus,
          balance: this.agreement.balance.integer +',' +this.agreement.balance.fraction,
          lastpaydate: this.agreement.lastpaydate,
          lastsum: this.agreement.lastsum,
        };
      }
      return { minus: false, balance: '', lastpaydate: '', lastsum: '' };
    },
    isClosed() {
      const { CLOSE_DATE } = this.data;
      if (!CLOSE_DATE) return false;
      const [dateStr, time] = CLOSE_DATE.split(' ');
      const date = dateStr.split('.').reverse().join('-');
      return new Date(`${date} ${time}`) < new Date();
    },
  },
  methods: {
	/*add refresh*/
	refresh: function () {
	  this.$root.clean();
	  this.$root.find(this.data.ACCOUNT);
	},
    showSmsModal() {
      const account = this.data.ACCOUNT;
      this.$root.showStaticModal({
        component: 'send-sms-el',
        data: { account },
      });
    },
    calcTypeService(service) {
      switch (service.type) {
        case 'internet':
          return 'интернет';
        case 'tv':
          return 'телевидение';
        case 'phone':
          return 'телефония';
        default:
          return 'иное';
      }
    },
    isPassword(service) {
      return /internet/i.test(service.type);
    },
    hasPassword(service) {
      return service.type == 'internet';
    },
    getAuthAndSpeed() {
      this.loading.updateVgroups = this.account.vgroups.length;
      this.account.vgroups.forEach((vgroup) => {
        const params = {
          login: vgroup.login,
          serverid: vgroup.serverid,
          vgid: vgroup.vgid,
        };
        if(vgroup.agenttype == '2'||vgroup.agenttype == '4'||vgroup.agenttype == '6'){
          httpGet(buildUrl('get_auth_type', params, '/call/aaa/'), true).then(
            (data) => {
              if (data.code == '200' && data.data[0].auth_type) {
                vgroup.auth_type = data.data[0].auth_type;
              }
            }
          );
          httpGet(buildUrl('get_user_rate', params, '/call/aaa/'), true).then(
            (data) => {
              if (data.code == '200' && data.data[0].rate) {
                this.data.billingInfo = data.data;
                vgroup.rate = data.data[0].rate + ' Мбит/c';
              }
              this.loading.updateVgroups--;
            }
          );
        } else {
          this.loading.updateVgroups--;
        }
      });
    },
    sessionHelp() {
      this.$root.showModal({
        title: 'справка',
        component: 'help-modal',
        data: 'при сбросе сессии перед обновлением таймаут 10 секунд.',
      });
    },
    load() {
      this.loading.service = true;
      this.loading.locks = true;
      var self = this;
      httpGet('/call/lbsv/search?text=' + this.data.ACCOUNT + '&type=account&city=any').then(function(data){
        var account=(data.type==='list')?data.data.find((data) =>data.agreements[0] && data.agreements[0].archive === '0'):data.data;
        self.data.account = self.account = account;
        self.loadAllInfo();
        self.loading.service = false;
      });
    },
    loadAllInfo() {
      this.getAuthAndSpeed();
      this.loadClientEquipment();
      if (!this.data.locks) this.loadLocks();
      if (!this.data.sessions) this.loadSessions();
      if (this.data.deviceEvents.state == 'new') this.loadDeviceEvents();
    },
    findAgreement() {
      let account = this.data.ACCOUNT;
      this.agreement = this.account.agreements.find(function (agr) {
        return agr.account.replace(/-/g, '') == account.replace(/-/g, '');
      });
    },
    loadSessions() {
      if (this.loading.session > 0) return;
      this.data.sessions = { online: [], history: null, log: null };
      this.serviceList.forEach((service) => {
        if (!service.isSession) return;
        this.loading.session++;
        const params = {
          login: service.login,
          serverid: service.serverid,
          vgid: service.vgid,
          agentid: service.agentid,
        };
        this.loadOnlineSession(params);
      });
    },
    loadOnlineSession(params) {
      httpPost('/call/aaa/get_online_sessions', params, true).then((data) => {
        data.params = params;
        this.data.sessions.online.push(data);
        this.loading.session--;
      });
    },
    loadLocks() {
      const today = new Date();
      let before = new Date();
      before.setMonth(before.getMonth() - 3);
      const params = {
        userid: this.data.account.userid,
        serverid: this.data.account.serverid,
        start: Datetools.format(before),
        end: Datetools.format(today),
      };
      httpGet(buildUrl('blocks_history', params, '/call/lbsv/')).then(
        (data) => {
          this.loading.locks = false;
          this.data.locks = data;
        }
      );
    },
    stateClass(service) {
      return service.status == '0' ? 'active' : 'disabled';
    },
    toPort() {
      this.$root.jump(this.data.PORT_NAME, true);
    },
    refreshSessions() {
      this.loadSessions();
    },
    resetSession(session) {
      this.loading.session++;
      session.params.sessionid = session.data[0].sessionid;
      session.params.nasip = session.data[0].nas;
      session.params.dbsessid = session.data[0].dbsessid;
      httpPost('/call/aaa/stop_session_radius', session.params).then((data) => {
        const i = this.data.sessions.online.indexOf(session);
        this.data.sessions.online.splice(i, 1);
        setTimeout(this.loadOnlineSession, 10000, session.params);
      });
    },
    toActivation(services, type) {
      this.$emit('change-screen', {
        screen: 'activation',
        source: { type: type, services: services, account: this.data.ACCOUNT },
        id: 'activation/' + this.data.ACCOUNT,
      });
    },
    activate(vg) {
      this.$root.showModal({
        title: 'активация услуги',
        data: vg,
        component: 'activation-modal',
      });
    },
    loadClientEquipment() {
      if (this.account.equipments) return;
      this.loading.equipments = true;
      const params = {
        serverid: this.agreement.serverid,
        userid: this.agreement.userid,
        agrmid: this.agreement.agrmid,
      };
      httpGet(buildUrl('client_equipment', params, '/call/lbsv/')).then(
        (data) => {
          if (data.type == 'error') {
            console.warn(data);
          } else {
            this.equipments = data;
            this.data.equipments = data;
          }
          this.loading.equipments = false;
        }
      );
    },
    openBillingInfo() {
      this.$root.showModal({
        title: `настройки профиля абонента`,
        component: 'account-billing-modal',
        data: {
          billingInfo: this.data.billingInfo,
          loading: this.loading.updateVgroups,
        },
      });
    },
  },
});
		};
		
		function mySession_template(){
			document.getElementById('session-el-template').innerHTML=`
			<div>
    <a class="line-row info-block-title display nohover collapsed show" data-toggle="collapse" :href="'#' + blockId">
		<!--add ID, replase fragment-->
      <div class="line-row">{{session.params.login}} • {{session.params.vgid}}<span class="inscription">логин • ID</span></div>
      <div class="line-row">
        <div v-if="session.isError" class="session">
          <span class="text-danger float-left"><i class="fas fa-exclamation-circle"></i></span>
          <span class="after-icon">ошибка загрузки</span><!--modify this, мелкие буквы-->
        </div>
        <div v-else-if="session.data[0]" class="session">
          <span class="text-success float-left"><i class="fas fa-check-circle"></i></span>
          <span class="after-icon">онлайн с {{ session.data[0].start }}</span><!--modify this, мелкие буквы-->
        </div>
        <div v-else class="session">
          <span class="text-warning float-left"><i class="fas fa-minus-circle"></i></span>
          <span class="after-icon">отсутствует</span><!--modify this, мелкие буквы-->
        </div>
        <div class="float-right"><i class="fa fa-chevron-up chevron"></i></div>
      </div>
    </a>
    <div :id="blockId" class="collapse">
      <div v-if="!session.isError && session.data[0]" class="additional-block session">
        <div class="line-row">{{ session.data[0].ip }}<span class="inscription">IP</span></div>
        <div class="line-row">{{ session.data[0].mac }}<span class="inscription">MAC адрес</span></div>
        <div class="line-row" v-show="session.data[0].device">{{ session.data[0].device }}<span class="inscription">устройство</span></div><!--modify this, мелкие буквы-->
        <div class="line-row" v-show="session.data[0].port">{{ session.data[0].port }}<span class="inscription">порт</span></div><!--modify this, мелкие буквы-->
        <div class="line-row">{{ session.data[0].nas }}<span class="inscription">NAS</span></div>
      </div>
      <div class="line-row mt-2">
			<!--modify this, мелкие буквы-->
			<button @click="historySession" :disabled="lock" class="btn btn-sm btn-action"><i class="fas fa-history"></i>история</button>
			<button @click="logSession" :disabled="lock" class="btn btn-sm btn-action"><i class="fas fa-stream"></i>логи</button>
			<!--replace this
			<button @click="resetSession" :disabled="lock" class="btn btn-sm btn-action"><i class="fas fa-redo"></i>сбросить</button>
			-->
			<button @click="resetSession" :disabled="!session.data[0]||lock" class="btn btn-sm btn-action"><i class="fas fa-redo"></i>сбросить</button>
      </div>
    </div>
  </div>
			`;
			Vue.component('session-el', {
			  props: ['session', 'lock', 'index'],
			  data: function () {
				return {}
			  },
			  template: '#session-el-template',
			  created: function () {
				
			  },
			  computed: {
				blockId: function () {
				  return 'session-block-' + this.index;
				}
			  },
			  methods: {
				resetSession: function () {
				  this.$parent.resetSession(this.session);
				},
				historySession: function () {
				  this.$root.showModal({
					title: 'история сессий',/*мелк буквы*/
					data: this.session,
					component: 'session-history-modal'
				  });
				},
				logSession: function () {
				  this.$root.showModal({
					title: 'логи авторизации',/*мелк буквы*/
					data: this.session,
					component: 'session-logs-modal'
				  });
				}
			  }
			});
		};
		
	};start();
		
}else{console.log(document.title)};

}());
