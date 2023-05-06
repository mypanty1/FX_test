Vue.component('KtvParams',{
  template:`<KtvParams2 v-bind="$props"/>`,
  props:{
    networkElement:{type:Object,required:true},
  },
});
Vue.component('KtvParams2',{
  template:`<CardBlock name="KtvParams2">
    <title-main text="Параметры*" @open="show=!show">
      <button-sq :icon="loads.params?'loading rotating':'refresh'" @click="getKtvParams"/>
      <button-sq v-if="is54&&ip" :icon="$refs.KtvParamsEditModal?.loadingSome?'loading rotating':'edit'" @click="$refs.KtvParamsEditModal.open()" :disabled="loads.params||$refs.KtvParamsEditModal?.loadingSome"/>
    </title-main>
    <KtvParamsEditModal v-if="is54&&ip" ref="KtvParamsEditModal" v-bind="{networkElement}" @onSetParamOk="getKtvParams"/>
    <loader-bootstrap v-if="loads.params" height="72" text="получение параметров с устройства"/>
    <template v-else-if="parsedParams?.length">
      <div v-for="param of parsedParams" :key="param.name">
        <devider-line />
        <device-optical-param :param="param"/>
      </div>
    </template>
  </CardBlock>`,
  props:{
    networkElement:{type:Object,required:true},
  },
  data:()=>({
    resps:{
      params:null,
    },
    loads:{
      params:false,
    },
  }),
  created(){
    this.getKtvParams();
  },
  watch:{
    'resps.params'(){
      if(!this.$refs.KtvParamsEditModal?.resps?.getKtvParams){
        this.$refs.KtvParamsEditModal?.getKtvParams();
      };
    }
  },
  computed:{
    is54(){return this.networkElement?.region?.id==54},
    ip(){return this.networkElement?.ip},
    params(){
      const {params}=this.resps;
      if(!params){return};
      const result={};
      for(const param of params){
        const keyValues=Object.entries(param);
        if(!keyValues.length){continue};
        let [name,[value,unit]]=keyValues[0];
        if(name==='Temperature'){unit='℃'};
        if(/^(InputPowerLevel|RfOutputLevel)/.test(name)){continue};
        result[name]={
          device:this.networkElement.name,
          name,
          unit,
          value,
          combo:`${value} ${unit}`.trim(),
          title:this.getParamTitle(name),
          icon:this.getParamIcon(name),
          color:this.getParamColor(name,value),
          withHistory:this.testParamHasHistory(name),
        };
      }
      this.addPowerData(result);
      this.addRfOutputData(result);
      return result;
    },
    parsedParams(){
      let params=[];
      if(!this.params||!this.networkElement){return params};
      const {type}=this.networkElement;
      if(/^(OP)/i.test(type)){
        params=[
          'InputOpticalPower_A',
          'InputOpticalPower_B',
          'RfOutputLevel',
          'Temperature',
          'InputPowerLevel',
          'LevelAttenuator',
          'Equalizer',
        ];
      };
      if(/^FAMP/i.test(type)){
        params=[
          'InputOpticalPower_A',
          'InputOpticalPower_B',
          'OutputOpticalPower_A',
          'Temperature'
        ];
      };
      return params.map(name=>this.params[name]).filter(el=>!!el);
    },
    mac(){return (((this.resps.params?.find(param=>param?.MacAdress)?.MacAdress?.[0]||'').match(/[0-9A-Fa-f]/gi)||[]).join('').match(/.{2}/g)||[]).join(':')},
  },
  methods: {
    async getKtvParams(){
      this.loads.params=true;
      const {
        region:{mr_id:MR_ID},
        name:DEVICE_NAME,
        ip:IP_ADDRESS,
        system_object_id:SYSTEM_OBJECT_ID,
        vendor:VENDOR,
        snmp:{
          version:SNMP_VERSION,
          community:SNMP_COMMUNITY
        }
      }=this.networkElement;
      const {code,data}=await httpGet(buildUrl('ktv_fsurvey',{
        MR_ID,
        DEVICE_NAME,
        IP_ADDRESS,
        SYSTEM_OBJECT_ID,
        VENDOR,
        SNMP_VERSION,
        SNMP_COMMUNITY,
      },'/call/hdm/'));
      this.resps.params=code==200?data:[];
      this.loads.params=false;
    },
    getParamTitle(name){
      if(/^InputPowerLevel/.test(name)){return 'Напряжение U1, U2'};
      return {
        InputOpticalPower_A:'Вход A',
        InputOpticalPower_B:'Вход B',
        RfOutputLevel:'Выходной сигнал',
        OutputOpticalPower_A:'Выходной сигнал',
        Temperature:'Температура',
        LevelAttenuator:'Аттенюатор (ATT)',
        Equalizer:'Эквалайзер (EQU)',
      }[name]||'неизвестный параметр';
    },
    getParamIcon(name){
      return {
        InputOpticalPower_A:'inlet',
        InputOpticalPower_B:'inlet',
        RfOutputLevel:'exit',
        OutputOpticalPower_A:'exit',
      }[name]||'';
    },
    getParamColor(name,value){
      if(!value){return 'tone-500'};
      const int=parseFloat(value);
      if(isNaN(int)){return ''};

      const {type}=this.networkElement;
      const isInputPower=/^InputOpticalPower/.test(name);

      if(/^(OP)/i.test(type)&&isInputPower){
        if(int>=-5&&int<=0){return 'main-green'};
        if(int>-9&&int<=2){return 'main-orange'};
        return 'main-red';
      };
      if(/^FAMP/i.test(type)&&isInputPower){
        if(int>=-10&&int<=10){return 'main-green'};
        return 'main-red';
      };
      if(name==='Temperature'){
        if(int>60){return 'main-red'};
        return 'main-green';
      };
      if(name==='OutputOpticalPower_A'){
        if(int>=16){return 'main-green'};
        if(int>=12){return 'main-orange'};
        return 'main-red';
      };
      return '';
    },
    testParamHasHistory(name){
      return [
        'InputOpticalPower_A',
        'InputOpticalPower_B',
        'RfOutputLevel',
        'OutputOpticalPower_A',
        'Temperature',
        'InputPowerLevel',
      ].some(param=>new RegExp(name,'gi').test(param));
    },
    addPowerData(result){
      if(!this.resps.params.length){return};
      const name='InputPowerLevel';
      const unit='V';
      let value=[];
      for(const param of this.resps.params){
        if(value.length===2){break};
        const keyValues=Object.entries(param);
        if(!keyValues.length){continue};
        const [_name,[_value]]=keyValues[0];
        if(/^InputPowerLevel/.test(_name)&&_value){value.push(_value)};
      };
      if(!value.length){value=''};
      result[name]={
        device:this.networkElement.name,
        name,
        unit,
        value,
        combo:value?value.map(val=>`${val} ${unit}`):null,
        title:this.getParamTitle(name),
        icon:this.getParamIcon(name),
        color:value?value.map(val=>this.getParamColor(name,val)):this.getParamColor(name,value),
        withHistory:this.testParamHasHistory(name),
      };
    },
    addRfOutputData(result) {
      if(!this.resps.params.length){return};
      const name='RfOutputLevel';
      let value='';
      let unit='';

      for(const param of this.resps.params){
        const keyValues=Object.entries(param);
        const [_name,[_value,_unit]]=keyValues[0];
        if(!value&&/^RfOutputLevel/.test(_name)){
          value=_value;
          unit=_unit;
        };
      };
      result[name]={
        device:this.networkElement.name,
        name,
        unit,
        value,
        combo:`${value} ${unit}`,
        title:this.getParamTitle(name),
        icon:this.getParamIcon(name),
        color:this.getParamColor(name,value),
        withHistory:this.testParamHasHistory(name),
      };
    }
  }
});
Vue.component('KtvParamsEditModal',{
  template:`<modal-container-custom name="KtvParamsEditModal" ref="modal" @open="onModalOpen" @close="onModalClose" :footer="false" :header="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="margin-left-right-16px">
      <header class="margin-top-8px">
        <div class="font--13-500 text-align-center">Настройка {{ip}}</div>
        <div class="font--13-500 tone-500 text-align-center white-space-pre">{{name}} • {{modelText}}</div>
      </header>

      <SectionBorder class="margin-top-8px padding-8px">
        
      </SectionBorder>

      <section class="display-flex align-items-center justify-content-space-between width-100-100 margin-top-16px">
        <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="content" icon="close-1"/>
      </section>
    </div>
  </modal-container-custom>`,
  inheritAttrs:false,
  props:{
    networkElement:{type:Object,required:true},
  },
  data:()=>({
    resps:{
      getKtvParams:null,
      setKtvParam:null,
    },
    loads:{
      getKtvParams:false,
      setKtvParam:false,
    },
  }),
  watch:{
    'resps.setKtvParam'(result){
      if(result&&!result?.error){
        this.$emit('onSetParamOk')
      }
    },
  },
  created(){},
  computed:{
    ip(){return this.networkElement?.ip||''},
    name(){return this.networkElement?.name||''},
    address(){return this.networkElement?.region?.location||''},
    modelText(){return getModelText(this.networkElement?.vendor,this.networkElement?.model,this.networkElement?.system_object_id)},
    loadingSome(){return Object.values(this.loads).some(v=>v)},
  },
  methods:{
    open(){//public
      this.$refs.modal.open();
    },
    close(){//public
      this.$refs.modal.close()
    },
    onModalOpen(){
      this.init();
    },
    onModalClose(){
      
    },
    init(){
      for(const key in this.resps){
        this.resps[key]=null;
        this.loads[key]=false;
      };
    },
    async getKtvParams(){//https://ping54.ru/10.221.45.168/getKtvParams?model_id=41927-2-6
      const {ip,name,address}=this;
      if(!ip){return};
      this.loads.getKtvParams=true;
      this.resps.getKtvParams=null;
      try{
        const response=await fetch(`https://ping54.ru/api/v1/getKtvParams?${objectToQuery({ip,name,address})}`,{
          headers:{'user-key':'LFjoMC6x-bWQlVyX3-FFPZGwvf-lOo5rT2o-uuubGsRh-eOdFpD4Y'}
        }).then(r=>r.json());
        if(response&&!response?.error){
          this.resps.getKtvParams=response||null;
        };
      }catch(error){
        console.warn('getKtvParams',error)
      };
      this.loads.getKtvParams=false;
    },
    async setKtvParam(param,value){//https://ping54.ru/10.221.45.168/setKtvParam?model_id=41927-2-6&param=att&value=19
      const {ip,name,address}=this;
      if(!ip){return};
      this.loads.setKtvParam=true;
      this.resps.setKtvParam=null;
      try{
        const response=await fetch(`https://ping54.ru/api/v1/setKtvParam?${objectToQuery({ip,param,value,name,address})}`,{
          headers:{'user-key':'LFjoMC6x-bWQlVyX3-FFPZGwvf-lOo5rT2o-uuubGsRh-eOdFpD4Y'}
        }).then(r=>r.json());
        this.resps.setKtvParam=response||null;
        if(response&&!response?.error){
          this.resps.getKtvParams=response||null;
        };
      }catch(error){
        console.warn('setKtvParam',error)
      };
      this.loads.setKtvParam=false;
    },
  },
});





