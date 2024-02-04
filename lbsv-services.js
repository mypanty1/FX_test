Vue.component("lbsv-services",{
  template:`<div name="lbsv-services">
    <CardBlock v-for="(group, key) in groupServiceList" :key="key" class="mini-card margin-top-0">
      <ServicesTypeHeader @open="opened[key] = !opened[key]" :open="opened[key]" :type="key" />
      <div v-show="opened[key]">
        <CardBlock v-if="key==='internet'">
          <traffic-light-ma v-if="account&&!accountAccessPortLoading&&accountAccessPort&&!isGpon"
            billing-type="lbsv"
            v-bind="{ 
              lbsvAccount:account,
              accountDevice:accountAccessPort,
              accountId,
              equipments:group.equipments,
              isB2b,
              isTooManyInternetServices,
            }"
            @update:online-session="refreshOnlineSessions"
          />
          <template v-if="accountAccessPort">
            <template v-if="isGpon">
              <title-main text="Порт OLT" @open="show.serveOltPort=!show.serveOltPort">
                <button-sq v-if="deviceETHLoading" icon="loading rotating"/>
              </title-main>
              <device-info v-if="deviceETH&&show.serveOltPort" :networkElement="deviceETH" :ports="[accessPort]" hideEntrances showLocation addBorder autoSysInfo class="margin-left-right-8px"/>
              
              <title-main text="Абонентский ONT" @open="show.abonOnt=!show.abonOnt">
                <button-sq v-if="portONTsLoading" icon="loading rotating"/>
              </title-main>
              <OntInfo v-if="abonOnt&&show.abonOnt&&!portONTsLoading" :ont="abonOnt" :port="accessPort" class="margin-left-right-8px"/>
              <message-el v-if="!portONTsLoading&&!abonOnt" text="терминал абонента не найден" type="warn" box/>
            </template>

            <template v-else>
              <title-main text="Порт подключения">
                <button-sq v-if="deviceETHLoading" icon="loading rotating"/>
              </title-main>
              <device-info v-if="deviceETH" :networkElement="deviceETH" :ports="[isB2b?port:accessPort]" hideEntrances showLocation addBorder autoSysInfo class="margin-left-right-8px"/>
            </template>
            
          </template>
        </CardBlock>
        
        <CardBlock v-else-if="key=='digittv'">
          <template v-if="accountAccessDevice">
            <title-main text="Источник ТВ сигнала">
              <button-sq v-if="deviceOPLoading" icon="loading rotating"/>
            </title-main>
            <device-info v-if="deviceOP" :networkElement="deviceOP" hideEntrances showLocation addBorder autoSysInfo class="margin-left-right-8px"/>
          </template>
        </CardBlock>

        <sessions v-if="key=='internet'" billing-type="lbsv" :lbsv-services="group.services" ref="sessions" :isTooManyInternetServices="isTooManyInternetServices" :account="accountIdAgreement"/>
        
        <CardBlock class="margin-top-8px">
          <title-main text="Услуги и оборудование"/>
          <template v-for="(service,i) of group.services">
            <devider-line v-if="i"/>
            <LbsvService :key="i" :service="service" :account="account" :mr_id="mr_id" :accountNumber="accountId" :isB2b="isB2b" :isTooManyInternetServices="isTooManyInternetServices"/>
          </template>
        </CardBlock>

        <!--оборудование которое не смапилось с услугой в lbsv-account-content-->
        <equipment v-for="(equipment,i) of group.equipments" :key="i" :equipment="equipment" :mr_id="mr_id" :account="accountIdAgreement" :services="group.services"/>
      </div>
    </CardBlock>
  </div>`,
  props:{
    account:{type:Object,required:true},
    mr_id:{type:Number},
    accountAccessPort:{type:Object,default:null},
    groupServiceList:{type:Object,required:true},
    accountId:{type:String,default:''},
    accountAccessPortLoading:{type:Boolean,default:false},
  },
  data:()=>({
    opened:{
      internet: true,
      analogtv: true,
      digittv:  true,
      iptv:     true,
      phone:    true,
      hybrid:   true,
      other:    true,
    },
    show:{
      serveOltPort:true,
      abonOnt:true,
    },
    portONTs:[],
    portONTsLoading:!1,
    deviceETH:null,
    deviceETHLoading:!1,
    port: null,
    accountAccessDevice: null,
    deviceOP: null,
    deviceOPLoading:!1,
  }),
  created(){
    this.init()
  },
  watch:{
    'accountAccessPort'(accountAccessPort){
      if(!accountAccessPort){return};
      this.init()
    },
    'groupServiceList'() {
      if (!this.isB2b) return;
      this.loadDevicePort();
    }
  },
  computed:{
    isB2b(){ // FIXME временное решение для b2b клиентов
      return this.account.type==1;
    },
    isTooManyInternetServices(){
      return this.groupServiceList?.internet?.services?.length>2;
    },
    accountIdAgreement(){
      const parseAccount = (account) => String(account).replace(/-/g, "");
      const agreement = this.account.agreements.find((a) => parseAccount(a.account) == parseAccount(this.accountId));
      return agreement && agreement.account ? agreement.account : this.accountId
    },
    isGpon(){
      if(!this.accountAccessPort?.port){return};
      return this.accountAccessPort.port?.name.startsWith('PORT-OLT');
    },
    accessPort(){
      if(!this.accountAccessPort?.port){return}
      return {
        device_name:this.accountAccessPort.port.device_name,
        port_name:this.accountAccessPort.port.name,
        if_index:this.accountAccessPort.port.snmp_number,
        if_name:this.accountAccessPort.port.snmp_name,
        if_alias:this.accountAccessPort.port.snmp_description,
      }
    },
    abonOnt(){//терминал абонента по маку accountAccessPort, или по серийнику если неполучилось по маку
      const mac=this.accountAccessPort?.port?.subscriber_list?.mac||this.accountAccessPort?.port?.subscriber_list?.[0]?.mac||''
      if(!mac){return};
      const accountAccessPort_mac=mac.match(/[0-9A-Fa-f]/g).join('').toLowerCase();
      return this.portONTs.find(ont=>ont.macOnu&&accountAccessPort_mac===ont.macOnu.match(/[0-9A-Fa-f]/g).join('').toLowerCase())||this.portONTs.find(ont=>ont.serialNum&&accountAccessPort_mac.slice(6,12)===(parseInt(ont.serialNum.slice(6,12),16)+3).toString(16).toLowerCase())
    },
  },
  methods:{
    init(){
      this.initInternetAccessPort();
      this.initTVAccessDevice();
    },
    async initInternetAccessPort(){
      if(!this.accountAccessPort){return};
      this.getDeviceETH();
      if(this.isGpon){
        this.getAuthOnts();
      };
    },
    async initTVAccessDevice(){
      const {accountId:accountNumber}=this;
      if(!accountNumber){return};
      this.accountAccessDevice=null;
      const key=atok(accountNumber,'AccessDevice');
      const cache=this.$cache.getItem(key);
      if(cache){
        this.accountAccessDevice=cache;
      }else{
        try{
          const response=await httpGet(buildUrl('search_receiver_by_account',{account:accountNumber},'/call/device/'));
          if(Array.isArray(response)&&response[0]){
            this.$cache.setItem(key,response[0]);
            this.accountAccessDevice=response[0];
          };
        }catch(error){
          console.warn('search_receiver_by_account.error',error);
        };
      };

      if(this.accountAccessDevice){
        await this.getDeviceOP();
      }
    },
    async getDeviceOP(){
      const deviceName=this.accountAccessDevice?.deviceName;
      if(!deviceName){return};
      this.deviceOPLoading=!0;
      const method='get_devices_by_name';
      const key=atok(method,deviceName);
      let response=this.$cache.getItem(key);
      if(Array.isArray(response)&&response[0]){
        this.deviceOP=response[0];
      }else{
        try{
          response=await httpGet(buildUrl(method,{name:deviceName,transliterate:'en'},"/call/v1/device/"));
          if(Array.isArray(response)&&response[0]){
            this.deviceOP=response[0];
            this.$cache.setItem(key,response);
          };
        }catch(error){
          console.warn(`${method}.error`,error);
        }
      }
      this.deviceOPLoading=!1;
    },
    async getDeviceETH(){
      if(!this.accountAccessPort?.device?.name){return};
      const {name:deviceName=''}=this.accountAccessPort.device;
      if(!deviceName){return};
      this.deviceETHLoading=!0;
      const method='get_devices_by_name';
      const key=atok(method,deviceName);
      let response=this.$cache.getItem(key);
      if(Array.isArray(response)&&response[0]){
        this.deviceETH=response[0];
      }else{
        try{
          response=await httpGet(buildUrl(method,{name:deviceName,transliterate:'en'},"/call/v1/device/"));
          if(Array.isArray(response)&&response[0]){
            this.deviceETH=response[0];
            this.$cache.setItem(key,response);
          };
        }catch(error){
          console.warn(`${method}.error`,error);
        }
      }
      this.deviceETHLoading=!1;
    },
    async loadDevicePort() {
      const service = this.groupServiceList?.internet?.services[0];
      if (!service) return;
      this.deviceETHLoading = true;
      this.deviceETH = null;
      const params = { account: this.accountId, orig_id: service.vgid };
      try {
        const response = await httpGet(buildUrl('device_port', params, '/call/v2/device/'));
        this.deviceETH = response.device;
        this.port = response.port;
      } catch(error) {
        console.warn('load device_port error: ', error);
      } finally {
        this.deviceETHLoading = false;
      }
    },
    async getAuthOnts(){
      if(!this.accountAccessPort?.device?.name){return};
      if(!this.accountAccessPort?.port){return};
      if(this.portONTs.length){return};
      this.portONTsLoading=!0;
      this.portONTs=[];
      const {device:{name:device_name},port:{snmp_name:port,snmp_number:port_index}}=this.accountAccessPort;
      try{
        const onts=await httpGet(buildUrl('onu_info',{device_name,port,port_index},'/call/hdm/'));
        this.portONTs=onts.length?onts:[];
      }catch(error){
        console.warn('onu_info.error', error);
      };
      this.portONTsLoading=!1;
    },
    refreshOnlineSessions(){
      if(!this.$refs.sessons){return};
      setTimeout(this.$refs.sessons.refreshSessions,REFRESH_SESSIONS_TIMEOUT_MS);
    }
  }
});
