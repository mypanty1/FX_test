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
  template:`<div name="SendKionPq" v-if="(resps_getPq||loads_getPq)&&phonesValid.length" class="send-kion-pq background-color-d1dfed display-flex flex-direction-column gap-2px margin-left-right-16px margin-top-bottom-8px border-radius-8px padding-4px">
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




