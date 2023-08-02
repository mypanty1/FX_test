Vue.component('BtnSq',{//new btn
  template:`<button type="button" name="BtnSq" :style="{width:size+'px',minWidth:size+'px',height:size+'px'}" v-on="$listeners">    
    <slot><span :class="iconClass"></span></slot>    
  </button>`,
  props:{
    size:{type:String,default:'20'},
    iconSize:{type:String,default:'16'},//12,14,16,20,24,80
    icon:{type:String,default:'refresh'},
    loading:{type:Boolean,default:false},
  },
  mounted(){
    (function(id='BtnSq'){
      document.getElementById(id)?.remove();
      const el=Object.assign(document.createElement('style'),{type:'text/css',id});
      el.appendChild(document.createTextNode(`
        *[name="BtnSq"] {
          /*btn-reset*/
          background:none;
          border:none;
          padding:0;
          
          display:flex;
          justify-content:center;
          align-items:center;
          
          border-radius:4px;
          transition:50ms;
          color:#5642bd;
          
          border:1px solid;
          cursor:pointer;
          
          width:36px;
          min-width:36px;
          height:100%;
        }
        *[name="BtnSq"]:focus{
          /*btn-reset*/
          outline:none;
          background:none;
        }
        *[name="BtnSq"]:disabled{
          color:#adabab;
        }
        *[name="BtnSq"]:active{
          color:#ffffff;
          background:#bfbed6;
        }
      `));
      document.body.insertAdjacentElement('afterBegin',el);
    }());
  },
  computed:{
    iconClass(){
      return `ic-${ this.iconSize } ic-${this.loading?'loading rotating':this.icon}`
    },
  },
});

Vue.component('LedsBarChart',{
  template:`<div class="display-flex flex-wrap gap-1px">
    <div v-for="(item,key) of Object.values(items)" :key="key" :style="getStyle(item)" :title="item?.title">{{item?.text||''}}</div>
  </div>`,
  props:{
    items:{type:[Object,Array],default:()=>[]},
    color:{type:String,default:'#5642bd'},
    width:{type:[String,Number],default:12},
    height:{type:[String,Number],default:3},
  },
  methods:{
    getStyle(item){
      return {
        width:(item?.width||this.width)+'px',
        height:(item?.height||this.height)+'px',
        borderRadius:'2px',
        background:item?.color||this.color,
        ...item?.style
      }
    }
  }
});

Vue.component('PingGroup',{
  template:`<div name="PingGroup">
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
        <PingLed :key="ip" v-bind="{ip,mr_id}" noPingOnCreatedddd ref="PingLeds" @on-result="onResult(ip,$event)" @loading="$set(loads,ip,$event)"/>
        <div class="font--13-500">{{ip}}</div>
        <div class="font--13-500 tone-500">{{modelText}}</div>
        
        <div></div>
        <LedsBarChart class="position-relative" style="grid-column: span 2;bottom:7px;" :items="results[ip]"/>
      </template>
      
    </div>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    items:{type:[Object,Array],default:null},
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
    const {noItems,site_id}=this;
    if(noItems){
      this.getSiteNetworkElements({site_id});
    }
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
  },
  computed:{
    node_id(){return this.site?.node_id},
    ...mapGetters({
      getNetworkElementsBySiteId:'site/getNetworkElementsBySiteId',
    }),
    networkElements(){return this.getNetworkElementsBySiteId(this.site_id)},
    noItems(){return isEmpty(this.items)},
    networkElementsFiltered(){
      if(!this.noItems){
        return Object.values(this.items).reduce((items,item)=>{
          const {mr_id,ip,modelText};
          if(!mr_id||!ip){return items};
          items[ip]={mr_id,ip,modelText};
          return items;
        },{})
      }else{
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
      }
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
