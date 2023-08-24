Vue.component('ForisService',{
  template:`<div name="ForisService">
    <link-block v-bind="titleProps" action-icon="" type="medium"/>
    <info-subtitle :text="'MSISDN: '+service.msisdn"/>
    <info-subtitle :text="service.tariff"/>
    <account-call v-if="service.type=='mobile' && service.msisdn" :phone="service.msisdn" class="margin-bottom-16px" showSendSms/>
    <template v-if="service.type=='internet'">
      <info-subtitle v-if="service.auth_type||service.rate" :text="authAndSpeed"/>
      <ForisInternetAccessCreds :service="service" class="margin-left-16px"/>
    </template>
    <DropdownBlock icon="info" text="Скидки, услуги, сервисы" :title="{text2:service.products.length?service.products.length:'',text1Class:'font--13-500',text2Class:'font--13-500 tone-500'}">
      <template v-for="(product,i) of service.products">
        <devider-line/>
        <ForisServiceProduct :product="product" :key="i"/>
      </template>
    </DropdownBlock>
    <template v-if="smartCardsNumbers.length">
      <devider-line/>
      <DropdownBlock icon="card" text="Оборудование" :title="{text2:smartCardsNumbers.length,text1Class:'font--13-500',text2Class:'font--13-500 tone-500'}">
        <template v-for="(smartCardNumber,key) of smartCardsNumbers">
          <devider-line/>
          <IrdetoSmartCard :cardNumber="smartCardNumber" :key="key+'-'+smartCardNumber" class="margin-left-right-16px"/>
        </template>
      </DropdownBlock>
    </template>
  </div>`,
  props:{
    service:{type:Object,default:()=>({})},
  },
  computed:{
    titleProps(){
      const {type,blocks_status}=this.service;
      return {
        icon:{
          internet:'eth',
          tv:'tv',
          phone:'phone-1',
          hybrid:'tv',
          iptv:'tv',
          mobile:'phone',
          package:'amount',
        }[type]||'amount',
        text:{
          internet:'Интернет',
          tv:'Телевидение',
          phone:'Телефония',
          hybrid:'Гибридное ТВ',
          iptv:'IPTV',
          mobile:'Мобильное',
          package:'Пакет',
        }[type]||'Другое',
        text1Class:'tone-900',
        text2:blocks_status?'Отключена':'Активна',
        text2Class:blocks_status?'main-red':'main-green',
      }
    },
    authAndSpeed(){const {auth_type,rate}=this.service;return [auth_type,rate].filter(v=>v).join(' • ')},
    smartCardsNumbers(){
      const products=this.service.products.filter(({service_parameter})=>service_parameter?.find(({name,value})=>name=='Номер смарт-карты'))
      return products.map(({service_parameter})=>service_parameter.find(({name,value})=>name=='Номер смарт-карты').value).filter(Boolean)
    }
  },
});
Vue.component('IrdetoSmartCard', {
  template:`<section name="IrdetoSmartCard">
    <title-main icon="card" text="Смарт-карта" :text2="cardNumber" textClass="font--13-500" @open="open=!open" :opened="open" class="padding-unset">
      <button-sq :icon="cardInfoLoading?'loading rotating':'refresh'" @click="getCardInfo" type="medium"/>
    </title-main>
    <template v-if="open">
      <loader-bootstrap v-if="cardInfoLoading&&!cardInfo" text="поиск смарт-карты"/>
      <template v-else-if="cardInfo">
        <info-value v-if="cardStatus" label="Статус карты" :value="cardStatus" withLine class="padding-unset"/>
        <info-value v-if="cardStatus" label="Активирована" :value="cardIsActivated?'YES':'NO'" withLine class="padding-unset"/>
        <info-value label="Привязка к Chip ID" v-for="(chipid,key) of cardChipIdList" :value="chipid" :key="key" withLine class="padding-unset"/>
        <info-value label="Привязка к Chip ID" v-if="!cardChipIdList.length" value="—" withLine class="padding-unset"/>
        
        <info-text-sec title="Пакеты на карте" :text="!cardPackets?.length?'—':''" class="padding-unset"/>
        <div v-if="cardPackets.length" class="display-flex flex-wrap-wrap gap-4px margin-bottom-8px">
          <div v-for="(packet,key) of cardPackets" :key="key" class="font--13-500 tone-100 padding-left-right-2px bg-main-teal-light border-radius-2px">{{packet}}</div>
        </div>
        
        <div class="display-flex flex-direction-column gap-4px">
          <SectionBorder class="padding-4px">
            <info-text-sec title="Повторная активация с ChipID:" class="padding-unset"/>
            <selector-mini :items="cardChipIdList" @input="chip=$event" :value="chip" class="margin-bottom-4px"/>
            <button-main label="Повторная активация" @click="doSmartCardAction('recovery',{chip})" :disabled="loadingSome||!chip" :loading="loads.recovery" size="full" buttonStyle="outlined"/>
            <message-el v-if="resps.recovery" v-bind="getActionResultProps('recovery')" box class="margin-top-4px"/>
          </SectionBorder>
          <SectionBorder class="padding-4px">
            <info-text-sec title="Автопоиск каналов" class="padding-unset"/>
            <button-main label="Автопоиск каналов" @click="doSmartCardAction('rescan_all')" :disabled="loadingSome" :loading="loads.rescan_all" size="full" buttonStyle="outlined"/>
            <message-el v-if="resps.rescan_all" v-bind="getActionResultProps('rescan_all')" box class="margin-top-4px"/>
          </SectionBorder>
          <SectionBorder class="padding-4px">
            <info-text-sec title="Сброс PIN кода" class="padding-unset"/>
            <button-main label="Сброс PIN кода" @click="doSmartCardAction('reset_pincode')" :disabled="loadingSome" :loading="loads.reset_pincode" size="full" buttonStyle="outlined"/>
            <message-el v-if="resps.reset_pincode" v-bind="getActionResultProps('reset_pincode')" box class="margin-top-4px"/>
          </SectionBorder>
        </div>
      </template>
    </template>
  </section>`,
  props:{
    cardNumber:{type:[String,Number],default:''},
  },
  data:()=>({
    open:false,
    loads:{},
    resps:{},
    chip:'',
  }),
  created(){
    if(this.cardNumber){
      this.getCardInfo();
    };
  },
  watch:{
    'cardInfo'(cardInfo){
      if(cardInfo){this.open=true};
    },
    'cardChipIdList'(cardChipIdList){
      this.chip=cardChipIdList?.[0]||''
    },
  },
  computed: {
    loadingSome(){return Object.values(this.loads).some(Boolean)},
    cardInfoLoading(){return this.loads.card_info},
    cardInfo(){return this.resps.card_info},
    cardSerialNumber(){return this.cardInfo?.serial_number},
    cardStatus(){return this.cardInfo?.card_status},
    cardChipIdList(){return this.cardInfo?.pairing_info_property||[]},
    cardIsActivated(){return this.cardInfo?.activation_status},
    cardPackets(){return (this.cardInfo?.products?.positive||'').split(',').map(p=>p.trim())}
  },
  methods: {
    getActionResultProps(method=''){
      const resp=this.resps?.[method];
      if(!resp){return};
      return {
        text:resp.isError?(resp.message||'Error'):`Успешно ${resp.code||''}`,
        type:resp.isError?'warn':'success',
      }
    },
    async getCardInfo(){
      if(this.cardInfoLoading||!this.cardNumber){return}
      this.$set(this.loads,'card_info',true);
      try{
        const response=await httpGet(buildUrl('card_info',{number:this.cardNumber},'/call/irdeto/'))
        this.$set(this.resps,'card_info',response);
      }catch(error){
        console.warn('card_info.error',error);
      };
      this.$set(this.loads,'card_info',!true);
    },
    async doSmartCardAction(method='',params=null){//reset_pincode,rescan_all,recovery(chip)
      if(!method){return};
      this.$set(this.loads,method,true);
      this.$set(this.resps,method,null);
      try{
        const response=await httpGet(buildUrl(method,{number:this.cardNumber,...params},'/call/irdeto/'))
        this.$set(this.resps,method,response);
      }catch(error){
        console.warn('card_info.error',error);
      };
      this.$set(this.loads,method,!true);
    },
  },
});
