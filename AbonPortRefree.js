//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AbonPortRefree.js',type:'text/javascript'}));

Vue.component('AbonPortRefree',{
  template:`<div name="AbonPortRefree">
    <div v-if="canRefree" class="display-flex flex-direction-column gap-8px">
      <message-el :text="canRefreeMessage[0]" box :type="canRefreeMessage[1]"/>
      
      <button-main label="Освободить порт" v-bind="{loading:setBindRefreeLoading,disabled}" @click="setBindRefree" buttonStyle="contained" size="full"/>
      <loader-bootstrap v-if="setBindRefreeLoading" text="освобождение порта"/>
      <template v-else-if="setBindRefreeResult">
        <message-el v-if="setBindRefreeResult.type==='error'" :text="setBindRefreeResult.text.slice(0,120)" box type="warn"/>
        <template v-else-if="setBindRefreeResult.type!=='error'">
          <message-el :text="refreeMessage" box type="success"/>
        </template>
      </template>
    </div>
    <div v-else-if="setBindResult?.text&&/порт/.test(setBindResult.text)" class="display-flex flex-direction-column gap-8px margin-top-8px">
      <message-el :text="canRefreeMessage[0]" box :type="canRefreeMessage[1]"/>
      <button-main label="Освободить порт" disabled buttonStyle="contained" size="large" class="margin-left-auto"/>
    </div>
  </div>`,
  props:{
    setBindResult:{type:Object,default:null},
    port:{type:Object,required:true},
    networkElement:{type:Object,required:true},
    account:{type:String,required:true,default:''},
    vg:{type:Object,required:true},
    disabled:{type:Boolean,default:false},
    loading:{type:Boolean,default:false},
  },
  data:()=>({
    setBindRefreeLoading:false,
    setBindRefreeResult:null,
  }),
  created(){},
  watch:{
    'setBindResult'(setBindResult){
      if(setBindResult){
        this.sendLogAfterBind();
        this.setBindRefreeLoading=false;
        this.setBindRefreeResult=null;
      }
    },
    'setBindRefreeLoading'(setBindRefreeLoading){
      this.$emit('loading',setBindRefreeLoading);
    }
  },
  computed:{
    hasResult(){return Boolean(this.setBindResult)},
    contract(){
      const {text=''}=this.setBindResult||{};if(!text){return}
      return parseInt(text.replace('Мы не можем отобрать порт у контракта ',''));
    },
    canRefree(){return Boolean(this.contract)},
    canRefreeMessage(){
      const {contract,portLastDate,portState}=this;
      if(!portState){return [`невозможно определить активность, нужно проверить`,'warn']};
      return {
        'busy'    :[`последняя активность ${portLastDate} , есть риск отжать порт у действующего абонента`,'warn'],
        'hub'     :[`последняя активность ${portLastDate} , есть риск отжать порт у действующего абонента`,'warn'],
        'closed'  :[`контракт ${contract||''} расторгнут, порт можно освободить`,'success'],
        'expired' :[`неактивен более 3 мес, возможно порт можно освободить`,'success'],
        'double'  :[`абонент "переехал" на другой порт, возможно порт можно освободить`,'success'],
        'new'     :[`на порту просто новый мак, возможно порт можно освободить`,'success'],
        'free'    :[`на порту никогда небыло активности, возможно порт можно освободить`,'success'],
      }[portState]||[`неизвестный статус порта: ${portState} , нужно проверить`,'warn'];
    },
    serverId(){return this.vg?.serverid},
    typeOfBind(){return this.vg?.type_of_bind},
    deviceIp(){return this.networkElement?.ip||''},
    deviceName(){return this.networkElement?.name||''},
    portNumber(){return this.port?.number||0},
    portState(){return this.port?.state},
    portLastDate(){const {port:{last_mac}={}}=this;return new Date(last_mac?.last_at?Date.parse(last_mac.last_at.split(' ')[0].split('.').reverse().join('-')):Date.now()).toLocaleDateString('ru',{year:'2-digit',month:'2-digit',day:'2-digit'})},
    refreeMessage(){
      const {contract,setBindRefreeResult}=this;
      if(!setBindRefreeResult){return};
      const ipText=setBindRefreeResult.Data?.IP?`, с IP:${setBindRefreeResult.Data.IP}`:'';
      return `порт освобожден, тут был абонент ${contract}`+ipText;
    }
  },
  methods:{
    sendLogAfterBind(){
      const {setBindResult,deviceIp,account,portNumber,contract,portState,portLastDate,canRefreeMessage,canRefree}=this;
      const {vgid,login,serverid,type_of_bind}=this.vg||{};
      const postData={
        username:store.getters.userLogin||'<username>',
        node_id:window.node_id||'<node_id>',
        action:'bind',
        method:`type_${type_of_bind}_${serverid}`,//set_bind_108
        props:{
          method:`type_${type_of_bind}`,//set_bind

          //vg info
          ip:deviceIp,
          port:portNumber,
          mac:'',
          account,
          login,
          vgid,
          serverid,
          type_of_bind,

          //user refree message
          ...canRefree?{
          contract,
          state:portState,
          date_last:portLastDate,
          user_message:canRefreeMessage[0],
          }:{
          contract:'',
          state:'',
          date_last:'',
          user_message:''
          },
          

          //bind result
          type:setBindResult?.type,
          text:setBindResult?.text,
          IsError:setBindResult?.IsError,
          InfoMessage:setBindResult?.InfoMessage,
        }
      };
      try{
        fetch(`https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec`,{
          method:'POST',mode:'no-cors',
          headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify(postData)
        });
        //console.log(postData)
      }catch(error){

      }
    },
    sendLogAfterRefree(){
      const {serverId,typeOfBind,setBindRefreeResult,deviceIp,contract,portState,portLastDate,refreeMessage}=this;
      const postData={
        username:store.getters.userLogin||'<username>',
        node_id:window.node_id||'<node_id>',
        action:'refree',
        method:`type_${typeOfBind}_${serverId}`,//set_bind_108
        props:{
          method:`type_${typeOfBind}`,//set_bind

          //refree vg-port info
          ip:deviceIp,
          port:contract,
          mac:'',
          account:'',
          login:'',
          vgid:contract,
          serverid:serverId,
          type_of_bind:typeOfBind,

          //refree result message
          contract,
          state:portState,
          date_last:portLastDate,
          user_message:refreeMessage,

          //refree result
          type:setBindRefreeResult?.type,
          text:setBindRefreeResult?.text,
          IsError:setBindRefreeResult?.IsError,
          InfoMessage:setBindRefreeResult?.InfoMessage,
        }
      };
      try{
        fetch(`https://script.google.com/macros/s/AKfycbzKqxZH8vVTFutj0nj0FvUB4_asbTiv3YSa5rgkYKF1oyiaT9wjJ4L3s8LhPqbAnpq06Q/exec`,{
          method:'POST',mode:'no-cors',
          headers:{'Content-Type':'application/json;charset=utf-8'},
          body:JSON.stringify(postData)
        });
        //console.log(postData)
      }catch(error){

      }
    },
    async setBindRefree(){
      const {typeOfBind,contract,deviceIp,serverId}=this;
      this.setBindRefreeLoading=!0;
      this.setBindRefreeResult=null;
      try{
        //mac need for omsk serverid 64
        const vgMacInfo64=serverId==64?await httpGet(buildUrl('get_user_rate',{serverid:serverId,vgid:contract},'/call/aaa/')):null;
        const response=await CustomRequest.post(`/call/service_mix/set_bind`,{
          type_of_bind:typeOfBind,
          serverid:serverId,
          vgid:contract,
          ip:deviceIp,
          port:contract,
          login:null,
          account:null,
          mac:vgMacInfo64?.data?.[0]?.macCPE?.[0]||'0000.0000.0000',
        });
        this.setBindRefreeResult=response;
      }catch(error){
        console.warn(`set_bind.error`,error);
        this.setBindRefreeResult={text:"Ошибка сервиса",type:"error"};
      };
      this.setBindRefreeLoading=!1;
      this.sendLogAfterRefree();
    },
  },
});



















