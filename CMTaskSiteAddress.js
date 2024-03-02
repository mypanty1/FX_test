//test task nav deeplink
Vue.component('CMTaskSiteAddress',{
  template:`<div class="display-flex flex-direction-column">
    <div class="display-flex align-items-center justify-content-space-between gap-8px cursor-pointer" @click="openNav=!openNav">
      <div class="font--15-600">{{addressShort}}</div>
      <button-sq v-if="siteNodeDu||siteNodeLoading" :icon="siteNodeLoading?'pin tone-500':'pin main-lilac'" iconSize="24" type="medium"/>
    </div>
    <transition v-if="siteNodeDu&&openNav&&buttons" name="slide-down" mode="out-in" appear>
      <UILinkBtnsList :buttons="buttons" @click="goToNav($event.data,$event.label)"/>
    </transition>
  </div>`,
  data:()=>({
    openNav:!1,
  }),
  computed:{
    ...mapGetters({
      task:'cm/task',
      taskID:'cm/taskID',
      siteID:'cm/siteID',
    }),
    addressShort(){return WFM.addressShort(this.task.address)},
    siteNodeLoading(){return this.$store.getters['site/siteNodesLoads'][this.siteID]},
    siteNodeDu(){return NIOSS.selectNodeDuAsSite(Object.values(this.$store.getters['nioss/site/nodes']))},
    buttons(){
      if(!this.siteNodeDu){return};
      const {coordinates:{latitude:lat='',longitude:lon=''}={}}=this.siteNodeDu;
      const {taskID}=this;
      if(!lat||!lon){return};
      return [
        {label:'Карта',data:{lat,lon}},
        {label:'Яндекс.Навигатор',data:{lat,lon,uri:`yandexnavi://show_point_on_map?lat=${lat}&lon=${lon}&zoom=12&no-balloon=1&desc=${taskID}`}},
        {label:'Яндекс.Навигатор (маршрут)',data:{lat,lon,uri:`yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`}},
        {label:'2ГИС',data:{lat,lon,uri:`dgis://2gis.ru/geo/${lon},${lat}`}},
        {label:'2ГИС (маршрут)',data:{lat,lon,uri:`dgis://2gis.ru/routeSearch/to/${lon},${lat}`}},
        {label:'Google Maps',data:{lat,lon,uri:`geo:${lat},${lon}&z=12`}},
        {label:'Google Maps (маршрут)',data:{lat,lon,uri:`google.navigation:q=${lat},${lon}`}},
        {label:'Яндекс.Карты',data:{lat,lon,uri:`yandexmaps://maps.yandex.ru/?ll=${lat},${lon}&z=12&l=map&text=${taskID}`}},
        {label:'Яндекс.Карты (маршрут)',data:{lat,lon,uri:`yandexmaps://maps.yandex.ru/?rtext=${lat},${lon}`}},
      ]
    }
  },
  methods:{
    goToNav({lat,lon,uri}={},label=''){
      this.$report(['CMTaskSiteAddress.goToNav',{label}])
      if(!uri){
        this.$router.push({
          name:'R_Map',
          query:{lat,lon},
        });
      }else{
        if(this.$store.getters['app/isApp']){
          this.$store.dispatch('app/actionView',uri);
        }else{
          window.open(uri,'_blank');
        };
      };
      this.openNav=!1;
    },
    // goToMap(){
    //   if(!this.siteNodeDu){return};
    //   const {coordinates:{latitude:lat='',longitude:lon=''}={}}=this.siteNodeDu;
    //   this.$router.push({
    //     name:'R_Map',
    //     query:{lat,lon},
    //   });
    // },
  },
});


