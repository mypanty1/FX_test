
Vue.component('LocalNotes',{
  template:`<div name="LocalNotes" class="display-flex gap-4px">
    <IcTextArea :ictextareaid="noteKey" placeholder="мои заметки к наряду" :rows="rows" v-model="text"/>
    <div class="display-flex flex-direction-column align-items-center gap-4px">
      <button-sq @click="clear" class="size-20px min-width-20px">
        <IcIcon :name="loading?'loading rotating':'contract-off'" color="#5642BD" size="16"/>
      </button-sq>
      <button-sq @click="copy" class="size-20px min-width-20px">
        <IcIcon name="copy" color="#5642BD" size="16"/>
      </button-sq>
    </div>
  </div>`,
  props:{
    id:{type:[Number,String],required:true},
    rows:{type:[String, Number],default:3}
  },
  data:()=>({
    text:'',
    loading:false
  }),
  created(){
    this.init();
  },
  watch:{
    'text'(text){
      localStorage.setItem(this.noteKey,text);
    }
  },
  computed:{
    noteKey(){return `note-${this.id}`}
  },
  methods:{
    init(){
      this.text=localStorage.getItem(this.noteKey)||'';
    },
    async clear(){
      this.loading=true;
      this.$el.querySelector(`[ictextareaid="${this.noteKey}"] textarea`)?.scrollTo({top:1111});
      for(const i of this.text) {
        if(!this.text.length){break};
        this.text=this.text.slice(0,-1);
        await new Promise(resolve=>setTimeout(resolve,1));
      };
      this.loading=false;
    },
    copy(){
      copyToBuffer(this.text);
    },
  },
});


