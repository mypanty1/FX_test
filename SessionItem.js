//add toast and fix foris stop
Vue.component('SessionItem',{
  template:`<section>
    <title-main v-bind="titleProps" textClass="font--13-500" class="margin-top-bottom--8px"/>
    <loader-bootstrap v-if="stopSessionRadiusLoading" text="сброс сессии абонента"/>
    <div v-else-if="stopSessionRadiusResultMessage" class="margin-left-16px margin-right-16px">
      <message-el :text="stopSessionRadiusResultMessage.text" :type="stopSessionRadiusResultMessage.type" box/>
    </div>
    <loader-bootstrap v-else-if="getOnlineSessionLoading" text="получение сессии абонента"/>
    <div v-else-if="getOnlineSessionResult" class="margin-left-16px margin-right-16px display-flex flex-direction-column gap-4px">
      <message-el v-if="isError" :text="errorText" type="warn" box/>
      <template v-else>
        <message-el :text="!start?'Оффлайн':('Онлайн c '+startLocal)" :type="!start?'warn':'success'" box/>
        <div v-if="sessionid||dbsessid||ip" class="display-flex align-items-center justify-content-center">
          <span class="font-size-12px">{{sessionid||dbsessid||ip}}</span><span v-if="dbsessid" class="font-size-12px"> (xRad)</span>
        </div>
        
        <div class="display-flex flex-direction-column">
          <component v-for="([is,props],key) of sessionInfo" :key="key" :is="is" v-bind="props" class="padding-unset"/>
        </div>
        <div class="display-flex justify-content-space-between gap-4px margin-bottom-8px">
          <button-main @click="$refs.SessionHistoryModal.open()" button-style="outlined" :disabled="false" icon="history" label="История" size="large"/>
          <button-main @click="stopSessionRadius" button-style="outlined" :disabled="!start" icon="refresh" label="Сброс" size="large"/>
          <button-main @click="$refs.SessionLogsModal.open()" button-style="outlined" :disabled="false" icon="log" label="Логи" size="large"/>
        </div>
        
        <SessionHistoryModal ref="SessionHistoryModal" :session="getOnlineSessionResult" :params="params"/>
        <SessionLogsModal ref="SessionLogsModal" :session="getOnlineSessionResult" :params="params"/>
      </template>
    </div>
    <div v-else-if="isTooManyInternetServices" class="margin-left-16px margin-right-16px">
      <message-el text="сессия не была запрошена" type="info" box/>
    </div>
  </section>`,
  props:{
    params:{type:Object,required:true},
    isTooManyInternetServices:{type:Boolean,default:false},
  },
  data:()=>({
    getOnlineSessionLoading:!1,
    getOnlineSessionResult:null,
    stopSessionRadiusLoading:!1,
    stopSessionRadiusResultMessage:null,
    ouis:{},
  }),
  watch:{
    'mac'(mac){
      if(mac&&this.macIsValid){this.getMacVendorLookup(mac)};
    },
    'remote_id_mac'(remote_id_mac){
      if(remote_id_mac){this.getMacVendorLookup(remote_id_mac)};
    },
  },
  created(){ 
    if(this.isTooManyInternetServices){return};
    this.getOnlineSessions() 
  },
  computed:{
    titleProps(){
      const {serverid,agentid,vgid,login,descr}=this.params;
      const service_hash=atok(...[serverid,vgid,agentid].filter(Boolean));
      if(!login){return {text:service_hash}};
      return {text:login,text2:service_hash}
    },
    isError(){return this.getOnlineSessionResult?.isError},
    errorText(){return this.getOnlineSessionResult?.message||'Error: unknown'},
    remote_id(){return this.getOnlineSessionResult?.remote_id||this.getOnlineSessionResult?.device||''},
    remote_id_str(){return `${this.remote_id||''}`},
    remote_id_mac(){return ((this.remote_id_str.match(/^[a-f0-9]{12}$/gi)?.[0]||'').match(/.{4}/gi)||[]).join('.')},
    agent_remote_id(){
      const {remote_id_str,remote_id_mac}=this;
      if(remote_id_mac){//30150037478 - default format
        return remote_id_mac;
      };
      const isNotHex=/\W/i.test(remote_id_str);
      if(isNotHex){//10702046999 - ascii format
        return remote_id_str
      };
      return (remote_id_str.match(/.{2}/gi)||[]).map(b=>{
        b=b.padStart(2,0);
        try{//60910533888 - custom format
          return decodeURIComponent('%'+b);
        }catch(error){
          return b
        };
      }).join('');
    },
    ip(){return this.parseIp(this.getOnlineSessionResult?.ip||'')},
    mac(){return this.getOnlineSessionResult?.mac||''},
    brasIpOrHostName(){return this.parseIp(this.getOnlineSessionResult?.nas||'')},
    agent_circuit_id(){return `${this.getOnlineSessionResult?.port||''}`},//40206334997
    sessionid(){return this.getOnlineSessionResult?.sessionid||''},
    inner_vlan(){return this.getOnlineSessionResult?.inner_vlan||''},
    outer_vlan(){return this.getOnlineSessionResult?.outer_vlan||''},
    service_info(){return this.getOnlineSessionResult?.service_info||''},
    start(){return this.getOnlineSessionResult?.start||''},
    update_time(){return this.getOnlineSessionResult?.update_time||''},
    dbsessid(){return this.getOnlineSessionResult?.dbsessid},
    is_xRad(){return Boolean(this.dbsessid)},
    startLocal(){
      const {is_xRad,start,update_time}=this;
      const session_date=/*update_time||*/start;
      if(!session_date){return};
      if(!is_xRad){return session_date};
      const date=new Date(session_date);
      if(date==DATE.InvalidDate){return session_date};
      const offset=new Date().getTimezoneOffset()/-60;
      date.setHours(date.getHours()-3+offset);
      return DATE.toDateTimeString(date);
    },
    macIsValid(){return this.mac&&this.mac!=='0000.0000.0000'},
    macVendor(){return this.ouis[this.mac]},
    deviceMacVendor(){return this.ouis[this.remote_id_mac]},
    isGuest(){return this.dbsessid&&!this.getOnlineSessionResult?.u_id},
    sessionInfo(){
      const {ip,macIsValid,mac,macVendor,service_info,inner_vlan,outer_vlan,agent_circuit_id,agent_remote_id,deviceMacVendor,brasIpOrHostName}=this;
      return [
        ip                &&  ['info-value',    {label:'IP',                value:ip,               withLine:true}],
        macIsValid        &&  ['info-value',    {label:'MAC',               value:mac,              withLine:true}],
        macVendor         &&  ['info-text-sec', {text:macVendor,            class:'text-align-right'}],
        service_info      &&  ['info-value',    {label:'Сервис',            value:service_info,     withLine:true}],
        inner_vlan        &&  ['info-value',    {label:'C-Vlan',            value:inner_vlan,       withLine:true}],
        outer_vlan        &&  ['info-value',    {label:'S-Vlan',            value:outer_vlan,       withLine:true}],
        agent_circuit_id  &&  ['info-value',    {label:'Opt.82 Порт',       value:agent_circuit_id, withLine:true}],
        agent_remote_id   &&  ['info-value',    {label:'Opt.82 Коммутатор', value:agent_remote_id,  withLine:true}],
        deviceMacVendor   &&  ['info-text-sec', {text:deviceMacVendor,      class:'text-align-right'}],
        brasIpOrHostName  &&  ['info-value',    {label:'BRAS',              value:brasIpOrHostName, withLine:true}],
      ].filter(Boolean);
    },
  },
  methods:{
    parseIp(value=''){
      if(/[.]/.test(`${value}`)){return value};
      const int=parseInt(value);
      if(!int){return value};
      const octs=int.toString(16).padStart(8,0).match(/[0-9a-f]{2}/gi);
      if(!octs||octs?.length!==4){return value};
      return octs.map(h=>parseInt(h,16)).join('.');
    },
    async getOnlineSessions(){
      if(this.getOnlineSessionLoading){return};
      this.stopSessionRadiusResultMessage=null;
      this.getOnlineSessionResult=null;
      this.getOnlineSessionLoading=!0;
      const {serverid,agentid,vgid,login,descr}=this.params;//descr 2000000721940
      const AAA_GetOnlineSession_Params = class AAA_GetOnlineSession_Params {
        constructor(serverid,agentid,vgid,login,descr){
          this.serverid=serverid
          this.agentid=agentid||''
          this.vgid=vgid
          this.login=login
          this.descr=/xrad/i.test(`${descr}`)?'xrad':''
          console.log(this)
        }
      }
      class AAA_GetOnlineSession_ResponseError {
        constructor(error){
          this.isError=true
          this.message='Error: unexpected'
        }
      }
      try{
        const response=await httpGet(buildUrl('get_online_session',new AAA_GetOnlineSession_Params(serverid,agentid,vgid,login,descr),'/call/aaa/'))
        this.getOnlineSessionResult=response?.data[0]||response;
      }catch(error){
        console.warn("getOnlineSessions.error",error);
        this.getOnlineSessionResult=new AAA_GetOnlineSession_ResponseError(error);
      };
      this.getOnlineSessionLoading=!1;
    },
    async stopSessionRadius(){
      if(!this.getOnlineSessionResult){return};
      if(this.stopSessionRadiusLoading){return};
      this.stopSessionRadiusResultMessage=null;
      this.stopSessionRadiusLoading=!0;
      const {serverid,agentid,vgid,login,descr}=this.params;//descr 2000000721940
      const {sessionid,dbsessid,nas}=this.getOnlineSessionResult;
      const {ip,is_xRad}=this;
      class AAA_StopSessionRadius_Params {
        constructor(serverid,agentid,vgid,login,descr,sessionid,dbsessid,nas){
          this.serverid=serverid
          this.agentid=agentid||''
          this.vgid=vgid
          this.login=login
          this.descr=/xrad/i.test(`${descr}`)?'xrad':''
          this.sessionid=sessionid||''
          this.dbsessid=dbsessid||''
          this.nasip=nas
          console.log(this)
        }
      }
      class AAA_StopSessionRadius_ResultMessage {
        constructor(type,text){
          this.type=type||'info'
          this.text=text||''
        }
      }
      try{
        const response=await httpGet(buildUrl('stop_session_radius',new AAA_StopSessionRadius_Params(serverid,agentid,vgid,login,descr,sessionid,dbsessid,nas),'/call/aaa/'));
        console.log({response})
        if(response?.text=="Сессия остановлена"){//{code:200,message:"",type:"info",text:"Сессия остановлена"}
          this.getOnlineSessionResult=null;
          const duration=10000;
          const messageText=`Сессия ${(dbsessid?('#'+dbsessid):sessionid)||ip||''}${is_xRad?' (xRad)':''} остановлена. Автоматическая проверка через ${(duration/1000).toFixed()} сек.`;
          setTimeout(this.getOnlineSessions,duration);
          this.$store.dispatch('toast/open',{
            iconName:'SqCheckedFill',
            iconColor:'#26CD58',
            messageText,
            showLeftTime:!0,
            duration
          });
          this.stopSessionRadiusResultMessage=new AAA_StopSessionRadius_ResultMessage('info',messageText);
        }else if(response?.isError||response?.code!=200){//{isError:true,type:"error",code:"401",text:"<b>ОШИБКА:</b> AaaManager: parametr 'sessionid' is not defined",message:"AaaManager: parametr 'sessionid' is not defined"}
          this.stopSessionRadiusResultMessage=new AAA_StopSessionRadius_ResultMessage('warn',response?.message||`Error: unknown`);
        };
      }catch(error){
        console.warn("stopSessionRadius.error",error);
        this.stopSessionRadiusResultMessage=new AAA_StopSessionRadius_ResultMessage('warn',`Ошибка сервиса`);
      };
      this.stopSessionRadiusLoading=!1;
    },
    async getOnlineSession(){//public
      return await this.getOnlineSessions()
    },
    async getMacVendorLookup(mac=''){
      if(!mac){return};
      const ouis=await this.test_getMacVendorLookup([mac]);
      this.ouis={...this.ouis,...ouis};
    },
  }
});
