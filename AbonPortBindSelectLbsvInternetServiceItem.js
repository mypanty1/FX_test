Vue.component('AbonPortBindSelectLbsvInternetServiceItem',{
  template:`<div>
    <radio-el v-model="selectedVg" :value="vg" :label="label" :disabled="loading"/>
    <div v-if="statusText" class="font--12-400">{{statusText}}</div>
    <div v-if="vg.tardescr" class="font--13-500 tone-500">{{vg.tardescr}}</div>
    <div v-if="vg.available_for_activation" class="display-flex align-items-center justify-content-flex-end">
      <span v-if="loading" class="ic-24 ic-loading rotating main-lilac size-32px line-height-32px text-align-center"></span>
      <span v-else-if="result" class="size-32px line-height-32px text-align-center fas fa-lg" :class="result?.data==1?'fa-check':'fa-times'" :style="{color:result?.data==1?'#20a471':'#f16b16'}"></span>
      <button-main :label="activatespd?'активировать по sms':'активировать'" v-if="vg.available_for_activation" @click="activate" :disabled="loading" buttonStyle="outlined" size="content"/>
    </div>
  </div>`,
  props:{
    vg:{type:Object,required:true,default:()=>({})},
    value:{validator:()=>true},
  },
  data:()=>({
    loading:false,
    result:null,
  }),
  watch:{
    'result'(result){
      if(result?.data==1){
        this.$emit('onVgUnblock',filterKeys(this.vg,'serverid,vgid'))
      }
    }
  },
  computed:{
    label(){
      return `${this.vg.login} • ${this.vg.vgid}`
    },
    selectedVg:{
      get(){return this.value},
      set(value){this.$emit('input',value)}
    },
    statusText(){
      const {statusname,accondate,accoffdate,changedtariffon}=this.vg;
      if(!statusname){return ''};
      switch(statusname){
        case 'Активна':
          return `${statusname} с  ${this.getDate(accondate)}`;
        case 'Отключена':
          if(accoffdate){
            return `${statusname}  ${this.getDate(accoffdate)}`;
          }else{
            return `Создан  ${this.getDate(changedtariffon)}`;
          };          
        default:
          return `${statusname} ${this.getDate(changedtariffon)}`;
      };
    },
    activatespd(){
      return ['108','64','234'].includes(this.vg.serverid);
    },
  },
  methods:{
    getDate(str=''){
      if(!str){return ''};
      const dateStr=new Date(Date.parse(str)).toLocaleDateString();
      if(dateStr==DATE.InvalidDate){return ''};
      return dateStr;
    },
    activate(){
      if(this.activatespd){
        this.activateBySms();
      }else{
        this.vg_unblock();
      };
    },
    activateBySms(){
      this.loading=!0;
      this.result=null;
      this.$store.dispatch('app/doSendSmsDirect',['+79139801727',`activatespd ${this.vg.vgid}`]);
      this.result={data:1};
      this.loading=!1;
    },
    async vg_unblock(){
      this.loading=!0;
      this.result=null;
      try{
        const response=await httpPost('/call/lbsv/vg_unblock',filterKeys(this.vg,'serverid,vgid,agenttype'),true);
        this.result={data:1};
      }catch(error){
        console.warn('vg_unblock.error',error)
      };
      this.loading=!1;
    },
  },
});

