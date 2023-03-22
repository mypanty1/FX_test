Vue.component("PortsMapLogs2",{
  template:`<section name="PortsMapLogs2">
    <link-block :actionIcon="open?'down':'up'" icon="log" text="Логи портов" :textSub="titleText" textSubClass="tone-500 font--12-400" type="large" @block-click="open=!open"/>
    <div v-show="open" class="margin-left-right-16px">
      <loader-bootstrap v-if="loading" text="получение логов с коммутатора"/>
      <message-el v-else-if="error" text="Ошибка получения данных" :subText="error" box type="warn"/>
      <message-el v-else-if="!countPortsLinkEvents" text="Нет событий IF_STATE" box type="info"/>
      <div v-else class="position-relative" ref="touch_el">
        <div class="display-flex flex-direction-column gap-1px">
          <template v-for="(portEvents,portId,index) in portsEvents.events">
            <devider-line v-if="index" m="unset"/>
            <PortsMapLogsPortLinkEventsChart :key="portId" :events="portEvents.events" :port="portEvents.port" :dateMax="portsEvents.dateMax" :dateMin="portsEvents.dateMin"/>
          </template>
        </div>
        <div class="display-flex align-items-center justify-content-space-between">
          <span class="font--12-400">{{portsEvents.dateMin?.formatted}}</span>
          <span class="font--12-400" v-if="portsEvents.dateMin?.formatted&&portsEvents.dateMax?.formatted" arrow>⟹</span>
          <span class="font--12-400">{{portsEvents.dateMax?.formatted}}</span>
        </div>
        <template v-if="cursorLineProps">
          <div class="position-absolute" style="top:15px;bottom:15px;width:2px;background:#221e1e;" v-bind="cursorLineProps"></div>
          <div class="position-absolute font--12-400" style="border-radius:2px;border:1px solid #221e1e;background:#ffffff;color:#221e1e;opacity:0.5;" v-bind="cursorTimeProps">{{cursorTimeProps.value}}</div>
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
    offsetLeft:0,
    clientWidth:0,
    offsetTop:0,
    clientHeight:0,
  }),
  computed:{
    offsetY(){return this.offsetTop-window.scrollY},
    cursorLineProps(){
      const left=this.touch_x-this.offsetLeft;
      if(left<=0){return};
      const top=this.touch_y-this.offsetY;
      if(top<=0){return};
      return {
        style:{
          left:`${left}px`,
        }
      }
    },
    cursorTimeProps(){
      const left=this.touch_x-this.offsetLeft;
      if(left<=0){return};
      const width=105;
      const left2=left>(this.clientWidth-width)?left-width:left<width?left:(left-width/2);
      const top=this.touch_y-this.offsetY;
      return {
        value:this.cursorDate,
        style:{
          top:`${top}px`,
          left:`${left2}px`,
        }
      }
    },
    cursorDate(){
      if(!this.portsEvents.dateMin?.time){return};
      if(!this.portsEvents.dateMax?.time){return};
      const timeMin=this.portsEvents.dateMin.time;
      const timeMax=this.portsEvents.dateMax.time;
      const timeOffset=timeMax-timeMin;
      const cursorMin=this.offsetLeft;
      const cursorMax=this.clientWidth;
      const cursorOffset=cursorMax-cursorMin;
      const time=timeMin+((timeOffset/cursorOffset)*(this.touch_x-this.offsetLeft));
      return new Date(time).toDateTimeString();
    },
    vendorPortsNameRegExp(){
      return this.ports.map(port=>{
        return PORT_LINK_LOGS.getPortNameRegExpByVendor(this.networkElement.vendor,port)
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
      console.log([
        `touch_x:       ${this.touch_x}`,
        `touch_y:       ${this.touch_y}`,
        `clientWidth:   ${this.clientWidth}`,
        `offsetLeft:    ${this.offsetLeft}`,
        `clientHeight:  ${this.clientHeight}`,
        `offsetTop:     ${this.offsetTop}`,
        `window.scrollY:${window.scrollY}`
      ].join('\n'));
      if(this.touch_x>this.clientWidth+this.offsetLeft){this.touch_x=0};
      if(this.touch_y>this.clientHeight+this.offsetY){this.touch_y=0};
    },
    initCursor(){
      this.$nextTick(()=>{
        const touch_el=this.$refs.touch_el;
        if(!touch_el){return};
        this.touch_el=touch_el;
        this.offsetLeft=touch_el.offsetLeft||0;
        this.clientWidth=touch_el.clientWidth||0;
        this.offsetTop=touch_el.offsetTop||0;
        this.clientHeight=touch_el.clientHeight||0;
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
      this.offsetLeft=0;
      this.clientWidth=0;
      this.offsetTop=0;
      this.clientHeight=0;
      this.touch_x=0;
      this.touch_y=0;
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
