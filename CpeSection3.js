Vue.component('CpeSection3',{
  template:`<CardBlock name="CpeSection3" class="padding-left-right-16px" v-if="params">
    <div class="display-flex align-items-center justify-content-space-evenly gap-16px">
      <template v-for="(percent,key) of [memUtil,cpuUtil]">
        <div v-if="percent[0]" :key="key" class="display-flex flex-direction-column align-items-center">
          <div class="font--13-500">{{percent[1]}}</div>
          <progress max="100" :value="percent[2]" class="height-32px margin-top-bottom--8px"></progress>
          <div>{{percent[2]}}{{percent[3]}}</div>
        </div>
      </template>
    </div>
  </CardBlock>`,
  props:{},
  data:()=>({}),
  created(){},
  watch:{},
  computed:{
    ...mapGetters({
      cpeDbLoading:'cpe/getCpeDbLoading',
      cpeDb:'cpe/getCpeDbResult',
      cpeLoading:'cpe/getCpeLoading',
      cpe:'cpe/getCpeResult',
    }),
    loadingSome(){return this.cpeLoading||this.cpeDbLoading},
    params(){return this.cpe?.raw},
    cpuUtil(){
      const value1=this.params?.['InternetGatewayDevice.DeviceInfo.ProcessStatus.CPUUsage'];
      const int1=parseInt(value1)||0;
      return [typeof value1!=='undefined','CPU',Math.round(int1),'%',0,100];
    },
    memUtil(){
      const value1=this.params?.['InternetGatewayDevice.DeviceInfo.MemoryStatus.Total'];
      const value2=this.params?.['InternetGatewayDevice.DeviceInfo.MemoryStatus.Free'];
      const [int1,int2]=[parseInt(value1)||0,parseInt(value2)||0];
      return [typeof value1!=='undefined'&&typeof value2!=='undefined','MEM',Math.round((int1-int2)*100/int1),'%',0,value1,value2];
    },
  },
  methods:{
    ...mapActions({
      getCpeDb:'cpe/getCpeDb',
      getCpe:'cpe/getCpe',
    }),
    refresh(){
      this.$emit('refresh');
    },
  },
});
