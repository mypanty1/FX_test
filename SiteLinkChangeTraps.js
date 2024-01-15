Vue.component('SiteLinkChangeTraps',{
  template:`<div class="white-block-100 padding-top-bottom-8px">
    <title-main text="Трапы LinkChange" :text2="text2" text2Class="font--13-500 tone-500" :textSub="textSub" textSubClass="font--13-500 tone-500" @open="show=!show">
      <button-sq icon="mark-circle" type="large" @click="help.show=!help.show"/>
    </title-main>
    <message-el v-if="!1" text="ошибка сервиса traperium" type="warn" box class="margin-left-right-8px"/>
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
  </div>`,
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
    ws:null,
    message:'',
    networkElements:[],
    loads:{
      vct:{},
    },
    resps:{
      vct:{},
    },
  }),
  created(){
    this.getSiteNetworkElements();
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
    networkElementsDuESwInstalled54(){
      return select(this.networkElements,{
        region_id:54,
        ne_name:NIOSS.neIsETH,
        node_name:NIOSS.nodeIsDU,
        ne_status:NIOSS.admStatusIsInstalled,
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
        const {ifIndex=0,ifDescr='',ifName='',ifAdminStatus='',ifOperStatus=''}=trap_data;
        const port_id=`${ip}-${ifIndex}`;
        if(ifOperStatus==='down'){
          //this.getVCT({ip,ifIndex,ifDescr,ifName,trap_id,port_id})
        };
        const [_10,_221,ip2,ip3]=ip.split('.');
        const ipShort=`..${ip2}.${ip3}`;
        const portName=ifName||ifDescr||`Port${ifIndex}`;
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
          ifName,
          ifAdminStatus,
          ifOperStatus
        })
        return rows;
      },[]);
    },
    isNotEmpty(){
      return this.recived.length;
    },
    ...mapGetters(['userLogin']),
  },
  methods:{
    async getSiteNetworkElements(){
      const {site_id}=this;
      if(!site_id){return};
      const method='site_device_list';
      const cacheKey=atok(method,site_id);
      
      const cache=localStorageCache.getItem(cacheKey);
      if(cache){
        this.networkElements=cache;
        return;
      };

      try{
        const response=await httpGet(buildUrl(method,{site_id},"/call/v1/device/"));
        if (response.type === 'error') throw new Error(response.message);
        if (!Array.isArray(response)) throw new Error(Array.isArray(response));
        localStorageCache.setItem(cacheKey,response);
        this.networkElements=response;
      }catch(error){
        console.warn('getSiteNetworkElements.error',error);
      };
    },
    ipOnThisSiteId(_ip){
      return !!Object.values(this.networkElementsDuESwInstalled54).find(({ip})=>_ip==ip)
    },
    async init(){
      const userLogin=this.userLogin;
      if(!userLogin){return};
      
      this.initWs();
      
      const {site_id}=this;
      const subscribes=Object.values(this.networkElementsDuESwInstalled54).map(({ip})=>{
        return fetch(`https://ping54.ru/addDeviceSnmpTrapsUserSubscription?${objectToQuery({ip,login:userLogin,userLogin,site_id})}`,{
          headers:{'user-key':'LFjoMC6x-bWQlVyX3-FFPZGwvf-lOo5rT2o-uuubGsRh-eOdFpD4Y'}
        });
      });
      await Promise.allSettled(subscribes);
    },
    closeWs(){
      this.ws?.close();
      this.ws=null;
    },
    clear(){
      this.recived=[];
    },
    send(data=null){
      const userLogin=this.userLogin;
      if(!userLogin){return};
      if(!this.ws){return};
      this.ws.send(JSON.stringify({type:'data',user:userLogin,data}));
    },
    initWs(){
      const userLogin=this.userLogin;
      if(!userLogin){return};
      if(this.ws){return};
      this.message=`установка соединения ${userLogin}`;
      this.ws=new WebSocket(`wss://ping54.ru/wstest`,[userLogin]);
      this.ws.onopen=(event)=>{
        console.log('ws.onopen');
        const alive={type:'alive',user:userLogin};
        this.ws.send(JSON.stringify(alive));
        setTimeout(()=>this.ws?.send(JSON.stringify(alive)),60000);
        this.message=`соединение ${userLogin} активно`;
      };
      this.ws.onmessage=(event)=>{
        let message=event.data;
        try{
          message=JSON.parse(message);
        }catch(error){
          message={type:'text',text:message};
        };
        console.log('ws.onmessage',message);
        if(message.type==='snmp_trap'&&message?.data&&message.data?.trap_type=='LinkChange'){//только LinkChange
          if(this.ipOnThisSiteId(message.data?.ip)||userLogin=='mypanty1'){//только по текущему site_id
            this.recived.push(message.data);
          }
        };
        if(message.type==='alive'){
          this.message=`соединение активно ${message.date}`;
        }else{
          this.message=`соединение активно ${new Date().toLocaleString()}`;
        }
      };
      this.ws.onclose=(event)=>{
        this.ws=null;
        if(event.wasClean){
          console.log('ws.onclose.wasClean',event.code,event.reason);
          this.message=`соединение закрыто`;
        }else{
          console.log('ws.onclose',event.code,event.reason);
          this.message=`соединение потеряно`;
          setTimeout(()=>this.initWs(),4000);//reconnect after 4sec
        };
      };
      this.ws.onerror=(error)=>{
        console.log('ws.onerror',error.message);
      };
    },
    async getVCT({ip,ifIndex,ifDescr,trap_id,port_id}){
      const login=this.userLogin;
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
    goToPort({ip,ifIndex,ifName/*,portName*/}){
      const ne=Object.values(this.networkElementsDuESwInstalled54).find(ne=>ne.ip===ip);
      if(!ne){return};
      const {ne_name}=ne;
      const port_name=`PORT-${ne_name}/${ifIndex}`;
      this.$router.push({ name: "eth-port", params: { id: port_name } });
      this.send({click:{ip,ifIndex,ifName}});
      this.closeWs();
    },
    goToNe({ip}){
      const ne=Object.values(this.networkElementsDuESwInstalled54).find(ne=>ne.ip===ip);
      if(!ne){return};
      const {ne_name}=ne;
      this.$router.push({ name: "network-element", params: { device_id: ne_name } });
      this.send({click:{ip}});
      this.closeWs();
    },
  },
  beforeDestroy(){
    this.closeWs();
  },
});
