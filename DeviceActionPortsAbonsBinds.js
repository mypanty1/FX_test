//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/DeviceActionPortsAbonsBinds.js',type:'text/javascript'}));
Vue.component('device-actions',{
  //template:'#device-actions-template',
  template:`<CardBlock class="device-actions">
    <title-main text="Действия" :attention="attention" :opened="opened" @block-click="opened=!opened"/>
    <div v-show="opened">
      <template v-if="hasIP">
        <devider-line/>
        <link-block icon="campaign" text="Доступность оборудования" actionIcon="info" @click="show.info.ping=!show.info.ping" />
        <info-text-icon v-if="show.info.ping" icon="info" text="Пинг до устройства от терминального сервера Inetcore установленного в ЦОДе макрорегиона"/>
        <device-ping :device="device" class="p-all"/>
      </template>
      <template v-if="hasIP">
        <devider-line/>
        <link-block icon="campaign" text="Опросить устройство" actionIcon="info" @click="show.info.discovery=!show.info.discovery" />
        <info-text-icon v-if="show.info.discovery" icon="info" text="Опрос устройства может занять от 1 до 30 сек. В результате опроса будет обновлена модель устройства(в случаем замены), обновлены статусы портов(свободен/занят/квартира), дескрипшены на портах а также размещение абонентов по портам"/>
        <div class="p-all">
          <button-main  @click="deviceDiscovery" label="Опросить" :loading="loading.discovery" :disabled="loading.discovery" buttonStyle="outlined" size="full"/>
        </div>
        <message-el v-if="!loading.discovery" :text="discovery.text" :type="discovery.type" :subText="discovery.error" class="px-16" box/>
      </template>
      <template v-if="hasIP&&isETH">
        <devider-line/>
        <link-block icon="repeat" text="Привязка всех абонентов" actionIcon="info" @click="show.info.DeviceActionPortsAbonsBinds=!show.info.DeviceActionPortsAbonsBinds" />
        <info-text-icon v-if="show.info.DeviceActionPortsAbonsBinds" icon="info" text="Перепривязка всех абонентов на корректные порты в биллинге по соответствию мак-порт после перекоммутации/замены. Для повышения точности привязки желательно актуализировать маки на портах во вкладке [Опросить устройство] незадолго до перед тем как"/>
        <DeviceActionPortsAbonsBinds :networkElement="device" class="p-all"/>
      </template>
    </div>
  </CardBlock>`,
  props:{
    discovery:{type:Object},
    loading:{type:Object},
    device:{type:Object,default:null}
  },
  data:()=>({
    opened:true,
    show:{
      info:{
        ping:false,
        discovery:false,
        DeviceActionPortsAbonsBinds:false,
      },
    },
  }),
  computed: {
    name(){return this.device?.name},
    isETH(){return /^eth/i.test(this.name||'')},
    attention() {
      return this.discovery.type === 'error' ? 'error' : '';
    },
    hasIP(){
      return this.device&&this.device.ip;
    },
  },
  methods: {
    deviceDiscovery() {
      this.$emit('get:discovery');
    },
  },
});

