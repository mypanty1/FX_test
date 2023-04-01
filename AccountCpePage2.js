//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AccountCpePage2.js',type:'text/javascript'}));
//store.unregisterModule('cpe');
store.registerModule('cpe2',{
  namespaced:true,
  state:()=>({
    loads:{
      getCpeDb:false,
      getCpe:false,
      getCpeConfigs:false,
      doCpeUpdate:false,
      doCpeRestoreConfig:false,
      doCpeReboot:false,
    },
    resps:{
      getCpeDb:null,
      getCpe:null,
      getCpeConfigs:null,
      doCpeUpdate:null,
      doCpeRestoreConfig:null,
      doCpeReboot:null,
    },
  }),
  getters:{
    getCpeDbResult:state=>state.resps.getCpeDb,
    getCpeDbLoading:state=>state.loads.getCpeDb,
    getCpeResult:state=>state.resps.getCpe,
    getCpeLoading:state=>state.loads.getCpe,
    getCpeConfigsResult:state=>state.resps.getCpeConfigs,
    getCpeConfigsLoading:state=>state.loads.getCpeConfigs,
    doCpeUpdateResult:state=>state.resps.doCpeUpdate,
    doCpeUpdateLoading:state=>state.loads.doCpeUpdate,
    doCpeRestoreConfigResult:state=>state.resps.doCpeRestoreConfig,
    doCpeRestoreConfigLoading:state=>state.loads.doCpeRestoreConfig,
    doCpeRebootResult:state=>state.resps.doCpeReboot,
    doCpeRebootLoading:state=>state.loads.doCpeReboot,
  },
  mutations:{
    set_load(state,[section,loading]){
      state.loads[section]=loading;
    },
    set_resp(state,[section,response]){
      state.resps[section]=response;
    },
    reset(state,key){
      if(typeof key==='string'){key=key.split(',')};
      for(const _key in state.resps){
        if(key&&(Array.isArray(key)?!key.includes(_key):key!=_key)){continue}
        state.resps[_key]=null;
        state.loads[_key]=false;
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
        const response=await httpGet(buildUrl('cpe_db_info',{cpeid:serial,mr:mr_id},"/call/axiros/"));
        commit('set_resp',['getCpeDb',response?.[0]||response]);
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
        const response=await httpGet(buildUrl('cpe_info',{cpeid:serial,mr:mr_id},"/call/axiros/"));
        commit('set_resp',['getCpe',response]);
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
        const response=await httpGet(buildUrl('cpe_get_configs_list',{cpeid:serial,mr:mr_id},"/call/axiros/"));
        if(response.type!=='error'&&response.length){
          commit('set_resp',['getCpeConfigs',response]);
        };
      }catch(error){
        console.warn('getCpeConfigs.error',error);
      };
      commit('set_load',['getCpeConfigs',false]);
      return state.resps.getCpeConfigs;
    },
    async doCpeRestoreConfig({state,commit},{serial,mr_id,cfg_id}={}){
      if(!serial||!mr_id||!cfg_id){return};
      if(state.loads.doCpeRestoreConfig){return};
      commit('set_resp',['doCpeRestoreConfig',null]);
      commit('set_load',['doCpeRestoreConfig',true]);
      try{
        const response=await httpGet(buildUrl('cpe_restore_config_file',{cpeid:serial,mr:mr_id,cfgid:cfg_id},"/call/axiros/"));
        commit('set_resp',['doCpeRestoreConfig',response]);
        /*{
          "type": "success",
          "code": 200,
          "message": "OK",
          "text": "OK",
          "data": {
            "code": "200",
            "details": {"@soap_enc:array_type": "ns1:KeyValueStruct[0]","@xsi3:type": "SOAP-ENC:Array"},
            "message": "OK",
            "ticketid": "64200981",
            "type": "success",
            "data": {"code": "200","message": "OK","type": "success"}
          }
        }*/
      }catch(error){
        console.warn('doCpeRestoreConfig.error',error);
      };
      commit('set_load',['doCpeRestoreConfig',false]);
      return state.resps.doCpeRestoreConfig;
    },
    async doCpeUpdate({state,commit},{fake,serial,mr_id,account,...params}={}){console.log({serial,mr_id,account,...params});
      if(!serial||!mr_id||!account||fake){return};
      if(state.loads.doCpeUpdate){return};
      commit('set_resp',['doCpeUpdate',null]);
      commit('set_load',['doCpeUpdate',true]);
      try{
        const response=await httpPost(buildUrl('cpe_update',{cpeid:serial,mr:mr_id,account},"/call/axiros/"),{cpeid:serial,mr:mr_id,account,...params});
        commit('set_resp',['doCpeUpdate',response]);
      }catch(error){
        console.warn('doCpeUpdate.error',error);
      };
      commit('set_load',['doCpeUpdate',false]);
      return state.resps.doCpeUpdate;
    },
    async doCpeReboot({state,commit},{fake,serial,mr_id,account}={}){
      if(!serial||!mr_id||!account||fake){return};
      if(state.loads.doCpeReboot){return};
      commit('set_resp',['doCpeReboot',null]);
      commit('set_load',['doCpeReboot',true]);
      try{
        const response=await httpPost(buildUrl('cpe_reboot',{cpeid:serial,mr:mr_id,account},"/call/axiros/"),{cpeid:serial,mr:mr_id,account});
        //{"type": "success","code": 200,"message": "OK","text": "OK","data": "64207514"}
        commit('set_resp',['doCpeReboot',response]);
      }catch(error){
        console.warn('doCpeReboot.error',error);
      };
      commit('set_load',['doCpeReboot',false]);
      return state.resps.doCpeReboot;
    },
  },
});

