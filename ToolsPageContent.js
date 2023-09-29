//if(store?.getters?.['main/username']=='mypanty1'){
  store.dispatch('dev/setVar',{showToolsPage:!0})
//};

Vue.component('ToolsPageContent',{
  template:`<div name="ToolsPageContent" class="display-contents">
    <CardBlock>
      <div class="display-flex align-items-center justify-content-space-between gap-8px margin-left-right-12px height-32px">
        <div slot="prefix">
          
        </div>
        <div slot="content">
          <span class="font--15-600">Инструменты</span>
        </div>
        <div slot="postfix">
          
        </div>
      </div>
      <devider-line/>
      <div class="padding-left-right-8px">
        
        <div class="display-flex flex-direction-column">
          <select-el ref="Selector" label="Добавить виджет" :items="widgetsItems" itemKey="name" @input="addItem" clearable/>
          <devider-line v-if="items.length"/>
          <div v-if="items.length" class="display-flex flex-direction-column-reverse gap-8px">
            <template v-for="(item,index) of items">
              <SectionBorder class="padding-8px" :key="index">
                <div class="display-flex justify-content-space-between gap-8px">
                  <div class="font--13-500">{{item.name}}</div>
                  <button-sq icon="close-1" @click="items.splice(index,1)" type="medium"/>
                </div>
                <component :key="item.name" :is="item.is" v-bind="item.props" ref="Widgets"/>
              </SectionBorder>
            </template>
          </div>
          <div v-else class="font--16-500 tone-300 text-align-center height-100px display-flex flex-direction-column justify-content-center">
            Добавить виджет
          </div>
        </div>
        
      </div>
    </CardBlock>
  </div>`,
  data:()=>({
    widgets:[
      {name:'Пинг СЭ',is:'WidgetPing'},
      {name:'Dev',is:'WidgetDev',isDev:!0},
      {name:'Device IP',is:'WidgetSnmpTest'},
      {name:'ToEventsMap',is:'ToEventsMap',isDev:!0},
      {name:'Документы по нарядам тест',is:'GenerateDocs'},
    ],
    items:[]
  }),
  created(){},
  watch:{},
  computed:{
    ...mapGetters({
      username:'main/username',
    }),
    someSelected(){return !isEmpty(this.items)},
    isDev(){return this.username=='mypanty1'},
    widgetsItems(){
      const {widgets,isDev}=this;
      return isDev?widgets:widgets.filter(({isDev})=>!isDev);
    }
  },
  methods:{
    addItem(item){
      if(item){
        this.items.push(item)
        this.$refs.Selector.clear()
      };
    }
  },
});
Vue.component('GenerateDocs',{
  template:`<div name="GenerateDocs" class="display-flex flex-direction-column gap-8px">
    <div class="font-13--500 text-align-center">Наряды: {{wfmTasksCount}}</div>
    <button-main label="Отправить себе" @click="generate" :loading="loading" :disabled="!wfmTasksCount||loading||!login" buttonStyle="contained" size="full"/>
    <message-el v-if="message" :text="message.text" box :type="message.type"/>
  </div>`,
  data:()=>({
    loading:false,
    message:null
  }),
  computed:{
    ...mapGetters({
      wfmTasks:'wfm/wfmTasks',
      wfmTasksCount:'wfm/wfmTasksCount',
      login:'main/username',
    }),
  },
  methods:{
    close(){//public
      
    },
    async generate(){
      const {wfmTasks,loading,login}=this;
      if(!login){return};
      if(loading){return};
      this.loading=!0;
      this.message=null;
      try {
        const action=`generate?login=${login}`;
        await fetch(`https://ping54.ru/kVuNKNeQJV4XLAyMBMI7UnR5ru6KpvKykemmPbdgePb1KghmNPnWEIlRquIOvtfk?action=${action}`,{
          headers:{'content-type':'application/json','user-key':'LFjoMC6x-bWQlVyX3-FFPZGwvf-lOo5rT2o-uuubGsRh-eOdFpD4Y'},
          method:'POST',
          body:JSON.stringify({
            login,
            docs:wfmTasks.map(srcData=>({docName:'Акт выполненных работ',srcData}))
          })
        });
        this.message={type:'success',text:`документы отправлены на ${login}@mts.ru`};
      }catch(error){
        this.message={type:'warn',text:`ошибка сервиса gendoc`};
      }
      this.loading=!1;
    }
  },
  beforeDestroy(){
    
  },
});
Vue.component('WidgetPing',{
  template:`<div name="WidgetPing">
    <input-el placeholder="10.221.xxx.xxx" :label="label" v-model="ip" :disabled="enable" class="margin-bottom-8px">
      <!--<button-sq slot="postfix" icon="right-link" @click="$router.push({name:'search',params:{text:'@D_IP:'+ip}})" v-if="ip"/>-->
      <div v-if="valid" slot="postfix" class="margin-left-right-8px display-flex">
        <PingLed v-bind="{ip,mr_id}"/>
      </div>
    </input-el>
    <info-value :label="'получено: '+received" :value="'потеряно: '+lost" type="small"/>
    <device-params-item-history :paramDays="pings" :item="config" :limit="count" chartClass="-" chartStyle="border:1px solid #e4e3e3;border-radius:5px;"/>
    <div class="display-flex gap-4px justify-content-center">
      <button-main @click="clear" label="clear" buttonStyle="outlined" size="medium"/>
      <button-main @click="start" label="start" :loading="running" :disabled="!valid||enable||running" buttonStyle="contained" size="medium"/>
      <button-main @click="abort" label="abort" buttonStyle="outlined" size="medium"/>
    </div>
  </div>`,
  data:()=>({
    ip:'',
    config:{
      param:'ping',
      unit:'ms',
    },
    timer:undefined,
    enable:false,
    timeout:1000,
    count:0,
    running:false,
    pings:[],
  }),
  watch:{
    'ip'(ip){
      if(!ip){return}
      this.pings=[];
    },
  },
  computed:{
    ...mapGetters({
      region:'main/region',
      mr_id:'main/mr_id',
      mr:'main/mr',
    }),
    label(){return this.mr?`IP (МР ${this.mr.name})`:`IP`},
    valid(){return this.mr_id&&this.ip.split('.').filter(Boolean).length===4},
    received(){return this.pings.filter(ping=>ping.values[0]>=0).length},
    lost(){return this.pings.filter(ping=>ping.values[0]<0).length},
  },
  methods:{
    ...mapActions({
      doPing:'dnm/doPing',
    }),
    async ping(){
      this.running=true;
      try{
        const {mr_id,ip}=this;
        const result=await this.doPing({mr_id,ip});
        this.running=false;
        this.count++;
        this.pings.push({
          date:this.count,
          values:[result.state=='online'?result.ms:-2]
        });
        if(this.count<100){//ограничение в 99 пингов чтоб не поехала верстка графика
          this.next();
        }else{
          this.abort();
        }
      }catch(error){
        this.abort();
        console.warn('ping.error',error);
      };
    },
    start(){
      if(!this.running&&this.valid){
        this.enable=true;
      };
      this.next();
    },
    next(){
      if(!this.running&&this.enable){
        this.timer=setTimeout(this.ping,this.timeout);
      };
    },
    abort(){
      clearTimeout(this.timer);
      this.enable=false;
      this.running=false;
    },
    clear(){
      this.abort();
      this.count=0;
      this.pings=[];
    },
    close(){//public
      this.abort();
    },
  },
  beforeDestroy(){
    this.abort();
  },
});
Vue.component('WidgetDev',{
  template:`<div name="WidgetDev">
    <input-el placeholder="wfm_username" label="wfm_username" v-model="wfm_username"/>
    <input-el placeholder="fav_username" label="fav_username" v-model="fav_username"/>
    <devider-line/>
    <div class="font-13--500">eval</div>
    <textarea-el label="js" v-model="js" rows="3" class="padding-unset"/>
    <link-block icon="amount" text="eval" @block-click="eval" actionIcon="right-link" type="medium"/>
    <textarea-el label="jsResult" v-model="jsResultText" rows="3" class="padding-unset"/>
  </div>`,
  data:()=>({
    js:'',
    jsResult:null,
  }),
  computed:{
    ...mapGetters({
      getVar:'dev/getVar'
    }),
    wfm_username:{
      get(){return this.getVar('wfm_username')},
      set(wfm_username){this.setVar({wfm_username})}
    },
    fav_username:{
      get(){return this.getVar('fav_username')},
      set(fav_username){this.setVar({fav_username})}
    },
    wfm_username:{
      get(){return this.getVar('wfm_username')},
      set(wfm_username){this.setVar({wfm_username})}
    },
    jsResultText(){return JSON.stringify(this.jsResult,0,2)},
  },
  methods:{
    close(){//public
      
    },
    ...mapActions({
      setVar:'dev/setVar'
    }),
    eval(){
      this.jsResult=eval(this.js);
    }
  },
  beforeDestroy(){
    
  },
});
Vue.component('WidgetSnmpTest',{
  template:`<div name="WidgetSnmpTest">
    <input-el :placeholder="placeholder" :label="label" v-model="ip" class="margin-bottom-8px">
      <div v-if="valid" slot="postfix" class="margin-left-right-8px display-flex">
        <PingLed v-bind="{ip,mr_id}"/>
      </div>
    </input-el>

    <loader-bootstrap v-if="loading" :text="'поиск СЭ по IP '+ip"/>
    <div v-else-if="ne&&ne.ip==ip" class="display-flex flex-direction-column">
      <component v-for="([is,props],key) of info" :key="key" :is="is" v-bind="props" class="padding-unset"/>
    </div>
    
  </div>`,
  data:()=>({
    ip:'',
    ne:null,
    loads:{},
  }),
  watch:{
    'ip'(ip){
      this.onChangeIp();
    },
  },
  computed:{
    ...mapGetters({
      region_id:'main/region_id',
      region:'main/region',
      mr_id:'main/mr_id',
      mr:'main/mr',
    }),
    placeholder(){return `${this.region?.br_oam_prefix||'10.221'}.xxx.xxx`},
    label(){return this.mr?`IP (МР ${this.mr.name})`:`IP`},
    valid(){return this.mr_id&&this.ip.split('.').filter(Boolean).length===4},
    loading(){return this.loads[this.ip]},
    info(){
      const {ne}=this;if(!ne){return []};
      const {type,ip,region:{location},name,model,vendor,system_object_id,firmware,description,snmp:{version,community},discovery:{date,status}}=ne;
      const modelText=getModelText(vendor,model,system_object_id);
      const title=getNetworkElementReference(type).title;// || type (if unknown)
      const address=truncateSiteAddress(location);
      return [
        title             &&  ['info-text-sec', {text:title}],
        address           &&  ['info-text-sec', {text:address}],
        ip                &&  ['info-value',    {label:'IP',                value:ip,               withLine:true}],
        name              &&  ['info-value',    {label:'Имя',               value:name,             withLine:true}],
        modelText         &&  ['info-value',    {label:'Model',             value:modelText,        withLine:true}],
        version           &&  ['info-value',    {label:'SNMP Version',          value:version,          withLine:true}],
        community         &&  ['info-value',    {label:'SNMP Community',         value:community,        withLine:true}],
        date              &&  ['info-value',    {label:'Dscv date',         value:date,        withLine:true}],
        status            &&  ['info-value',    {label:'Dscv status',         value:status,        withLine:true}],
        description       &&  ['info-text-sec', {text:description}],
        firmware && !new RegExp(firmware).test(description)          &&  ['info-text-sec', {text:firmware}],
      ].filter(v=>v);
    },
  },
  methods:{
    ...mapActions({
      doPing:'dnm/doPing',
    }),
    onChangeIp(){
      const {ip,valid,ne}=this;
      //if(ne?.ip!==ip){this.ne=null};
      if(!ip||!valid){return};
      this.searchByIp();
    },
    async searchByIp(){
      const {ip,region_id}=this;
      this.$set(this.loads,ip,true);
      let ne_name;
      try {
        const response=this.$cache.getItem(ip)||await httpGet(buildUrl('search_ma',{pattern:`@D_IP:${ip}`},'/call/v1/search/'));
        if(Array.isArray(response?.data)){
         this.$cache.setItem(ip,response)
         const nes=response.data.length?response.data.find(d=>d.devices)?.devices:[response.data];
         const ne=nes.find(device=>device.region.id===region_id);
         if(ne){ne_name=ne.name};
        };
      }catch(error){
        console.warn('search_ma.error',error)
      }
      if(ne_name){
        try {
          const response=this.$cache.getItem(ne_name)||await httpGet(buildUrl('search_ma',{pattern:ne_name},'/call/v1/search/'));
          if(response?.data){
            this.$cache.setItem(ne_name,response)
            if(this.ip==response.data.ip){
              this.ne=response.data;
            }
          }
        }catch(error){
          console.warn('search_ma.error',error)
        }
      }
      this.$set(this.loads,ip,!true);
    },
    close(){//public
      
    },
  },
  beforeDestroy(){
    
  },
});
Vue.component('ToEventsMap',{
  template:`<div name="ToEventsMap">
    <input-el placeholder="templateId" label="templateId" v-model="templateId" :disabled="!isDev"/>
    <link-block icon="amount" text="ToEventsMap" @block-click="$router.push({name:'events-map',params:{templateId}})" actionIcon="right-link" type="medium"/>
  </div>`,
  data:()=>({
    templateId:'nsk-gpon-test-2'
  }),
  created(){},
  computed:{
    ...mapGetters({
      region_id:'main/region_id',
      username:'main/username',
    }),
    isDev(){return this.username=='mypanty1'},
  },
  methods:{
    close(){//public
      
    },
  },
  beforeDestroy(){
    
  },
});

document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/EventsMapPage.js',type:'text/javascript'}));
