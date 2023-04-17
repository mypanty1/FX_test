//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SendKionPq.js',type:'text/javascript'}));

store.registerModule('kion',{
  namespaced:true,
  state:()=>({
    loads:{
      getPq:false,
      sendLog:false,
    },
    resps:{
      getPq:null
    }
  }),
  getters:{
    resps_getPq:state=>state.resps.getPq,
    pq:state=>state.resps.getPq?.pq,
    smsTemplate:state=>state.resps.getPq?.sms,
    date:state=>new Date(Date.parse(state.resps.getPq?.date)),
    loads_getPq:state=>state.loads.getPq,
    loads_sendLog:state=>state.loads.sendLog,
  },
  mutations:{
    set_resp_getPq(state,response={}){
      state.resps.getPq=response;
    },
    set_loads_getPq(state,loading=false){
      state.loads.getPq=loading;
    },
    set_loads_sendLog(state,loading=false){
      state.loads.sendLog=loading;
    },
  },
  actions:{
    async getPq({state,rootGetters,commit},props){
      const username=rootGetters['main/username'];
      commit('set_loads_getPq',true);
      try{
        const url='https://script.google.com/macros/s/AKfycbyFZx3LaE77_0n-Hne597ky5P1SyrmeReaKrndXURqKhGJE6qNDjfi455OBuFcWvwaK/exec';
        const response=await fetch(`${url}?username=${username}`).then(resp=>resp.json());//await new Promise(r=>setTimeout(r,30000));
        commit('set_resp_getPq',response);
      }catch(error){
        console.warn('getPq:error',error);
      }
      commit('set_loads_getPq',false);
    },
    async sendLog({state,rootGetters,commit},{account='',phone='',sms=''}={}){
      const username=rootGetters['main/username'];
      const region_id=rootGetters['main/region_id'];
      commit('set_loads_sendLog',true);
      try{
        await fetch('https://script.google.com/macros/s/AKfycbwl2YHpVTeUevuwTqgkm2OmP-sf78EXd91yI4neh1MrmVHA6_M_Pq8dYE7JIwyxwIsL/exec',{
          method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json;charset=utf-8"},
          body:JSON.stringify({username,region_id,account,phone,sms})
        });
      }catch(error){
        console.warn('sendLog:error',error);
      }
      commit('set_loads_sendLog',false);
    }
  },
});