const ACS_CPE={
  wlan24:{
    bandwidth:{
      items:['20 MHz','40 MHz','20/40 MHz'],
    },
  },
  wlan5:{
    bandwidth:{
      items:['20 MHz','40 MHz','20/40 MHz','80 MHz','20/40/80 MHz'],
    },
  },
  wlan5_bandwidth_items(){return [...new Set(['20 MHz','40 MHz','20/40 MHz','80 MHz','20/40/80 MHz',this.wlan5.bandwidth])].filter(v=>v)},
  getDiffParams(initial={},modifed={}){
    return Object.entries(modifed).reduce((params,[key,value])=>{
      if(modifed[key]!=initial[key]){
        params[key]=modifed[key];
      };
      return params
    },{});
  },
  testIp(value){
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(`${value}`);
  },
}

Vue.component('input-el', {//add disabled background
  template:`<section class="input-el" :class="sectionClass">
    <label class="input-el__label">
      <slot v-if="focus || value" name="prefix"></slot>

      <div class="input-el__input-wrapper">
        <input
          class="input-el__input"
          :class="inputClass"
          :value="value"
          :disabled="disabled" :style="{'background-color': disabled?'#f1f1f1':''}"
          :type="type"
          :placeholder="focus ? placeholder : label"
          v-bind="$attrs"
          @focus="focus = true"
          @blur="focus = false"
          @input="$emit('input', $event.target.value)">
      </div>

      <span v-show="focus || value" class="input-el__label-text" :style="{'background-color': disabled?'#f1f1f1':''}">{{ label }}</span>

      <slot name='postfix'></slot>

      <div class='input-el__clear' v-show='clearable && value' @click.stop='clear'>
        <i class="fas fa-times"></i>
      </div>
    </label>
  </section>`,
  props: {
    value: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    type: { type: String },
    error: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
  },
  data: () => ({
    focus: false,
  }),
  computed: {
    sectionClass() {
      return {
        'input-el--focus': this.focus,
        'input-el--filled': this.value,
        'input-el--error': this.error,
        'input-el--disabled': this.disabled,
      };
    },
    inputClass() {
      return {
        'input-el__input--prefix': !!this.$slots.prefix,
        'input-el__input--postfix': !!this.$slots.postfix,
      };
    },
  },
  methods: {
    clear() {
      if (this.disabled) return;
      this.$emit('input', '');
    },
  },
});

