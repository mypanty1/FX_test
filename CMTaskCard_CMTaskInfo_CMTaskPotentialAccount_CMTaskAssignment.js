//add LocalNotes
Vue.component('CMTaskCard',{
  template:`<div class="white-block-100 padding-8px display-flex flex-direction-column gap-8px" v-if="taskAssignment||taskInfoShort">
    <CMTaskHeader :taskInfoShort="taskInfoShort"/>
    <CMTaskAddress v-bind="{taskID,taskInfoShort}"/>
    <CMTaskAssignment :taskID="taskID"/>
    <TaskPhoneCall v-if="phoneNumber" :phone="phoneNumber" :title="clientName" :descr="appointmentTimeRange"/>
    <CMTaskAddressEntranceFloorFlat :taskID="taskID"/>
    <CMTaskPotentialAccount :taskInfoShort="taskInfoShort"/>
    <CMTaskProduct :taskID="taskID"/>
    <CMTaskSla :taskInfoShort="taskInfoShort"/>
    <div class="divider-line"/>
    <LocalNotes :id="taskID"/>
  </div>`,
  props:{
    taskID:{type:String,required:true},
  },
  computed:{
    ...mapGetters('cm',[
      'getTaskAssignment',
      'getTaskInfoShort',
    ]),
    taskAssignment(){return this.getTaskAssignment(this.taskID)},
    taskInfoShort(){return this.getTaskInfoShort(this.taskID)},
    appointmentTimeRange(){return DATE.getTimeRange_HHmm(this.taskInfoShort.appointmentStart,this.taskInfoShort.appointmentFinish)},
    clientName(){return this.taskInfoShort.client.clientName},
    phoneNumber(){return this.taskInfoShort.client.phoneNumber},
  },
});

//fix status button click area
Vue.component('CMTaskAssignment',{
  template:`<div class="display-contents">
    <div class="display-flex align-items-center justify-content-space-between gap-8px flex-wrap">
      <div class="display-flex align-items-center justify-content-space-between gap-8px">
        <div class="font--16-700 white-space-pre">{{factTimeRange}}</div>
        <div class="font--15-600 white-space-pre color-adabab">{{factTimeRangeDuration}}</div>
      </div>
      
      <button @click="checkAndToggle" class="reset--button display-flex align-items-center gap-2px border-radius-8px padding-top-bottom-2px padding-left-right-6px margin-left-auto" :class="[(taskAssignmentAllowedChangeStatus||open)&&'cursor-pointer']" :style="taskStatusStyle">
        <span class="font--13-500 white-space-pre" :style="taskStatusStyle">{{taskStatusName}}</span>
        <IcIcon v-if="taskAssignmentAllowedChangeStatus||open" :name="open?'down':'right-1'" color="#ffffff"/>
      </button>
    </div>

    <transition v-if="taskAssignmentAllowedChangeStatus&&open" name="slide-down" mode="out-in" appear>
      <UILinkBtnsList :buttons="buttons" @click="$refs.CMTaskStatusChangeModal.open($event.data)"/>
    </transition>

    <CMTaskStatusChangeModal ref="CMTaskStatusChangeModal" v-bind="{taskID,taskInfoShort}"/>
  </div>`,
  props:{
    taskID:{type:String,required:true},
  },
  data:()=>({
    open:!1,
  }),
  // watch:{
  //   'taskTypeID'(){
  //     this.$refs.CMTaskStatusChangeModal.close();
  //   },
  //   'taskStatusID'(){
  //     this.$refs.CMTaskStatusChangeModal.close();
  //   },
  // },
  computed:{
    ...mapGetters('cm',[
      'getTaskAssignment',
      'getTaskInfoShort',
      'getDictValues',
      'tasks',
      'setTaskLoading',
    ]),
    taskAssignment(){return this.getTaskAssignment(this.taskID)},
    taskInfoShort(){return this.getTaskInfoShort(this.taskID)},
    allowedTransitions(){return this.getDictValues(atop(WFM.DICT_TaskStatus,'allowed-transitions-by-id',this.taskStatusID))},
    taskAssignmentAllowedChangeStatus(){
      const hasAllowedTransitions=Boolean(this.allowedTransitions?.length);
      const isAssignmentEngineerEqual=this.taskAssignment?.engineerLogin===this.$store.getters.userLogin;
      return hasAllowedTransitions && isAssignmentEngineerEqual
    },
    
    factStart(){return this.taskAssignment?.start||this.taskInfoShort.appointmentStart},//that bad
    factFinish(){return this.taskAssignment?.finish||this.taskInfoShort.appointmentFinish},//that bad
    factTimeRange(){return DATE.getTimeRange_HHmm(this.factStart,this.factFinish)},
    factTimeRangeDuration(){return DATE.getTimeRangeDuration(this.factStart,this.factFinish)},

    taskStatusID(){return this.taskInfoShort.taskStatus.id},
    taskStatusName(){return this.taskInfoShort.taskStatus.name},
    taskStatusStyle(){return CM.STATUSES[this.taskStatusID]?.style},
    hasOtherActiveTask(){
      const {taskID}=this;
      return !isEmpty(select(this.tasks,{
        taskId:(taskId)=>taskId!=taskID,
        taskInfo:({taskStatus:{id}})=>CM.TASK_STATUSES_ACTIVE.includes(+id)
      }))
    },
    taskTypeID(){return this.taskInfoShort.taskType.id},
    buttons(){
      const {setTaskLoading,hasOtherActiveTask}=this;
      return this.allowedTransitions.reduce((buttons,{id,name})=>{
        buttons.push({
          label:name,
          disabled:setTaskLoading||(id==WFM.TASK_STATUS_124153864.id?!1:hasOtherActiveTask),
          data:{id,name}
        });
        return buttons;
      },[]);
    }
  },
  methods:{
    checkAndToggle(){
      if(!this.taskAssignmentAllowedChangeStatus&&!this.open){return}
      this.open = !this.open
    },
  }
});