Vue.component('SendKionPq',{
  template:`<div v-if="(resps_getPq||loads_getPq)&&phonesValid.length" class="send-kion-pq background-color-d1dfed display-flex flex-direction-column gap-2px margin-left-right-16px margin-top-bottom-8px border-radius-8px padding-4px">
    <loader-bootstrap v-if="loads_getPq" text="получение промокода KION"/>
    <template v-else-if="resps_getPq">
      <span class="font--12-400">Отправить смс с промокодом KION</span>
      <div class="display-inline-flex column-gap-4px justify-content-space-between">
        <div v-if="items.length==1" class="display-inline-flex align-items-center">
          <span class="tone-900 font--15-500">{{phone}}</span>
        </div>
        <select-el v-else :items="items" v-model="selected" :value="phone" class="send-kion-pq-custom-selector-el"/>
        <div class="display-inline-flex column-gap-4px">
          <div v-if="loads_sendLog" class="display-flex align-items-center">
            <i class="ic-24 ic-loading rotating main-lilac"></i>
          </div>
          <div @click="sendSms(phone)" :class="(!pq||loads_getPq||loads_sendLog)?'background-color-97a8b9':'background-color-284059 cursor-pointer'" class="size-30px border-radius-4px display-flex align-items-center justify-content-center">
            <i class="tone-100 ic-24 ic-sms"></i>
          </div>
        </div>
      </div>
      <span v-if="pq" class="font--12-400">{{pq}} от {{date.toLocaleString()}}</span>
      <div v-else class="font--12-400 text-align-center background-color-efdbcf border-radius-8px margin-top-2px">промокод не внесён!</div>
    </template>
  </div>`,
  props:{
    phones:{type:Array,default:()=>([])},
    account:{type:String,default:''},
  },
  data:()=>({
    selected:'',
    phone:'',
    items:[],
  }),
  mounted(){
    createStyleElement('SendKionPq-css',`
    .background-color-d1dfed,.kion-bg{background-color:#d1dfed;}
    .background-color-284059,.kion-bg-btn{background-color:#284059;}
    .background-color-97a8b9,.kion-bg-btn-disabled{background-color: #97a8b9;}
    .background-color-efdbcf,.kion-bg-no-pq{background-color: #efdbcf;}
    .cursor-pointer{cursor:pointer;}
    .send-kion-pq-custom-selector-el.select-el{padding: unset;width: 150px;height: 25px;background: unset;}
    .send-kion-pq-custom-selector-el .select-el__label{height: 25px;}
    .send-kion-pq-custom-selector-el .select-el__input{padding: unset;margin-left: 4px;}
    .send-kion-pq-custom-selector-el .select-el__icon{padding: unset;}
    .send-kion-pq-custom-selector-el.select-el--open .select-el__list{top: 26px;padding: unset;}
    .send-kion-pq-custom-selector-el .select-el__item{height: 25px;min-height: 25px;padding: unset;padding-left: 4px;padding-right: 2px;}
    `)
  },
  created(){
    if(!this.pq&&!this.loads_getPq){
      this.getPq();
    };
    this.items=[...new Set([this.phone,...this.items,...this.phonesValid].filter(s=>s))];
    this.selected=this.selected||this.phone||this.items[0];
  },
  watch:{
    'selected'(selected){
      if(selected){this.phone=selected};
    },
    'phonesValid'(phonesValid){
      this.items=[...new Set([this.phone,...this.items,...phonesValid].filter(s=>s))];
      this.selected=this.selected||this.phone||this.items[0]
    }
  },
  computed:{
    ...mapGetters({
      username:'main/username',
    }),
    phonesValid(){
      return [...new Set(this.phones.filter(s=>s).map(phone=>getPhoneWithPlus(phone)).filter(t=>t.length>6))];
    },
    ...mapGetters({
      isApp:'app/isApp',
      resps_getPq:'kion/resps_getPq',
      pq:'kion/pq',
      smsTemplate:'kion/smsTemplate',
      date:'kion/date',
      loads_getPq:'kion/loads_getPq',
      loads_sendLog:'kion/loads_sendLog',
    }),
    sms(){
      if(!this.smsTemplate){return `http://kion.ru/code?pq=${this.pq}`};
      return this.smsTemplate.split(/({{|}})/).reduce((text,piece,i,arr)=>{
        if(piece==='{{'){
          const path=arr[i+1]||'';
          text+=path.split('.').reduce((value,key)=>(value?.[key]||''),this);
        }else if(piece!=='}}'&&arr[i-1]!=='{{'){
          text+=piece;
        };
        return text;
      },'',this);
    },
  },
  methods:{
    ...mapActions({
      sendToApp:'app/sendToApp',
      getPq:'kion/getPq',
      sendLog:'kion/sendLog'
    }),
    sendSms(phone='',mode='direct'){//mode direct or approve
      if(!phone){return};
      const {pq,account,sms,loads_sendLog}=this;
      if(!pq){return};
      if(loads_sendLog){return};
      if(this.isApp){
        this.sendToApp(`do:sendSms:${mode}:${phone}=${sms}`);
      }else{
        window.location=`sms:${phone}?body=${encodeURIComponent(sms)}`;
      };
      this.sendLog({account,phone,sms})
    },
  }
});

