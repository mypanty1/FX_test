
//fix accountNumber
const AxirosService2=new class AxirosService2 extends CallRequestService {
  constructor(){
    super('/axiros')
  }
  CPEByMACAddress = new this.ServiceMethod(this, 'CPEByMACAddress', {
    async useCache(mrID,mac){
      const mandatory=this.requestService.checkMandatoryParams({mrID,mac});
      const cacheKey=this.requestService.cacheKey(this,mandatory.mrID,mandatory.mac);
      try{
        const cache = localStorageCache.getItem(cacheKey);
        const response = cache || await this.requestService.get('cpe_registre', {
          mr: mandatory.mrID,
          mac: mandatory.mac
        });
        if(Array.isArray(response?.data)){
          response.data = response.data.map(cpe => Object.assign(cpe, {mac, mrID}));
          if(!cache){localStorageCache.setItem(cacheKey, response)};
          return response;
        }else{
          const _response = new this.requestService.ResponseSuccessFake([]);
          if(!cache){localStorageCache.setItem(cacheKey, _response)};
          return _response;
        };
      }catch(error){
        console.warn(this.requestService.apiKey(this),error);
      };
      return {isError:!0};
    },
  })
};

const createSubModuleDevicesSpeedTest_Device_Ports_Port = function(modulePath, _mrID = 0, _ifIndex = '', _port = null, _diag = null){
  return STORE.createSubModule(modulePath, {
    state: {
      _mrID: _mrID,
      _ifIndex: _ifIndex,
      _port: _port ? Object.freeze(_port) : null,
      _diag: _diag ? Object.freeze(_diag) : null,
      
      _portCPEsLoading: !1,
      _portCPEs: null,
      _portCPE: null,
      
      _onlineInfoLoading: !1,
      _onlineInfo: null,
      _onlineInfoError: null,
      
      _doCPESpeedTestLoadingAnimationDL: !1,
      _doCPESpeedTestLoadingAnimationUL: !1,
      _doCPESpeedTestLoading: !1,
      _doCPESpeedTestResult: null,
      _doCPESpeedTestError: null,
      
      _doCPERebootLoadingAnimation: !1,
      _doCPERebootLoading: !1,
      _doCPERebootResult: null,
      _doCPERebootError: null,
      
      CONST: {
        SpeedTest: Object.freeze({
          LOADER_HEIGHT: 10,
          LOADER_LINE_COLOR: '#dddddd',
          LOADER_FILL_COLOR: '#5642bd',
          LOADER_DL_MAX_TIME: +String(Date.now()).slice(7,13),
          LOADER_UL_MAX_TIME: +String(Date.now()).slice(7,13),
        }),
        Reboot: Object.freeze({
          LOADER_HEIGHT: 10,
          LOADER_LINE_COLOR: '#dddddd',
          LOADER_FILL_COLOR: '#5642bd',
          LOADER_MAX_TIME: +String(Date.now()).slice(7,13),
        }),
      },
      _noTest: !1,
    },
    getters: {
      port:(state) => state._port || null,
      diag: (state) => state._diag || null,
      
      ifIndex: (state) => state._port?.ifIndex || state._diag?.ifIndex || '',
      
      ifName: (state) => state._diag?.ifName || state._port?.ifName || '',
      ifAlias: (state) =>  state._diag?.ifAlias || state._port?.ifAlias || '',
      portNumber: (state) => state._port?.portNumber || '',
      portState: (state) => state._port?.portState || '',
      isTech: (state) => Boolean(state._port?.isTech),
      lastMac: (state) => state._port?.lastMac || '',
      
      accountNumber: (state) => state._port?.accountNumber || '',
      flatNumber: (state) => state._port?.flatNumber || '',
      mac: (state) => state._port?.subscriberMac || '',
      
      ifAdminStatus: (state) =>  state._diag?.ifAdminStatus || '',
      ifOperStatus: (state) =>  state._diag?.ifOperStatus || '',
      ifSpeed: (state) =>  state._diag?.ifSpeed || 0,
      linkUp: (state) => Boolean(state._diag?.linkUp),
      portOff: (state) => Boolean(state._diag?.portOff),
      
      portSpeedText: (state, getters) => !getters.linkUp ? '' : `${getters.ifSpeed} Мбит/с`,
      
      portCPEsLoading: (state) => state._portCPEsLoading,
      portCPEs: (state) => state._portCPEs,
      portCPE: (state) => state._portCPE,
      
      cpeID: (state) => state._onlineInfo?.cpeid || state._portCPE?.sn || '',
      
      onlineInfoLoading: (state) => state._onlineInfoLoading,
      onlineInfoExist: (state) => Boolean(state._onlineInfo?.uptime),
      onlineInfoError: (state) => state._onlineInfoError,
      
      authType: (state) => state._onlineInfo?.auth_type || '',
      
      vendor: (state) => state._onlineInfo?.vendor || '',
      model: (state, getters) => (!getters.onlineInfoExist ? state._portCPE?.model : state._onlineInfo?.model) || '',
      
      wanLinkUp: (state) => state._onlineInfo?.wan?.status == 'Up',
      wanSpeedText: (state, getters) => !getters.wanLinkUp ? '' : !state._onlineInfo?.wan?.rate ? 'Auto' : state._onlineInfo?.wan?.rate === 'Auto' ? state._onlineInfo?.wan?.rate : `${state._onlineInfo?.wan?.rate} Мбит/с`,
      
      CONST: (state) => state.CONST,
      
      speedTestLoaderID_DL: (state, getters) => atok('CPESpeedTest', state._mrID, getters.cpeID, 'DL'),
      speedTestLoaderID_UL: (state, getters) => atok('CPESpeedTest', state._mrID, getters.cpeID, 'UL'),
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
      doCPESpeedTestLoading: (state) => state._doCPESpeedTestLoading,
      doCPESpeedTestLoadingAnimationEnd: (state) => state._doCPESpeedTestLoading || state._doCPESpeedTestLoadingAnimationDL || state._doCPESpeedTestLoadingAnimationUL,
      
      rebootLoaderID: (state, getters) => atok('CPEReboot', state._mrID, getters.cpeID),
      doCPERebootResult: (state) => state._doCPERebootResult,
      doCPERebootError: (state) => state._doCPERebootError,
      doCPERebootLoading: (state) => state._doCPERebootLoading,
      doCPERebootLoadingAnimationEnd: (state) => state._doCPERebootLoading || state._doCPESpeedTestLoadingAnimation,
      
      loadingSome: (state, getters) => [
        state._portCPEsLoading,
        state._onlineInfoLoading,
        state._doCPESpeedTestLoading,
        state._doCPERebootLoading,
      ].some(Boolean),
      
      noTest: (state, getters) => state._noTest || !getters.linkUp || !getters.mac || getters.isTech,
      readyForTest: (state, getters) => !state._noTest && getters.onlineInfoExist,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      _noTestThisPort({state, getters, commit, dispatch}){
        commit('_setStateProp', {_noTest: !0});
      },
      setPort({commit, getters, dispatch}, _port = null){
        commit('_setStateProp', {_port});
        if(!getters.mac){
          dispatch('_noTestThisPort');
          return;
        };
        if(!getters.portCPEs && !getters.portCPEsLoading){
          dispatch('_getPortCPEs');
        };
      },
      setDiag({commit, getters, dispatch}, _diag = null){
        commit('_setStateProp', {_diag});
        if(!getters.linkUp || !getters.mac){
          dispatch('_noTestThisPort');
          return;
        };
        if(!getters.portCPEs && !getters.portCPEsLoading){
          dispatch('_getPortCPEs');
        };
      },
      async _getPortCPEs({state, getters, commit, dispatch}){
        commit('_setStateProp', {_portCPEsLoading: !0});
        try{
          const response = await AxirosService2.CPEByMACAddress.useCache(state._mrID, getters.mac);
          if(Array.isArray(response?.data)){
            commit('_setStateProp', {_portCPEs: response.data});
            commit('_setStateProp', {_portCPE: response.data[response.data.length - 1]});
            if(getters.cpeID){
              dispatch('_getOnlineInfo');
            }else{
              dispatch('_noTestThisPort');
            }
          }else{
            commit('_setStateProp', {_portCPEs: []});
            dispatch('_noTestThisPort');
          };
        }catch(error){
          console.warn(error);
          dispatch('_noTestThisPort');
        };
        commit('_setStateProp', {_portCPEsLoading: !1});
      },
      async _getOnlineInfo({state, getters, commit, dispatch}){
        commit('_setStateProp', {_onlineInfoLoading: !0});
        try{
          //const response = await AxirosService.getCPEInfo(state._mrID, getters.cpeID);
          //getOnlineInfo.error ReferenceError: account is not defined
          //  at AxirosService.getCPEInfo (ptvtb-7ecff7a2cdf5523d347e7a8cf324f45df55d4f5e46510cd66200ac3ef375119f.js:2651:85)
          const response = await AxirosService.get('cpe_info',{mr:state._mrID,cpeid: getters.cpeID})
          if(response?.data?.cpeid){
            commit('_setStateProp', {_onlineInfo: response.data});
            if(getters.onlineInfoExist){
              dispatch('initLoaders');
            }else{
              dispatch('_noTestThisPort');
            };
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_onlineInfoError: [
              response?.message,
              response?.text
            ]});
            dispatch('_noTestThisPort');
          }else{
            commit('_setStatePropr', {_onlineInfoError: [
              'unknown error'
            ]});
            dispatch('_noTestThisPort');
          };
        }catch(error){
          console.warn('getOnlineInfo.error', error);
          commit('_setStateProp', {_onlineInfoError: [
            'unexpected error'
          ]});
          dispatch('_noTestThisPort');
        };
        commit('_setStateProp', {_onlineInfoLoading: !1});
      },
      initLoaders({state, getters, dispatch}){
        dispatch('UILinearProgressLoader/init', [getters.speedTestLoaderID_DL, state.CONST.SpeedTest.LOADER_DL_MAX_TIME], STORE.R00T);
        dispatch('UILinearProgressLoader/init', [getters.speedTestLoaderID_UL, state.CONST.SpeedTest.LOADER_UL_MAX_TIME], STORE.R00T);
        dispatch('UILinearProgressLoader/init', [getters.rebootLoaderID, state.CONST.Reboot.LOADER_MAX_TIME], STORE.R00T);
      },
      async doCPESpeedTest({state, getters, commit, dispatch}){
        commit('_setStateProp', {_doCPESpeedTestResult: null});
        commit('_setStateProp', {_doCPESpeedTestError: null});
        commit('_setStateProp', {_doCPESpeedTestLoading: !0});
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationDL: !0});
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationUL: !0});
        const {speedTestLoaderID_DL, speedTestLoaderID_UL} = getters;
        dispatch('UILinearProgressLoader/start', speedTestLoaderID_DL, STORE.R00T);
        dispatch('UILinearProgressLoader/start', speedTestLoaderID_UL, STORE.R00T);
        try{
          //await new Promise(r=>setTimeout(r,66666));
          const response = await AxirosService.doCPESpeedTest(state._mrID, getters.cpeID);
          if(response?.data){
            commit('_setStateProp', {_doCPESpeedTestResult: response.data});
            dispatch('UILinearProgressLoader/done', speedTestLoaderID_DL, STORE.R00T);
            dispatch('UILinearProgressLoader/done', speedTestLoaderID_UL, STORE.R00T);
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_doCPESpeedTestError: [
              response?.message || 'Error',
              response?.text
            ]});
            dispatch('UILinearProgressLoader/abort', speedTestLoaderID_DL, STORE.R00T);
            dispatch('UILinearProgressLoader/abort', speedTestLoaderID_UL, STORE.R00T);
          }else{
            commit('_setStateProp', {_doCPESpeedTestError: [
              'unknown error'
            ]});
            dispatch('UILinearProgressLoader/abort', speedTestLoaderID_DL, STORE.R00T);
            dispatch('UILinearProgressLoader/abort', speedTestLoaderID_UL, STORE.R00T);
          };
          dispatch('main/report',['DeviceLoadTest/doCPESpeedTest',{
            params: {
              mrID: state._mrID,
              cpeID: getters.cpeID
            },
            response,
          }],STORE.R00T);
        }catch(error){
          console.warn('doCPESpeedTest.error', error)
          commit('_setStateProp', {_doCPESpeedTestError: [
            'Error: Unexpected'
          ]});
          dispatch('UILinearProgressLoader/abort', speedTestLoaderID_DL, STORE.R00T);
          dispatch('UILinearProgressLoader/abort', speedTestLoaderID_UL, STORE.R00T);
        };
        commit('_setStateProp', {_doCPESpeedTestLoading: !1});
      },
      onCPESpeedTestAnimationEndDL({commit}){
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationDL: !1});
      },
      onCPESpeedTestAnimationEndUL({commit}){
        commit('_setStateProp', {_doCPESpeedTestLoadingAnimationUL: !1});
      },
      async doCPEReboot({state, getters, commit, dispatch}){
        commit('_setStateProp', {_doCPERebootResult: null});
        commit('_setStateProp', {_doCPERebootError: null});
        commit('_setStateProp', {_doCPERebootLoading: !0});
        commit('_setStateProp', {_doCPERebootLoadingAnimation: !0});
        const {rebootLoaderID} = getters;
        dispatch('UILinearProgressLoader/start', rebootLoaderID, STORE.R00T);
        try{
          const response = await AxirosService.doCPEReboot(state._mrID, getters.cpeID);
          if(response?.data){
            commit('_setStateProp', {_doCPERebootResult: response.data});
            dispatch('UILinearProgressLoader/done', rebootLoaderID, STORE.R00T);
          }else if(response?.message || response?.text){
            commit('_setStateProp', {_doCPERebootError: [
              response?.message || 'Error',
              response?.text
            ]});
            dispatch('UILinearProgressLoader/abort', rebootLoaderID, STORE.R00T);
          }else{
            commit('_setStateProp', {_doCPERebootError: [
              'unknown error'
            ]});
            dispatch('UILinearProgressLoader/abort', rebootLoaderID, STORE.R00T);
          };
          /*dispatch('main/report',['DeviceLoadTest/Reboot',{
            params: {
              mrID: state._mrID,
              cpeID: getters.cpeID
            },
            response,
          }],STORE.R00T);*/
        }catch(error){
          console.warn('doCPEReboot.error', error)
          commit('_setStateProp', {_doCPERebootError: [
            'Error: Unexpected'
          ]});
          dispatch('UILinearProgressLoader/abort', rebootLoaderID, STORE.R00T);
        };
        commit('_setStateProp', {_doCPERebootLoading: !1});
      },
      onCPERebootAnimationEnd({commit}){
        commit('_setStateProp', {_doCPERebootLoadingAnimation: !1});
      },
    }
  });
};