//old wfm
Vue.component('WFMTaskSiteAddress',{
  template:`<div class="display-flex flex-direction-column">
    <title-main :text="siteNodeDu?.address||task.AddressSiebel">
      <button-sq v-if="siteNodeDu" icon="pin" @click="openNav=!openNav" type="large"/>
    </title-main>
    <transition v-if="siteNodeDu&&openNav&&buttons" name="slide-down" mode="out-in" appear>
      <UILinkBtnsList :buttons="buttons" @click="goToNav($event.data,$event.label)"/>
    </transition>
  </div>`,
  props:{
    task:{type:Object,default:()=>({})},
    siteNodeDu:{type:Object,default:null},
  },
  data:()=>({
    openNav:!1,
  }),
  computed:{
    buttons(){
      if(!this.siteNodeDu){return};
      const {coordinates:{latitude:lat='',longitude:lon=''}={}}=this.siteNodeDu;
      const {NumberOrder}=this.task;
      if(!lat||!lon){return};
      return [
        {label:'Карта',data:{lat,lon}},
        {label:'Яндекс.Навигатор',data:{lat,lon,uri:`yandexnavi://show_point_on_map?lat=${lat}&lon=${lon}&zoom=12&no-balloon=1&desc=${NumberOrder}`}},
        {label:'Яндекс.Навигатор (маршрут)',data:{lat,lon,uri:`yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`}},
        {label:'2ГИС',data:{lat,lon,uri:`dgis://2gis.ru/geo/${lon},${lat}`}},
        {label:'2ГИС (маршрут)',data:{lat,lon,uri:`dgis://2gis.ru/routeSearch/to/${lon},${lat}`}},
        {label:'Google Maps',data:{lat,lon,uri:`geo:${lat},${lon}&z=12`}},
        {label:'Google Maps (маршрут)',data:{lat,lon,uri:`google.navigation:q=${lat},${lon}`}},
        {label:'Яндекс.Карты',data:{lat,lon,uri:`yandexmaps://maps.yandex.ru/?ll=${lat},${lon}&z=12&l=map&text=${NumberOrder}`}},
        {label:'Яндекс.Карты (маршрут)',data:{lat,lon,uri:`yandexmaps://maps.yandex.ru/?rtext=${lat},${lon}`}},
      ]
    }
  },
  methods:{
    goToNav({lat,lon,uri}={},label=''){
      this.$report(['WFMTaskSiteAddress.goToNav',{label}])
      if(!uri){
        this.$router.push({
          name:'R_Map',
          query:{lat,lon},
        });
      }else{
        if(this.$store.getters['app/isApp']){
          this.$store.dispatch('app/actionView',uri);
        }else{
          window.open(uri,'_blank');
        };
      };
      this.openNav=!1;
    },
  },
});
Vue.component('task-main-account-2',{//deprecated
  template:`<div class="display-flex flex-direction-column gap-8px">
    <div class="white-block-100 padding-top-bottom-8px">
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

      <div class="padding-left-right-8px">
        <SiebelServiceRequest :srNumber="task.Number_EIorNumberOrder"/>
      </div>
      <devider-line/>

      <div class="margin-left-right-16px">
        <link-block :text="'ЛС '+task.clientNumber" @click="$copy(task.clientNumber)" type="medium" actionIcon="copy" class="padding-unset"/>
      </div>
      <devider-line/>

      <info-text-sec title="Описание работ" :rows="[task.ProductOffering]" :text="task.description||'нет описания работ'"/>
      <devider-line/>

      <template v-if="task.clientNumber!='Потенциальный'">
        <div class="padding-left-right-8px">
          <SiebelServiceRequests :agreementNum="task.clientNumber" :srNumberCurrent="task.Number_EIorNumberOrder"/>
        </div>
        <devider-line/>
      </template>

      <LocalNotes :id="task.NumberOrder" class="margin-left-right-16px"/>
      <devider-line m="2px 0px 8px 0px"/>

      <template v-if="/^1-/.test(task.Number_EIorNumberOrder)">
        <UrlLink :url="urlToEdo"/>
        <devider-line/>
      </template>
      <template v-if="task.NumberOrder">
        <UrlLink :url="urlToMaster"/>
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
    </div>

    <div class="white-block-100 padding-top-bottom-8px">
      <title-main :text="task.customer" icon="person" style="text-transform: capitalize;"/>
      <div class="display-flex flex-direction-column gap-8px">
        <PhoneCall :phone="task.ContactPhoneNumber" :descr="task.customer" showSendSms class="margin-left-right-16px"/>
        <SendKionPq :phones="[task.ContactPhoneNumber]" :account="task.clientNumber" class="margin-left-right-16px"/>
        <info-list icon="timer" :text="task.Appointment" comment="(ожидания клиентом)"/>
      </div>
    </div>

    <div class="white-block-100 padding-top-bottom-8px">
      <WFMTaskSiteAddress v-bind="{task,siteNodeDu:site}" class="margin-top-8px margin-left-right-8px"/>
      <info-list icon="apartment" v-if="entrance" :text="titleEntranceFloorFlat"/>
      <devider-line />

      <link-block icon="du" :text="site?.node||task.siteid" :search="site?.node||task.siteid" type="medium" />
      <link-block icon="home" actionIcon="expand" text="Инфо по площадке и доступу" @block-click="open_modal_site_info" type="medium" />
    </div>

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
    urlToEdo(){return {title:'Заполнить ЭДО',hideUrl:!0,url:`https://wfmmobile.mts.ru/WfmClientContractWeb/?taskCallId=${this.task.Number_EIorNumberOrder}`}},
    urlToMaster(){return {title:'Внести оборудование',hideUrl:!0,url:`mtsmaster://task?wfmKey=${this.task.NumberOrder}`}},
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
      return BF.checkEntranceBFWarn(this.entrance);
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
      ].filter(Boolean).join(' • ');
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
    open_modal_site_info(){
      this.$refs.modal_site_info.open();
    },
    // toMap(){
    //   const {site}=this;if(!site?.coordinates){return};
    //   const {latitude:lat,longitude:lon}=site.coordinates
    //   this.$router.push({name:'R_Map',query:{lat,lon}});
    // },
  },
});
Vue.component('task-main-incident',{//deprecated
  template:`<div class="display-flex flex-direction-column gap-8px">
    <div class="white-block-100 padding-top-bottom-8px">
      <title-main icon="task" text="Массовый инцидент">
        <div class="display-flex align-items-center" style="padding-right: 12px;">
          <span class="tone-900" style="white-space: nowrap; padding-right: 8px;">{{task.Assignment}}</span>
          <i class="ic-20 ic-timer tone-500"></i>
        </div>
      </title-main>

      <info-subtitle :text="task.NumberOrder" />
      <info-subtitle :text="task.OperationConcatenation+' • '+task.Number_EIorNumberOrder" />
      <devider-line />

      <info-text title="Описание запроса" :text="task.description"/>
      <devider-line />

      <info-text title="Решение" :text="detailIncident&&detailIncident.solution||'Нет данных'"/>
      <devider-line />

      <ul class="reset--ul">
        <info-list icon="task-status" :text="task.status" comment="(статус)" />
        <info-list icon="timer" :text="task.Appointment" comment="(ожидания клиентом)" />
      </ul>
      <template v-if="favBtnProps">
        <devider-line/>
        <FavBtnLinkBlock v-bind="favBtnProps"/>
      </template>
    </div>

    <div class="white-block-100 padding-top-bottom-8px">
      <WFMTaskSiteAddress v-bind="{task,siteNodeDu:site}" class="margin-top-8px margin-left-right-8px"/>
      <devider-line />
      <link-block icon="du" :text="site?site.node:'Площадка'" :search="site?site.node:task.siteid" />
      <link-block icon="home" actionIcon="expand" text="Информация об УК" @block-click="openModal" />
    </div>

    <modal-container ref="modal">
      <SiteNodeDetails :siteNode="site"/>
    </modal-container>
  </div>`,
  props:{
    task:{type:Object,required:true},
  },
  data:()=>({
    site:null,
    detailIncident:null,
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
          Number_EIorNumberOrder:['СЗ/ЕИ','-'],
          OperationConcatenation:['Операции','-'],
          AddressSiebel         :['Адрес','-'],
        })),
      }
    },
    incidentType(){
      return {
        АВР: 'Accident',
        'Массовый инцидент': 'I2:Incidents',
        'Профилактические работы': 'I2:Works',
        'Планово-профилактическая': 'I2:Works',
      }[this.task.tasktype];
    },
  },
  created(){
    this.getSite();
    this.get_detail_incident();
  },
  methods:{
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
    async get_detail_incident() {
      let cache = this.$cache.getItem(`incident_detail/${this.task.Number_EIorNumberOrder}`);
      if(cache){this.detailIncident=cache;return;};
      try {
        let response=await httpGet(buildUrl('get_detail_incident',{
          incident_id:this.task.Number_EIorNumberOrder,
          incident_type:this.incidentType,
        },'/call/device/'));
        if(response.type==='error'){throw new Error(response.message)};
        this.$cache.setItem(`incident_detail/${this.task.Number_EIorNumberOrder}`,response);
        this.detailIncident=response;
      }catch(error){
        console.warn('get_detail_incident.error',error);
      };
    },
    openModal(){
      this.$refs.modal.open();
    },
    // toMap(){
    //   const {site}=this;if(!site?.coordinates){return};
    //   const {latitude:lat,longitude:lon}=site.coordinates
    //   this.$router.push({name:'R_Map',query:{lat,lon}});
    // },
  },
});










