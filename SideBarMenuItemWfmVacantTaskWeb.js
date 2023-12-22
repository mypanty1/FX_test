Vue.component('SideBarMenuItemWfmVacantTaskWeb',{
  template:`<div class="display-flex align-items-center gap-8px cursor-pointer" @click="onClick" v-if="!isB2BEngineer">
    <IcIcon name="fas fa-link" color="#5642bd" class="font-size-22px"/>
    <span>Биржа нарядов2</span>
    <div class="margin-left-auto">
      <IcIcon name="fa fa-chevron-right"/>
    </div>
  </div>`,
  computed:mapGetters(['userLogin','isB2BEngineer']),
  methods:{
    onClick(){
      const uri=`https://wfmmobile.mts.ru/VacantTaskWeb/?login=${this.userLogin}`;
      if(this.$store.getters['app/isApp']){
        this.$store.dispatch('app/actionView',uri);
      }else{
        window.open(uri,'_blank');
      }
      this.$store.dispatch('menu/close');
    },
  }
});
