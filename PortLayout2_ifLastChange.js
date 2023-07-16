//add ifLastChange

Vue.component("PortLayout2", {
  template:`<section name="PortLayout2">
    <CardBlock class="padding-unset">
      <loader-bootstrap v-if="loads.networkElement" text="устройство загружается"/>
      <device-info v-else-if="networkElement?.name" :networkElement="networkElement" showLocation hideEntrances autoSysInfo/>
    </CardBlock>
    <CardBlock>
      <title-main :text="port?.snmp_name||''" :textSub="status?.IF_OPER_STATUS?(status?.IF_SPEED||''):''" textSubClass="font--13-500 tone-500 white-space-pre">
        <LinkLed2050 slot="icon" @click="getPortLink" :loading="loads.getPortLink" :error="!status?.IF_SPEED" :admin_state="status?.admin_state" :oper_state="status?.oper_state"/>
        <button-sq :icon="(loads.getPortLink||loadingSome)?'loading rotating':'refresh'" @click="getPortLink" :disabled="loadingSome||loads.getPortLink"/>
      </title-main>
      <info-text-sec v-if="ifLastChange" :title="ifLastChangeText"/>
      <info-text-sec v-if="ifAlias" :title="ifAlias"/>
      <devider-line/>
      <link-block icon="-" :text="loads.doPortErrorsClean?'сброс ошибок ...':loads.getPortLink?'проверка ошибок ...':port_errors_text" :text2="(loads.getPortLink||loads.doPortErrorsClean)?'':'ошибки порта'" :text1Class="(loads.getPortLink||loads.doPortErrorsClean)?'font--13-500 tone-500':''" text2Class="font--13-500 tone-500">
        <template slot="prefix">
          <div class="display-flex align-items-center margin-right-12px">
            <span class="ic-20" :class="'ic-'+((loads.getPortLink||!status||loads.doPortErrorsClean)?'exchange tone-500':hasErrors?'warning main-orange':'button-on main-green')"></span>
          </div>
        </template>
        <template slot="postfix">
          <button-sq :icon="loads.doPortErrorsClean?'port-error rotating':errors.doPortErrorsClean?'warning main-orange':'port-error'" @click="doPortErrorsClean" :disabled="loadingSome||loads.doPortErrorsClean||!networkElement"/>
        </template>
        <template slot="action">
          <button-sq :icon="loads.getPortLink?'sync rotating':'sync'" @click="getPortLink" :disabled="loadingSome||loads.getPortLink"/>
        </template>
      </link-block>
      <devider-line/>
      <template v-if="hasPortLbd">
        <link-block icon="-" :text="loads.getPortLbdInfo?'проверка LBD ...':errors.getPortLbdInfo?'ошибка':hasLbdBlocked?'петля на порту!':resps.getPortLbdInfo?'петли нет':'LBD'" :textClass="(loads.getPortLbdInfo||errors.getPortLbdInfo)?'font--13-500 tone-500':!resps.getPortLbdInfo?'tone-500':''">
          <template slot="prefix">
            <div class="display-flex align-items-center margin-right-12px">
              <span class="ic-20" :class="'ic-'+((loads.getPortLbdInfo||!hasLbd||errors.getPortLbdInfo)?'loop tone-500':hasLbdBlocked?'warning main-orange':'button-on main-green')"></span>
            </div>
          </template>
          <template slot="postfix">
            <div class="display-flex align-items-center margin-right-12px">
              <span v-if="errors.getPortLbdInfo" class="ic-20 ic-warning main-orange"></span>
            </div>
          </template>
          <template slot="action">
            <button-sq :icon="loads.getPortLbdInfo?'sync rotating':'sync'" @click="getPortLbdInfo" :disabled="loadingSome||loads.getPortLbdInfo||!networkElement"/>
          </template>
        </link-block>
        <devider-line/>
      </template>
      <template v-if="hasPortSfp">
        <title-main icon="hard-drive" text="SFP модуль" @open="open.sfp=!open.sfp"/>
        <PortSfp v-if="open.sfp&&networkElement" v-bind="{port,networkElement}"/>
        <devider-line/>
      </template>
      <PortVlansModal :port="port" :vlans="vlans" ref="PortVlansModal"/>
      <link-block icon="session">
        <template slot="text">
          <div v-if="loads.getPortVlans" class="font--13-500 tone-500">получение Vlan ...</div>
          <div v-else-if="errors.getPortVlans" class="font--13-500 tone-500">ошибка</div>
          <div v-else-if="!resps.getPortVlans" class="tone-500">VLAN</div>
          <div v-else class="display-flex align-items-center gap-2px">
            <div v-if="vlans.port_mode" class="font--13-500--">{{vlans.port_mode}}</div>
            <div v-if="vlans.titleUntag" class="font--13-500--">
              <span class="ic-18 ic-vlan-off"></span>
              <span>{{vlans.titleUntag}}</span>
            </div>
            <div v-if="vlans.titleTag" class="font--13-500-- tone-500">
              <span class="ic-18 ic-vlan-on"></span>
              <span>{{vlans.titleTag}}</span>
            </div>
          </div>
        </template>
        <template slot="postfix">
          <button-sq :icon="errors.getPortVlans?'warning main-orange':resps.getPortVlans?'expand':''" :disabled="loads.getPortVlans||(!vlans.titleUntag&&!vlans.titleTag)" type="large" @click="openPortVlansModal"/>
        </template>
        <template slot="action">
          <button-sq :icon="loads.getPortVlans?'repeat rotating-r':'repeat'" :disabled="loadingSome||loads.getPortVlans||!networkElement" type="large" @click="getPortVlans"/>
        </template>
      </link-block>
      <PortExt v-bind="{port,networkElement}" :loading_port="loads.port" :loading_networkElement="loads.networkElement"/>
      <devider-line/>
      <link-block icon="topology" text="Топология сети" actionIcon="right-link" :to="toTopology"/>
      <template v-if="favBtnProps">
        <devider-line/>
        <FavBtnLinkBlock v-bind="favBtnProps"/>
      </template>
    </CardBlock>
    <CardBlock>
      <loader-bootstrap v-if="loads.port||loads.networkElement" text="действия загружаются"/>
      <PortUserActions v-else-if="port&&networkElement" v-bind="{port,networkElement}" :status="status" :disabled="loadingSome" @loading="eventLoading"/>
    </CardBlock>
    <CardBlock>
      <loader-bootstrap v-if="loads.port||loads.networkElement" text="история загружается"/>
      <PortMacsAbonsDevices v-else-if="port&&networkElement" v-bind="{port,networkElement}"/>
    </CardBlock>
  </section>`,
  props:{
    portProp:{type:Object,default:null},
  },
  data:()=>({
    loads: {
      port:false,
      getPortLink:false,
      networkElement:false,
      doPortErrorsClean:false,
      getPortLbdInfo:false,
      getPortVlans:false,
      someActionLoading:false,
    },
    resps:{
      port:null,
      getPortLink:null,
      networkElement:null,
      doPortErrorsClean:null,
      getPortLbdInfo:null,
      getPortVlans:null,
    },
    errors:{
      doPortErrorsClean:false,
      getPortLbdInfo:false,
      getPortVlans:false,
    },
    open:{
      sfp:false,
    },
  }),
  created(){
    this.getAll();
  },
  computed:{
    favBtnProps(){
      if(!this.port||!this.networkElement){return};
      const {port,port:{name,snmp_name},networkElement:ne,vlans}=this;
      const [_10,_221,_3,_4]=ne.ip.split('.');
      const subscriber=port.subscriber_list?.[0];
      return {
        title:`Порт ${snmp_name} ..${_3}.${_4}`,
        name:snmp_name,
        id:name,
        path:`/${encodeURIComponent(name)}`,
        descr:objectToTable(filterKeys(port,[
          ['snmp_name',       'Порт'],
          ['subscriber_list', 'Абонент',    ()=>subscriber?`${subscriber.account} кв.${subscriber.flat||'?'}`:'-'],
          ['!1',              'Vlan',       vlans?.range_untag||'-'],
          ['!2',              'Коммутатор', `${ne.ip} ${getModelText(ne.vendor,ne.model,ne.system_object_id)}`],
          ['!3',              'Адрес',      truncateSiteAddress(ne?.region?.location)],
        ]))
      }
    },
    port(){return this.resps.port||this.portProp||this.$route.params.portProp},
    networkElement(){return this.resps.networkElement},
    status(){return this.resps.getPortLink},
    in_errors(){return parseInt(this.status?.in_error)||0},
    out_errors(){return parseInt(this.status?.out_error)||0},
    hasErrors(){return this.in_errors||this.out_errors},
    port_errors_text(){return `${this.in_errors} / ${this.out_errors}`},
    ifAlias(){return (/^HUAWEI,\s/.test(this.port?.snmp_description||'')||(this.port?.snmp_description||'').includes(this.port?.snmp_name))?'':this.port?.snmp_description||''},
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
    loadingSome(){return Object.values(this.loads).some(l=>l)},
    hasPortSfp(){return this.port?.is_sfp_ddm||this.port?.is_trunk},
    hasPortLbd(){return !this.port?.is_trunk},
    hasLbd(){return !!this.resps.getPortLbdInfo},
    hasLbdBlocked(){return !!this.resps.getPortLbdInfo?.detected},
    toTopology(){
      if(!this.port?.name){return};
      if(!this.networkElement){return};
      return {name:'net-topology',params:{type:'port',id:this.port.name,portProp:this.port,deviceProp:this.networkElement}}
    },
    vlans(){
      const {port_mode,tag,untag}=(this.resps.getPortVlans?.text||[]).reduce((vlans,row)=>{
        if(row.port_mode){
          vlans.port_mode=row.port_mode;
        }else if(row.untagged_port){
          vlans.untag[row.vlan_num]={vid:row.vlan_num,name:row.vlan_name};
        }else if(row.tagged_port){
          vlans.tag[row.vlan_num]={vid:row.vlan_num,name:row.vlan_name};
        }
        return vlans
      },{port_mode:'',tag:{}, untag:{}});
      const arr_tag=Object.keys(tag);
      const arr_untag=Object.keys(untag);
      const range_tag=getRangesFromArray(arr_tag);
      const range_untag=getRangesFromArray(arr_untag);
      return {
        port_mode,tag,untag,
        arr_tag,arr_untag,
        range_tag,range_untag,
        titleTag:arr_tag.length>2?`${arr_tag[0]}...`:arr_tag[0]||'',
        titleUntag:arr_untag.length>2?`${arr_untag[0]}...`:arr_untag[0]||''
      }
    },
  },
  methods:{
    eventLoading(event){
      this.loads.someActionLoading=event
    },
    refresh(){
      this.getAll('update');
    },
    async getAll(update=false){
      if(!update&&(this.portProp||this.$route.params.portProp)){
        this.resps.port=this.portProp||this.$route.params.portProp;
      }else{
        await this.getPort('update');
      };
      this.getPortLink();
      await this.getDevice('update');
      if(this.hasPortLbd){
        await this.getPortLbdInfo('no_getPortLink');
      };
      //await this.getPortVlans();//too long
    },
    async getPortLink(){
      if(!this.port?.device_name){return};
      if(!this.port?.snmp_number){return};
      this.loads.getPortLink=true;
      this.resps.getPortLink=null;
      //this.getCmtsDeviceInfo();
      try{
        const response=await httpGet(buildUrl('port_status_by_ifindex',{
          device:this.port.device_name,
          port_ifindex:this.port.snmp_number
        },'/call/hdm/'));
        this.resps.getPortLink=response;
      }catch(error){
        console.warn('port_status_by_ifindex.error',error);
      }
      this.loads.getPortLink=false;
    },
    async getDevice(update=false){
      if(!this.port?.device_name){return};
      this.loads.networkElement=true;
      const cache=this.$cache.getItem(`device/${this.port.device_name}`);
      if(cache&&!update){
        this.resps.networkElement=cache;
      }else{
        try{
          const response=await httpGet(buildUrl('search_ma',{pattern:this.port.device_name},'/call/v1/search/'));
          if(response.data){
            this.$cache.setItem(`device/${this.port.device_name}`,response.data);
            this.resps.networkElement=response.data;
          };
        }catch(error){
          console.warn('search_ma:networkElement.error', error);
        }
      };
      this.loads.networkElement=false;
    },
    async getPort(update=false){
      this.loads.port=true;
      const cache=this.$cache.getItem(`port/${this.$route.params.id}`);
      if(cache&&!update){
        this.resps.port=cache;
      }else{
        try{
          const response=await httpGet(buildUrl('search_ma',{pattern:this.$route.params.id},'/call/v1/search/'));
          if(response.data){
            this.$cache.setItem(`port/${this.$route.params.id}`,response.data);
            this.resps.port=response.data;
          };
        }catch(error){
          console.warn('search_ma:port.error', error);
        }
      };
      this.loads.port=false;
    },
    async doPortErrorsClean(){
      if(!this.port?.snmp_name){return};
      if(!this.networkElement?.region?.mr_id){return};
      this.errors.doPortErrorsClean=false;
      this.loads.doPortErrorsClean=true;
      try{
        await httpPost('/call/hdm/port_error_clean',{
          port:{
            SNMP_PORT_NAME:this.port.snmp_name,
            PORT_NUMBER:this.port.number,
          },
          device:{
            MR_ID:this.networkElement.region.mr_id,
            IP_ADDRESS:this.networkElement.ip,
            SYSTEM_OBJECT_ID:this.networkElement.system_object_id,
            VENDOR:this.networkElement.vendor,
            DEVICE_NAME:this.networkElement.name,
            FIRMWARE:this.networkElement.firmware,
            FIRMWARE_REVISION:this.networkElement.firmware_revision,
            PATCH_VERSION:this.networkElement.patch_version,
          }
        });
        this.getPortLink();
      }catch(error){
        this.errors.doPortErrorsClean=true;
        console.warn('port_error_clean.error',error);
      };
      this.loads.doPortErrorsClean=false;
    },
    async getPortLbdInfo(no_getPortLink=false){
      if(!this.port?.snmp_name){return};
      if(!this.networkElement?.region?.mr_id){return};
      this.errors.getPortLbdInfo=false;
      this.loads.getPortLbdInfo=true;
      try{
        const response=await httpPost('/call/hdm/port_info_loopback',{
          device:{
            MR_ID:this.networkElement.region.mr_id,
            IP_ADDRESS:this.networkElement.ip,
            SYSTEM_OBJECT_ID:this.networkElement.system_object_id,
            VENDOR:this.networkElement.vendor,
            FIRMWARE:this.networkElement.firmware,
            FIRMWARE_REVISION:this.networkElement.firmware_revision,
            PATCH_VERSION:this.networkElement.patch_version,
          },
          port:{
            SNMP_PORT_NAME:this.port.snmp_name
          },
        });
        if(!(response||{}).hasOwnProperty('detected')||['Неизвестный ответ','Функционал не включен','Ошибка проверки петли'].includes(response?.description)){
          this.errors.getPortLbdInfo=true;
        }else{
          this.resps.getPortLbdInfo=response;
          if(!no_getPortLink){
            this.getPortLink();
          };
        };
      }catch(error){
        this.errors.getPortLbdInfo=true;
        console.warn("port_info_loopback.error",error);
      }
      this.loads.getPortLbdInfo=false;
    },
    async getPortVlans(){
      if(!this.port?.snmp_name){return};
      if(!this.networkElement?.region?.mr_id){return};
      const {ip:ip_address,system_object_id,vendor}=this.networkElement;
      const {mr_id}=this.networkElement.region;
      this.errors.getPortVlans=false;
      this.loads.getPortVlans=true;
      try{
        const response=await httpGet(buildUrl("vlan_on_port",{
          mr_id,ip_address,system_object_id,vendor,
          port:this.port.snmp_name
        },"/call/hdm/"));
        if((response?.text||[])?.length&&response?.message=="OK") {
          this.resps.getPortVlans=response;
        }else{
          this.errors.getPortVlans=true;
        }
      }catch(error){
        this.errors.getPortVlans=true;
        console.warn('port_error_clean.error',error);
      };
      this.loads.getPortVlans=false;
    },
    openPortVlansModal(){
      this.$refs.PortVlansModal.open();
    }
  },
});

