Vue.component('AbonPortBindForm',{//11310009159
  template:`<div>
    <div class="display-flex flex-direction-column gap-8px">
      <AbonPortBindFormPortStatus v-bind="{networkElement,port,disabled,portStatus,portStatusLoading}" @updatePortStatus="$emit('updatePortStatus')"/>

      <div v-if="typeOfBindIsLinkPortScheme" class="display-flex flex-direction-column border-1px-solid-c8c7c7 border-radius-4px">
        <div class="font--13-500 tone-500 margin-left-right-4px">для успешной привязки необходимо:</div>
        <devider-line m="0"/>
        <div class="display-flex flex-direction-column padding-left-right-4px">
          <info-value v-for="(props,key) of checksLinkPortScheme" :key="key" v-bind="props" class="padding-unset" withLine>
            <span v-if="props.valueIconClass" slot="value" :class="props.valueIconClass"></span>
          </info-value>
        </div>
      </div>
      <div v-if="checksSessions?.length" class="display-flex flex-direction-column border-1px-solid-c8c7c7 border-radius-4px">
        <div class="display-flex flex-direction-column padding-left-right-4px">
          <info-value v-for="(props,key) of checksSessions" :key="key" v-bind="props" class="padding-unset" withLine>
            <span v-if="props.valueIconClass" slot="value" :class="props.valueIconClass"></span>
          </info-value>
        </div>
      </div>
      
      <message-el v-if="!fields.length" text="Привязка этой УЗ не предусмотрена" :subText="'typeOfBindID: '+typeOfBindID" type="info" box/>
      
      <component v-for="({is,props,listeners,slots={}},index) of fields" :key="index" :is="is" v-bind="props" v-on="listeners">
        <component v-for="({is,props,listeners},slot) in slots" :key="slot" :slot="slot" :is="is" v-bind="props" v-on="listeners">
          
        </component>
      </component>

      <loader-bootstrap v-if="bindResourcesLoading" text="бронирование ресурсов сети"/>
      <template v-else-if="bindResourcesResult">
        <message-el v-if="bindResourcesResult.type==='error'" :text="bindResourcesResult.text" box type="warn"/>
        <template v-else-if="bindResourcesResult.type!=='error'">
          <message-el v-if="bindResourcesResult.InfoMessage" :text="bindResourcesResult.InfoMessage" box type="success"/>
          <template v-if="bindResourcesResult.cfg">
            <template v-for="(value,label,index) in bindResourcesResult.cfg">
              <info-value v-if="value" :key="index" v-bind="{value,label}" type="medium" withLine/>
            </template>
          </template>
          <link-block icon="person" v-if="bindResourcesResult.code==200||bindResourcesResult.InfoMessage||bindResourcesResult.Data" :text="accountID" :search="accountID" class="padding-unset"/>
        </template>
      </template>
      
    </div>
  </div>`,
  props:{
    port:{type:Object,required:true},
    networkElement:{type:Object,required:true},
    accountID:{type:String,required:true,default:''},
    accountInstance:{type:Object,required:true,default:()=>({})},
    selectedServiceItem:{type:Object,required:true,default:()=>({})},
    macs:{type:Array,required:true,default:()=>[]},
    disabled:{type:Boolean,default:false},
    portMacsLoading:{type:Boolean,default:false},
    portStatus:{type:Object,default:null},
    portStatusLoading:{type:Boolean,default:false},
  },
  created(){
    this.autoSelectMACAddress()
  },
  data:()=>({
    selectedMACAddress:'',
    selectedIPAddress:'',
    bindResourcesLoading:!1,
    bindResourcesResult:null,
    findSessionsByMACAddressLoads:{},
    findSessionsByMACAddressResps:{},
  }),
  watch:{
    'bindResourcesLoading'(bindResourcesLoading){
      this.$emit('bindResourcesLoading',bindResourcesLoading)
    },
    'bindResourcesResult'(bindResourcesResult){
      this.$emit('bindResourcesResult',bindResourcesResult)
    },
    'macs'(macs){
      this.autoSelectMACAddress()
    },
    'macAddressIsValid'(macAddressIsValid){
      this.$emit('onMac',this.macAddress);//for find CPE in AbonPortBindModal
      this.findSessionsByMACAddress()
    },
  },
  computed:{
    mrID(){return this.accountInstance?.mrID},
    serverID(){return this.accountInstance?.serverID},
    typeOfBindID(){return this.accountInstance?.typeOfBindID},
    serviceIsActive(){return this.selectedServiceItem?.serviceIsActive},

    typeOfBindIsLinkPortScheme(){return this.typeOfBindID==SM.BIND_TYPE_ID_11},
    checksLinkPortScheme(){
      const {serviceIsActive,portStatusLoading,isLinkUp,portMacsLoading,macAddressForBindIsValid}=this;
      const loading={value:'',valueClass:'display-flex',valueIconClass:'ic-16 ic-loading rotating main-lilac'};
      const success={value:'✔',valueStyle:'color:#20a471;font-weight:900;'};
      const warning={value:'✘',valueStyle:'color:#f16b16;font-weight:900;'};
      const initial={value:'—',valueStyle:'color:#918f8f;font-weight:900;'};
      return [
        Object.assign({label:'УЗ активирована'},serviceIsActive?success:warning),
        Object.assign({label:'Линк на порту'},portStatusLoading?loading:isLinkUp?success:warning),
        Object.assign({label:'MAC на порту'},portMacsLoading?loading:macAddressForBindIsValid?success:warning),
      ]
    },
    checksSessions(){
      const {sessions,sessionsLoading}=this;
      const loading={value:'',valueClass:'display-flex',valueIconClass:'ic-16 ic-loading rotating main-lilac'};
      const success={value:'✔',valueStyle:'color:#20a471;font-weight:900;'};
      const warning={value:'✘',valueStyle:'color:#f16b16;font-weight:900;'};
      const initial={value:'—',valueStyle:'color:#918f8f;font-weight:900;'};
      return sessions.map(({dbsessid,u_id,ip})=>{
        const isGuest=dbsessid&&!u_id;
        const label=`${isGuest?'Гостевая сессия':'Абонентская сессия'} ${ip||''}`
        return Object.assign({label,labelClass:'tone-500'},sessionsLoading?loading:dbsessid?success:initial)
      });
    },
    
    macAddress(){return this.selectedMACAddress.replace(/[^0-9A-F]/gi,'').match(/.{2}/g)?.join(':')},
    macAddressIsValid(){return this.macAddress?.length==17},
    
    macAddressForBind(){return this.selectedMACAddress.replace(/[^0-9A-FX]/gi,'').match(/.{2}/g)?.join(':')},//X - for priv NetworkScrt
    macAddressForBindIsValid(){return this.macAddressForBind?.length==17},
    
    sessionsLoading(){return this.findSessionsByMACAddressLoads[this.macAddress]},
    sessions(){return this.findSessionsByMACAddressResps[this.macAddress]||[]},
    
    selectedServiceBasicBindParams(){
      if(!this.selectedServiceItem){return null};
      const {serverID,typeOfBindID}=this;
      const {serviceID,vg,resource}=this.selectedServiceItem;
      if(vg){
        return new SM.LbsvSelectedServiceBasicBindParams(serverID,typeOfBindID,serviceID,vg.login,vg.agentid);
      }else if(resource){
        return new SM.ForisSelectedServiceBasicBindParams(serverID,typeOfBindID,serviceID);
      }
      return null
    },
    deviceIPAddress(){return this.networkElement?.ip||''},
    deviceName(){return this.networkElement?.name||''},
    devicePortNumber(){return this.port?.number||0},
    macItems(){return [...new Set([this.selectedMACAddress,...this.macs])].filter(Boolean).map((mac,i)=>new CHP.UISelectorInputItem(i,mac))},
    isLinkUp(){return this.portStatus?.IF_OPER_STATUS},
    bindResourcesDisabled(){return this.disabled||this.bindResourcesLoading},
    fields(){
      const {isLinkUp,bindResourcesDisabled,bindResourcesLoading,selectedMACAddress,macItems,selectedIPAddress,portMacsLoading}=this;
      const bindResourcesLinkPortDisabled=bindResourcesDisabled||!isLinkUp;
      const inputMac=new SM.UISelectorInputMac(selectedMACAddress,macItems,bindResourcesDisabled,{
        input:itemValue=>this.selectedMACAddress=itemValue
      },{
        postfix:new SM.ButtonGetMacs(portMacsLoading?'loading rotating':'sync',bindResourcesDisabled||portMacsLoading,{
          click:()=>this.$emit('callParent',['getPortMACAddressList'])
        })
      });
      return {
        [SM.BIND_TYPE_ID_3]:[
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_5]:[
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind(SM.BIND_TYPE_ID_3)
          }),
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_MAC,bindResourcesDisabled,bindResourcesLoading,{
            click:this.insOnlyMac
          }),
        ],
        [SM.BIND_TYPE_ID_6]:[
          new SM.InputIp(selectedIPAddress,bindResourcesDisabled,bindResourcesLoading,{
            input:(value)=>this.selectedIPAddress=value.replace(/[\,]/g,'.').replace(/[^\d|\.]/g,'')
          }),
          new SM.ButtonSetBind(SM.TEXT_BIND_IP,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_7]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_REBIND_MAC,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_9]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_SOME,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_10]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT_MAC,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind()
          }),
        ],
        [SM.BIND_TYPE_ID_11]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_SOME,bindResourcesLinkPortDisabled,bindResourcesLoading,{
            click:()=>this.setBind()
          }),
        ]
      }[this.typeOfBindID]||[]
    }
  },
  methods:{
    async findSessionsByMACAddress(){
      const {macAddress,macAddressIsValid}=this;if(!macAddress||!macAddressIsValid){return};
      if(this.findSessionsByMACAddressLoads[macAddress]){return};
      this.$set(this.findSessionsByMACAddressLoads,macAddress,!0);
      this.$set(this.findSessionsByMACAddressResps,macAddress,null);
      try{
        const response=await AAAService.getXRadSessionByMac(this.serverID,macAddress);
        this.$set(this.findSessionsByMACAddressResps,macAddress,response?.data||null);
      }catch(error){
        console.warn('findSessionsByMACAddress.error',error);
      };
      this.$set(this.findSessionsByMACAddressLoads,macAddress,!1);
    },
    insMac(){
      this.serviceMixQuery('ins_mac',{
        ...this.selectedServiceBasicBindParams,
        ...filterKeys(this,{
          accountID:'account',
          macAddressForBind:'mac',
          devicePortNumber:'port',
          deviceIPAddress:'ip',
          deviceName:'deviceName',
        })
      })
    },
    insOnlyMac(){
      this.serviceMixQuery('ins_only_mac',{
        ...this.selectedServiceBasicBindParams,
        ...filterKeys(this,{
          accountID:'account',
          macAddressForBind:'mac',
          devicePortNumber:'port',
          deviceName:'deviceName',
        })
      });
    },
    setBind(_typeOfBindID){
      const {typeOfBindID,selectedIPAddress,macAddressForBind}=this;
      this.serviceMixQuery('set_bind',{
        ...this.selectedServiceBasicBindParams,
        type_of_bind:_typeOfBindID||typeOfBindID,
        ...typeOfBindID==SM.BIND_TYPE_ID_6&&selectedIPAddress?{//not empty client_ip only
          client_ip:selectedIPAddress
        }:null,
        ...SM.BIND_TYPES_MANDATORY_MAC.includes(typeOfBindID)?{
          mac:macAddressForBind
        }:null,
        ...filterKeys(this,{
          accountID:'account',
          deviceIPAddress:'ip',
          devicePortNumber:'port',
          deviceName:'deviceName',
        })
      });
    },
    async serviceMixQuery(method,params){
      if(params.mac&&/x/i.test(String(params.mac))){//for priv NetworkScrt
        params.get_mac=new DNM.DevicePortParams(this.networkElement,this.port);
      };
      this.bindResourcesLoading=!0;
      this.bindResourcesResult=null;
      const path=`/call/service_mix/${method}`;
      try{
        const response=await CustomRequest.post(path,params);
        this.bindResourcesResult=response;
      }catch(error){
        console.warn(`${method}.error`,error);
        this.bindResourcesResult= {text:"Ошибка сервиса",type:"error"};
      };
      const {bindResourcesResult}=this;
      if(typeof bindResourcesResult?.Data=='string'){
        const [ip,gw,sub]=bindResourcesResult.Data.split('|');
        if(ip||gw||sub){
          this.$set(this.bindResourcesResult,'cfg',{'IP':ip,'Шлюз':gw,'Маска':sub});
        };
      };
      console.log({path,params})
      this.bindResourcesLoading=!1;
    },
    autoSelectMACAddress(){
      const {selectedMACAddress}=this;
      if(!selectedMACAddress){this.selectedMACAddress=this.macs[0]||selectedMACAddress}
    },
  },
});
