

Vue.component('lbsv-login-pass',{
  template:`<section>
    <template v-if="isSamatlor">
      <div v-if="samatlor_blkdate" class="display-flex justify-content-space-between padding-left-16px">{{samatlor_blkdate}}<span style="font-size:0.8rem;color:gray;float:right;margin-left:auto;">Дата блокировки</span></div>
      <title-main text="Логин" :text2="samatlor_login||service.login" text1Class="tone-500 font--13-500" text2Class="font--13-500">
        <button-sq :icon="loading?'loading rotating':''" type="medium"/>
      </title-main>
      <button-main @click="show_password_samatlor=!show_password_samatlor" class="margin-bottom-8px" :class="{password:show_password_samatlor}" button-style="outlined" :icon="show_password_samatlor?'':'unlock'" :label="show_password_samatlor?(samatlor_password||'пароль не задан'):'Показать пароль'" :loading="loading" loading-text="" size="full"/>
      <button-main @click="reset_samatlor" v-if="!loading" button-style="outlined"  label="Сбросить пароль" :loading="resetting" loading-text="" size="full"/>
      <message-el v-if="resetting_error" type="warn" :text="resetting_error" box/>
    </template>
    <template v-else-if="isIrkutsk">
      <AsrtLoginPassword v-bind="{
        login: service.login,
        password: service.pass
      }"/>
    </template>
    <template v-else>
      <title-main textClass="font--16-500" :text1Class="[1,4,5,6].includes(service.billing_type)?'':'tone-500'" :text2Class="[2,3].includes(service.billing_type)?'':'tone-500'" :text="service.login||service.vgid" :text2="service.login?service.vgid:''"/>
      <button-main @click="show_password_lbsv=!show_password_lbsv" :class="{password:show_password_lbsv}" button-style="outlined" :icon="show_password_lbsv?'':'unlock'" :label="show_password_lbsv?(service.pass||'пароль не задан'):'Показать пароль'" size="full"/>
    </template>
  </section>`,
  props:{
    service:Object,
    billingid:Number,
  },
  data:()=>({
    show_password_lbsv:false,
    //samatlor
    loading:false,
    resetting:false,
    resetting_error:'',
    samatlor_blkdate:'',
    samatlor_login:'',
    samatlor_password:'',
    show_password_samatlor:false,
  }),
  created(){
    if(this.isSamatlor){this.getSamatlorLogin()};
  },
  computed:{
    isIrkutsk(){return this.service.type==LBSV.SERVICE_TYPE_INTERNET.type&&this.billingid==6100},//61000046566
    isSamatlor(){return this.service.type==LBSV.SERVICE_TYPE_INTERNET.type&&this.billingid==6014},
  },
  methods:{
    getSamatlorLogin(showAfterReset=false){
      this.loading=true;
      this.show_password_samatlor=false;
      httpGet(buildUrl('samatlor_equip_login',{serverid:this.service.serverid,vgid:this.service.vgid},'/call/lbsv/')).then(data=>{
        this.samatlor_password=data.password;
        if(showAfterReset){this.show_password_samatlor=true};
        this.samatlor_login=data.login;
        if(data.status=='5'){//TODO
          //this.service.status=5;
          //this.service.status_name='Заблокирован (Трафик)';
          //this.service.statusname='Заблокирован (Трафик)';
          //this.service.blkdate=data.blkdate;
          this.samatlor_blkdate=data.blkdate;
        }
        this.loading=false;
      });
    },
    reset_samatlor(){
      this.resetting=true;
      this.show_password_samatlor=false;
      this.resetting_error='';
      httpPost('/call/lbsv/extend_service',{
        serverid:this.service.serverid,
        vgid:this.service.vgid,
        update:{
          pass:this.samatlor_password
        },
      },true).then(data=>{
        if(data.type=='error'){
          this.resetting_error='Функционал не поддерживается';
        }else{
          this.getSamatlorLogin(true);
        };
        this.resetting=false;
      });
    },
  },
});

