Vue.component('FindPort',{
  template:`<div name="FindPort" class="display-contents">
    <FindPort2 v-bind="$props"/>
    <LinkChangeTrapsEvents v-bind="{site_id}"/>
  </div>`,
  props:{
    devices:{type:Object,default:()=>({})},
    racks:{type:Object,default:()=>({})},
    entrances:{type:Object,default:()=>({})},
    replaceSwitchOnCheckbox:{type:Boolean,default:false},
    selectedEntrance:{type:Object},
    site_id:{type:String,default:'[site_id]'},
  },
});
Vue.component('LinkChangeTrapsEvents',{
  template:`<CardBlock name="LinkChangeTrapsEvents">
    <title-main text="Трапы Link-Change" :text2="text2" text2Class="font--13-500 tone-500" :textSub="textSub" textSubClass="font--13-500 tone-500" @open="show=!show">
      <button-sq icon="mark-circle" type="large" @click="help.show=!help.show"/>
    </title-main>
    <info-text-icon v-if="help.show" icon="info" :text="help.text"/>
    <div v-if="show" class="margin-left-right-16px">
      <div class="font--12-400 tone-500">{{message}}</div>
      <SectionBorder v-if="recived.length" class="display-grid gap-2px margin-top-8px padding-4px" style="grid-template-columns:repeat(2, max-content) 1fr max-content;max-width:420px;">
        <div class="display-contents">
          <div class="font--13-500 text-align-center">time</div>
          <div class="font--13-500 text-align-center">device</div>
          <div class="font--13-500 text-align-center">port</div>
          <div class="font--13-500 text-align-center">link</div>
        </div>
        <devider-line m=0 style="grid-column:span 4;"/>
        <div class="display-contents" v-for="row of traps" :key="row.trap_id">
          <div class="font--13-500 tone-500">{{row.time||row.date}}</div>
          <div @click="goToNe(row)" class="font--13-500 bg-tone-200 border-radius-2px padding-left-right-2px cursor-pointer">{{row.ipShort}}</div>
          <div @click="goToPort(row)" class="font--13-500 cursor-pointer">{{row.portName}}</div>
          <LinkLed2050 @click="goToPort(row)" :loading="loads.vct[row.port_id]?.[row.trap_id]" :error="false" :admin_state="row?.ifAdminStatus=='enable'?'up':'down'" :oper_state="row?.ifOperStatus=='up'?'up':'down'"/>
        </div>
      </SectionBorder>
    </div>
  </CardBlock>`,
  props:{
    site_id:{type:String,default:'',required:true},
  },
  data:()=>({
    show:true,
    help:{
      text:`Перехват событий link-change от коммутаторов. Функционал частично аналогичен траполовке в ping54. Подписки на все коммутаторы на площадке продлеваются на час при заходе на страницу площадки. Список событий, по достижении 50, слайсится на 10 последних.`,
      show:false,
    },
    recived:[],
    message:'',
    loads:{
      vct:{},
    },
    resps:{
      vct:{},
    },
  }),
  created(){
    const {site_id}=this;
    this.getSiteNetworkElements({site_id});
  },
  watch:{
    'networkElementsDuESwInstalled54'(networkElements){
      if(!Object.values(networkElements).length){return};
      this.init();
    },
    'recived.length'(length){
      if(length>50){
        const deleted=this.recived.splice(0,10);
        console.log('deleted old messages',deleted,this.recived.length)
      }
    },
  },
  computed:{
    ...mapGetters({
      getNetworkElementsBySiteId:'site/getNetworkElementsBySiteId',
    }),
    networkElements(){return this.getNetworkElementsBySiteId(this.site_id)},
    networkElementsDuESwInstalled54(){
      return select(this.networkElements,{
        region_id:54,
        ne_name:testByName.neIsETH,
        node_name:testByName.nodeIsDu,
        ne_status:testByName.neIsInstalled,
        site_id:this.site_id,
        //node_id:this.node_id,
        ip:(ip)=>!!ip,
        sysObjectID:(sysObjectID)=>!!sysObjectID,
      })
    },
    text2(){
      const count=this.recived.length;
      return count?`${count} ${plural(['event','events','events'],count)}`:''
    },
    textSub(){
      const count=Object.values(this.networkElementsDuESwInstalled54).length;
      return count?`прослушка ${count} ${plural(['коммутатора','коммутаторов','коммутаторов'],count)}`:''
    },
    traps(){
      return [...this.recived].reverse().reduce((rows,snmp_trap)=>{
        const {date='',time='',ip='',trap_data={},trap_id='',trap_pdu_type,trap_type}=snmp_trap;
        //if(trap_type!=='LinkChange'){return rows};
        const {ifIndex=0,ifDescr='',ifAdminStatus='',ifOperStatus=''}=trap_data;
        const port_id=`${ip}-${ifIndex}`;
        if(ifOperStatus==='down'){
          //this.getVCT({ip,ifIndex,ifDescr,trap_id,port_id})
        };
        const [_10,_221,ip2,ip3]=ip.split('.');
        const ipShort=`..${ip2}.${ip3}`;
        const portName=ifDescr||`Port${ifIndex}`;
        rows.push({
          date,
          time,
          ip,
          ipShort,
          portName,
          port_id,
          trap_id,
          ifIndex,
          ifDescr,
          ifAdminStatus,
          ifOperStatus
        })
        return rows;
      },[]);
    },
    isNotEmpty(){
      return this.recived.length;
    },
  },
  methods:{
    ipOnThisSiteId(_ip){
      return !!Object.values(this.networkElementsDuESwInstalled54).find(({ip})=>_ip==ip)
    },
    ...mapActions({
      getSiteNetworkElements:'site/getSiteNetworkElements',
    }),
    async init(){
      const login=this.$root.username;
      if(!login){return};
      
      this.initWs();
      
      const {site_id}=this;
      const subscribes=Object.values(this.networkElementsDuESwInstalled54).map(({ip})=>{
        return fetch(`https://ping54.ru/addDeviceSnmpTrapsUserSubscription?${objectToQuery({ip,login,site_id})}`,{
          headers:{'user-key':'LFjoMC6x-bWQlVyX3-FFPZGwvf-lOo5rT2o-uuubGsRh-eOdFpD4Y'}
        });
      });
      await Promise.allSettled(subscribes);
    },
    closeWs(){
      window.ws.close();
      window.ws=null;
    },
    clear(){
      this.recived=[];
    },
    send(data=null){
      const login=this.$root.username;
      if(!login){return};
      if(!window.ws){return};
      window.ws.send(JSON.stringify({type:'data',user:login,data})):
    },
    initWs(){
      const login=this.$root.username;
      if(!login){return};
      this.message=`установка соединения ${login}`;
      window.ws=window.ws||new WebSocket(`wss://ping54.ru/wstest`,[login]);
      window.ws.onopen=(event)=>{
        console.log('ws.onopen');
        const alive={type:'alive',user:login};
        window.ws.send(JSON.stringify(alive));
        setTimeout(()=>window.ws.send(JSON.stringify(alive)),60000);
        this.message=`соединение ${login} активно`;
      };
      window.ws.onmessage=(event)=>{
        let message=event.data;
        try{
          message=JSON.parse(message);
        }catch(error){
          message={type:'text',text:message};
        };
        console.log('ws.onmessage',message);
        if(message.type==='snmp_trap'&&message?.data&&message.data?.trap_type=='LinkChange'){//только LinkChange
          if(this.ipOnThisSiteId(message.data?.ip)){//только по текущему site_id
            this.recived.push(message.data);
          }
        };
        if(message.type==='alive'){
          this.message=`соединение активно ${message.date}`;
        }else{
          this.message=`соединение активно ${new Date().toLocaleString()}`;
        }
      };
      window.ws.onclose=(event)=>{
        window.ws=null;
        if(event.wasClean){
          console.log('ws.onclose.wasClean',event.code,event.reason);
          this.message=`соединение закрыто`;
        }else{
          console.log('ws.onclose',event.code,event.reason);
          this.message=`соединение потеряно`;
          setTimeout(()=>this.initWs(),4000);//reconnect after 4sec
        };
      };
      window.ws.onerror=(error)=>{
        console.log('ws.onerror',error.message);
      };
    },
    async getVCT({ip,ifIndex,ifDescr,trap_id,port_id}){
      const login=this.$root.username;
      if(!login){return};
      if(this.resps.vct[port_id]?.[trap_id]){return};
      if(!ip){return};
      if(!ifIndex){return};
      if(this.loads.vct[port_id]?.[trap_id]){return};
      if(!this.loads.vct[port_id]){this.$set(this.loads.vct,port_id,{})};
      if(!this.resps.vct[port_id]){this.$set(this.resps.vct,port_id,{})};
      if(Object.values(this.loads.vct[port_id]).some(v=>v)){
        //заглушка чтобы не делать кабельтест порта по которому еще не сделан предъидущий
        this.$set(this.loads.vct[port_id],trap_id,false);
        this.$set(this.resps.vct[port_id],trap_id,{prev_is_not_done:true})
        return
      };
			this.$set(this.loads.vct[port_id],trap_id,true);
      this.$set(this.resps.vct[port_id],trap_id,null)
      try{
        const resp=await fetch(`https://ping54.ru/api/v1/getVCT?${objectToQuery({ip,ifIndex,ifName:ifDescr||ifIndex,login})}`,{
          headers:{'user-key':'LFjoMC6x-bWQlVyX3-FFPZGwvf-lOo5rT2o-uuubGsRh-eOdFpD4Y'}
        }).then(r=>r.json());
        if(resp/*&&!resp.error*/){//сохраняем ошибку чтобы не делать повторно
					this.resps.vct[port_id][trap_id]=resp?.[ifIndex]?.vct||{empty:true};
				};
      }catch(error){
        console.warn('getVCT',error);
      };
      this.loads.vct[port_id][trap_id]=false;
		},
    getIsCable(port_id,trap_id){
      const vct=this.resps.vct[port_id]?.[trap_id];
      if(!vct){return};
      if(vct.prev_is_not_done||vct.empty||vct.error){return};
      return true;
    },
    goToPort({ip,ifIndex}){
      const ne=Object.values(this.networkElementsDuESwInstalled54).find(ne=>ne.ip===ip);
      if(!ne){return};
      const {ne_name}=ne;
      const port_name=`PORT-${ne_name}/${ifIndex}`;
      this.$router.push({ name: "eth-port", params: { id: port_name } });
      this.send({click:port_name});
      this.closeWs();
    },
    goToNe({ip}){
      const ne=Object.values(this.networkElementsDuESwInstalled54).find(ne=>ne.ip===ip);
      if(!ne){return};
      const {ne_name}=ne;
      this.$router.push({ name: "network-element", params: { device_id: ne_name } });
      this.send({click:ne_name});
      this.closeWs();
    },
  },
});
Vue.component('FindPort2',{
  template:`<CardBlock name="FindPort" class="find-port">
    <title-main :text="titleText" @open="show=!show">
      <button-sq icon="mark-circle" type="large" @click="help.show=!help.show"/>
    </title-main>
    <info-text-icon v-if="help.show" icon="info" :text="help.text"/>
    <template v-if="show">
      <message-el v-if="noEth" text="Нет коммутаторов" type="warn" class="padding-left-right-16px margin-bottom-8px" box/>
      <template v-else>
        <title-main icon="server" text="Коммутаторы" :text2="titleText2" :text2Class="titleText2Class" @open="showSelect=!showSelect" :opened="showSelect" class="margin-top--16px">
          <button-sq icon="factors" @click="showSelect=!showSelect"/>
        </title-main>
        <div v-if="showSelect" class="margin-left-right-16px">
          <title-main text="Выбор по модели" :text2="filterByVendor_countChecked" text2Class="tone-500" @open="showFilterByModel=!showFilterByModel" class="margin-top-bottom--8px padding-left-unset"/>
          <template v-if="showFilterByModel">
            <checkbox-el v-for="(filter,vendor) in filterByVendor" :key="vendor" :label="filter.label" v-model="filter.state" :class="{'width-100-100 bg-main-lilac-light border-radius-4px':filter.state}"/>
          </template>
          <title-main v-if="isFiltrableByEntrance" text="Выбор по подъезду ШДУ" :text2="filterByEntrance_countChecked" text2Class="tone-500" @open="showFilterByEntrance=!showFilterByEntrance" class="margin-top-bottom--8px padding-left-unset"/>
          <template v-if="showFilterByEntrance">
            <checkbox-el v-for="(filter,entrance) in filterByEntrance" :key="'entrance_'+entrance" :label="filter.label" v-model="filter.state" :class="{'width-100-100 bg-main-lilac-light border-radius-4px':filter.state}"/>
          </template>
          <title-main v-if="isFiltrableByFloor" text="Выбор по этажу ШДУ" :text2="filterByFloor_countChecked" text2Class="tone-500" @open="showFilterByFloor=!showFilterByFloor" class="margin-top-bottom--8px padding-left-unset"/>
          <template v-if="showFilterByFloor">
            <checkbox-el v-for="(filter,floor) in filterByFloor" :key="'floor_'+floor" :label="filter.label" v-model="filter.state" :class="{'width-100-100 bg-main-lilac-light border-radius-4px':filter.state}"/>
          </template>
          <title-main v-if="isFiltrableByEntrances" text="Выбор по ГГО коммутатора" :text2="filterByEntrances_countChecked" text2Class="tone-500" @open="showFilterByEntrances=!showFilterByEntrances" class="margin-top-bottom--8px padding-left-unset"/>
          <template v-if="showFilterByEntrances">
            <checkbox-el v-for="(filter,entrance) in filterByEntrances" :key="'ggo_entrance_'+entrance" :label="filter.label" v-model="filter.state" :class="{'width-100-100 bg-main-lilac-light border-radius-4px':filter.state}"/>
          </template>
          <title-main text="Выбор по IP" :text2="ethSelect_countChecked" text2Class="tone-500" @open="showFilterByIp=!showFilterByIp" class="margin-top-bottom--8px padding-left-unset"/>
          <template v-if="showFilterByIp">
            <checkbox-el v-for="device of ethDevices" :key="device.name" :label="device.ip" :label2="device.model" :disabled="ethSelect[device.ip].filtered" v-model="ethSelect[device.ip].selected" @change="setSelect(device.ip)" reverse>
              <div slot="label" class="display-inline-flex gap-2px justify-content-space-between width-100-100" :class="{'tone-500 text-decoration-line-through':ethSelect[device.ip].filtered}">
                <span>{{device.ip}}</span>
                <span>{{device.model}}</span>
              </div>
            </checkbox-el>
          </template>
          <div class="width-100-100 display-inline-flex justify-content-space-between" hidden>
            <span class="font--15-500">Не выбрать все</span>
            <checkbox-el v-if="replaceSwitchOnCheckbox" v-model="selectAll"/>
            <switch-el v-else v-model="selectAll" @change-test="toggleSelectAll"/>
            <span class="font--15-500">Выбрать все</span>
          </div>
          <devider-line/>
        </div>
        
        <div class="width-100-100 display-inline-flex justify-content-space-between align-items-center padding-left-right-16px">
          <span class="font--15-500">C кабель-тестом</span>
          <checkbox-el v-if="replaceSwitchOnCheckbox" v-model="saveData.cableTest" :disabled="!selectedCount"/>
          <switch-el v-else v-model="saveData.cableTest" :disabled="!selectedCount"/>
        </div>
        <div class="width-100-100 display-inline-flex justify-content-center padding-left-right-16px" v-if="selectedCount!==totalCount">
          <info-text-sec :text="selectedTest"/>
        </div>
        <div class="margin-left-right-16px margin-top-8px">
          <button-main @click="getPortStatuses('save')" label="Сохранить состояние портов" :loading="loading.save" :disabled="!selectedCount" :buttonStyle="saveStatus.style" size="full"/>
          <collapse-slide :opened="!!saveTime&&!!selectedCount">
            <message-el :text="savedText" :type="saveData.savedCount?'success':'warn'" box class="margin-top-8px"/>
          </collapse-slide>
        </div>
        
        <div class="margin-left-right-16px margin-top-8px">
          <div v-if="allPortsCount" class="width-100-100 display-inline-flex justify-content-space-between align-items-center" @click="showAll=!showAll">
            <span class="font--15-500">{{'Показать все порты '+(allPortsCount?('('+allPortsCount+')'):'')}}</span>
            <checkbox-el v-if="replaceSwitchOnCheckbox" v-model="showAll" :disabled="!ports.savedPorts"/>
            <switch-el v-else v-model="showAll" :disabled="!ports.savedPorts"/>
          </div>
        </div>
        
        <template v-if="showAll">
          <devider-line/>
          <title-main icon="view-module" text="Все порты" :text2="saveTime?('кэш: '+saveTime):''" text2Class="tone-500"/>
          <template v-for="(device,i) of allPorts">
            <devider-line v-if="i" class="margin-left-right-16px"/>
            <title-main icon="router" :text="device.ip||device.name" :text2="device.ports.length?(device.ports.length+' портов'):''" text2Class="tone-500" @open="showDevicePorts[device.name]=!showDevicePorts[device.name]" class="margin-top-bottom--8px">
              <button-sq icon="refresh" type="large" @click="update_port_status('find_port_all_',device.name)"/>
            </title-main>
            <FindPortItem v-if="showDevicePorts[device.name]" v-for="port of device.ports" :key="port.key" :changedPort="port" :ref="'find_port_all_'+device.name"/>
          </template>
        </template>
       
        <div class="margin-left-right-16px margin-top-8px">
          <button-main @click="getPortStatuses('compare')" label="Сравнить состояние портов" size="full" :loading="loading.compare" :disabled="!selectedCount||compareStatus.disabled||!saveData.savedCount" :buttonStyle="compareStatus.style"/>
          <collapse-slide :opened="!!ports.comparedPorts&&!!selectedCount">
            <message-el :text="comparedText" type="success" box class="margin-top-8px"/>
          </collapse-slide>
        </div>
        <!--9135155036913492310-->
        <message-el v-for="device in ports.savedPorts||{}" :key="device.name+':'+device.ip" v-if="device.message" :text="device.name+':'+device.ip" :subText="device.message" type="warn" box class="margin-left-right-16px margin-top-bottom-4px"/>
        
        <template v-if="!showAll&&ports.changedPorts&&ports.changedPorts.length">
          <devider-line/>
          <title-main icon="search" text="Найденные порты" :text2="saveTime?('кэш: '+saveTime):''" text2Class="tone-500">
            <button-sq icon="refresh" type="large" @click="update_port_status('find_port_changed_')"/>
          </title-main>
          <template v-for="(device,ip,i) in changedPortsByDevices">
            <devider-line v-if="i" class="margin-left-right-16px"/>
            <title-main icon="router" :text="device.ip||device.name" :text2="device.ports.length?(device.ports.length+' портов'):''" text2Class="tone-500" @open="showDevicePortsChanged[device.name]=!showDevicePortsChanged[device.name]" class="margin-top-bottom--8px">
              <button-sq icon="refresh" type="large" @click="update_port_status('find_port_changed_',device.name)"/>
            </title-main>
            <FindPortItem v-if="showDevicePortsChanged[device.name]" v-for="port of device.ports" :key="port.key" :changedPort="port" :ref="'find_port_changed_'+device.name"/>
          </template>
        </template>
      </template>
    </template>
  </CardBlock>`,
  props:{
    devices:{type:Object,default:()=>({})},
    racks:{type:Object,default:()=>({})},
    entrances:{type:Object,default:()=>({})},
    replaceSwitchOnCheckbox:{type:Boolean,default:false},
    selectedEntrance:{type:Object},
    site_id:{type:String,default:'[site_id]'},
  },
  data:()=>({
    loading:{
      save:false,
      compare:false
    },
    show:true,
    help:{
      text:`Можно сохранить состояние всех портов и после сравнить их состояние. Состояние изменяется при пропадании либо появлении линка на порту. Можно расширить сравнение кабель-тестом, будет отслеживаться замыкание/размыкание пар и расхождение в длинне более 3м. Некторые модели коммутаторов прозводят кабель-тест дольше обычного на пару минут, для быстрого поиска рекомендуется искать изменение по линку на порту. 
      С помощью фильтра, для ускорения поиска, можно сузить список коммутаторов для опроса. Можно выбрать по месту устновки ШДУ, по ГГО коммутатора, а также по IP и по производителю.`,
      show:false,
    },
    ports:{
      savedPorts:null,
      comparedPorts:null,
      changedPorts:null,
    },
    portsInfo:{},
    saveData:{
      time:null,
      cableTest:false,
      savedCount:0,
      changedCount:0
    },
    showSelect:false,//свернуть селектор и фильтр
    showFilterByModel:true,
    showFilterByEntrance:true,
    showFilterByFloor:true,
    showFilterByEntrances:true,
    showFilterByIp:true,
    ethSelect:{},//селектор устройств для опроса
    filterByVendor:{},//по вендору
    filterByEntrance:{},//по шкафу
    filterByFloor:{},//по шкафу
    filterByEntrances:{},//по ГГО
    selectAll:true,
    showAll:false,
    showDevicePorts:{},//список устройств для просмотра портов
    showDevicePortsChanged:{},//список устройств для просмотра портов
  }),
  created() {
    this.loadCache();
  },
  watch:{
    'selectAll'(selectAll){
      this.toggleSelectAll();
    }
  },
  computed: {
    isFiltrableByEntrance(){return !!Object.keys(this.filterByEntrance).length},
    isFiltrableByFloor(){return !!Object.keys(this.filterByFloor).length},
    isFiltrableByEntrances(){return !!Object.keys(this.filterByEntrances).length},
    filteredAndSelectedEthDevices(){
      let selected=Object.keys(this.ethSelect).filter(ip=>this.ethSelect[ip].selected).map(ip=>this.ethDevices.find(device=>device.ip===ip)).filter(d=>d);
      let filtered=[...selected];
      
      const vendors=Object.keys(this.filterByVendor).reduce((variants,key)=>{
        if(this.filterByVendor[key]?.state){variants.push(key)}
        return variants
      },[]);
      if(vendors.length){
        filtered=filtered.filter(device=>vendors.includes(device?.vendor));
      };
      
      const entrances=Object.keys(this.filterByEntrance).reduce((variants,key)=>{
        if(this.filterByEntrance[key]?.state){variants.push(key)}
        return variants
      },[]);
      if(entrances.length){
        filtered=filtered.filter(device=>entrances.includes(device?.filter?.entrance_number));
      };
      
      const floors=Object.keys(this.filterByFloor).reduce((variants,key)=>{
        if(this.filterByFloor[key]?.state){variants.push(key)}
        return variants
      },[]);
      if(floors.length){
        filtered=filtered.filter(device=>floors.includes(device?.filter?.floor_name));
      };
      
      const ggo=Object.keys(this.filterByEntrances).reduce((variants,key)=>{
        if(this.filterByEntrances[key]?.state){variants.push(key)}
        return variants
      },[]);
      if(ggo.length){
        filtered=filtered.filter(device=>(device?.filter?.entrances||[]).find(entrance=>ggo.includes((entrance.number/*+'_'+entrance.range*/))));
      };
      
      selected.map(device=>{
        this.$set(this.ethSelect,device.ip,{//серим фильтрацию в селекторе
          ...this.ethSelect[device.ip],
          filtered:!filtered.find(fd=>fd.ip===device.ip)
        });
      });
      return filtered;
    },
    ethSelect_countChecked(){return Object.values(this.ethSelect).filter(filter=>!filter.filtered&&filter.selected).length},
    filterByVendor_countChecked(){return Object.values(this.filterByVendor).filter(filter=>filter.state).length},
    filterByEntrance_countChecked(){return Object.values(this.filterByEntrance).filter(filter=>filter.state).length},
    filterByFloor_countChecked(){return Object.values(this.filterByFloor).filter(filter=>filter.state).length},
    filterByEntrances_countChecked(){return Object.values(this.filterByEntrances).filter(filter=>filter.state).length},
    saveStatus() {
      return {
        style: this.ports.savedPorts ? 'outlined' : 'contained',
        loading: this.loading.save,
        time: this.saveData.time,
      };
    },
    saveTime(){
      const {time}=this.saveData;
      if(!time){return ''};
      return time;//время до секунд, для быстрых сохранений
    },
    compareStatus() {
      return {
        style: 'contained',
        loading: this.loading.compare,
        disabled: !this.ports.savedPorts,
      };
    },
    ethDevices(){//only descovered ETH and adm state = T or C
      return Object.values(this.devices).filter(device=>/eth/i.test(device.name)&&device.system_object_id&&!device.ne_status&&device.ip).reduce((devices,device,i,_devices)=>{
        //add filter keys to device.filter
        const entrances=Object.values(this.entrances).filter(entrance=>entrance.device_id_list.includes(device.nioss_id)).reduce((entrances,entrance)=>{
          if(entrances.find(e=>e.id===entrance.id)){return entrances};
          const {id=0,number=0,flats={}}=entrance;
          const {from=0,to=0,range='',count=0}=flats;
          return [...entrances,{id,number,from,to,range,count}];
        },[]);

        const rack=Object.values(this.racks).find(rack=>rack.ne_in_rack.includes(device.name));
        const {entrance={},floor=null,off_floor=null}=rack||{};
        const {number:entrance_number=null}=entrance;
        const floor_name=off_floor||floor;

        return [...devices,{...device,filter:{entrances,entrance_number,floor_name}}]
      },[]).map(device=>{
        //set filters initial store
        this.$set(this.ethSelect,device.ip,{selected:true,filtered:true});
        const vendor=device?.vendor;
        if(vendor){
          const isHuawei=vendor==='HUAWEI';
          //this.$set(this.filterByVendor,vendor,{label:`${isHuawei?'только не ':''}${vendor}`,state:false,invert:isHuawei});
          this.$set(this.filterByVendor,vendor,{label:vendor,state:false});
        };
        const entrance_number=device?.filter?.entrance_number;
        if(entrance_number){
          this.$set(this.filterByEntrance,entrance_number,{label:`подъезд №${entrance_number}`,state:false});
        };
        const floor_name=device?.filter?.floor_name;
        if(floor_name){
          const off_floor={'Чердак':'на чердаке','Технический этаж':'на тех.этаже','Подвал':'в подвале'}[floor_name];
          this.$set(this.filterByFloor,floor_name,{label:off_floor||`этаж ${floor_name}`,state:false});
        };
        for(const entrance of device?.filter?.entrances||[]){
          const state=this.selectedEntrance?.id==entrance.id;
          this.$set(this.filterByEntrances,entrance.number/*+'_'+entrance.range*/,{label:`подъезд №${entrance.number} (кв. ${entrance.range})`,state});
        };
        return device;
      }).sort((a,b)=>{//sort by ip octets
        const a12=a.ip.split('.').map(oct=>oct.padStart(3,0)).join('');
        const b12=b.ip.split('.').map(oct=>oct.padStart(3,0)).join('');
        return parseInt(a12)-parseInt(b12);
      });
    },
    noEth(){
      return !this.ethDevices.length;
    },
    allPorts(){
      let allPorts=[];
      for(let devicename in this.ports.savedPorts||{}){
        allPorts.push({
          ...this.ports.savedPorts[devicename],
          ports:(this.ports.savedPorts[devicename].ports||[]).map(port=>{
            return {
              port,
              device:this.ports.savedPorts[devicename].device,
              key:this.ports.savedPorts[devicename].ip+':'+port.index_iface+':'+port.iface
            };
          }),
        });
        this.$set(this.showDevicePorts,devicename,this.showDevicePorts[devicename]||false);
      };
      return allPorts.sort((a,b)=>parseInt(a.ip.split('.')[3])-parseInt(b.ip.split('.')[3]));//sorted by ip
    },
    allPortsCount(){
      return Object.keys(this.ports.savedPorts||{}).map(device_name=>this.ports.savedPorts[device_name].ports||[]).flat().length
    },
    changedPortsByDevices(){//group by ip
      if(!this.ports.changedPorts){return};
      return this.ports.changedPorts.reduce((groups,changedPort,i)=>{
        const {port,device={},key=i}=changedPort;
        const {ip,name}=device;
        this.$set(this.showDevicePortsChanged,name,this.showDevicePortsChanged[name]||true);
        return {
          ...groups,
          [ip]:{
            ...device,
            ports:[
              ...groups[ip]?.ports||[],
              changedPort
            ]
          }
        }
      },{})
    },
    titleText(){return `Поиск ${this.saveData.cableTest?'кабеля в':'линка на'} порту`},
    totalCount(){return this.ethDevices.length},
    selectedCount(){return this.filteredAndSelectedEthDevices.length},
    titleText2(){return `${this.selectedCount||'0'} из ${this.totalCount||'0'}`},
    titleText2Class(){return `tone-500 ${(this.selectedCount!=this.totalCount)&&'bg-main-lilac-light border-radius-4px padding-left-right-4px'}`},
    selectedTest(){return `выбрано ${this.selectedCount||'0'} из ${this.totalCount||'0'} устройств`},
    savedText(){return `Сохранение портов прошло успешно в ${this.saveTime}, опрошено ${this.saveData.savedCount||0} устройств`},
    comparedText(){return `Сравнение портов прошло успешно, изменилось ${this.saveData.changedCount||0} порта`},
  },
  methods: {
    update_port_status(prefix,device_name){
      if(!prefix){return};
      const regexp=new RegExp('^'+prefix+(device_name?('('+device_name+')$'):''))
      const refs=Object.keys(this.$refs).reduce((refs,key)=>{
        const ref=this.$refs[regexp.test(key)?key:null];
        if(!ref?.length){return refs};
        return [...refs,...ref]
      },[]);
      for(const find_port of shuffle(refs||[])){
        if(find_port?.update_port_status){find_port.update_port_status()};
      };
    },
    toggleSelectAll(){//выбрать/не выбрать по всем
      for(let ip in this.ethSelect){
        this.$set(this.ethSelect,ip,{
          ...this.ethSelect[ip],
          selected:this.selectAll
        });
        this.setSelect(ip);
      };
    },
    setSelect(ip=''){//применяем селектор selected по ip
      this.$set(this.ethSelect,ip,{
        ...this.ethSelect[ip],
        selected:this.ethSelect[ip].selected
      });
      this.selectAll=this.ethSelect[ip].selected||this.selectAll;//переключаем если выбрали хоть один
    },
    async fetchPortStatuses() {
      //TODO: бекенд должен принимать новую структуру с name
      const devices=this.filteredAndSelectedEthDevices.map(device=>({...device,DEVICE_NAME:device.name}));
      let response={};
      try{
        response=await httpPost('/call/hdm/port_statuses?_devices='+devices.map(device=>device.ip).join(), {
          devices,
          add:this.saveData.cableTest?'cable':'speed',
        });
      }catch(error){
        console.warn('port_statuses.error',error);
      };
      for(let deviceName in response){//для port-find-el
        let device=response[deviceName];
        response[deviceName]={
          ...device,
          device:devices.find(ne=>ne.name==device.name&&ne.ip==device.ip),
        };
      };
      return response;
    },
    async getPortStatuses(action = 'save') {
      this.showSelect=false;//закрываем фильтр чтоб не мешал листать результаты
      const someLoading = Object.values(this.loading).some((val) => val);
      if (someLoading) return;
      if (action === 'save') this.resetData();

      this.loading[action] = true;
      const response = await this.fetchPortStatuses()
      this.loading[action] = false;

      if (action === 'save') this.actionSave(response);
      if (action === 'compare') this.actionCompare(response);
    },
    actionSave(response) {
      this.saveData = {
        time: new Date().toLocaleTimeString(),
        cableTest: this.saveData.cableTest,
        savedCount: this.countSavedPorts(response),
      };
      this.ports.savedPorts = response;
      this.saveCache();//add cache
    },
    actionCompare(response) {
      this.saveData.time = new Date().toLocaleTimeString();
      this.ports.comparedPorts = response;
      this.comparePorts();
      //перезаписываем сохраненные
      this.ports.savedPorts = { ...this.ports.comparedPorts };
      this.saveData.savedCount = this.countSavedPorts(this.ports.savedPorts);
      this.saveCache();//add cache
      this.showAll=false;//выключаем обратно просмотр всех
    },
    comparePorts(){
      const {savedPorts,comparedPorts}=this.ports;
      if(!comparedPorts||!savedPorts) return;

      const changedPorts = [];;
      for(const {name,ip,ports,device} of Object.values(savedPorts)){
        if(!ports) continue;
        for(const savedPort of ports){
          const comparedDevice=comparedPorts[name];
          const comparedDevicePorts=(comparedDevice&&comparedDevice.ports)||[];
          const comparedPort=comparedDevicePorts.find(p=>p.iface===savedPort.iface);
          if(!comparedPort){
            console.warn('Не найден порт для сравнения:',savedPort);
            continue;
          };
          if (this.portChanged(savedPort,comparedPort)){
            changedPorts.push({
              port:comparedPort,
              device,
              key:ip+':'+comparedPort.iface
            });
          };
        };
      };

      this.ports.changedPorts=changedPorts;
      this.saveData.changedCount=this.countChangedPorts();
      this.saveCache();
    },
    portChanged(savedPort, comparedPort) {
      if(this.showAllComparedPorts){return true};
      let diff = 0;
      if (savedPort.oper_state !== comparedPort.oper_state) diff++;

      if (this.saveData.cableTest) {
        for (let i = 1; i < 5; i++) {
          const pair = 'pair_' + i;
          const metr = 'mert_' + i;
          if (savedPort[pair]) {
            if (savedPort[pair] !== comparedPort[pair]) diff++;
            if (parseInt(savedPort[metr]) - parseInt(comparedPort[metr]) > 3) diff++;
          }
        }
      }
      return diff !== 0;
    },
    portName(port) {
      return encodeURIComponent(`PORT-${port.devicename}/${port.index_iface}`);
    },
    ipShort(ip=''){
      let octs=ip.split('.');
      if(octs.length<4){return ip};
      return `..${octs[2]}.${octs[3]}`;
    },
    resetData() {
      this.ports = { savedPorts: null, comparedPorts: null, changedPorts: null };
      this.saveData = { ...this.saveData, time: null };
    },
    countSavedPorts(devices) {
      let count = 0;
      if (!devices) return count;
      for (let deviceName in devices) {
        const { ports, message } = devices[deviceName];
        if (ports && ports.length && !message) count++;
      }
      return count;
    },
    countChangedPorts() {
      return (this.ports.changedPorts&&this.ports.changedPorts.length)||0;
    },
    saveCache(cacheKey=`port_statuses/${this.site_id}`){
      const {ports,saveData}=this;
      this.$cache.setItem(cacheKey,{ports,saveData},60);//1h
    },
    loadCache(cacheKey=`port_statuses/${this.site_id}`){
      const cache=this.$cache.getItem(cacheKey);
      if(!cache){return};
      const {ports,saveData}=cache;
      this.ports=ports;
      this.saveData=saveData;
    }
  },
});
