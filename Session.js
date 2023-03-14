//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/Session.js',type:'text/javascript'}));

Vue.component('session-el',{//redesign, need .padding-unset or create custom table
  //template:'#session-el-template',
  template:`<section>
    <loader-bootstrap v-if="loads.get_online_sessions" text="получение сессии абонента"/>
    <loader-bootstrap v-else-if="loads.stop_session_radius" text="сброс сессии абонента"/>
    <div v-else-if="session" class="margin-left-16px margin-right-16px display-flex flex-direction-column gap-4px">
      
      <message-el :text="!start?'Оффлайн':('Онлайн c '+startLocal)" :type="!start?'warn':'success'" box/>

      <div v-if="sessionid" class="display-flex align-items-center justify-content-center">
        <span class="font-size-12px">{{sessionid}}</span>
      </div>
      
      <div class="display-flex flex-direction-column">
        <info-value v-if="ip" class="padding-unset" label="IP" :value="ip" withLine data-ic-test="session_ip"/>
        <info-value v-if="macIsValid" class="padding-unset" label="MAC" :value="mac" withLine data-ic-test="session_mac"/>
        <info-text-sec v-if="macVendor" class="padding-unset" :text="macVendor"/>
        <info-value v-if="port" class="padding-unset" label="Agent Circuit ID" :value="AgentCircuitID" withLine />
        <info-value v-if="device" class="padding-unset" label="Agent Remote ID" :value="AgentRemoteID" withLine />
        <info-text-sec v-if="deviceMacVendor" class="padding-unset" :text="deviceMacVendor"/>
        <info-value v-if="nas" class="padding-unset" label="BRAS" :value="nas" withLine data-ic-test="session_nas"/>
      </div>

      <div class="display-flex justify-content-space-between gap-4px margin-bottom-8px">
        <button-main @click="openSessionHistory" button-style="outlined" :disabled="false" icon="history" label="История" loading-text="" size="large" data-ic-test="session_history_btn" />
        <button-main @click="stop_session_radius" button-style="outlined" :disabled="!start" icon="refresh" label="Сброс" loading-text="" size="large" data-ic-test="session_reset_btn" />
        <button-main @click="openAuthLogs" button-style="outlined" :disabled="false" icon="log" label="Логи" loading-text="" size="large" data-ic-test="session_logs_btn" />
      </div>
      
      <session-history-modal ref="sessionHistory" :session="session" :params="params"/>
      <session-logs-modal ref="sessionLogs" :session="session" :params="params"/>

    </div>
  </section>`,
  props:{
    params:{type:Object,required:true},
  },
  data:()=>({
    resps:{
      get_online_sessions:null,
      stop_session_radius:null
    },
    loads:{
      get_online_sessions:false,
      stop_session_radius:false
    },
    ouis:{},
  }),
  watch:{
    'mac'(mac){
      if(mac&&this.macIsValid){this.getMacVendorLookup(mac)};
    },
    'deviceMac'(deviceMac){
      if(deviceMac){this.getMacVendorLookup(deviceMac)};
    },
  },
  created(){ 
    this.get_online_sessions() 
  },
  computed:{
    loading(){return Object.values(this.loads).some(v=>v)},
    session(){return this.resps.get_online_sessions?.data?.[0]||this.resps.get_online_sessions},
    device(){return this.session?.device||''},
    deviceStr(){return `${this.device||''}`},
    deviceMac(){return ((this.deviceStr.match(/^[a-f0-9]{12}$/gi)?.[0]||'').match(/.{4}/gi)||[]).join('.')},
    AgentRemoteID(){
      const {deviceStr,deviceMac}=this;
      if(deviceMac){//30150037478 - default format
        return deviceMac;
      };
      const isNotHex=/\W/i.test(deviceStr);
      if(isNotHex){//10702046999 - ascii format
        return deviceStr
      };
      return deviceStr.match(/.{2}/gi).map(b=>{
        b=b.padStart(2,0);
        try{//60910533888 - custom format
          return unescape('%'+b);
        }catch(error){
          return b
        };
      }).join('');
    },
    ip(){return this.session?.ip||''},
    mac(){return this.session?.mac||''},
    nas(){return this.session?.nas||''},
    port(){return this.session?.port||''},
    AgentCircuitID(){return `${this.port||''}`},
    sessionid(){return this.session?.sessionid||''},
    start(){return this.session?.start||''},
    startLocal(){return !this.start?'':new Date(Date.parse(this.start+' GMT+0300')).toLocaleString()},
    macIsValid(){return this.mac&&this.mac!=='0000.0000.0000'},
    macVendor(){return this.ouis[this.mac]},
    deviceMacVendor(){return this.ouis[this.deviceMac]},
  },
  methods:{
    async get_online_sessions(){
      this.resps.get_online_sessions=null;
      this.loads.get_online_sessions=true;
      const {params}=this;
      try{
        const response=await httpGet(buildUrl('get_online_sessions',params,'/call/aaa/'))
        this.resps.get_online_sessions=response;
      }catch(error){
        console.warn("get_online_sessions.error",error);
      };
      this.loads.get_online_sessions=false;
    },
    async stop_session_radius(){
      this.resps.stop_session_radius=null;
      this.loads.stop_session_radius=true;
      const {serverid,agentid,vgid,login,descr}=this.params;
      const {sessionid,dbsessid,nas}=this.session;
      try{
        const response=await httpGet(buildUrl('stop_session_radius',{serverid,agentid,vgid,login,descr,sessionid,dbsessid,nasip:nas},'/call/aaa/'));
        if(response.message=='OK'){
          this.session=null;
          setTimeout(this.get_online_sessions,10000);
        };
        this.resps.stop_session_radius=response;
      }catch(error){
        console.warn("stop_session_radius.error",error);
      };
      this.loads.stop_session_radius=false;
    },
    openSessionHistory() {
      this.$refs.sessionHistory.open();
    },
    openAuthLogs() {
      this.$refs.sessionLogs.open();
    },
    getOnlineSession(){//public
      this.get_online_sessions()
    },
    async getMacVendorLookup(mac=''){
      if(!mac){return};
      const ouis=await this.test_getMacVendorLookup([mac]);
      this.ouis={...this.ouis,...ouis};
    },
  }
});

