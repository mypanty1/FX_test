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
				
		window.AppInventor.setWebViewString('version_:FX_test_v164.d');
	
		document.body.addEventListener("click", updateHTML);
		
		var templates_need_replace=true;
		function updateHTML(){
			/*console.log('click! date:'+Date());*/
			if(document.body.getElementsByClassName('screen-header-title')[0].textContent.includes('Наряды')&&templates_need_replace){
				/*this is Start page*/
				myPortComparerEl_template();
				myPortsEl_template();
				myDataListPolyfill();
				templates_need_replace=false;
			};
		};
		
		function myDataListPolyfill(){
			!function(){"use strict";var e=window.document,t=window.navigator.userAgent,i="list"in e.createElement("input")&&Boolean(e.createElement("datalist")&&window.HTMLDataListElement),n=Boolean(t.match(/MSIE\s1[01]./)||t.match(/rv:11./)),a=Boolean(-1!==t.indexOf("Edge/"));if(i&&!n&&!a)return!1;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector);var o=!1,r=["text","email","number","search","tel","url"];window.addEventListener("touchstart",(function e(){o=!0,window.removeEventListener("touchstart",e)}));var l,s=window.MutationObserver||window.WebKitMutationObserver;void 0!==s&&(l=new s((function(t){var i=!1;if(t.forEach((function(e){e.target instanceof HTMLElement&&"datalist"===e.target.tagName.toLowerCase()&&e.addedNodes.length>1&&(i=e.target)})),i){var n=e.querySelector('input[list="'+i.id+'"]');""!==f(n)&&A(b(i,n).length,i.getElementsByClassName("polyfilling")[0])}})));var u=function(e){var t=e.target,i=t.list,r=38===e.keyCode||40===e.keyCode;if("input"===t.tagName.toLowerCase()&&null!==i)if(n||a)""===f(t)||r||13===e.keyCode||27===e.keyCode||!n&&"text"!==t.type||(d(t,i),t.focus());else{var l=!1,s=i.getElementsByClassName("polyfilling")[0]||h(t,i);if(27!==e.keyCode&&13!==e.keyCode&&(""!==f(t)||r)&&void 0!==s){b(i,t).length>0&&(l=!0);var u=s.options.length-1;o?s.selectedIndex=0:r&&"number"!==t.getAttribute("type")&&(s.selectedIndex=38===e.keyCode?u:0,s.focus())}A(l,s)}},d=function(e,t){var i=f(e);Array.prototype.slice.call(t.options,0).forEach((function(e){var t=e.getAttribute("data-originalvalue"),n=t||e.value;t||e.setAttribute("data-originalvalue",n),e.label||e.text||(e.label=n),e.value=c(e,i)?i+"###[P0LYFlLLed]###"+n.toLowerCase():n}))},p=function(e){var t=e.target,i=t.list;if(t.matches("input[list]")&&t.matches(".polyfilled")&&i){var n=i.querySelector('option[value="'+f(t).replace(/\\([\s\S])|(")/g,"\\$1$2")+'"]');n&&n.getAttribute("data-originalvalue")&&g(t,n.getAttribute("data-originalvalue"))}},c=function(e,t){var i=e.value.toLowerCase(),n=t.toLowerCase(),a=e.getAttribute("label"),o=e.text.toLowerCase();return Boolean(!1===e.disabled&&(""!==i&&-1!==i.indexOf(n)||a&&-1!==a.toLowerCase().indexOf(n)||""!==o&&-1!==o.indexOf(n)))},v=function(e){if(e.target.matches("input[list]")){var t=e.target,i=t.list;if("input"===t.tagName.toLowerCase()&&null!==i){if(t.matches(".polyfilled")||y(t,e.type),a&&"focusin"===e.type){var o=t.list.options[0];o.value=o.value}if(!n&&!a){var r=i.getElementsByClassName("polyfilling")[0]||h(t,i),l=r&&r.querySelector("option:not(:disabled)")&&("focusin"===e.type&&""!==f(t)||e.relatedTarget&&e.relatedTarget===r);A(l,r)}}}},y=function(e,t){e.setAttribute("autocomplete","off"),e.setAttribute("role","textbox"),e.setAttribute("aria-haspopup","true"),e.setAttribute("aria-autocomplete","list"),e.setAttribute("aria-owns",e.getAttribute("list")),"focusin"===t?(e.addEventListener("keyup",u),e.addEventListener("focusout",v,!0),(n||a&&"text"===e.type)&&e.addEventListener("input",p)):"blur"===t&&(e.removeEventListener("keyup",u),e.removeEventListener("focusout",v,!0),(n||a&&"text"===e.type)&&e.removeEventListener("input",p)),e.className+=" polyfilled"},f=function(e){return"email"===e.getAttribute("type")&&null!==e.getAttribute("multiple")?e.value.slice(Math.max(0,e.value.lastIndexOf(",")+1)):e.value},g=function(e,t){var i;e.value="email"===e.getAttribute("type")&&null!==e.getAttribute("multiple")&&(i=e.value.lastIndexOf(","))>-1?e.value.slice(0,i)+","+t:t};if(e.addEventListener("focusin",v,!0),!n&&!a){var m,b=function(t,i){void 0!==l&&l.disconnect();var n=t.getElementsByClassName("polyfilling")[0]||h(i,t),a=f(i),r=e.createDocumentFragment(),s=e.createDocumentFragment();Array.prototype.slice.call(t.querySelectorAll("option:not(:disabled)")).sort((function(e,t){var n=e.value,a=t.value;return"url"===i.getAttribute("type")&&(n=n.replace(/(^\w+:|^)\/\//,""),a=a.replace(/(^\w+:|^)\/\//,"")),n.localeCompare(a)})).forEach((function(e){var t=e.value,i=e.getAttribute("label"),n=e.text;if(c(e,a)){var o=n.slice(0,t.length+" / ".length);n&&!i&&n!==t&&o!==t+" / "?e.textContent=t+" / "+n:e.text||(e.textContent=i||t),r.appendChild(e)}else s.appendChild(e)})),n.appendChild(r);var u=n.options.length;return n.size=u>10?10:u,n.multiple=!o&&u<2,(t.getElementsByClassName("ie9_fix")[0]||t).appendChild(s),void 0!==l&&l.observe(t,{childList:!0}),n.options},h=function(t,i){if(!(t.getAttribute("type")&&-1===r.indexOf(t.getAttribute("type"))||null===i)){var n=t.getClientRects(),a=window.getComputedStyle(t),l=e.createElement("select");if(l.setAttribute("class","polyfilling"),l.style.position="absolute",A(!1,l),l.setAttribute("tabindex","-1"),l.setAttribute("aria-live","polite"),l.setAttribute("role","listbox"),o||l.setAttribute("aria-multiselectable","false"),"block"===a.getPropertyValue("display"))l.style.marginTop="-"+a.getPropertyValue("margin-bottom");else{var s="rtl"===a.getPropertyValue("direction")?"right":"left";l.style.setProperty("margin-"+s,"-"+(n[0].width+parseFloat(a.getPropertyValue("margin-"+s)))+"px"),l.style.marginTop=parseInt(n[0].height+(t.offsetTop-i.offsetTop),10)+"px"}if(l.style.borderRadius=a.getPropertyValue("border-radius"),l.style.minWidth=n[0].width+"px",o){var u=e.createElement("option");u.textContent=i.title,u.disabled=!0,u.setAttribute("class","message"),l.appendChild(u)}return i.appendChild(l),o?l.addEventListener("change",w):l.addEventListener("click",w),l.addEventListener("blur",w),l.addEventListener("keydown",w),l.addEventListener("keypress",E),l}},E=function(t){var i=t.target,n=i.parentNode,a=e.querySelector('input[list="'+n.id+'"]');"select"===i.tagName.toLowerCase()&&null!==a&&(!t.key||"Backspace"!==t.key&&1!==t.key.length||(a.focus(),"Backspace"===t.key?(a.value=a.value.slice(0,-1),C(a)):a.value+=t.key,b(n,a)))},w=function(t){var i=t.currentTarget,n=i.parentNode,a=e.querySelector('input[list="'+n.id+'"]');if("select"===i.tagName.toLowerCase()&&null!==a){var o=t.type,r="keydown"===o&&13!==t.keyCode&&27!==t.keyCode;("change"===o||"click"===o||"keydown"===o&&(13===t.keyCode||"Tab"===t.key))&&i.value.length>0&&i.value!==n.title?(g(a,i.value),C(a),"Tab"!==t.key&&a.focus(),13===t.keyCode&&t.preventDefault(),r=!1):"keydown"===o&&27===t.keyCode&&a.focus(),A(r,i)}},C=function(t){var i;"function"==typeof Event?i=new Event("input",{bubbles:!0}):(i=e.createEvent("Event")).initEvent("input",!0,!1),t.dispatchEvent(i)},A=function(t,i){t?i.removeAttribute("hidden"):i.setAttributeNode(e.createAttribute("hidden")),i.setAttribute("aria-hidden",(!t).toString())};(m=window.HTMLInputElement)&&m.prototype&&void 0===m.prototype.list&&Object.defineProperty(m.prototype,"list",{get:function(){var t=e.getElementById(this.getAttribute("list"));return"object"==typeof this&&this instanceof m&&t&&t.matches("datalist")?t:null}}),function(e){e&&e.prototype&&void 0===e.prototype.options&&Object.defineProperty(e.prototype,"options",{get:function(){return"object"==typeof this&&this instanceof e?this.getElementsByTagName("option"):null}})}(window.HTMLElement)}}();
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
	
	};start();
		
}else{console.log(document.title)};

}());