Vue.component('select-el', {//add disabled background
  template:`<section class="select-el" :class='elClass' :style="{'background-color': disabled?'#f1f1f1':''}">
      <label tabindex='1' class='select-el__label' @click='changeOpen'>
        <div class='select-el__clear' v-if='clearable && value' @click.stop='clear'>
          <i class="fas fa-times"></i>
        </div>

        <div class='select-el__input'>
          <slot
            name='currentValue'
            :currentValue='currentValue'
            :itemKey='itemKey'
            :inputByKey='inputByKey'
            :open='open'>
            <span class='select-el__input-text'>
              <template v-if='itemKey'>
                <template v-if='inputByKey'>{{currentValue}}</template>
                <template v-else-if='currentValue'>{{currentValue[itemKey]}}</template>
              </template>
              <template v-else>
                {{currentValue}}
              </template>
            </span>
          </slot>
        </div>

        <div class="select-el__icon"><i class="ic-24 ic-down"></i></div>
      </label>

      <span v-if="value || currentValue" class="select-el__label-text pointer-events-none" :style="{'background-color': disabled?'#f1f1f1':''}">{{ label }}</span>
      <span v-else class="select-el__placeholder pointer-events-none">{{ label }}</span>

      <div class="select-el__wrapper" @click='close'></div>

      <div class="select-el__list">
        <template v-for='(item,index) in items'>
          <slot
            name='itemRow'
            :setItem='setItem'
            :open='open'
            :itemKey='itemKey'
            :item='item'
            :isActiveItem='isActiveItem'
            :inputByKey='inputByKey'
            :index='index' >
              <div :class="itemClass(item)" @click='setItem(item)'>
                <slot
                  name='item'
                  :open='open'
                  :itemKey='itemKey'
                  :item='item'
                  :isActiveItem='isActiveItem'
                  :inputByKey='inputByKey'
                  :index='index' >
                  <template v-if='itemKey'>{{item[itemKey]}}</template>
                  <template v-else>{{item}}</template>
                </slot>
                <div class="select-el__item-icon">
                  <i v-if='isActiveItem(item)' class="ic-24 ic-radio-on main-lilac"></i>
                  <i v-else class="ic-24 ic-radio-off tone-650"></i>
                </div>
            </div>
          </slot>
        </template>
      </div>
  </section>`,
  props: {
    items: { type: Array, default: () => ([]) },
    value: [String, Number, Array, Object],
    label: { type: String, default: '' },
    itemKey: { type: String, default: '' },
    inputByKey: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  data: () => ({
    open: false,
  }),
  computed: {
    elClass() {
      return {
        'select-el--open': this.open,
        'select-el--error': this.error,
        'select-el--disabled': this.disabled,
      };
    },
    currentValue() {
      const value = this.value;
      const itemKey = this.itemKey;
      if (itemKey) {
        const current_value = this.inputByKey ? value : value?.[itemKey];
        const find = this.items.find((item) => item?.[itemKey] == current_value);
        if (find) {
          return value;
        }
      } else {
        if (this.items.includes(value)) return value;
      }
      return '';
    },
  },
  methods: {
    clear() {
      if (this.disabled) return;
      this.$emit('input', '');
    },
    changeOpen() {
      if (this.disabled) return;
      this.open = !this.open;
    },
    close() {
      if (this.disabled) return;
      this.open = false;
    },
    isActiveItem(item) {
      if (this.disabled) return;
      const itemKey = this.itemKey;
      const inputByKey = this.inputByKey;
      const value = this.value;
      if (itemKey) {
        if (inputByKey) {
          return value == item?.[itemKey];
        } else {
          return value?.[itemKey] == item?.[itemKey];
        }
      }
      return value == item;
    },
    setItem(item) {
      if (this.disabled) return;
      const itemKey = this.itemKey;
      if (itemKey && this.inputByKey) {
        this.$emit('input', item?.[itemKey]);
      } else {
        this.$emit('input', item);
      }

      this.close();
    },
    itemClass(item) {
      const isActive = this.isActiveItem(item);
      return {
        'select-el__item': true,
        'select-el__item--active': isActive,
      }
    }
  },
});

Vue.component('CpeSetWifiModal',{
  template:`<modal-container-custom name="CpeSetWifiModal" ref="modal" @open="onModalOpen" @close="onModalClose" header :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="margin-left-right-16px">
      <header class="margin-top-8px">
        <div class="font--18-600 tone-900 text-align-center">Wi-Fi</div>
        <div class="font--13-500 tone-500 text-align-center white-space-pre">{{$route.params.serial}} • {{$route.params.account}}</div>
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
      
      <section style="border:solid 1px #c8c7c7;" class="margin-top-8px border-radius-4px position-relative" :class="[!wlan24_isEnabled&&'bg-tone-150']">
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
            <select-el label="Ширина канала (МГц)" v-model="wlan24.bandwidth" :items="wlan24_bandwidth_items" :disabled="!wlan24_isEnabled||cpeUpdateLoading"/>
            <select-el label="Канал 2,4 ГГц" v-model="wlan24.channel" :items="wlan24_possiblechannels_items" :disabled="!wlan24_isEnabled||cpeUpdateLoading"/>
          </div>
        </template>
      </section>
      
      <section style="border:solid 1px #c8c7c7;" class="margin-top-8px border-radius-4px position-relative" :class="[!wlan5_isEnabled&&'bg-tone-150']">
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
            <select-el label="Ширина канала (МГц)" v-model="wlan5.bandwidth" :items="wlan5_bandwidth_items" :disabled="!wlan5_isEnabled||cpeUpdateLoading"/>
            <select-el label="Канал 5 ГГц" v-model="wlan5.channel" :items="wlan5_possiblechannels_items" :disabled="!wlan5_isEnabled||cpeUpdateLoading"/>
          </div>
        </template>
      </section>
      
      <section class="margin-top-8px">
        <div class="display-flex align-items-center justify-content-space-between gap-4px">
          <div class="font--13-500" :class="[!wps_ena_isEnabled&&'tone-500']">Защищенная настройка Wi-Fi (WPS)</div>
          <switch-el class="width-40px" v-model="wps_ena_isEnabled" :disabled="cpeUpdateLoading||true"/>
        </div>
      </section>
      
      <section class="margin-top-8px">
        <loader-bootstrap v-if="cpeUpdateLoading" text="применение настроек"/>
        <template v-else-if="cpeUpdateResult?.text">
          <message-el text="ошибка конфигурации" :subText="cpeUpdateResult?.message" type="warn" box class="margin-top-8px"/>
          <info-text-sec :text="cpeUpdateResult?.text" class="padding-left-right-0"/>
        </template>
        <message-el v-else-if="cpeUpdateResult?.key" text="конфигурирование успешно" type="success" box class="margin-top-8px"/>
      </section>
      
      <section class="display-flex align-items-center justify-content-space-between width-100-100 margin-top-16px">
        <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="content" icon="close-1"/>
        <button-main label="Применить" @click="save" :disabled="!!verifyText||cpeUpdateLoading" buttonStyle="contained" size="content"/>
      </section>
    </div>
  </modal-container-custom>`,
  props:{
    mr_id:{type:[Number,String],required:true},
    serial:{type:[Number,String],required:true},
    account:{type:[Number,String],required:true},
  },
  data:()=>({
    show:{
      wlan24:false,
      wlan5:false,
    },
    commonMode:true,
    commonSsid:'',
    commonPass:'',
    wps_ena_isEnabled:false,
    wlan24_isEnabled:false,
    wlan5_isEnabled:false,
    wlan24_isVisible:false,
    wlan5_isVisible:false,
    wlan24_ssid:'',
    wlan5_ssid:'',
    wlan24:{
      visibility:null,
      bandwidth:null,
      beacontype:null,
      channel:null,
      enabled:null,
      ssid:'',
      pass:null,
    },
    wlan5:{
      visibility:null,
      bandwidth:null,
      beacontype:null,
      channel:null,
      enabled:null,
      ssid:'',
      pass:'',
    },
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
    ...mapGetters({
      cpe:'cpe2/getCpeResult',
      cpeUpdateLoading:'cpe2/doCpeUpdateLoading',
      cpeUpdateResult:'cpe2/doCpeUpdateResult',
    }),
    wlan24_bandwidth_items(){return [...new Set([...ACS_CPE.wlan24.bandwidth.items,this.wlan24.bandwidth])].filter(v=>v)},
    wlan5_bandwidth_items(){return [...new Set([...ACS_CPE.wlan24.bandwidth.items,this.wlan5.bandwidth])].filter(v=>v)},
    beacontype_items(){return [...new Set(['11i',this.wlan24.beacontype,this.wlan5.beacontype])].filter(v=>v)},
    wps_ena(){return this.cpe?.wps_ena},
    wlans(){return this.cpe?.wlans||[]},
    wlan24_initial(){return this.wlans.find(({lan})=>lan==='wlan24')},
    wlan5_initial(){return this.wlans.find(({lan})=>lan==='wlan5')},
    wlan24_possiblechannels_items(){return [...new Set([...this.wlan24_initial?.possiblechannels||[],this.wlan24.channel])].filter(v=>v)},
    wlan5_possiblechannels_items(){return [...new Set([...this.wlan5_initial?.possiblechannels||[],this.wlan5.channel])].filter(v=>v)},
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
      this.reset('doCpeUpdate');
    },
    init(){
      this.wps_ena_isEnabled=this.wps_ena=='Up';
      this.wlan24 = {
        visibility: this.wlan24_initial.visibility,
        bandwidth: this.wlan24_initial.bandwidth,
        beacontype: this.wlan24_initial.beacontype,
        channel: +this.wlan24_initial.channel,
        enabled: this.wlan24_initial.enabled,
        ssid: this.wlan24_initial.ssid,
        pass: '',
      };
      this.wlan5 = {
        visibility: this.wlan5_initial.visibility,
        bandwidth: this.wlan5_initial.bandwidth,
        beacontype: this.wlan5_initial.beacontype,
        channel: +this.wlan5_initial.channel,
        enabled: this.wlan5_initial.enabled,
        ssid: this.wlan5_initial.ssid,
        pass: '',
      };
      this.wlan24_isEnabled=this.wlan24.enabled=='Up';
      this.wlan5_isEnabled=this.wlan5.enabled=='Up';
      this.wlan24_isVisible=this.wlan24.visibility=='Up';
      this.wlan5_isVisible=this.wlan5.visibility=='Up';
      this.wlan24_ssid=this.wlan24.ssid;
      this.wlan5_ssid=this.wlan5.ssid;
    },
    ...mapActions({
      doCpeUpdate:'cpe2/doCpeUpdate',
      getCpe:'cpe2/getCpe',
    }),
    ...mapMutations({
      reset:'cpe2/reset',
    }),
    async save(){
      this.wlan24.enabled=this.wlan24_isEnabled?'Up':'Down';
      this.wlan5.enabled=this.wlan5_isEnabled?'Up':'Down';
      this.wlan24.visibility=this.wlan24_isVisible?'Up':'Down';
      this.wlan5.visibility=this.wlan5_isVisible?'Up':'Down';
      this.wlan24.ssid=this.wlan24_ssid.replace(/(_|-|)(2.4|5)GHz(_|-|)/gi,'');//префикс подставляется на BE
      this.wlan5.ssid=this.wlan5_ssid.replace(/(_|-|)(2.4|5)GHz(_|-|)/gi,'');//префикс подставляется на BE
      await this.doCpeUpdate({//fake:true,
        ...this.$route.params,
        //...this.wps_ena_isEnabled!=this.wps_ena?{wps_ena:this.wps_ena_isEnabled?'Up':'Down'}:null,
        wlan24:ACS_CPE.getDiffParams({...this.wlan24_initial,pass:''},this.wlan24),
        wlan5:ACS_CPE.getDiffParams({...this.wlan5_initial,pass:''},this.wlan5),
      });
      if(this.cpeUpdateResult?.key){
        this.getCpe(this.$route.params);
        this.reset('doCpeUpdate');
      }
    },
  },
});

Vue.component('CpeSetLanModal',{
  template:`<modal-container-custom name="CpeSetLanModal" ref="modal" @open="onModalOpen" @close="onModalClose" header :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="margin-left-right-16px">
      <header class="margin-top-8px">
        <div class="font--18-600 tone-900 text-align-center">LAN</div>
        <div class="font--13-500 tone-500 text-align-center white-space-pre">{{$route.params.serial}} • {{$route.params.account}}</div>
      </header>
      
      <section class="margin-top-8px">
        <div class="display-flex align-items-center justify-content-space-between gap-4px">
          <div class="font--13-500" :class="[!dhcp&&'tone-500']">DHCP сервер</div>
          <switch-el class="width-40px" v-model="dhcp" :disabled="cpeUpdateLoading"/>
        </div>
      </section>
      
      <section class="margin-top-8px">
        <div>
          <input-el label="Начальный IP-адрес диапазона" v-model="config.lan_dhcp_min" :error="!!lan_dhcp_min_verifyText" :disabled="cpeUpdateLoading" inputmode="numeric"/>
          <input-error :text="lan_dhcp_min_verifyText"/>
        </div>
        <div>
          <input-el label="Конечный IP-адрес диапазона" v-model="config.lan_dhcp_max" :error="!!lan_dhcp_max_verifyText" :disabled="cpeUpdateLoading" inputmode="numeric"/>
          <input-error :text="lan_dhcp_max_verifyText"/>
        </div>
        <div>
          <input-el label="Маска подсети" v-model="config.lan_mask" :error="!!lan_mask_verifyText" :disabled="cpeUpdateLoading" inputmode="numeric"/>
          <input-error :text="lan_mask_verifyText"/>
        </div>
        <div>
          <input-el label="Локальный IP-адрес (LAN IP)" v-model="config.lan_ip" :error="!!lan_ip_verifyText" :disabled="cpeUpdateLoading" inputmode="numeric"/>
          <input-error :text="lan_ip_verifyText"/>
        </div>
      </section>
      
      <section class="margin-top-8px">
        <div class="display-flex align-items-center justify-content-space-between gap-4px">
          <div class="font--13-500" :class="[!igmp&&'tone-500']">IGMP прокси</div>
          <switch-el class="width-40px" v-model="igmp" :disabled="cpeUpdateLoading"/>
        </div>
      </section>
      
      <section class="margin-top-8px">
        <loader-bootstrap v-if="cpeUpdateLoading" text="применение настроек"/>
        <template v-else-if="cpeUpdateResult?.text">
          <message-el text="ошибка конфигурации" :subText="cpeUpdateResult?.message" type="warn" box class="margin-top-8px"/>
          <info-text-sec :text="cpeUpdateResult?.text" class="padding-left-right-0"/>
        </template>
        <message-el v-else-if="cpeUpdateResult?.key" text="конфигурирование успешно" type="success" box class="margin-top-8px"/>
      </section>
      
      <section class="display-flex align-items-center justify-content-space-between width-100-100 margin-top-16px">
        <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="content" icon="close-1"/>
        <button-main label="Применить" @click="save" :disabled="!!verifyText||cpeUpdateLoading" buttonStyle="contained" size="content"/>
      </section>
    </div>
  </modal-container-custom>`,
  props:{
    mr_id:{type:[Number,String],required:true},
    serial:{type:[Number,String],required:true},
    account:{type:[Number,String],required:true},
  },
  data:()=>({
    dhcp:false,
    igmp:false,
    config:{
      dhcp_ena:null,
      igmp_ena:null,
      lan_dhcp_min:null,
      lan_dhcp_max:null,
      lan_mask:null,
      lan_ip:null
    }
  }),
  watch:{
    
  },
  computed:{
    ...mapGetters({
      cpe:'cpe2/getCpeResult',
      cpeUpdateLoading:'cpe2/doCpeUpdateLoading',
      cpeUpdateResult:'cpe2/doCpeUpdateResult',
    }),
    initial(){
      const {lan_dhcp_min,lan_dhcp_max,lan_mask,lan_ip,dhcp_ena,igmp_ena}=this.cpe||{};
      return {
        dhcp_ena:dhcp_ena=='Up'?'Up':'Down',
        igmp_ena:igmp_ena=='Up'?'Up':'Down',
        lan_dhcp_min:lan_dhcp_min||'',
        lan_dhcp_max:lan_dhcp_max||'',
        lan_mask:lan_mask||'',
        lan_ip:lan_ip||'',
      }
    },
    lan_dhcp_min_verifyText(){return !ACS_CPE.testIp(this.config.lan_dhcp_min)?'Не верный формат IP':''},
    lan_dhcp_max_verifyText(){return !ACS_CPE.testIp(this.config.lan_dhcp_max)?'Не верный формат IP':''},
    lan_mask_verifyText(){return !ACS_CPE.testIp(this.config.lan_mask)?'Не верный формат IP':''},
    lan_ip_verifyText(){return !ACS_CPE.testIp(this.config.lan_ip)?'Не верный формат IP':''},
    verifyText(){return this.lan_dhcp_min_verifyText||this.lan_dhcp_max_verifyText||this.lan_mask_verifyText||this.lan_ip_verifyText},
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
      this.reset('doCpeUpdate');
    },
    init(){
      const {lan_dhcp_min,lan_dhcp_max,lan_mask,lan_ip,dhcp_ena,igmp_ena}=this.initial;
      this.config.dhcp_ena=dhcp_ena;
      this.config.igmp_ena=igmp_ena;
      this.dhcp=this.config.dhcp_ena=='Up';
      this.igmp=this.config.igmp_ena=='Up';
      this.config.lan_dhcp_min=lan_dhcp_min;
      this.config.lan_dhcp_max=lan_dhcp_max;
      this.config.lan_mask=lan_mask;
      this.config.lan_ip=lan_ip;
    },
    ...mapActions({
      doCpeUpdate:'cpe2/doCpeUpdate',
      getCpe:'cpe2/getCpe',
    }),
    ...mapMutations({
      reset:'cpe2/reset',
    }),
    async save(){
      this.config.dhcp_ena=this.dhcp?'Up':'Down';
      this.config.igmp_ena=this.igmp?'Up':'Down';
      await this.doCpeUpdate({//fake:true,
        ...this.$route.params,
        lan:ACS_CPE.getDiffParams(this.initial,this.config)
      });
      if(this.cpeUpdateResult?.key){
        this.getCpe(this.$route.params);
        this.reset('doCpeUpdate');
      }
    },
  },
});

