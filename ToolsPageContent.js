//if(store?.getters?.['main/username']=='mypanty1'){
  store.dispatch('dev/setVar',{showToolsPage:!0})
//};

store.registerModule('vars',{
  namespaced:true,
  state:()=>({
    inetcoreHeader:{'7ozd7ruzzg0ikerc':`dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O`},
    url:`https://ping54.ru/inetcore`,
    getVarsAction:`wbYWLqwlzEs6YnTupX4rcRD7NilO4lHM62iuO0eBOJmruMsSj2DXopKqCBZJGSmd`,
    setVarsAction:`kPK2XxxzwBwhCZrXTxKBl4b2FiSu0h5O1daE3sZuJQiRk8UfrzQ6Vy5cVqjkHKgV`,
    vars:{},
    loading:!1
  }),
  getters:{
    loading:state=>state.loading,
    vars:state=>state.vars,
    getVar:state=>key=>state.vars[key],
  },
  mutations:{
    setLoading(state,loading=!1){
      state.loading=loading;
    },
    setVars(state,vars={}){
      state.vars=vars;
    },
    setVar(state,[key,value]){
      Vue.set(state.vars,key,value);
    },
  },
  actions:{
    async getVars({state,getters,rootGetters,commit}){
      const userLogin=rootGetters.userLogin;if(!userLogin){return};
      commit('setLoading',!0);
      try{
        const response=await fetch(`${state.url}/${state.getVarsAction}?userLogin=${userLogin}`,{
          headers:state.inetcoreHeader,
        }).then(resp=>resp.json());
        commit('setVars',response);
      }catch(error){
        console.warn('getVars:error',error);
      };
      commit('setLoading',!1);
    },
    async setVars({state,getters,rootGetters,commit},vars={}){
      const userLogin=rootGetters.userLogin;if(!userLogin){return};
      commit('setVars',{...getters.vars,...vars});
      commit('setLoading',!0);
      try{
        await fetch(`${state.url}/${state.setVarsAction}`,{
          method:'POST',
          headers:{
            'content-Type':'application/json;charset=utf-8',
            ...state.inetcoreHeader,
           },
          body:JSON.stringify({userLogin,vars})
        });
      }catch(error){
        console.warn('setVars:error',error);
      };
      commit('setLoading',!1);
      return getters.vars;
    }
  },
});
store.dispatch('vars/getVars');

