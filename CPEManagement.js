
Vue.component('CPEManagementErrorMessage', {
  template:`<div class="display-flex flex-direction-column gap-8px">
    <message-el :text="userText" :subText="error?.[0] || ''" type="warn" box/>
    <div class="font--12-400 tone-500">{{error?.[1]}}</div>
  </div>`,
  props: {
    userText: {type: String, default: 'Error'},
    error: {type: Array, default: () => []},
  }
});

Vue.component('CPEManagementPage', {
  template: `<div class="display-flex flex-direction-column gap-8px padding-bottom-100px">
    <router-view name="navbar"/>
    <transition name="slide-page" mode="out-in">
      <router-view name="content"/>
    </transition>
  </div>`,
  beforeRouteEnter(to, from, next){
    store.dispatch('CPEManagement/CPEs/addCPE',[to.params.mrID, to.params.cpeID, to.query.accountNumber]);
    const cpeKey = store.getters['CPEManagement/CPEs/cpeKey'];
    const path = 'CPEManagement/CPEs/'+cpeKey+'/Sections';
      console.log(path)
      console.log(store.getters[path+'/$subModulesKeys'])
    if(!to.params.sectionName){
      console.log('!sectionName')
      return next({
        ...to,
        name: 'R_CPEManagementCPESection',
        params: {
          ...to.params,
          sectionName: store.getters[path+'/$subModulesKeys'][0]
        },
      })
    };
    if(!store.getters[path+'/$subModulesKeys'].includes(to.params.sectionName)){
      console.log('?sectionName',to.params.sectionName)
      return next({
        name: from.name,
        params: from.params,
      })
    };
    next(vm => {
      vm.$store.dispatch(path+'/selectSection',{sectionName: to.params.sectionName})
    });
  },
  beforeRouteUpdate(to, from, next){
    store.dispatch('CPEManagement/CPEs/addCPE',[to.params.mrID, to.params.cpeID, to.query.accountNumber]);
    const cpeKey = store.getters['CPEManagement/CPEs/cpeKey'];
    const path = 'CPEManagement/CPEs/'+cpeKey+'/Sections';
      console.log(path)
      console.log(store.getters[path+'/$subModulesKeys'])
    if(!to.params.sectionName){
      console.log('!sectionName')
      return next({
        ...to,
        name: 'R_CPEManagementCPESection',
        params: {
          ...to.params,
          sectionName: store.getters[path+'/$subModulesKeys'][0]
        },
      })
    };
    if(!this.$store.getters[path+'/$subModulesKeys'].includes(to.params.sectionName)){
      console.log('?sectionName',to.params.sectionName)
      return next({
        name: from.name,
        params: from.params,
      })
    };
    this.$store.dispatch(path+'/selectSection',{sectionName: to.params.sectionName})
    next();
  },
  beforeRouteLeave(to, from, next){
    next();
  },
});

