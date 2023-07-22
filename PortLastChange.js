//
Vue.component('PortLastChange',{
  template:`<div name="PortLastChange" class="display-contents">
    <info-text-sec v-if="ifLastChange" :title="ifLastChangeText"/>
  </div>`,
  props:{
    port:{type:Object},
    networkElement:{type:Object},
    status:{type:Object},
  },
  data:()=>({}),
  created(){},  
  computed:{
    ifLastChange(){
      if(!this.status){return};
      const {uptime_instance,last_change}=this.status;
      if(!last_change){return};
      const now=Date.now();
      return new Date(Date.now()-uptime_instance*1000).toLocaleString();
    },
    ifLastChangeText(){
      if(!this.status){return};
      const {ifLastChange,status:{IF_OPER_STATUS}}=this;
      return ifLastChange?`${IF_OPER_STATUS?'LinkUp':'LinkDown'} at ${ifLastChange}`:'';
    },
  },
  methods:{},
});
