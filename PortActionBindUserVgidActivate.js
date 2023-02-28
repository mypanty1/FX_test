//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionBindUserVgidActivate.js',type:'text/javascript'}));
Vue.component('port-bind-user-vgid-elem',{//activatespd
  template:`
  <section>
    <radio-el v-model="resource" :value="service" :label="vgid.login+' • '+vgid.vgid" :name="account.userid" :disabled="loading" class="port-bind-user-modal__vgid-radio"/>
    <info-text-sec v-if="state" :text="state"/>
    <div v-if="vgid.tardescr" class="port-bind-user-modal__info">{{vgid.tardescr}}</div>
    <div v-if="vgid.available_for_activation" style="width:100%;padding:0px 20px;display:inline-flex;justify-content:flex-end;">
      <i v-if="loading_activate" class="ic-24 ic-loading rotating" style="color:#5642bd;width:32px;height:32px;line-height:32px;text-align:center;"></i>
      <i v-else-if="!loading_activate&&result_activate" :class="'fas '+(result_activate.data==1?'fa-check':'fa-times')+' fa-lg'" :style="{color:result_activate.data==1?'#20a471':'#f16b16',width:'32px',height:'32px',lineHeight:'32px',textAlign:'center'}"></i>
      <button-main :label="activatespd?'активировать по sms':'активировать'" v-if="vgid.available_for_activation" @click="activate" :disabled="loading_activate" buttonStyle="outlined" size="content"/>
    </div>
    <devider-line />
  </section>
  `,
  props:{
    vgid: {type:Object,required:true},
    account:{type:Object,required:true},
    loading:{type:Boolean,default:false},
    value:{validator:()=>true},
  },
  data(){
    return {
      loading_activate:false,
      result_activate:null,
    };
  },
  computed:{
    resource:{
      get(){
        return this.value;
      },
      set(value){
        this.$emit('input', value);
        if(value){
          this.$root.$emit('port-bind-user-vgid-elem->port-bind-user-modal:service-changed',{
            service:this.vgid,
            account:this.account.agreements.account,
          });
        };
      }
    },
    service(){
      return {
        vgid:this.vgid.vgid,
        login:this.vgid.login,
        serverid:this.vgid.serverid,
        type_of_bind:this.vgid.type_of_bind,
        agentid:this.vgid.agentid,
        addresses:this.vgid.addresses
      };
    },
    state(){
      if(!this.vgid.statusname){return ''};
      switch(this.vgid.statusname){
        case 'Активна':return this.vgid.statusname+' с '+this.getDate(this.vgid.accondate);
        case 'Отключена':
          if(this.vgid.accoffdate){
            return this.vgid.statusname+' '+this.getDate(this.vgid.accoffdate);
          }else{
            return 'Создан '+this.getDate(this.vgid.changedtariffon);
          };          
        default: return this.vgid.statusname+' '+this.getDate(this.vgid.changedtariffon);
      };
    },
    activatespd(){
      return ['108','64','234'].includes(this.vgid.serverid);
    },
  },
  methods:{
    getDate(str=''){
      if(!str){return ''};
      let date=new Date(Date.parse(str)).toLocaleDateString();
      if(date=='Invalid Date'){return ''};
      return date;
    },
    activate(){
      if(this.activatespd){
        this.activate_sms();
      }else{
        this.activate_lbsv();
      };
    },
    activate_sms(){
      window.AppInventor.setWebViewString(`do:sendSms:direct:+79139801727=activatespd ${this.vgid.vgid}`);
      this.result_activate={data:1};
    },
    activate_lbsv(){
      this.loading_activate=true;
      this.result_activate=null;
      httpPost('/call/lbsv/vg_unblock',{
        serverid:this.vgid.serverid,
        vgid:this.vgid.vgid,
        isSession:this.vgid.isSession,
        agenttype:this.vgid.agenttype
      },true).then(data=>{
        this.result_activate=data;
        this.loading_activate=false;
      }).catch(error=>{
        this.result_activate=null;
        this.loading_activate=false;
      });
    },
  },
});














