//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortLinks.js',type:'text/javascript'}));
Vue.component("port-links",{//test actual abon state from siebel
  template:`<card-block>
    <loader-bootstrap v-if="loading_devices" text="поиск подключенных устройств"/>
    <template v-if="!loading_devices&&devices.length">
      <title-main icon="tech-port" :text="devicesTitle"/>
      <div v-for="(device,i) of devices" :key="i+'_'+device.LINK_DEVICE_NAME">
        <div class="mx-3">
          <div class="rack-box">
            <div class="rack-box__link">
              <div class="rack-box__type" style="border-style: solid;">
                <!--переделать на ШДУ-->
                <i v-if="device.LINK_type=='Антивандальный'" class="fas fa-lock"></i>
                <i v-else class="fas fa-cube"></i>
              </div>
              <div class="rack-box__floor">
                <i class="fas fa-door-open"></i>{{device.LINK_ENTRANCE_NO}}
              </div>
              <!--device.LINK_RACK_LOCATION переделать на целевые атрибуты-->
              <div class="rack-box__location">{{device.LINK_RACK_LOCATION||'неизвестно'}}</div>
            </div>
            <article class="device-info">
              <header class="device-info__header">
                <div v-if="device.LINK_PORT_NUMBER" class="mr-1">
                  <div class="d-flex align-items-center justify-content-center m-0 trunk-port-link" style="font-size: 11px;">{{Number(device.LINK_PORT_NUMBER)}}</div>
                </div>
                <!--переделать на route-->
                <search-link class="device-info__title" :text="device.LINK_DEVICE_NAME">  {{device.LINK_DEVICE_IP_ADDRESS}}</search-link>
              </header>
              <div class="device-info__main">
                <!--address-->
                <div class="device-info__entrances">{{device.LINK_DEVICE_LOCATION}}</div>
              </div>
              <footer class="device-info__params">
                <info-value label="Имя" :value="device.LINK_DEVICE_NAME" type="small" />
              </footer>
            </article>
          </div>
        </div>
      </div>
    </template>
    <devider-line v-if="devices.length&&macs.length"/>
    <loader-bootstrap v-if="loading_macs" text="загрузка истории по порту"/>
    <template v-if="!loading_macs&&macs.length">
      <title-main icon="tech-port" text="На порту"/>
      <div v-for="(mac,i) of macs" :key="i+'_'+mac.MAC">
        <template v-if="mac.ACCOUNT">
          <template v-if="active_internets[mac.ACCOUNT]">
            <link-block icon="person main-green" :text="accountHeader(mac)" type="large" actionIcon="right-link" :to="'/'+mac.ACCOUNT"/>
            <info-text-sec v-for="(tarif,key) of active_internets[mac.ACCOUNT].tarifs" :text="tarif" :key="key"/>
            <info-value label="Активирован" withLine type="medium">
              <span slot="value" class="main-green">{{active_internets[mac.ACCOUNT].dateFrom}}</span>
            </info-value>
          </template>
          <template v-else>
            <link-block :icon="'person '+(mac.CLOSE_DATE?'main-red':'main-green')" :text="accountHeader(mac)" type="large" actionIcon="right-link" :to="'/'+mac.ACCOUNT"/>

            <info-value v-if="mac.START_DATE&&mac.CLOSE_DATE" :label="dateOnly(mac.START_DATE)" :withLine="true" type="medium">
              <span slot="value" class="main-red">{{dateOnly(mac.CLOSE_DATE)}}</span>
            </info-value>
            <template v-else>
              <info-value v-if="mac.CLOSE_DATE" label="Расторгнут" :withLine="true" type="medium">
                <span slot="value" class="main-red">{{dateOnly(mac.CLOSE_DATE)}}</span>
              </info-value>
              <info-value v-if="mac.START_DATE" label="Активирован" :withLine="true" type="medium">
                <span slot="value" class="main-green">{{dateOnly(mac.START_DATE)}}</span>
              </info-value>
            </template>
          </template>
        </template>

        <template v-if="mac.MAC&&mac.CLIENT_IP">
          <info-text-sec v-if="ouis[mac.MAC]" :text="ouis[mac.MAC]"/>
          <info-value :label="mac.MAC" :value="mac.CLIENT_IP" :withLine="true" type="medium"/>
          <info-text-sec v-if="ptrs[mac.CLIENT_IP]" :text="ptrs[mac.CLIENT_IP]" style="text-align:right;"/>
        </template>
        <template v-else>
          <info-text-sec v-if="ptrs[mac.CLIENT_IP]" :text="ptrs[mac.CLIENT_IP]" style="text-align:right;"/>
          <info-value v-if="mac.CLIENT_IP" label="IP" :value="mac.CLIENT_IP" :withLine="true" type="medium"/>
          <info-text-sec v-if="ouis[mac.MAC]" :text="ouis[mac.MAC]"/>
          <info-value v-if="mac.MAC" label="MAC" :value="mac.MAC" :withLine="true" type="medium"/>
        </template>

        <info-value v-if="mac.FIRST_DATE&&mac.LAST_DATE" :label="timePlusDate(mac.FIRST_DATE)" :value="timePlusDate(mac.LAST_DATE)" :withLine="true" type="medium"/>
        <template v-else>
          <info-value v-if="mac.FIRST_DATE" label="Первый выход" :value="timePlusDate(mac.FIRST_DATE)" :withLine="true" type="medium"/>
          <info-value v-if="mac.LAST_DATE" label="Последний выход" :value="timePlusDate(mac.LAST_DATE)" :withLine="true" type="medium"/>
        </template>

        <devider-line v-if="i<macs.length-1" style="margin:8px 16px;"/>
      </div>
    </template>
  </card-block>`,
  props:{
    port:{type:Object,required:true},
    devices:{type:Array,default:()=>([])},
    macs:{type:Array,default:()=>([])},
    loading_devices:{type:Boolean,default:false},
    loading_macs:{type:Boolean,default:false},
  },
  data:()=>({
    ouis:{},
    ptrs:{},
    resps:{
      networkElements:{},
      accounts:{}
    },
  }),
  created(){
    this.getNetworkElements();//by port
  },
  watch:{
    'macs'(){
      this.getAbons();
      this.getMacVendorLookup();
      this.getReverseDNSLookup();
    },
    'devices'(){
      this.getNetworkElements();
    }
  },
  computed:{
    devicesTitle(){
      if(!this.devices.length){return 'Технологический порт'};
      if(this.devices[0].LINK_DEVICE_NAME){return this.getNetworkElementTitle(this.networkElements[this.devices[0].LINK_DEVICE_NAME]?.type)};
      return 'Свободный порт';
    },
    networkElements(){return this.resps.networkElements},
    networkElement(){return this.networkElements[this.port.device_name]},
    active_internets(){
      return Object.values(this.resps.accounts).reduce((active_internets,account)=>{
        const {dateFrom,personalAccountStatus,accountNumber,products=[]}=account;
        const active_internet_services=products.reduce((active_internet_services,product)=>{
          const {services=[]}=product;
          active_internet_services.push(...services.filter(({name,statusCode})=>name==='Интернет'&&statusCode==='0').map(({tariff})=>tariff))
          return active_internet_services
        },[]);
        active_internets[accountNumber]=active_internet_services.length?{
          dateFrom,personalAccountStatus,accountNumber,tarifs:[...new Set(active_internet_services)]
        }:null
        return active_internets
      },{});
    }
  },
  methods:{
    async getMacVendorLookup(){
      let macList=[...new Set(this.macs.map(mac=>mac.MAC))];
      if(!macList.length){return};
      this.ouis=await this.test_getMacVendorLookup(macList);
    },
    getReverseDNSLookup(){
      [...new Set(this.macs.filter(mac=>mac.CLIENT_IP&&!['10','192','172','100'].includes(mac.CLIENT_IP.split('.')[0])))].map(mac=>{
        fetch(`https://dns.google/resolve?name=${[...mac.CLIENT_IP.split('.').reverse(),'in-addr.arpa'].join('.')}&type=ptr`).then(r=>r.json()).then(data=>{
          if(data.Answer&&data.Answer.length){
            let PTR=data.Answer.find(RR=>RR.type&&RR.type==12);//Resource Record Type == PTR (12) :domain name pointer
            if(PTR&&PTR.data){
              this.ptrs={...this.ptrs,[mac.CLIENT_IP]:(PTR.data+'.').split(' ')[0].replace('..','')};
            };
          };
        }).catch(e=>console.warn(e.toString()));
      });
    },
    getPtrs(){
      [...new Set(this.macs.filter(mac=>mac.CLIENT_IP&&!['10','192','172','100'].includes(mac.CLIENT_IP.split('.')[0])))].map(mac=>{
        fetch(`https://api.whois.vu/?s=ip&q=${mac.CLIENT_IP}`).then(r=>r.json()).then(data=>{
          if(data.hostname!==data.ip){
            this.ptrs={...this.ptrs,[data.ip]:data.hostname};
          };
        }).catch(e=>console.warn(e.toString()));
      });
    },
    timePlusDate(date=''){return date.split(' ').reverse().join(' • ')},
    dateOnly(date=''){return date.split(' ')[0]},
    async getNetworkElement(device_name=''){
      if(!device_name){return};
      if(this.resps.networkElements[device_name]){return};
      const cache=this.$cache.getItem(`device/${device_name}`);
      if(cache){
        this.$set(this.resps.networkElements,device_name,cache);
      }else{
        const response=await httpGet(buildUrl('search_ma',{pattern:device_name},'/call/v1/search/'));
        if(response.data){
          this.$cache.setItem(`device/${device_name}`,response.data);
          this.$set(this.resps.networkElements,device_name,response.data);
        };
      };
    },
    getNetworkElements(){
      const {device_name=''}=this.port;
      const names=[device_name,...this.devices.map(ne=>ne.LINK_DEVICE_NAME)];
      Promise.allSettled(names.map(name=>this.getNetworkElement(name)));
    },
    getNetworkElementShortName(name){return getNetworkElementShortName(name)},
    getNetworkElementTitle(type){
      const title=getNetworkElementReference(type)?.title||'неизвестный СЭ'
      return `На порту ${title}`;
    },
    accountHeader(mac){
      if(!mac){return};
      if(!mac.ACCOUNT){return};
      return mac.ACCOUNT+(mac.FLAT_NUMBER?(' • кв.'+mac.FLAT_NUMBER):'');
    },
    getAbons(){
      const accounts=this.macs.map(mac=>mac.ACCOUNT).filter(a=>a);
      Promise.allSettled(accounts.map(account=>this.getAccountFromSiebel(account)));
    },
    async getAccountFromSiebel(account){
      if(!account){return};
      if(this.resps.accounts[account]){return};
      const cache=this.$cache.getItem(`siebel:account/${account}`);
      if(cache){
        this.$set(this.resps.accounts,account,cache);
      }else{
        try{
          const response=await httpGet(buildUrl('search_api',{accountNumber:account,search_type:'account'},'/call/v1/siebel/'));
          if(response?.accountNumber){
            this.$cache.setItem(`siebel:account/${account}`,response);
            this.$set(this.resps.accounts,account,response);
          };
        }catch(error){
          console.warn('siebel:error',error);
        };
      };
    },
  }
});