Vue.component('ToolsPageContent',{
  template:`<div class="display-contents">
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
          <template v-if="items.length||hasUniqueItems">
            <devider-line/>
            <div class="display-flex flex-direction-column-reverse gap-8px">
              <template v-for="(item,key) in uniqueItems">
                <SectionBorder class="padding-8px" :key="key" v-if="item">
                  <div class="display-flex justify-content-space-between gap-8px">
                    <div class="font--13-500">{{item.name}}</div>
                    <button-sq icon="close-1" @click="$set(uniqueItems,item.name,null)" type="medium"/>
                  </div>
                  <component :key="item.name" :is="item.is" v-bind="item.props" ref="Widgets"/>
                </SectionBorder>
              </template>
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
          </template>
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
      {name:'Dev',is:'WidgetDev',isDev:!0,isUnique:!0},
      {name:'Device IP',is:'WidgetSnmpTest'},
      {name:'ToEventsMap',is:'ToEventsMap',isDev:!0,isUnique:!0},
      {name:'Документы по нарядам',is:'WidgetGenerateDocs',isUnique:!0},
      {name:'Конфигурация',is:'WidgetUserConfig',isDev:!0,isUnique:!0},
    ],
    items:[],
    uniqueItems:{},
  }),
  created(){},
  watch:{},
  computed:{
    ...mapGetters(['userLogin']),
    someSelected(){return !isEmpty(this.items)},
    isDev(){return this.userLogin=='mypanty1'},
    widgetsItems(){
      const {widgets,isDev,uniqueItems}=this;
      const widgetsList=isDev?widgets:widgets.filter(({isDev})=>!isDev);
      return widgetsList.filter(({name,isUnique})=>!isUnique||(isUnique&&!uniqueItems[name]));
    },
    hasUniqueItems(){return Object.values(this.uniqueItems).filter(Boolean).length},
  },
  methods:{
    addItem(item){
      if(item){
        if(item.isUnique){
          this.$set(this.uniqueItems,item.name,item);
        }else{
          this.items.push(item);
        };
        this.$refs.Selector.clear();
      };
    }
  },
});
Vue.component('WidgetUserConfig',{
  template:`<div>
    <div class="font--13-500" v-for="(value,key) in vars" :key="key" v-if="value">{{key}}: {{value}}</div>
    <div class="display-flex align-items-center justify-content-space-between gap-8px">
      <input-el placeholder="key" label="key" v-model="key"/>
      <input-el placeholder="value" label="value" v-model="value"/>
    </div>
    <link-block icon="amount" text="set value" @block-click="setVar" :disabled="disabled" :actionIcon="loading?'loading rotating':'right-link'" type="medium"/>
  </div>`,
  data:()=>({
    key:'',
    value:'',
    setVar_loading:!1,
  }),
  watch:{
    'setVar_loading'(setVar_loading){
      if(!setVar_loading){
        this.value='';
        this.key='';
      };
    }
  },
  computed:{
    ...mapGetters({
      loading:'vars/loading',
      vars:'vars/vars'
    }),
    disabled(){return !this.key||this.loading},
  },
  methods:{
    close(){//public
      
    },
    ...mapActions({
      setVars:'vars/setVars'
    }),
    async setVar(){
      const {value,key}=this;
      this.setVar_loading=!0;
      try{
        await this.setVars({[key]:value});
      }catch(error){
        console.warn('setVar:error',error);
      }
      this.setVar_loading=!1;
    }
  },
  beforeDestroy(){
    
  },
});
Vue.component('WidgetGenerateDocs',{
  template:`<div class="display-flex flex-direction-column gap-8px">
    <input-el label="Инженер ФИО (Исполнитель работ)" placeholder="Фамилия И. О." v-model="docData_engineerFIO_new" :disabled="varsLoading">
      <button-sq slot="postfix2" :icon="varsLoading?'loading rotating tone-500':docData_engineerFIO_modifed?'purse':'purse tone-500'" @click="setVarsFIO" :disabled="varsLoading||!docData_engineerFIO_modifed" type="large"/>
    </input-el>
    
    <input-el label="Ведущий инженер ФИО (Акт выдал)" placeholder="Фамилия И. О." v-model="docData_brigadirFIO_new" :disabled="varsLoading" class="margin-top--8px">
      <button-sq slot="postfix2" :icon="varsLoading?'loading rotating tone-500':docData_brigadirFIO_modifed?'purse':'purse tone-500'" @click="setVarsFIO" :disabled="varsLoading||!docData_brigadirFIO_modifed" type="large"/>
    </input-el>
    
    <div v-if="wfmTasksCount" class="display-flex flex-direction-column gap-8px">
      <div class="display-flex flex-direction-column" style="border:1px solid #c8c7c7;border-radius:4px">
        <div class="font--13-500 margin-left-8px">Фильтр по типам:</div>
        <devider-line m="0"/>
        <checkbox-el v-for="(value,taskType) in taskTypesFilter" :key="taskType" v-model="taskTypesFilter[taskType]" reverse class="margin-left-8px">
          <div slot="label" :class="{'tone-500 text-decoration-line-through':!taskTypesFilter[taskType]}">{{taskType}}</div>
        </checkbox-el>
      </div>
      <div class="display-flex flex-direction-column" style="border:1px solid #c8c7c7;border-radius:4px">
        <div class="font--13-500 margin-left-8px">Фильтр по статусам:</div>
        <devider-line m="0"/>
        <checkbox-el v-for="(value,taskStatus) in taskStatusesFilter" :key="taskStatus" v-model="taskStatusesFilter[taskStatus]" reverse class="margin-left-8px">
          <div slot="label" :class="{'tone-500 text-decoration-line-through':!taskStatusesFilter[taskStatus]}">{{taskStatus}}</div>
        </checkbox-el>
      </div>
    </div>
    
    <div class="font--13-500 text-align-center">Наряды: {{wfmTasksFilteredCount}} {{wfmTasksFilteredCount!==wfmTasksCount?('из '+wfmTasksCount):''}}</div>
    
    <checkbox-el v-if="userLogin=='mypanty1'" v-model="merge" reverse class="margin-left-8px">
      <div slot="label">В один файл</div>
    </checkbox-el>
        
    <button-main label="Отправить себе" @click="generate" :loading="genDocLoading" :disabled="!wfmTasksFilteredCount||genDocLoading||!userLogin||someInputButNotSaved||varsLoading" buttonStyle="contained" size="full"/>
    <message-el v-if="genDocResultMessage" :text="genDocResultMessage.text" box :type="genDocResultMessage.type"/>
  </div>`,
  data:()=>({
    genDocLoading:false,
    genDocResultMessage:null,
    docData_engineerFIO_new:'',
    docData_brigadirFIO_new:'',
    setVar_loading:!1,
    taskTypesFilter:{},
    taskStatusesFilter:{},
    merge:!1,
  }),
  created(){
    this.initFilter();
  },
  mounted(){
    this.docData_engineerFIO_new=this.docData_engineerFIO;
    this.docData_brigadirFIO_new=this.docData_brigadirFIO;
  },
  computed:{
    ...mapGetters(['userLogin']),
    ...mapGetters({
      wfmTasks:'wfm/tasks',
      wfmTasksCount:'wfm/tasksCount',
      vars:'vars/vars',
      getVar:'vars/getVar',
      varsLoading:'vars/loading',
    }),
    docData_engineerFIO(){return this.getVar('docData_engineerFIO')},
    docData_brigadirFIO(){return this.getVar('docData_brigadirFIO')},
    docData_engineerFIO_modifed(){return this.docData_engineerFIO_new!==this.docData_engineerFIO},
    docData_brigadirFIO_modifed(){return this.docData_brigadirFIO_new!==this.docData_brigadirFIO},
    someInputButNotSaved(){return this.docData_engineerFIO_modifed||this.docData_brigadirFIO_modifed},
    wfmTasksFiltered(){
      const taskTypesKeys=Object.entries(this.taskTypesFilter).filter(([,en])=>en).map(([key])=>key);
      const taskStatusesKeys=Object.entries(this.taskStatusesFilter).filter(([,en])=>en).map(([key])=>key);
      return this.wfmTasks.filter(({tasktype})=>taskTypesKeys.includes(tasktype)).filter(({status})=>taskStatusesKeys.includes(status));
    },
    wfmTasksFilteredCount(){return Object.values(this.wfmTasksFiltered).length},
  },
  watch:{
    'docData_engineerFIO'(docData_engineerFIO){
      this.docData_engineerFIO_new=docData_engineerFIO;
    },
    'docData_brigadirFIO'(docData_brigadirFIO){
      this.docData_brigadirFIO_new=docData_brigadirFIO;
    },
    'wfmTasks'(){
      this.initFilter();
    },
  },
  methods:{
    close(){//public
      
    },
    ...mapActions({
      setVars:'vars/setVars'
    }),
    initFilter(){
      for(const {tasktype,status} of this.wfmTasks){
        this.$set(this.taskTypesFilter,tasktype,this.taskTypesFilter[tasktype]??true)
        this.$set(this.taskStatusesFilter,status,this.taskStatusesFilter[status]??true)
      };
    },
    async setVarsFIO(){
      const {docData_engineerFIO_new,docData_brigadirFIO_new}=this;
      try{
        await this.setVars({
          docData_engineerFIO:docData_engineerFIO_new,
          docData_brigadirFIO:docData_brigadirFIO_new,
        });
      }catch(error){
        console.warn('setVarsFIO:error',error);
      };
    },
    async generate(){
      const {wfmTasksFiltered,genDocLoading,userLogin,vars}=this;
      if(!userLogin){return};
      if(genDocLoading){return};
      this.genDocLoading=!0;
      this.genDocResultMessage=null;
      try {
        await fetch(`https://ping54.ru/gendoc/muHgAyxPccHvtJvOi79iORchHiBv9ePmKnDK3csK7dSrqisqFIbWNJ4vSkCFNytG?userLogin=${userLogin}`,{
          method:'POST',
          headers:{
            'content-type':'application/json',
            'mczx6id3h5lmbrlq':'ovtocINZuzraRJLQgiQp7HGZMhF1fhX4GDmWRYRJCOMMJsI9xpT5zq1mYeg7DvH8',
          },
          body:JSON.stringify({
            userLogin,
            docs:wfmTasksFiltered.map(wfmTask=>({docTemplateName:'Акт выполненных работ',docData:wfmTask})),
            vars,
          })
        });
        this.genDocResultMessage={type:'success',text:`документы отправлены на ${userLogin}@mts.ru`};
      }catch(error){
        this.genDocResultMessage={type:'warn',text:`ошибка сервиса gendoc`};
      };
      this.genDocLoading=!1;
    }
  },
  beforeDestroy(){
    
  },
});
Vue.component('WidgetPing',{
  template:`<div>
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
  template:`<div>
    <input-el placeholder="wfm_username" label="wfm_username" v-model="wfm_username"/>
    <input-el placeholder="fav_username" label="fav_username" v-model="fav_username"/>
    <devider-line/>
    <div class="font--13-500">eval</div>
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
  template:`<div>
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
  template:`<div>
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
