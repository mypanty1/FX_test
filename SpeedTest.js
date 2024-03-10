//add cpe speedtest
Vue.component('CpeSection3',{
  template:`<div class="display-contents">
    <CardBlock>
      <section class="margin-left-right-16px display-flex align-items-center justify-content-space-between gap-8px">
        <div class="display-flex align-items-center gap-4px width-100-100">
          <template v-if="doCPESpeedTestResult&&!doCPESpeedTestLoading">
            <div class="font--13-500 tone-500">{{speedTestDLState}}</div>
            <div class="font--13-500" v-if="doCPESpeedTestResult?.data?.dl_speed"><span class="tone-500">DL: </span>{{speedTestDLSpeed}}</div>
          </template>
          <div v-if="doCPESpeedTestLoading" class="width-100-100">
            <UILinearProgressLoader v-bind="{
              loaderID,
              maxTime:60000
            }" @onMinEnd="onAnimationEnd" @onMaxEnd="onAnimationEnd" lineColor="#dddddd" fillColor="#5642bd" height="8" rounded showPercent/>
          </div>
        </div>
        
        <button-main label="SpeedTest" @click="doCPESpeedTest" :loading="doCPESpeedTestLoading" :disabled="doCPESpeedTestLoading||loadingSome" buttonStyle="outlined" size="content"/>
      </section>
    </CardBlock>
  </div>`,
  props:{},
  data:()=>({
    doCPESpeedTestLoading:!1,
    doCPESpeedTestResult:null,
  }),
  computed:{
    ...mapGetters({
      cpeDbLoading:'cpe/cpeInfoDbLoading',
      cpeLoading:'cpe/cpeInfoLoading',
    }),
    loadingSome(){return this.cpeLoading||this.cpeDbLoading},
    loaderID(){return atok(this.$options.name,this.$route.params.mr_id,this.$route.params.serial)},
    speedTestDLState(){
      return this.doCPESpeedTestResult?.data?.dl_state||'Error'
    },
    speedTestDLSpeed(){
      const kb=parseInt(this.doCPESpeedTestResult?.data?.dl_speed)
      return `${(kb*0.001).toFixed()} МБит/с`
    },
  },
  methods:{
    async doCPESpeedTest(){
      const {mr_id,serial}=this.$route.params;
      this.doCPESpeedTestLoading=!0;
      this.doCPESpeedTestResult=null;
      this.$store.dispatch('UILinearProgressLoader/start',this.loaderID);
      try{
        const response=await AxirosService.doCPESpeedTest(mr_id,serial);
        this.doCPESpeedTestResult=response;
        this.$report(['CpeSection3.doCPESpeedTest',{
          accountNumber:this.$route.params.account,
          params:{
            mrID:mr_id,
            cpeID:serial
          },
          response,
        }])
        this.$store.dispatch('UILinearProgressLoader/done',this.loaderID);
      }catch(error){
        console.warn('doCPESpeedTest.error',error)
        this.$store.dispatch('UILinearProgressLoader/abort',this.loaderID);
      };
      //this.doCPESpeedTestLoading=!1;
    },
    onAnimationEnd(){
      this.doCPESpeedTestLoading=!1;
    },
  },
});
