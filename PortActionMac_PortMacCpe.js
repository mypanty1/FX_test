//add cpe by mac
Vue.component("PortMacCpe",{
  template:`<div name="PortMacCpe" class="display-contents">
    <template v-if="mac">
      <info-value :label="mac" :value="text" withLine type="medium"/>
      <info-text-sec v-if="vendor" :text="vendor" class="margin-top--6px"/>
      <div class="display-flex margin-left-right-16px">
        <info-text-sec v-if="cpe" :text="cpeModelSn" class="bg-main-lilac-light padding-left-right-4px border-radius-4px"/>
      </div>
    </template> 
    <info-value v-else :label="text" value=" " type="medium"/>
    <devider-line m="4px 16px 0px 16px"/>
  </div>`,
  props:{
    text:{type:String,required:true},
    mac:{type:String,default:''},
    mr_id:{type:[String,Number],default:0,required:true},
    oui:{type:String,default:''},
  },
  data:()=>({
    cpes:[],
  }),
  created(){
    this.getCpesByMac();
  },
  computed:{
    cpe(){return this.cpes?.[0]},
    model(){return this.cpe?.model||''},
    sn(){return this.cpe?.sn||''},
    vendor(){return this.cpe?.vendor||this.oui||''},
    cpeModelSn(){return `${this.model} • ${this.sn}`},
  },
  methods:{
    async getCpesByMac(){
      const {mac,mr_id}=this;
      if(!mac||!mr_id){return};
      const key=`cpes_by_mac-${mr_id}-${mac}`;
      const cache=this.$cache.getItem(key);
      if(cache){
        this.cpes=cache;
        return
      };
      try{
        const response=await httpPost(buildUrl('cpe_registre',{mac,mr_id},'/call/axiros/'),{mac,mr_id});
        this.cpes=response?.length?response:[];
        this.$cache.setItem(key,this.cpes);
      }catch(error){
        console.warn('cpe_registre.error', error);
      };
    },
  },
});
Vue.component("PortActionMac", {
  template:`<section name="PortActionMac">
    <link-block icon="mac" text="MAC-адрес" @block-click="loadMacs" :disabled="disabledBtn" :loading="loading" actionIcon="down" data-ic-test="load_mac_btn"/>
    <template v-if="!loading&&rows.length">
      <PortMacCpe v-for="({text,mac},key) of rows" :key="key" v-bind="{text,mac}" :oui="ouis[mac]" :mr_id="networkElement.region.mr_id"/>
    </template>

    <info-list v-if="text&&!loading" :text="text"/>

    <message-el v-if="clear_success" text="MAC очищен" class="margin-top-8px margin-bottom-8px margin-left-16px" data-ic-test="clear_mac_result"/>
    <div v-if="!loading&&rows.length" class="padding-8px-16px">
      <button-main @click="clearMac" label="Очистить MAC " icon="" :loading="loading_clear" :disabled="disabledBtn" buttonStyle="outlined" size="full" data-ic-test="clear_mac_btn"/>
    </div>
  </section>`,
  props: {
    port:{type:Object,required:true},
    networkElement:{type:Object,required:true},
    disabled:{type:Boolean,default:false},
  },
  data: () => ({
    loading: false,
    loading_clear: false,
    rows: [],//ETH_KR_54_89153_10
    text: "",
    ouis: {},
    clear_success: false,
  }),
  created() {
    this.clear_success = false;
  },
  watch:{
    'loading'(loading){
      this.$emit('loading',loading)
    },
    'loading_clear'(loading_clear){
      this.$emit('loading',loading_clear)
    }
  },
  computed: {
    disabledBtn() {
      return this.disabled || this.loading || this.loading_clear;
    }
  },
  methods: {
    async parse(rows){
      const {items,macs}=rows.reduce((result,row)=>{//ffff.ffff.ffff,ff:ff:ff:ff:ff:ff
        const mac=row.match(/(([0-9A-Fa-f]{4}[.-]){2}([0-9A-Fa-f]{4}))|(([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2}))/gi)?.[0]||'';
        const text=(mac?row.replace(mac,''):row).split(' ').filter(v=>v).join(' • ')
        result.items.push({mac,text});
        if(mac){result.macs.push(mac)};
        return result
      },{items:[],macs:[]});
      this.rows=items;
      this.ouis=await this.test_getMacVendorLookup(macs);
    },
    eventLoadStatus() {
      this.$emit("load:status");
    },
    async loadMacs() {
      this.loading = true;
      this.rows = [];
      this.macs = [];
      this.text = "";
      try {
        const response = await httpGet(buildUrl("port_mac_show",{
          MR_ID: this.networkElement.region.mr_id,
          DEVICE_IP_ADDRESS:this.networkElement.ip,
          DEVICE_SYSTEM_OBJECT_ID:this.networkElement.system_object_id,
          DEVICE_VENDOR:this.networkElement.vendor,
          DEVICE_FIRMWARE:this.networkElement.firmware,
          DEVICE_FIRMWARE_REVISION:this.networkElement.firmware_revision,
          DEVICE_PATCH_VERSION:this.networkElement.patch_version,
          SNMP_PORT_NAME:this.port.snmp_name,
        },"/call/hdm/"));
        if (response.text && Array.isArray(response.text)) {
          //this.rows = response.text;
          this.parse(response.text);
        }
        if (typeof response.text === "string") {
          this.text = response.text;
        }
      } catch (error) {
        console.warn("port_mac_show.error", error);
      }
      this.loading = false;
    },
    async clearMac() {
      this.clear_success = false;
      this.loading_clear = true;
      try {
        // const response = await Promise.resolve({ message: "OK" });
        const response = await httpPost("/call/hdm/clear_macs_on_port", {
          port:{
            SNMP_PORT_NAME:this.port.snmp_name,
            PORT_NUMBER:this.port.number,
          },
          device:{
            MR_ID:this.networkElement.region.mr_id,
            IP_ADDRESS:this.networkElement.ip,
            SYSTEM_OBJECT_ID:this.networkElement.system_object_id,
            VENDOR:this.networkElement.vendor,
            DEVICE_NAME:this.networkElement.name,
            FIRMWARE:this.networkElement.firmware,
            FIRMWARE_REVISION:this.networkElement.firmware_revision,
            PATCH_VERSION:this.networkElement.patch_version,
          },
        });
        if (response.message === "OK") {
          this.clear_success = true;
          this.eventLoadStatus();
          this.loadMacs();
        }
      } catch (error) {
        console.warn("clear_macs_on_port.error", error);
      }
      this.loading_clear = false;
    },
  },
});