Vue.component('CpeSetWanModal',{
  template:`<modal-container-custom name="CpeSetWanModal" ref="modal" @open="onModalOpen" @close="onModalClose" header :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="margin-left-right-16px">
      <header class="margin-top-8px">
        <div class="font--18-600 tone-900 text-align-center">WAN</div>
        <div class="font--13-500 tone-500 text-align-center white-space-pre">{{$route.params.serial}} • {{$route.params.account}}</div>
      </header>
      
      <section class="margin-top-8px">
        <select-el label="Тип авторизации" v-model="config.auth_type" :items="authTypes"/>
      </section>
      
      <section style="border:solid 1px #c8c7c7;" class="margin-top-8px border-radius-4px padding-8px">
        
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
            <input-el label="Логин" v-model="config.wan.username" :error="!!verifyText" :disabled="cpeUpdateLoading||credentials"/>
            <input-error :text="verifyText"/>
          </div>
          <div>
            <input-el label="Пароль" v-model="config.wan.password" :error="!!verifyText" :disabled="cpeUpdateLoading||credentials"/>
            <input-error :text="verifyText"/>
          </div>
        </template>
        
      </section>
      
      <section style="border:solid 1px #c8c7c7;" class="margin-top-8px border-radius-4px padding-8px">
        <div class="display-flex align-items-center justify-content-space-between gap-4px">
          <div class="font--13-500" :class="[!dns_auto_enabled&&'tone-500']">DNS-сервер автоматически</div>
          <switch-el class="width-40px" v-model="dns_auto_enabled" :disabled="cpeUpdateLoading"/>
        </div>
        <template v-if="!dns_auto_enabled">
          <select-el label="DNS-сервер"" v-model="dns_name" :items="Object.keys(dns_items)" :disabled="cpeUpdateLoading"/>
          <info-value label="Master DNS" :value="dns[0]" withLine class="padding-left-right-0"/>
          <info-value label="Slave DNS" :value="dns[1]" withLine class="padding-left-right-0"/>
        </template>
      </section>
      
      <section class="margin-top-8px">
        <loader-bootstrap v-if="cpeUpdateLoading" text="применение настроек"/>
        <template v-else-if="cpeUpdateResult?.text">
          <message-el text="ошибка конфигурации" :subText="cpeUpdateResult?.message" type="warn" box class="margin-top-8px"/>
          <info-text-sec :text="cpeUpdateResult?.text" class="padding-left-right-0"/>
        </template>
        <message-el v-else-if="cpeUpdateResult?.key" text="конфигурирование успешно" type="success" box class="margin-top-8px"/>
      </section>
      
      <section class="display-flex align-items-center justify-content-space-between width-100-100 margin-top-16px">
        <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="content" icon="close-1"/>
        <button-main label="Применить" @click="save" :disabled="!!verifyText||cpeUpdateLoading" buttonStyle="contained" size="content"/>
      </section>
    </div>
  </modal-container-custom>`,
  props:{
    mr_id:{type:[Number,String],required:true},
    serial:{type:[Number,String],required:true},
    account:{type:[Number,String],required:true},
  },
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
  }),
  watch:{
    'credentials'(credentials){
      this.config.wan.username=credentials?'Error: Not found':this.initial.wan.username;
      this.config.wan.password=credentials?'Error: Not found':this.initial.wan.password;
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
    dns(){return this.config.wan.dns_servers.split(',')},
    ...mapGetters({
      cpe:'cpe2/getCpeResult',
      cpeUpdateLoading:'cpe2/doCpeUpdateLoading',
      cpeUpdateResult:'cpe2/doCpeUpdateResult',
    }),
    initial(){
      const {auth_type,wan_def}=this.cpe||{};
      const {dns_auto_enabled,dns_servers,wan_ip,wan_mask,wan_gateway,l2tp_server,username}=this.cpe?.wan||{};
      return {
        auth_type,
        wan:{
          wan_def:wan_def||'',
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
    verifyText(){return ''}
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
      this.reset('doCpeUpdate');
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
    },
    ...mapActions({
      doCpeUpdate:'cpe2/doCpeUpdate',
      getCpe:'cpe2/getCpe',
    }),
    ...mapMutations({
      reset:'cpe2/reset',
    }),
    async save(){
      const isAuthTypeUpdate=!new RegExp(this.initial.auth_type||'','gi').test(this.config.auth_type||'');
      const {wan_def,dns_auto_enabled,dns_servers,wan_ip,wan_mask,wan_gateway,l2tp_server,username,password}=this.config.wan;
      await this.doCpeUpdate({//fake:true,
        ...this.$route.params,
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
        }
      });
      if(this.cpeUpdateResult?.key){
        this.getCpe(this.$route.params);
        this.reset('doCpeUpdate');
      }
    },
  },
});