Vue.component("LbsvAccountMain",{//add SendKionPq
  template:`<CardBlock name="LbsvAccountMain" v-if="account">
    <title-main>
      <div slot="prefix">
        <span class="ic-20 ic-status" :class="!agreement.closedon?'main-green':'main-red'"></span>
      </div>
      <span slot="text" class="display-flex align-items-center gap-5px">
        <span>{{accountId}}</span>
        <span v-if="agreement?.closedon" class="font--12-400 tone-500">расторгнут {{agreement.closedon}}</span>
        <span v-if="agreement?.isconvergent&&!agreement?.closedon" class="lbsv-account__convergent">Конвергент</span>
      </span>
    </title-main>
    <devider-line/>
    <info-text-icon icon="" :text="formatedAddress" type="medium"/>
    <devider-line/>
    <title-main icon="person" :text="account.name" textClass="text-transform-capitalize"/>
    <div v-if="agreement && phone === agreement.convergentmsisdn">
      <account-call v-if="agreement?.isconvergent" :phone="agreement.convergentmsisdn" :isConvergent="agreement.isconvergent" class="margin-bottom-16px" showSendSms/>
    </div>
    <div v-else>
      <account-call v-if="agreement?.isconvergent" :phone="agreement.convergentmsisdn" :isConvergent="agreement.isconvergent" class="margin-bottom-16px" showSendSms/>
      <account-call v-if="phone" :phone="phone" class="margin-bottom-16px" showSendSms/>
    </div>
    
    <SendKionPq :phone="phone" :phones="[account?.mobile,account?.phone,agreement?.convergentmsisdn]" :account="accountId"/>
    
    <devider-line v-if="agreement"/>
    <template v-if="agreement">
      <info-value icon="purse" :label="balanceLabel" :value="balance" :minus="agreement.balance.minus" type="extra"/>
      <info-value icon="purse" v-if="agreement?.convergentmsisdn && convergentBalance" :label="balanceLabelConvergent" :value="convergentBalance+' ₽'" :minus="convergentBalance < 0" type="extra"/>
      <info-value icon="clock" v-if="agreement.lastpaydate" label="Платеж" :value="lastPayText" type="extra"/>
    </template>
    <devider-line/>
      
    <link-block icon="sms" text="Смс с новым паролем" @block-click="openSendSmsModal" action-icon="expand"/>
    <send-sms-modal ref="sendSms" :account="accountId"/>
  </CardBlock>`,
  props:{
    account:{type:Object,default:null},
    agreement:{type:Object,default:null},
    flatData:{type:Object,default:null},
    loading:{type:Object,required:true},
    billingInfo:{type:Array,default:()=>[]},
    convergentBalance:{type:[String,Number],default:null},
    accountId:{type:String,default:''},
    flat:{type:Object,default:null}
  },
  computed: {
    addr_type2(){//0-прописки, 1-проживания, 2-доставки счетов
      if(!this.account?.vgroups?.[0]||!this.agreement){return ""};
      const addresses=this.account.vgroups.find(service=>service.agrmid==this.agreement.agrmid&&service.addresses.find(address=>address?.type==2))?.addresses||[];
      const addr_type2=addresses?.find(address=>address?.type==2)?.address;
      return addr_type2||''
    },
    computedAddress() {
      if (!this.account) return "";
      if (this.agreement) {
        const service = this.account.vgroups.find((s) => s.agrmid == this.agreement.agrmid && s.connaddress);
        if (service) return service.vgaddress || service.connaddress;
      }
      let address = {};
      if (Array.isArray(this.account.addresses)) {
        address = this.account.addresses.find((a) => a.address) || {};
      }
      return this.account.address || address.address || "";
    },
    formatedAddress(){
      const address=this.addr_type2||this.computedAddress;
      if(!address){return ''};
      return address.split(',').map(elem=>elem.trim()).filter(v=>v).join(", ")
    },
    balance(){
      const {balance}=this.agreement;
      return `${balance.minus?'-':''}${balance.integer}.${balance.fraction} ₽`;
    },
    lastPayText(){
      const lastsum=this.agreement.lastsum||'';
      const lastpaydate=this.agreement.lastpaydate||'';
      return `${lastsum} ${lastsum?'₽':''} ${lastpaydate?'•':''} ${lastpaydate}`;
    },
    phone(){return this.account.mobile||this.account.phone},
    balanceLabel(){return `Баланс (ЛС ${this.accountId})`},
    balanceLabelConvergent(){return `Баланс (+${this.agreement.convergentmsisdn})`},
  },
  methods: {
    openSendSmsModal() {
      this.$refs.sendSms.open();
    },
  },
});

