Vue.component('UrlLink',{
  template:`<div>
    <template v-if="urlObj.urls">
      <title-main :text="urlObj.title" :text2="urlObj?.urls?.length||'нет'" text2Class="tone-500" :iconClass="urlObj.icon +' main-lilac margin-right-8px'" :iconClassEnable="!urlObj.icon" @open="open=!open"/>
      <info-text-sec v-if="urlObj.description" :text="urlObj.description" class="margin-bottom-8px" style="margin-top:-8px;"/>
      <template v-if="open">
        <template v-for="(url,i) of urlObj.urls">
          <devider-line v-if="i"/>
          <UrlLink :key="i" :url="url"/>
        </template>
      </template>
    </template>
    <template v-else>
      <link-block v-if="urlObj.title" iconClass="fas fa-link main-lilac padding-right-4px" :text="urlObj.title" textClass="font--11-600" @block-click="goTo(urlObj.url)" @click.stop="goTo(urlObj.url)" type="medium" class="padding-right-8px"/>
      <link-block v-if="urlObj.url" :text="urlObj.url.length>30?urlObj.url.slice(0,30)+'...':urlObj.url" textClass="font--11-600" textStyle="color:#0066cc;" @block-click="copy(urlObj.url)" @click.stop="copy(urlObj.url)" type="medium" actionIcon="copy" class="padding-right-8px" style="margin-top:-8px;"/>
      <info-text-sec v-if="urlObj.description" :text="urlObj.description" class="margin-bottom-8px" style="margin-top:-8px;"/>
      <link-block v-if="urlObj.url2" :text="urlObj.url2.length>30?urlObj.url2.slice(0,30)+'...':urlObj.url2" textClass="font--11-600" textStyle="color:#0066cc;" @block-click="copy(urlObj.url2)" @click.stop="copy(urlObj.url2)" type="medium" actionIcon="copy" class="padding-right-8px" style="margin-top:-8px;"/>
      <slot></slot>
    </template>
  </div>`,
  props:{
    url:{type:Object,default:()=>({}),required:true},
  },
  data:()=>({
    open:false,
    newUrl:null,
  }),
  async created(){
    const {id=''}=this.url;
    if(!id){return};
    const newUrl=await fetch(`https://script.google.com/macros/s/AKfycbzcwUJXRO9lytE8Olmc6nzciGrjWTJxzQHUNJUzPsbFbItGzTmHbbRFupi-tdzZqOyLdA/exec?id=${id}`).then(r=>r.json())
    if(typeof newUrl==='object'&&!newUrl.error){
      this.newUrl=newUrl
    };
  },
  computed:{
    urlObj(){return this.newUrl||this.url},
  },
  methods:{
    goTo(uri=''){
      if(!uri){return};
      if(this.$store.getters['app/isApp']){
        //this.$store.dispatch('app/sendToApp',`do:StartActivity2_Action_android.intent.action.VIEW:::=${uri}`)
        this.$store.dispatch('app/sendToApp',`set:ActivityStarter2:::=`);
        this.$store.dispatch('app/sendToApp',`set:ActivityStarter2:Action::=android.intent.action.VIEW`);
        this.$store.dispatch('app/sendToApp',`set:ActivityStarter2:DataUri::=${uri}`);
        this.$store.dispatch('app/sendToApp',`do:StartActivity2:::=`);
      }else{
        window.open(uri,'_blank');
      }
    },
    copy(text=''){
      if(!text){return};
      copyToBuffer(text);
    },
  },
});

Vue.component('PhoneCall',{
  template:`<div name="PhoneCall" class="display-flex flex-direction-column bg-minor-200 border-radius-8px padding-4px">
    <span class="font--12-400">{{title}}</span>
    <template v-for="(tel,index) of phones"><!--в nioss обычное текстовое поле, возможны несколько номеров-->
      <devider-line v-if="index"/>
      <div class="display-inline-flex column-gap-4px justify-content-space-between">
        <div @click="voiceCall(tel)" class="display-inline-flex align-items-center">
          <div v-if="isConvergent" class="size-20px bg-tone-250 border-radius-4px display-flex align-items-center justify-content-center margin-right-4px">
            <span class="size-20px line-height-20px text-align-center">&#8381</span>
          </div>
          <span class="tone-900 font--15-500">{{tel}}</span>
        </div>
        <div class="display-inline-flex column-gap-4px">
          <div @click="sendSms(tel)" v-if="showSendSms" class="bg-main-green size-30px border-radius-4px display-flex align-items-center justify-content-center">
            <span class="tone-100 ic-24 ic-sms"></span>
          </div>
          <div @click="voiceCall(tel)" v-if="!hideVoiceCall" class="bg-main-green size-30px display-flex align-items-center justify-content-center" style="border-radius: 20% 50%;">
            <span class="tone-100 ic-24 ic-phone-1"></span>
          </div>
        </div>
      </div>
    </template>
    <span class="font--12-400" v-for="row of descr_rows">{{row}}</span>
  </div>`,
  props:{
    phone:{type:String,default:''},
    title:{type:String,default:''},
    descr:{type:[String,Array],default:''},
    isConvergent:{type:[Boolean,String,Number]},
    showSendSms:{type:Boolean,default:false},
    hideVoiceCall:{type:Boolean,default:false},
    smsMessage:{type:String,default:''},
  },
  computed:{
    phones(){
      return this.phone.split(/[,;]/ig).filter(s=>s).map(phone=>getPhoneWithPlus(phone)).filter(t=>t.length>6)
    },
    descr_rows(){
      return typeof this.descr==='string'?this.descr.split('\n'):this.descr;
    },
  },
  methods:{
    voiceCall(phone=''){
      if(!phone||this.hideVoiceCall){return};
      if(this.$store.getters['app/isApp']){
        this.$store.dispatch('app/sendToApp',`do:voiceCall:direct:${phone}`);
      }else{
        window.location=`tel:${phone}`;
      };
    },
    sendSms(phone=''){
      if(!phone){return};
      if(this.$store.getters['app/isApp']){
        this.$store.dispatch('app/sendToApp',`do:sendSms:approve:${phone}=${this.smsMessage}`);
      }else{
        window.location=`sms:${phone}?body=${encodeURIComponent(this.smsMessage)}`;
      };
    },
  }
});