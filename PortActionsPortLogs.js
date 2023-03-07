//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionsPortLogs.js',type:'text/javascript'}));
Vue.component("port-actions",{
  //template:"#port-actions-template",
  template:`<card-block>
    <title-main text="Действия" textSize="medium" :opened="open" @block-click="open=!open" data-ic-test="open_port_action_btn"/>
    <template v-if="open">
      <port-restart-action :disabled="disableAction.restart" :device="device" :port="port" @load:status="eventLoadStatus"/>
      <port-bind-user-action :disabled="disableAction.bind_user||loading_status" :port="port" :status="status" :device="device"/>
      <port-cable-test-action :disabled="disableAction.cable_test" :port="port" :device="device"/>
      <PortLogs :disabled="disableAction.log" v-bind="{port,device}"/>
      <!--<port-log-action :disabled="disableAction.log" :port="port" :device="device"/>-->
      <port-iptv-diag :disabled="disableAction.log" :port="port" :device="device"/>
      <port-clear-mac-action :disabled="disableAction.clear_mac" :port="port" :device="device" @load:status="eventLoadStatus"/>
      <port-addr-bind-action :disabled="disableAction.addr_bind" :port="port" :device="device"  @load:status="eventLoadStatus"/>
    </template>
  </card-block>`,
  props:{
    port:{type:Object,required:true},
    device:{type:Object,required:true},
    disabled:{type:Boolean,default:false},
    disableAction:{type:Object},
    status:{type:Object,required:true},
    loading_status:{type:Boolean,default:false},
  },
  data:()=>({
    open:false
  }),
  methods: {
    eventLoadStatus() {
      this.$emit("load:status");
    },
  },
});
Vue.component("PortLogs",{
  template:`<section name="PortLogs">
    <PortLogsModal ref="PortLogsModal" v-bind="{port,device}"/>
    <link-block icon="log" text="Логи порта*" :disabled="disabled" @block-click="openPortLogsModal" actionIcon="expand"/>
  </section>`,
  props:{
    disabled:{type:Boolean,default:false},
    port:{type:Object,required:true},
    device:{type:Object,required:true},
  },
  computed:{},
  methods:{
    openPortLogsModal(){
      this.$refs.PortLogsModal.open();
    },
  },
});
Vue.component("PortLogsModal",{
  template:`<modal-container-custom name="PortLogsModal" ref="modal" @open="openedEvent" header :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="display-flex align-items-center gap-4px margin-left-right-16px margin-bottom-16px">
      <switch-el class="width-40px" v-model="enablePortFilter"/>
      <div class="font--13-500" v-if="enablePortFilter">Логи по порту {{port.snmp_name}}</div>
      <div class="font--13-500 tone-500" v-else>Логи по коммутатору {{device.ip}}</div>
    </div>
    
    <loader-bootstrap v-if="loading" text="получение логов с коммутатора"/>
    <message-el v-else-if="error" text="Ошибка получения данных" :subText="error" box type="warn" class="margin-left-right-16px"/>
    <message-el v-else-if="!rows.length&&enablePortFilter" text="Не найдено" :subText="subText_dev" box type="info" class="margin-left-right-16px"/>
    <div v-else class="margin-left-right-8px display-flex flex-direction-column gap-1px">
      <template v-for="(row,index) of rows">
        <devider-line v-if="index" m="unset"/>
        <PortLogRow :key="index" v-bind="{row,port,device}"/>
      </template>
    </div>
    
    <div class="margin-top-16px width-100-100 display-flex align-items-center justify-content-space-around">
      <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="medium"/>
      <button-main label="Обновить" @click="refresh" :disabled="loading" buttonStyle="outlined" size="large"/>
    </div>
  </modal-container-custom>`,
  props:{
    port:{type:Object,required:true},
    device:{type:Object,required:true},
  },
  data:()=>({
    loading:false,
    error:'',
    log:[],
    enablePortFilter:true,
  }),
  computed: {
    subText_dev(){return `[${this.device?.region?.id}] ${this.device.ip} ${this.port.snmp_name}`},
    rows(){
      if(!this.enablePortFilter){
        return this.log.filter(v=>v&&v.length>30)//.slice(0,200)
        //D-Link,Edge-Core
        //const prefix='Port ';
        //const port=('2023-02-26 12:19:15 Port 15 link down').match(new RegExp(`[^a-zA-Z]${prefix}0-9]{1,2}[^0-9]`,'i'))?.[0]
        
        //FiberHome, Huawei, H3C
        //const prefixes=new Set();
        //for(const {snmp_name} of ports){
        //  const parts=snmp_name.split('/');
        //  const index=parts.pop();
        //  const prefix=parts.join('/')+'/';
        //  set.add(prefix)
        //};
        //const prefix=[...prefixes].reverse().join('|');//need reverse for X prefix after GigaEthernet
        //const port=('2-IFM-LINKDOWN(l):Interface GigabitEthernet1/0/23 LinkDown.').match(new RegExp(`[^a-zA-Z]${prefix}[0-9]{1,2}[^0-9]`))?.[0]
      };
      if(['D-LINK','EDGE-CORE'].includes(this.device.vendor)){
        const poNum=`Port ${this.port.snmp_number}`;
        return this.log.filter(row=>{
          return row.length>30&&new RegExp(`[^a-zA-Z]${poNum}[^0-9]`,'i').test(row)
        })
      }else{//FiberHome, Huawei, H3C
        const ifName=`${this.port.snmp_name}`;
        return this.log.filter(row=>{
          return row.length>30&&new RegExp(`[^a-zA-Z]${ifName}[^0-9]`).test(row);
        });
      }
    },
  },
  methods:{
    open(){//public
      this.$refs.modal.open()
    },
    close(){//public
      this.$refs.modal.close()
    },
    openedEvent(){
      this.getLogShort();
    },
    refresh(){
      this.getLogShort();
    },
    async getLogShort(){
      this.loading=true;
      this.error="";
      this.log=[];
      try{
        const response=await httpPost(buildUrl('log_short',objectToQuery({
          mr_id:this.device.region.mr_id,
          ip:this.device.ip,
          ifName:this.port.snmp_name,
        }),'/call/hdm/'),{
          port:{
            SNMP_PORT_NAME:this.port.snmp_name,
            PORT_NUMBER:this.port.number,
            name:this.port.name
          },
          device:{
            MR_ID:this.device.region.mr_id,
            IP_ADDRESS:this.device.ip,
            SYSTEM_OBJECT_ID:this.device.system_object_id,
            VENDOR:this.device.vendor,
            DEVICE_NAME:this.device.name,
            FIRMWARE:this.device.firmware,
            FIRMWARE_REVISION:this.device.firmware_revision,
            PATCH_VERSION:this.device.patch_version,
            name:this.device.name
          }
        });
        if(response.message==="OK"&&Array.isArray(response.text)){
          if(this.device.vendor=='H3C'){//temp, need reverse
            this.log=response.text.reverse();
          }else{
            this.log=response.text;
          };
        }else if(response.error){
          this.error=response.text;
        }
      }catch(error){
        this.error='unexpected';
        console.warn("log_short.error",error)
      };
      this.loading=false;
    }
  },
});
Vue.component("PortLogRow",{
  template:`<div name="PortLogRow" class="display-flex flex-wrap-wrap gap-2px font--12-400">
    <span v-for="({text,...props}) of texts" v-bind="props">{{text}}</span>
  </div>`,
  props:{
    row:{type:String,default:''},
    port:{type:Object,required:true},
    device:{type:Object,required:true}
  },
  data:()=>({
    tileClass:'padding-left-right-2px border-radius-4px text-align-center',
    bgPort:'#4682b4',//steelblue
    cText:'#f0f8ff',//aliceblue
    bgLinkUp:'#228b22',//forestgreen
    bgLinkDn:'#778899',//lightslategray
    bgDate:'#5f9ea0',//cadetblue
  }),
  computed:{
    vendorTime(){
      if('EDGE-CORE'==this.device.vendor){
        return {//750] 17:27:39 2023-03-07
          time_regexp:/\d{2}:\d{2}:\d{2}\s\d{4}-\d{2}-\d{2}/,
        };
      }else if('D-LINK'==this.device.vendor){
        return {//58318 2023-02-23 15:21:48
          time_regexp:/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/,
        };
      }else if(this.device.vendor=='FIBERHOME'){
        return {//2023/02/17 18:09:21
          time_regexp:/\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}/,
        };
      }else if(this.device.vendor=='HUAWEI'){
        return {//Mar  7 2023 23:56:41+07:00
          time_regexp:/\w{3}\s{1,2}\d{1,2}\s\d{4}\s\d{2}:\d{2}:\d{2}/,
        };
      }else if(this.device.vendor=='H3C'){
        return {//%Mar  1 02:08:55:598 2013
          time_regexp:/\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}:\d{3}\s\d{4}/,
        };
      }else{//default
        return {
          time_regexp:/\d{2}:\d{2}:\d{2}\s\d{4}-\d{2}-\d{2}/,
        };
      }
    },
    vendorPort(){
      if(['D-LINK','EDGE-CORE'].includes(this.device.vendor)){
        const port=`Port ${this.port.snmp_number}`;
        return {
          port,
          port_regexp:new RegExp(`[^a-zA-Z]${port}[^0-9]`,'i')
        };
      }else{
        const port=`${this.port.snmp_name}`;//FiberHome, Huawei, H3C
        return {
          port,
          port_regexp:new RegExp(`[^a-zA-Z]${port}[^0-9]`)
        };
      }
    },
    vendorLink(){//IFNET
      if(this.device.vendor=='D-LINK'){
        return {
          linkup_regexp:new RegExp(`link up`,'i'),
          linkdn_regexp:new RegExp(`link down`,'i'),
        };
      }else if(this.device.vendor=='EDGE-CORE'){
        return {
          linkup_regexp:new RegExp(`link-up`,'i'),
          linkdn_regexp:new RegExp(`link-down`,'i'),
        };
      }else if(this.device.vendor=='FIBERHOME'){//X|XL
        return {
          linkup_regexp:new RegExp(`LinkUP|OperStatus=\\[up\\]`,'i'),
          linkdn_regexp:new RegExp(`LinkDown|OperStatus=\\[down\\]`,'i'),
        };
      }else if(this.device.vendor=='HUAWEI'){
        return {
          linkup_regexp:new RegExp(`into UP state`,'i'),
          linkdn_regexp:new RegExp(`into DOWN state`,'i'),
        };
      }else if(this.device.vendor=='H3C'){
        return {
          linkup_regexp:new RegExp(`changed to up`,'i'),
          linkdn_regexp:new RegExp(`changed to down`,'i'),
        };
      }else{//default
        return {
          linkup_regexp:new RegExp(`[^a-zA-Z0-9]up[^a-zA-Z0-9]`,'i'),
          linkdn_regexp:new RegExp(`[^a-zA-Z0-9]down[^a-zA-Z0-9]`,'i'),
        };
      }
    },
    texts(){
      const texts=[];
      const {time_regexp}=this.vendorTime;
      const _texts_date_around=`  ${this.row}`.split(time_regexp);
      const date=this.parseDate(this.row,time_regexp);
      let _texts_after_date='';console.log({date,_texts_date_around})
      if(_texts_date_around.length>=2&&date){
        const [text0_before_date,...__texts_after_date]=_texts_date_around;
        _texts_after_date=__texts_after_date;
        texts.push(...[
          //{text:text0_before_date},
          {
            text:date,
            class:this.tileClass,
            style:{
              'background-color':this.bgDate,
              'color':this.cText,
            }
          },
        ]);
      }else{
        _texts_after_date=_texts_date_around;
      };
      
      const {port,port_regexp}=this.vendorPort;
      const _texts_port_around=`${_texts_after_date}  `.split(port_regexp);
      let _texts_after_port='';
      
      if(_texts_port_around.length>=2){
        const [text0_before_port,...__texts_after_port]=_texts_port_around;
        _texts_after_port=__texts_after_port;
        texts.push(...[
          {text:text0_before_port},
          {
            text:port,
            class:this.tileClass,
            style:{
              'background-color':this.bgPort,
              'color':this.cText,
            }
          },
        ]);
      }else{
        _texts_after_port=_texts_port_around;
      };
      
      const {linkup_regexp,linkdn_regexp}=this.vendorLink;
      const _row_after_port=_texts_after_port.join(` ${port} `);
      const _texts_linkup_around=_row_after_port.split(linkup_regexp);
      const _texts_linkdn_around=_row_after_port.split(linkdn_regexp);
      const isLinkUp=_texts_linkup_around.length>=2;
      const isLinkDn=_texts_linkdn_around.length>=2;
      const _texts_link_around=isLinkUp?_texts_linkup_around:isLinkDn?_texts_linkdn_around:_texts_after_port;
      const [text0_before_link,..._texts_after_link]=_texts_link_around;
      if(isLinkUp||isLinkDn){
        texts.push(...[
          {text:text0_before_link},
          {
            text:isLinkUp?'LinkUp':'LinkDown',
            class:this.tileClass,
            style:{
              'background-color':isLinkUp?this.bgLinkUp:this.bgLinkDn,
              'color':this.cText,
            }
          },
          ..._texts_after_link.map(text=>text.split(' ').filter(v=>v).map(text=>({text}))).flat(),
        ])
      }else{
        texts.push(..._texts_after_port.map(text=>text.split(' ').filter(v=>v).map(text=>({text}))).flat())
      }
      return texts
    }
  },
  methods:{
    parseDate(row='',regexp=''){
      let date=new Date(Date.parse(row.match(regexp)?.[0]));
      if(!date||date=='Invalid Date'){return}
      return [
        date.toLocaleDateString('ru',{year:'2-digit',month:'2-digit',day:'2-digit'}),
        date.toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
      ].join(' '); 
    }
  },
});



































