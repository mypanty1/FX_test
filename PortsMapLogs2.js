Vue.component("PortsMapLogs2",{
  template:`<section name="PortsMapLogs2">
    <link-block :actionIcon="open?'down':'up'" icon="log" text="Логи портов" :textSub="titleText" textSubClass="tone-500 font--12-400" type="large" @block-click="open=!open"/>
    <div v-show="open" class="margin-left-right-16px">
      <loader-bootstrap v-if="loading" text="получение логов с коммутатора"/>
      <message-el v-else-if="error" text="Ошибка получения данных" :subText="error" box type="warn"/>
      <message-el v-else-if="!countPortsLinkEvents" text="Нет событий IF_STATE" box type="info"/>
      <div v-else class="position-relative" ref="touch_el" style="cursor:crosshair;">
        <div class="display-flex flex-direction-column gap-1px">
          <template v-for="(portEvents,portId,index) in portsEvents.events">
            <devider-line v-if="index" m="unset"/>
            <PortsMapLogsPortLinkEventsChart2 :key="portId" :events="portEvents.events" :port="portEvents.port" :dateMax="portsEvents.dateMax" :dateMin="portsEvents.dateMin"/>
          </template>
        </div>
        <div class="display-flex align-items-center justify-content-space-between">
          <span class="font--12-400">{{portsEvents.dateMin?.formatted}}</span>
          <span class="font--12-400" v-if="portsEvents.dateMin?.formatted&&portsEvents.dateMax?.formatted" arrow>⟹</span>
          <span class="font--12-400">{{portsEvents.dateMax?.formatted}}</span>
        </div>
        <template v-if="cursorLine">
          <div class="position-absolute display-flex flex-direction-column justify-content-space-between" style="top:12px;bottom:12px;width:2px;background:#000000;opacity:0.5;" :style="cursorLine.style">
            <span style="margin-top:-15px; margin-left:-7px;">▼</span>
            <span style="margin-bottom:-15px; margin-left:-7px;">▲</span>
          </div>
          <div class="position-absolute display-flex flex-direction-column gap-1px" :style="cursorTooltip.style" v-if="cursorTooltip">
            <span class="font--12-400" style="border-radius:2px;opacity:0.8;" :style="cursorTooltip.linkEventTime.style">{{linkEventTime}}</span>
            <span class="font--12-400" style="border-radius:2px;opacity:0.8;" :style="cursorTooltip.linkEventName.style" v-if="cursorTooltip.linkEventName">{{linkEventName}}</span>
          </div>
        </template>
      </div>
    </div>
  </section>`,
  props:{
    networkElement:{type:Object,default:()=>({}),required:true},
    ports:{type:Array,default:()=>([]),required:true},
  },
  data:()=>({
    open:false,
    loading:false,
    error:'',
    log:[],
    portsLogs:{},
    touch_el:null,
    touch_x:0,
    touch_y:0,
    rect:{},
    linkEventName:'',
  }),
  computed:{
    cursorLine(){
      if(this.touch_y<=0){return};
      const left=this.touch_x-this.rect.left;
      if(left<=0){return};
      return {
        style:{
          left:`${left}px`,
        }
      }
    },
    cursorTooltip(){
      const {touch_y,touch_x,rect,linkEventName}=this;
      let left=touch_x-rect.left;
      if(left<=0){return};
      if(left>(rect.right-rect.left)/2){
        left=left-105;
      };
      const top=touch_y-rect.top;
      const {row:{cText,bgLinkUp,bgLinkDn,bgDate},linkEventName:{up}}=PORT_LINK_LOGS;
      return {
        style:{
          top:`${top}px`,
          left:`${left}px`,
        },
        linkEventTime:{
          style:{
            'background-color':bgDate,
            'color':cText,
          }
        },
        linkEventName:linkEventName?{
          style:{
            'background-color':up==linkEventName?bgLinkUp:bgLinkDn,
            'color':cText,
          }
        }:null
      }
    },
    linkEventTime(){
      const timeMin=this.portsEvents?.dateMin?.time;
      const timeMax=this.portsEvents?.dateMax?.time;
      if(!timeMin||!timeMax){return};
      const timeOffset=timeMax-timeMin;
      const {touch_x,rect}=this;
      const time=timeMin+((timeOffset/rect.right)*(touch_x-rect.left));
      return new Date(time).toDateTimeString();
    },
    vendorPortsNameRegExp(){
      const {vendor}=this.networkElement;
      return this.ports.map(port=>{
        return PORT_LINK_LOGS.getPortNameRegExpByVendor(vendor,port)
      })
    },
    countPortsLinkEvents(){return Object.values(this.portsEvents.events).length},
    portsEvents(){
      return Object.entries(this.portsLogs).reduce((portsEvents,[portId,portLogs])=>{
        if(!portLogs.length){return portsEvents};
        const portEvents=portLogs.reduce((portEvents,{logDate,logPort,portIsFinded,isLinkUp,isLinkDn})=>{
          if(portIsFinded&&logDate&&(isLinkUp||isLinkDn)){
            const {formatted,time}=logDate;
            portEvents.events.push({
              time,
              date:formatted,
              state:!!isLinkUp,
            });
            if(time>portsEvents.dateMax.time){
              portsEvents.dateMax=logDate;
            };
            if(!portsEvents.dateMin.time||time<portsEvents.dateMin.time){
              portsEvents.dateMin=logDate
            };
            portEvents.port=logPort.port;
          };
          return portEvents
        },{events:[],port:null});
        if(portEvents.events.length>1&&portEvents.port){
          portsEvents.events[portId]=portEvents;
        };
        return portsEvents
      },{events:{},dateMax:{time:0},dateMin:{time:0}})
    },
    titleText(){
      const {dateMax:{time:timeMax},dateMin:{time:timeMin}}=this.portsEvents;
      if(!timeMax||!timeMin){return};
      const ms=(timeMax-timeMin)/1000;
      const days=Math.floor(ms/60/60/24);
      const hours=Math.floor(ms/60/60)-(days*24);
      const minutes=Math.floor(ms/60)-(hours*60)-(days*24*60);
      const duration=[
        days?`${days} ${plural(['день','дня','дней'],days)}`:'',
        hours?`${hours} ${plural(['час','часа','часов'],hours)}`:'',
        minutes?`${minutes} ${plural(['мин.','мин.','мин.'],minutes)}`:'',
      ].filter(v=>v).join(' ');
      return [
        duration?`за`:'',
        duration
      ].filter(v=>v).join(' ');
    }
  },
  watch:{
    'log'(){
      this.portsLogs=this.log.reduce((ports,row,row_index)=>{
        const parsed={...this.parseRow(row),row_index};
        if(parsed.portIsFinded&&ports[parsed.logPort?.port?.snmp_number]){
          ports[parsed.logPort.port.snmp_number].push(parsed)
        };
        return ports;
      },this.ports.reduce((ports,port)=>({...ports,[port.snmp_number]:[]}),{}))
    },
    'open'(){
      if(this.open){
        this.refresh();
      }else{
        this.clearCursor();
      }
    },
    'countPortsLinkEvents'(countPortsLinkEvents){
      if(countPortsLinkEvents){
        this.initCursor();
      }else{
        this.clearCursor();
      }
    }
  },
  created(){
    window.addEventListener('resize',this.onResize);
  },
  destroyed(){
    window.removeEventListener('resize',this.onResize);
    this.clearCursor();
  },
  methods:{
    onResize(){
      this.clearCursor();
      this.initCursor();
      //console.log('onResize');
    },
    onTouchMove(event){
      const isMouseMove=event?.type==='mousemove';
      this.touch_x=isMouseMove?event.clientX:event.changedTouches?.[0]?.clientX||0;
      this.touch_y=isMouseMove?event.clientY:event.changedTouches?.[0]?.clientY||0;
      const elementsFromPoint=isMouseMove?document.elementsFromPoint(event.clientX,event.clientY):document.elementsFromPoint(event.changedTouches[0].clientX,event.changedTouches[0].clientY);
      this.linkEventName=[...elementsFromPoint].find(elementFromPoint=>elementFromPoint?.attributes?.['link-event-name']?.value)?.attributes?.['link-event-name']?.value;
      const rect=this.touch_el.getBoundingClientRect();
      if(this.touch_x>rect.right||this.touch_x<rect.left){this.touch_x=0};
      if(this.touch_y>rect.bottom||this.touch_y<rect.top){this.touch_y=0};
      this.rect=rect;
    },
    initCursor(){
      this.$nextTick(()=>{
        const touch_el=this.$refs.touch_el;
        if(!touch_el){return};
        this.touch_el=touch_el;
        touch_el.addEventListener('touchmove',this.onTouchMove);
        touch_el.addEventListener('mousemove',this.onTouchMove);
        //console.log('initCursor');
      });
    },
    clearCursor(){
      const touch_el=this.$refs.touch_el;
      if(!touch_el){return};
      touch_el.removeEventListener('touchmove',this.onTouchMove);
      touch_el.removeEventListener('mousemove',this.onTouchMove);
      this.touch_el=null;
      this.rect={};
      this.touch_x=0;
      this.touch_y=0;
      this.linkEventName='';
      //console.log('clearCursor');
    },
    parseLogPort(row=''){
      let parsed=null;
      for(const {port,portText,portRegExp} of this.vendorPortsNameRegExp){
        const _parsed=row.match(portRegExp)?.[0];
        if(_parsed){
          parsed={port,portText,portRegExp}
          break
        };
      };
      return parsed;
    },
    parseRow(row){
      const {bgPort,cText,bgLinkUp,bgLinkDn,bgDate}=PORT_LINK_LOGS.row;
      let logDate=null;
      let logPort=null;
      let portIsFinded=false;
      let isLinkUp=false;
      let isLinkDn=false;
      
      const texts=[];
      
      logDate=PORT_LINK_LOGS.getLogRowDate(row)||null;
      let _texts_date_around=!logDate?.date?[row]:` ${row}`.split(logDate.parsed);
      let _texts_after_date=[];
      if(_texts_date_around.length>=2&&logDate?.formatted){
        const [text0_before_date,...texts_after_date]=_texts_date_around;
        _texts_after_date=texts_after_date;
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
      
      logPort=this.parseLogPort(row)||null;
      
      const _texts_port_around=!logPort?.port?_texts_after_date:`${_texts_after_date.join(' ')}  `.split(logPort.portRegExp);
      let _texts_after_port=[];
      portIsFinded=false;
      if(_texts_port_around.length>=2&&logPort?.port){
        const [text0_before_port,...texts_after_port]=_texts_port_around;
        _texts_after_port=texts_after_port;
        texts.push(...[
          {text:text0_before_port},
          {
            text:logPort.portText,
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
      
      const {linkUpRegExp,linkDnRegExp}=PORT_LINK_LOGS.getLinkStateRegExpByVendor(this.networkElement.vendor);
      const _row_after_port=_texts_after_port.join('');
      const _texts_linkup_around=_row_after_port.split(linkUpRegExp);
      const _texts_linkdn_around=_row_after_port.split(linkDnRegExp);
      isLinkUp=_texts_linkup_around.length>=2;
      isLinkDn=_texts_linkdn_around.length>=2;
      const _texts_link_around=isLinkUp?_texts_linkup_around:isLinkDn?_texts_linkdn_around:_texts_after_port;
      const [text0_before_link,..._texts_after_link]=_texts_link_around;
      if(isLinkUp||isLinkDn){
        texts.push(...[
          {text:text0_before_link},
          {
            text:isLinkUp?PORT_LINK_LOGS.linkEventName.up:PORT_LINK_LOGS.linkEventName.dn,
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
      
      return {row,texts,logDate,portIsFinded,isLinkUp,isLinkDn,logPort}
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
          mr_id:this.networkElement.region.mr_id,
          ip:this.networkElement.ip,
        }),'/call/hdm/'),{
          port:{},//required
          device:{
            MR_ID:this.networkElement.region.mr_id,
            IP_ADDRESS:this.networkElement.ip,
            SYSTEM_OBJECT_ID:this.networkElement.system_object_id,
            VENDOR:this.networkElement.vendor,
            DEVICE_NAME:this.networkElement.name,
            FIRMWARE:this.networkElement.firmware,
            FIRMWARE_REVISION:this.networkElement.firmware_revision,
            PATCH_VERSION:this.networkElement.patch_version,
            //name:this.networkElement.name
          }
        });
        if(response.message==="OK"&&Array.isArray(response.text)){
          if(this.networkElement.vendor=='H3C'){//temp, need reverse
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

Vue.component("PortsMapLogsPortLinkEventsChart2",{
  template:`<div name="PortsMapLogsPortLinkEventsChart2">
    <div class="display-flex align-items-center justify-content-space-between">
      <span class="font--12-400">{{port.snmp_name||''}}</span>
      <span class="font--12-400">{{linkDownCounterText||''}}</span>
    </div>
    <div class="display-flex align-items-center flex-direction-row-reverse" :style="{background:bg}">
      <div v-for="(eventItem,index) of eventsItems" :key="index" :link-event-name="eventItem.linkEventName" :style="eventItem.style" :title="eventItem.date||''" class="min-height-20px"></div>
    </div>
  </div>`,
  props:{
    events:{type:Array,default:()=>[]},
    dateMax:{type:Object,default:null},
    dateMin:{type:Object,default:null},
    port:{type:Object,default:()=>({})},
  },
  data:()=>({}),
  computed:{
    bg(){return PORT_LINK_LOGS.chart.bg},
    total(){
      const {dateMin,dateMax}=this;
      if(!dateMin||!dateMax){return 0};
      return dateMax.time-dateMin.time;
    },
    countLinkDown(){return this.events.filter(({state})=>!state).length},
    linkDownCounterText(){return !this.countLinkDown?'':`${this.countLinkDown} ${plural(['падение','падения','падений'],this.countLinkDown)} линка`},
    eventsItems(){
      if(!this.total){return []};
      const {bgLinkUp,bgLinkDn}=PORT_LINK_LOGS.chart;
      const {items,availPercent}=this.events.reduce((eventsItems,event,index)=>{
        const prev=this.events[index-1];
        const percent=prev?Math.floor((prev.time-event.time)*99/this.total)||1:0
        const minPercent=!prev?1:percent;
        eventsItems.availPercent=eventsItems.availPercent-minPercent;
        eventsItems.items.push({
          ...event,
          style:{
            width:`${minPercent}%`,
            background:event.state?bgLinkUp:bgLinkDn
          },
          linkEventName:event.state?PORT_LINK_LOGS.linkEventName.up:PORT_LINK_LOGS.linkEventName.dn
        })
        return eventsItems;
      },{items:[],availPercent:100});
      
      //заполнение недостающего прошлого периода инверсным значением первого
      if(availPercent>0&&items.length){
        const firstState=items[items.length-1]?.state;
        items.push({
          isFake:true,
          style:{
            width:`${availPercent}%`,
            background:!firstState?bgLinkUp:bgLinkDn
          },
          linkEventName:!firstState?PORT_LINK_LOGS.linkEventName.up:PORT_LINK_LOGS.linkEventName.dn
        })
      };
      
      return items
    }
  },
  methods:{}
});


const PORT_LINK_LOGS={
  linkEventName:{
    up:'LinkUp',
    dn:'LinkDown'
  },
  row:{
    bgPort:'#4682b4',//steelblue
    cText:'#f0f8ff',//aliceblue
    bgLinkUp:'#228b22',//forestgreen
    bgLinkDn:'#778899',//lightslategray
    bgDate:'#5f9ea0',//cadetblue
  },
  chart:{
    bg:'#a9a9a938',
    bgLinkUp:'#228b224d',
    bgLinkDn:'#778899',
  },
  getPortNameRegExpByVendor(vendor='',port=null){
    if(['D-LINK','EDGE-CORE'].includes(vendor)){
      const portText=`Port ${port?.snmp_number}`;
      return {port,portText,portRegExp:new RegExp(`[^a-zA-Z]${portText}[^0-9]`,'i')};
    }else{
      const portText=`${port?.snmp_name}`;//FiberHome, Huawei, H3C
      return {port,portText,portRegExp:new RegExp(`[^a-zA-Z]${portText}[^0-9]`)};
    }
  },
  getLinkStateRegExpByVendor(vendor){
    switch(vendor){
      case 'D-LINK':return {
        linkUpRegExp:/link up/i,
        linkDnRegExp:/link down/i,
      };
      case 'HUAWEI':return {//IFNET/4/IF_STATE, IFPDT/4/IF_STATE
        linkUpRegExp:/into UP state/i,
        linkDnRegExp:/into DOWN state/i,
      };
      case 'FIBERHOME':return {//IFM-LINKUP, IFM-LINKDOWN
        linkUpRegExp:/LinkUP|OperStatus=\[up\]/i,
        linkDnRegExp:/LinkDown|OperStatus=\[down\]/i,
      };
      case 'H3C':return {//IFNET/3/PHY_UPDOWN
        linkUpRegExp:/changed to up/i,
        linkDnRegExp:/changed to down/i,
      };
      case 'EDGE-CORE':return {
        linkUpRegExp:/link-up/i,
        linkDnRegExp:/link-down/i,
      };
      default:return {
        linkUpRegExp:/[^a-zA-Z0-9](link|)(-|\s|)up(\s|)(state|)[^a-zA-Z0-9]/i,
        linkDnRegExp:/[^a-zA-Z0-9](link|)(-|\s|)down(\s|)(state|)[^a-zA-Z0-9]/i,
      };
    };
  },
  getLogRowDate(row=''){
    let parsed='';
    for(const regexp of [
      /\d{4}(-|\/)\d{1,2}(-|\/)\d{1,2}\s{1,2}\d{2}:\d{2}:\d{2}/,//2023-3-8 10:53:09 (D-Link 3200, FiberHome, Huawei 3328)
      /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}/,                 //Mar  8 10:21:17 (D-Link 1210, Huawei 5300)
      /\w{3}\s{1,2}\d{1,2}\s\d{4}\s\d{2}:\d{2}:\d{2}/,          //Mar  8 2023 10:56:41+07:00 (Huawei 2328)
      /\d{2}:\d{2}:\d{2}\s{1,2}\d{4}(-|\/)\d{1,2}(-|\/)\d{1,2}/,//10:27:39 2023-03-08 (Edge-Core)
      /\w{3}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}:\d{3}\s\d{4}/,    //%Mar  8 09:08:55:598 2013 (H3C, HP)
    ]){
      parsed=row.match(regexp)?.[0];
      if(parsed){break};
    };
    const time=Date.parse(parsed)
    const date=new Date(time);
    if(!date||date=='Invalid Date'){return}
    const formatted=date?.toDateTimeString?date?.toDateTimeString():[
      date.toLocaleDateString('ru',{year:'2-digit',month:'2-digit',day:'2-digit'}),
      date.toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
    ].join(' '); 
    return {parsed,time,date,formatted};
  },
};
PORT_LINK_LOGS.linkEventName={
  up:'LinkUp',
  dn:'LinkDown'
};














