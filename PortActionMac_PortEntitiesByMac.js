
Vue.component("PortEntitiesByMac",{
  template:`<div name="PortEntitiesByMac" class="display-contents">
    <template v-if="mac">
      <div class="display-flex gap-4px padding-left-right-16px align-items-center">
        <div v-if="loadingSome" class="ic-16 ic-loading rotating main-lilac"></div>
        <info-value :label="mac" :value="text" withLine type="medium" class="padding-unset width-100-100"/>
      </div>
      <div class="display-flex flex-direction-column gap-2px">
        <div v-if="vendor" class="display-flex margin-left-right-16px align-items-center gap-2px">
          <div class="font--12-400">{{vendor}}</div>
        </div>
        <div v-if="ne" @click="$router.push({name:'network-element',params:{device_id:neName}})" class="display-flex margin-left-right-16px align-items-center gap-2px">
          <div class="font--12-400">устройство:</div>
          <div class="font--13-500 bg-main-lilac-light padding-left-right-4px border-radius-4px">{{neIpModel}}</div>
          <div class="ic-20 ic-right-1 main-lilac bg-main-lilac-light border-radius-4px"></div>
        </div>
        <div v-if="cpe" @click="$router.push({name:'account-cpe',params:{mr_id,serial:sn,account:account||'00000000000'}})" class="display-flex margin-left-right-16px align-items-center gap-2px">
          <div class="font--12-400">роутер:</div>
          <div class="font--13-500 bg-main-lilac-light padding-left-right-4px border-radius-4px">{{cpeModelSn}}</div>
          <div class="ic-20 ic-right-1 main-lilac bg-main-lilac-light border-radius-4px"></div>
        </div>
        <div v-if="session" @click="goToSessionAccount" class="display-flex margin-left-right-16px align-items-center gap-2px">
          <div class="font--12-400"><span v-if="isGuest">гостевая </span>сессия:</div>
          <div class="font--13-500 bg-main-lilac-light padding-left-right-4px border-radius-4px">{{sessionText}}</div>
          <div v-if="isGuest" @click="stopGuestSession" class="ic-20 ic-close-1 main-lilac bg-main-lilac-light border-radius-4px"></div>
          <div v-else-if="sessionAccount" class="ic-20 ic-right-1 main-lilac bg-main-lilac-light border-radius-4px"></div>
        </div>
        <div v-if="account" @click="$router.push({name:'search',params:{text:account}})" class="display-flex margin-left-right-16px align-items-center gap-2px">
          <div class="font--12-400">абонент:</div>
          <div class="font--13-500 bg-main-lilac-light padding-left-right-4px border-radius-4px">{{accountFlat}}</div>
          <div class="ic-20 ic-right-1 main-lilac bg-main-lilac-light border-radius-4px"></div>
        </div>
        <div v-if="port_ne&&this.$route.params.id!==portName" @click="$router.push({name:'eth-port',params:{id:portName}})" class="display-flex margin-left-right-16px align-items-center gap-2px">
          <div class="font--12-400">другой порт:</div>
          <div class="font--13-500 bg-main-lilac-light padding-left-right-4px border-radius-4px">{{portNeIpPortName}}</div>
          <div class="ic-20 ic-right-1 main-lilac bg-main-lilac-light border-radius-4px"></div>
        </div>
      </div>
    </template> 
    <info-value v-else :label="text" value=" " type="medium"/>
    <devider-line m="4px 16px 0px 16px"/>
  </div>`,
  props:{
    text:{type:String,required:true},
    mac:{type:String,default:''},
    mr_id:{type:[String,Number],default:0,required:true},
    region_id:{type:[String,Number],default:0,required:true},
    noSession:{type:Boolean,default:false},
    oui:{type:String,default:''},
  },
  data:()=>({
    cpes:[],
    neps:[],
    port:null,
    port_ne:null,
    session:null,
    loads:{},
  }),
  created(){
    this.getCpesByMac();
    this.getNeOrPortByMac();
    if(!this.noSession){
      this.getSessionByMac();
    }
  },
  watch:{
    'portName'(portName){
      if(portName){
        this.getPort();
      };
    },
    'portNeName'(portNeName){
      if(portNeName){
        this.getNe();
      };
    },
  },
  computed:{
    cpe(){return this.cpes?.[0]},
    cpeModel(){return this.cpe?.model||''},
    sn(){return this.cpe?.sn||''},
    vendor(){return this.cpe?.vendor||this.oui||''},
    cpeModelSn(){return `${this.cpeModel} • ${this.sn}`},
    ne(){return this.neps?.ip?this.neps:null},
    neModel(){return this.ne?.model||''},
    neName(){return this.ne?.name||''},
    neIp(){return this.ne?.ip||''},
    neIpModel(){return `${this.neIp} • ${this.neModel}`},
    portName(){return this.neps?.[1]?.ports?.[0]?.PORT_NAME||''},
    portNeName(){return this.portName.split(/PORT-|\//gi)?.[1]||''},
    sub(){return this.port?.subscriber_list?.find(({mac:_mac})=>_mac?.match(/[0-9a-f]/gi)?.join('')?.toLowerCase()==this.mac.match(/[0-9a-f]/gi)?.join('').toLowerCase())},
    account(){return this.sub?.account||''},
    flat(){return this.sub?.flat||''},
    accountFlat(){return `${this.account} • кв.${this.flat||'?'}`},
    portNeIp(){return this.port_ne?.ip||''},
    portIfName(){return this.port?.snmp_name||''},
    portNeIpPortName(){return `${this.portNeIp} • ${this.portIfName}`},
    loadingSome(){return Object.values(this.loads).some(v=>v)},
    serverid(){
      return {
        '2':[241],'3':[115],'12':[134],'14':[255],'16':[133],'18':[15],'22':[103],'23':[128,129,130,236],'24':[234],'25':[88],'26':[109],'27':[52],'28':[111],
        '29':[10],'30':[27],'31':[112],'33':[70],'34':[110],'35':[9],'36':[47],'37':[3],'38':[55],'40':[6],'41':[131],'42':[137,240],'43':[116],'45':[66],
        '46':[35],'52':[90,92,113],'53':[8],'54':[108],'55':[64],'56':[101],'57':[51],'58':[78],'59':[121],'61':[31],'62':[12],'63':[125],'64':[13,117],
        '66':[120],'67':[34],'68':[2,82],'69':[1],'71':[83],'72':[126],'73':[65],'74':[94,100,104],'75':[54],'76':[14],'78':[75],'86':[124],'89':[127],
      }[this.region_id]?.[0];
    },
    sessionid(){return this.session?.sessionid||''},
    sessionIp(){return this.session?.ip||''},
    dbsessid(){return this.session?.dbsessid},
    sessionDateLocal(){
      const {session}=this;
      if(!session){return};
      const {start,update_time}=session;
      const session_date=/*update_time||*/start;
      if(!session_date){return};
      const date=new Date(session_date);
      if(date=='Invalid Date'){return session_date};
      const offset=new Date().getTimezoneOffset()/-60;
      date.setHours(date.getHours()-3+offset);
      function pad2(v){return `${v}`.padStart(2,0)};
      return `${pad2(date.getHours())}:${pad2(date.getMinutes())} ${pad2(date.getDate())}.${pad2(date.getMonth()+1)}`;
    },
    sessionText(){return `${this.sessionIp||this.dbsessid} • ${this.sessionDateLocal}`},
    isGuest(){return this.session&&!this.session.u_id},
    online_login(){return this.session?.online_login},
    sessionAccount(){
      const account=this.online_login.match(/\d/g)?.join('');
      return account?.length==11&&account?.[0]!=7?account:'';
    },
  },
  methods:{
    goToSessionAccount(){
      const {sessionAccount}=this;
      if(!sessionAccount){return};
      this.$router.push({name:'search',params:{text:sessionAccount}})
    },
    async getCpesByMac(){
      const {mac,mr_id}=this;
      if(!mac||!mr_id){return};
      const key=`cpes_by_mac-${mr_id}-${mac}`;
      this.$set(this.loads,key,true);
      const cache=this.$cache.getItem(key);
      if(cache){
        this.cpes=cache;
        this.$set(this.loads,key,false);
        return
      };
      try{
        const response=await httpPost(buildUrl('cpe_registre',{mac,mr_id,mr:mr_id},'/call/axiros/'),{mac,mr_id,mr:mr_id});
        this.cpes=response?.length?response:[];
        this.$cache.setItem(key,this.cpes);
      }catch(error){
        console.warn('cpe_registre.error', error);
      };
      this.$set(this.loads,key,false);
    },
    async getNeOrPortByMac(){
      const {mac,mr_id}=this;
      if(!mac||!mr_id){return};
      const key=`neps_by_mac-${mr_id}-${mac}`;
      this.$set(this.loads,key,true);
      const cache=this.$cache.getItem(key);
      if(cache){
        this.neps=cache;
        this.$set(this.loads,key,false);
        return
      };
      try{
        const response=await httpGet(buildUrl('search_ma',{pattern:mac},'/call/v1/search/'));
        this.neps=response?.data||[];
        this.$cache.setItem(key,this.neps);
      }catch(error){
        console.warn('search_ma.error', error);
      };
      this.$set(this.loads,key,false);
    },
    async getPort(){
      const {portName}=this;
      if(!portName){return};
      const key=`port/${portName}`;
      this.$set(this.loads,key,true);
      const cache=this.$cache.getItem(key);
      if(cache){
        this.port=cache;
        this.$set(this.loads,key,false);
        return
      };
      try{
        const response=await httpGet(buildUrl('search_ma',{pattern:portName},'/call/v1/search/'));
        if(response?.data){
          this.port=response.data;
          this.$cache.setItem(key,this.port);
        }
      }catch(error){
        console.warn('search_ma.error', error);
      };
      this.$set(this.loads,key,false);
    },
    async getNe(){
      const {portNeName}=this;
      if(!portNeName){return};
      const key=`device/${portNeName}`;
      this.$set(this.loads,key,true);
      const cache=this.$cache.getItem(key);
      if(cache){
        this.port_ne=cache;
        this.$set(this.loads,key,false);
        return
      };
      try{
        const response=await httpGet(buildUrl('search_ma',{pattern:portNeName},'/call/v1/search/'));
        if(response?.data){
          this.port_ne=response.data;
          this.$cache.setItem(key,this.port_ne);
        }
      }catch(error){
        console.warn('search_ma.error', error);
      };
      this.$set(this.loads,key,false);
    },
    async getSessionByMac(){
      const {mac,serverid}=this;
      if(!mac||!serverid){return};
      const key=`get_online_sessions-${serverid}-${mac}`;
      if(this.loads[key]){return};
      this.$set(this.loads,key,true);
      try{
        const response=await httpGet(buildUrl('get_online_sessions',{serverid,mac_address:mac},'/call/aaa/'))
        this.session=response?.data?.[0]||null;
      }catch(error){
        console.warn('get_online_sessions.error', error);
      };
      this.$set(this.loads,key,false);
    },
    async stopGuestSession(){
      const {serverid,dbsessid}=this;
      if(!serverid||!dbsessid){return};
      const key=`stop_session_radius-${serverid}-${dbsessid}`;
      if(this.loads[key]){return};
      this.$set(this.loads,key,true);
      try{
        const response=await httpGet(buildUrl('stop_session_radius',{serverid,dbsessid},'/call/aaa/'))
        if(response?.code==200){
          this.session=null;
          //setTimeout(this.getSessionByMac,5555);
        };
      }catch(error){
        console.warn('get_online_sessions.error', error);
      };
      this.$set(this.loads,key,false);
    }
  },
});
Vue.component("PortActionMac", {
  template:`<section name="PortActionMac">
    <link-block icon="mac" text="MAC-адрес*" @block-click="loadMacs" :disabled="disabledBtn" :loading="loading" actionIcon="down" data-ic-test="load_mac_btn"/>
    <template v-if="!loading&&rows.length">
      <PortEntitiesByMac v-for="({text,mac},key) of rows" :key="key" v-bind="{text,mac}" :oui="ouis[mac]" :mr_id="networkElement.region.mr_id" :region_id="networkElement.region.id" :noSession="rows.length>2"/>
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






