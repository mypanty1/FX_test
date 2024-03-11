//add cpe speedtest
Vue.component('CpeSection3',{
  template:`<div class="display-contents">
    <CardBlock>
      <section class="margin-left-right-16px display-flex flex-direction-column gap-8px">
        <section class="display-flex align-items-center justify-content-space-between gap-8px">
          <div class="width-100-100">
            <UILinearProgressLoader v-if="doCPESpeedTestLoadingAnimationEnd||doCPESpeedTestError" v-bind="{
              loaderID,
              maxTime:60000
            }" @onMinEnd="onAnimationEnd" @onMaxEnd="onAnimationEnd" lineColor="#dddddd" fillColor="#5642bd" height="8" rounded showPercent/>
            
            <div v-else-if="doCPESpeedTestResult" class="display-flex flex-direction-column">
              <div class="display-flex align-items-center gap-4px">
                <div class="font--13-500 tone-500">DL: </div>
                <div class="font--13-500">{{speedTestDLSpeed}}</div>
                <div class="font--13-500 tone-500">{{speedTestDLState}}</div>
              </div>
              <div class="display-flex align-items-center gap-4px">
                <div class="font--13-500 tone-500">UL: </div>
                <div class="font--13-500">{{speedTestULSpeed}}</div>
                <div class="font--13-500 tone-500">{{speedTestULState}}</div>
              </div>
            </div>
          </div>
          
          <button-main label="SpeedTest" @click="doCPESpeedTest" v-bind="{
            loading:doCPESpeedTestLoadingAnimationEnd,
            disabled:doCPESpeedTestLoadingAnimationEnd||loadingSome,
          }" buttonStyle="outlined" size="content"/>
        </section>
        
        <message-el v-if="!doCPESpeedTestLoadingAnimationEnd&&doCPESpeedTestError" v-bind="{
          text:speedTestErrorMessage,
          subText:speedTestErrorText
        }" type="warn" box/>
      </section>
    </CardBlock>
  </div>`,
  props:{},
  data:()=>({
    doCPESpeedTestLoadingAnimation:!0,
    doCPESpeedTestLoading:!1,
    doCPESpeedTestResult:null,
    doCPESpeedTestError:null,
  }),
  computed:{
    ...mapGetters({
      cpeDbLoading:'cpe/cpeInfoDbLoading',
      cpeLoading:'cpe/cpeInfoLoading',
    }),
    loadingSome(){return this.cpeLoading||this.cpeDbLoading},
    loaderID(){return atok(this.$options.name,this.$route.params.mr_id,this.$route.params.serial)},
    speedTestDLState(){
      return this.doCPESpeedTestResult?.dl_state||'Error'
    },
    speedTestDLSpeed(){
      const kb=parseInt(this.doCPESpeedTestResult?.dl_speed);
      return kb>0?`${(kb*0.001).toFixed()} МБит/с`:kb;
    },
    speedTestULState(){
      return this.doCPESpeedTestResult?.ul_state||'Error'
    },
    speedTestULSpeed(){
      const kb=parseInt(this.doCPESpeedTestResult?.ul_speed);
      return kb>0?`${(kb*0.001).toFixed()} МБит/с`:kb;
    },
    speedTestErrorMessage(){
      return this.doCPESpeedTestError?.message||'Error'
    },
    speedTestErrorText(){
      return this.doCPESpeedTestError?.text||''
    },
    doCPESpeedTestLoadingAnimationEnd(){
      return this.doCPESpeedTestLoading || !this.doCPESpeedTestLoadingAnimation
    }
  },
  methods:{
    async doCPESpeedTest(){
      const {mr_id,serial}=this.$route.params;
      this.doCPESpeedTestResult=null;
      this.doCPESpeedTestError=null;
      this.doCPESpeedTestLoading=!0;
      this.doCPESpeedTestLoadingAnimation=!1;
      this.$store.dispatch('UILinearProgressLoader/start',this.loaderID);
      try{
        const response=await AxirosService.doCPESpeedTest(mr_id,serial);
        if(response?.data){
          this.doCPESpeedTestResult=response.data;
          this.$store.dispatch('UILinearProgressLoader/done',this.loaderID);
        }else{
          this.doCPESpeedTestError=response;
          this.$store.dispatch('UILinearProgressLoader/abort',this.loaderID);
        };
        this.$report(['CpeSection3.doCPESpeedTest',{
          accountNumber:this.$route.params.account,
          params:{
            mrID:mr_id,
            cpeID:serial
          },
          response,
        }]);
      }catch(error){
        console.warn('doCPESpeedTest.error',error)
        this.doCPESpeedTestError={
          message:'Error: Unexpected'
        };
        this.$store.dispatch('UILinearProgressLoader/abort',this.loaderID);
      };
      this.doCPESpeedTestLoading=!1;
    },
    onAnimationEnd(){
      this.doCPESpeedTestLoadingAnimation=!0;
    },
  },
});