Vue.component('task-main-account',{//add SendKionPq
  //template:'#task-main-account-template',
  template:`<div>
    <CardBlock>
      <title-main :text="task.tasktype" icon="task">
        <div class="display-flex align-items-center" style="padding-right: 12px;">
          <span class="tone-900" style="white-space: nowrap; padding-right: 8px;">{{ task.Assignment }}</span>
          <span class="ic-20 ic-timer tone-500"></span>
        </div>
      </title-main>

      <info-subtitle>
        <span>
          <span v-if="operationIcons.tv" class="ic-16 ic-tv"></span>
          <span v-if="operationIcons.internet" class="ic-16 ic-eth"></span>
          <span v-if="operationIcons.phone" class="ic-16 ic-sim"></span>
          <span v-if="operationIcons.any"> • </span>
          <span>{{ task.NumberOrder }}</span>
        </span>
      </info-subtitle>

      <devider-line />
      <link-block :text="task.Number_EIorNumberOrder+' (СЗ)'" type="medium" actionIcon="copy" @click="copy(task.Number_EIorNumberOrder)"/>

      <devider-line />
      <link-block :text="task.clientNumber+' (ЛС)'" @click="copy(task.clientNumber)" type="medium" actionIcon="copy"/>

      <devider-line />
      <info-text-sec title="Описание работ" :rows="[task.ProductOffering]" :text="task.description||'нет описания работ'"/>

      <devider-line />
      <link-block icon="task-status" :text="task.status" :actionIcon="hasBf?'right-link':'-'" @block-click="slideToEntrance" type="medium">
        <div slot="postfix" class="display-flex gap-4px main-orange" v-if="hasBf">
          <div>
            <span class="ic-20 ic-warning"></span>
          </div>
          <span class="font-size-14px">Блок-фактор</span>
        </div>
      </link-block>
    </CardBlock>

    <CardBlock>
      <title-main :text="task.customer" icon="person" style="text-transform: capitalize;" />
      <account-call :phone="task.ContactPhoneNumber" :descr="task.customer" showSendSms/>
      <SendKionPq :phones="[task.ContactPhoneNumber]" :account="task.clientNumber"/>
      <info-list icon="timer" :text="task.Appointment" comment="(ожидания клиентом)" />
    </CardBlock>

    <CardBlock>
      <title-main :text="site?.address||task.AddressSiebel" class="mt-8">
        <button-sq type="large" icon="pin" @click="toMap"/>
      </title-main>
      <info-list icon="apartment" v-if="entrance" :text="titleEntranceFloorFlat"/>
      <devider-line />
      <link-block icon="du" :text="site?.node||task.siteid" :search="site?.node||task.siteid" type="medium" />
      <link-block icon="home" actionIcon="expand" text="Инфо по площадке и доступу" @block-click="open_modal_site_info" type="medium" />
    </CardBlock>

    <modal-container ref="modal_site_info">
      <SiteNodeDetails :siteNode="site"/>
    </modal-container>
  </div>`,
  props:{
    task:{type:Object,required:true},
  },
  data:()=>({
    site:null,
    entrances:[],
    entrance:null,
  }),
  computed:{
    hasBf(){return false //заглушка до вывода 172
      if(!this.entrance){return};//return true
      return Object.values(this.entrance?.blocks||{}).some(b=>b);
    },
    flat() {
      let i = this.task.AddressSiebel.search(/кв\./gi);
      if (i == -1) return 0;
      let flat = this.task.AddressSiebel.substring(i + 4).replace(/\D/g, '');
      return Number(flat);
    },
    floor() {
      if (!this.entrance || !this.flat) return '';
      const floors = this.entrance.floor;
      const floor = floors.find(el => el.first <= this.flat && el.last >= this.flat);
      if (floor) return floor.number;
      return ''
    },
    titleEntranceFloorFlat(){
      let str=[];
      if(this.entrance.id){str.push('подъезд '+this.entrance.number)};
      if(this.floor){str.push('этаж '+this.floor)};
      if(this.flat){str.push('кв '+this.flat)};
      return str.join(' • ');
    },
    operationIcons() {
      const { service } = this.task;
      if (!Array.isArray(service)) return {};
      const hasInternet = service.includes('internet');
      const hasTv = service.includes('tv');
      const hasPhone = service.includes('phone');
      return {
        any: hasInternet || hasTv || hasPhone,
        internet: hasInternet,
        tv: hasTv,
        phone: hasPhone
      }
    },
  },
  created(){
    this.getSite();
    this.getEntrances();
  },
  methods:{
    slideToEntrance(){
      if(!this.hasBf){return};
      this.$emit('slide-to',{name:'entrance'});
    },
    async getSite(){
      let cache=this.$cache.getItem(`search_ma/${this.task.siteid}`);
      if(cache){
        this.getNode(cache);
        return;
      };
      try{
        let response=await httpGet(buildUrl("search_ma",{pattern:this.task.siteid},"/call/v1/search/"));
        if(response.type==='error'){throw new Error(response.message)};
        this.$cache.setItem(`search_ma/${this.task.siteid}`,response.data);
        this.getNode(response.data);
      }catch(error){
        console.warn('search_ma:site.error',error);
      };
    },
    getNode(response){
      if(Array.isArray(response)){
        this.site=response.find(({type})=>type.toUpperCase()==='ДУ')||response[0];
      }else{
        this.site=response;
      }
    },
    async getEntrances(){
      let cache=this.$cache.getItem(`site_entrance_list/${this.task.siteid}`);
      if(cache){this.getEntrance(cache);return;};
      try {
        let response=await httpGet(buildUrl('site_entrance_list',{site_id:this.task.siteid},'/call/v1/device/'));
        if(response.type==='error'){throw new Error(response.message)};
        if(!response.length){response=[]};
        this.$cache.setItem(`site_entrance_list/${this.task.siteid}`,response);
        this.getEntrance(response);
      }catch(error){
        console.warn('site_entrance_list.error',error);
      }
    },
    getEntrance(response){
      this.entrances=Array.isArray(response)?response:[];
      this.entrance=this.entrances.find(entrance=>this.flat>=entrance.flats.from&&this.flat<=entrance.flats.to);
      this.setEntranceSlide();
    },
    setEntranceSlide() {
      this.$emit('set:header',{
        component:'task-entrance',
        title:this.entrance?`Подъезд № ${this.entrance.number}`:(this.entrances&&this.entrances.length)?'Все подъезды':'Подъезды',
        subtitle:this.entrance?`кв ${this.entrance.flats.range}`:(this.entrances&&this.entrances.length)?`1 - ${this.entrances.length}`:'отсутствуют'
      });
    },
    copy(text){
      copyToBuffer(text,()=>console.log('Copied:',text));
    },
    open_modal_site_info(){
      this.$refs.modal_site_info.open();
    },
    toMap(){
      if(!this.site){return};
      this.$router.push({
        name:'map',
        query:{
          lat:this.site?.coordinates?.latitude,
          long:this.site?.coordinates?.longitude,
        },
      });
    },
  },
});