//add ls if exist
Vue.component('CMTaskPotentialAccount',{
  template:`<div class="display-contents">
    <div v-if="isPotentialAccount" class="display-flex align-items-center gap-8px">
      <IcIcon name="error" color="#f87522"/>
      <div class="font--15-400 color-f87522 white-space-pre">Не готов лицевой счет</div>
    </div>
    <link-block icon="ls" v-if="account" text="Лицевой счет" textClass="tone-500 font--13-500" :textSub="account" type="medium" actionIcon="copy" @click="$copy(account)" class="padding-unset"/>
    <!--если не потенциальный и нет совсем то наряд без абонента-->
  </div>`,
  props:{
    taskInfoShort:{type:Object,required:true,default:()=>({})},
  },
  computed:{
    account(){return this.taskInfoShort.client.account},
    isPotentialAccount(){return WFM.isPotentialAccount(this.account)},
  }
});

//add margin after  CMTaskSiteAddress
Vue.component('CMTaskInfo',{
  template:`<div class="display-flex flex-direction-column gap-8px">
    <div class="white-block-100 padding-8px display-flex flex-direction-column gap-8px">
      <CMTaskHeader :taskInfoShort="task"/>
      <CMTaskSiteAddress class="margin-bottom-8px"/>
      <CMTaskAssignment :taskID="$route.params.taskID"/>
      <CMTaskAddressEntranceFloorFlat :taskID="$route.params.taskID"/>
      <CMTaskPotentialAccount :taskInfoShort="task"/>
      <CMTaskProduct :taskID="$route.params.taskID"/>
      <div class="divider-line"/>
      <UIInfoText title="Описание" :text="description" showPlaceholder/>
      <div class="divider-line"/>
      <UIInfoText title="Особенности доступа" :text="accessDescription" showPlaceholder/>
      <template v-if="hasSamotlorCreds">
        <div class="divider-line"/>
        <CMTaskSamotlorLoginPassword v-bind="{accessDescription}"/>
      </template>
      <LocalNotes :id="$route.params.taskID"/>
      <CMTaskSla :taskInfoShort="task"/>
    </div>
    <div class="white-block-100">
      <template v-if="isSrNumber">
        <div class="padding-left-right-8px">
          <SiebelServiceRequest :srNumber="callID"/>
        </div>
        <div class="divider-line"/>
      </template>
      <template v-if="account&&!isPotentialAccount">
        <div class="padding-left-right-8px">
          <SiebelServiceRequests :agreementNum="account" :srNumberCurrent="callID"/>
        </div>
        <div class="divider-line"/>
      </template>
      <CMTaskIDs class="padding-left-right-8px"/>
      <div class="divider-line"/>
      <CMTaskNotes class="padding-left-right-8px"/>
    </div>
    <template v-if="taskAllowServicesAndTMC">
      <CMTaskMaterials class="padding-top-bottom-8px"/>
      <CMTaskServices class="padding-top-bottom-8px"/>
    </template>
    <CMTaskLinks class="padding-top-bottom-8px"/>
    <CMTaskClient class="padding-8px"/>
    <CMTaskSiteInfo class="padding-8px"/>
  </div>`,
  props:{
    isActiveTab:{type:Boolean,default:false},
  },
  data:()=>({
    scrollTimeout:null,
    loading:false,
  }),
  created(){
    if(this.isActiveTab&&!this.loading){
      this.onActiveTabScrollEnd();
    };
  },
  watch:{
    'isActiveTab'(isActiveTab){
      if(isActiveTab&&!this.loading){
        /*this.scrollTimeout=setTimeout(()=>*/this.onActiveTabScrollEnd()/*,TASK.TABS_SCROLL_TIMEOUT);*/
      }else{
        clearTimeout(this.scrollTimeout);
      };
    },
  },
  computed:{
    ...mapGetters({
      task:'cm/task',
      siteID:'cm/siteID',
      taskAllowServicesAndTMC:'cm/taskAllowServicesAndTMC',
    }),
    description(){return this.task.description||''},//can be null
    addressShort(){return WFM.addressShort(this.task.address)},
    accessDescription(){return this.task.address?.accessDescription||''},//can no address
    hasSamotlorCreds(){return /(ЛОГИН|ПАРОЛЬ)/.test(this.accessDescription)},//только Самотлор
    
    account(){return this.task.client.account},
    isPotentialAccount(){return WFM.isPotentialAccount(this.account)},
    callID(){return this.task.callID},
    isSrNumber(){return SIEBEL.isSrNumber(this.callID)},
  },
  methods:{
    async onActiveTabScrollEnd(){
      this.loading=true;
      await this.setSiteId({siteId:this.siteID,requireSections:['nodes']});
      this.loading=false;
    },
    ...mapActions({
      setSiteId:'nioss/site/setSiteId',
    }),
  },
  beforeDestroy(){
    clearTimeout(this.scrollTimeout);
  }
});