Vue.component('DeviceActionPortsAbonsBinds',{
  template:`<div name="DeviceActionPortsAbonsBinds">
    <div class="site-add-table">
      <div bb tac>лс</div><div bb>кв</div><div bb>порт</div><div bb>статус</div>
      <div></div><div></div><div></div><div></div>
      <template v-for="({port,flat,account,status},index) in rows">
        <div style="white-space:pre;">{{account}}</div>
        <div>{{flat}}</div>
        <div>{{port}}</div>
        <div>{{status}}</div>
      </template>
    </div>
    <div style="display:inline-flex;gap:4px;width:100%;justify-content:center;margin-top:8px;">
      <button-main @click="clear" label="clear" :disabled="!is54||!isETH||loadingSome" buttonStyle="outlined" size="medium"/>
      <button-main @click="start" label="start" :loading="loadingSome" :disabled="!is54||!isETH||loadingSome" buttonStyle="contained" size="medium"/>
    </div>
  </div>`,
  props:{
    networkElement:{type:Object,default:()=>({})}
  },
  data:()=>({
    loads:{
      getDevicePorts:false,
    },
    resps:{
      getDevicePorts:null,
    },
    abons:{},
    results:{},
    loading:false
  }),
  computed:{
    is54(){return this.networkElement?.region?.id==54},
    name(){return this.networkElement.name},
    isETH(){return /^eth/i.test(this.name||'')},
    ip(){return this.networkElement.ip},
    ports(){return this.resps.getDevicePorts||[]},
    loadingSome(){return Object.values(this.loads).some(v=>v)||this.loading},
    rows(){
      return Object.entries(this.results).reduce((rows,[_account,result])=>{
        const cp=this.abons[_account]?.cp;if(!cp){return rows};
        const {port,flat,mac,account,ifName}=cp;
        rows[port]={
          port,flat,mac,account,ifName,
          status:result.success?'success ✔':result.error?'error ✘':result.loading?'loading...':'',
        }
        return rows
      },{});
    }
  },
  methods:{
    async start(){
      await this.getDevicePorts();
      this.loading=true;
      for(const {number:port,flat,subscriber_list=[],state,snmp_name:ifName} of this.ports){
        if(!subscriber_list.length||state!=='busy'){continue};
        const subscriber=subscriber_list.find(({account,flat:_flat})=>_flat==flat&&account);
        if(!subscriber?.account){
          console.warn({port,flat,error:'subscriber error',step:'port_subscriber'});
          continue
        };
        const {mac,account}=subscriber;
        this.$set(this.results,account,{loading:true});
        try{
          const abon_lbsv=this.abons[account]?.abon_lbsv||await httpGet("/call/v1/search/search_ma?pattern="+account);
          if(!abon_lbsv?.data?.lbsv?.data?.agreements){return};
          this.$set(this.abons,account,{cp:{port,flat,mac,account,ifName},abon_lbsv});
          const {agreements=[]}=abon_lbsv.data.lbsv.data;
          const agreement=agreements.find(agreement=>agreement.account==account);
          if(!agreement){
            console.warn({port,flat,mac,account,error:'agreement error',step:'abon_agreement'});
            this.$set(this.results,account,{error:'agreement error'});
            continue
          };
          const {serverid,type_of_bind,vgid}=(agreement?.services?.internet?.vgroups||[]).find(({status})=>['0','1','2','3'].includes(status))||{};
          if(!serverid||!type_of_bind||!vgid){
            console.warn({port,flat,mac,account,serverid,type_of_bind,vgid,error:'service error',step:'service_vgid'});
            this.$set(this.results,account,{error:'service error'});
            continue
          };
          const {ip}=this;
          try{
            const response_set_bind=await httpPost(`/call/service_mix/set_bind`,{ip,port,vgid,serverid,type_of_bind});
            if(response_set_bind?.type=='error'){
              if(response_set_bind?.text?.length>0&&response_set_bind.text.indexOf('Мы не можем отобрать порт у контракта ')>=0){
                let contract=parseInt(response_set_bind.text.replace('Мы не можем отобрать порт у контракта ',''));
                if(!contract){
                  console.warn({port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_set_bind.text||'contract error',step:'port_contract'});
                  this.$set(this.results,account,{error:'contract error'});
                  continue
                };
                contract=contract.toString();
                
                try{
                  const response_refree=await httpPost(`/call/service_mix/set_bind`,{ip,port:contract,vgid:contract,serverid,type_of_bind});
                  if(response_refree?.type=='error'){
                    console.warn({port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_refree?.text||'refree error',step:'port_refree_vgid'});
                    this.$set(this.results,account,{error:'refree error'});
                    continue
                  }else{
                    try{
                      const response_set_bind_2=await httpPost(`/call/service_mix/set_bind`,{ip,port,vgid,serverid,type_of_bind});
                      if(response_set_bind_2?.type=='error'){
                        console.warn({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_set_bind_2?.text||'set_bind 2 error',step:'port_bind_vgid_2'});
                        this.$set(this.results,account,{error:'set_bind 2 error'});
                        continue
                      }else{
                        console.log({port,flat,mac,account,serverid,type_of_bind,vgid,contract,success:true,step:'port_bind_vgid_2'});
                        this.$set(this.results,account,{success:true});
                      };
                    }catch(error){
                      this.$set(this.results,account,{error:'unexpected set_bind 2 error'});
                      continue
                    }
                  };
                }catch(error){
                  console.log(account,error);
                  this.$set(this.results,account,{error:'unexpected refree error'});
                }
              }else{
                console.warn({port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_set_bind_2?.text||'set_bind error',step:'port_bind_vgid'});
                this.$set(this.results,account,{error:'set_bind error'});
              }
            }else{
              console.log({port,flat,mac,account,serverid,type_of_bind,vgid,success:true,step:'port_bind_vgid'});
              this.$set(this.results,account,{success:true});
            };
          }catch(error){
            console.log(account,error);
            this.$set(this.results,account,{error:'unexpected set_bind error'});
          }
        }catch(error){
          console.log(account,error);
          this.$set(this.results,account,{error:'unexpected account error'});
        }
      }
      this.loading=false;
    },
    clear(){
      for(const key in this.loads){
        this.loads[key]=false
        this.resps[key]=null
      };
      this.abons={};
      this.results={};
    },
    async getDevicePorts() {
      this.loads.getDevicePorts = true;
      this.resps.getDevicePorts = null;
      try {
        const response = await httpGet(buildUrl('device_port_list', { device: this.name }));
        this.cacheDate = null;
        const cache = { date: new Date(), response };
        if (Array.isArray(response) && response.length) {
          this.resps.getDevicePorts = response;
          const CACHE_MINUTES = 60;
          this.$cache.setItem(`ports-map:device_port_list/${this.name}`, cache, CACHE_MINUTES);
          for(let port of response){//т.к структура идентичная сваливаем порты в кэш
            this.$cache.setItem(`port/PORT-${this.name}/${port.snmp_number}`,port);
          };
        }
      }catch(error){
        console.warn('device_port_list.error',error);
      };
      this.loads.getDevicePorts=false;
    }
  },
});