const createSubModuleDevicesSpeedTest_Device_Ports = function(modulePath, _mrID = 0){
  return STORE.createSubModule(modulePath, {
    state: {
      _mrID: _mrID,
    },
    getters: {
      loadingSome: (state, getters) => getters['$subModulesKeys'].map((ifIndex) => {
        const loadingSome = getters[atop(ifIndex, 'loadingSome')];
        return loadingSome;
      }).some(Boolean),
      portCPEsLoadingSome: (state, getters) => getters['$subModulesKeys'].map((ifIndex) => {
        const portCPEsLoading = getters[atop(ifIndex, 'portCPEsLoading')];
        return portCPEsLoading;
      }).some(Boolean),
      onlineInfoLoadingSome: (state, getters) => getters['$subModulesKeys'].map((ifIndex) => {
        const onlineInfoLoading = getters[atop(ifIndex, 'onlineInfoLoading')];
        return onlineInfoLoading;
      }).some(Boolean),
      onlineInfoExistSome: (state, getters) => getters['$subModulesKeys'].map((ifIndex) => {
        const onlineInfoExist = getters[atop(ifIndex, 'onlineInfoExist')];
        return onlineInfoExist;
      }).some(Boolean),
      doCPESpeedTestLoadingSome: (state, getters) => getters['$subModulesKeys'].map((ifIndex) => {
        const doCPESpeedTestLoading = getters[atop(ifIndex, 'doCPESpeedTestLoading')];
        return doCPESpeedTestLoading;
      }).some(Boolean),
      existCPEsPortsIDs: (state, getters) => getters['$subModulesKeys'].filter((ifIndex) => {
        const portCPE = getters[atop(ifIndex, 'portCPE')];
        return portCPE;
      }),
      onlineCPEsPortsIDs: (state, getters) => getters['$subModulesKeys'].filter((ifIndex) => {
        const readyForTest = getters[atop(ifIndex, 'readyForTest')];
        return readyForTest;
      }),
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      doCPEsSpeedTest({getters, dispatch, rootGetters}){
        if(!(rootGetters.userLogin == 'mypanty1')){return};
        for(const ifIndex of getters.onlineCPEsPortsIDs){
          dispatch(atop(ifIndex,'doCPESpeedTest'));
        };
      },
      setPorts({state, getters, dispatch}, _ports = []){
        for(const _port of _ports){
          const ifIndex = String(_port.snmp_number);
          const _subscriber = _port.subscriber_list[0];
          function formatMac(_mac){
            const mac = _mac?.match(/[0-9a-f]/gi)?.join('');
            return mac?.length != 12 ? '' : mac.toLowerCase().match(/.{2}/gi).join(':')
          };
          const port = {
            ifIndex,
            ifName: _port.snmp_name,
            ifAlias: _port.snmp_description,
            portNumber: String(_port.number),
            portState: _port.state,
            isTech: _port.is_trunk || _port.is_link,
            lastMac: formatMac(_port.last_mac?.value),
            accountNumber: !_subscriber ? '' : SIEBEL.toAgreementNum(_subscriber.account),
            flatNumber: !_subscriber ? '' : String(_subscriber.flat || 0),
            subscriberMac: !_subscriber ? '' : formatMac(_subscriber.mac),            
          };
          if(getters.$subModulesKeys.includes(ifIndex)){
            dispatch(atop(ifIndex,'setPort'), port);
          }else{
            dispatch('$addSubModule', createSubModuleDevicesSpeedTest_Device_Ports_Port([state.$modulePath, ifIndex], state._mrID, ifIndex, port, null));
          };
        };
      },
      setPortsDiag({state, getters, dispatch}, _ports = []){
        for(const _diag of _ports){
          const ifIndex = String(_diag.index_iface);
          const portOff = _diag.admin_state != 'up';
          const linkUp = _diag.oper_state == 'up';
          const diag = Object.freeze({
            ifIndex,
            ifName: '',
            ifAlias: '',
            ifAdminStatus: _diag.admin_state,
            ifOperStatus: _diag.oper_state,
            ifSpeed: linkUp ? parseInt(_diag.high_speed) : 0,
            linkUp,
            portOff,
          });
          if(getters.$subModulesKeys.includes(ifIndex)){
            dispatch(atop(ifIndex,'setDiag'), diag);
          }else{
            dispatch('$addSubModule', createSubModuleDevicesSpeedTest_Device_Ports_Port([state.$modulePath, ifIndex], state._mrID, ifIndex, null, diag));
          };
        };
      },
    }
  });
};