Vue.component('CpeRestoreConfigModal',{
  template:`<modal-container-custom name="CpeRestoreConfigModal" ref="modal" @open="onModalOpen" @close="onModalClose" header :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="margin-left-right-16px">
      <header class="margin-top-8px">
        <div class="font--18-600 tone-900 text-align-center">Выбор конфигурации</div>
        <div class="font--13-500 tone-500 text-align-center white-space-pre">{{$route.params.serial}} • {{$route.params.account}}</div>
      </header>
      
      <section style="border:solid 1px #c8c7c7;" class="margin-top-8px border-radius-4px padding-8px---">
        <radio-select-el ref="cfg_selector" :list="configs" keyName="cfgid" keyLabel="label" keyLabel2="date" keyLabel3="comments" keyDisabled="disabled" @selected="onSelect" :value="selected" reverse/>
      </section>
      
      <section class="margin-top-8px">
        <loader-bootstrap v-if="doCpeRestoreConfigLoading" text="применение конфигурации"/>
        <template v-else-if="doCpeRestoreConfigResult?.text">
          <message-el text="ошибка конфигурации" :subText="doCpeRestoreConfigResult?.message" type="warn" box class="margin-top-8px"/>
          <info-text-sec :text="doCpeRestoreConfigResult?.text" class="padding-left-right-0"/>
        </template>
        <message-el v-else-if="doCpeRestoreConfigResult?.ticketid" text="конфигурирование успешно" type="success" box class="margin-top-8px"/>
      </section>
      
      <section class="display-flex align-items-center justify-content-space-between width-100-100 margin-top-16px">
        <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="content" icon="close-1"/>
        <button-main label="Применить" @click="restore" :disabled="doCpeRestoreConfigLoading||!selected" buttonStyle="contained" size="content"/>
      </section>
    </div>
  </modal-container-custom>`,
  props:{
    mr_id:{type:[Number,String],required:true},
    serial:{type:[Number,String],required:true},
    account:{type:[Number,String],required:true},
  },
  data:()=>({
    selected:null,
  }),
  computed:{
    ...mapGetters({
      cpeConfigs:'cpe2/getCpeConfigsResult',
      doCpeRestoreConfigLoading:'cpe2/doCpeRestoreConfigLoading',
      doCpeRestoreConfigResult:'cpe2/doCpeRestoreConfigResult'
    }),
    configs(){
      return (this.cpeConfigs||[]).map(config=>({
        ...config,
        date:new Date(Date.parse(config.last_updated||config.creation_time)+7*60*60*1000).toDateTimeString(),//дата приходит в гринвиче
        label:[config.cfgid,config.cid,config.config_name].filter(v=>v).join('-'),
        disabled:this.doCpeRestoreConfigLoading,
      }));
    },
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
      this.reset('doCpeRestoreConfig');
      this.clear();
    },
    init(){
      
    },
    ...mapActions({
      doCpeRestoreConfig:'cpe2/doCpeRestoreConfig',
      getCpe:'cpe2/getCpe',
    }),
    ...mapMutations({
      reset:'cpe2/reset',
    }),
    onSelect(item={}){
      this.selected=item;
    },
    clear(){
      this.selected=null;
      this.$refs.cfg_selector.unselect();
    },
    async restore(){
      await this.doCpeRestoreConfig({//fake:true,
        ...this.$route.params,
        cfg_id:this.selected?.cfgid
      });
      if(this.doCpeRestoreConfigResult?.ticketid){
        this.getCpe(this.$route.params);
        this.reset('doCpeRestoreConfig');
      }
    },
  },
});

