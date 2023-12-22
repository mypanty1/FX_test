Vue.component('AbonPortBindForm',{
  template:`<div>
    <div class="display-flex flex-direction-column gap-8px">
      <AbonPortBindFormPortStatus v-bind="{networkElement,port,disabled,portStatus,portStatusLoading}" @updatePortStatus="$emit('updatePortStatus')"/>
      
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
    this.autoSelectMac()
  },
  data:()=>({
    selectedMac:'',
    clientIp:'',
    bindResourcesLoading:!1,
    bindResourcesResult:null,
  }),
  watch:{
    'bindResourcesLoading'(bindResourcesLoading){
      this.$emit('bindResourcesLoading',bindResourcesLoading)
    },
    'bindResourcesResult'(bindResourcesResult){
      this.$emit('bindResourcesResult',bindResourcesResult)
    },
    'macs'(macs){
      this.autoSelectMac()
    },
    'selectedMac'(selectedMac){
      this.$emit('onMac',selectedMac)
    }
  },
  computed:{
    mrID(){return this.accountInstance?.mrID},
    serverID(){return this.accountInstance?.serverID},
    typeOfBindID(){return this.accountInstance?.typeOfBindID},

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
    deviceIP(){return this.networkElement?.ip||''},
    deviceName(){return this.networkElement?.name||''},
    portNumber(){return this.port?.number||0},
    macItems(){return [...new Set([this.selectedMac,...this.macs])].filter(Boolean).map((mac,i)=>new CHP.UISelectorInputItem(i,mac))},
    isLinkUp(){return this.portStatus?.IF_OPER_STATUS},
    bindResourcesDisabled(){return /*this.disabled||*/this.bindResourcesLoading},
    bindResourcesLinkPortDisabled(){return this.bindResourcesDisabled/*||!this.isLinkUp*/},
    fields(){
      const {bindResourcesLinkPortDisabled,bindResourcesDisabled,bindResourcesLoading,selectedMac,macItems,clientIp,portMacsLoading}=this;
      const inputMac=new SM.UISelectorInputMac(selectedMac,macItems,bindResourcesDisabled,{
        input:itemValue=>this.selectedMac=itemValue
      },{
        postfix:new SM.ButtonGetMacs(portMacsLoading?'loading rotating':'sync',bindResourcesDisabled||portMacsLoading,{
          click:()=>this.$emit('callParent',['getPortMACAddressList'])
        })
      });
      return {
        [SM.BIND_TYPE_ID_3]:[
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind(SM.BIND_TYPE_ID_3)
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
          new SM.InputIp(clientIp,bindResourcesDisabled,bindResourcesLoading,{
            input:(value)=>this.clientIp=value.replace(/[\,]/g,'.').replace(/[^\d|\.]/g,'')
          }),
          new SM.ButtonSetBind(SM.TEXT_BIND_IP,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind(SM.BIND_TYPE_ID_6)
          }),
        ],
        [SM.BIND_TYPE_ID_7]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_REBIND_MAC,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind(SM.BIND_TYPE_ID_7)
          }),
        ],
        [SM.BIND_TYPE_ID_9]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_SOME,bindResourcesLinkPortDisabled,bindResourcesLoading,{
            click:()=>this.setBind(SM.BIND_TYPE_ID_9)
          }),
        ],
        [SM.BIND_TYPE_ID_10]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_PORT_MAC,bindResourcesDisabled,bindResourcesLoading,{
            click:()=>this.setBind(SM.BIND_TYPE_ID_10)
          }),
        ],
        [SM.BIND_TYPE_ID_11]:[
          inputMac,
          new SM.ButtonSetBind(SM.TEXT_BIND_SOME,bindResourcesLinkPortDisabled,bindResourcesLoading,{
            click:()=>this.setBind(SM.BIND_TYPE_ID_11)
          }),
        ]
      }[this.typeOfBindID]||[]
    }
  },
  methods:{
    insMac(){
      this.serviceMixQuery('ins_mac',{
        ...this.selectedServiceBasicBindParams,
        ...filterKeys(this,{
          accountID:  'account',
          mac:        'selectedMac',
          portNumber: 'port',
          deviceIP:   'ip',
          deviceName: 'deviceName',
        })
      })
    },
    insOnlyMac(){
      this.serviceMixQuery('ins_only_mac',{
        ...this.selectedServiceBasicBindParams,
        ...filterKeys(this,{
          accountID:  'account',
          mac:        'selectedMac',
          portNumber: 'port',
          deviceName: 'deviceName',
        })
      });
    },
    setBind(_typeOfBindID){
      const {typeOfBindID,clientIp}=this;
      this.serviceMixQuery('set_bind',{
        ...this.selectedServiceBasicBindParams,
        type_of_bind:typeOfBindID==SM.BIND_TYPE_ID_5?_typeOfBindID:typeOfBindID,
        ...typeOfBindID==SM.BIND_TYPE_ID_6&&clientIp?{//not empty client_ip only
          client_ip:clientIp
        }:null,
        ...SM.BIND_TYPES_MANDATORY_MAC.includes(typeOfBindID)?{
          mac:this.selectedMac
        }:null,
        ...filterKeys(this,{
          accountID:  'account',
          deviceIP:   'ip',
          portNumber: 'port',
          deviceName: 'deviceName',
        })
      });
    },
    async serviceMixQuery(method,params){
      if(params.mac&&/x/.test(String(params.mac))){//for priv NetworkScrt
        params.get_mac=new DNM.DevicePortParams(this.networkElement,this.port);
      };
      this.bindResourcesLoading=!0;
      this.bindResourcesResult=null;
      const path=`/call/service_mix/${method}`;
      try{
        const response=await CustomRequest.post(path,params);
        this.bindResourcesResult=response
        if(response&&typeof response.Data=='string'){
          const [ip,gw,sub]=response.Data.split('|');
          if(ip||gw||sub){
            this.$set(this.bindResourcesResult,'cfg',{'Ip':ip,'Шлюз':gw,'Маска':sub});
          };
        }
      }catch(error){
        console.warn(`${method}.error`,error);
        this.bindResourcesResult= {text:"Ошибка сервиса",type:"error"};
      };
      console.log({path,params})
      this.bindResourcesLoading=!1;
    },
    autoSelectMac(){
      const {selectedMac}=this;
      if(!selectedMac){this.selectedMac=this.macs[0]||selectedMac}
    },
  },
});

