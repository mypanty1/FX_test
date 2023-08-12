Vue.component("PortActionReboot", {
  template:`<section name="PortActionReboot">
    <link-block v-if="$root.username=='mypanty1'" icon="reload" text="Перезагрузить порт" :disabled="loadingSome" v-bind="$attrs" actionIcon="refresh" @block-click="portReboot" :loading="portRebootLoading"/>
    <link-block v-else icon="reload" text="Перезагрузить порт" :disabled="loadingSome||disabled" v-bind="$attrs" actionIcon="refresh" @block-click="portReboot" :loading="portRebootLoading"/>
    <link-block v-if="$root.username=='mypanty1'" icon="reload main-red" text="Отключить порт" :disabled="loadingSome" v-bind="$attrs" actionIcon="reload" @block-click="portDown" :loading="portDownLoading"/>
    <link-block v-else-if="isAccess" icon="reload main-red" text="Отключить порт" :disabled="loadingSome||disabled" v-bind="$attrs" actionIcon="reload" @block-click="portDown" :loading="portDownLoading"/>
  </section>`,
  props:{
    port:{type:Object,required:true},
    networkElement:{type:Object,required:true},
    disabled:{type:Boolean,default:false},
  },
  data:()=>({
    portRebootLoading:false,
    portDownLoading:false,
  }),
  watch:{
    'loadingSome'(loadingSome){
      this.$emit('loading',loadingSome)
    }
  },
  computed:{
    isAccess(){
      const {is_trunk,is_link,state}=this.port;
      if(!state){return};//со страницы наряда модель порта не полная
      return !is_trunk&&!is_link&&!state.includes('trunk');
    },
    loadingSome(){
      return this.portRebootLoading||this.portDownLoading
    },
    portParams(){
      const {region:{mr_id},system_object_id,ip,vendor}=this.networkElement;
      const {snmp_name}=this.port;
      return {
        MR_ID:mr_id,
        port:{
          SNMP_PORT_NAME:snmp_name,
        },
        device:{
          MR_ID:mr_id,
          IP_ADDRESS:ip,
          SYSTEM_OBJECT_ID:system_object_id,
          VENDOR:vendor,
          FIRMWARE:null,
          FIRMWARE_REVISION:null,
          PATCH_VERSION:null,
        },
      }
    }
  },
  methods:{
    async portReboot(){
      this.portRebootLoading=true;
      try{
        const response=await httpPost("/call/hdm/port_reboot",this.portParams);
      }catch(error){
        console.warn("port_reboot.error",error);
      };
      this.portRebootLoading=false;
    },
    async portDown(){
      this.portDownLoading=true;
      try{
        const response=await httpGet(buildUrl('port_down',objectToQuery(this.portParams),'/call/hdm/'));
      }catch(error){
        console.warn("port_down.error",error);
      };
      this.portDownLoading=false;
    },
  },
});
