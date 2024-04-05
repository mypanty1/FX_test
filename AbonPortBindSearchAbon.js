Vue.component('AbonPortBindSearchAbon',{
  template:`<div>
    <div class="display-flex flex-direction-column gap-8px">
      <UISelectorInput label="ЛС" v-model="accountSample" :items="tasksItemsList" clearable>
        <button-sq slot="postfix" icon="search" @click="searchAccountInternetServicesForBind"/>
      </UISelectorInput>
      
      <loader-bootstrap v-if="accountLoading" :text="loaderText"/>
      <message-el v-else-if="accountErrorText" :text="accountErrorText" box type="warn"/>
      <AbonPortBindSelectLbsvInternetService v-else-if="lbsv.agreement" v-bind="lbsv" v-model="lbsv.vg" @onVgUnblock="updateLbsvResource"/>
      <AbonPortBindSelectForisInternetService v-else-if="foris.customer" v-bind="foris" v-model="foris.resource" @onResourceUnblock="updateForisResource"/>
    </div>
  </div>`,
  data:()=>({
    openItemsList:!1,
    accountSample:'',
    accountLoading:!1,
    accountErrorText:null,
    lbsv:new SM.DefaultLbsvUserAgreementVgroups(),
    foris:new SM.DefaultForisCustomerResources(),
  }),
  watch:{
    'accountSample'(accountSample,_accountSample){
      if(!accountSample/*||_accountSample*/){
        this.clear();
      };
    },
    'lbsv.agreement'(agreement){
      this.$emit('onAccountID',agreement?.account||'');
      this.onAccountInstance();
    },
    'foris.customer'(customer){
      this.$emit('onAccountID',customer?.personal_account_number||'');
      this.onAccountInstance();
    },
    'lbsv.vg'(vg){
      this.onSelectServiceItem({vg});
    },
    'foris.resource'(resource){
      this.onSelectServiceItem({resource});
    },
  },
  computed:{
    ...mapGetters({
      tasks:'wfm/tasks',
      activeWfmTask: 'wfm/activeWfmTask',
      userLogin: 'userLogin',
    }),
    agreementNum(){return SIEBEL.toAgreementNum(this.accountSample)},
    loaderText(){return `поиск абонента "${this.agreementNum}"`},
    mrID(){return this.lbsv.user?.mr_id||this.foris.customer?.mr_id||0},
    serverID(){return this.lbsv.user?.serverid||this.foris.customer?.serverid||0},
    typeOfBindID(){return this.lbsv.user?.typeOfBindID||this.foris.customer?.typeOfBindID||SM.BIND_TYPE_ID_0},
    tasksItemsList(){
      return this.$store.getters['wfm/tasks'].reduce((items, {AddressSiebel, NumberOrder, clientNumber, Assignment, status}) => {
        if(items[NumberOrder]){return items};
        if(!WFM.isValidAccount(clientNumber)){return items};
        const flat = ((AddressSiebel || '').split(', кв. ')[1] || '?');
        const descr=`${Assignment} • ${status} • ${(flat.includes('кв') ? flat : 'кв ' + flat)}`;
        items[NumberOrder] = new CHP.UISelectorInputItem(NumberOrder, clientNumber, {descr})
        return items;
      }, Object.values(this.$store.getters['cm/tasks'])/*.sort((a,b) => new Date(a.start) - new Date(b.start))*/.reduce((items, taskAssignment) => {
        const {taskId, start, finish, taskInfo: {address: {flat}, client: {account} = {}, taskStatus: {name: taskStatusName}}} = taskAssignment;
        if(!WFM.isValidAccount(account)){return items};
        const descr=`${DATE.getTimeRange_HHmm(start,finish)} • ${taskStatusName} • ${(flat.includes('кв') ? flat : 'кв ' + (flat || '?'))}`;
        items[taskId] = new CHP.UISelectorInputItem(taskId, account, {descr})
        return items;
      },{}));
    },
  },
  methods:{
    clear(){
      this.accountLoading=!1;
      this.accountErrorText='';
      this.lbsv=new SM.DefaultLbsvUserAgreementVgroups();
      this.foris=new SM.DefaultForisCustomerResources();
      this.$emit('onSelectServiceItem',null);
      this.onAccountInstance();
    },
    onSelectServiceItem(service=null){
      const {vg,resource}=service||{};
      const {mrID,serverID,typeOfBindID}=this;
      this.$emit('onSelectServiceItem',!service?null:vg?new SM.SelectedLbsvServiceItem(mrID,serverID,typeOfBindID,vg):resource?new SM.SelectedForisServiceItem(mrID,serverID,typeOfBindID,resource):new SM.SelectedServiceItem(mrID,serverID,typeOfBindID));
    },
    onAccountInstance(){
      const {mrID,serverID,typeOfBindID}=this;
      this.$emit('onAccountInstance',new SM.AccountInstance(mrID,serverID,typeOfBindID))
    },
    async searchAccountInternetServicesForBind(update=false){
      const {accountLoading,agreementNum}=this;
      if(!agreementNum){return};
      if(accountLoading){return};
      this.clear()
      this.accountLoading=!0;
      try{
        const response=await SearchService.searchMa(agreementNum);
        const responseData=response.data.data;
        if(responseData){
          if(responseData?.[LBSV.BLL_TYPE]){
            const {data,type}=responseData[LBSV.BLL_TYPE];
            this.lbsv.user=(type==='single'?[data]:data).find(data=>{
              return Boolean(this.lbsv.agreement=data.agreements.find(item=>SIEBEL.toAgreementNum(item.account)==agreementNum));
            });
            if(!this.lbsv.agreement||!this.lbsv.user){
              this.accountErrorText='ЛС не найден в agreements';
            }else if(this.lbsv.agreement){
              const agreement=this.lbsv.agreement;
              const undef_date="0000-00-00 00:00:00";
              this.lbsv.vgroups=(this.lbsv.user?.vgroups||[])?.filter(({isSession,agrmid})=>agrmid==agreement.agrmid&&isSession).sort(({vgid:a},{vgid:b})=>b-a).sort(({accondate:a},{accondate:b})=>{
                const aDateOn=(a||a!==undef_date)?new Date(Date.parse(a)):0;
                const bDateOn=(b||b!==undef_date)?new Date(Date.parse(b)):0;
                return bDateOn-aDateOn
              });
            };
          }else if(responseData?.[FORIS.BLL_TYPE]){
            const {data,type}=responseData[FORIS.BLL_TYPE];
            if(type==='single'){
              this.foris.customer=data;
              const {personal_account_number}=data;
              const [respResources,respPayment]=await Promise.allSettled([
                ForisService.getResources(personal_account_number),
                ForisService.getPayment(personal_account_number),
              ]).then(resps=>resps.map(({status,value})=>status=='fulfilled'?value:{isError:!0}));
              if(Array.isArray(respResources?.data?.internet)){
                this.foris.resources=respResources.data.internet
              };
              if(respPayment?.data){
                this.foris.payment=respPayment.data
              };
            }else{
              this.accountErrorText='Ошибка поиска в Foris';
            };
          }else{
            this.accountErrorText='ЛС не найден';
          };
        }else{
          this.accountErrorText='Ошибка поиска';
        };
      }catch(error){
        console.warn("search_ma.error",error);
        this.accountErrorText='Ошибка сервиса';
      };
      this.accountLoading=!1;
    },
    async updateLbsvResource({serverid,vgid}={}){
      if(!serverid||!vgid){return};
      const {vgroups}=this.lbsv;
      try{
        const serviceType = vgroups?.find(vg => vg.vgid === vgid)?.type;
        const response = await GoBillingService.getVgroupEx(
          { serverid, vgroupid: vgid },
          {
            headers: { ActivTaskNumber: this.activeWfmTask?.NumberOrder, InetcoreUserLogin: this.userLogin, ServiceType: serviceType },
            forLog: true
          }
        );
        if(!response?.data?.vgid){return};
        const currentVg=vgroups.find(vg=>vg.vgid==vgid);
        if(!currentVg){return};
        const currentVgIndex=vgroups.findIndex(vg=>vg.vgid==vgid);
        this.$set(this.lbsv.vgroups,currentVgIndex,{
          ...currentVg,
          ...response.data
        });
      }catch(error){
        console.warn("resource_info.error",error);
      }
    },
    async updateForisResource(){
      
    }
  },
});
