//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/DeviceActionPing.js',type:'text/javascript'}));
Vue.component('device-ping',{//user ip ping and go
  template:`<div>
    <input-el placeholder="10.221.xxx.xxx" :label="input_label" v-model="overrideIp" :disabled="enable" class="mb-8">
      <button-sq slot="postfix" icon="right-link" @click="goToDevice" v-if="device_info?.name&&device_info?.ip==ip"/>
    </input-el>
    <info-value :label="'получено: '+received" :value="'потеряно: '+lost" type="small"/>
    <device-params-item-history :paramDays="pings" :item="config" :limit="count" chartClass="-" chartStyle="border:1px solid #e4e3e3;border-radius:5px;"/>
    <div style="display:inline-flex;gap:4px;width:100%;justify-content:center;">
      <button-main @click="clear" label="clear" buttonStyle="outlined" size="medium"/>
      <button-main @click="start" label="start" :loading="running" :disabled="!available||enable||running" buttonStyle="contained" size="medium"/>
      <button-main @click="stop" label="stop" buttonStyle="outlined" size="medium"/>
    </div>
  </div>`,
  props:{
    device:{type:Object,default:null,required:true},
  },
  data:()=>({
    overrideIp:'',
    device_info:null,
    config:{
      param:'ping',
      unit:'ms',
    },
    timer:undefined,
    enable:false,
    timeout:1000,
    count:0,
    running:false,
    pings:[],
  }),
  created(){
    if(this.device?.ip){this.overrideIp=this.device.ip};
  },
  watch:{
    'ip'(ip){
      if(ip){
        this.pings=[]
        if(ip!==this.device?.ip&&ip.match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/)){
          this.getDeviceInfo();
        }
      };
    },
  },
  computed:{
    ip(){return this.overrideIp||this.device?.ip},
    available(){return this.device?.region?.mr_id&&this.ip},
    received(){return this.pings.filter(ping=>ping.values[0]>=0).length},
    lost(){return this.pings.filter(ping=>ping.values[0]<0).length},
    device_model(){
      return (this.device_info?.model&&this.device_info.model.length>20?(this.device_info.system_object_id||'').replace('.1.3.6.1.4.1.','').replaceAll('.','-'):(this.device_info.model||'')).replace('Quidway ','').trim()
    },
    input_label(){
      let label='IP';
      if(!this.device_info){return label};
      if(this.device_info.ip!==this.ip){return label};
      if(!this.device_model){return this.device_info.name};
      return this.device_info.name+' • '+this.device_model;
    },
  },
  methods:{
    device_ping(){
      this.running=true;
      httpPost(`/call/hdm/device_ping?ip=${this.ip}&fresh=${randcode(20)}`,{
        device:{
          MR_ID:this.device.region.mr_id,
          IP_ADDRESS:this.ip,
          SYSTEM_OBJECT_ID:null,
          VENDOR:null
        }
      }).then(data=>{
        this.running=false;
        this.count++;
        this.pings.push({
          date:this.count,
          values:data.code=='200'?[parseFloat(data.ping_info)]:[-2],//TODO ref device-params-item-history
        });
        if(this.count<100){//ограничение в 99 пингов чтоб не поехала верстка графика
          this.next();
        }else{
          this.stop();
        }
      }).catch(error=>{
        this.stop();
        console.log(error);
      });
    },
    start(){
      if(!this.running&&this.available){
        this.enable=true;
      };
      this.next();
    },
    next(){
      if(!this.running&&this.enable){
        this.timer=setTimeout(this.device_ping,this.timeout);
      };
    },
    stop(){
      clearTimeout(this.timer);
      this.enable=false;
      this.running=false;
    },
    clear(){
      this.stop();
      this.count=0;
      this.pings=[];
    },
    async getDeviceInfo(){
      this.device_info=null;
      const resp=await httpGet(buildUrl('search_ma',{pattern:this.ip},'/call/v1/search/')).catch(console.warn);
      if(!resp.data){return};
      let devices=resp.data?.length?resp.data.find(d=>d.devices)?.devices:[resp.data];
      if(!devices){return};
      //devices.forEach(device=>this.$cache.setItem(`device/${device?.name}`,device));//no snmp and discovery
      let device=devices.find(device=>device.region.id===this.device.region.id);
      if(!device||device?.ip!==this.ip){return};
      this.device_info=device;
      /*const resp2=await httpGet(buildUrl('search_ma',{pattern:this.device_info?.name},'/call/v1/search/')).catch(console.warn);
      if(!resp2.data){return};
      this.device_info=resp2.data;
      this.$cache.setItem(`device/${this.device_info?.name}`,this.device_info);*/
    },
    goToDevice(){
      if(!this.device_info?.name){return};
      this.$router.push({name:'search',params:{text:this.device_info.name}});
    },
  },
});