Vue.component("PortPage2",{
  template:`<main name="PortPage2">
    <transition name="slide-page" mode="out-in" appear>
      <div v-if="showNav">
        <page-navbar :title="title" @refresh="refresh"/>
        <CardBlock>
          <PortNav :port="port"/>
        </CardBlock>
      </div>
    </transition>
    <loader-bootstrap v-if="loadingPort" text="получение данных порта"/>
    <loader-bootstrap v-if="loadingDevice" text="получение данных устройства"/>
    <transition name="slide-page" mode="out-in">
      <keep-alive>
        <router-view :portProp="port" :key="port.name" @set:nav="showNav=$event"/>
      </keep-alive>
    </transition>
  </main>`,
  props:{
    id:{type:String,required:true},
    portProp:{type:Object,default:null},
  },
  data:()=>({
    showNav:true,
    cachedPorts:[],
    port:null,
    loadingPort:false,
    device:null,
    loadingDevice:false,
  }),
  async created(){
    this.port=this.portProp;
    if(!this.port){
      await this.getPort(this.id,true);
    }
    await this.getDevice(this.port.device_name);
  },
  computed:{
    title(){
      return this.port.snmp_name;
    },
  },
  methods:{
    refresh(){
      if(this.port?.name){
        this.getPort(this.port.name,true);
        this.getDevice(this.port.device_name,true);
      }else{
        localStorage.clear();
        document.location.reload();
      };
    },
    async getPort(port_name,update=false){
      this.loadingPort=true
      const cache=this.$cache.getItem(`port/${port_name}`);
      if(cache&&!update){
        this.port=cache;
      }else{
        try{
          let response=await httpGet(buildUrl('search_ma',{pattern:port_name},'/call/v1/search/'));
          if(response.data){
            this.$cache.setItem(`port/${port_name}`,response.data);
            this.cachedPorts.push(response.data)
            this.port=response.data
          }else if(response.type=='warning'||response.key!='port'){
            this.$router.push({name:'search',params:{text:port_name}})
          };
        }catch(error){
          console.warn('search_ma:port.error', error);
        }
      };
      this.loadingPort=false
    },
    async getDevice(device_name,update=false){
      this.loadingDevice=true
      const cache=this.$cache.getItem(`device/${device_name}`);
      if(cache&&!update){
        this.device=cache;
      }else{
        try{
          let response=await httpGet(buildUrl('search_ma',{pattern:device_name},'/call/v1/search/'));
          if(response.data){
            this.$cache.setItem(`device/${device_name}`,response.data);
            this.device=response.data
          };
        }catch(error){
          console.warn('search_ma:device.error', error);
        }
      };
      this.loadingDevice=false
    },
  },
  beforeRouteEnter(to,from,next){
    if(!to.params.portProp){
      next({name:'search',params:{text:to.params.id}});
      this.showNav=true;
      return;
    };
    next();
  },
  beforeRouteUpdate(to,from,next){
    const port_name=to.params.id;
    if(!to.params.portProp||to.params.portProp.name!=this.port.name){
      const port=this.cachedPorts.find(port=>port.name==port_name)
      if(!port){
        this.getPort(port_name)
      }else{
        this.port=port
      };
    };
    this.showNav=true
    next();
  },
});

router.addRoutes([
  {//порт коммутатора 2
    component:Vue.component('PortPage2'),
    path:'/eth-port2/:id',
    props:true,
    children:[
      {
        path:'',
        name:'eth-port2',
        component:Vue.component('PortLayout2'),
        props:true,
        exact:true,
      },
    ],
  }
]);

router.beforeEach((to,from,next)=>{
  if(to.name=='eth-port'){
    next({...to,name:'eth-port2'})
  }else{
    next()
  };
})
















