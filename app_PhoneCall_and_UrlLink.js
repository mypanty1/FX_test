
Vue.component('UrlLink',{
  template:`<div>
    <template v-if="urlObj.urls">
      <title-main :text="urlObj.title" :text2="urlObj?.urls?.length||'нет'" text2Class="tone-500" :iconClass="urlObj.icon +' main-lilac margin-right-8px'" :iconClassEnable="!urlObj.icon" @open="open=!open"/>
      <info-text-sec v-if="urlObj.description" :text="urlObj.description" class="margin-bottom-8px" style="margin-top:-8px;"/>
      <template v-if="open">
        <template v-for="(url,i) of urlObj.urls">
          <devider-line v-if="i"/>
          <UrlLink :key="i" :url="url"/>
        </template>
      </template>
    </template>
    <template v-else>
      <link-block v-if="urlObj.title" iconClass="fas fa-link main-lilac padding-right-4px" :text="urlObj.title" textClass="font--11-600" @block-click="goTo(urlObj.url)" @click.stop="goTo(urlObj.url)" type="medium" class="padding-right-8px"/>
      <link-block v-if="urlObj.url" :text="urlObj.url.length>30?urlObj.url.slice(0,30)+'...':urlObj.url" textClass="font--11-600" textStyle="color:#0066cc;" @block-click="copy(urlObj.url)" @click.stop="copy(urlObj.url)" type="medium" actionIcon="copy" class="padding-right-8px" style="margin-top:-8px;"/>
      <info-text-sec v-if="urlObj.description" :text="urlObj.description" class="margin-bottom-8px" style="margin-top:-8px;"/>
      <link-block v-if="urlObj.url2" :text="urlObj.url2.length>30?urlObj.url2.slice(0,30)+'...':urlObj.url2" textClass="font--11-600" textStyle="color:#0066cc;" @block-click="copy(urlObj.url2)" @click.stop="copy(urlObj.url2)" type="medium" actionIcon="copy" class="padding-right-8px" style="margin-top:-8px;"/>
      <slot></slot>
    </template>
  </div>`,
  props:{
    url:{type:Object,default:()=>({}),required:true},
  },
  data:()=>({
    open:false,
    newUrl:null,
  }),
  async created(){
    const {id=''}=this.url;
    if(!id){return};
    const newUrl=await fetch(`https://script.google.com/macros/s/AKfycbzcwUJXRO9lytE8Olmc6nzciGrjWTJxzQHUNJUzPsbFbItGzTmHbbRFupi-tdzZqOyLdA/exec?id=${id}`).then(r=>r.json())
    if(typeof newUrl==='object'&&!newUrl.error){
      this.newUrl=newUrl
    };
  },
  computed:{
    urlObj(){return this.newUrl||this.url},
  },
  methods:{
    goTo(uri=''){
      if(!uri){return};
      if(this.$store.getters['app/isApp']){
        //this.$store.dispatch('app/sendToApp',`do:StartActivity2_Action_android.intent.action.VIEW:::=${uri}`)
        this.$store.dispatch('app/sendToApp',`set:ActivityStarter2:::=`);
        this.$store.dispatch('app/sendToApp',`set:ActivityStarter2:Action::=android.intent.action.VIEW`);
        this.$store.dispatch('app/sendToApp',`set:ActivityStarter2:DataUri::=${uri}`);
        this.$store.dispatch('app/sendToApp',`do:StartActivity2:::=`);
      }else{
        window.open(uri,'_blank');
      }
    },
    copy(text=''){
      if(!text){return};
      copyToBuffer(text);
    },
  },
});

