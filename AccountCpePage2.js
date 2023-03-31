//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AccountCpePage2.js',type:'text/javascript'}));
//store.unregisterModule('cpe');
store.registerModule('cpe2',{
  namespaced:true,
  state:()=>({
    loads:{
      getCpeDb:false,
      getCpe:false,
      getCpeConfigs:false,
    },
    resps:{
      getCpeDb:null,
      getCpe:null,
      getCpeConfigs:null,
    },
  }),
  getters:{
    getCpeDbResult:state=>state.resps.getCpeDb,
    getCpeDbLoading:state=>state.loads.getCpeDb,
    getCpeResult:state=>state.resps.getCpe,
    getCpeLoading:state=>state.loads.getCpe,
    getCpeConfigsResult:state=>state.resps.getCpeConfigs,
    getCpeConfigsLoading:state=>state.loads.getCpeConfigs,
  },
  mutations:{
    set_load(state,[section,loading]){
      state.loads[section]=loading;
    },
    set_resp(state,[section,response]){
      state.resps[section]=response;
    },
    reset(state){
      for(const section in state.resps){
        state.resps[section]=null;
        state.loads[section]=false;
      }
    }
  },
  actions:{
    async getCpeDb({state,commit},{serial,mr_id}={}){
      if(!serial||!mr_id){return};      
      if(state.loads.getCpeDb){return};
      commit('set_resp',['getCpeDb',null]);
      commit('set_load',['getCpeDb',true]);
      try{
        const response=await httpGet(buildUrl('cpe_db_info',{test:2,cpeid:serial,mr_id,mr:mr_id},"/call/axiros/"));
        commit('set_resp',['getCpeDb',response.text?{error:response.text}:response[0]]);
      }catch(error){
        console.warn('getCpeDb.error',error);
      };
      commit('set_load',['getCpeDb',false]);
      return state.resps.getCpeDb;
    },
    async getCpe({state,commit},{serial,mr_id}={}){
      if(!serial||!mr_id){return};
      if(state.loads.getCpe){return};
      commit('set_resp',['getCpe',null]);
      commit('set_load',['getCpe',true]);
      try{
        const response=await httpGet(buildUrl('cpe_info',{test:2,cpeid:serial,mr_id,mr:mr_id},"/call/axiros/"));
        commit('set_resp',['getCpe',response.text?{error:response.text}:response]);
      }catch(error){
        console.warn('getCpe.error',error);
      };
      commit('set_load',['getCpe',false]);
      return state.resps.getCpe;
    },
    async getCpeConfigs({state,commit},{serial,mr_id}={}){
      if(!serial||!mr_id){return};
      if(state.loads.getCpeConfigs){return};
      commit('set_resp',['getCpeConfigs',null]);
      commit('set_load',['getCpeConfigs',true]);
      try{
        const response=await httpGet(buildUrl('cpe_get_configs_list',{test:2,cpeid:serial,mr_id,mr:mr_id},"/call/axiros/"));
        if(response.type!=='error'&&response.length){
          commit('set_resp',['getCpeConfigs',response]);
        };
      }catch(error){
        console.warn('getCpeConfigs.error',error);
      };
      commit('set_load',['getCpeConfigs',false]);
      return state.resps.getCpeConfigs;
    },
  },
});