Vue.component('session-history-modal',{//fix params, need create custom table
  //template:'#session-history-template',
  template:`<modal-container-custom ref="sessionHistory">
    <div class="mx-auto mt-8 w-75">
      <h3 class="font--18-600 tone-900 d-center-x mb-8">История сессий</h3>
      <h5 class="font--13-500-140 tone-500 text-center m-auto">Выберите временной промежуток</h5>
    </div>
    <div>
      <div class="mx-16">
        <div class="d-center-x py-16">
          <input-el :value="history.start" label="Начало" type="date"  v-model="history.start" class="mr-8" data-ic-test="session_history_date_from"/>
          <input-el :value="history.end" label="Конец" type="date" v-model="history.end" class="ml-8" data-ic-test="session_history_date_to"/>
        </div>
        <button-main @click="get_sessions" :disabled="loading" label="Загрузить" :loading="loading" size="full" buttonStyle="contained" data-ic-test="session_history_load_btn" />
        <device-params-item-history v-if="history.data?.length" :paramDays="sessions" :item="{param:'traffic',unit:'Gb',valueUnit:'Gb'}" :limit="sessions?.length" chartStyle="border:1px solid #e4e3e3;border-radius:5px;"/>
      </div>
      <template v-for="entry in history.data">
        <devider-line></devider-line>
        <div>
          <div class="font--13-500-140 tone-900 px-16"> {{ entry.start }} <span class="tone-500"> • </span> {{ entry.end || "-" }}</div>
          <div class="font--13-500-140 tone-900 px-16"> {{ entry.elapsed || "-" }} <span class="tone-500"> • </span> {{ entry.bytes }} </div>
          <info-value label="IP" :value="entry.ip" type="large" withLine data-ic-test="session_history_ip"></info-value>
          <info-value label="MAC" :value="entry.mac" type="large" withLine data-ic-test="session_history_mac"></info-value>
          <info-value label="BRAS" :value="entry.nas" type="large" withLine></info-value>
          <info-value label="Тип трафика" :value="entry.catdescr" type="large" withLine></info-value>
        </div>
      </template>
    </div>
    <div class="px-16" v-if="Array.isArray(history.data) && history.data.length == 0">
      <message-el :text="message.text" :box="true" :type="message.type"></message-el>
    </div>
  </modal-container-custom>`,
  props:{
    session:{type:Object,required:true},
    params:{type:Object,required:true},
  },
  data(){
    const formatDate=(date,day=0)=>{date.setDate(date.getDate()-day);return date.toLocaleDateString().split('.').reverse().join('-')}
    return {
      history:{
        data:null,
        start:formatDate(new Date(),5),
        end:formatDate(new Date())
      },
      loading:false,
    };
  },
  computed:{
    sessions(){
      return Object.values((this.history.data||[]).reduceRight((sessions,session)=>{
        const {bytes='',start='',elapsed=''}=session;
        let {end=''}=session;
        const [valueInUnits='0',units='']=bytes.split(' ');
        const valueInt=parseInt(valueInUnits)||0;
        const value={Kb:valueInt*1000,Mb:valueInt*1000000,Gb:valueInt*1000000000}[units]||valueInt;

        const [date='',time='']=start.split(' ');

        if(!end&&elapsed){//2-041-0091100 - elapsed вместо end //"11ч 56м 21с"//"21м 20с"//"1ч "
          const {sec=0,min=0,hor=0}=elapsed.split(' ').reduce((hms,item)=>Object.assign(hms,{[item.includes('ч')?'hor':item.includes('м')?'min':item.includes('с')?'sec':'?']:parseInt(item)||0}),{sec:0,min:0,hor:0});
          const [DD=0,MM=0,YYYY=0]=date.split('.');
          const session_start_MMDDYYYY=[[MM,DD,YYYY].join('.'),time].join(' ');
          end=new Date(Date.parse(session_start_MMDDYYYY||0)+(sec+min*60+hor*3600)*1000);
          end=[[`${end.getDate()}`,`${end.getMonth()+1}`,`${end.getFullYear()}`].map(n=>n.padStart(2,0)).join('.'),[`${end.getHours()}`,`${end.getMinutes()}`].map(n=>n.padStart(2,0)).join(':')].join(' ');
        };

        const sessions_on_date=sessions[date];
        return Object.assign(sessions,{
          [date]:{
            date,
            start:sessions_on_date?.start||start,
            end,
            valuesRow:[
              ...sessions_on_date?.valuesRow||[],
              {value,units:'bytes',title:bytes},
            ]
          }
        });
      },{}));
    },
    message(){
      const {start,end}=this.history;
      if(start==end){
        return {type:'info',text: `Завершенных сессий ${start} нет`}
      };
      if(new Date(start)>new Date(end)){
        return {type:'warn',text:'Выбраны неверные даты'}
      };
      return {type:'info',text:'Завершенных сессий в указанный период нет'}
    },
  },
  methods:{
    open(){//public
      this.$refs.sessionHistory.open();
    },
    async get_sessions(){
      this.loading=true;
      this.history.data=null;
      const {sessionid}=this.session;
      const {login,serverid,vgid,descr}=this.params;
      let {start:dtfrom,end:dtto}=this.history;
      try{
        const response=await httpGet(buildUrl('get_sessions',{sessionid,login,serverid,vgid,descr,dtfrom,dtto},'/call/aaa/'));
        this.history.data=response?.rows||[];
      }catch(error){
        console.warn('get_sessions.error',error);
      };
      this.loading=false;
    },
  }
});
Vue.component('session-logs-modal', {//fix params, need create custom table
  //template: '#session-logs-template',
  template:`<modal-container ref='sessionLogs'>
    <div class="mx-auto mt-8 w-75">
      <h3 class="font--18-600 tone-900 d-center-x mb-8">
        Логи авторизации
      </h3>
    </div>
    <div>

      <div>
        <div class='d-center-x px-16 py-16'>
          <input-el :value='logs.date' label='Дата' type='date'  v-model='logs.date'/>
        </div>

        <div class='px-16 pb-16'>
          <button-main @click="load" :disabled="loading" label='Загрузить' :loading='loading' size='full' buttonStyle='contained'></button-main>
        </div>
      </div>
      <template v-if='logs.data' v-for="entry in logs.data">
        <devider-line></devider-line>
        <div class='py-16'>
          <div class='font--13-500-140 tone-900 px-16'> {{ entry.log }} ({{ entry.count }})</div>
          <info-value :label='entry.enter_login' :value='entry.last' type='large' withLine></info-value>
          <info-value label='MAC' :value='entry.mac' type='large' withLine></info-value>
          <info-value label='BRAS' :value='entry.nas' type='large' withLine></info-value>
        </div>
      </template>
    </div>

    <div class='px-16' v-if="Array.isArray(logs.data) && logs.data.length == 0">
      <message-el :text="'Авторизаций '+logs.date+' не было'" :box='true' type='info'></message-el>
    </div>
  </modal-container>`,
  props: {
    session:{type:Object,required:true},
    params:{type:Object,required:true},
  },
  data: function () {
    const formatDate = (date) => date.toLocaleDateString().split('.').reverse().join('-');
    return {
      logs: {
        data: null,
        date: formatDate(new Date())
      },
      loading: false,
    };
  },
  methods: {
    // public
    open() {
      this.$refs.sessionLogs.open();
    },

    load: function () {
      this.loading = true;
      this.logs.data = null;
      const {login,serverid,vgid,descr}=this.params;
      httpGet(buildUrl('get_radius_log',{login,serverid,vgid,descr,date:this.logs.date}, '/call/aaa/')).then(data => {
        this.logs.data = data.rows;
        this.loading = false;
      }).catch(e => {
        console.error(e)
        this.loading = false;
      });
    }
  }
});

