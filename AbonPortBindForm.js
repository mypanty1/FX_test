//fix check session
Vue.component('AbonPortBindForm', {//11310009159
  beforeCreate(){
    class InfoValueProps {
      constructor(label = '', labelClass = '', value = '', valueClass = '', valueStyle = '', valueIconClass = ''){
        this.label = label
        this.labelClass = labelClass
        this.value = value
        this.valueClass = valueClass
        this.valueStyle = valueStyle
        this.valueIconClass = valueIconClass
      }
    };
    class InfoValueProps_Loading extends InfoValueProps {
      constructor(label = ''){
        super(label, '', '', 'display-flex', '', 'ic-16 ic-loading rotating main-lilac')
      }
    };
    class InfoValueProps_Success extends InfoValueProps {
      constructor(label = '', labelClass = ''){
        super(label, labelClass, '✔', 'display-flex', 'color:#20a471;font-weight:900;')
      }
    };
    class InfoValueProps_Warning extends InfoValueProps {
      constructor(label = ''){
        super(label, '', '✘', 'display-flex', 'color:#f16b16;font-weight:900;')
      }
    };
    class InfoValueProps_Initial extends InfoValueProps {
      constructor(label = '', labelClass = ''){
        super(label, labelClass, '—', 'display-flex', 'color:#918f8f;font-weight:900;')
      }
    };
    this.$mapOptions({
      InfoValueProps_Loading,
      InfoValueProps_Success,
      InfoValueProps_Warning,
      InfoValueProps_Initial,
      CONST: Object.freeze({
        VGID_IS_ACTIVE_TEXT: 'УЗ активирована',
        PORT_IS_UP_TEXT: 'Линк на порту',
        MAC_ON_PORT_TEXT: 'MAC на порту',
        SESSION_BY_MAC_TEXT: 'Сессия по маку',
      }),
    })
  },
  template: `<div>
    <div class="display-flex flex-direction-column gap-8px">
      <AbonPortBindFormPortStatus v-bind="{
        networkElement,
        port,
        disabled,
        portStatus,
        portStatusLoading
      }" @updatePortStatus="$emit('updatePortStatus')"/>

      <div v-if="typeOfBindIsLinkPortScheme" class="display-flex flex-direction-column border-1px-solid-c8c7c7 border-radius-4px">
        <div class="font--13-500 tone-500 margin-left-right-4px">для успешной привязки необходимо:</div>
        
        <div class="divider-line"/>
        
        <div class="display-flex flex-direction-column padding-left-right-4px">
          <info-value v-for="(props,key) of checksLinkPortScheme" :key="key" v-bind="props" class="padding-unset" withLine>
            <span v-if="props.valueIconClass" slot="value" :class="props.valueIconClass"></span>
          </info-value>
        </div>
      </div>
      
      <div v-if="sessionsInfo?.length" class="display-flex flex-direction-column border-1px-solid-c8c7c7 border-radius-4px">
        <div class="display-flex flex-direction-column padding-left-right-4px">
          <info-value v-for="(props,key) of sessionsInfo" :key="key" v-bind="props" class="padding-unset" withLine>
            <span v-if="props.valueIconClass" slot="value" :class="props.valueIconClass"></span>
          </info-value>
        </div>
      </div>
      
      <UIUserMessage v-if="!fields.length" :message="['Привязка этой УЗ не предусмотрена', 'typeOfBindID: ' + typeOfBindID]" type="info"/>
      
      <component v-for="({is, props, listeners, slots = {}}, index) of fields" :key="index" :is="is" v-bind="props" v-on="listeners">
        <component v-for="({is, props, listeners}, slot) in slots" :key="slot" :slot="slot" :is="is" v-bind="props" v-on="listeners">
          
        </component>
      </component>

      <loader-bootstrap v-if="bindResourcesLoading" text="бронирование ресурсов сети"/>
      <template v-else-if="bindResourcesResult">
        <UIUserMessage v-if="bindResourcesIsError" :message="bindResourcesErrorMessage" type="warning"/>
        <template v-else>
          <UIUserMessage :message="bindResourcesInfoMessage" type="success"/>
          <template v-if="bindResourcesResult.cfg">
            <template v-for="(value, label, index) in bindResourcesResult.cfg">
              <info-value v-if="value" :key="index" v-bind="{value, label}" type="medium" withLine/>
            </template>
          </template>
          <link-block icon="person" v-if="bindResourcesIsSuccess" :text="accountID" :search="accountID" class="padding-unset"/>
        </template>
      </template>
      
    </div>
  </div>`,
  props: {
    port: {type: Object, required: !0},
    networkElement: {type: Object, required: !0},
    accountID: {type: String, required: !0, default: ''},
    accountInstance: {type: Object, required: !0, default: () => ({})},
    selectedServiceItem: {type: Object, required: !0, default: () => ({})},
    macs: {type: Array, required: !0, default: () => []},
    disabled: {type: Boolean, default: !1},
    portMacsLoading: {type: Boolean, default: !1},
    portStatus: {type: Object, default: null},
    portStatusLoading: {type: Boolean, default: !1},
  },
  created(){
    this.autoSelectMACAddress()
  },
  data: () => ({
    selectedMACAddress: '',
    selectedIPAddress: '',
    bindResourcesLoading: !1,
    bindResourcesResult: null,
    findSessionsByMACAddressLoads: {},
    findSessionsByMACAddressResps: {},
    backup: null,
  }),
  watch: {
    'bindResourcesLoading'(bindResourcesLoading){
      this.$emit('bindResourcesLoading', bindResourcesLoading)
    },
    'bindResourcesResult'(bindResourcesResult){
      this.$emit('bindResourcesResult', bindResourcesResult)
    },
    'macs'(macs){
      this.autoSelectMACAddress()
    },
    'macAddressIsValid'(macAddressIsValid){
      this.$emit('onMac', this.macAddress);//for find CPE in AbonPortBindModal
      this.findSessionsByMACAddress()
    },
    'bindResourcesIsError'(isError){
      if(!isError){return};
      this.$report([atod(this.$options.name, 'bindResourcesIsError'), {
        accountService: {
          mrID: this.mrID,
          serverID: this.serverID,
          typeOfBindID: this.typeOfBindID,
          accountID: this.accountID,
          serviceID: this.selectedServiceItem?.serviceID,
          serviceIsActive: this.serviceIsActive,
        },
        networkResources: {
          macAddress: this.macAddress,
          macAddressForBind: this.macAddressForBind,
          deviceIPAddress: this.deviceIPAddress,
          deviceName: this.deviceName,
          devicePortNumber: this.devicePortNumber,
          devicePortName: this.devicePortName,
          devicePortIndex: this.devicePortIndex,
          isLinkUp: this.isLinkUp,
          selectedMACAddress: this.selectedMACAddress,
          selectedIPAddress: this.selectedIPAddress,
        },
        serviceMixQuery: {
          params: this.backup,
          result: this.bindResourcesResult,
        }
      }])
    }
  },
  computed:{
    mrID(){return this.accountInstance?.mrID},
    serverID(){return this.accountInstance?.serverID},
    typeOfBindID(){return this.accountInstance?.typeOfBindID},
    serviceIsActive(){return this.selectedServiceItem?.serviceIsActive},

    typeOfBindIsLinkPortScheme(){return this.typeOfBindID == SM.BIND_TYPE_ID_11},
    checksLinkPortScheme(){
      const {VGID_IS_ACTIVE_TEXT, PORT_IS_UP_TEXT, MAC_ON_PORT_TEXT, SESSION_BY_MAC_TEXT} = this.CONST;
      return [
        this.serviceIsActive ? new this.InfoValueProps_Success(VGID_IS_ACTIVE_TEXT) : new this.InfoValueProps_Warning(VGID_IS_ACTIVE_TEXT),
        this.portStatusLoading ? new this.InfoValueProps_Loading(PORT_IS_UP_TEXT) : this.isLinkUp ? new this.InfoValueProps_Success(PORT_IS_UP_TEXT) : new this.InfoValueProps_Warning(PORT_IS_UP_TEXT),
        this.portMacsLoading ? new this.InfoValueProps_Loading(MAC_ON_PORT_TEXT) : this.macAddressForBindIsValid ? new this.InfoValueProps_Success(MAC_ON_PORT_TEXT) : new this.InfoValueProps_Warning(MAC_ON_PORT_TEXT),
        this.sessionsLoading ? new this.InfoValueProps_Loading(SESSION_BY_MAC_TEXT) : this.hasSomeActiveSession ? new this.InfoValueProps_Success(SESSION_BY_MAC_TEXT) : new this.InfoValueProps_Warning(SESSION_BY_MAC_TEXT),
      ]
    },
    sessionsInfo(){
      return this.sessions.map(({dbsessid, u_id, ip}) => {
        const is_xRAD = !!dbsessid;
        const isGuest = is_xRAD && !u_id;
        const label = `${isGuest ? 'Гостевая сессия' : 'Абонентская сессия'} ${ip || ''}`;
        if(is_xRAD){
          return new this.InfoValueProps_Success(label, 'tone-500');
        }else{
          return new this.InfoValueProps_Initial(label, 'tone-500');
        };
      });
    },
    
    macAddress(){return this.selectedMACAddress.replace(/[^0-9A-F]/gi,'').match(/.{2}/g)?.join(':')},
    macAddressIsValid(){return this.macAddress?.length == 17},
    
    macAddressForBind(){return this.selectedMACAddress.replace(/[^0-9A-FX]/gi,'').match(/.{2}/g)?.join(':')},//X - for priv NetworkScrt
    macAddressForBindIsValid(){return this.macAddressForBind?.length == 17},
    
    sessionsLoading(){return this.findSessionsByMACAddressLoads[this.macAddress]},
    sessions(){return this.findSessionsByMACAddressResps[this.macAddress] || []},
    hasSomeActiveSession(){return this.sessions.length},
    
    selectedServiceBasicBindParams(){
      if(!this.selectedServiceItem){return null};
      const {serverID, typeOfBindID} = this;
      const {serviceID, vg, resource} = this.selectedServiceItem;
      if(vg){
        return new SM.LbsvSelectedServiceBasicBindParams(serverID, typeOfBindID, serviceID, vg.login, vg.agentid);
      }else if(resource){
        return new SM.ForisSelectedServiceBasicBindParams(serverID, typeOfBindID, serviceID);
      };
      return null
    },
    deviceIPAddress(){return this.networkElement?.ip || ''},
    deviceName(){return this.networkElement?.name || ''},
    devicePortNumber(){return this.port?.number || 0},
    devicePortName(){return this.port?.snmp_name || ''},
    devicePortIndex(){return this.port?.snmp_number || 0},
    macItems(){
      return [...new Set([this.selectedMACAddress, ...this.macs])].filter(Boolean).map((mac, i) => new CHP.UISelectorInputItem(i, mac))
    },
    isLinkUp(){return this.portStatus?.IF_OPER_STATUS},
    bindResourcesDisabled(){return this.disabled || this.bindResourcesLoading},
    fields(){
      const {bindResourcesDisabled, bindResourcesLoading, selectedMACAddress, macItems, selectedIPAddress, portMacsLoading} = this;
      const bindResourcesLinkPortDisabled = bindResourcesDisabled || !this.isLinkUp || !this.hasSomeActiveSession;
      const inputMac = new SM.UISelectorInputMac(selectedMACAddress, macItems, bindResourcesDisabled, {
        input: (itemValue) => this.selectedMACAddress = itemValue
      },{
        postfix: new SM.ButtonGetMacs(portMacsLoading ? 'loading rotating' : 'sync', bindResourcesDisabled || portMacsLoading, {
          click: () => this.$emit('callParent', ['getPortMACAddressList'])
        })
      });
      return {
        [SM.BIND_TYPE_ID_3]: [
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT, bindResourcesDisabled, bindResourcesLoading, {
            click: () => this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_5]: [
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT, bindResourcesDisabled, bindResourcesLoading, {
            click: () => this.setBind(SM.BIND_TYPE_ID_3)
          }),
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_MAC, bindResourcesDisabled, bindResourcesLoading, {
            click: this.insOnlyMac
          }),
        ],
        [SM.BIND_TYPE_ID_6]: [
          new SM.InputIp(selectedIPAddress, bindResourcesDisabled, bindResourcesLoading, {
            input: (value) => this.selectedIPAddress = value.replace(/[\,]/g,'.').replace(/[^\d|\.]/g,'')
          }),
          new SM.ButtonSetBind(SM.TEXT_BIND_IP, bindResourcesDisabled, bindResourcesLoading, {
            click: () => this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_7]: [
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_REBIND_MAC, bindResourcesDisabled, bindResourcesLoading, {
            click: () => this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_9]: [
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_SOME, bindResourcesDisabled, bindResourcesLoading, {
            click: () => this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_10]: [
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT_MAC, bindResourcesDisabled, bindResourcesLoading, {
            click: () => this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_11]: [
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_SOME, bindResourcesLinkPortDisabled, bindResourcesLoading, {
            click: () => this.setBind()
          }),
        ]
      }[this.typeOfBindID] || [];
    },
    bindResourcesIsError(){
      return this.bindResourcesResult?.type === 'error';
    },
    bindResourcesErrorMessage(){
      if(!this.bindResourcesIsError){return};
      return SM.getBindResourcesErrorCustomMessage(this.typeOfBindID, this.bindResourcesResult?.text, this.selectedMACAddress);
    },
    bindResourcesIsSuccess(){
      const {bindResourcesResult} = this;
      return bindResourcesResult.code==200 || bindResourcesResult.InfoMessage || bindResourcesResult.Data;
    },
    bindResourcesInfoMessage(){
      const {bindResourcesResult} = this;
      return bindResourcesResult?.InfoMessage || 'успешно';
    },
  },
  methods:{
    async findSessionsByMACAddress(){
      const {macAddress, macAddressIsValid} = this;
      if(!macAddress || !macAddressIsValid){return};
      if(this.findSessionsByMACAddressLoads[macAddress]){return};
      this.$set(this.findSessionsByMACAddressLoads, macAddress, !0);
      this.$set(this.findSessionsByMACAddressResps, macAddress, null);
      try{
        const response = await AAAService.getXRadSessionByMac(this.serverID, macAddress);
        this.$set(this.findSessionsByMACAddressResps, macAddress, response?.data || null);
      }catch(error){
        console.warn(error);
      };
      this.$set(this.findSessionsByMACAddressLoads, macAddress, !1);
    },
    insMac(){
      this.serviceMixQuery('ins_mac', {
        ...this.selectedServiceBasicBindParams,
        ...filterKeys(this, {
          accountID: 'account',
          macAddressForBind: 'mac',
          devicePortNumber: 'port',
          deviceIPAddress: 'ip',
          deviceName: 'deviceName',
        })
      })
    },
    insOnlyMac(){
      this.serviceMixQuery('ins_only_mac', {
        ...this.selectedServiceBasicBindParams,
        ...filterKeys(this, {
          accountID: 'account',
          macAddressForBind: 'mac',
          devicePortNumber: 'port',
          deviceName: 'deviceName',
        })
      });
    },
    setBind(_typeOfBindID){
      const {typeOfBindID, selectedIPAddress, macAddressForBind} = this;
      this.serviceMixQuery('set_bind', {
        ...this.selectedServiceBasicBindParams,
        type_of_bind:_typeOfBindID || typeOfBindID,
        ...typeOfBindID == SM.BIND_TYPE_ID_6 && selectedIPAddress ? ({//not empty client_ip only
          client_ip: selectedIPAddress
        }) : null,
        ...SM.BIND_TYPES_MANDATORY_MAC.includes(typeOfBindID) ? ({
          mac: macAddressForBind
        }) : null,
        ...filterKeys(this, {
          accountID: 'account',
          deviceIPAddress: 'ip',
          devicePortNumber: 'port',
          deviceName: 'deviceName',
        })
      });
    },
    async serviceMixQuery(method, params){
      this.backup = null;
      if(params.mac && /x/i.test(String(params.mac))){//for priv NetworkScrt
        params.get_mac = new DNM.DevicePortParams(this.networkElement, this.port);
      };
      this.backup = {method, params};
      this.bindResourcesLoading = !0;
      this.bindResourcesResult = null;
      const path = `/call/service_mix/${method}`;
      try{
        const response = await CustomRequest.post(path, params);
        this.bindResourcesResult = response;
      }catch(error){
        console.warn(`${method}.error`, error);
        this.bindResourcesResult = {text: "Ошибка сервиса", type: "error"};
      };
      const {bindResourcesResult} = this;
      if(typeof bindResourcesResult?.Data == 'string'){
        const [ip, gw, sub] = bindResourcesResult.Data.split('|');
        if(ip || gw || sub){
          this.$set(this.bindResourcesResult, 'cfg', {'IP': ip, 'Шлюз': gw, 'Маска': sub});
        };
      };
      console.log({path, params})
      this.bindResourcesLoading = !1;
    },
    autoSelectMACAddress(){
      const {selectedMACAddress} = this;
      if(!selectedMACAddress){
        this.selectedMACAddress = this.macs[0] || selectedMACAddress;
      };
    },
  },
});