/*
(async function(name='ETH_54KR_00566_1'){
  const response_device=await httpGet("/call/v1/search/search_ma?pattern="+name);
  if(!response_device?.data?.ip){
    console.log({name,error:response_device?.text||'device error',step:'device'});
    return
  };
  const {ip}=response_device.data;
  const response_device_port_list=await httpGet("/call/device/device_port_list?device="+name);
  if(!Array.isArray(response_device_port_list)||!response_device_port_list?.length){
    console.warn({name,ip,error:'device_port_list error',step:'device_port_list'});
    return
  };
  for(const {number:port,flat,subscriber_list=[],state} of response_device_port_list){
    if(!subscriber_list.length||state!=='busy'){continue};
    const subscriber=subscriber_list.find(({account,flat:_flat})=>_flat==flat&&account);
    if(!subscriber?.account){
      console.warn({name,ip,port,flat,error:'subscriber error',step:'port_subscriber'});
      continue
    };
    const {mac,account}=subscriber;
    
    const abon_lbsv=await httpGet("/call/v1/search/search_ma?pattern="+account);
    if(!abon_lbsv?.data?.lbsv?.data?.agreements){return};
    const {agreements=[]}=abon_lbsv.data.lbsv.data;
    const agreement=agreements.find(agreement=>agreement.account==account);
    if(!agreement){
      console.warn({name,ip,port,flat,mac,account,error:'agreement error',step:'abon_agreement'});
      continue
    };
    const {serverid,type_of_bind,vgid}=(agreement?.services?.internet?.vgroups||[]).find(({status})=>['0','1','2','3'].includes(status))||{};//[актив,баланс,абон,админ]
    if(!serverid||!type_of_bind||!vgid){
      console.warn({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,error:'service error',step:'service_vgid'});
      continue
    };
    
    const response_set_bind=await httpPost(`/call/service_mix/set_bind`,{ip,port,vgid,serverid,type_of_bind});
    if(response_set_bind?.type=='error'){
      if(response_set_bind?.text?.length>0&&response_set_bind.text.indexOf('Мы не можем отобрать порт у контракта ')>=0){
        let contract=parseInt(response_set_bind.text.replace('Мы не можем отобрать порт у контракта ',''));
        if(!contract){
          console.warn({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_set_bind.text||'contract error',step:'port_contract'});
          continue
        };
        contract=contract.toString();
        
        const response_refree=await httpPost(`/call/service_mix/set_bind`,{ip,port:contract,vgid:contract,serverid,type_of_bind});
        if(response_refree?.type=='error'){
          //освободить не удалось
          console.warn({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_refree?.text||'refree error',step:'port_refree_vgid'});
          continue
        }else{
          //порт освобожден! response_refree?.Data?.IP
          const response_set_bind_2=await httpPost(`/call/service_mix/set_bind`,{ip,port,vgid,serverid,type_of_bind});
          if(response_set_bind_2?.type=='error'){
            console.warn({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_set_bind_2?.text||'set_bind 2 error',step:'port_bind_vgid_2'});
            continue
          }else{
            console.log({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,contract,success:true,step:'port_bind_vgid_2'});
          };
        };
      }else{
        console.warn({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,contract,error:response_set_bind_2?.text||'set_bind error',step:'port_bind_vgid'});
      }
    }else{
      console.log({name,ip,port,flat,mac,account,serverid,type_of_bind,vgid,success:true,step:'port_bind_vgid'});
    };
  }
}())
*/

//device_ports_list.map(({number,flat,subscriber_list:[{account,mac}={}]})=>({number,flat,account,mac})).filter(({flat,account,mac})=>Number.isInteger(flat)&&account&&mac).map(({number,flat,account,mac})=>[mac,`kv${flat}-${(account||'').replace(/-/g,'')}-${(mac||'').replace(/:/g,'')?.slice(8,12)}-15.03.23`])

//Object.values(device_ports).map(({ifName,ifAlias})=>[ifName,ifAlias]).filter(([ifName,ifAlias])=>ifAlias)