const createSubModuleDevicesSpeedTest_Device = function(modulePath, _deviceName = '', _device = null){
  return STORE.createSubModule(modulePath, {
    state: {
      _deviceName: _deviceName,
      _deviceLoading: !1,
      _deviceError: _device ? null : ['Error: no_device'],
      _device: _device ? Object.freeze(_device) : null,
      
      _portsLoading: !1,
      _portsError: null,
      _portsDiagLoading: !1,
      _portsDiagError: null,
    },
    getters: {
      deviceName: (state) => state._deviceName,
      deviceLoading: (state) => state._deviceLoading,
      deviceError: (state) => state._deviceError,
      device: (state) => state._device,
      isETH: (state) => NIOSS.neIsETH(state._device?.name),
      mrID: (state) => state._device?.region?.mr_id || 0,
      
      portsLoading: (state) => state._portsLoading,
      portsError: (state) => state._portsError,
      portsDiagLoading: (state) => state._portsDiagLoading,
      portsDiagError: (state) => state._portsDiagError,
      
      loadingSome: (state, getters) => [
        state._deviceLoading,
        state._portsLoading,
        state._portsDiagLoading,
        getters['Ports/loadingSome'],
      ].some(Boolean),
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, getters, dispatch}){
        if(!getters.device){
          await dispatch('_getDevice');
        };
        if(!getters.device){
          return;
        };
        if(getters.isETH){
          dispatch('$addSubModule', createSubModuleDevicesSpeedTest_Device_Ports([state.$modulePath, 'Ports'], getters.mrID));
          await Promise.allSettled([
            dispatch('_getDevicePorts'),
            //dispatch('_getDevicePortsDiag'),
          ]);
          await Promise.allSettled([
            //dispatch('_getDevicePorts'),
            dispatch('_getDevicePortsDiag'),
          ]);
        };
      },
      async _getDevice({getters, commit}){
        commit('_setStateProp', {_deviceLoading: !0});
        try{
          const response = await DeviceService.DevicesByName.useCache(getters.deviceName,DeviceService.transliterate);
          if(response?.data?.[0]){
            commit('_setStateProp', {_device: response.data[0]});
          }else{
            commit('_setStateProp', {_deviceError: [
              'Error: not_found'
            ]});
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_deviceError: [
            'Error: unexpected'
          ]});
        };
        commit('_setStateProp', {_deviceLoading: !1});
      },
      async _getDevicePorts({getters, commit, dispatch}){
        commit('_setStateProp', {_portsLoading: !0});
        try{
          const addSubscribers = !0;
          const response = await DeviceServiceOLD.DevicePorts.useCache(getters.deviceName, addSubscribers);
          if(Array.isArray(response?.data)){
            dispatch('Ports/setPorts', response.data);
          }else{
            commit('_setStateProp', {_portsError: [
              response?.message || 'Error: dpl',
              response?.text
            ]});
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_portsError: [
            'Error: unexpected'
          ]});
        };
        commit('_setStateProp', {_portsLoading: !1});
      },
      async _getDevicePortsDiag({getters, commit, dispatch}){
        commit('_setStateProp', {_portsDiagLoading: !0});
        try{
          const response = await HDMService.getDevicePortsDiag(getters.deviceName);
          const ports = response?.data?.[getters.deviceName]?.ports;
          const message = response?.data?.[getters.deviceName]?.message;
          if(Array.isArray(ports)){
            dispatch('Ports/setPortsDiag', ports);
          }else{
            commit('_setStateProp', {_portsDiagError: [
              message || 'Error: port_statuses'
            ]});
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_portsDiagError: [
            'Error: unexpected'
          ]});
        };
        commit('_setStateProp',{_portsDiagLoading: !1});
      },
    }
  });
};