Vue.component('PhoneCall',{
  template:`<div name="PhoneCall" class="display-flex flex-direction-column bg-minor-200 border-radius-8px padding-4px">
    <span class="font--12-400">{{title}}</span>
    <template v-for="(tel,index) of phones"><!--в nioss обычное текстовое поле, возможны несколько номеров-->
      <devider-line v-if="index"/>
      <div class="display-inline-flex column-gap-4px justify-content-space-between">
        <div @click="voiceCall(tel)" class="display-inline-flex align-items-center">
          <div v-if="isConvergent" class="size-20px bg-tone-250 border-radius-4px display-flex align-items-center justify-content-center margin-right-4px">
            <span class="size-20px line-height-20px text-align-center">&#8381</span>
          </div>
          <span class="tone-900 font--15-500">{{tel}}</span>
        </div>
        <div class="display-inline-flex column-gap-4px">
          <div @click="sendSms(tel)" v-if="showSendSms" class="bg-main-green size-30px border-radius-4px display-flex align-items-center justify-content-center">
            <span class="tone-100 ic-24 ic-sms"></span>
          </div>
          <div @click="voiceCall(tel)" v-if="!hideVoiceCall" class="bg-main-green size-30px display-flex align-items-center justify-content-center" style="border-radius: 20% 50%;">
            <span class="tone-100 ic-24 ic-phone-1"></span>
          </div>
        </div>
      </div>
    </template>
    <span class="font--12-400" v-for="row of descr_rows">{{row}}</span>
  </div>`,
  props:{
    phone:{type:String,default:''},
    title:{type:String,default:''},
    descr:{type:[String,Array],default:''},
    isConvergent:{type:[Boolean,String,Number]},
    showSendSms:{type:Boolean,default:false},
    hideVoiceCall:{type:Boolean,default:false},
    smsMessage:{type:String,default:''},
  },
  computed:{
    phones(){
      return this.phone.split(/[,;]/ig).filter(s=>s).map(phone=>getPhoneWithPlus(phone)).filter(t=>t.length>6)
    },
    descr_rows(){
      return typeof this.descr==='string'?this.descr.split('\n'):this.descr;
    },
  },
  methods:{
    voiceCall(phone=''){
      if(!phone||this.hideVoiceCall){return};
      if(this.$store.getters['app/isApp']){
        this.$store.dispatch('app/sendToApp',`do:voiceCall:direct:${phone}`);
      }else{
        window.location=`tel:${phone}`;
      };
    },
    sendSms(phone=''){
      if(!phone){return};
      if(this.$store.getters['app/isApp']){
        this.$store.dispatch('app/sendToApp',`do:sendSms:approve:${phone}=${this.smsMessage}`);
      }else{
        window.location=`sms:${phone}?body=${encodeURIComponent(this.smsMessage)}`;
      };
    },
  }
});