Vue.component('CPEManagementPageNavbar', {
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'title',
        'subTitle',
        'lastInfoLoading',
        'onlineInfoLoading',
        'onlineInfoLoadingRefresh',
        'onlineInfoExist',
        'loadingSomeOperation',
      ],
      actions: [
        'getOnlineInfo'
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
        'sections',
        'counters',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'label',
      ],
    });
  },
  template: `<div class="display-flex flex-direction-column gap-8px">
    <PageNavbar v-bind="{title,subTitle}">
      <template slot="btn-right">
        <button-sq v-if="lastInfoLoading || loadingSomeOperation" disabled type="large">
          <IcIcon name="loading rotating" color="#918F8F" size="24"/>
        </button-sq>
        <button-sq v-else @click="getOnlineInfo(!0)" :disabled="loadingSomeOperation" type="large">
          <IcIcon name="refresh" :color="loadingSomeOperation ? '#918F8F' : '#5642BD'" size="24"/>
        </button-sq>
      </template>
    </PageNavbar>
    
    <div class="white-block-100" v-if="onlineInfoExist">
      <LineScrollSelector2 v-bind="{
        selectedItem: {sectionName,label},
        items: sections,
        counters: counters,
      }" hideZeroCounter idKey="sectionName" labelKey="label" counterKey="sectionName" @onSelect="$router.replace({...$route,name:'R_CPEManagementCPESection',params:{...$route.params,sectionName:$event.sectionName}})"/>
    </div>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'mrID',
    'cpeID',
    'cpeKey',
  ]),
});

Vue.component('CPEManagementPageContent', {
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'lastInfoError',
        'lastInfoExist',
        'onlineInfoExist',
        'onlineInfoLoadingRefresh',
      ],
    });
  },
  template: `<div class="display-flex flex-direction-column gap-8px">
    <loader-bootstrap v-if="lastInfoLoading || (lastInfoExist && onlineInfoLoadingRefresh)" text="получение данных с CPE"/>
    
    <div v-else-if="lastInfoError" class="white-block-100 padding-top-bottom-8px padding-left-right-8px">
      <CPEManagementErrorMessage userText="Нет данных по CPE" :error="lastInfoError"/>
    </div>
    
    <transition v-else-if="lastInfoExist" name="slide-page" mode="out-in">
      <router-view/>
    </transition>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementSection', {
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'sectionComponents',
      ]
    });
  },
  template: `<div class="display-flex flex-direction-column gap-8px">
    <component v-for="(component, index) of sectionComponents" :key="index" :is="component"/>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ])
});

Vue.component('CPEManagementCPEInfo',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'loadingSomeOperation',
      ],
      actions: [
        'getOnlineInfo',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'lastInfoExist',
        'vendor',
        'model',
        'serial',
        'mac',
        'ip',
        'hard_ver',
        'soft_ver',
        'uptime',
        'sysUpTime',
        'lastMsgTime',
        'onlineInfoExist',
        'onlineInfoError',
        'cpeStateColor',
        'cpeStateText',
        'cpeStateIsError',
      ]
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main :icon="lastInfoLoading? 'loading rotating tone-500' : uptime ? 'status main-green' : onlineInfoExist ? 'status main-red' : 'status tone-500'" :text="vendor" :text2="model" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="(onlineInfoLoading || lastInfoLoading) ? 'sync rotating' : 'sync'" :disabled="loadingSomeOperation || lastInfoLoading" type="large" @click="getOnlineInfo(!1)"/>
      </title-main>
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px">
      <info-value v-if="uptime" label="sysUpTime" type="medium" withLine class="padding-unset">
        <span slot="value" :class="[uptime && 'main-green']">{{sysUpTime}}</span>
      </info-value>
      
      <info-value label="Серийный номер" :value="serial" type="medium" withLine class="padding-unset"/>
      
      <info-value label="Ревиизя" v-if="hard_ver" :value="hard_ver" type="medium" withLine class="padding-unset"/>
      
      <info-value label="Версия ПО" v-if="soft_ver" type="medium" withLine class="padding-unset">
        <span slot="value" :class="[!onlineInfoExist && 'tone-500']">{{soft_ver}}</span>
      </info-value>
      
      <info-value label="IP адрес" v-if="ip" type="medium" withLine class="padding-unset">
        <span slot="value" :class="[!onlineInfoExist && 'tone-500']">{{ip}}</span>
      </info-value>
      
      <info-value label="MAC адрес" v-if="mac" type="medium" withLine class="padding-unset">
        <span slot="value" :class="[!onlineInfoExist && 'tone-500']">{{mac}}</span>
      </info-value>
      
      <info-value v-if="!onlineInfoExist" label="Последняя активность" :value="lastMsgTime" type="medium" withLine class="padding-unset"/>
      
      <template v-if="lastInfoExist && !onlineInfoExist && !(onlineInfoLoading || lastInfoLoading)">
        <info-value v-if="!cpeStateIsError" label="Статус соединения" type="medium" withLine class="padding-unset">
          <span slot="value" :class="cpeStateColor">{{cpeStateText}}</span>
        </info-value>
      </template>
    </div>
    
    <template v-if="lastInfoExist && !onlineInfoExist && !(onlineInfoLoading || lastInfoLoading)">
      <template v-if="cpeStateIsError">
        <div class="divider-line"/>
        
        <div class="padding-left-right-8px">
          <CPEManagementErrorMessage userText="Ошибка взаимодействия с CPE"/>
        </div>
      </template>
    </template>
    
    <template v-if="onlineInfoError && !onlineInfoLoading">
      <div class="divider-line"/>
      
      <div class="padding-left-right-8px">
        <CPEManagementErrorMessage userText="Ошибка связи с CPE" :error="onlineInfoError"/>
      </div>
    </template>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementWANPortsInfo',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'onlineInfoLoading',
        'loadingSomeOperation',
      ],
      actions: [
        
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'auth_type',
        'portName',
        'mac',
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName/:portName', {
      getters: [
        'isPPPoE',
        'username',
        'wan_ip',
        'wan_gateway',
        'wan_mask',
        'dns_auto_enabled',
        'dns_servers',
      ]
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="wan" text="Соединение с интернет" class="padding-unset margin-top-bottom--8px">
        <button-sq icon="edit" :disabled="loadingSomeOperation" @click="$refs.CPEManagementWANConfigModalOLD.open()" type="large"/>
      </title-main>
      <CPEManagementWANConfigModalOLD ref="CPEManagementWANConfigModalOLD"/>
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px">
      <info-value label="Тип Авторизации" :value="auth_type" type="medium" withLine class="padding-unset"/>
      <info-value v-if="isPPPoE" label="Логин" :value="username" type="medium" withLine class="padding-unset"/>
      <info-value label="MAC-адрес" :value="mac" type="medium" withLine class="padding-unset"/>
      <info-value label="IP адрес" :value="wan_ip" type="medium" withLine class="padding-unset"/>
      <info-value label="Шлюз" :value="wan_gateway" type="medium" withLine class="padding-unset"/>
      <info-value label="Маска" :value="wan_mask" type="medium" withLine class="padding-unset"/>
      <info-value label="DNS серверы" type="medium" withLine class="padding-unset">
        <span slot="value" :class="dns_auto_enabled ? 'main-green' : 'main-orange'">{{dns_auto_enabled ? 'Автоматически' : 'Вручную'}}</span>
      </info-value>
      <div class="font--12-400 text-align-right">{{dns_servers}}</div>
    </div>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementLANPortsInfo',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'loadingSomeOperation',
      ],
      actions: [
        'getOnlineInfo',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'lan_ip',
        'lan_mask',
        'subnet24',
        'lan_dhcp_min',
        'lan_dhcp_max',
        'dhcpRange',
        'dhcpEnText',
        'igmpEnText',
      ]
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="lan" text="Локальная сеть" class="padding-unset margin-top-bottom--8px">
        <button-sq icon="edit" disabled type="large" @click=""/>
      </title-main>
      <!--<CpeSetLanModal ref="CpeSetLanModal" v-bind="$route.params"/>-->
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px">
      <info-value label="Локальный IP адрес" :value="lan_ip" type="medium" withLine class="padding-unset"/>
      <info-value label="Маска подсети" :value="lan_mask" type="medium" withLine class="padding-unset"/>
      <info-value label="DHCP сервер" :value="dhcpEnText" type="medium" withLine class="padding-unset"/>
      <info-value label="Диапазон IP адресов" v-if="subnet24" :value="dhcpRange" type="medium" withLine class="padding-unset"/>
      <template v-else>
        <info-value label="Начальный IP адрес" v-if="lan_dhcp_min" :value="lan_dhcp_min" type="medium" withLine class="padding-unset"/>
        <info-value label="Конечный IP адрес" v-if="lan_dhcp_max" :value="lan_dhcp_max" type="medium" withLine class="padding-unset"/>
      </template>
      <info-value label="IGMP" :value="igmpEnText" type="medium" withLine class="padding-unset"/>
    </div>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementWiFiModulesInfo',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'loadingSomeOperation',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'wpsEnText',
      ]
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="wifi" text="Беспроводная сеть" class="padding-unset margin-top-bottom--8px">
        <button-sq icon="edit" :disabled="loadingSomeOperation" @click="$refs.CPEManagementWiFiConfigModalOLD.open()" type="large"/>
      </title-main>
      <CPEManagementWiFiConfigModalOLD ref="CPEManagementWiFiConfigModalOLD"/>
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px">
      <info-value label="WPS" :value="wpsEnText" type="medium" withLine class="padding-unset"/>
    </div>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementEthernetPortInfo',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'loadingSomeOperation',
      ],
      actions: [
        'getOnlineInfo',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'portName',
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName/:portName', {
      getters: [
        'portLabel',
        'linkUp',
        'speedText',
        'speedWarn',
        'crcErrorsText',
        'packetsRX',
        'packetsTX',
      ]
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main :icon="linkUp ? 'status main-green' : 'status tone-500'" :text="portLabel" :text2="speedText" :text2Class="speedWarn ? 'main-orange' : 'tone-500'" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="(onlineInfoLoading || lastInfoLoading) ? 'sync rotating' : 'sync'" :disabled="loadingSomeOperation || lastInfoLoading" type="large" @click="getOnlineInfo(!1)"/>
      </title-main>
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px">
      <info-value label="CRC ошибки (rx/tx)" :value="crcErrorsText" type="medium" withLine class="padding-unset"/>
      <info-value label="Packet RX" :value="packetsRX" type="medium" withLine class="padding-unset"/>
      <info-value label="Packet TX" :value="packetsTX" type="medium" withLine class="padding-unset"/>
    </div>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementPortSelect',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'portName',
        'portsSections',
        'counters',
        'label'
      ],
      actions: [
        'selectPort'
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName/:portName', {
      getters: [
        'portLabel',
      ],
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="view-module" :text="label" class="padding-unset margin-top-bottom--8px">
        
      </title-main>
    </div>
    <div class="divider-line"/>
    <LineScrollSelector2 v-bind="{
      selectedItem: {portName,portLabel},
      items: portsSections,
      counters
    }" hideZeroCounter idKey="portName" labelKey="portLabel" counterKey="portName" @onSelect="selectPort"/>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementSelectedPort',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'portName',
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName/:portName', {
      getters: [
        'portLabel',
        'portComponents',
      ],
    });
  },
  template:`<div class="display-flex flex-direction-column gap-8px" v-if="portName">
    <component v-for="(component, index) of portComponents" :key="index" :is="component"/>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementPortHostList',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'loadingSomeOperation',
      ],
      actions: [
        'getOnlineInfo',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'portName',
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName/:portName', {
      getters: [
        'countHosts',
        'hostsIDs',
      ]
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="factors" text="Подключения" :text2="countHosts || 'нет'" :text2Class="countHosts ? '' : 'tone-500'" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="(onlineInfoLoading || lastInfoLoading) ? 'sync rotating' : 'sync'" :disabled="loadingSomeOperation || lastInfoLoading" type="large" @click="getOnlineInfo(!1)"/>
      </title-main>
    </div>
    
    <template v-for="hostID of hostsIDs">
      <div class="divider-line"/>
      <CPEManagementPortHost v-bind="{hostID}"/>
    </template>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementPortHost',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'portName',
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName/:portName/Hosts/:hostID', {
      getters: [
        'ip',
        'hostUpTime',
        'hostname',
        'oui',
        'mac',
        'uptime',
      ]
    });
  },
  template:`<div>
    <div class="padding-left-12px">
      <title-main icon="phone" :text="ip || mac" class="padding-unset margin-top-bottom--8px">
        
      </title-main>
    </div>
    
    <div class="padding-left-right-12px">
      <info-value v-if="hostname" :label="hostname" value type="medium" class="padding-unset"/>
      <div class="font--12-400">{{oui}}</div>
      <info-value label="MAC адрес" :value="mac" type="medium" withLine class="padding-unset"/>
      <info-value v-if="uptime" label="UpTime" type="medium" withLine class="padding-unset">
        <span slot="value" class="main-green">{{hostUpTime}}</span>
      </info-value>
    </div>
  </div>`,
  props: {
    hostID: {type: [String, Number], default: '',requred: !0}
  },
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementWiFiModuleInfo',{
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'loadingSomeOperation',
      ],
      actions: [
        'getOnlineInfo',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections', {
      getters: [
        'sectionName',
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName', {
      getters: [
        'portName',
      ]
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Sections/:sectionName/:portName', {
      getters: [
        'moduleLabel',
        'moduleOn',
        'moduleEn',
        'visibleEn',
        'modes',
        'bandwidth',
        'autoChannelEn',
        'channel',
        'ssid',
        'packetsRX',
        'packetsTX',
      ]
    });
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main :icon="moduleOn ? 'status main-green' : 'status tone-500'" :text="moduleLabel" :text2="moduleEn ? '' : 'отключен'" text2Class="tone-500" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="(onlineInfoLoading || lastInfoLoading) ? 'sync rotating' : 'sync'" :disabled="loadingSomeOperation || lastInfoLoading" type="large" @click="getOnlineInfo(!1)"/>
      </title-main>
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px">
      <info-value label="Имя сети" :value="ssid" type="medium" withLine class="padding-unset"/>
      <info-value label="Режим" :value="modes" type="medium" withLine class="padding-unset"/>
      <info-value label="Ширина канала" :value="bandwidth" type="medium" withLine class="padding-unset"/>
      <info-value :label="autoChannelEn ? 'Автовыбор канала' :'Номер канала'" :value="channel" type="medium" withLine class="padding-unset"/>
      <info-value label="Видимость сети" :value="visibleEn ? 'Да' : 'Скрыта'" type="medium" withLine class="padding-unset"/>
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px"> 
      <info-value label="Packet RX" :value="packetsRX" type="medium" withLine class="padding-unset"/>
      <info-value label="Packet TX" :value="packetsTX" type="medium" withLine class="padding-unset"/>
    </div>
  </div>`,
  computed:mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementSpeedTest', {
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'onlineInfoExist',
        'loadingSomeOperation',
      ],
      actions: [
        
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/SpeedTest', {
      getters: [
        'CONST',
        'loaderID_DL',
        'loaderID_UL',
        'doCPESpeedTestResult',
        'doCPESpeedTestError',
        'speedTestDLState',
        'speedTestDLSpeed',
        'speedTestULState',
        'speedTestULSpeed',
        'doCPESpeedTestLoadingAnimationEnd',
      ],
      actions: [
        'doCPESpeedTest',
        'onAnimationEndDL',
        'onAnimationEndUL',
      ],
    });
  },
  template: `<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px" v-if="onlineInfoExist">
    <div class="padding-left-right-8px">
      <div class="display-flex align-items-center justify-content-space-between gap-8px">
        <div class="width-100-100">
          <div v-if="doCPESpeedTestLoadingAnimationEnd || doCPESpeedTestError" class="display-flex flex-direction-column">
            <UILinearProgressLoader v-bind="{
              loaderID: loaderID_DL,
              maxTime: CONST.LOADER_DL_MAX_TIME,
              lineColor: CONST.LOADER_LINE_COLOR,
              fillColor: CONST.LOADER_FILL_COLOR,
              height: CONST.LOADER_HEIGHT,
            }" v-on="{
              onMinEnd: () => onAnimationEndDL(),
              onMaxEnd: () => onAnimationEndDL(),
            }" rounded showPercent>
              <div slot="prefix" class="font--13-500 tone-500">DL:</div>
            </UILinearProgressLoader>
            
            <UILinearProgressLoader v-bind="{
              loaderID: loaderID_UL,
              maxTime: CONST.LOADER_UL_MAX_TIME,
              lineColor: CONST.LOADER_LINE_COLOR,
              fillColor: CONST.LOADER_FILL_COLOR,
              height: CONST.LOADER_HEIGHT,
            }" v-on="{
              onMinEnd: () => onAnimationEndUL(),
              onMaxEnd: () => onAnimationEndUL(),
            }" rounded showPercent>
              <div slot="prefix" class="font--13-500 tone-500">UL:</div>
            </UILinearProgressLoader>
          </div>
          
          <div v-else-if="doCPESpeedTestResult" class="display-flex flex-direction-column">
            <div class="display-flex align-items-center gap-4px">
              <div class="font--13-500 tone-500">DL:</div>
              <div class="font--13-500">{{speedTestDLSpeed}}</div>
              <div class="font--13-500 tone-500">{{speedTestDLState}}</div>
            </div>
            
            <div class="display-flex align-items-center gap-4px">
              <div class="font--13-500 tone-500">UL:</div>
              <div class="font--13-500">{{speedTestULSpeed}}</div>
              <div class="font--13-500 tone-500">{{speedTestULState}}</div>
            </div>
          </div>
        </div>
        
        <button-main label="SpeedTest" @click="doCPESpeedTest" v-bind="{
          loading: doCPESpeedTestLoadingAnimationEnd,
          disabled: doCPESpeedTestLoadingAnimationEnd || lastInfoLoading || loadingSomeOperation,
        }" buttonStyle="outlined" size="content"/>
      </div>
    </div>
    
    <div class="padding-left-right-8px" v-if="!doCPESpeedTestLoadingAnimationEnd && doCPESpeedTestError">
      <CPEManagementErrorMessage userText="Ошибка связи с CPE" :error="doCPESpeedTestError"/>
    </div>
  </div>`,
  computed: mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementReboot', {
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'onlineInfoExist',
        'loadingSomeOperation',
      ],
      actions: [
        
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/Reboot', {
      getters: [
        'CONST',
        'loaderID',
        'doCPERebootResult',
        'doCPERebootError',
        'doCPERebootLoadingAnimationEnd',
      ],
      actions: [
        'doCPEReboot',
        'onAnimationEnd',
      ],
    });
  },
  template: `<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px" v-if="onlineInfoExist">
    <div class="padding-left-right-8px">
      <div class="display-flex align-items-center justify-content-space-between gap-8px">
        <button-main label="Reboot" @click="doCPEReboot" v-bind="{
          loading: doCPERebootLoadingAnimationEnd,
          disabled: doCPERebootLoadingAnimationEnd || lastInfoLoading || loadingSomeOperation,
        }" buttonStyle="outlined" size="content"/>
        
        <div class="width-100-100">
          <template v-if="doCPERebootLoadingAnimationEnd || doCPERebootError">
            <UILinearProgressLoader v-bind="{
              loaderID,
              maxTime: CONST.LOADER_MAX_TIME,
              lineColor: CONST.LOADER_LINE_COLOR,
              fillColor: CONST.LOADER_FILL_COLOR,
              height: CONST.LOADER_HEIGHT,
            }" v-on="{
              onMinEnd: () => onAnimationEnd(),
              onMaxEnd: () => onAnimationEnd(),
            }" rounded showPercent/>
          </template>
          
          <template v-else-if="doCPERebootResult">
            <div class="display-flex align-items-center gap-4px">
              <div class="font--13-500">OK</div>
              <div class="font--13-500 tone-500">#{{doCPERebootResult}}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <div class="padding-left-right-8px" v-if="!doCPERebootLoadingAnimationEnd && doCPERebootError">
      <CPEManagementErrorMessage userText="Ошибка связи с CPE" :error="doCPERebootError"/>
    </div>
  </div>`,
  computed: mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});

Vue.component('CPEManagementWiFiConfigModalOLD',{//TODO перенесено as-is из CpeSetWifiModal2, сделать по нормальному
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'mrID',
        'cpeID',
        'accountNumber',
        'loadingSomeOperation',
        'wlan24_initial',
        'wlan5_initial'
      ],
      actions: [
        'getOnlineInfo',
      ],
    });
  },
  template:`<div class="display-contents">
    <modal-container-custom ref="modal" :disabled="cpeUpdateLoading" @open="onModalOpen" @close="onModalClose" header :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
      <div class="margin-left-right-16px">
        <header class="margin-top-8px">
          <div class="font--18-600 tone-900 text-align-center">Wi-Fi</div>
          <div class="font--13-500 tone-500 text-align-center white-space-pre">{{cpeID}} • {{accountNumber}}</div>
        </header>
        
        <section class="margin-top-8px">
          <div class="display-flex align-items-center justify-content-space-between gap-4px">
            <div class="font--13-500" :class="[!commonMode&&'tone-500']">Настроить для всех диапазонов</div>
            <switch-el class="width-40px" v-model="commonMode" :disabled="cpeUpdateLoading"/>
          </div>
          <template v-if="commonMode">
            <div>
              <input-el label="Общее имя сети" v-model="commonSsid" :error="!!verifySsidText" :disabled="cpeUpdateLoading" placeholder="Не более 20 символов"/>
              <input-error :text="verifySsidText"/>
            </div>
            <div>
              <input-el label="Пароль для подключения" v-model="commonPass" :error="!!verifyPassText" :disabled="cpeUpdateLoading" placeholder="Не менее 8 символов"/>
              <input-error :text="verifyPassText"/>
            </div>
          </template>
        </section>
        
        <SectionBorder class="margin-top-8px position-relative" :class="[!wlan24_isEnabled&&'bg-tone-150']">
          <title-main :icon="'wifi'+(wlan24_isEnabled?' main-green':'')" text="2.4 ГГц сеть" :text2="!wlan24_isEnabled?'Отключена':''" text2Class="font--13-500 tone-500" @block-click="show.wlan24=!show.wlan24" :opened="show.wlan24"/>
          <div class="position-absolute" v-if="!wlan24_isEnabled" style="border-top:2px solid red;width:20px;top:19px;left:15px;transform:rotateZ(45deg);"></div>
          <template v-if="show.wlan24">
            <devider-line/>
            <div class="display-flex flex-direction-column gap-8px margin-8px">
              <div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan24_isEnabled&&'tone-500']">2.4 ГГц Включен</div>
                <switch-el class="width-40px" v-model="wlan24_isEnabled" :disabled="cpeUpdateLoading"/>
              </div>
              <div>
                <input-el label="Имя сети 2.4 ГГц" v-model="wlan24_ssid" :error="!!verifySsid24Text" :disabled="commonMode||!!commonSsid||!wlan24_isEnabled||cpeUpdateLoading" placeholder="Не более 25 символов"/>
                <input-error :text="verifySsid24Text"/>
              </div>
              <div>
                <input-el label="Пароль для подключения" v-model="wlan24.pass" :error="!!verifyPass24Text" :disabled="commonMode||!!commonPass||!wlan24_isEnabled||cpeUpdateLoading" placeholder="Не менее 8 символов"/>
                <input-error :text="verifyPass24Text"/>
              </div>
              <div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan24_isVisible&&'tone-500']">Сеть видна всем</div>
                <switch-el class="width-40px" v-model="wlan24_isVisible" :disabled="!wlan24_isEnabled||cpeUpdateLoading"/>
              </div>
              <select-el label="Радиорежим 2,4 ГГц" v-model="wlan24.beacontype" :items="beacontype_items" :disabled="!wlan24_isEnabled||cpeUpdateLoading"/>

              <!--<div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan24_isAutoBandwidthEnabled&&'tone-500']">Ширина канала автоматически</div>
                <switch-el class="width-40px" v-model="wlan24_isAutoBandwidthEnabled" :disabled="cpeUpdateLoading||!0"/>
              </div>-->
              <select-el label="Ширина канала (МГц)" v-model="wlan24.bandwidth" :items="wlan24_bandwidth_items" :disabled="!wlan24_isEnabled||wlan24_isAutoBandwidthEnabled||cpeUpdateLoading"/>

              <div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan24_isAutoChannelEnabled&&'tone-500']">Выбор канала автоматически</div>
                <switch-el class="width-40px" v-model="wlan24_isAutoChannelEnabled" :disabled="cpeUpdateLoading"/>
              </div>
              <select-el label="Канал 2,4 ГГц" v-model="wlan24.channel" :items="wlan24_possiblechannels_items" :disabled="!wlan24_isEnabled||wlan24_isAutoChannelEnabled||cpeUpdateLoading"/>
            </div>
          </template>
        </SectionBorder>
        
        <SectionBorder class="margin-top-8px position-relative" :class="[!wlan5_isEnabled&&'bg-tone-150']">
          <title-main :icon="'wifi'+(wlan5_isEnabled?' main-green':'')" text="5 ГГц сеть" :text2="!wlan5_isEnabled?'Отключена':''" text2Class="font--13-500 tone-500" @block-click="show.wlan5=!show.wlan5" :opened="show.wlan5"/>
          <div class="position-absolute" v-if="!wlan5_isEnabled" style="border-top:2px solid red;width:20px;top:19px;left:15px;transform:rotateZ(45deg);"></div>
          <template v-if="show.wlan5">
            <devider-line/>
            <div class="display-flex flex-direction-column gap-8px margin-8px">
              <div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan5_isEnabled&&'tone-500']">5 ГГц Включен</div>
                <switch-el class="width-40px" v-model="wlan5_isEnabled" :disabled="cpeUpdateLoading"/>
              </div>
              <div>
                <input-el label="Имя сети 5 ГГц" v-model="wlan5_ssid" :error="!!verifySsid5Text" :disabled="commonMode||!!commonSsid||!wlan5_isEnabled||cpeUpdateLoading" placeholder="Не более 25 символов"/>
                <input-error :text="verifySsid5Text"/>
              </div>
              <div>
                <input-el label="Пароль для подключения" v-model="wlan5.pass" :error="!!verifyPass5Text" :disabled="commonMode||!!commonPass||!wlan5_isEnabled||cpeUpdateLoading" placeholder="Не менее 8 символов"/>
                <input-error :text="verifyPass5Text"/>
              </div>
              <div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan5_isVisible&&'tone-500']">Сеть видна всем</div>
                <switch-el class="width-40px" v-model="wlan5_isVisible" :disabled="!wlan5_isEnabled||cpeUpdateLoading""/>
              </div>
              <select-el label="Радиорежим 5 ГГц" v-model="wlan5.beacontype" :items="beacontype_items" :disabled="!wlan5_isEnabled||cpeUpdateLoading"/>
              
              <!--<div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan5_isAutoBandwidthEnabled&&'tone-500']">Ширина канала автоматически</div>
                <switch-el class="width-40px" v-model="wlan5_isAutoBandwidthEnabled" :disabled="cpeUpdateLoading||!0"/>
              </div>-->
              <select-el label="Ширина канала (МГц)" v-model="wlan5.bandwidth" :items="wlan5_bandwidth_items" :disabled="!wlan5_isEnabled||wlan5_isAutoBandwidthEnabled||cpeUpdateLoading"/>
              
              <div class="display-flex align-items-center justify-content-space-between gap-4px">
                <div class="font--13-500" :class="[!wlan5_isAutoChannelEnabled&&'tone-500']">Выбор канала автоматически</div>
                <switch-el class="width-40px" v-model="wlan5_isAutoChannelEnabled" :disabled="cpeUpdateLoading"/>
              </div>
              <select-el label="Канал 5 ГГц" v-model="wlan5.channel" :items="wlan5_possiblechannels_items" :disabled="!wlan5_isEnabled||wlan5_isAutoChannelEnabled||cpeUpdateLoading"/>
            </div>
          </template>
        </SectionBorder>
        
        <section class="margin-top-8px">
          <loader-bootstrap v-if="cpeUpdateLoading" text="применение настроек"/>
          <template v-else-if="cpeUpdateResult">
            <message-el v-if="cpeUpdateResult?.data?.key" text="конфигурирование успешно" type="success" box class="margin-top-8px"/>
            <template v-else>
              <message-el text="ошибка конфигурации" :subText="cpeUpdateResult?.message" type="warn" box class="margin-top-8px"/>
              <info-text-sec :text="cpeUpdateResult?.text" class="padding-left-right-0"/>
            </template>
          </template>
        </section>
        
        <section class="display-flex align-items-center justify-content-space-between width-100-100 margin-top-16px">
          <button-main label="Закрыть" @click="close" :disabled="cpeUpdateLoading" buttonStyle="outlined" size="content" icon="close-1"/>
          <button-main label="Применить" @click="save" :disabled="!!verifyText||cpeUpdateLoading" buttonStyle="contained" size="content"/>
        </section>
      </div>
    </modal-container-custom>
  </div>`,
  data:()=>({
    show:{
      wlan24:false,
      wlan5:false,
    },
    commonMode:true,
    commonSsid:'',
    commonPass:'',
    wlan24_isEnabled:false,
    wlan5_isEnabled:false,
    wlan24_isVisible:false,
    wlan5_isVisible:false,
    wlan24_isAutoChannelEnabled:false,
    wlan5_isAutoChannelEnabled:false,
    wlan24_isAutoBandwidthEnabled:false,
    wlan5_isAutoBandwidthEnabled:false,
    wlan24_ssid:'',
    wlan5_ssid:'',
    wlan24:{
      visibility:null,
      bandwidth:null,
      autobandwidthenable:null,
      beacontype:null,
      channel:null,
      autochannelenable:null,
      enabled:null,
      ssid:'',
      pass:null,
    },
    wlan5:{
      visibility:null,
      bandwidth:null,
      autobandwidthenable:null,
      beacontype:null,
      channel:null,
      autochannelenable:null,
      enabled:null,
      ssid:'',
      pass:'',
    },
    cpeUpdateLoading:!1,
    cpeUpdateResult:null,
  }),
  watch:{
    'commonSsid'(commonSsid){
      if(commonSsid){
        this.wlan24_ssid=`MTS_${commonSsid}`;
        this.wlan5_ssid=`MTS_${commonSsid}`;
      }else{
        this.wlan24_ssid=this.wlan24.ssid;
        this.wlan5_ssid=this.wlan5.ssid;
      }
    },
    'commonPass'(commonPass){
      this.wlan24.pass=commonPass||'';
      this.wlan5.pass=commonPass||'';
    },
    'commonMode'(commonMode){
      if(!commonMode){
        this.commonSsid='';
        this.commonPass='';
      }
    },
    'cpeUpdateLoading'(cpeUpdateLoading){
      if(cpeUpdateLoading){
        this.show.wlan24=false;
        this.show.wlan5=false;
      }
    }
  },
  computed:{
    ...mapGetters('CPEManagement/CPEs',[
      'cpeKey',
    ]),
    wlan24_bandwidth_items(){return [...new Set([...ACS_CPE.wlan24.bandwidth.items,this.wlan24.bandwidth])].filter(Boolean)},
    wlan5_bandwidth_items(){return [...new Set([...ACS_CPE.wlan24.bandwidth.items,this.wlan5.bandwidth])].filter(Boolean)},
    beacontype_items(){return [...new Set(['11i',this.wlan24.beacontype,this.wlan5.beacontype])].filter(Boolean)},
    wlan24_possiblechannels_items(){return [...new Set([...this.wlan24_initial?.possiblechannels||[],this.wlan24.channel])].filter(Boolean)},
    wlan5_possiblechannels_items(){return [...new Set([...this.wlan5_initial?.possiblechannels||[],this.wlan5.channel])].filter(Boolean)},
    verifySsidText(){return this.commonSsid?.length>21?'Не более 20 символов':''},
    verifyPassText(){return !this.commonPass?.length?'':this.commonPass?.length<8?'Не менее 8 символов':''},
    verifySsid24Text(){return (!this.wlan24_ssid?.length||this.wlan24_ssid?.length>25)?'Не более 25 символов':''},
    verifySsid5Text(){return (!this.wlan5_ssid?.length||this.wlan5_ssid?.length>25)?'Не более 25 символов':''},
    verifyPass24Text(){return !this.wlan24.pass?.length?'':this.wlan24.pass?.length<8?'Не менее 8 символов':''},
    verifyPass5Text(){return !this.wlan5.pass?.length?'':this.wlan5.pass?.length<8?'Не менее 8 символов':''},
    verifyText(){return this.verifySsidText||this.verifyPassText||this.verifySsid24Text||this.verifySsid5Text||this.verifyPass24Text||this.verifyPass5Text},
  },
  methods:{
    open(){//public
      this.$refs.modal.open();
    },
    close(){//public
      this.$refs.modal.close();
    },
    onModalOpen(){
      this.init();
    },
    onModalClose(){
      this.getOnlineInfo(!1);
    },
    init(){
      this.wlan24 = {
        visibility: this.wlan24_initial.visibility,
        bandwidth: this.wlan24_initial.bandwidth,
        autobandwidthenable: this.wlan24_initial.autobandwidthenable,
        beacontype: this.wlan24_initial.beacontype,
        channel: +this.wlan24_initial.channel,
        autochannelenable: this.wlan24_initial.autochannelenable,
        enabled: this.wlan24_initial.enabled,
        ssid: this.wlan24_initial.ssid,
        pass: '',
      };
      this.wlan5 = {
        visibility: this.wlan5_initial.visibility,
        bandwidth: this.wlan5_initial.bandwidth,
        autobandwidthenable: this.wlan5_initial.autobandwidthenable,
        beacontype: this.wlan5_initial.beacontype,
        channel: +this.wlan5_initial.channel,
        autochannelenable: this.wlan5_initial.autochannelenable,
        enabled: this.wlan5_initial.enabled,
        ssid: this.wlan5_initial.ssid,
        pass: '',
      };
      this.wlan24_isEnabled=this.wlan24.enabled=='Up';
      this.wlan5_isEnabled=this.wlan5.enabled=='Up';
      this.wlan24_isVisible=this.wlan24.visibility=='Up';
      this.wlan5_isVisible=this.wlan5.visibility=='Up';
      this.wlan24_isAutoChannelEnabled=this.wlan24.autochannelenable=='Up';
      this.wlan5_isAutoChannelEnabled=this.wlan5.autochannelenable=='Up';
      this.wlan24_isAutoBandwidthEnabled=this.wlan24.autobandwidthenable=='Up';
      this.wlan5_isAutoBandwidthEnabled=this.wlan5.autobandwidthenable=='Up';
      this.wlan24_ssid=this.wlan24.ssid;
      this.wlan5_ssid=this.wlan5.ssid;
    },
    async save(){
      this.wlan24.enabled=this.wlan24_isEnabled?'Up':'Down';
      this.wlan5.enabled=this.wlan5_isEnabled?'Up':'Down';
      this.wlan24.visibility=this.wlan24_isVisible?'Up':'Down';
      this.wlan5.visibility=this.wlan5_isVisible?'Up':'Down';
      this.wlan24.autochannelenable=this.wlan24_isAutoChannelEnabled?'Up':'Down';
      this.wlan5.autochannelenable=this.wlan5_isAutoChannelEnabled?'Up':'Down';
      this.wlan24.autobandwidthenable=this.wlan24_isAutoBandwidthEnabled?'Up':'Down';
      this.wlan5.autobandwidthenable=this.wlan5_isAutoBandwidthEnabled?'Up':'Down';
      this.wlan24.ssid=this.wlan24_ssid.replace(/(_|-|)(2.4|5)GHz(_|-|)/gi,'');//префикс подставляется на BE
      this.wlan5.ssid=this.wlan5_ssid.replace(/(_|-|)(2.4|5)GHz(_|-|)/gi,'');//префикс подставляется на BE
      
      this.cpeUpdateLoading = !0;
      this.cpeUpdateResult = null;
      const params = {
        wlan24:ACS_CPE.getDiffParams({...this.wlan24_initial,pass:''},this.wlan24),
        wlan5:ACS_CPE.getDiffParams({...this.wlan5_initial,pass:''},this.wlan5),
      };
      try{
        //const response = await AxirosService.doCPEUpdate(this.mrID, this.cpeID, params);
        //axiro
        const response = await AxirosService.post('cpe_update',{mr:this.mrID,cpeid:this.cpeID,...params})
        this.cpeUpdateResult = response;
      }catch(error){
        
      };
      this.$report([this.$options.name,{
        mrID: this.mrID,
        cpeID: this.cpeID,
        accountNumber: this.accountNumber,
        params,
        response: this.cpeUpdateResult
      }])
      this.cpeUpdateLoading = !1;
    },
  },
});

Vue.component('CPEManagementWANConfigModalOLD',{//TODO перенесено as-is из CpeSetWanModal, сделать по нормальному
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'mrID',
        'cpeID',
        'accountNumber',
        'loadingSomeOperation',
        'auth_type',
        'wan_def',
        'wan',
      ],
      actions: [
        'getOnlineInfo',
      ],
    });
  },
  template:`<div class="display-contents">
    <modal-container-custom ref="modal" :disabled="cpeUpdateLoading" @open="onModalOpen" @close="onModalClose" header :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
      <div class="margin-left-right-16px">
        <header class="margin-top-8px">
          <div class="font--18-600 tone-900 text-align-center">WAN</div>
          <div class="font--13-500 tone-500 text-align-center white-space-pre">{{cpeID}} • {{accountNumber}}</div>
        </header>
        
        <section class="margin-top-8px">
          <select-el label="Тип авторизации" v-model="config.auth_type" :items="authTypes"/>
        </section>
        
        <SectionBorder class="margin-top-8px padding-8px">
          
          <template v-if="['IPoE_Dynamic','IPoE_Static'].includes(config.auth_type)">
            <div class="display-flex align-items-center justify-content-space-between gap-4px">
              <div class="font--13-500" :class="[!ipoe_dhcp&&'tone-500']">IP адрес автоматически</div>
              <switch-el class="width-40px" v-model="ipoe_dhcp" :disabled="cpeUpdateLoading"/>
            </div>
            <div>
              <input-el label="IP адрес WAN" v-model="config.wan.wan_ip" :error="!!verifyText" :disabled="ipoe_dhcp||cpeUpdateLoading"/>
              <input-error :text="verifyText"/>
            </div>
            <div>
              <input-el label="Маска подсети" v-model="config.wan.wan_mask" :error="!!verifyText" :disabled="ipoe_dhcp||cpeUpdateLoading"/>
              <input-error :text="verifyText"/>
            </div>
            <div>
              <input-el label="IP адрес шлюза" v-model="config.wan.wan_gateway" :error="!!verifyText" :disabled="ipoe_dhcp||cpeUpdateLoading"/>
              <input-error :text="verifyText"/>
            </div>
          </template>
          
          
          <template v-if="['PPPoE','L2TP'].includes(config.auth_type)">
            <div class="display-flex align-items-center justify-content-space-between gap-4px">
              <div class="font--13-500" :class="[!credentials&&'tone-500']">Учетные данные из биллинга</div>
              <switch-el class="width-40px" v-model="credentials" :disabled="cpeUpdateLoading"/>
            </div>
          </template>
          
          <template v-if="config.auth_type=='L2TP'">
            <div>
              <input-el label="L2TP сервер" v-model="config.wan.l2tp_server" :error="!!verifyText" :disabled="cpeUpdateLoading"/>
              <input-error :text="verifyText"/>
            </div>
          </template>
          
          <template v-if="['PPPoE','L2TP'].includes(config.auth_type)">
            <div>
              <input-el label="Логин" v-model="userName" :error="!!verifyText" :disabled="cpeUpdateLoading||credentials"/>
              <input-error :text="verifyText"/>
            </div>
            <div>
              <input-el
                label="Пароль"
                v-model="userPassword"
                :type="credentials ? 'password' : 'text'"
                :error="!!verifyText"
                :disabled="cpeUpdateLoading||credentials"
              />
              <input-error :text="verifyText"/>
            </div>
          </template>
          
        </SectionBorder>
        
        <SectionBorder class="margin-top-8px padding-8px">
          <div class="display-flex align-items-center justify-content-space-between gap-4px">
            <div class="font--13-500" :class="[!dns_auto_enabled&&'tone-500']">DNS-сервер автоматически</div>
            <switch-el class="width-40px" v-model="dns_auto_enabled" :disabled="cpeUpdateLoading"/>
          </div>
          <template v-if="!dns_auto_enabled">
            <select-el label="DNS-сервер"" v-model="dns_name" :items="Object.keys(dns_items)" :disabled="cpeUpdateLoading"/>
            <info-value label="Master DNS" :value="dns[0]" withLine class="padding-left-right-0"/>
            <info-value label="Slave DNS" :value="dns[1]" withLine class="padding-left-right-0"/>
          </template>
        </SectionBorder>
        
        <section class="margin-top-8px">
          <loader-bootstrap v-if="cpeUpdateLoading" text="применение настроек"/>
          <template v-else-if="cpeUpdateResult">
            <message-el v-if="cpeUpdateResult?.data?.key" text="конфигурирование успешно" type="success" box class="margin-top-8px"/>
            <template v-else>
              <message-el text="ошибка конфигурации" :subText="cpeUpdateResult?.message" type="warn" box class="margin-top-8px"/>
              <info-text-sec :text="cpeUpdateResult?.text" class="padding-left-right-0"/>
            </template>
          </template>
        </section>
        
        <section class="display-flex align-items-center justify-content-space-between width-100-100 margin-top-16px">
          <button-main label="Закрыть" @click="close" :disabled="cpeUpdateLoading" buttonStyle="outlined" size="content" icon="close-1"/>
          <button-main label="Применить" @click="save" :disabled="!!verifyText||cpeUpdateLoading" buttonStyle="contained" size="content"/>
        </section>
      </div>
    </modal-container-custom>
  </div>`,
  data:()=>({
    credentials:false,
    dns_auto_enabled:false,
    ipoe_dhcp:false,
    config:{
      auth_type:'',
      wan:{
        dns_auto_enabled:null,
        dns_servers:'',
        wan_def:'',
        wan_ip:'',
        wan_mask:'',
        wan_gateway:'',
        l2tp_server:'',
        username:'',
        password:'',
      },
    },
    authTypes:['IPoE_Dynamic','PPPoE','IPoE_Static','L2TP'],
    dns_name:'',
    dns_items:{
      'Google Public DNS':'8.8.8.8,8.8.4.4',
      'Яндекс DNS':'77.88.8.8,77.88.8.1',
      'Яндекс DNS Security':'77.88.8.88,77.88.8.2',
      'Яндекс DNS Family':'77.88.8.7,77.88.8.3',
      'Cloudflare DNS':'1.1.1.1,1.0.0.1',
      'Cloudflare DNS Security':'1.1.1.1,1.0.0.2',
      'Cloudflare DNS Family':'1.1.1.1,1.0.0.3',
    },
    userName: null,
    userPassword: null,
    
    cpeUpdateLoading:!1,
    cpeUpdateResult:null,
  }),
  watch:{
    'credentials'(credentials){
      this.defineLoginAndRassword();
    },
    'dns_auto_enabled'(dns_auto_enabled){
      if(dns_auto_enabled){
        this.config.wan.dns_servers=this.initial.wan.dns_servers;
      };
      this.config.wan.dns_auto_enabled=dns_auto_enabled?'Up':'Down';
    },
    'dns_name'(dns_name){
      if(dns_name){
        this.config.wan.dns_servers=this.dns_items[dns_name];
        //this.dns_auto_enabled=false;
      }
    },
    'ipoe_dhcp'(ipoe_dhcp){
      this.config.auth_type=ipoe_dhcp?'IPoE_Dynamic':'IPoE_Static';
      if(!ipoe_dhcp){
        this.dns_auto_enabled=false;
      }
    },
    'config.auth_type'(auth_type){
      if(['IPoE_Dynamic','IPoE_Static'].includes(auth_type)){
        this.ipoe_dhcp=auth_type!='IPoE_Static';
      }
    },
    'config.wan.dns_auto_enabled'(dns_auto_enabled){
      this.dns_auto_enabled=dns_auto_enabled=='Up';
    },
  },
  computed:{
    ...mapGetters('CPEManagement/CPEs',[
      'cpeKey',
    ]),
    dns(){return this.config.wan.dns_servers.split(',')},
    initial(){
      const {dns_auto_enabled,dns_servers,wan_ip,wan_mask,wan_gateway,l2tp_server,username}=this.wan;
      return {
        auth_type: this.auth_type,
        wan:{
          wan_def:this.wan_def||'',
          dns_auto_enabled:dns_auto_enabled||'',
          dns_servers:dns_servers||'',
          wan_ip:wan_ip||'',
          wan_mask:wan_mask||'',
          wan_gateway:wan_gateway||'',
          l2tp_server:l2tp_server||'',
          username:username||'',
          password:'',
        },
      }
    },
    verifyText(){return ''},
    accountLoginAndPassword() {
      if (this.accountData?.vgroups?.length) {
        const vgroup = this.accountData.vgroups.find(vgroup => vgroup.isSession);
        return {
          login: vgroup?.login,
          password: vgroup?.pass
        }
      }
      const key = `${this.account}-customer-info`;
      const forisData = localStorageCache.getItem(key, this.resps);
      const forisInternetServices = forisData?.getCustomerResources?.internet?.length
        ? forisData.getCustomerResources.internet
        : this.accountData?.resources?.internet;

      if (forisInternetServices?.length) {
        const service = forisInternetServices.find(service => !!service.device?.find(({ serial, id }) => [serial, id].includes(this.serial)));
        return {
          login: service?.xRadLoginPass?.login,
          password: service?.xRadLoginPass?.password
        }
      }
      return null;
    }
  },
  methods:{
    defineLoginAndRassword() {
      if (this.credentials) {
        this.userName = this.accountLoginAndPassword?.login || 'Error: Not found';
        this.userPassword = this.accountLoginAndPassword?.password || 'Error: Not found';
      } else {
        this.userName = this.config.wan.username;
        this.userPassword = this.config.wan.password;
      }
    },
    open(){//public
      this.$refs.modal.open();
    },
    close(){//public
      this.$refs.modal.close();
    },
    onModalOpen(){
      this.init();
    },
    onModalClose(){
      this.getOnlineInfo(!1);
    },
    init(){
      this.config.auth_type=this.initial.auth_type?(this.authTypes.find(type=>new RegExp(type,'gi').test(this.initial.auth_type||''))||''):'';
      if(!this.config.auth_type&&this.initial.auth_type){
        this.authTypes.push(this.initial.auth_type);
        this.init();
        return
      };
      this.$set(this.dns_items,'Current',this.initial.wan.dns_servers);
      this.config.wan={...this.initial.wan};
      this.defineLoginAndRassword();
    },
    async save(){
      const isAuthTypeUpdate=!new RegExp(this.initial.auth_type||'','gi').test(this.config.auth_type||'');
      const {wan_def,dns_auto_enabled,dns_servers,wan_ip,wan_mask,wan_gateway,l2tp_server}=this.config.wan;
      
      this.cpeUpdateLoading = !0;
      this.cpeUpdateResult = null;
      const params = {
        ...isAuthTypeUpdate?{
          wan_new:this.config.auth_type.toLowerCase(),//'ipoe_dynamic':'ipoe_static','l2tp','pppoe'
          auth_type:this.config.auth_type,
        }:null,
        wan:{
          ...ACS_CPE.getDiffParams(this.initial.wan,this.config.wan),
          wan_def,//required
          ...this.config.auth_type=='IPoE_Static'?{
            wan_ip,
            wan_mask,
            wan_gateway,
            dns_auto_enabled:'Down',
            dns_servers,
          }:null,
          username: this.userName,
          password: this.userPassword,
        }
      };
      try{
        //const response = await AxirosService.doCPEUpdate(this.mrID, this.cpeID, params);
        //axiro
        const response = await AxirosService.post('cpe_update',{mr:this.mrID,cpeid:this.cpeID,...params})
        this.cpeUpdateResult = response;
      }catch(error){
        
      };
      this.$report([this.$options.name,{
        mrID: this.mrID,
        cpeID: this.cpeID,
        accountNumber: this.accountNumber,
        params,
        response: this.cpeUpdateResult
      }])
      this.cpeUpdateLoading = !1;
    },
  },
});

Vue.component('CPEManagementRestoreConfig', {
  beforeCreate(){
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey', {
      getters: [
        'lastInfoLoading',
        'onlineInfoLoading',
        'onlineInfoExist',
        'loadingSomeOperation',
      ],
      actions: [
        
      ],
    });
    this.$mapDynamicNamespace('CPEManagement/CPEs/:cpeKey/RestoreConfig', {
      getters: [
        'savedConfigsLoading',
        'savedConfigsResult',
        'savedConfigsError',
        'savedConfigsList',
        'selectedConfig',
        'CONST',
        'loaderID',
        'doCPERestoreConfigResult',
        'doCPERestoreConfigError',
        'doCPERestoreConfigLoadingAnimationEnd',
        'ticketid',
      ],
      actions: [
        'selectConfig',
        'doCPERestoreConfig',
        'onAnimationEnd',
      ],
    });
  },
  template: `<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px" v-if="onlineInfoExist">
    <div class="padding-left-12px">
      <title-main icon="view-list" text="Выбор конфигурации" class="padding-unset margin-top-bottom--8px"/>
    </div>
    
    <template v-if="savedConfigsError || savedConfigsResult">
      <div class="divider-line"/>
      
      <div class="padding-left-right-8px" v-if="!savedConfigsLoading && savedConfigsError">
        <CPEManagementErrorMessage userText="Ошибка получения конфигураций" :error="savedConfigsError"/>
      </div>
      
      <div class="padding-left-right-12px" v-else-if="savedConfigsResult">
        <div class="border-1px-solid-c8c7c7 border-radius-4px">
          <radio-select-el ref="cfg_selector" :list="savedConfigsList" keyName="cfgid" keyLabel="label" keyLabel2="date" keyLabel3="comments" keyDisabled="disabled" @selected="selectConfig" :value="selectedConfig" reverse/>
        </div>
      </div>
    </template>
    
    <div class="padding-left-right-8px" v-if="savedConfigsResult">
      <div class="display-flex align-items-center justify-content-space-between gap-8px">
        <div class="width-100-100">
          <template v-if="doCPERestoreConfigLoadingAnimationEnd || doCPERestoreConfigError">
            <UILinearProgressLoader v-bind="{
              loaderID: loaderID,
              maxTime: CONST.LOADER_MAX_TIME,
              lineColor: CONST.LOADER_LINE_COLOR,
              fillColor: CONST.LOADER_FILL_COLOR,
              height: CONST.LOADER_HEIGHT,
            }" v-on="{
              onMinEnd: () => onAnimationEnd(),
              onMaxEnd: () => onAnimationEnd(),
            }" rounded showPercent/>
          </template>
          
          <template v-else-if="doCPERestoreConfigResult">
            <div class="display-flex align-items-center gap-4px">
              <div class="font--13-500">OK</div>
              <div class="font--13-500 tone-500">#{{ticketid}}</div>
            </div>
          </template>
        </div>
        
        <button-main label="RestoreConfig" @click="doCPERestoreConfig" v-bind="{
          loading: doCPERestoreConfigLoadingAnimationEnd,
          disabled: doCPERestoreConfigLoadingAnimationEnd || lastInfoLoading || loadingSomeOperation || !selectedConfig,
        }" buttonStyle="outlined" size="content"/>
      </div>
    </div>
    
    <div class="padding-left-right-8px" v-if="!doCPERestoreConfigLoadingAnimationEnd && doCPERestoreConfigError">
      <CPEManagementErrorMessage userText="Ошибка связи с CPE" :error="doCPERestoreConfigError"/>
    </div>
  </div>`,
  watch: {
    'ticketid'(ticketid){
      if(ticketid){
        this.$refs.cfg_selector.unselect();
      }
    }
  },
  computed: mapGetters('CPEManagement/CPEs',[
    'cpeKey',
  ]),
});


const createSubModuleCPEManagement_CPE_Port_Host = function(modulePath, host = null){
  return STORE.createSubModule(modulePath, {
    state: {
      _host: host ? Object.freeze(host) : null,
      _oui: '',
    },
    getters: {
      ip: STORE.getters.getStateProp('_host.ip', CAST.toEmptyString),
      mac: STORE.getters.getStateProp('_host.mac', CAST.toEmptyString),
      uptime: STORE.getters.getStateProp('_host.uptime', CAST.toEmptyString),
      hostname: STORE.getters.getStateProp('_host.hostname', CAST.toEmptyString),
      hostUpTime: (state, getters) => Datetools.duration(Number(getters.uptime)*1000),
      oui: (state) => state._oui || '',
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, commit}){
        if(!state._host.mac){return};
        try{
          const cache = localStorageCache.getItem(state._host.mac);
          const responseParsed = cache || await app.test_getMacVendorLookup([state._host.mac]);
          if(!cache){
            localStorageCache.setItem(state._host.mac, responseParsed);
          };
          commit('_setStateProp', {_oui: responseParsed?.[state._host.mac] || ''});
        }catch(error){
          console.warn(error)
        };
      },
    },
  })
};

const _createSubModuleCPEManagement_CPE_Port = function(modulePath, portName = '', port = null, options = {}){
  const {state = {}, getters = {}, mutations = {}, actions = {}} = options;
  return STORE.createSubModule(modulePath, {
    state: {
      ...state,
      _portName: portName,
      _port: port ? Object.freeze(port) : null,
    },
    getters: {
      portLabel: (state) => state._portName.toUpperCase(),
      
      countHosts: (state, getters) => getters['Hosts/count'] || 0,
      
      portComponents: (state) => [
        Vue.component(`CPEManagementSectionCPEPortDefault`,{
          template:`<div class="white-block-100 padding-left-right-8px">
            <div class="text-align-center">${state._portName}</div>
          </div>`,
        })
      ],
      ...getters,
      portName: STORE.getters.getStateProp('_portName', CAST.toEmptyString),
      port: STORE.getters.getStateProp('_port', CAST.toEmptyObject),
      
      hostsIDs: (state, getters) => getters['Hosts/$subModulesKeys'],
    },
    mutations: {
      ...mutations,
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      ...actions,
      async $initModule({state, dispatch}){
        dispatch('$addSubModule', STORE.createSubModule([state.$modulePath, 'Hosts'], {
          getters: {
            count: (state, getters) => getters.$subModulesKeys.length,
          }
        }));
        dispatch('setHosts');
      },
      async setPortInfo({dispatch, commit}, _port = null){
        commit('_setStateProp', {_port: _port ? Object.freeze(_port) : null});
        dispatch('setHosts');
      },
      async setHosts({state, getters, dispatch}){
        await dispatch('Hosts/$delSubModules');
        const hosts = state._port.hosts || [];
        if(!hosts.length){return};
        for(const host of hosts){
          dispatch('Hosts/$addSubModule', createSubModuleCPEManagement_CPE_Port_Host([getters.$getSubModule('Hosts'), host.mac], host));
        };
      }
    },
  })
};

const _createSubModuleCPEManagement_CPE_EthernetPort = function(modulePath, portName = '', port = null, options = {}){
  const {state = {}, getters = {}, mutations = {}, actions = {}} = options;
  return _createSubModuleCPEManagement_CPE_Port(modulePath, portName, port, {
    state: {
      ...state,
    },
    getters: {
      ...getters,
      linkUp: (state) => state._port?.status == 'Up',
      speedWarn: (state, getters) => getters.linkUp && state._port?.rate == 10,
      speedText: (state, getters) => !getters.linkUp ? '' : !state._port?.rate ? 'Auto' : state._port?.rate === 'Auto' ? state._port?.rate : `${state._port?.rate} Мбит/с`,
      crcErrorsText: (state) => atop(state._port?.crc_in || 0, state._port?.crc_out || 0),
      packetsRX: STORE.getters.getStateProp('_port.received', CAST.toEmptyInt),
      packetsTX: STORE.getters.getStateProp('_port.sent', CAST.toEmptyInt),
    },
    mutations: {
      ...mutations,
    },
    actions: {
      ...actions,
    },
  })
};

const createSubModuleCPEManagement_CPE_LANPort = function(modulePath, portName = '', port = null){
  return _createSubModuleCPEManagement_CPE_EthernetPort(modulePath, portName, port, {
    state: {
      
    },
    getters: {
      portComponents: () => [
        'CPEManagementEthernetPortInfo',
        'CPEManagementPortHostList',
      ],
    },
    mutations: {
      
    },
    actions: {
      
    },
  })
};

const createSubModuleCPEManagement_CPE_WANPort = function(modulePath, portName = '', port = null, wanDef = ''){
  return _createSubModuleCPEManagement_CPE_EthernetPort(modulePath, portName, port, {
    state: {
      _wanDef: wanDef
    },
    getters: {
      portLabel: (state) => 'WAN порт',
      wanDef: (state) => state._wanDef || '',
      username: STORE.getters.getStateProp('_port.username', CAST.toEmptyString),
      isPPPoE: (state) => state._port?.auth_type === 'pppoe',
      wan_ip: STORE.getters.getStateProp('_port.wan_ip', CAST.toEmptyString),
      wan_gateway: STORE.getters.getStateProp('_port.wan_gateway', CAST.toEmptyString),
      wan_mask: STORE.getters.getStateProp('_port.wan_mask', CAST.toEmptyString),
      dns_auto_enabled: (state) => state._port?.dns_auto_enabled == 'Up',
      dns_servers: STORE.getters.getStateProp('_port.dns_servers', CAST.toEmptyString),
    },
    mutations: {
      
    },
    actions: {
      
    },
  })
};

const createSubModuleCPEManagement_CPE_WiFiPort = function(modulePath, portName = '', wlan = null){
  return _createSubModuleCPEManagement_CPE_Port(modulePath, portName, wlan, {
    state: {
      
    },
    getters: {
      portComponents: () => [
        'CPEManagementWiFiModuleInfo',
        'CPEManagementPortHostList',
      ],
      moduleLabel: (state) => (/24$/).test(state._portName) ? '2,4 ГГц' : /5$/.test(state._portName) ? '5 ГГц' : state._portName.toUpperCase(),
      moduleEn: (state) => state._port?.enabled == 'Up',
      moduleOn: (state) => state._port?.status == 'Up',
      visibleEn: (state) => state._port?.visibility == 'Up',
      modes: (state) => state._port?.standard || '',
      bandwidth: (state) => state._port?.bandwidth || '',
      autoChannelEn: (state) => state._port?.autochannelenable == 'Up',
      channel: (state) => state._port?.channel || '',
      ssid: (state) => state._port?.ssid || '',
      packetsRX: STORE.getters.getStateProp('_port.received', CAST.toEmptyInt),
      packetsTX: STORE.getters.getStateProp('_port.sent', CAST.toEmptyInt),
    },
    mutations: {
      
    },
    actions: {
      
    },
  })
};

const _createSubModuleCPEManagement_CPE_Section = function(modulePath, sectionName = '', options = {}){
  const {state = {}, getters = {}, mutations = {}, actions = {}} = options;
  return STORE.createSubModule(modulePath, {
    state: {
      ...state,
      _sectionName: sectionName,
    },
    getters: {
      label: (state) => state._sectionName,
      count: () => 0,
      sectionComponents: (state) => [
        Vue.component(`CPEManagementSection${state._sectionName}Default`,{
          template:`<div class="white-block-100 padding-left-right-8px">
            <div class="text-align-center">${state._sectionName}</div>
          </div>`,
        })
      ],
      ...getters,
      sectionName: STORE.getters.getStateProp('_sectionName', CAST.toEmptyString),
    },
    mutations: {
      ...mutations,
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      ...actions,
    },
  })
};

const _createSubModuleCPEManagement_CPE_SectionWithPortSelector = function(modulePath, sectionName = '', options = {}){
  const {state = {}, getters = {}, mutations = {}, actions = {}} = options;
  return _createSubModuleCPEManagement_CPE_Section(modulePath, sectionName, {
    state: {
      ...state,
      _portName: '',
    },
    getters: {
      ...getters,
      portName: STORE.getters.getStateProp('_portName',CAST.toEmptyString),
      portsSections: (state, getters) => getters.$subModulesKeys.map(portName=>{
        return {
          portName,
          portLabel: getters[atop(portName,'portLabel')] || portName
        }
      }),
      counters: (state, getters) => getters.$subModulesKeys.reduce((counters, portName)=>{
        counters[portName] = getters[atop(portName,'countHosts')] || 0;
        return counters;
      },{}),
      sectionComponents: () => [
        ...typeof getters.sectionComponents === 'function' ? getters.sectionComponents() : [],
        'CPEManagementPortSelect',
        'CPEManagementSelectedPort',
      ],
    },
    mutations: {
      ...mutations
    },
    actions: {
      ...actions,
      selectFirstPort({commit, getters}){
        commit('_setStateProp', {_portName: getters.$subModulesKeys[0] || ''});
      },
      selectPort({commit}, {portName = ''} = {}){
        commit('_setStateProp', {_portName: portName || ''});
      },
    }
  })
};

const createSubModuleCPEManagement_CPE_SectionCPEInfo = function(modulePath, sectionName = '', options = {}){
  const {state = {}, getters = {}, mutations = {}, actions = {}} = options;
  return _createSubModuleCPEManagement_CPE_Section(modulePath, sectionName, {
    state: {
      _lastInfo: null,
      _onlineInfo: null,
      _onlineInfoError: null,
    },
    getters: {
      label: () => 'CPE',
      lastInfoExist: (state) => Boolean(state._lastInfo?.last_msg_time),
      onlineInfoExist: (state) => Boolean(state._onlineInfo?.uptime),
      onlineInfoError: STORE.getters.getStateProp('_onlineInfoError', CAST.toNullObject),
      
      vendor: (state) => state._onlineInfo?.vendor || state._lastInfo?.vendor || '',
      model: (state) => state._onlineInfo?.model || state._lastInfo?.model || '',
      serial: (state) => state._onlineInfo?.cpeid || state._lastInfo?.sn || '',
      
      ip: (state) => state._onlineInfo?.wan?.wan_ip || state._lastInfo?.wan?.wan_ip || '',
      mac: (state) => state._onlineInfo?.mac || state._lastInfo?.mac || '',
      hard_ver: (state) => state._onlineInfo?.hard_ver || state._lastInfo?.hard_ver || '',
      soft_ver: (state) => state._onlineInfo?.soft_ver || state._lastInfo?.soft_ver || '',
      
      uptime: (state) => state._onlineInfo?.uptime || '',
      sysUpTime: (state, getters) => state._onlineInfo?.uptime && Datetools.duration(Number(getters.uptime)*1000),
      
      lastMsgTime: (state) => DATE.toDateTimeString(new Date(Number(state._lastInfo?.last_msg_time)*1000)),
      
      cpeStateIsError: (state, getters) => !getters.onlineInfoExist && state._lastInfo?.connect_state == 7,
      cpeStateColor: (state, getters) => ACS_CPE.cpeState[getters.onlineInfoExist ? 0 : state._lastInfo?.connect_state]?.color || '',
      cpeStateText: (state, getters) => ACS_CPE.cpeState[getters.onlineInfoExist ? 0 : state._lastInfo?.connect_state]?.text || 'Неизвестное состояние',
      
      sectionComponents: () => [
        'CPEManagementCPEInfo',
        'CPEManagementSpeedTest',
        'CPEManagementReboot',
        'CPEManagementRestoreConfig',
        /*Vue.component(`CPEManagementAccountInfo`,{
          template:`<div class="white-block-100 padding-left-right-8px">
            <div class="text-align-center">CPEManagementAccountInfo</div>
          </div>`,
        }),
        Vue.component(`CPEManagementAccessPort`,{
          template:`<div class="white-block-100 padding-left-right-8px">
            <div class="text-align-center">CPEManagementAccessPort</div>
          </div>`,
        }),*/
      ],
    },
    mutations: {
      
    },
    actions: {
      setLastInfo({commit}, _lastInfo = null){
        commit('_setStateProp', {_lastInfo});
      },
      setOnlineInfo({commit}, _onlineInfo = null){
        commit('_setStateProp', {_onlineInfo});
      },
      setOnlineInfoError({commit}, _onlineInfoError = null){
        commit('_setStateProp', {_onlineInfoError});
      },
    },
  })
};

const createSubModuleCPEManagement_CPE_Sections = function(modulePath){
  return STORE.createSubModule(modulePath, {
    state: {
      _sectionName: '',
    },
    getters: {
      sectionName: STORE.getters.getStateProp('_sectionName',CAST.toEmptyString),
      sections: (state, getters) => getters.$subModulesKeys.map(sectionName=>{
        return {
          sectionName,
          label: getters[atop(sectionName,'label')] || sectionName
        }
      }),
      counters: (state, getters) => getters.$subModulesKeys.reduce((counters, sectionName)=>{
        counters[sectionName] = getters[atop(sectionName,'count')] || 0;
        return counters;
      },{})
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, dispatch}){
        dispatch('$addSubModule', createSubModuleCPEManagement_CPE_SectionCPEInfo([state.$modulePath, 'CPEInfo'], 'CPEInfo'));
        dispatch('$addSubModule', _createSubModuleCPEManagement_CPE_Section([state.$modulePath, 'WANPorts'], 'WANPorts', {
          state: {
            _wanInfo: null,//wan_def, auth_type, igmp_ena, mac
          },
          getters: {
            label: () => 'WAN порты',
            count: (state, getters) => getters.$subModulesKeys.length,
            
            portName: (state, getters) => getters.$subModulesKeys[0],
            wan_def: STORE.getters.getStateProp('_wanInfo.wan_def',CAST.toEmptyString),
            auth_type: STORE.getters.getStateProp('_wanInfo.auth_type',CAST.toEmptyString),
            mac: STORE.getters.getStateProp('_wanInfo.mac',CAST.toEmptyString),
            
            sectionComponents: () => [
              'CPEManagementWANPortsInfo',
              'CPEManagementEthernetPortInfo',
            ],
          },
          mutations: {
            
          },
          actions: {
            setWANInfo({commit}, _wanInfo = null){
              commit('_setStateProp', {_wanInfo});
            },
          },
        }));
        dispatch('$addSubModule', _createSubModuleCPEManagement_CPE_SectionWithPortSelector([state.$modulePath, 'WiFiModules'], 'WiFiModules', {
          state: {
            _wlanInfo: null,//wps_ena
          },
          getters: {
            label: () => 'Wi-Fi модули',
            count: (state, getters) => getters.$subModulesKeys.length,
            
            wpsEnText: (state) => state._wlanInfo?.wps_ena == 'Up' ? 'Включен' : 'Выключен',
            
            sectionComponents: () => [
              'CPEManagementWiFiModulesInfo'
            ],
          },
          mutations: {
            
          },
          actions: {
            setWLANInfo({commit}, _wlanInfo = null){
              commit('_setStateProp', {_wlanInfo});
            },
          },
        }));
        dispatch('$addSubModule', _createSubModuleCPEManagement_CPE_SectionWithPortSelector([state.$modulePath, 'LANPorts'], 'LANPorts', {
          state: {
            _lanInfo: null,//dhcp_ena, igmp_ena, lan_ip, lan_mask, lan_dhcp_min, lan_dhcp_max
          },
          getters: {
            label: () => 'LAN порты',
            count: (state, getters) => getters.$subModulesKeys.length,
            
            lan_ip: STORE.getters.getStateProp('_lanInfo.lan_ip',CAST.toEmptyString),
            lan_mask: STORE.getters.getStateProp('_lanInfo.lan_mask',CAST.toEmptyString),
            subnet24: (state) => state._lanInfo?.lan_mask === '255.255.255.0',
            dhcpRange: (state) => state._lanInfo?.lan_dhcp_min + ' - ' + (state._lanInfo?.lan_dhcp_max || '').split('.').reverse()[0],
            lan_dhcp_min: STORE.getters.getStateProp('_lanInfo.lan_dhcp_min',CAST.toEmptyString),
            lan_dhcp_max: STORE.getters.getStateProp('_lanInfo.lan_dhcp_max',CAST.toEmptyString),
            dhcpEnText: (state) => state._lanInfo?.dhcp_ena == 'Up' ? 'Включен' : 'Выключен',
            igmpEnText: (state) => state._lanInfo?.igmp_ena == 'Up' ? 'Включен' : 'Выключен',
            
            sectionComponents: () => [
              'CPEManagementLANPortsInfo',
            ],
          },
          mutations: {
            
          },
          actions: {
            setLANInfo({commit}, _lanInfo = null){
              commit('_setStateProp', {_lanInfo});
            },
          },
        }));
        dispatch('$addSubModule', _createSubModuleCPEManagement_CPE_Section([state.$modulePath, 'VOIPInfo'], 'VOIPInfo', {
          state: {
            _voipInfo: null,
          },
          getters: {
            label: () => 'VoIP',
            sectionComponents: () => ['div'],
          },
          mutations: {
            
          },
          actions: {
            setVOIPInfo({commit}, _voipInfo = null){
              commit('_setStateProp', {_voipInfo});
            },
          },
        }));
      },
      selectSection({commit}, {sectionName = ''} = {}){
        commit('_setStateProp', {_sectionName: sectionName || ''});
      },
    }
  })
};

const createSubModuleCPEManagement_CPE_SpeedTest = function(modulePath, mrID = 0, cpeID = ''){
  return STORE.createSubModule(modulePath, {
    state: {
      _mrID: mrID,
      _cpeID: cpeID,
      
      _doCPESpeedTestLoadingAnimationDL: !1,
      _doCPESpeedTestLoadingAnimationUL: !1,
      _doCPESpeedTestLoading: !1,
      _doCPESpeedTestResult: null,
      _doCPESpeedTestError: null,
      
      CONST: Object.freeze({
        LOADER_HEIGHT: 10,
        LOADER_LINE_COLOR: '#dddddd',
        LOADER_FILL_COLOR: '#5642bd',
        LOADER_DL_MAX_TIME: 55555,
        LOADER_UL_MAX_TIME: 66666,
      })
    },
    getters: {
      CONST: (state) => state.CONST,
      
      loaderID_DL: (state) => atok('CPEManagementSpeedTest', state._mrID, state._cpeID, 'DL'),
      loaderID_UL: (state) => atok('CPEManagementSpeedTest', state._mrID, state._cpeID, 'UL'),
      
      doCPESpeedTestResult: (state) => state._doCPESpeedTestResult,
      doCPESpeedTestError: (state) => state._doCPESpeedTestError,
      
      speedTestDLState: (state) => state._doCPESpeedTestResult?.dl_state || 'DL Error',
      speedTestDLSpeed: (state) => {
        const kb = parseInt(state._doCPESpeedTestResult?.dl_speed);
        return kb > 0 ? `${(kb*0.001).toFixed()} МБит/с` : kb;
      },
      speedTestULState: (state) => state._doCPESpeedTestResult?.ul_state || 'UL Error',
      speedTestULSpeed: (state) => {
        const kb = parseInt(state._doCPESpeedTestResult?.ul_speed);
        return kb > 0 ? `${(kb*0.001).toFixed()} МБит/с` : kb;
      },
      
      doCPESpeedTestLoadingAnimationEnd: (state) => state._doCPESpeedTestLoading || state._doCPESpeedTestLoadingAnimationDL || state._doCPESpeedTestLoadingAnimationUL,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, getters, dispatch}){
        const {LOADER_UL_MAX_TIME, LOADER_DL_MAX_TIME} = state.CONST;
        dispatch('UILinearProgressLoader/init', [getters.loaderID_DL, LOADER_DL_MAX_TIME], STORE.R00T);
        dispatch('UILinearProgressLoader/init', [getters.loaderID_UL, LOADER_UL_MAX_TIME], STORE.R00T);
      },
      async doCPESpeedTest({state, getters, commit, dispatch}){
        commit('_setStateProp', {_doCPESpeedTestResult: null});
        commit('_setStateProp', {_doCPESpeedTestError: null});
        commit('_setStateProp', {_doCPESpeedTestLoading: !0});
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationDL: !0});
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationUL: !0});
        const {loaderID_DL, loaderID_UL} = getters;
        dispatch('UILinearProgressLoader/start', loaderID_DL, STORE.R00T);
        dispatch('UILinearProgressLoader/start', loaderID_UL, STORE.R00T);
        try{
          const response = await AxirosService.doCPESpeedTest(state._mrID, state._cpeID);
          if(response?.data){
            commit('_setStateProp', {_doCPESpeedTestResult: response.data});
            dispatch('UILinearProgressLoader/done', loaderID_DL, STORE.R00T);
            dispatch('UILinearProgressLoader/done', loaderID_UL, STORE.R00T);
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_doCPESpeedTestError: [
              response?.message || 'Error',
              response?.text
            ]});
            dispatch('UILinearProgressLoader/abort', loaderID_DL, STORE.R00T);
            dispatch('UILinearProgressLoader/abort', loaderID_UL, STORE.R00T);
          }else{
            commit('_setStateProp', {_doCPESpeedTestError: [
              'unknown error'
            ]});
            dispatch('UILinearProgressLoader/abort', loaderID_DL, STORE.R00T);
            dispatch('UILinearProgressLoader/abort', loaderID_UL, STORE.R00T);
          };
          dispatch('main/report',['CPEManagementSpeedTest',{
            params: {
              mrID: state._mrID,
              cpeID: state._cpeID
            },
            response,
          }],STORE.R00T);
        }catch(error){
          console.warn('doCPESpeedTest.error', error)
          commit('_setStateProp', {_doCPESpeedTestError: [
            'Error: Unexpected'
          ]});
          dispatch('UILinearProgressLoader/abort', loaderID_DL, STORE.R00T);
          dispatch('UILinearProgressLoader/abort', loaderID_UL, STORE.R00T);
        };
        commit('_setStateProp', {_doCPESpeedTestLoading: !1});
      },
      onAnimationEndDL({commit}){
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationDL: !1});
      },
      onAnimationEndUL({commit}){
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationUL: !1});
      },
    },
  });
};

const createSubModuleCPEManagement_CPE_Reboot = function(modulePath, mrID = 0, cpeID = ''){
  return STORE.createSubModule(modulePath, {
    state: {
      _mrID: mrID,
      _cpeID: cpeID,
      
      _doCPERebootLoadingAnimation: !1,
      _doCPERebootLoading: !1,
      _doCPERebootResult: null,
      _doCPERebootError: null,
      
      CONST: Object.freeze({
        LOADER_HEIGHT: 10,
        LOADER_LINE_COLOR: '#dddddd',
        LOADER_FILL_COLOR: '#5642bd',
        LOADER_MAX_TIME: 66666,
      })
    },
    getters: {
      CONST: (state) => state.CONST,
      
      loaderID: (state) => atok('CPEManagementReboot', state._mrID, state._cpeID),
      
      doCPERebootResult: (state) => state._doCPERebootResult,
      doCPERebootError: (state) => state._doCPERebootError,
      
      doCPERebootLoadingAnimationEnd: (state) => state._doCPERebootLoading || state._doCPESpeedTestLoadingAnimation,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, getters, dispatch}){
        const {LOADER_MAX_TIME} = state.CONST;
        dispatch('UILinearProgressLoader/init', [getters.loaderID, LOADER_MAX_TIME], STORE.R00T);
      },
      async doCPEReboot({state, getters, commit, dispatch}){
        commit('_setStateProp', {_doCPERebootResult: null});
        commit('_setStateProp', {_doCPERebootError: null});
        commit('_setStateProp', {_doCPERebootLoading: !0});
        commit('_setStateProp', {_doCPERebootLoadingAnimation: !0});
        const {loaderID} = getters;
        dispatch('UILinearProgressLoader/start', loaderID, STORE.R00T);
        try{
          const response = await AxirosService.doCPEReboot(state._mrID, state._cpeID);
          if(response?.data){
            commit('_setStateProp', {_doCPERebootResult: response.data});
            dispatch('UILinearProgressLoader/done', loaderID, STORE.R00T);
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_doCPERebootError: [
              response?.message || 'Error',
              response?.text
            ]});
            dispatch('UILinearProgressLoader/abort', loaderID, STORE.R00T);
          }else{
            commit('_setStateProp', {_doCPERebootError: [
              'unknown error'
            ]});
            dispatch('UILinearProgressLoader/abort', loaderID, STORE.R00T);
          };
          dispatch('main/report',['CPEManagementReboot',{
            params: {
              mrID: state._mrID,
              cpeID: state._cpeID
            },
            response,
          }],STORE.R00T);
        }catch(error){
          console.warn('doCPEReboot.error', error)
          commit('_setStateProp', {_doCPERebootError: [
            'Error: Unexpected'
          ]});
          dispatch('UILinearProgressLoader/abort', loaderID, STORE.R00T);
        };
        commit('_setStateProp', {_doCPERebootLoading: !1});
      },
      onAnimationEnd({commit}){
        commit('_setStateProp', {_doCPERebootLoadingAnimation: !1});
      },
    },
  });
};

const createSubModuleCPEManagement_CPE_RestoreConfig = function(modulePath, mrID = 0, cpeID = ''){
  return STORE.createSubModule(modulePath, {
    state: {
      _mrID: mrID,
      _cpeID: cpeID,
      
      _savedConfigsLoading: !1,
      _savedConfigsResult: null,
      _savedConfigsError: null,
      
      _selectedConfig: null,
      
      _doCPERestoreConfigLoadingAnimation: !1,
      _doCPERestoreConfigLoading: !1,
      _doCPERestoreConfigResult: null,
      _doCPERestoreConfigError: null,
      
      CONST: Object.freeze({
        LOADER_HEIGHT: 10,
        LOADER_LINE_COLOR: '#dddddd',
        LOADER_FILL_COLOR: '#5642bd',
        LOADER_MAX_TIME: 66666,
      })
    },
    getters: {
      CONST: (state) => state.CONST,
      
      savedConfigsLoading: (state) => state._savedConfigsLoading,
      savedConfigsResult: (state) => state._savedConfigsResult,
      savedConfigsError: (state) => state._savedConfigsError,
      
      savedConfigsList: (state) => (state._savedConfigsResult || []).map(config=>({
        ...config,
        date: DATE.toDateTimeString(new Date(Date.parse(config.last_updated || config.creation_time) + 7 * 60 * 60 * 1000)),//дата приходит в гринвиче
        label: atok([config.cfgid, config.cid, config.config_name].filter(Boolean)),
        disabled: state._doCPERestoreConfigLoading,
      })),
      
      selectedConfig: (state) => state._selectedConfig,
      cfgID: (state) => state._selectedConfig?.cfgid,
      
      loaderID: (state) => atok('CPEManagementRestoreConfig', state._mrID, state._cpeID),
      
      doCPERestoreConfigResult: (state) => state._doCPERestoreConfigResult,
      doCPERestoreConfigError: (state) => state._doCPERestoreConfigError,
      ticketid: (state) => state._doCPERestoreConfigResult?.ticketid || '',
      
      doCPERestoreConfigLoadingAnimationEnd: (state) => state._doCPERebootLoading || state._doCPERestoreConfigLoadingAnimation,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, getters, dispatch}){
        const {LOADER_MAX_TIME} = state.CONST;
        dispatch('UILinearProgressLoader/init', [getters.loaderID, LOADER_MAX_TIME], STORE.R00T);
        await dispatch('_getSavedConfigs');
      },
      async _getSavedConfigs({state, getters, commit, dispatch}){
        if(getters.savedConfigsLoading){return};
        commit('_setStateProp', {_savedConfigsLoading: !0});
        commit('_setStateProp', {_savedConfigsError: null});
        commit('_setStateProp', {_savedConfigsResult: null});
        try{
          const response = await AxirosService.getCPEConfigsList(state._mrID, state._cpeID);
          if(Array.isArray(response?.data)){
            commit('_setStateProp', {_savedConfigsResult: response.data});
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_savedConfigsError: [
              response?.message || 'Error',
              response?.text
            ]});
          }else{
            commit('_setStateProp', {_savedConfigsError: [
              'unknown error'
            ]});
          };
        }catch(error){
          console.warn('_getSavedConfigs.error', error);
          commit('_setStateProp', {_savedConfigsError: [
            'unexpected error'
          ]});
        };
        commit('_setStateProp', {_savedConfigsLoading: !1});
      },
      selectConfig({commit}, _selectedConfig = null){
        commit('_setStateProp', {_selectedConfig});
      },
      async doCPERestoreConfig({state, getters, commit, dispatch}){
        commit('_setStateProp', {_doCPERestoreConfigResult: null});
        commit('_setStateProp', {_doCPERestoreConfigError: null});
        commit('_setStateProp', {_doCPERestoreConfigLoading: !0});
        commit('_setStateProp', {_doCPERestoreConfigLoadingAnimation: !0});
        const {loaderID} = getters;
        dispatch('UILinearProgressLoader/start', loaderID, STORE.R00T);
        try{
          const response = await AxirosService.doCPERestoreConfig(state._mrID, state._cpeID, getters.cfgID);
          if(response?.data?.ticketid){
            commit('_setStateProp', {_doCPERestoreConfigResult: response.data});
            dispatch('UILinearProgressLoader/done', loaderID, STORE.R00T);
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_doCPERestoreConfigError: [
              response?.message || 'Error',
              response?.text
            ]});
            dispatch('UILinearProgressLoader/abort', loaderID, STORE.R00T);
          }else{
            commit('_setStateProp', {_doCPERestoreConfigError: [
              'unknown error'
            ]});
            dispatch('UILinearProgressLoader/abort', loaderID, STORE.R00T);
          };
          dispatch('main/report',['CPEManagementRestoreConfig',{
            params: {
              mrID: state._mrID,
              cpeID: state._cpeID,
              cfgID: getters.cfgID,
            },
            response,
          }],STORE.R00T);
        }catch(error){
          console.warn('doCPEReboot.error', error)
          commit('_setStateProp', {_doCPERestoreConfigError: [
            'Error: Unexpected'
          ]});
          dispatch('UILinearProgressLoader/abort', loaderID, STORE.R00T);
        };
        commit('_setStateProp', {_doCPERestoreConfigLoading: !1});
      },
      onAnimationEnd({commit}){
        commit('_setStateProp', {_doCPERestoreConfigLoadingAnimation: !1});
      },
    },
  });
};

const createSubModuleCPEManagement_CPE = function(modulePath, mrID = 0, cpeID = '', accountNumber = ''){
  return STORE.createSubModule(modulePath, {
    state: {
      _mrID: mrID,
      _cpeID: cpeID,
      _accountNumber: accountNumber,
      
      _lastInfoLoading: !1,
      _lastInfoError: null,
      
      _onlineInfoLoading: !1,
      _onlineInfoLoadingRefresh: !1,
    },
    getters: {
      mrID: STORE.getters.getStateProp('_mrID', CAST.toEmptyInt),
      cpeID: STORE.getters.getStateProp('_cpeID', CAST.toEmptyString),
      accountNumber: STORE.getters.getStateProp('_accountNumber', CAST.toEmptyString),
      
      lastInfoLoading: STORE.getters.getStateProp('_lastInfoLoading', CAST.toBoolean),
      lastInfoExist: (state, getters) => getters['Sections/CPEInfo/lastInfoExist'],
      lastInfoError: STORE.getters.getStateProp('_lastInfoError', CAST.toNullObject),
      
      onlineInfoLoading: STORE.getters.getStateProp('_onlineInfoLoading', CAST.toBoolean),
      onlineInfoLoadingRefresh: STORE.getters.getStateProp('_onlineInfoLoadingRefresh', CAST.toBoolean),
      onlineInfoExist: (state, getters) => getters['Sections/CPEInfo/onlineInfoExist'],
      onlineInfoError: (state, getters) => getters['Sections/CPEInfo/onlineInfoError'],
      
      loadingSomeOperation: (state, getters) => [
        getters.onlineInfoLoading,
        getters['SpeedTest/doCPESpeedTestLoadingAnimationEnd'],
        getters['Reboot/doCPERebootLoadingAnimationEnd'],
        getters['RestoreConfig/doCPERestoreConfigLoadingAnimationEnd'],
      ].some(Boolean),
      
      title: (state, getters) => !getters.lastInfoExist ? '' :([
        getters['Sections/CPEInfo/vendor'],
        getters['Sections/CPEInfo/model'],
      ].filter(Boolean).join(' ') || 'Unknown model'),
      subTitle: (state, getters) => getters['Sections/CPEInfo/serial'] || state._cpeID,
      
      //temp for old modals
      wlan24_initial: (state, getters) => getters['Sections/WiFiModules/wlan24/port'],
      wlan5_initial: (state, getters) => getters['Sections/WiFiModules/wlan5/port'],
      auth_type: (state, getters) => getters['Sections/WANPorts/auth_type'],
      wan_def: (state, getters) => getters['Sections/WANPorts/wan_def'],
      wan: (state, getters) => getters['Sections/WANPorts/wan/port'],
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, getters, dispatch}){
        dispatch('$addSubModule', createSubModuleCPEManagement_CPE_Sections([state.$modulePath, 'Sections']));
        dispatch('$addSubModule', createSubModuleCPEManagement_CPE_SpeedTest([state.$modulePath, 'SpeedTest'], state._mrID, state._cpeID));
        dispatch('$addSubModule', createSubModuleCPEManagement_CPE_Reboot([state.$modulePath, 'Reboot'], state._mrID, state._cpeID));
        dispatch('$addSubModule', createSubModuleCPEManagement_CPE_RestoreConfig([state.$modulePath, 'RestoreConfig'], state._mrID, state._cpeID));
        await dispatch('_getLastInfo');
        if(getters.lastInfoExist){
          await Promise.allSettled([
            dispatch('getOnlineInfo', !0),
          ])
        };
      },
      async _getLastInfo({state, getters, commit, dispatch}){
        if(getters.lastInfoLoading){return};
        commit('_setStateProp', {_lastInfoLoading: !0});
        commit('_setStateProp', {_lastInfoError: null});
        dispatch('Sections/CPEInfo/setLastInfo');
        dispatch('_setOnlineInfo');
        try{
          const response = await AxirosService.getCPELastDBInfo(state._mrID, state._cpeID);
          if(Array.isArray(response?.data)){
            dispatch('Sections/CPEInfo/setLastInfo', response.data[0]);
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_lastInfoError: [
              response?.message,
              response?.text
            ]});
          }else{
            commit('_setStateProp', {_lastInfoError: [
              'unknown error'
            ]});
          };
        }catch(error){
          console.warn('_getLastInfo.error', error);
          commit('_setStateProp', {_lastInfoError: [
            'unexpected error'
          ]});
        };
        commit('_setStateProp', {_lastInfoLoading: !1});
      },
      async getOnlineInfo({state, getters, commit, dispatch}, refresh = !1){
        if(getters.onlineInfoLoading){return};
        commit('_setStateProp', {_onlineInfoLoading: !0});
        dispatch('Sections/CPEInfo/setOnlineInfoError');
        if(refresh){
          commit('_setStateProp', {_onlineInfoLoadingRefresh: !0});
          dispatch('_setOnlineInfo');
        };
        
        try{
          //const response = await AxirosService.getCPEInfo(state._mrID, state._cpeID);
          //getOnlineInfo.error ReferenceError: account is not defined
          //  at AxirosService.getCPEInfo (ptvtb-7ecff7a2cdf5523d347e7a8cf324f45df55d4f5e46510cd66200ac3ef375119f.js:2651:85)
          const response = await AxirosService.get('cpe_info',{mr:state._mrID,cpeid:state._cpeID})
          if(response?.data?.cpeid){
            dispatch('_setOnlineInfo', response.data);
          }else if(response?.message || response?.text){
            dispatch('Sections/CPEInfo/setOnlineInfoError', [
              response?.message,
              response?.text
            ]);
          }else{
            dispatch('Sections/CPEInfo/setOnlineInfoError', [
              'unknown error'
            ]);
          };
        }catch(error){
          console.warn('getOnlineInfo.error', error);
          dispatch('Sections/CPEInfo/setOnlineInfoError', [
            'unexpected error'
          ]);
        };
        
        commit('_setStateProp', {_onlineInfoLoading: !1});
        if(refresh){
          commit('_setStateProp', {_onlineInfoLoadingRefresh: !1});
        };
      },
      _setOnlineInfo({state, getters, commit, dispatch}, _onlineInfo = null){
        if(!_onlineInfo){
          dispatch('Sections/CPEInfo/setOnlineInfo');
          dispatch('Sections/WANPorts/$delSubModules');
          dispatch('Sections/LANPorts/$delSubModules');
          dispatch('Sections/WiFiModules/$delSubModules');
          dispatch('Sections/VOIPInfo/setVOIPInfo');
        }else{
          dispatch('Sections/CPEInfo/setOnlineInfo', _onlineInfo);
          
          const {wan, wan_def, auth_type, igmp_ena, mac} = _onlineInfo;
          const {lans = [], dhcp_ena, lan_ip, lan_mask, lan_dhcp_min, lan_dhcp_max} = _onlineInfo;
          const {wlans = [], wps_ena} = _onlineInfo;
          const {voip} = _onlineInfo;
          
          dispatch('Sections/WANPorts/setWANInfo', {wan_def, auth_type, igmp_ena, mac});
          if(wan?.status){
            const name = wan.lan || 'wan';
            if(getters['Sections/WANPorts/$getSubModule'](name)){
              dispatch(atop('Sections/WANPorts',name,'setPortInfo'),wan);
            }else{
              dispatch('Sections/WANPorts/$addSubModule', createSubModuleCPEManagement_CPE_WANPort([getters['Sections/$getSubModule']('WANPorts'), name], name, wan, wan_def));
            };
          };
          
          dispatch('Sections/LANPorts/setLANInfo', {dhcp_ena, igmp_ena, lan_ip, lan_mask, lan_dhcp_min, lan_dhcp_max});
          for(const lan of lans){
            if(!lan?.status){continue};
            if(getters['Sections/LANPorts/$getSubModule'](lan.lan)){
              dispatch(atop('Sections/LANPorts',lan.lan,'setPortInfo'),lan);
            }else{
              dispatch('Sections/LANPorts/$addSubModule', createSubModuleCPEManagement_CPE_LANPort([getters['Sections/$getSubModule']('LANPorts'), lan.lan], lan.lan, lan));
            };
          };
          dispatch('Sections/LANPorts/selectFirstPort');
          
          dispatch('Sections/WiFiModules/setWLANInfo', {wps_ena});
          for(const wlan of wlans){
            if(!wlan?.status){continue};
            if(getters['Sections/WiFiModules/$getSubModule'](wlan.lan)){
              dispatch(atop('Sections/WiFiModules',wlan.lan,'setPortInfo'),wlan);
            }else{
              dispatch('Sections/WiFiModules/$addSubModule', createSubModuleCPEManagement_CPE_WiFiPort([getters['Sections/$getSubModule']('WiFiModules'), wlan.lan], wlan.lan, wlan));
            };
          };
          dispatch('Sections/WiFiModules/selectFirstPort');
          
          if(voip?.status){
            dispatch('Sections/CPEInfo/setVOIPInfo', voip);
          };
        };
      },
    }
  });
};

const createSubModuleCPEManagement_CPEs = function(modulePath){
  return STORE.createSubModule(modulePath, {
    state: {
      _mrID: 0,
      _cpeID: '',
      _accountNumber: '',
    },
    getters: {
      mrID: STORE.getters.getStateProp('_mrID', CAST.toEmptyInt),
      cpeID: STORE.getters.getStateProp('_cpeID', CAST.toEmptyString),
      accountNumber: STORE.getters.getStateProp('_accountNumber', CAST.toEmptyString),
      cpeKey: (state) => [state._mrID, state._cpeID, state._accountNumber].filter(Boolean).join(),
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      addCPE({state, getters, commit, dispatch}, [_mrID = 0, _cpeID = '', _accountNumber = ''] = []){
        commit('_setStateProp', {_mrID});
        commit('_setStateProp', {_cpeID});
        commit('_setStateProp', {_accountNumber});
        if(_mrID && _cpeID){
          dispatch('$addSubModule', createSubModuleCPEManagement_CPE([state.$modulePath, getters.cpeKey], _mrID, _cpeID, _accountNumber));
        };
      },
      delCPE({getters, commit, dispatch}, [_mrID = 0, _cpeID = ''] = []){
        commit('_setStateProp', {_mrID});
        commit('_setStateProp', {_cpeID});
        if(_mrID && _cpeID){
          if(getters.mrID == _mrID && getters.cpeID == _cpeID){
            commit('_setStateProp', {_mrID: 0});
            commit('_setStateProp', {_cpeID: ''});
          };
          dispatch('$delSubModule', atos(_mrID, _cpeID));
        };
      },
      delCPEs({commit, dispatch}){
        commit('_setStateProp', {_mrID: 0});
        commit('_setStateProp', {_cpeID: ''});
        dispatch('$delSubModules');
      },
    }
  });
};

STORE.createSubModule('CPEManagement', {
  state: {
    
  },
  getters: {
    
  },
  mutations: {
    
  },
  actions: {
    async $initModule({state, dispatch}){
      dispatch('$addSubModule', createSubModuleCPEManagement_CPEs([state.$modulePath, 'CPEs']));
    },
  }
}).register();


app.$router.addRoutes([
  {
    path: '/CPEManagement',
    component: Vue.component('CPEManagementPage'),
    children: [
      {
        path: ':mrID/:cpeID',
        name: 'R_CPEManagementCPE',
        components: {
          navbar: Vue.component('CPEManagementPageNavbar'),
          content: Vue.component('CPEManagementPageContent')
        },
        children: [
          {
            path: ':sectionName',
            name: 'R_CPEManagementCPESection',
            component: Vue.component('CPEManagementSection'),
          }
        ],
      }
    ]
  },
]);

//FIX класс disabled в LineScrollSelector2
(function(id=`LineScrollSelector2-css`){
  document.getElementById(id)?.remove();
  const el=Object.assign(document.createElement('style'),{type:'text/css',id});
  el.appendChild(document.createTextNode(`
    //.line-scroll-selector-2{display:flex;gap:4px;padding-left:4px;padding-right:4px;align-items:center;cursor:grab;scroll-snap-type:inline mandatory;overflow-x:scroll;-ms-overflow-style:none;scrollbar-width:none}
    //.line-scroll-selector-2::-webkit-scrollbar{display:none}
    //.line-scroll-selector-2::-webkit-scrollbar{display:none}
    .line-scroll-selector-2 .lss2-item{
      display:flex;
      align-items:center;
      gap:4px;
      background:#ffffff;
      height:36px;
      padding:4px 6px;
      transition:200ms;
      cursor:pointer;
      --color-selected: #ff0032;
      --color-disabled: #969fa8;
    }
    //.line-scroll-selector-2 .lss2-item .lss2-item-label{font-size:13px !important;font-weight:500;white-space:nowrap;color:#969fa8}
    //.line-scroll-selector-2 .lss2-item .lss2-item-counter{--size: 18px;min-width:var(--size);min-height:var(--size);height:var(--size);border-radius:var(--size);font-size:13px !important;font-weight:500;padding:0px 4px;text-align:center;background:#f2f3f7;color:#221e1e}
    //.line-scroll-selector-2 .lss2-item--selected{border-bottom:3px solid var(--color-selected)}
    //.line-scroll-selector-2 .lss2-item--selected .lss2-item-label{color:#221e1e}
    //.line-scroll-selector-2 .lss2-item--selected .lss2-item-counter{background:var(--color-selected);color:#ffffff}
    .line-scroll-selector-2 .lss2-item--disabled{
      cursor:not-allowed;
      --color-selected: var(--color-disabled);
    }
  `));
  document.body.insertAdjacentElement('afterBegin',el);
}());

//FIX полоска UILinearProgressLoader сбрасывалась при перемонтировании
Vue.component('UILinearProgressLoader', {
  beforeCreate(){
    if(!this.$store.getters['UILinearProgressLoader/getProgressProp'](this.$options.propsData.loaderID)){
      this.$store.dispatch('UILinearProgressLoader/init', [
        this.$options.propsData.loaderID,
        this.$options.propsData.maxTime,
      ]);
    };
    this.$options.computed = {
      percent: () => this.$store.getters['UILinearProgressLoader/getProgressPercent'](this.loaderID),
      state: () => this.$store.getters['UILinearProgressLoader/getProgressState'](this.loaderID),
    };
    this.$options.methods = {
      start: (param) => this.$store.dispatch('UILinearProgressLoader/start', param),
      abort: (param) => this.$store.dispatch('UILinearProgressLoader/abort', param),
      done: (param) => this.$store.dispatch('UILinearProgressLoader/done', param),
    };
  },
  template:`<div class="display-contents">
    <UILinearProgress v-bind="$props" :percent="percent" v-on="$listeners">
      <template slot="prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="postfix">
        <slot name="postfix"></slot>
      </template>
    </UILinearProgress>
  </div>`,
  props:{
    loaderID: {type: [Number, String], default: 'UILinearProgressLoader', required: !0},
    maxTime: {type: Number, default: 11111, required: !0},

    //proxy UILinearProgress props
    fillColor: {type: String, default: '#1976d2'},
    lineColor: {type: String, default: '#a7caed'},
    //percent: {type: Number, required: !0, default: 50},
    showPercent: {type: Boolean, default: !1},
    height: {type: [Number, String], default: 4},
    radius: {type: [Number, String], default: 0},
    rounded: {type: Boolean, default: !1},
  },
  //beforeDestroy(){
  //  this.$store.dispatch('UILinearProgressLoader/abort', this.loaderID);
  //}
});

router.beforeEach((to, from, next)=>{
  if(to.name == 'account-cpe'){
    return next({
      name: 'R_CPEManagementCPE',
      params:{
        mrID: to.params.mr_id,
        cpeID: to.params.serial,
      },
      query: {
        accountNumber: to.params.account,
      }
    })
  }
  next();
})