STORE.createSubModule('DeviceLoadTesting', {
  state: {
    _currentDeviceName: '',
  },
  getters: {
    currentDeviceName: (state) => state._currentDeviceName,
  },
  mutations: {
    _setStateProp: STORE.mutations.setStateProp,
  },
  actions: {
    addDevice({state, getters, commit, dispatch}, [_deviceName = '', _device = null] = []){
      commit('_setStateProp', {_currentDeviceName: _deviceName});
      if(_deviceName){
        dispatch('$addSubModule', createSubModuleDevicesSpeedTest_Device([state.$modulePath, _deviceName], _deviceName, _device));
      };
    },
  }
}).register();

if(!0 || store.getters.userLogin == 'mypanty1'){
  Vue.component('NetworkElementActions',{
    template:`<div class="display-contents">
      <NetworkElementActions2 v-bind="$props" v-on="$listeners"/>
    </div>`,
    props:{
      discovery:{type:Object},
      loading:{type:Object},
      networkElement:{type:Object,default:null}
    },
  });
};
Vue.component('NetworkElementActions2',{
  beforeCreate(){
    this.$mapOptions({
      TEXT_PING: `Пинг до устройства от терминального сервера Inetcore установленного в ЦОДе макрорегиона`,
      TEXT_DSCV: `Опрос устройства может занять от 1 до 30 сек. В результате опроса будет обновлена модель устройства(в случаем замены), обновлены статусы портов(свободен/занят/квартира), дескрипшены на портах а также размещение абонентов по портам`,
      TEXT_BIND: `Перепривязка всех абонентов на корректные порты в биллинге по соответствию мак-порт после перекоммутации/замены. Для повышения точности привязки желательно актуализировать маки на портах во вкладке [Опросить устройство] незадолго до перед тем как`,
      TEXT_TEST: `Нагрузочное тестирование аплинка коммутатора с помощью теста скорости со всех доступных CPE под коммутатором`,
    });
    this.$mapDynamicNamespaceGetters('DeviceLoadTesting/:currentDeviceName/Ports', [
      'onlineInfoExistSome',
    ]);
  },
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="in-work" text="Действия" :attention="discovery.type==='error'?'error':''" class="padding-unset margin-top-bottom--8px---">
        <button-sq :icon="open ? 'down' : 'up'" type="large" @click="open = !open"/>
      </title-main>
    </div>
    
    <div v-show="open && networkElement?.ip" class="display-contents">
      <div class="divider-line"/>
      
      <div class="padding-left-12px">
        <link-block icon="campaign" text="Доступность оборудования" actionIcon="info" @click="$set(show,'ping',!show.ping)" class="padding-unset"/>
      </div>
      <div class="padding-left-right-12px display-flex flex-direction-column gap-8px">
        <info-text-icon v-if="show.ping" icon="info" :text="TEXT_PING" class="padding-unset"/>
        <device-ping :device="networkElement"/>
      </div>
      
      <div class="divider-line"/>
      
      <div class="padding-left-12px">
        <link-block icon="campaign" text="Опросить устройство" actionIcon="info" @click="$set(show,'discovery',!show.discovery)" class="padding-unset"/>
      </div>
      <div class="padding-left-right-12px display-flex flex-direction-column gap-8px">
        <info-text-icon v-if="show.discovery" icon="info" :text="TEXT_DSCV" class="padding-unset"/>
        <button-main @click="$emit('get:discovery')" label="Опросить" :loading="loading.discovery" :disabled="loading.discovery" buttonStyle="outlined" size="full"/>
        <message-el v-if="!loading.discovery" :text="discovery.text" :type="discovery.type" :subText="discovery.error" box/>
      </div>
      
      <template v-if="isETH">
        <div class="divider-line"/>
        
        <div class="padding-left-12px">
          <link-block icon="repeat" text="Привязка всех абонентов" actionIcon="info" @click="$set(show,'binds',!show.binds)" class="padding-unset"/>
        </div>
        <div class="padding-left-right-12px display-flex flex-direction-column gap-8px">
          <info-text-icon v-if="show.binds" icon="info" :text="TEXT_BIND" class="padding-unset"/>
          <FixAbonsPorts :networkElement="networkElement"/>
        </div>
        
        <div class="divider-line"/>
        
        <div class="padding-left-12px">
          <link-block icon="exchange" text="SpeedTest" actionIcon="info" @click="$set(show,'test',!show.test)" class="padding-unset"/>
        </div>
        <div class="padding-left-right-12px display-flex flex-direction-column gap-8px">
          <info-text-icon v-if="show.test" icon="info" :text="TEXT_TEST" class="padding-unset"/>
          <DeviceLoadTest :deviceName="networkElement.name" :networkElement="networkElement"/>
        </div>
        <template v-if="currentDeviceName ==  networkElement.name && onlineInfoExistSome">
          <div class="display-flex flex-direction-column gap-8px">
            <div class="divider-line"/>
            
            <div class="padding-left-right-12px">
              <DeviceLoadTestStart/>
            </div>
          </div>
        </template>
        
      </template>
    </div>
  </div>`,
  props:{
    discovery:{type:Object},
    loading:{type:Object},
    networkElement:{type:Object,default:null}
  },
  data:()=>({
    open: !0,
    show:{},
  }),
  computed: {
    isETH(){return /^eth/i.test(this.networkElement?.name||'')},
    ...mapGetters('DeviceLoadTesting',[
      'currentDeviceName',
    ]),
  },
  methods: {},
});

Vue.component('DeviceLoadTestErrorMessage', {
  template:`<div class="display-flex flex-direction-column gap-8px">
    <message-el :text="userText" :subText="error?.[0] || ''" type="warn" box/>
    <div v-if="error?.[1]" class="font--12-400 tone-500">{{error?.[1]}}</div>
  </div>`,
  props: {
    userText: {type: String, default: 'Error'},
    error: {type: Array, default: () => []},
  }
});

Vue.component('DeviceLoadTestStart',{
  beforeCreate(){
    this.$mapDynamicNamespaceGetters('DeviceLoadTesting/:currentDeviceName', [
      'loadingSome',
    ]);
    this.$mapDynamicNamespace('DeviceLoadTesting/:currentDeviceName/Ports', {
      getters: [
        'doCPESpeedTestLoadingSome',
        'onlineInfoExistSome',
      ],
      actions: [
        'doCPEsSpeedTest'
      ],
    });
  },
  template:`<div class="display-contents">
    <button-main label="Начать тест" @click="doCPEsSpeedTest" :disabled="loadingSome || !onlineInfoExistSome" :loading="doCPESpeedTestLoadingSome" buttonStyle="contained" size="full"/>
  </div>`,
  computed: mapGetters('DeviceLoadTesting',[
    'currentDeviceName',
  ]),
});

Vue.component('DeviceLoadTest',{
  beforeCreate(){
    this.$mapDynamicNamespaceGetters('DeviceLoadTesting/:currentDeviceName', [
      'loadingSome',
      'deviceLoading',
      'deviceError',
      'device',
      'portsError',
      'portsLoading',
      'portsDiagError',
      'portsDiagLoading',
    ]);
    this.$mapDynamicNamespaceGetters('DeviceLoadTesting/:currentDeviceName/Ports', [
      'portCPEsLoadingSome',
      'onlineInfoLoadingSome',
      'onlineInfoExistSome',
      'doCPESpeedTestLoadingSome',
      'onlineCPEsPortsIDs',
    ]);
  },
  template:`<div class="white-block-100 display-flex flex-direction-column gap-8px">
    <template v-if="currentDeviceName !== deviceName">
      <button-main label="Найти рабочие CPE" @click="addDevice([deviceName, networkElement])" buttonStyle="outlined" size="full"/>
    </template>
    <template v-else>
      <loader-bootstrap v-if="deviceLoading" text="поиск коммутатора"/>
      <DeviceLoadTestErrorMessage v-else-if="deviceError" userText="Нет данных по коммутатору" :error="deviceError"/>
      
      <loader-bootstrap v-if="portsLoading" text="получение портов"/>
      <DeviceLoadTestErrorMessage v-else-if="portsError" userText="Нет данных по портам" :error="portsError"/>
      
      <transition-group name="slide-page" tag="div" transition-group class="display-flex flex-direction-column gap-8px">
        <template v-for="(ifIndex, index) of onlineCPEsPortsIDs">
          <DeviceLoadTestCPE :key="ifIndex" v-bind="{ifIndex}"/>
        </template>
      </transition-group>
      
      <loader-bootstrap v-if="portsDiagLoading || portCPEsLoadingSome || onlineInfoLoadingSome" text="поиск рабочих CPE"/>
      
      <message-el v-if="!loadingSome && !onlineInfoExistSome" text="Нет доступных CPE" type="info" box/>
      
      <DeviceLoadTestErrorMessage v-if="portsDiagError" userText="Нет данных по линкам" :error="portsDiagError"/>
    </template>
  </div>`,
  props:{
    deviceName: {type: String, default: '', required: !0},
    networkElement: {type: Object, default: null},
  },
  computed: mapGetters('DeviceLoadTesting',[
    'currentDeviceName',
  ]),
  methods: mapActions('DeviceLoadTesting',[
    'addDevice',
  ]),
});

Vue.component('DeviceLoadTestCPE',{
  beforeCreate(){
    this.$mapDynamicNamespaceGetters('DeviceLoadTesting/:currentDeviceName', [
      'portsLoading',
      'portsDiagLoading',
    ]);
    this.$mapDynamicNamespace('DeviceLoadTesting/:currentDeviceName/Ports/:ifIndex', {
      getters: [
        'ifName',
        'ifAlias',
        'portNumber',
        'accountNumber',
        'flatNumber',
        'mac',
        'portSpeedText',
        'linkUp',
        'cpeID',
        'vendor',
        'model',
        'onlineInfoLoading',
        'onlineInfoError',
        'onlineInfoExist',
        
        'authType',
        'wanLinkUp',
        'wanSpeedText',
        
        'CONST',
        
        'speedTestLoaderID_DL',
        'speedTestLoaderID_UL',
        'doCPESpeedTestResult',
        'doCPESpeedTestError',
        'speedTestDLState',
        'speedTestDLSpeed',
        'speedTestULState',
        'speedTestULSpeed',
        'doCPESpeedTestLoading',
        'doCPESpeedTestLoadingAnimationEnd',
      ],
      actions: [
        'onCPESpeedTestAnimationEndDL',
        'onCPESpeedTestAnimationEndUL',
      ]
    });
  },
  template: `<div class="display-flex flex-direction-column gap-8px border-1px-solid-c8c7c7 border-radius-4px padding-4px">
    <div class="display-flex flex-direction-column">
      <div class="font--13-500 text-align-center">{{vendor}} {{model}}</div>
      
      <div class="divider-line"/>
      
      <div class="display-flex align-items-center justify-content-space-between gap-8px">
        <div class="display-flex flex-direction-column">
          <div class="font--13-500">Порт ETH</div>
          <div class="display-flex align-items-center gap-4px">
            <IcIcon :name="(portsLoading || portsDiagLoading) ? 'loading rotating tone-500' : linkUp ? 'status main-green' : 'status tone-500'" size="20"/>
            <div v-if="linkUp" class="font--13-500 tone-500">{{portSpeedText}}</div>
          </div>
        </div>
        
        <div class="display-flex flex-direction-column">
          <div class="font--13-500 text-align-right">Порт WAN</div>
          <div class="display-flex align-items-center gap-4px flex-direction-row-reverse">
            <IcIcon :name="onlineInfoLoading ? 'loading rotating tone-500' : wanLinkUp ? 'status main-green' : 'status tone-500'" size="20"/>
            <div v-if="wanLinkUp" class="font--13-500 tone-500">{{wanSpeedText}}</div>
          </div>
        </div>
      </div>
    </div>
    
    <loader-bootstrap v-if="onlineInfoLoading" text="получение данных с CPE"/>
    <DeviceLoadTestErrorMessage v-else-if="onlineInfoError" userText="Ошибка связи с CPE" :error="onlineInfoError"/>
    
    <div class="width-100-100" v-else-if="onlineInfoExist && (doCPESpeedTestLoadingAnimationEnd || doCPESpeedTestError || doCPESpeedTestResult)">
      <div class="divider-line"/>
      <div v-if="doCPESpeedTestLoadingAnimationEnd || doCPESpeedTestError" class="display-flex flex-direction-column">
        <UILinearProgressLoader v-bind="{
          loaderID: speedTestLoaderID_DL,
          maxTime: CONST.SpeedTest.LOADER_DL_MAX_TIME,
          lineColor: CONST.SpeedTest.LOADER_LINE_COLOR,
          fillColor: CONST.SpeedTest.LOADER_FILL_COLOR,
          height: CONST.SpeedTest.LOADER_HEIGHT,
        }" v-on="{
          onMinEnd: () => onCPESpeedTestAnimationEndDL(),
          onMaxEnd: () => onCPESpeedTestAnimationEndDL(),
        }" rounded showPercent>
          <div slot="prefix" class="font--13-500 tone-500">DL:</div>
        </UILinearProgressLoader>
        
        <UILinearProgressLoader v-bind="{
          loaderID: speedTestLoaderID_UL,
          maxTime: CONST.SpeedTest.LOADER_UL_MAX_TIME,
          lineColor: CONST.SpeedTest.LOADER_LINE_COLOR,
          fillColor: CONST.SpeedTest.LOADER_FILL_COLOR,
          height: CONST.SpeedTest.LOADER_HEIGHT,
        }" v-on="{
          onMinEnd: () => onCPESpeedTestAnimationEndUL(),
          onMaxEnd: () => onCPESpeedTestAnimationEndUL(),
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
    
    <DeviceLoadTestErrorMessage v-if="doCPESpeedTestError" userText="Ошибка связи с CPE" :error="doCPESpeedTestError"/>
  </div>`,
  props:{
    ifIndex: {type: [String, Number], default: '', required: !0},
  },
  mounted(){
    if(!this.doCPESpeedTestLoading && this.doCPESpeedTestLoadingAnimationEnd){
      this.onCPESpeedTestAnimationEndDL();
      this.onCPESpeedTestAnimationEndUL();
    };
  },
  computed: mapGetters('DeviceLoadTesting',[
    'currentDeviceName',
  ]),
});