Vue.component('AccountCpePage2',{
  template:`<section name="AccountCpePage2" class="account-cpe">
    <page-navbar :title="$route.name" @refresh="refresh"/> 
    <loader-bootstrap v-if="cpeDbLoading" text="получение данных по CPE"/>
    <template v-else-if="cpeDb?.model">
      <card-block>
        <title-main :icon="'- ic-status pr-8 '+isOnline" :text="cpeDb?.vendor" :text2="cpeDb?.model" size="large"/>
        <devider-line />
        <div class="pb-8">
          <info-value label="sysUpTime" type="medium" withLine>
            <span slot="value" :class="classUptime">{{duration}}</span>
          </info-value>
          <info-value label="serialNumber" :value="cpeDb?.sn" type="medium" withLine/>
          <info-value label="IP адрес" v-if="!cpe?.mac" :value="cpeDb?.external_ip" type="medium" withLine/>
          <info-value label="MAC адрес" v-if="!cpe?.mac" :value="cpeDb?.mac" type="medium" withLine/>
          <info-value label="Версия ПО" :value="cpe?.soft_ver||cpeDb?.soft_ver" type="medium" withLine/>
          <info-value label="Последняя активность" :value="getTimeDate(cpeDb?.last_msg_time)" type="medium" withLine/> 
          <info-value label="Статус соединения" v-if="cpeDb?.connect_state" type="medium" withLine >
            <span slot="value" :class="getCpeState(cpeDb.connect_state).color">{{getCpeState(cpeDb.connect_state).text}}</span>
          </info-value>
          <template v-if="cpeDb?.connect_state==7">
            <devider-line />
            <message-el text="Процесс настройки оборудования закончился неудачей. Нужно настроить оборудование вручную. И сообщить коллегам." type="error"/>
          </template>
        </div>
      </card-block>
      <loader-bootstrap v-if="cpeLoading" text="получение данных с CPE"/>
      <template v-else-if="cpe?.auth_type">
        <card-block>
          <modal-container-custom ref="modalCpeSetConfig" :wrapperStyle="{'padding-bottom':'8px','min-height':'unset'}" :footer="false">
            <CpeSetConfig ref="CpeSetConfig" :configs="cpeConfigs||[]" @close="closeModalCpeSetConfig"/>
          </modal-container-custom>
          <div style="width:100%;padding:0px 16px;display:inline-flex;justify-content:flex-end;">
            <span v-if="cpeConfigsLoading" class="ic-24 ic-loading rotating" style="color:#5642bd;width:32px;height:32px;line-height:32px;text-align:center;"></span>
            <button-main v-bind="btnOpenCfgProps" @click="openModalCpeSetConfig" buttonStyle="outlined" size="content"/>
          </div>
        </card-block>

        <card-block>
          <title-main icon="wan" text="Соединение с интернет" text2="WAN" size="large">
            <button-sq icon="edit" @click="toSetWan"/>
          </title-main>
          <devider-line />
          <div v-if="cpe">
            <info-value label="Тип Авторизации" :value="cpe?.auth_type" type="medium" withLine/>
            <info-value v-if="showLogin&&cpe?.wan" label="Логин" :value="cpe.wan.username" type="medium" withLine/>
            
            <template v-if="cpe?.wan">
              <info-value label="IP адрес" :value="cpe.wan.wan_ip" type="medium" withLine/>
              <info-value label="Шлюз" :value="cpe.wan.wan_gateway" type="medium" withLine/>
              <info-value label="Маска" :value="cpe.wan.wan_mask" type="medium" withLine/>
              <info-value label="DNS серверы" type="medium" withLine><span slot="value" :class="classDns">{{dnsAuto}}</span></info-value>
              <info-text-sec v-if="cpe?.wan" :text="cpe.wan.dns_servers" style="text-align:right;"/>
            </template>

            <info-value label="MAC-адрес" :value="cpe.mac" type="medium" withLine/>

            <title-main :icon="wanStatusIcon" text="WAN порт" :text2="rate" :text2Class="classRate" size="medium" :opened="open.wan" @block-click="open.wan=!open.wan"/>
            <div v-show="open.wan&&cpe?.wan">
              <info-value label="CRC ошибки (rx/tx)" :value="(cpe.wan.crc_in||0)+'/'+(cpe.wan.crc_out||0)" type="medium" withLine/>
              <info-value label="Packet RX" :value="cpe.wan.received" type="medium" withLine/>
              <info-value label="Packet TX" :value="cpe.wan.sent" type="medium" withLine/>
            </div>
          </div>
        </card-block>
        
        <card-block v-if="cpe?.wlans">
          <title-main icon="wifi" text="Беспроводная сеть" text2="WiFi" size="large" :opened="open.wlan" @block-click="open.wlan=!open.wlan">
            <button-sq icon="edit" @click="toSetWifi"/>
          </title-main>
          <CpeWlan v-show="open.wlan" v-for="wlan of cpe.wlans" :key="wlan.lan" :wlan="wlan" :wps="cpe.wps_ena"/>
        </card-block>

        <card-block v-if="cpe?.lans">
          <title-main icon="lan" text="Локальная сеть" text2="LAN" size="large" :opened="open.lan" @block-click="open.lan=!open.lan">
            <button-sq icon="edit" @click="toSetLan"/>
          </title-main>

          <CpeLan v-show="open.lan" :ports="cpe.lans" :cpe="cpe"/>

        </card-block>

        <card-block v-if="hasVoip">
          <title-main icon="phone" text="VoIP" size="large" :opened="open.voip" @block-click="open.voip=!open.voip">
            <button-sq icon="edit" @click="toSetVopip"/>
          </title-main>
          <div class="pb-8" v-show="open.voip">
            <devider-line/>
            <info-value label="VoIP профиль" :value="onOff(cpe.voip.status)" type="medium" withLine/>
            <info-value label="Телефонный номер" :value="cpe.voip.URI" type="medium" withLine/>
            <info-value label="Прокси-сервер" :value="cpe.voip.proxy_server" type="medium" withLine/>
            <info-value label="VLAN для VoIP" :value="cpe.voip.vlan" type="medium" withLine/>
          </div>
        </card-block>

      </template>

      <card-block v-else>
        <message-el v-if="!cpe?.auth_type" text="Неудалось получить данные с устройства. Повторите попытку позже" type="warn" box/>
        <info-text-sec :text="cpe?.error"/>
      </card-block>

    </template>

    <card-block v-else>
      <message-el v-if="!cpeDb?.model" text="Неудалось получить данные из базы. Повторите попытку позже" type="error" box/>
      <info-text-sec :text="cpeDb?.error"/>
    </card-block>
  </section>`,
  props:{
    mr_id:{type:[Number,String],required:true},
    serial:{type:[Number,String],required:true},
    account:{type:[Number,String],required:true},
  },
  beforeRouteUpdate(to,from,next){
    this.reset();
    this.refresh();
    next();
  },
  data:()=>({
    open:{
      wlan:false,
      voip:false,
      lan:false,
      wan:false,
    },
    cpeState:[
      {color:'main-green',  text:'Информация получена'},
      {color:'tone-300',    text:'Отправка запроса'},
      {color:'tone-300',    text:'Взаимодействие с CPE'},
      {color:'main-blue',   text:'Статус CPE неизвестен'},
      {color:'main-orange', text:'Ожидание ответа CPE'},
      {color:'main-orange', text:'CPE недоступно'},
      {color:'main-orange', text:'CPE недоступно'},
      {color:'main-red',    text:'Ошибка взаимодействия с CPE!'},
      {color:'main-blue',   text:'Загрузка ПО.Не перезагружать.'},
      {color:'main-blue',   text:'CPE перезагружается'},
    ],
  }),
  watch:{
    'cpe'(cpe){
      if(cpe?.auth_type){
        this.getCpeConfigs(this.$route.params);
      };
    },
    '$route'(){
      this.refresh();
    }
  },
  created(){
    this.reset();
    this.refresh();
    this.$root.$on('root--cpe-set-config--on-cfg-restore',result=>{
      if(result?.message==='OK'){
        this.getCpe(this.$route.params);
      };
    });
  },
  computed:{
    ...mapGetters({
      cpeDbLoading:'cpe2/getCpeDbLoading',
      cpeDb:'cpe2/getCpeDbResult',
      cpeLoading:'cpe2/getCpeLoading',
      cpe:'cpe2/getCpeResult',
      cpeConfigsLoading:'cpe2/getCpeConfigsLoading',
      cpeConfigs:'cpe2/getCpeConfigsResult',
    }),
    loadingSome(){return this.cpeLoading||this.cpeDbLoading},
    btnOpenCfgProps(){
      return {
        label:'версии конфигурации'+(this.cpeConfigs?.length?` (${this.cpeConfigs?.length})`:''),
        disabled:this.cpeConfigsLoading||!this.cpeConfigs?.length,
      };
    },
    hasVoip(){return (!this.cpe||!this.cpe?.voip)?false:Object.values(this.cpe.voip).some(value=>value)},
    showLogin(){return this.cpe?.auth_type==='pppoe'},
    isOnline(){return this.cpe?.uptime?'main-green':'main-red'},
    classDns(){return !this.cpe?.wan?'':this.cpe.wan.dns_auto_enabled=='Up'?'main-green':'main-orange'},
    dnsAuto(){return !this.cpe?.wan?'Нет данных':this.cpe.wan.dns_auto_enabled=='Up'?'Автоматически':'Вручную'},
    classUptime(){return this.cpe?.uptime?'main-green':''},
    duration(){return !this.cpe?.uptime?'Нет данных':Dt.duration(Number(this.cpe.uptime)*1000)},
    classRate(){return !this.cpe?.wan?'':this.cpe.wan.rate==10?'main-orange':'tone-500'},//'main-green';
    rate(){return !this.cpe?.wan?'':this.cpe.wan.status!=='Up'?'':!this.cpe.wan.rate?'Auto':this.cpe.wan.rate==='Auto'?this.cpe.wan.rate:`${this.cpe.wan.rate} Мбит/с`},
    wanStatusIcon(){return '- ic-status '+(this.cpe?.wan?.status==='Up'?'main-green':'tone-300')},
  },
  methods:{
    ...mapMutations({
      reset:'cpe2/reset',
    }),
    ...mapActions({
      getCpeDb:'cpe2/getCpeDb',
      getCpe:'cpe2/getCpe',
      getCpeConfigs:'cpe2/getCpeConfigs',
    }),
    async refresh(){
      if(this.loadingSome){return};
      await this.getCpeDb(this.$route.params);
      if(!this.cpeDb||this.cpeDb?.error){return};
      await this.getCpe(this.$route.params);
    },
    getTimeDate(ms){
      if(!ms){return 'Нет данных'};
      const date=new Date(Number(ms)*1000);
      return Dt.format(date,'datetime');
    },
    onOff(value){
      if(!value){return 'Нет данных'};
      return value==='Up'?'Включен':'Выключен';
    },
    getCpeState(index){
      if(this.cpe?.uptime){
        return this.cpeState[0]
      }
      index=parseInt(index);
      if(!this.cpeState[index]){
        return {color:'',text:'Неизвестное состояние'};
      };
      return this.cpeState[index];
    },
    toSetWan(){return
      this.$router.push({
        name:'account-cpe-set-wan',
        params:this.$route.params,
      });
    },
    toSetWifi(){return
      this.$router.push({
        name:'account-cpe-set-wifi',
        params:this.$route.params,
      });
    },
    toSetLan(){return
      this.$router.push({
        name:'account-cpe-set-lan',
        params:this.$route.params,
      });
    },
    openModalCpeSetConfig(){
      this.$refs.modalCpeSetConfig.open();
    },
    closeModalCpeSetConfig(){
      this.$refs.modalCpeSetConfig.close();
      this.$refs.CpeSetConfig.clear();
    },
  },
});

app.$router.addRoutes([
  {
    name: 'account-cpe_test_2',
    path: '/account-cpe_test_2-:mr_id-:serial-:account',
    props: true,
    component: Vue.component("AccountCpePage2"),
  },
]);

if(store?.state?.main?.userData?.username=='mypanty1'){
  app.$router.beforeEach((to, from, next) => {
    if(to.name==='account-cpe'){
      next({
        name:"account-cpe_test_2",
        params:to.params
      });
    }else{
      next();
    };
  });
}
//6-091-0460541
//app.$router.push({name:'account-cpe_test_2',params:{mr_id:4,serial:'F20200041915',account:'60910538250'}})