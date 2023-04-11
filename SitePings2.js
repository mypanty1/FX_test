Vue.component('SitePings',{//pings chart
  template:`<div name="SitePings">
    <div class="display-grid row-gap-2px col-gap-4px" style="grid-template-columns:repeat(2,max-content) 1fr">
      
      <template v-if="networkElementsCount">
        <BtnSq :loading="loadingSome" @click="pingAll" :disabled="running"/>
        <div class="display-flex gap-4px" style="grid-column: span 2">
          <button-main @click="clear" label="clear" buttonStyle="outlined" size="medium" class="width-50px height-20px border-radius-4px"/>
          <button-main @click="start" label="start" :loading="running" :disabled="running" buttonStyle="contained" size="medium" class="width-50px height-20px border-radius-4px"/>
          <button-main @click="stop" label="stop" buttonStyle="outlined" size="medium" class="width-50px height-20px border-radius-4px"/>
          <div class="font--13-500 tone-500">{{count||''}}</div>
        </div>
      </template>
      
      <template v-for="({ip,mr_id,modelText}) in networkElementsFiltered">
        <PingLed :key="ip" v-bind="{ip,mr_id}" ref="PingLeds" @on-result="onResult(ip,$event)" @loading="$set(loads,ip,$event)"/>
        <div class="font--13-500">{{ip}}</div>
        <div class="font--13-500 tone-500">{{modelText}}</div>
        
        <div></div>
        <LedsBarChart class="position-relative" style="grid-column: span 2;bottom:7px;" :items="results[ip]"/>
      </template>
      
    </div>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true}
  },
  data:()=>({
    loads:{},
    results:{},
    timer:null,
    timeout:1000,
    max_count:100,
    count:0,
    running:false,
    states:{},
  }),
  created(){
    const {site_id}=this;
    this.getSiteNetworkElements({site_id});
  },
  watch:{
    'countNotOnline'(countNotOnline){
      this.$emit('count-not-online',countNotOnline);
    },
    'countOnline'(countOnline){
      this.$emit('count-online',countOnline);
    },
    'loadingSome'(loadingSome){
      this.$emit('loading-some',loadingSome);
    },
		'networkElementsDuESwInstalled54'(networkElements){
			if(!Object.values(networkElements).length){return};
			const subscribes=Object.values(networkElements).map(({ip})=>{
				return fetch(`https://ping54.ru/addDeviceSnmpTrapsUserSubscription?ip=${ip}`,{
					headers:{
						'user-key':''
					}
				});
			});
			Promise.allSettled(subscribes)
		},
  },
  computed:{
    node_id(){return this.site.node_id},
    ...mapGetters({
      getNetworkElementsBySiteId:'site/getNetworkElementsBySiteId',
    }),
    networkElements(){return this.getNetworkElementsBySiteId(this.site_id)},
    networkElementsFiltered(){
      return select(this.networkElements,{
        site_id:this.site_id,
        node_id:this.node_id,
        ip:(ip)=>!!ip,
        sysObjectID:(sysObjectID,item)=>{
          const {vendor,model}=item;
          item.modelText=getModelText(vendor,model,sysObjectID);
          return true
        },
      }) 
    },
		networkElementsDuESwInstalled54(){
			return select(this.networkElements,{
				region_id:54,
				ne_name:testByName.neIsETH,
        node_name:testByName.nodeIsDu,
        ne_status:testByName.neIsInstalled,
        site_id:this.site_id,
        node_id:this.node_id,
        ip:(ip)=>!!ip,
        sysObjectID:(sysObjectID)=>!!sysObjectID,
      })
		},
    networkElementsCount(){return Object.values(this.networkElementsFiltered).length},
    loadingSome(){
      return Object.values(this.loads).some(v=>v)
    },
    countNotOnline(){
      return Object.values(this.states).filter(v=>v!=='online').length
    },
    countOnline(){
      return Object.values(this.states).filter(v=>v==='online').length
    }
  },
  methods:{
    ...mapActions({
      getSiteNetworkElements:'site/getSiteNetworkElements',
    }),
    async pingAll(){
      const pings=(this.$refs.PingLeds||[]).map(led=>led.ping());
      return await Promise.allSettled(pings);
    },
    clear(){
      this.stop();
      this.results={};
      this.max_count=100;
      this.count=0;
    },
    start(){
      if(this.running){return};
      this.running=true;
      this.next();
    },
    next(){
      this.timer=setTimeout(async ()=>{
        this.max_count--;
        this.count++;
        await this.pingAll();
        if(this.max_count<=0){
          this.stop();
        }else if(this.running){
          this.next();
        }
      },this.timeout);
    },
    stop(){
      this.running=false;
      clearTimeout(this.timer);
    },
    onResult(ip,result){
      if(!ip||!result){return};
      this.$set(this.states,ip,result.state);
      if(this.running){
        this.storeResult(ip,result);
      }
    },
    storeResult(ip,result){
      if(!this.results[ip]){this.$set(this.results,ip,{})};
      const {state,ms,date}=result;
      const item={
        color:state==='online'?'#20a471':state==='offline'?'#e44656':state==='error'?'#f16b16':'#918f8f',
      };
      if(state==='online'){
        //item.width=ms*12,
        item.title=ms
      };
      this.$set(this.results[ip],date,item);
    }
  },
});