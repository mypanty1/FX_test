Vue.component('SideBarMenuItemWfmVacantTaskWeb',{
  template:`<div class="display-contents">
  <div class="display-flex align-items-center gap-8px cursor-pointer" @click="$store.dispatch('menu/close')" v-if="!isB2BEngineer">
    <IcIcon name="fas fa-link" color="#5642bd" class="font-size-22px"/>
    <span>Биржа нарядов</span>
    <div class="margin-left-auto">
      <IcIcon name="fa fa-chevron-right"/>
    </div>
  </div>
  <div class="display-flex align-items-center gap-8px cursor-pointer" @click="onClick" v-if="!isB2BEngineer">
    <IcIcon name="fas fa-link" color="#5642bd" class="font-size-22px"/>
    <span>Биржа нарядов (2)</span>
    <div class="margin-left-auto">
      <IcIcon name="fa fa-chevron-right"/>
    </div>
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

delete ENGINEER_TASKS.lists[ENGINEER_TASKS.B2C_Remedy_WR]
delete ENGINEER_TASKS.b2cEngineerListsItems[ENGINEER_TASKS.B2C_Remedy_WR]
delete ENGINEER_TASKS.lists[ENGINEER_TASKS.B2C_PLANED_DU]
delete ENGINEER_TASKS.b2cEngineerListsItems[ENGINEER_TASKS.B2C_PLANED_DU]