Vue.component('AccountCpePage2',{
  template:`<section name="AccountCpePage2" class="account-cpe">
    <page-navbar :title="title" @refresh="refresh"/> 
    <loader-bootstrap v-if="cpeDbLoading" :text="searchText"/>
    <template v-else-if="cpeDb?.model">
      <CardBlock>
        <title-main :icon="'- ic-status '+isOnline" :text="cpeDb?.vendor" :text2="cpeDb?.model" size="large"/>
        <devider-line />
        <section>
          <info-value label="sysUpTime" type="medium" withLine>
            <span slot="value" :class="classUptime">{{duration}}</span>
          </info-value>
          <info-value label="serialNumber" :value="cpeDb?.sn" type="medium" withLine/>
          <info-value label="IP адрес" v-if="!cpe?.mac" :value="cpeDb?.wan?.wan_ip||cpeDb?.router_ip||cpeDb?.external_ip" type="medium" withLine/>
          <info-value label="MAC адрес" v-if="!cpe?.mac" :value="cpeDb?.mac" type="medium" withLine/>
          <info-value label="Версия ПО" :value="cpe?.soft_ver||cpeDb?.soft_ver" type="medium" withLine/>
          <info-value label="Последняя активность" :value="getTimeDate(cpeDb?.last_msg_time)" type="medium" withLine/> 
          <info-value label="Статус соединения" v-if="cpeDb?.connect_state" type="medium" withLine >
            <span slot="value" :class="getCpeState(cpeDb.connect_state).color">{{getCpeState(cpeDb.connect_state).text}}</span>
          </info-value>
          <template v-if="cpeDb?.connect_state==7">
            <devider-line/>
            <message-el :text="cpeState[cpeDb?.connect_state]?.text" type="warn"/>
          </template>
        </section>
      </CardBlock>
      
      <loader-bootstrap v-if="cpeLoading" text="получение данных с CPE"/>
      
      <template v-else-if="cpe?.auth_type">
        <CardBlock>
          <section class="margin-left-right-16px display-flex align-items-center justify-content-space-between">
            <div class="display-flex align-items-center gap-4px">
              <button-main label="Reboot" @click="reboot" :disabled="doCpeRebootLoading" buttonStyle="outlined" size="content"/>
              <div v-if="doCpeRebootLoading" class="display-flex">
                <span class="ic-24 ic-loading rotating main-lilac"></span>
              </div>
            </div>
            <div class="display-flex align-items-center gap-4px">
              <div v-if="cpeConfigsLoading" class="display-flex">
                <span class="ic-24 ic-loading rotating main-lilac"></span>
              </div>
              <button-main v-bind="btnOpenCfgProps" @click="$refs.CpeRestoreConfigModal.open()" buttonStyle="outlined" size="content"/>
              <CpeRestoreConfigModal ref="CpeRestoreConfigModal" v-bind="$route.params"/>
            </div>
          </section>
        </CardBlock>
        
        <CardBlock>
          <title-main icon="wan" text="Соединение с интернет" text2="WAN" size="large">
            <button-sq icon="edit" @click.stop="$refs.CpeSetWanModal.open()"/>
          </title-main>
          <CpeSetWanModal ref="CpeSetWanModal" v-bind="$route.params"/>
          <devider-line/>
          <section v-if="cpe">
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
            <template v-if="open.wan&&cpe?.wan">
              <devider-line />
              <info-value label="CRC ошибки (rx/tx)" :value="(cpe.wan.crc_in||0)+'/'+(cpe.wan.crc_out||0)" type="medium" withLine/>
              <info-value label="Packet RX" :value="cpe.wan.received" type="medium" withLine/>
              <info-value label="Packet TX" :value="cpe.wan.sent" type="medium" withLine/>
            </template>
          </section>
        </CardBlock>
        
        <CardBlock v-if="cpe?.wlans">
          <title-main icon="wifi" text="Беспроводная сеть" text2="WiFi" size="large" :opened="open.wlan" @block-click="open.wlan=!open.wlan">
            <button-sq icon="edit" @click.stop="$refs.CpeSetWifiModal.open()"/>
          </title-main>
          <CpeSetWifiModal ref="CpeSetWifiModal" v-bind="$route.params"/>
          <CpeWlan v-show="open.wlan" v-for="wlan of cpe.wlans" :key="wlan.lan" :wlan="wlan" :wps="cpe.wps_ena"/>
        </CardBlock>
        
        <CardBlock v-if="cpe?.lans">
          <title-main icon="lan" text="Локальная сеть" text2="LAN" size="large" :opened="open.lan" @block-click="open.lan=!open.lan">
            <button-sq icon="edit" @click.stop="$refs.CpeSetLanModal.open()"/>
          </title-main>
          <CpeSetLanModal ref="CpeSetLanModal" v-bind="$route.params"/>
          <CpeLan v-show="open.lan" :ports="cpe.lans" :cpe="cpe"/>
        </CardBlock>
        
        <CardBlock v-if="hasVoip">
          <title-main icon="phone" text="VoIP" size="large" :opened="open.voip" @block-click="open.voip=!open.voip">
            <button-sq icon="edit" @click.stop="" disabled/>
          </title-main>
          <devider-line/>
          <section v-if="open.voip">
            <info-value label="VoIP профиль" :value="onOff(cpe.voip.status)" type="medium" withLine/>
            <info-value label="Телефонный номер" :value="cpe.voip.URI" type="medium" withLine/>
            <info-value label="Прокси-сервер" :value="cpe.voip.proxy_server" type="medium" withLine/>
            <info-value label="VLAN для VoIP" :value="cpe.voip.vlan" type="medium" withLine/>
          </section>
        </CardBlock>
      </template>
      
      <CardBlock v-else>
        <message-el v-if="!cpe?.auth_type" text="Нет ответа от CPE" :subText="cpe?.message" type="warn" box/>
        <info-text-sec :text="cpe?.text"/>
      </CardBlock>
    </template>
    
    <CardBlock v-else>
      <message-el v-if="!cpeDb?.model" text="Нет данных по CPE" :subText="cpeDb?.message" type="warn" box/>
      <info-text-sec :text="cpeDb?.text"/>
    </CardBlock>
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
    /*this.$root.$on('root--cpe-set-config--on-cfg-restore',result=>{
      if(result?.message==='OK'){
        this.getCpe(this.$route.params);
      };
    });*/
  },
  computed:{
    title(){return this.$route.params.serial?.toUpperCase()},
    searchText(){return `поиск CPE "${this.$route.params.serial}"`},
    ...mapGetters({
      cpeDbLoading:'cpe2/getCpeDbLoading',
      cpeDb:'cpe2/getCpeDbResult',
      cpeLoading:'cpe2/getCpeLoading',
      cpe:'cpe2/getCpeResult',
      cpeConfigsLoading:'cpe2/getCpeConfigsLoading',
      cpeConfigs:'cpe2/getCpeConfigsResult',
      doCpeRebootLoading:'cpe2/doCpeRebootLoading',
      doCpeRebootResult:'cpe2/doCpeRebootResult',
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
      doCpeReboot:'cpe2/doCpeReboot',
    }),
    async reboot(){
      await this.doCpeReboot(this.$route.params);
      if(this.doCpeRebootResult&&!this.doCpeRebootResult?.text){
        this.refresh();
      }
    },
    async refresh(){
      if(this.loadingSome){return};
      await this.getCpeDb(this.$route.params);
      if(!this.cpeDb||this.cpeDb?.error){return};
      await this.getCpe(this.$route.params);
    },
    getTimeDate(ms){
      if(!ms){return 'Нет данных'};
      return new Date(Number(ms)*1000).toDateTimeString();
      //const date=new Date(Number(ms)*1000);
      //return Dt.format(date,'datetime');
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
  },
});

Vue.component('equipment-header', {
  template:`<title-main :icon="icon" textClass="font--13-500" :text="equipment.model||equipment.type_desc||equipmentTitle.type_desc" @block-click="toCpe">
    <button-sq v-if="isCpe" icon="right-link" type="medium"/>
    <button-sq v-if="isCpe" icon="right-link" type="medium"/>
  </title-main>`,
  props:{
    equipment:{type:Object,required: true},
    account:{type:String,default:''},
    mr_id: {type: Number, required: true }
  }, 
  data:()=>({}),
  computed:{
    equipmentTitle(){
      return {
        camtv   :{icon:'tv',          type_desc:'CAM-модуль'},
        hdtv    :{icon:'tv',          type_desc:'HD-приставка'},
        hybrid  :{icon:'tv',          type_desc:'HD-приставка Гибрид'},
        iptv    :{icon:'tv',          type_desc:'IPTV-приставка'},
        sdtv    :{icon:'tv',          type_desc:'SD-приставка'},
        ott     :{icon:'tv',          type_desc:'OTT-приставка'},
        voip    :{icon:'phone-1',     type_desc:'VoIP роутер'},
        wifi    :{icon:'router',      type_desc:'Wi-Fi роутер'}
      }[this.equipment.type]||{icon:'mark-circle', type_desc:'CPE'};
    },
    icon(){
      return this.equipmentTitle.icon+(this.equipment.fake?' message-el__wrapper--warn':'');
    },
    isCpe(){
      return ['wifi','voip'].includes(this.equipment.type);
    },
  },
  methods:{
    toCpe(){
      if(!this.isCpe){return};
      if(!this.equipment.id){return};
      if(!this.account){return};
      this.$router.push({
        name:'account-cpe',
        params:{
          mr_id:this.mr_id,
          serial:this.equipment.id,
          account:this.account,
        },
      });
    },
  },
});

app.$router.addRoutes([
  {
    name: 'cpe_test_2',
    path: '/cpe_test_2-:mr_id-:serial-:account',
    props: true,
    component: Vue.component("AccountCpePage2"),
  },
]);

if(true||store?.state?.main?.userData?.username=='mypanty1'){
  app.$router.beforeEach((to,from,next)=>{
    if(to.name==='account-cpe'){
      next({
        name:'cpe_test_2',
        params:to.params
      });
    }else{
      next();
    };
  });
}
/*
F20200041915	Arcadian WG430223
F172000078595	D-Link DIR-822v2
QXL11I8012693	D-Link DIR-822
F20100055341	Transservice TS-7022
QXAT3G8021058	D-Link DIR-615 
SM1805012134	Sercomm S1010 
F18100128940	Qtech QBR-1041AC
TK2S119023128	D-Link DIR-842s
TW1I111030266	D-Link DIR-825
*/
//app.$router.push({name:'cpe_test_2',params:{mr_id:4,serial:'F172000078595',account:'60910538250'}});