//remove app descr
Vue.component("SiteNodeDetails", {
  template:`<CardBlock name="SiteNodeDetails">
    <title-main text="Инфо по площадке*" @open="show=!show">
      <button-sq :icon="loading?'loading rotating':'mark-circle'" @click="help.show=!help.show"/>
      <!--<button-sq v-if="show&&siteNode" :icon="$refs.SiteNodeDetailsEditModal?.loadingSome?'loading rotating':'edit'" @click="$refs.SiteNodeDetailsEditModal.open()" :disabled="loading||$refs.SiteNodeDetailsEditModal?.loadingSome"/>-->
    </title-main>
    <info-text-icon v-if="help.show" icon="info" :text="help.text"/>
    <SiteNodeDetailsEditModal v-if="siteNode" ref="SiteNodeDetailsEditModal" v-bind="modalProps" @onNodeSaveOk="get_nioss_object('node',siteNode?.node_id,'update')" @onSiteSaveOk="get_nioss_object('site',siteNode?.id,'update')"/>
    <template v-if="show&&siteNode">
      <template v-if="siteNode.lessor">
        <info-text-sec :text="siteNode.lessor?.name" class="margin-bottom-4px"/>
        <div class="display-flex flex-direction-column gap-4px padding-left-right-16px">
          <PhoneCall v-if="siteNode.lessor?.phone" :phone="siteNode.lessor.phone" title="Контактный номер телефона" :descr="[siteNode.lessor.person,siteNode.lessor.position]"/>
          <PhoneCall v-if="siteNode.lessor?.phone2" :phone="siteNode.lessor.phone2" title="Контактный номер телефона по вопросам доступа"/>
          <PhoneCall v-if="siteNode.lessor?.phone3" :phone="siteNode.lessor.phone3" title="Телефонные номера аварийных служб"/>
        </div>
      </template>
      
      <devider-line/>
      <info-text-sec :title="address_descr_title" :text="address_descr"/>
      
      <devider-line/>
      <info-text-sec :title="site_descr_title" :text="site_descr"/>
      
      <devider-line/>
      <info-text-sec :title="node_descr_title" :text="node_descr"/>
      
      <template v-if="address_id">
        <devider-line/>
        <UrlLink :url="urlToInventory"/>
      </template>
    </template>
  </CardBlock>`,
  props:{
    siteNode:{type:Object},
  },
  data:()=>({
    show:true,
    help:{
      text:`Информация об арендодателе площадей под размещение оборудования ПАО МТС может быть устаревшей либо вовсе не быть информацией по доступу. 
      Для корректировки данной информации нужно обратиться к ФГТСЖ. Подробная информация по доступу в помещения подъезда находится на странице Подъезд`,
      show:false,
    },
    resps:{//8100749217013993313 - получены все доступные атрибуты
      node:null,
      site:null,
      address:null,
    },
    loads:{
      node:false,
      site:false,
      address:null,
    },
  }),
  created(){
    this.get_nioss_object('address',this.siteNode?.address_id);
    this.get_nioss_object('site',this.siteNode?.id);
    this.get_nioss_object('node',this.siteNode?.node_id||this.siteNode?.uzel_id);
  },
  watch:{
    'siteNode'(siteNode){
      if(!siteNode){return};
      if(!this.resps.site&&!this.loads.site){
        this.get_nioss_object('site',this.siteNode?.id);
      }
      if(!this.resps.node&&!this.loads.node){
        this.get_nioss_object('node',this.siteNode?.node_id||this.siteNode?.uzel_id);
      }
    },
    'address_id'(address_id){
      if(address_id&&!this.resps.address&&!this.loads.address){
        this.get_nioss_object('address',address_id);
      }
    }
  },
  computed:{
    loading(){return Object.values(this.loads).some(l=>l)},
    address_descr(){return [this.resps.address?.description,this.siteNode?.details].filter(v=>v).join('\n')||'—'},
    address_descr_title(){return `Примечание к адресу ${[this.resps.address?.BuildingType||this.resps.address?.BldType||'',this.resps.address?.resource_business_name||''].filter(v=>v).join(' ')}`},
    site_descr(){return (this.resps.site?this.resps.site?.description:this.siteNode?.site_descr)||'—'},
    site_descr_title(){return `Примечание к площадке ${this.siteNode?.name||''}`},
    node_descr(){return (this.resps.node?this.resps.node?.description:this.siteNode?.node_descr)||'—'},
    //node_descr_title(){return `Примечание к УОС ${this.siteNode?.type||''}`},
    node_descr_title(){return `Примечание к УОС ${this.siteNode?.node||''}`},
    address_id(){return this.resps.site?.AddressPA?.NCObjectKey||this.siteNode?.address_id||''},
    site_name(){return this.resps.site?.SiteName||this.siteNode?.name||''},
    urlToInventory(){
      return {
        url:`https://inventory.ural.mts.ru/tb/address_view.php?id_address=${this.address_id}`,
        title:`Инвентори площадки ${this.site_name}`,
        //description:this.$store.getters['app/isApp']?`*переход из приложения пока может не работать\n(можно скопировать)`:''
      }
    },
    modalProps(){
      const {id:site_id,node_id}=this.siteNode;
      const {site,node}=this.resps;
      return {
        site,site_id,
        node,node_id,
      }
    },
  },
  methods:{
    async get_nioss_object(object='unknown',object_id='',update=false){
      if(!object_id){return};
      if(!update){
        const cache=this.$cache.getItem(`get_nioss_object/${object_id}`);
        if(cache){
          this.resps[object]=cache;
          return;
        };
      }
      this.loads[object]=true;
      const response=await this.get_nioss_object_and_save({object_id,object});
      this.resps[object]=response||null;
      this.loads[object]=false;
    },
    async get_nioss_object_and_save({object_id,object}){
      try{
        const response=await httpGet(buildUrl("get_nioss_object",{object_id,object},"/call/nioss/"),true);
        if(response?.parent){this.$cache.setItem(`get_nioss_object/${object_id}`,response)};
        return response;
      }catch(error){
        console.warn("get_nioss_object.error",{object_id,object},error);
      }
      return null;
    },
  }
});

//add edo and mpmaster links
Vue.component('task-main-account',{
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
      
      <template v-if="/^1-/.test(task.Number_EIorNumberOrder)">
        <UrlLink :url="urlToWfmEdo"/>
        <devider-line/>
      </template>
      <template v-if="task.NumberOrder">
        <UrlLink :url="urlToMpMaster"/>
        <devider-line/>
      </template>
      
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
      <title-main :text="task.customer" icon="person" style="text-transform: capitalize;"/>
      <div class="display-flex flex-direction-column gap-8px">
        <PhoneCall :phone="task.ContactPhoneNumber" :descr="task.customer" showSendSms class="margin-left-right-16px"/>
        <SendKionPq :phones="[task.ContactPhoneNumber]" :account="task.clientNumber" class="margin-left-right-16px"/>
        <info-list icon="timer" :text="task.Appointment" comment="(ожидания клиентом)"/>
      </div>
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
    urlToWfmEdo(){
      return {
        url:`https://wfmmobile.mts.ru/WfmClientContractWeb/?taskCallId=${this.task.Number_EIorNumberOrder}`,
        title:'WFM ЭДО',
      }
    },
    urlToMpMaster(){
      return {
        url:`mtsmaster://task?wfmKey=${this.task.NumberOrder}`,
        title:'МП Мастер',
      }
    },
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
          Number_EIorNumberOrder:['СЗ/ЕИ','-'],
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
