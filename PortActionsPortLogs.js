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
    <div class="margin-left-right-16px">
      
      <div class="margin-bottom-8px">
        <div class="display-flex align-items-center gap-4px">
          <switch-el class="width-40px" v-model="enablePortFilter"/>
          <div class="font--13-500" v-if="enablePortFilter">Логи по порту {{port.snmp_name}}</div>
          <div class="font--13-500 tone-500" v-else>Логи по коммутатору {{device.ip}}</div>
        </div>
        <div class="display-flex align-items-center gap-4px" v-show="enablePortFilter">
          <switch-el class="width-40px" v-model="enableLinkFilter"/>
          <div class="font--13-500" v-if="enableLinkFilter">Только линк</div>
          <div class="font--13-500 tone-500" v-else>Все события {{rowsFilteredCount?('('+rowsFilteredCount+')'):''}}</div>
        </div>
      </div>
      
      <loader-bootstrap v-if="loading" text="получение логов с коммутатора"/>
      <message-el v-else-if="error" text="Ошибка получения данных" :subText="error" box type="warn"/>
      <message-el v-else-if="!rowsFilteredCount&&enablePortFilter" text="Нет событий по порту" box type="info"/>
      <template v-else>
        <PortLogLinkEventsChart v-if="showPortLogLinkEventsChart" :events="events" class="margin-bottom-8px"/>
        <div class="display-flex flex-direction-column gap-1px">
          <template v-for="(row,index) of rowsFiltered">
            <devider-line v-if="index" m="unset"/>
            <PortLogRow :key="row.row_index" v-bind="row" :hideNotParsed="hideNotParsed"/>
          </template>
        </div>
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
    rowsParsed:[],
    enablePortFilter:true,
    enableLinkFilter:true,
    minRowLength:30,
    minEventsCount:6,
  }),
  computed:{
    hideNotParsed(){return this.enablePortFilter&&this.enableLinkFilter},
    rowsFiltered(){
      return this.rowsParsed.filter(({row,portIsFinded})=>{
        return row&&row.length>=this.minRowLength&&(this.enablePortFilter?portIsFinded:true)
      })
    },
    rowsFilteredCount(){return this.rowsFiltered.length},
    showPortLogLinkEventsChart(){
      return this.rowsFilteredCount>=this.minEventsCount&&this.enablePortFilter&&this.enableLinkFilter&&this.events.length>=this.minEventsCount;
    },
    events(){
      return this.rowsParsed.reduce((events,{row,texts,logDate,portIsFinded,isLinkUp,isLinkDn,portText})=>{
        if(portIsFinded&&logDate&&(isLinkUp||isLinkDn)){
          const {formatted,time}=logDate;
          events.push({
            time,
            date:formatted,
            state:!!isLinkUp,
          });
        };
        return events
      },[]);
    },
    vendorPortRegexp(){
      if(['D-LINK','EDGE-CORE'].includes(this.device.vendor)){
        const portText=`Port ${this.port.snmp_number}`;
        return {portText,port_regexp:new RegExp(`[^a-zA-Z]${portText}[^0-9]`,'i')};
      }else{
        const portText=`${this.port.snmp_name}`;//FiberHome, Huawei, H3C
        return {portText,port_regexp:new RegExp(`[^a-zA-Z]${portText}[^0-9]`)};
      }
    },
    vendorLinkRegexp(){//IFNET
      switch(this.device.vendor){
        case 'D-LINK':return {
          linkup_regexp:/link up/i,
          linkdn_regexp:/link down/i,
        };
        case 'EDGE-CORE':return {
          linkup_regexp:/link-up/i,
          linkdn_regexp:/link-down/i,
        };
        case 'FIBERHOME':return {
          linkup_regexp:/LinkUP|OperStatus=\[up\]/i,
          linkdn_regexp:/LinkDown|OperStatus=\[down\]/i,
        };
        case 'HUAWEI':return {
          linkup_regexp:/into UP state/i,
          linkdn_regexp:/into DOWN state/i,
        };
        case 'H3C':return {
          linkup_regexp:/changed to up/i,
          linkdn_regexp:/changed to down/i,
        };
        default:return {
          linkup_regexp:/[^a-zA-Z0-9]up[^a-zA-Z0-9]/i,
          linkdn_regexp:/[^a-zA-Z0-9]down[^a-zA-Z0-9]/i,
        };
      };
    },
  },
  watch:{
    'log'(){
      this.rowsParsed=this.log.map((row,row_index)=>{
        return {...this.parseRow(row),row_index}
      })
    }
  },
  methods:{
    parseLogDate(row=''){
      let parsed='';
      for(const regexp of [
        /\d{2}:\d{2}:\d{2}\s\d{4}-\d{2}-\d{2}/,//750] 17:27:39 2023-03-07 - Edge-Core
        /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}/,//438    Mar  6 10:21:17:LinkStatus-6 - D-Link 1210 (no y, parsed as 2001)
        /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/,//58318 2023-02-23 15:21:48 - D-Link 3200
        /\d{4}\/\d{2}\/\d{2}\s\s\d{2}:\d{2}:\d{2}/,//2457   2023/03/08  14:43:24 - D-Link 3026
        /\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}/,//2023/02/17 18:09:21 - FiberHome
        /\w{3}\s{1,2}\d{1,2}\s\d{4}\s\d{2}:\d{2}:\d{2}/,//Mar  7 2023 23:56:41+07:00 - Huawei 2328
        /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}:\d{3}\s\d{4}/,//%Mar  1 02:08:55:598 2013 - H3C
        /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}/,//Mar  7 20:11:58+03:00 - Huawei 5300 (no y, parsed as 2001)
      ]){
        parsed=row.match(regexp)?.[0];
        if(parsed){break};
      };
      const time=Date.parse(parsed)
      const date=new Date(time);
      if(!date||date=='Invalid Date'){return}
      const formatted=[
        date.toLocaleDateString('ru',{year:'2-digit',month:'2-digit',day:'2-digit'}),
        date.toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
      ].join(' '); 
      return {parsed,time,date,formatted};
    },
    parseRow(row){
      const bgPort='#4682b4';//steelblue
      const cText='#f0f8ff';//aliceblue
      const bgLinkUp='#228b22';//forestgreen
      const bgLinkDn='#778899';//lightslategray
      const bgDate='#5f9ea0';//cadetblue
      let logDate=null;
      let portIsFinded=false;
      let isLinkUp=false;
      let isLinkDn=false;
      
      const texts=[];
      
      logDate=this.parseLogDate(row)||null;
      let _texts_date_around=!logDate?.date?[row]:` ${row}`.split(logDate.parsed);
      let _texts_after_date=[];
      if(_texts_date_around.length>=2&&logDate?.formatted){
        const [text0_before_date,...__texts_after_date]=_texts_date_around;
        _texts_after_date=__texts_after_date;
        texts.push(...[
          /*{text:text0_before_date},*/
          {
            text:logDate.formatted,
            style:{
              'background-color':bgDate,
              'color':cText,
            }
          },
        ]);
      }else{
        _texts_after_date=_texts_date_around;
      };
      
      const {portText,port_regexp}=this.vendorPortRegexp;
      const _texts_port_around=`${_texts_after_date.join(' ')}  `.split(port_regexp);
      let _texts_after_port=[];
      portIsFinded=false;
      if(_texts_port_around.length>=2){
        const [text0_before_port,...__texts_after_port]=_texts_port_around;
        _texts_after_port=__texts_after_port;
        texts.push(...[
          {text:text0_before_port},
          {
            text:portText,
            style:{
              'background-color':bgPort,
              'color':cText,
            }
          },
        ]);
        portIsFinded=true;
      }else{
        _texts_after_port=_texts_port_around;
      };
      
      const {linkup_regexp,linkdn_regexp}=this.vendorLinkRegexp;
      const _row_after_port=_texts_after_port.join(` ${portText} `);
      const _texts_linkup_around=_row_after_port.split(linkup_regexp);
      const _texts_linkdn_around=_row_after_port.split(linkdn_regexp);
      isLinkUp=_texts_linkup_around.length>=2;
      isLinkDn=_texts_linkdn_around.length>=2;
      const _texts_link_around=isLinkUp?_texts_linkup_around:isLinkDn?_texts_linkdn_around:_texts_after_port;
      const [text0_before_link,..._texts_after_link]=_texts_link_around;
      if(isLinkUp||isLinkDn){
        texts.push(...[
          {text:text0_before_link},
          {
            text:isLinkUp?'LinkUp':'LinkDown',
            style:{
              'background-color':isLinkUp?bgLinkUp:bgLinkDn,
              'color':cText,
            }
          },
          ..._texts_after_link.map(text=>text.split(' ').filter(v=>v).map(text=>({text}))).flat(),
        ]);
      }else{
        isLinkUp=false;
        isLinkDn=false;
        texts.push(..._texts_after_port.map(text=>text.split(' ').filter(v=>v).map(text=>({text}))).flat())
      };
      
      return {row,texts,logDate,portIsFinded,isLinkUp,isLinkDn,portText}
    },
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
          //ifName:this.port.snmp_name,
        }),'/call/hdm/'),{
          port:{
            //SNMP_PORT_NAME:this.port.snmp_name,
            //PORT_NUMBER:this.port.number,
            //name:this.port.name
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
            //name:this.device.name
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
    },
  },
});
Vue.component("PortLogLinkEventsChart",{
  template:`<div name="PortLogLinkEventsChart">
    <div class="font--12-400 text-align-center">{{linkDownCounterText||''}}</div>
    <div class="display-flex align-items-center flex-direction-row-reverse" style="background:#a9a9a938">
      <div v-for="(ev,index) of events" :key="index" :style="getStyle(ev,index)" class="min-height-20px"></div>
    </div>
    <div class="display-flex align-items-center justify-content-space-between">
      <span class="font--12-400">{{first?.date}}</span>
      <span class="font--12-400" v-if="first?.date&&last?.date" arrow>⟹</span>
      <span class="font--12-400">{{last?.date}}</span>
    </div>
  </div>`,
  props:{
    events:{type:Array,default:()=>[]}
  },
  data:()=>({}),
  computed:{
    count(){return this.events.length},
    first(){return this.events[this.count-1]},
    last(){return this.events[0]},
    total(){
      const {first,last}=this;
      if(!first||!last){return 0};
      return last.time-first.time;
    },
    countLinkDown(){return this.events.filter(({state})=>!state).length},
    linkDownCounterText(){
      if(!this.countLinkDown){return};
      const [days,hours,minutes]=this.getDurationDays(this.total);
      const duration=[
        days?`${days} ${plural(['день','дня','дней'],days)}`:'',
        hours?`${hours} ${plural(['час','часа','часов'],hours)}`:'',
        minutes?`${minutes} ${plural(['мин.','мин.','мин.'],minutes)}`:'',
      ].filter(v=>v).join(' ');
      return [
        `${this.countLinkDown} ${plural(['падение','падения','падений'],this.countLinkDown)} линка`,
        duration?`за`:'',
        duration
      ].filter(v=>v).join(' ');
    },
  },
  methods:{
    getDurationDays(ms){
      ms=ms/1000;
      const days=Math.floor(ms/60/60/24);
      const hours=Math.floor(ms/60/60)-(days*24);
      const minutes=Math.floor(ms/60)-(hours*60)-(days*24*60);
      return [days,hours,minutes];
    },
    getStyle(ev,index=0){
      if(!this.total){return};
      const prev=this.events[index-1];
      const percent=prev?Math.floor((prev.time-ev.time)*99/this.total)||1:0
      return {
        width:!prev?`1%`:`${percent}%`,
        background:ev.state?'#228b224d':'#778899'
      };
    }
  }
});
Vue.component("PortLogRow",{
  template:`<div name="PortLogRow" class="display-flex flex-wrap-wrap gap-2px font--12-400">
    <span v-for="({text,style}) of texts" v-if="hideNotParsed?style:true" v-bind="{style}" :class="[style&&tileClass]">{{text}}</span>
  </div>`,
  props:{
    row:{type:String,default:''},
    texts:{type:Array,default:()=>([])},
    logDate:{type:Object,default:null},
    portIsFinded:{type:Boolean,default:false},
    isLinkUp:{type:Boolean,default:false},
    isLinkDn:{type:Boolean,default:false},
    hideNotParsed:{type:Boolean,default:false},
    portText:{type:String,default:''},
  },
  data:()=>({
    tileClass:'padding-left-right-2px border-radius-4px text-align-center',
  }),
  computed:{},
  methods:{},
});



































