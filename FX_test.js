javascript:(function(){
	
if(document.title != 'Inetcore+' && ((window.location.href.indexOf('https://fx.mts.ru/fix#/')>=0)||(window.location.href.indexOf('http://inetcore.mts.ru/fix#/')>=0)||(window.location.href.indexOf('http://release.test.inetcore.mts.ru:81/fix#/')>=0)||(window.location.href.indexOf('http://demo.test.inetcore.mts.ru:81/fix/#/')>=0))){
	document.title = 'Inetcore+';
	
	function start(){
		var addCSS = document.createElement('style');
		addCSS.type = 'text/css';
		const myCSS = `			
			.device_in_list{}/*остальное через style*/
				.device_ETH{background-color:#eff;}
				.device_OP{background-color:#ffe;}
				.device_SBE{background-color:#eef;}
				.device_OSW{background-color:#eef;}
				.device_FAMP{background-color:#eef;}
				.device_MPLS{background-color:#eef;}
				.device_OLT{background-color:#eef;}
				.device_CPE{background-color:#fef;}
				.device_Voip{background-color:#fef;}
			
			.stata{display:inline-flex;width:220px;height:20px;text-align:center;color:#000;}
			.stata_sw{display:inline-flex;width:100%;height:20px;text-align:center;color:#000;}
				.s_bad{background-color:gold;}
				.s_busy{background-color:#d43;color:#fff;}
				.s_expired{background-color:#fdd;}
				.s_closed{background-color:#fdd;}
				.s_double{background-color:#fdd}
				.s_hub{background-color:#d34;color:#fff;}
				.s_new{background-color:#e1f3fd;font-weight:600;}
				.s_free{background-color:#fff;}
				.s_trunk_busy{background-color:#555;color:#fff;}
				.s_trunk_free{background-color:#ddd;}
			
			.entrance_for_rack{margin-bottom:1rem;padding:4px;border:1px solid #000;border-radius:4px;background-color:#eee;color:#000;}
			
			.rack_in_entrance{width:230px;}/*остальное через style*/
			.rk_in_entrance{width:140px;}/*остальное через style*/
			
			.device_in_rack{margin-top:2px;padding-left:4px;border:1px solid #000;border-radius:4px;text-align:left;width:220px;height:24px;background-color:#ddd;color:#000;}
			.type_ETH{background-color:#ddeeff;}
			.type_OP{width:130px;height:48px;background-color:#ddeeff;}
			.type_CR{width:60px;height:20px;}
			.type_PP{}
			.rk_in_entrance .type_PP{width:130px;}
			.type_SBE{height:48px;background-color:#ddf;}
			.type_OSW{background-color:#ddf;}
			.type_FAMP{height:48px;background-color:#ddf;}
			.type_OLT{height:48px;background-color:#ddf;}
			.type_CPE{width:160px;background-color:#ddeeff;}
			.type_Voip{width:160px;background-color:#ddeeff;}
				.online{border-right:10px solid green;}
				.offline{border-right:10px solid red;}
				.nomon{background-color:#ddd;}
				
			.status10{margin-left:10px;font-weight:600;color:darkorange;}/*Отключена*/
			.status5{margin-left:10px;font-weight:600;color:darkred;}/*Заблокирована*/
			.status0{margin-left:10px;font-weight:600;color:darkgreen;}/*Активна*/
		`;
		addCSS.appendChild(document.createTextNode(myCSS));
		document.head.appendChild(addCSS);
		console.log('addCSS!');
		
		document.body.addEventListener("click", updateHTML);
		
		var usertext='';
		function updateHTML(){
			console.log('click! date:'+Date());
			if(document.body.getElementsByClassName('screen-header-title')[0].textContent=='Домовой узел'){
				/*this is du*/
				if(document.getElementsByClassName('info-block')[1].getElementsByClassName('progress')[0].style.display!=''&&document.getElementById('collapseEntrance')!=null){
					
				};
				if(document.getElementsByClassName('info-block')[2].getElementsByClassName('progress')[0].style.display!=''&&document.getElementById('collapseDevices')!=null){
					if(document.getElementById('collapseDevices')!=null&&!document.getElementsByClassName('myDevices')[0].classList.contains('ok')){
						testDevicesList();
					};
				};
				if(document.getElementsByClassName('info-block')[3].getElementsByClassName('progress')[0].style.display=='none'!=''&&document.getElementById('collapseRacks')!=null){
					if(document.getElementById('collapseRacks')!=null&&!document.getElementsByClassName('myRacks')[0].classList.contains('ok')){
						testDevices();
					};
				};
			}else if(document.body.getElementsByClassName('screen-header-title')[0].textContent=='коммутатор'){
				/*this is sw*/
			}else if(document.body.getElementsByClassName('screen-header-title')[0].textContent=='оптический приемник'){
				/*this is op*/
			}else if(document.body.getElementsByClassName('screen-header-title')[0].textContent.indexOf('Наряды')>=0){
				/*this is Start page*/
				document.getElementById('building-template').innerHTML=myBuilding_template;
				document.getElementById('ports-el-template').innerHTML=myPorts_template;
				document.getElementById('set-port-modal').innerHTML=mySetPort_template;
				document.getElementById('account-template').innerHTML=myAccount_template;
			};
		};
		
		var myAccount_template=`
			<div v-if="data">
				<div class="info-block account-info">
					<screen-header-el :border="data.PORT_NAME ? '' : 'none' ">
						<template slot="title">лицевой счет</template>
						<span class="led" :class="ledClass"></span>
						{{ data.ACCOUNT }}
						<template v-if="!isNaN(data.FLAT_NUMBER)" slot="info">кв. № {{ +data.FLAT_NUMBER }}</template>
						<template slot="minor">{{ data.PORT_NAME ? data.MAC : computedAddress }}</template>
					</screen-header-el>
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
				
				<div class="info-block account-info">
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
					<div @click="toDeviceEvents(data.ACCOUNT)" :disabled="deviceEventLoading">Недоступность<span class="float-right"><i class="fa fa-chevron-right media-middle"></i></span>
						<template v-if="hasActiveDeviceEvent">
							<span class="float-right" style="margin: 0 10px;"><i class="fas fa-exclamation-triangle red"></i></span>
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
									<div class="font-weight-bold">{{ vgroup.serviceclassname }}<span class="state" :class="stateClass(vgroup)">{{ vgroup.status_name }}</span></div>
									<div>ID: {{ vgroup.vgid }}</div>
									<div>{{ vgroup.tarif }}</div>
									<passwd-el v-if="isPassword(vgroup)" :service="vgroup" :billingid="account.billingid"></passwd-el>
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
		
		var mySetPort_template=`
			<div class="container-fluid mySetPort">
				<div class="search-ctrl box-shadow-none search-account-modal">
					<div class="input-group">
						<input id="searchPanelAccount" v-filter="'[0-9-]'" v-model.lazy="sample" @keyup.enter="searchAccount" type="text" class="form-control" placeholder="Найти">
						<div class="input-group-append">
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
							<span class="account-header"><i class="fa fa-user"></i>{{ acc.agreements.account }}</span>
							<div><span class="small-text">{{ acc.address }}</span></div>
							<div v-show="acc.phone" class="small-text">{{ acc.phone }}<span class="inscription"> Телефон</span></div>
							<div class="small-text">{{ getBalance(acc.agreements) }} &#8381;<span class="inscription"> Баланс</span></div>
							<div class="small-text">{{ acc.agreements.lastsum }} ₽ {{ acc.agreements.lastpaydate }}<span class="inscription"> Последний платеж</span></div>
							<div v-if="acc.vgids.length > 0">
								<div class="form-row">
									<span class="mt-2">Учетная запись для связи:</span>
									<div class="form-group custom-control-radio" v-for="vg in acc.vgids">
										<label>
											<div class="custom-control custom-checkbox my-1 mr-sm-2">
												<input type="radio" class="custom-control-input" 
													v-bind:disabled="loading"
													v-bind:id="vg.vgid" 
													v-bind:name="acc.userid" 
													@change="getMacList"
													v-bind:value="{vgid: vg.vgid, login: vg.login, serverid: vg.serverid, type_of_bind: vg.type_of_bind, agentid: vg.agentid}" 
													v-model="resource">
													<span class="custom-control-label custom-control-empty">{{ vg.login }}<br/>ID: {{ vg.vgid }}<span v-bind:class="(vg.status==0)?'status0':((vg.status==10)?'status10':'status5')">{{ vg.status_name }}</span><br/><span class="small-text">{{ vg.tarif }}</span></span>
												</input>
											</div>
										</label>
									</div>
								</div>
								<div v-if="typeOfBind == 0" class="form-row"><div class="alert alert-warning mt-2" role="alert">Выбраная учетная запись не нуждается в привязке</div></div>
								<div v-else-if="typeOfBind == 1" class="form-row"><button @click="setupPortForUser()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill" type="submit">Связать счет</button></div>
								<div v-else-if="typeOfBind == 2" class="form-row">
									<input list="macs" class="form-control form-control-sm" v-model="mac.selected" v-filter="'[0-9a-fA-F\:\.]'" maxlength="23">
									<datalist id="macs"><option v-for="mc in mac.list">{{ mc }}</option></datalist>
									<button @click="setupMacForUser()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-3" type="submit">Связать mac</button>
								</div>
								<div v-else-if="typeOfBind == 3 || typeOfBind == 6" class="form-row">
									<input v-if="typeOfBind == 6" class="form-control form-control-sm mb-2" v-filter="'[0-9\.]'" v-model="client_ip" maxlength="15">
									<button @click="insPort()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill" type="submit">Связать счет</button>
								</div>
								<div v-else-if="typeOfBind == 5" class="form-row">
									<button @click="insPort()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-1" type="submit">Связать счет</button>
									<input list="macs" class="form-control form-control-sm mt-3" v-filter="'[0-9a-fA-F\:\.]'" v-model="mac.selected" maxlength="23">
									<datalist id="macs"><option v-for="mc in mac.list">{{ mc }}</option></datalist>
									<button @click="insOnlyMac()" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill mt-2" type="submit">Связать mac</button>
								</div>
								<div v-else><!--div class="alert alert-warning mt-2" role="alert"></div!--></div>
								<!--div v-if="loading" class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-10"></div></div!-->
							</div>
							<div v-else><div class="alert alert-warning mt-2" role="alert">Не найдено не одной учетной записи, доступной для привязки.</div></div>
						</div>
						<div v-if="result" class="mt-3 response-block">
							<div v-if="result.isError">
								<div v-if="result.code == 412 || result.code == 413">
									<div v-html="result.message" class="alert alert-warning" role="alert"></div>
									<button @click="setupPortForUser(result.code)" v-bind:disabled="loading" class="btn btn-primary btn-sm btn-fill" type="submit">Подтвердить связь</button>
								</div>
								<div v-else>
									<div v-html="result.text.slice(0,120)" class="alert alert-danger" role="alert"></div>
								</div>
							</div>
							<div v-else>
								<div v-if="typeOfBind == 1 && result.code == 200 " class="alert alert-success" role="alert">Счет {{ sample }} успешно привязан к порту {{ data.portNumber}} ({{ data.deviceParams.IP_ADDRESS }})</div>
								<div v-if="(typeOfBind == 2 || typeOfBind == 3 || typeOfBind == 5 || typeOfBind == 6 ) && result.InfoMessage" class="alert alert-success" role="alert" v-html="result.InfoMessage"></div>
							</div>
						</div>
					</div>
				</div>
				<div v-if="loading" class="progress mt-2"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div></div>
			</div>
		`;
		
		var myPorts_template=`
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
							<div v-if="isPortsLoaded" class="row">
								<template v-for="(port, index) in ports">
									<div class="port-details col-4 col-sm-2 col-md-2 col-lg" @click="selectPort(port)">
										<div class="row port-basic-info-row">
											<div class="col-6 port-basic-info d-flex justify-content-center align-items-center" :class="portClass(port)" style="border-radius:6px;">
												<div class="row port-basic-info-row">
													<div class="port-number">{{ port.number }}</div>
													<div v-show="port.flat" class="flat-separator"></div>
													<div v-if="port.flat" class="port-flat-number">{{ port.flat }}</div>
												</div>
											</div>
											<div class="col-6">
												<div class="row">
												<div class="col-6 port-link-info">
												<div v-if="loaded.portStatuses && !error.empty" class="port-adm-link-status" :class="linkStatusClass(index)" style="border-radius:4px;"></div>
												</div>
												<div class="col-6 port-speed-info">
												<div class="port-high-speed">
												<span v-if="loaded.portStatuses && !error.empty">{{ portSpeed(index) }}</span>
												</div>
												</div>
												</div>
												<div class="row">
												<div v-if="port.port_errors" class="port-errors-value">{{ port.port_errors}}</div>
												<div v-else class="port-errors-value">- / -</div>
												</div>
											</div>
										</div>
										<div class="row">
											<div class="port-pairs-info col d-flex justify-content-center align-items-center" :class="portMetrStatusClass(index)">
											<template v-if="isCable(index)">
											<template v-if="port.port_loop && !port.port_loop.loop_status">
											<div class="port-loop">Петля</div>
											</template>
											<template v-if="loaded.portStatuses && !error.empty">
											<template v-for="(pair, i) in pairs(index)">
											<div class="col port-pair-info">
											<div v-if="pair.pair && loaded.portStatuses && !error.empty" class="row">
											<div class="port-pair d-flex justify-content-center align-items-center" :class="pair.class"><div>{{ pair.pair }}</div></div>
											</div>
											<div class="row">
											<div class="port-metr">{{ pair.metr }}</div>
											</div>
											</div>
											</template>
											</template>
											</template>                
											<template v-else>
											<div class="port-no-cable">Cвободен</div>
											</template>
											</div>
										</div>
									</div>
								</template>
							</div>
						</div>
					</template>			
					<template v-if="!showdetails">
						<div class="ports-el-compactly">
							<ul class="list-group port-list">
								<li @click="selectPort(port)" v-for="(port, index) in ports" class="list-group-item port font-weight-bold d-flex justify-content-center align-items-center compactly-port-number" :class="portClass(port)" style="border:1px solid #000;width:24%;height:50px;border-radius:6px;margin:2px 0px 0px 2px;">
									<div class="col port-basic-info-row">
										<div>{{ port.number }}</div>
										<div v-show="port.flat" class="port-desc" style="width:40px;"><span>{{ port.flat }}</span></div>
									</div>
								</li>
							</ul>
						</div>
					</template>
					<div class="legend mt-2">
						<a class="legend-title small-text collapse collapsed show info-block-title display nohover" data-toggle="collapse" href="#collapseLegend">
							<span>Легенда</span>
							<div class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
						</a>
						<div class="collapse legend-body" id="collapseLegend">
							<ul class="list-group">
								<li class="list-group-item"><div class="legend-port port-busy" style="border-radius:4px;">0</div>занятые</li>
								<li class="list-group-item"><div class="legend-port port-expired" style="border-radius:4px;">0</div>можно освободить</li>
								<li class="list-group-item"><div class="legend-port port-new" style="border-radius:4px;">0</div>новый MAC</li>
								<li class="list-group-item"><div class="legend-port port-free" style="border-radius:4px;">0</div>cвободные</li>
								<li class="list-group-item"><div class="legend-port port-bad" style="border-radius:4px;">0</div>битые</li>
								<li class="list-group-item"><div class="legend-port port-trunk busy" style="border-radius:4px;">0</div>тех. занятые</li>
								<li class="list-group-item"><div class="legend-port port-trunk free" style="border-radius:4px;">0</div>тех. свободные</li>
								<template v-if="showdetails">
									<div class="w-100 py-1">Результат кабель-теста:</div>
									<li class="list-group-item"><div class="port-pair port-pair-open port-legend-info legend-port">O</div>Open</li>
									<li class="list-group-item"><div class="port-pair port-pair-close port-legend-info legend-port">C</div>Close</li>
									<li class="list-group-item"><div class="port-pair port-pair-short port-legend-info legend-port">S</div>Short</li>
									<li class="list-group-item"><div class="port-pair port-pair-error port-legend-info legend-port">E</div>Error</li>
									<div class="w-100 py-1">Ошибки:</div>
									<li class="list-group-item"><div class="legend-port legend-port-state">- / -</div>Тест ошибок не запускался</li>
									<li class="list-group-item"><div class="legend-port legend-port-state">0 / 0</div>Исходящие / Входящие</li>
									<li class="list-group-item"><div class="legend-port legend-port-state">999Т</div>999 тысяч ошибок</li>
									<li class="list-group-item"><div class="legend-port legend-port-state">999М</div>999 миллионов ошибок</li>
									<div class="w-100 py-1">Статус порта:</div>
									<li class="list-group-item"><div class="legend-port legend-port-state-adm port-adm-link-up">-</div>Есть link</li>
									<li class="list-group-item"><div class="legend-port legend-port-state-adm port-adm-link-down">-</div>Link отсутствует</li>
									<li class="list-group-item"><div class="legend-port legend-port-state-adm port-adm-link-off">-</div>Порт выключен</li>
								</template>
							</ul>
						</div>
					</div>
				</template>
			</div>
		`;
		
		var myBuilding_template=`
			<div v-if="data" class="myBuilding">
				<div class="info-block"> <!-- стандартный блок информации -->
				<screen-header-el border="none">
				<template slot="title">Домовой узел</template>
				{{ data.node }}
				<template slot="info">{{ data.address }}</template>
				</screen-header-el>
				<div v-show="loading.data" class="progress">
				<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
				</div>
				</div>
				<div class="info-block" v-show="showEntrance" >
				<a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseEntrance" href="#collapseEntrance" >
				<span class="card-title"> Квартиры </span>
				<div v-show="data.entrances && data.entrances.length > 0" class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
				</a>
				<div v-if="data.entrances && data.entrances.length > 0" class="building-info collapse" id="collapseEntrance">
				<div class="align-items-center justify-content-between pb-2" :class="data.entrances[0].ENTRANCE_ID ? 'd-flex' : 'd-none'">
				<span class="small-text">Подключено:</span>
				<span class="small-text">Подъезды</span>
				</div>
				<ul class="list-group list-group-flush">
				<li v-for="(entrance) in data.entrances" @click="selectEntrance(entrance)" class="list-group-item d-flex align-items-center justify-content-between">
				<div class="w-75">
				<div :class='{ "float-left mr-2": entrance.INTERNET_BLOCK_TYPE }'>
				<h5 v-if="entrance.FLAT_FROM_TO" class="m-0 p-0"> {{ entrance.FLAT_FROM_TO }} </h5>
				<h6 v-else class="m-0 p-0">Подключенные квартиры</h6>
				</div>
				<div class="bg-warning px-2 mb-1 rounded text-truncate"> {{ entrance.INTERNET_BLOCK_TYPE }} </div>
				<div v-for="(device) in entrance.DEVICE_LIST" class="minor-text" v-show="entrance.DEVICE_LIST">
				<i class="fas fa-project-diagram blue"></i> {{ device }}
				</div>
				</div>
				<div>
				<template v-if="entrance.ENTRANCE_NO">
				<h4>{{ entrance.ENTRANCE_NO }}</h4>
				</template>
				<template v-else>
				<i class="fas fa-chevron-right"></i>
				</template>
				</div>
				</li>
				</ul>
				</div>
				<div v-show="loading.entrances" class="progress">
				<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
				</div>
				</div>
				
				<div class="info-block myDevices">
					<a class="card-body collapse show info-block-title display nohover collapsed" data-toggle="collapse" data-target="#collapseDevices" href="#collapseDevices" aria-expanded="false">
						<span class="card-title"> Устройства </span>
						<div v-show="data.devices && data.devices.length > 0" class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div v-if="data.devices && data.devices.length > 0" class="building-info collapse" id="collapseDevices">
						<ul class="list-group list-group-flush">
							<li v-bind:id="device.DEVICE_NAME" v-for="(device, index) in data.devices" v-if="device.DESCRIPTION" v-on:click="select(device, index)" style="margin: 2px 0px 2px 0px;padding: 2px 4px 2px 4px;border:1px solid #000;border-radius:4px;" class="list-group-item device_in_list":class="'device_'+device.DEVICE_NAME.split('_')[0]">
								<div>
									<ping-el :device="device"><strong>{{ device.IP_ADDRESS }}</strong></ping-el>
									<span class="minor-text">{{ device.DEVICE_NAME }}</span>
								</div>
								<div class="float-right"><i class="fas fa-chevron-right"></i></div>
								<div>{{ device.VENDOR }}<span class="minor-text">{{ device.MODEL }}</span></div>
								<div>{{ device.DISPLAY_NAME }}</div>
								<div v-if="device.DEVICE_NAME.split('_')[0]=='ETH'" class="stata_sw">
									<span>порты:</span>
									<div class="s_bad" style="width:0rem;" counter="0"></div>
									<div class="s_busy s_hub" style="width:0rem;" counter="0"></div>
									<!--<div class="s_hub" style="width:0rem;" counter="0"></div>-->
									<div class="s_expired s_closed s_double" style="width:0rem;" counter="0"></div>
									<!--<div class="s_closed" style="width:0rem;" counter="0"></div>-->
									<!--<div class="s_double" style="width:0rem;" counter="0"></div>-->
									<div class="s_new" style="width:0rem;" counter="0"></div>
									<div class="s_free" style="width:0rem;" counter="0"></div>
									<div class="s_trunk_busy" style="width:0rem;" counter="0"></div>
									<div class="s_trunk_free" style="width:0rem;" counter="0"></div>
								</div>
							</li>
						</ul>
					</div>
					<div v-show="loading.devices" class="progress">
						<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				</div>
				
				<div class="info-block myRacks">
					<a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseRacks" href="#collapseRacks" aria-expanded="false">
						<span class="card-title"> Шкафы, устройства, плинты </span>
						<div v-show="data.racks && Object.keys(data.racks).length > 0" class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div v-if="data.racks && Object.keys(data.racks).length > 0" class="building-info collapse" id="collapseRacks">
						<div v-for="(racks, number) in data.racks" class="entrance_for_rack" style="">
							<h5>Подъезд {{ number }}</h5>
							<ul class="list-group list-group-flush" style="flex-direction:column-reverse;">
								<li v-bind:name="rack.RACK_NMAE" class="list-group-item rack_in_entrance":class='{ "rk_in_entrance":rack.RACK_TYPE!="Антивандальный" }' v-for="(rack) in racks"  style="margin-top:4px;padding: 4px 0px 4px 4px;border:1px solid #000;border-radius:4px;background-color:#aaa;color:#000;">
									<div>
										<p class="mb-0">
											<strong>{{ rack.FLOOR }} этаж</strong>
											<span v-if="rack.RACK_TYPE=='Антивандальный'"> Шкаф </span>
											<span v-else> РК </span>
											<span class="minor-text" style="color:#000;">{{ rack.LOCATION }}</span>
										</p>
									</div>
									<div v-if="rack.NE_IN_RACK!=null&&rack.RACK_TYPE=='Антивандальный'" class="stata">
										<span>порты:</span>
										<div class="s_bad" style="width:0rem;" counter="0"></div>
										<div class="s_busy s_hub" style="width:0rem;" counter="0"></div>
										<!--<div class="s_hub" style="width:0rem;" counter="0"></div>-->
										<div class="s_expired s_closed s_double" style="width:0rem;" counter="0"></div>
										<!--<div class="s_closed" style="width:0rem;" counter="0"></div>-->
										<!--<div class="s_double" style="width:0rem;" counter="0"></div>-->
										<div class="s_new" style="width:0rem;" counter="0"></div>
										<div class="s_free" style="width:0rem;" counter="0"></div>
										<div class="s_trunk_busy" style="width:0rem;" counter="0"></div>
										<div class="s_trunk_free" style="width:0rem;" counter="0"></div>
									</div>
									<!--<div>{{ rack.NE_IN_RACK }}</div>-->
									<div v-if="rack.NE_IN_RACK!=null">
										<div v-for="item in rack.NE_IN_RACK.split(', ')">
											<div v-bind:name="item.trim().replace('КР','KR')" class="device_in_rack":class="'type_'+item.trim().replace('КР','KR').split('_')[0]">{{ (item.trim().replace('КР','KR').split('_')[0]=='PP')?'Патч-панель':((item.trim().replace('КР','KR').split('_')[0]=='CR')?'Плинт':item.trim().replace('КР','KR')) }}</div>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
					<div v-show="loading.racks" class="progress">
						<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				</div>
				
				<div class="info-block">
					<a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseMutations" href="#collapseMutations">
						<span>Изменения состояния портов</span>
						<div v-if="data.devices && data.devices.length > 0" class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div v-if="data.devices && data.devices.length > 0" class="collapse mutations" id="collapseMutations">
						<port-comparer-el :storage="data" :devices="deviceNameList" @loading="loadMutation"></port-comparer-el>
					</div>
					<div v-show="loading.mutation" class="progress">
						<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger w-100"></div>
					</div>
				</div>
				
				<div class="info-block">
					<a class="card-body collapse collapsed show info-block-title display nohover" data-toggle="collapse" data-target="#collapseLessor" href="#collapseLessor" >
						<span class="card-title"> Управляющая компания </span>
						<div v-show="data.lessor" class="float-right chevron"><i class="fa fa-chevron-up"></i></div>
					</a>
					<div v-if="data.lessor" class="building-info collapse" id="collapseLessor">
						<ul class="list-group list-group-flush">
							<li class="list-group-item">
								{{ data.lessor.name }}
								<div>
									<div class="small-text">Контактный номер телефона</div>
									<span class="line-text">{{ data.lessor.phone }}</span>
								</div>
								<div>
									<div class="small-text">ФИО ответственного от УК-ТСЖ</div>
									<span class="line-text">{{ data.lessor.person }}</span>
								</div>
								<div>
									<div class="small-text">Должность ответственного от УК-ТСЖ</div>
									<span class="line-text">{{ data.lessor.position }}</span>
								</div>
								<div>
									<div class="small-text">Особенности доступа</div>
									<span class="line-text">{{ data.details }}</span>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		`;
		
	};start();
	
	function testDevicesList(){
		var devices=document.getElementById('collapseDevices').getElementsByClassName('device_in_list');
		for(var d=0; d<devices.length; d++){
			if(devices[d].getAttribute('id').split('_')[0]=='ETH'){
				httpGet('/call/device/device_port_list?device='+devices[d].getAttribute('id')+'&fresh='+Math.random(), true).then(function(data_p){
					var ports=data_p.map(function(item_p, index_p, array_p){
						var stata_counter_eth = document.getElementById(item_p.device_name).getElementsByClassName('s_'+item_p.state.replace(' ','_'))[0];
						stata_counter_eth.setAttribute('counter',(+stata_counter_eth.getAttribute('counter')+1));
						stata_counter_eth.innerHTML=stata_counter_eth.getAttribute('counter');
						stata_counter_eth.setAttribute('style','width:'+stata_counter_eth.getAttribute('counter')+'rem;');
					});
				});
			};
		};
		document.getElementsByClassName('myDevices')[0].classList.add('ok');
	};
	
	function testDevices(){
		function isEmpty(object){for(var key in object){return false}return true};/*used in testDevice(d_name)*/
		var racks=document.getElementById('collapseRacks').getElementsByClassName('list-group-item');
		for(var r=0; r<racks.length; r++){
			var devices=racks[r].getElementsByClassName('device_in_rack');
			for(var d=0; d<devices.length; d++){
				var d_name=devices[d].getAttribute('name');
				var d_type=devices[d].getAttribute('name').split('_')[0];
				devices[d].addEventListener('click', function(event){document.getElementById(event.target.attributes.name.value).click();});
				if(d_type!='PP'&&d_type!='CR'){
					document.getElementsByName(d_name)[0].classList.add('nomon');
					httpGet('/call/device/device_info?device='+d_name+'&fresh='+Math.random(), true).then(function(data_d){
						if(!isEmpty(data_d[0])){
							httpPost('/call/dnm/device_ping', {'device':data_d[0]}, true).then(function(data_pi){
								if(data_pi.code=='200'){
									document.getElementsByName(data_d[0].DEVICE_NAME)[0].classList.remove('nomon');
									document.getElementsByName(data_d[0].DEVICE_NAME)[0].classList.add('online');
								}else if(data_pi.code=='400'){
									document.getElementsByName(data_d[0].DEVICE_NAME)[0].classList.remove('nomon');
									document.getElementsByName(data_d[0].DEVICE_NAME)[0].classList.add('offline');
								}else{
									document.getElementsByName(data_d[0].DEVICE_NAME)[0].classList.add('nomon');
								};
								document.getElementsByName(data_d[0].DEVICE_NAME)[0].innerHTML='['+data_d[0].DEVICE_NAME.split('_')[0]+'] '+data_d[0].IP_ADDRESS;
							});
							if(data_d[0].DEVICE_NAME.split('_')[0]=='ETH'){
								httpGet('/call/device/device_port_list?device='+data_d[0].DEVICE_NAME+'&fresh='+Math.random(), true).then(function(data_p){
									var ports=data_p.map(function(item_p, index_p, array_p){
										var stata_counter = document.getElementsByName(item_p.device_name)[0].parentElement.parentElement.parentElement.getElementsByClassName('s_'+item_p.state.replace(' ','_'))[0];
										stata_counter.setAttribute('counter',(+stata_counter.getAttribute('counter')+1));
										stata_counter.innerHTML=stata_counter.getAttribute('counter');
										stata_counter.setAttribute('style','width:'+stata_counter.getAttribute('counter')+'rem;');
									});
								});
							};
						};
					});
				};
			};
		};
		document.getElementsByClassName('myRacks')[0].classList.add('ok');
	};
	
}else{console.log(document.title)};

}());