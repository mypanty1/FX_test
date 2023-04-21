//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortsMapLogs.js',type:'text/javascript'}));

Vue.component("PortsMapLogs",{
  template:`<PortsMapLogs2 v-bind="$props"/>`,
  props:{
    networkElement:{type:Object,default:()=>({}),required:true},
    ports:{type:Array,default:()=>([]),required:true},
  },
});

Vue.component("PortsMapLogs2",{
  template:`<section name="PortsMapLogs2">
    `+(window.devVueTemplateMark||'')+`
    <link-block :actionIcon="open?'down':'up'" icon="log" text="Логи портов" :textSub="titleText" textSubClass="tone-500 font--12-400" type="large" @block-click="open=!open"/>
    <div v-show="open" class="margin-left-right-16px">
      <loader-bootstrap v-if="loading" text="получение логов с коммутатора"/>
      <message-el v-else-if="error" text="Ошибка получения данных" :subText="error" box type="warn"/>
      <message-el v-else-if="!countPortsLinkEvents" text="Нет событий IF_STATE" box type="info"/>
      <div v-else class="position-relative" ref="touch_el" style="cursor:none;">
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
          <div class="position-absolute display-flex flex-direction-column justify-content-space-between width-2px" style="top:12px;bottom:12px;background:#000000;opacity:0.5;" :style="cursorLine.style">
            <span class="margin-top--15px margin-left--7px">▼</span>
            <span class="margin-bottom--15px margin-left--7px">▲</span>
          </div>
          <!--<input type="button" value="◄" class="position-absolute width-20px height-20px font-size-10px padding-left-3px" style="opacity:0.5;" :style="cursorLine.buttonLeftAdj.style">-->
          <!--<input type="button" value="►" class="position-absolute width-20px height-20px font-size-10px padding-left-3px" style="opacity:0.5;" :style="cursorLine.buttonRightAdj.style">-->
          <div class="position-absolute margin-left--14px font-size-30px" style="line-height:0px;opacity:0.5;" :style="cursorLine.crosshair.style">—</div>
          <div v-if="cursorTooltip" class="position-absolute display-flex flex-direction-column justify-content-flex-end height-32px gap-2px" style="width:110px;" :style="cursorTooltip.style">
            <span class="font--12-400 border-radius-2px padding-left-2px" style="width:110px;opacity:0.8;" :style="cursorTooltip.linkEventName.style" v-if="cursorTooltip.linkEventName">{{linkEventName}}</span>
            <span class="font--12-400 border-radius-2px padding-left-2px" style="width:110px;opacity:0.8;" :style="cursorTooltip.linkEventTime.style">{{linkEventTime_calc}}</span>
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
    rect:null,
    linkEventName:'',
    linkEventTime:'',
  }),
  computed:{
    cursorLine(){
      const {touch_x,touch_y,rect}=this;
      if(!rect){return};
      const left=touch_x-rect.left;
      if(left<=0){return};
      const top=touch_y-rect.top;
      if(top<=0){return};
      /*const shift=2;
      const width=20;*/
      return {
        style:{
          left:`${left}px`,
        },
        crosshair:{
          style:{
            top:`${top}px`,
            left:`${left}px`,
          }
        },
        /*buttonLeftAdj:{
          style:{
            top:`${top+shift+2}px`,
            left:`${left-width-shift}px`,
          }
        },
        buttonRightAdj:{
          style:{
            top:`${top+shift+2}px`,
            left:`${left+shift+2}px`,
          }
        },*/
      }
    },
    cursorTooltip(){
      const {touch_y,touch_x,rect,linkEventName}=this;
      if(!rect){return};
      const left=touch_x-rect.left;
      if(left<=0){return};
      const width=110;
      const height=32;
      const shift=2;
      const isHalf=left>(rect.right-rect.left)/2;
      const shift_left=isHalf?left-width-shift:left+shift+2;//2 - cursor width
      const top=touch_y-rect.top-height-shift;
      const {row:{cText,bgLinkUp,bgLinkDn,bgDate},linkEventName:{up}}=PORT_LINK_LOGS;
      return {
        style:{
          top:`${top}px`,
          left:`${shift_left}px`,
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
    linkEventTime_calc(){
      //if(this.linkEventTime){return this.linkEventTime};
      const timeMin=this.portsEvents?.dateMin?.time;
      const timeMax=this.portsEvents?.dateMax?.time;
      if(!timeMin||!timeMax){return};
      const timeOffset=timeMax-timeMin;
      const {touch_x,rect}=this;
      if(!rect){return};
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
      const linkEventEl=[...elementsFromPoint].find(elementFromPoint=>elementFromPoint?.attributes?.['link-event-name']?.value);
      this.linkEventName=linkEventEl?.attributes?.['link-event-name']?.value;
      this.linkEventTime=linkEventEl?.attributes?.['link-event-time']?.value;
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
      this.rect=null;
      this.touch_x=0;
      this.touch_y=0;
      this.linkEventName='';
      this.linkEventTime='';
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
      <div v-for="(eventItem,index) of eventsItems" :key="index" :link-event-name="eventItem.linkEventName" :link-event-time="eventItem.linkEventTime||''" :style="eventItem.style" class="min-height-20px"></div>
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
        const prev=this.events[index-1]||this.dateMax;
        const duration=(prev.time-event.time)*100/this.total||1;
        const percent=Math.ceil(duration);
        eventsItems.availPercent=eventsItems.availPercent-percent;
        eventsItems.items.push({
          ...event,
          style:{
            width:`${percent}%`,
            background:event.state?bgLinkUp:bgLinkDn
          },
          linkEventTime:this.events[index-1]?event.date:'',
          linkEventName:event.state?PORT_LINK_LOGS.linkEventName.up:PORT_LINK_LOGS.linkEventName.dn
        })
        return eventsItems;
      },{items:[],availPercent:100});
      
      //заполнение недостающего прошлого периода инверсным значением первого
      if(availPercent>0&&items.length){
        const firstState=items[items.length-1]?.state;
        items.push({
          style:{
            width:`${availPercent}%`,
            background:!firstState?bgLinkUp:bgLinkDn
          },
          linkEventTime:'',
          linkEventName:!firstState?PORT_LINK_LOGS.linkEventName.up:PORT_LINK_LOGS.linkEventName.dn
        })
      };
      
      return items
    }
  },
  methods:{}
});


















