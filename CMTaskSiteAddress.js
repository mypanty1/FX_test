//test task nav deeplink
Vue.component('CMTaskSiteAddress',{
  template:`<div class="display-flex flex-direction-column">
    <div class="display-flex align-items-center justify-content-space-between gap-8px cursor-pointer" @click="openNav=!openNav">
      <div class="font--15-600">{{addressShort}}</div>
      <button-sq v-if="siteNodeDu||siteNodeLoading" :icon="siteNodeLoading?'pin tone-500':'pin main-lilac'" iconSize="24" type="medium"/>
    </div>
    <transition v-if="siteNodeDu&&openNav&&buttons" name="slide-down" mode="out-in" appear>
      <UILinkBtnsList :buttons="buttons" @click="goToNav($event.data)"/>
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
    goToNav({lat,lon,uri}={}){
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