//add LocalNotes
Vue.component('WfmTaskItem',{
  template:`<li name="WfmTaskItem" :class="itemClass">
    <title-main :icon="taskIconClass" @open="opened=!opened" :text="taskType.title" :text2="task.Appointment" :text2Class="redTime">
      <button-sq icon="right-link" @click="goToTask"/>
    </title-main>
    <div class="font--13-500 padding-left-16px">{{task.AddressSiebel}}</div>
    <devider-line/>

    <transition v-if="opened" name="slide-down" mode="out-in" appear>
      <div>
        <div class="padding-left-16px">
          <span class="font--13-500 tone-500">{{task.NumberOrder}}</span>
          <span v-if="operationIcons.any" class="font--13-500 tone-500"> • </span>
          <span v-if="operationIcons.tv" class="ic-16 ic-tv tone-500"></span>
          <span v-if="operationIcons.internet" class="ic-16 ic-eth tone-500"></span>
          <span v-if="operationIcons.phone" class="ic-16 ic-sim tone-500"></span>
        </div>
        <div class="padding-left-16px">
          <span class="font--13-500 tone-500">{{task.Number_EIorNumberOrder}}</span>
        </div>
        <devider-line/>

        <LocalNotes :id="task.NumberOrder" class="margin-left-right-16px"/>
        <devider-line m="2px 0px 8px 0px"/>
      </div>
    </transition>

    <link-block :icon="taskStatus.icon" :text="task.status" :text2="task.Assignment" textClass="white-space-pre" :actionIcon="hasBf?' ic-20 ic-warning main-orange':''" type="medium">
      <div slot="postfix" v-if="hasBf" class="font--13-500 main-orange">Блок-фактор</div>
    </link-block>
  </li>`,
  props:{
    task:{type:Object,required:true},
  },
  data:()=>({
    opened:false,
    detailIncident:null,
    entrance:null,
  }),
  computed: {
    taskType() {
      return WFM_TASK_TYPES_BY_ID.find(el => el.name === this.task.tasktype) || {};
    },
    taskStatus() {
      return WFM_TASK_STATUSES.find(el => el.name === this.task.status) || {};
    },
    taskIconClass() {
      if (!this.taskType) return null;
      const ICONS = ['incident', 'warning'];
      const index = this.checkTypeGroups();
      const icon = ICONS[index] || this.taskType.icon;
      return `${icon} ${{0:'main-red',1:'main-orange'}[index]} ${index}`;
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
    times() {
      const { Assignment, Appointment } = this.task;
      const dateAssignment = new Date(this.task.dateAssignment);
      const now = new Date().getTime();
      const now10min = new Date().setMinutes(new Date().getMinutes() + 10);
      const parseTime = (timeRange) => {
        const [start = '', end = ''] = timeRange.split('-');
        const [startHours, startMinutes] = start.split(':');
        const [endHours, endMinutes] = end.split(':');
        return {
          start: new Date(dateAssignment).setHours(startHours, startMinutes),
          end: new Date(dateAssignment).setHours(endHours, endMinutes)
        }
      }
      return {
        assignment: parseTime(Appointment),
        appointment: parseTime(Assignment),
        now,
        now10min
      }
    },
    redTime() {
      const validStatusIds = ['sent', 'preSent'];
      const validStatus = this.taskStatus && validStatusIds.includes(this.taskStatus.id);
      const now = new Date().getTime();
      const timeOut = now >= this.times.assignment.start;
      return validStatus && timeOut ? 'main-red' : null;
    },
    itemClass() {
      const validStatusIds = ['done', 'resolved'];
      const validStatus = this.taskStatus && validStatusIds.includes(this.taskStatus.id);
      return {
        'tasks-list__item': true,
        'tasks-list__item--closed': validStatus,
      }
    },
    site_id(){return this.task.siteid},
    flat() {
      let i = this.task.AddressSiebel.search(/кв\./gi);
      if (i == -1) return 0;
      let flat = this.task.AddressSiebel.substring(i + 4).replace(/\D/g, '');
      return Number(flat);
    },
    hasBf(){
      if(!this.entrance){return};//return true
      return getHasBfByEntrance(this.entrance);
    },
  },
  created() {
    //this.getBfBySiteId();
    this.getEntrances();
  },
  methods:{
    async getEntrances(){
      const {site_id}=this;
      if(!site_id){return}
      let cache=this.$cache.getItem(`site_entrance_list/${site_id}`);
      if(cache){
        this.getEntrance(cache);
        return;
      };
      try {
        let response=await httpGet(buildUrl('site_entrance_list',{site_id},'/call/v1/device/'));
        if(response.type==='error'){throw new Error(response.message)};
        if(!response.length){response=[]};
        this.$cache.setItem(`site_entrance_list/${site_id}`,response);
        this.getEntrance(response)
      }catch(error){
        console.warn('site_entrance_list.error',error);
      }
    },
    getEntrance(response=[]){
      this.entrance=response.find(entrance=>this.flat>=entrance.flats.from&&this.flat<=entrance.flats.to);
    },
    goToTask(){
      this.$router.push({
        name:'wfm-task',
        params:{
          id:this.task.NumberOrder
        }
      })
    },
    async loadDetailIncident(){
      const incidentId=this.task.Number_EIorNumberOrder;
      if(!incidentId||!this.taskType||!this.taskType.identity){return};
      let response=this.$cache.getItem(`incident_detail/${incidentId}`);
      if(response){this.detailIncident=response;return};
      try{
        response=await httpGet(buildUrl('get_detail_incident',{
          incident_id:incidentId,
          incident_type:this.taskType.identity,
        },'/call/device/'));
        if(response.type==='error'){throw new Error(response.message)};
        this.$cache.setItem(`incident_detail/${incidentId}`,response);
        this.detailIncident=response;
      }catch(error){
        console.error('Load defails incident:',error);
      }
    },
    checkTypeGroups() {
      const idGroup1 = ['accident', 'incident', 'work', 'ppr'];
      const idGroup2 = ['connection', 'service'];
      const taskTypeId = this.taskType.id;
      if (idGroup1.includes(taskTypeId)) {
        return this.checkTypeGroup1();
      }
      if (idGroup2.includes(taskTypeId)) {
        return this.checkTypeGroup2();
      }
      return null;
    },
    checkTypeGroup1() {
      if (!this.detailIncident) return;
      let index;
      let deadline;
      if (this.detailIncident.hasOwnProperty('deadline')) {
        deadline = this.detailIncident.deadline;
      }
      if (this.detailIncident.hasOwnProperty('deadlinesla')) {
        deadline = this.detailIncident.deadlinesla;
      }
      if (!deadline) return;
      const isWarn = this.times.now >= new Date(deadline).getTime();
      if (isWarn) index = 0;
      const isFire = this.times.now10min >= deadline;
      if (isFire) index = 1;
      return index;
    },
    checkTypeGroup2() {
      let index;
      const { assignment, appointment, now, now10min } = this.times;
      // #INFO: время начала Assignment > время окончания Appointment - выполнение начато с опозданием, есть риск для следующего наряда
      const lateTime = assignment.start > appointment.end;
      // #INFO: или время начала Appointment > время начала Assignment - в большинстве случаев это значит что наряд назначен руками(ему можно понизить приоритет выполнения если это не МИ)
      const lateTime2 = appointment.start > assignment.start;
      // #INFO: или если текущее время > время окончания Assignment - выполнение затянулось, есть риск для следующего наряда
      const lateTime3 = now > assignment.end;
      const isWarn = lateTime || lateTime2 || lateTime3;
      if (isWarn) index = 0;

      if (!this.taskStatus) return index;
      const validIdStatuses = ['sent', 'preSent'];
      const isValidStatus = validIdStatuses.includes(this.taskStatus.id);
      if (!isValidStatus) return;
      const isFire = now10min >= appointment.start;
      if (isFire) index = 1;
      return index;
    }
  },
  mounted(){
    this.loadDetailIncident();
  }
});

//add SendKionPq and LocalNotes and SibelServiceRequest and SibelServiceRequests
Vue.component('task-main-account',{
  template:`<div>
    <CardBlock>
      <title-main :text="task.tasktype" icon="task">
        <div class="display-flex align-items-center" style="padding-right: 12px;">
          <span class="tone-900" style="white-space: nowrap; padding-right: 8px;">{{ task.Assignment }}</span>
          <span class="ic-20 ic-timer tone-500"></span>
        </div>
      </title-main>

      <div class="font--13-500 tone-500 padding-left-16px">
        <span v-if="operationIcons.tv" class="ic-16 ic-tv"></span>
        <span v-if="operationIcons.internet" class="ic-16 ic-eth"></span>
        <span v-if="operationIcons.phone" class="ic-16 ic-sim"></span>
        <span v-if="operationIcons.any"> • </span>
        <span>{{task.NumberOrder}}</span>
      </div>
      <devider-line/>

      <SibelServiceRequest :srNumber="task.Number_EIorNumberOrder" class="margin-left-right-16px"/>
      <devider-line/>

      <div class="margin-left-right-16px">
        <link-block :text="'ЛС '+task.clientNumber" @click="copy(task.clientNumber)" type="medium" actionIcon="copy" class="padding-unset"/>
      </div>
      <devider-line/>

      <info-text-sec title="Описание работ" :rows="[task.ProductOffering]" :text="task.description||'нет описания работ'"/>
      <devider-line/>

      <template v-if="task.clientNumber!='Потенциальный'">
        <SibelServiceRequests :agrNumber="task.clientNumber" :srNumberCurrent="task.Number_EIorNumberOrder"/>
        <devider-line/>
      </template>
      
      <LocalNotes :id="task.NumberOrder" class="margin-left-right-16px"/>
      <devider-line m="2px 0px 8px 0px"/>
      <link-block icon="task-status" :text="task.status" :actionIcon="hasBf?'right-link':'-'" @block-click="slideToEntrance" type="medium">
        <div slot="postfix" class="display-flex gap-4px main-orange" v-if="hasBf">
          <div>
            <span class="ic-20 ic-warning"></span>
          </div>
          <span class="font-size-14px">Блок-фактор</span>
        </div>
      </link-block>

      <template v-if="favBtnProps">
        <devider-line/>
        <FavBtnLinkBlock v-bind="favBtnProps"/>
      </template>
    </CardBlock>

    <CardBlock>
      <title-main :text="task.customer" icon="person" style="text-transform: capitalize;" />
      <account-call :phone='task.ContactPhoneNumber' :descr="task.customer" showSendSms/>
      <SendKionPq :phones="[task.ContactPhoneNumber]" :account="task.clientNumber"/>
      <info-list icon="timer" :text="task.Appointment" comment="(ожидания клиентом)" />
    </CardBlock>

    <CardBlock>
      <title-main :text="site?.address||task.AddressSiebel" class="margin-top-8px">
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
    favBtnProps(){
      if(!this.task){return};
      const {NumberOrder,Number_EIorNumberOrder,tasktype,AddressSiebel}=this.task;
      return {
        title:`${tasktype} ${AddressSiebel}`,
        name:NumberOrder,
        id:Number_EIorNumberOrder,
        descr:objectToTable(filterKeys(this.task,{
          NumberOrder           :'Наряд',
          tasktype              :'Тип',
          Number_EIorNumberOrder:['СЗ/MSK','-'],
          OperationConcatenation:['Операции','-'],
          AddressSiebel         :['Адрес','-'],
          customer              :['Абонент','-'],
          clientNumber          :['ЛС','-'],
          ContactPhoneNumber    :['Тлф','-'],
          ...tasktype!=='АВР'?{
            ProductOffering     :['Продукт','-']
          }:null,
        })),
      }
    },
    hasBf(){
      if(!this.entrance){return};//return true
      return getHasBfByEntrance(this.entrance);
    },
    flat(){
      const flat_i=this.task.AddressSiebel.search(/кв\./gi);
      return flat_i==-1?0:Number(this.task.AddressSiebel.substring(flat_i+4).replace(/\D/g,''));
    },
    floor(){
      if(!this.entrance||!this.flat){return ''};
      const floor=(this.entrance.floor||[]).find(({first,last})=>first<=this.flat&&last>=this.flat);
      return floor?floor.number:'';
    },
    titleEntranceFloorFlat(){
      return [
        this.entrance?.id?`подъезд ${this.entrance.number}`:'',
        this.floor?`этаж ${this.floor}`:'',
        this.flat?`кв ${this.flat}`:''
      ].filter(v=>v).join(' • ');
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
      copyToBuffer(text);
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

//add SendKionPq and SibelServiceRequests
Vue.component("LbsvAccountMain300523", {
  template:`<CardBlock name="LbsvAccountMain300523" v-if="account">
    <title-main>
      <div slot="prefix">
        <!--<span class="ic-20 ic-status" :class="!agreement.closedon?'main-green':'main-red'"></span>-->
        <IcIcon name="status" :class="!agreement.closedon?'main-green':'main-red'"/>
      </div>
      <span slot="text" class="display-flex align-items-center gap-5px">
        <span>{{accountId}}</span>
        <span v-if="agreement?.closedon" class="font--12-400 tone-500">расторгнут {{agreement.closedon}}</span>
        <span v-if="!!msisdn&&!agreement?.closedon" class="lbsv-account__convergent">Конвергент</span>
      </span>
    </title-main>
    <devider-line/>
    <info-text-icon icon="" :text="formatedAddress" type="medium"/>
    <devider-line/>
    <title-main icon="person" :text="account.name" textClass="text-transform-capitalize"/>
    <div v-if="agreement && phone === msisdn">
      <account-call v-if="!!msisdn" :phone="msisdn" :isConvergent="!!msisdn" class="margin-bottom-16px" showSendSms/>
    </div>
    <div v-else>
      <account-call v-if="!!msisdn" :phone="msisdn" :isConvergent="!!msisdn" class="margin-bottom-16px" showSendSms/>
      <account-call v-if="phone" :phone="phone" class="margin-bottom-16px" showSendSms/>
    </div>
    
    <SendKionPq :phone="phone" :phones="[account?.mobile,account?.phone,msisdn]" :account="agreement?.account||accountId"/>
    
    <devider-line v-if="agreement"/>
    <template v-if="agreement">
      <info-value icon="purse" :label="balanceLabel" :value="balance" :minus="agreement.balance.minus" type="extra"/>
      <info-value icon="purse" v-if="msisdn && convergentBalance" :label="balanceLabelConvergent" :value="convergentBalance+' ₽'" :minus="convergentBalance < 0" type="extra"/>
      <info-value icon="clock" v-if="agreement.lastpaydate" label="Платеж" :value="lastPayText" type="extra"/>
    </template>
    <devider-line/>
    <SibelServiceRequests :agrNumber="agreement?.account||accountId"/>
    <devider-line/>
    <link-block icon="sms" text="Смс с новым паролем" @block-click="openSendSmsModal" action-icon="expand"/>
    <send-sms-modal ref="sendSms" :account="accountId"/>
    <template v-if="favBtnProps">
      <devider-line/>
      <FavBtnLinkBlock v-bind="favBtnProps"/>
    </template>
  </CardBlock>`,
  props:{
    account:{type:Object,default:null},
    agreement:{type:Object,default:null},
    flatData:{type:Object,default:null},
    loading:{type:Object,required:true},
    billingInfo:{type:Array,default:()=>[]},
    //convergentBalance:{type:[String,Number],default:null},
    accountId:{type:String,default:''},
    flat:{type:Object,default:null}
  },
  data:()=>({
    msisdn:'',
    convergentBalance:null,
  }),
  created(){
    this.getConvergent();
  },
  computed: {
    favBtnProps(){
      if(!this.account||!this.agreement){return};
      const {agreement,agreement:{account},msisdn}=this;
      return {
        title:`Абонент ${truncateSiteAddress(this.formatedAddress).replace(/(, )/,',')}`,
        name:account,
        id:account,
        path:`/${account}`,//если открыт из наряда
        descr:[
          objectToTable(filterKeys(this.account,{
            '!1':['ЛС',account],
            name:'Абонент|-',
            mobile:['Тлф',(m,account)=>account.mobile||account.phone],
            '!2':['Конвергент',msisdn||'-']
          })),
          objectToTable(filterKeys(this.agreement,Object.values(agreement.services||{}).map(({vgroups=[]}={})=>vgroups||[]).flat().reduce((services,service)=>{
            if(!service||service.status=='10'){return services};
            services[service.vgid]=[`${service.serviceclassname} [${service.vgid}]`,`${([1,4,5,6].includes(service.billing_type)?`${service.login} `:'')}${service.agentdescr}`]
            return services;
          },{})))
        ].join('\n'),
      }
    },
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
    balanceLabelConvergent(){return `Баланс (+${this.msisdn})`},
  },
  methods: {
    openSendSmsModal() {
      this.$refs.sendSms.open();
    },
    async getConvergent(){
      await this.getMsisdn();
      if(this.msisdn){
        this.getConvergentBalance();
      };
    },
    async getMsisdn(){
      const {agreement:{account}={}}=this;
      if(!account){return};
      try{
        const response=await httpGet(buildUrl("get_user_phone",{agrm_num:account},"/call/sri/"));
        this.msisdn = response?.return?.indexOf('not found') === -1 ? response.return : '';
      }catch(error){
        console.warn("get_user_phone.error",error);
      };
    },
    async getConvergentBalance(){
      const {msisdn}=this;
      if(!msisdn){return};
      try{
        const response=await httpGet(buildUrl("convergent",{msisdn},"/call/v1/foris/"));
        this.convergentBalance=response.balance;
      }catch (error){
        console.warn("convergent.error",error);
      };
    },
  },
});

//siebel components
Vue.component("ServiceRequestCommentsModal", {
  template:`<modal-container-custom name="ServiceRequestCommentsModal" ref="modal" :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="padding-left-right-16px">
      <div class="display-flex flex-direction-column gap-8px">
        <div class="font--15-600 text-align-center">Комментарии к {{srNumber}}</div>
        
        <loader-bootstrap v-if="loading" text="получение сервисного запроса"/>
        <message-el v-else-if="!serviceRequestComments?.length" text="Нет комментариев" box type="info"/>
        <div v-else class="display-flex flex-direction-column">
          <template v-for="({id,createDate,text},index) of serviceRequestComments">
            <devider-line v-if="index"/>
            <info-text-sec :title="formatDate(createDate)" :text="text" :key="id" class="padding-unset"/>
          </template>
        </div>
      </div>
      <div class="margin-top-16px display-flex justify-content-space-around">
        <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="medium"/>
      </div>
    </div>
  </modal-container-custom>`,
  props:{
    srNumber:{type:String,required:true,default:''},
  },
  data:()=>({
    loading:false,
    serviceRequestComments:null,
  }),
  computed:{
    number(){
      let id=this.srNumber;
      if(id.length!==14){id=`1-${parseInt(id.match(/[0-9a-z]{8}/gi)?.[0],36)}`}
      return id.length==14?id:''
    },
  },
  methods:{
    open(links){//public
      this.$refs.modal.open();
      this.getServiceRequestComments();
    },
    close(){//public
      this.$refs.modal.close();
    },
    formatDate(value){
      const date=new Date(value);
      return (!value||!date||date=='Invalid Date')?'':date.toLocaleString();
    },
    async getServiceRequestComments(){
      const {number}=this;
      if(!number){return}
      const method='service_request_comments';
      const key=atok(method,number)
      const cache=this.$cache.getItem(key);
      if(cache){
        this.serviceRequestComments=cache;
        return;
      };
      this.loading=true;
      try {
        const response=await httpGet(buildUrl(method,{id:number},'/call/v1/siebel/'));
        if(Array.isArray(response)){
          this.$cache.setItem(key,this.serviceRequestComments=response);
        }
      }catch(error){
        console.warn('getServiceRequestComments.error',error);
      }
      this.loading=!true;
    },
  },
});

Vue.component('ServiceRequest',{
  template:`<div name="ServiceRequest" class="display-flex flex-direction-column gap-4px">
    <div class="display-flex align-items-center gap-4px justify-content-space-between">
      <div class="font--13-500 white-space-pre height-20px min-width-50px bg-main-lilac-light border-radius-4px padding-top-bottom-2px padding-left-right-3px">{{serviceRequest.status}}</div>
      <div class="display-flex align-items-center gap-4px">
        <div class="white-space-pre font--13-500">{{serviceRequest.number}}</div>
        <button-sq @click="copy" class="size-20px min-width-20px">
          <IcIcon name="copy" color="#5642BD" size="16"/>
        </button-sq>
      </div>
    </div>
    <div class="display-flex align-items-center gap-4px justify-content-space-between">
      <div class="white-space-pre font--13-500">{{dateStart}} - {{dateEnd}}</div>
      <button-main @click="$refs.ServiceRequestCommentsModal.open()" label="комментарии" buttonStyle="outlined" size="medium" class="height-24px padding-4px width-100px"/>
    </div>
    <ServiceRequestCommentsModal ref="ServiceRequestCommentsModal" :srNumber="serviceRequest.number"/>
    <div class="display-flex flex-direction-column">
      <info-value v-for="(value,label,key) in rows" :key="key" v-if="value" v-bind="{label,value}" class="padding-unset" type="large" withLine/>
    </div>
    <info-text-sec v-if="queueName" title="Запрос" :text="queueName" class="padding-unset"/>
    <info-text-sec v-if="description" title="Описание запроса" :text="description" class="padding-unset"/>
  </div>`,
  props:{
    serviceRequest:{type:Object,required:true,default:()=>({})},
  },
  computed:{
    dateStart(){return new Date(this.serviceRequest.createDate).toLocaleDateString()},
    dateEnd(){const {closeDate,dueDate,lastUpdateDate}=this.serviceRequest;return new Date(closeDate||dueDate||lastUpdateDate).toLocaleDateString()},
    queueName(){return this.serviceRequest.queueName},
    description(){return this.serviceRequest.description},
    rows(){
      return filterKeys(this.serviceRequest||{},{
        channel:              ['Тип обращения',(v,o)=>[...new Set([o.channel,o.type])].filter(v=>v).join('.')],//"Звонок",//"Жалоба",
        theme:                ['Тема'],//"Телевидение",
        subTheme:             ['Обращение'],//"ЦТВ: отсутствие сигнала",
        terminationReasonCode:['Код решения'],//"ЕИ",
        incidentType:         ['Тип действия'],//"Заявка ТБ",
        product:              ['Продукт'],//"Интернет+ЦТВ",
        ownerLogin:           ['Владелец СЗ'],//"REMEDY_WEB",
      })
    }
  },
  methods:{
    copy(){
      copyToBuffer(this.serviceRequest.number);
    }
  }
});

Vue.component('SibelServiceRequest',{
  template:`<div name="SibelServiceRequest">
    <loader-bootstrap v-if="loading" text="получение сервисного запроса"/>
    <template v-else-if="serviceRequest">
      <div class="font--13-500 tone-500">Сервисный запрос</div>
      <ServiceRequest v-bind="{serviceRequest}"/>
    </template>
    <link-block v-else :text="srNumber" class="padding-unset" type="medium" actionIcon="copy" @click="copy(srNumber)"/>
  </div>`,
  props:{
    srNumber:{type:String,required:true,default:''},
  },
  data:()=>({
    loading:false,
    serviceRequest:null,
  }),
  created(){
    this.getServiceRequest();
  },
  computed:{
    number(){
      let id=this.srNumber;
      if(id.length!==14){id=`1-${parseInt(id.match(/[0-9a-z]{8}/gi)?.[0],36)}`}
      return id.length==14?id:''
    },
  },
  methods:{
    async getServiceRequest(){
      const {number}=this;
      if(!number){return}
      const method='siebel_sr_service_request';
      const key=atok(method,number)
      const cache=this.$cache.getItem(key);
      if(cache){
        this.serviceRequest=cache;
        return;
      };
      this.loading=true;
      try {
        const response=await httpGet(buildUrl(method,{'serviceRequest.number':number},'/call/v1/siebel/'));
        if(response?.id){
          this.$cache.setItem(key,this.serviceRequest=response);
        }
      }catch(error){
        console.warn('getServiceRequest.error',error);
      }
      this.loading=!true;
    },
    copy(text){
      copyToBuffer(text);
    },
  },
});

Vue.component('SibelServiceRequests',{
  template:`<DropdownBlock name="SibelServiceRequests" :title="{icon:'info',text:title,text2:serviceRequestsFilteredCount?serviceRequestsFilteredCount:'',text2Class:'tone-500'}">
    <div class="margin-left-right-16px">
      <loader-bootstrap v-if="loading" text="получение недавних обращений"/>
      <message-el v-if="!serviceRequestsFilteredCount" text="Нет недавних обращений" box type="info"/>
      <div v-else class="display-flex flex-direction-column gap-4px">
        <template v-for="(serviceRequest,index) of serviceRequestsFiltered">
          <devider-line v-if="index"/>
          <ServiceRequest v-bind="{serviceRequest}" :key="index"/>
        </template>
      </div>
    </div>
  </DropdownBlock>`,
  props:{
    agrNumber:{type:String,required:true,default:''},
    srNumberCurrent:{type:String,default:''},
  },
  data:()=>({
    loading:false,
    serviceRequests:null,
  }),
  created(){
    this.getServiceRequests();
  },
  computed:{
    title(){
      return `${this.srNumberCurrent?'Другие обращения':'Обращения'} абонента`
    },
    agreementNum(){
      const {agrNumber}=this;
      return agrNumber.match(/\d/g)?.join('')||'';
    },
    serviceRequestsFiltered(){
      const {serviceRequests,srNumberCurrent}=this;
      return srNumberCurrent?(serviceRequests||[]).filter(({number})=>number!==srNumberCurrent):serviceRequests;
    },
    serviceRequestsFilteredCount(){
      return this.serviceRequestsFiltered?.length||0;
    }
  },
  methods:{
    async getServiceRequests(){
      const {agrNumber}=this;
      if(!agrNumber){return};
      const startDate=new Date(new Date().setDate(-1)).toISOString().replace(/.\d\d\dZ$/,'Z');
      const endDate=new Date().toISOString().replace(/.\d\d\dZ$/,'Z');
      const method='siebel_sr_service_requests';
      const key=atok(method,agrNumber)
      const cache=this.$cache.getItem(key);
      if(cache){
        this.serviceRequests=cache;
        return;
      };
      this.loading=true;
      try {
        const responses=await Promise.allSettled([...new Set([
          agrNumber,
          agrNumber.match(/\d/g)?.join('')||''
        ])].filter(v=>v).map(agreementNum=>{
          return httpGet(buildUrl(method,{'customerIdentification.agreementNum':agreementNum,startDate,endDate},'/call/v1/siebel/'))
        }));
        const response=responses.reduce((responses,response)=>[...responses,...Array.isArray(response.value)?response.value:[]],[]);
        if(Array.isArray(response)){
          this.$cache.setItem(key,this.serviceRequests=response);
        }
      }catch(error){
        console.warn('getServiceRequests.error',error);
      }
      this.loading=!true;
    },
  },
});












