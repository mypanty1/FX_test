Vue.component('CMTaskAccessDescriptionCreds',{
  template:`<div class="display-flex flex-direction-column gap-8px">
    <div class="display-flex gap-4px">
      <info-value label="Логин" :value="login||'Нет логина'" withLine class="padding-unset width-100-100"/>
      <button-sq v-if="login" @click="$copy(login)" class="size-20px min-width-20px">
        <IcIcon name="copy" color="#5642BD" size="16"/>
      </button-sq>
    </div>
    <div class="display-flex gap-4px">
      <info-value label="Пароль" withLine class="padding-unset width-100-100">
        <button-main slot="value" @click="show_password=!show_password" :icon="show_password?'':'unlock'" :label="show_password?(password||'Нет пароля'):'Показать пароль'" class="margin-bottom-8px height-22px" :class="[show_password&&'password']" buttonStyle="outlined" size="full"/>
      </info-value>
      <button-sq v-if="password" @click="$copy(password)" class="size-20px min-width-20px">
        <IcIcon name="copy" color="#5642BD" size="16"/>
      </button-sq>
    </div>
  </div>`,
  props:{
    accessDescription:{type:String,default:'',required:!0},
  },
  data:()=>({
    show_password:!1,
  }),
  computed:{
    login(){return this.accessDescription.match(/(?<=ЛОГИН:( |))[A-Za-z0-9_-]+/g)?.[0]},
    password(){return this.accessDescription.match(/(?<=ПАРОЛЬ:( |))[A-Za-z0-9_-]+/g)?.[0]},
  },
});

Vue.component('CMTaskInfo',{
  template:`<div class="display-flex flex-direction-column gap-8px">
    <div class="white-block-100 padding-8px display-flex flex-direction-column gap-8px">
      <div class="display-flex align-items-center justify-content-space-between gap-8px flex-wrap">
        <div class="display-flex align-items-center justify-content-space-between gap-8px">
          <IcIcon v-if="taskTypeIcon" :name="taskTypeIcon" color="#918f8f"/>
          <div class="font--15-600 tone-500 white-space-pre">{{taskTypeGroup||taskTypeName}}</div>
        </div>
        <div class="font--13-500 tone-500 white-space-pre margin-left-auto">{{taskTypeCardId||taskId}}</div>
      </div>

      <div class="display-flex align-items-center justify-content-space-between gap-8px cursor-pointer" @click="goToMap">
        <div class="font--15-600">{{addressShort}}</div>
        <button-sq v-if="siteNodeDu||siteNodeLoading" :icon="siteNodeLoading?'pin tone-500':'pin main-lilac'" iconSize="24" type="medium"/>
      </div>

      <div class="display-flex align-items-center justify-content-space-between gap-8px flex-wrap">
        <div class="display-flex align-items-center justify-content-space-between gap-8px">
          <div class="font--16-700 white-space-pre">{{teTimeRange}}</div>
          <div class="font--15-600 white-space-pre color-adabab">{{teTimeRangeDuration}}</div>
        </div>
        <div class="display-flex align-items-center gap-2px border-radius-8px padding-top-bottom-2px padding-left-right-6px margin-left-auto" :style="taskStatusStyle">
          <div class="font--13-500 white-space-pre" :style="taskStatusStyle">{{taskStatusName}}</div>
          <IcIcon v-if="taskHasAllowedTransition" @click="openTaskStatusChange=!openTaskStatusChange" :name="openTaskStatusChange?'down':'right-1'" color="#ffffff"/>
        </div>
      </div>
      
      <transition v-if="taskHasAllowedTransition&&openTaskStatusChange" name="slide-down" mode="out-in" appear>
        <CMTaskStatusChange :taskId="taskId"/>
      </transition>
      
      <div class="font--15-400 white-space-pre">{{addressClient}}</div>

      <div v-if="isPotentialAccount" class="display-flex align-items-center gap-8px">
        <IcIcon name="error" color="#f87522"/>
        <div class="font--15-400 color-f87522 white-space-pre">Не готов лицевой счет</div>
      </div>

      <div v-if="product" class="font--13-500 white-space-pre tone-500">{{product}}</div>
      
      <div v-if="task.description" class="display-flex flex-direction-column">
        <devider-line m="0"/>
        <info-text-sec title="Описание" :text="task.description" :rowsMax="expandDescr?0:2" class="padding-unset"/>
        <div class="margin-left-auto font--13-500 main-lilac cursor-pointer" @click="expandDescr=!expandDescr">{{expandDescr?'Свернуть':'Развернуть'}}</div>
      </div>

      <div v-if="accessDescription" class="display-flex flex-direction-column margin-top--8px">
        <devider-line m="0"/>
        <info-text-sec title="Особенности доступа" :text="accessDescription" :rowsMax="expandAccessDescr?0:2" class="padding-unset"/>
        <div class="margin-left-auto font--13-500 main-lilac cursor-pointer" @click="expandAccessDescr=!expandAccessDescr">{{expandAccessDescr?'Свернуть':'Развернуть'}}</div>
        <template v-if="hasCreds">
          <devider-line/>
          <CMTaskAccessDescriptionCreds v-bind="{accessDescription}"/>
        </template>
      </div>

      <LocalNotes :id="taskId"/>

      <div v-if="hasSla" class="display-flex align-items-center gap-8px">
        <!--<IcIcon v-bind="slaIconProps"/>-->
        <div class="font--13-500 white-space-pre" :style="{color:slaIconProps.color}">{{slaLeftText}} SLA ({{slaTime}})</div>
      </div>
    </div>

    <div class="white-block-100 padding-top-bottom-8px">
      <template v-if="isSrNumber||serviceRequest">
        <div class="padding-left-right-8px">
          <SiebelServiceRequest :srNumber="callID"/>
        </div>
        <devider-line/>
      </template>

      <template v-if="account&&!isPotentialAccount">
        <div class="padding-left-right-8px">
          <SiebelServiceRequests :agreementNum="account" :srNumberCurrent="callID"/>
        </div>
        <devider-line/>
      </template>

      <div class="padding-left-right-8px">
        <DropdownBlock text="Связанные элементы" :title="{class:'padding-unset'}">
          <template>
            <link-block icon="contract-on" text="Номер наряда" textClass="tone-500 font--13-500" :textSub="task.taskId" type="medium" actionIcon="copy" @click="$copy(task.taskId)" class="padding-unset"/>
            <link-block icon="ls" v-if="account" text="Лицевой счет" textClass="tone-500 font--13-500" :textSub="account" type="medium" actionIcon="copy" @click="$copy(account)" class="padding-unset"/>
            <link-block icon="contract-on" v-if="task.callID" text="Номер СЗ/ЕИ/ID" textClass="tone-500 font--13-500" :textSub="task.callID" type="medium" actionIcon="copy" @click="$copy(task.callID)" class="padding-unset"/>
            <link-block icon="contract-on" v-if="task.numberEI" text="Номер ЕИ" textClass="tone-500 font--13-500" :textSub="task.numberEI" type="medium" actionIcon="copy" @click="$copy(task.numberEI)" class="padding-unset"/>
            <link-block icon="contract-on" v-if="task.parentID" text="Номер родительской сущности" textClass="tone-500 font--13-500" :textSub="task.parentID" type="medium" actionIcon="copy" @click="$copy(task.parentID)" class="padding-unset"/>
            <link-block icon="contract-on" v-if="task.remedyIdTask" text="Номер заявки Remedy" textClass="tone-500 font--13-500" :textSub="task.remedyIdTask" type="medium" actionIcon="copy" @click="$copy(task.remedyIdTask)" class="padding-unset"/>
          </template>
        </DropdownBlock>
      </div>
      <devider-line/>

      <div class="padding-left-right-8px">
        <DropdownBlock text="Ход решения" :title="{text2:task.taskNotes?.length?task.taskNotes.length:'нет',text2Class:'tone-500',class:'padding-unset'}">
          <CommentsListItems v-bind="{
            items:task.taskNotes,
            propsCommentsListItem
          }"/>
        </DropdownBlock>
      </div>
    </div>

    <template v-if="taskAllowServicesAndTMC">
      <div class="white-block-100 padding-top-bottom-8px">
        <DropdownBlock icon="factors" text="Материалы" :title="{text2:materials?.length?materials.length:'нет',text2Class:'tone-500',class:'padding-right-8px'}">
          <div v-for="(partUsed,index) of materials" class="padding-left-right-8px">
            <CMTaskPartUsed :partUsed="partUsed" :key="index"/>
          </div>
        </DropdownBlock>
      </div>

      <div class="white-block-100 padding-top-bottom-8px">
        <DropdownBlock icon="amount" text="Операции" :title="{text2:task.services?.length?task.services.length:'нет',text2Class:'tone-500',class:'padding-right-8px'}">
          <div v-for="({serviceId},index) of task.services">
            <devider-line/>
            <CMTaskService :key="index" :serviceId="serviceId" class="padding-left-right-8px"/>
          </div>
          <template slot="title-slot">
            <button-sq class="size-20px min-width-20px" @click="$refs.CMTaskServiceAddModal.open()" :disabled="!taskAllowModifyServices">
              <IcIcon name="fa fa-plus" :color="!taskAllowModifyServices?'#918f8f':'#5642bd'"/>
            </button-sq>
          </template>
        </DropdownBlock>
        <CMTaskServiceAddModal ref="CMTaskServiceAddModal"/>
      </div>
    </template>

    <div class="white-block-100 padding-top-bottom-8px">
      <template v-if="taskAllowEDO">
        <UrlLink :url="urlToWfmClientContractWeb"/>
        <devider-line/>
      </template>
      <template v-if="taskAllowRelatedTask">
        <UrlLink :url="urlToWfmRelatedTaskWeb"/>
        <devider-line/>
      </template>
      <template v-if="taskAllowServicesAndTMC&&taskAllowModifyServices">
        <UrlLink :url="urlToMasterApp"/>
        <devider-line/>
      </template>
      <template v-if="taskAllowAttachment">
        <UrlLink :url="urlToWfmTaskAttachmentWeb"/>
        <devider-line/>
      </template>
      <template v-if="taskAllowRemedyLog">
        <UrlLink :url="urlToWfmRemedyLog"/>
        <devider-line/>
      </template>
      <FavBtnLinkBlock v-bind="favBtnProps" :linkBlockProps="{class:'padding-right-8px'}"/>
    </div>

    <div class="white-block-100 padding-8px">
      <title-main icon="person" text="Абонент" class="padding-unset"/>
      <div class="display-flex flex-direction-column gap-8px">
        <PhoneCall :phone="phoneNumber" :descr="clientName" showSendSms/>
        <SendKionPq :phones="[phoneNumber]" :account="account"/>
        <info-list icon="timer" :text="tsTimeRange" comment="(ожидания клиентом)" class="padding-unset"/>
      </div>
      <link-block icon="ls" v-if="account" text="Лицевой счет" textClass="tone-500 font--13-500" :textSub="account" type="medium" actionIcon="copy" @click="$copy(account)" class="padding-unset"/>
    </div>

    <div class="white-block-100 padding-8px">
      <title-main :text="addressShort||siteNodeDu?.address" class="padding-unset">
        <IcIcon v-if="siteNodeLoading" name="loading" size="22" class="rotating main-lilac"/>
        <button-sq v-else-if="siteNodeDu" icon="pin" @click="goToMap" type="large"/>
        <IcIcon v-else name="warning" size="22" class="main-orange"/>
      </title-main>
      <devider-line />
      <link-block icon="du" :text="siteNodeDu?.node||siteId" :search="siteNodeDu?.node||siteId" type="medium" class="padding-unset"/>
      <link-block v-if="siteNodeDu" icon="home" actionIcon="expand" text="Инфо по площадке и доступу" @block-click="$refs.SiteNodeDetails_modal.open()" type="medium" class="padding-unset"/>

      <modal-container ref="SiteNodeDetails_modal">
        <SiteNodeDetails :siteNode="siteNodeDu"/>
      </modal-container>
    </div>
  </div>`,
  props:{
    taskId:{type:String,required:true},
    isActiveTab:{type:Boolean,default:false},
  },
  beforeCreate(){
    this.$mapOptions({
      propsCommentsListItem:CM.PRESET.CMTaskInfo.propsCommentsListItem
    });
  },
  data:()=>({
    scrollTimeout:null,
    loading:false,
    expandDescr:!1,
    expandAccessDescr:!1,
    openTaskStatusChange:!1,
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
      taskAssignment:'cm/taskAssignment',
      getServiceRequest:'siebel/getServiceRequest',
      taskAllowEDO:'cm/taskAllowEDO',
      taskAllowAttachment:'cm/taskAllowAttachment',
      engineerLogin:'cm/engineerLogin',
      taskAllowRelatedTask:'cm/taskAllowRelatedTask',
      taskAllowModifyServices:'cm/taskAllowModifyServices',
      taskHasAllowedTransition:'cm/taskHasAllowedTransition',
      taskAllowRemedyLog:'cm/taskAllowRemedyLog',
      taskAllowServicesAndTMC:'cm/taskAllowServicesAndTMC',
      setTaskLoading:'cm/setTaskLoading',

      loadingSome:'nioss/site/loadingSome',
      siteNodes:'nioss/site/nodes',
    }),

    teStart(){return this.taskAssignment?.start},
    teFinish(){return this.taskAssignment?.finish},
    teTimeRange(){return DATE.getTimeRange_HHmm(this.teStart,this.teFinish)},
    teTimeRangeDuration(){return DATE.getTimeRangeDuration(this.teStart,this.teFinish)},
    tsStart(){return this.task.appointmentStart},
    tsFinish(){return this.task.appointmentFinish},
    tsTimeRange(){return DATE.getTimeRange_HHmm(this.tsStart,this.tsFinish)},
    taskTypeId(){return this.task.taskType.id},
    taskTypeName(){return this.task.taskType.name},
    taskTypeGroup(){return CM.typesItems[this.taskTypeId]?.group},
    taskTypeIcon(){return CM.typesItems[this.taskTypeId]?.icon},
    taskTypeCardId(){return this.task[CM.typesItems[this.taskTypeId]?.cardIdKey||'callID']||this.taskId},
    taskStatusId(){return this.task.taskStatus.id},
    taskStatusName(){return this.task.taskStatus.name},
    taskStatusStyle(){return CM.statusesItems[this.taskStatusId]?.style},
    addressShort(){return WFM.addressShort(this.task.address)},
    addressClient(){return WFM.addressClient(this.task.address)},
    accessDescription(){return this.task.address?.accessDescription||''},
    hasCreds(){return /(ЛОГИН|ПАРОЛЬ)/.test(this.accessDescription)},//только Самотлор
    sla(){return this.task.sla},
    hasSla(){return Boolean(this.sla)},
    slaTime(){return DATE.getTime_DDMMHHmm(this.sla)},
    slaLeft(){return DATE.getTimeRangeDuration(Date.now(),this.sla,{short:!0})},
    isOverdue30m(){return WFM.isOverdue30m(this.sla,Date.now())},
    slaIsOverdue(){return /^-/.test(this.slaLeft)},
    slaLeftText(){return `${this.slaLeft.replace(/^-/,'')} ${this.slaIsOverdue?'позже':'до'}`},
    slaIconProps(){
      const [name,color]=this.slaIsOverdue?['SqSadFill','#E44656']:this.isOverdue30m?['SqNeutralFill','#F87522']:['SqSmileOutline','#918F8F'];
      return {name,color}
    },
    clientName(){return this.task.client.clientName},
    phoneNumber(){return this.task.client.phoneNumber},
    account(){return this.task.client.account},
    isPotentialAccount(){return WFM.isPotentialAccount(this.account)},
    callID(){return this.task.callID},
    isSrNumber(){return SIEBEL.isSrNumber(this.callID)},
    serviceRequest(){return this.getServiceRequest(this.callID)},
    product(){return this.serviceRequest?.product||''},

    materials(){return this.task.materials},

    urlToWfmClientContractWeb(){return {title:'Заполнить ЭДО',hideUrl:!0,url:`https://wfmmobile.mts.ru/WfmClientContractWeb/?taskCallId=${this.task.callID}`}},
    urlToWfmTaskAttachmentWeb(){return {title:'Добавить вложение',hideUrl:!0,url:`https://wfmmobile.mts.ru/WfmTaskAttachmentWeb/?login=${this.engineerLogin}&taskW6Key=${this.task.id}`}},
    urlToMasterApp(){return {title:'Внести оборудование',hideUrl:!0,url:`mtsmaster://task?wfmKey=${this.task.taskId}`}},
    urlToWfmRelatedTaskWeb(){return {title:'Связанный наряд',hideUrl:!0,url:`https://wfmmobile.mts.ru/WfmRelatedTaskWeb/?taskCallId=${this.task.callID}`}},
    urlToWfmRemedyLog(){return {title:'Прием и исполнение',hideUrl:!0,url:`https://wfmmobile.mts.ru/WfmRemedyLog/?taskCallId=${this.task.callID}`}},
    
    siteId(){return this.task.address.siteId},
    siteNodeLoading(){return this.$store.getters['site/siteNodesLoads'][this.siteId]},
    siteNodeDu(){return NIOSS.selectNodeDuAsSite(Object.values(this.siteNodes))},
    
    clientAddress(){return WFM.clientAddress(this.task.address)},
    favBtnProps(){
      const {clientAddress}=this;
      const {taskType,taskId,client,callID}=this.task;
      return {
        title:`${taskType.name} ${clientAddress}`,
        name:taskId,
        id:taskId,
        descr:objectToTable(filterKeys({taskId,taskTypeName:taskType.name,callID,clientAddress,...client},{
          taskId:       'Наряд',
          taskTypeName: 'Тип',
          callID:       ['СЗ/ЕИ','-'],
          clientAddress:['Адрес','-'],
          clientName:   ['Абонент','-'],
          account:      ['ЛС','-'],
          phoneNumber:  ['Тлф','-'],
        })),
      }
    },
  },
  methods:{
    async onActiveTabScrollEnd(){
      this.loading=true;
      await this.setSiteId({siteId:this.siteId,requireSections:['nodes']});
      this.loading=false;
    },
    ...mapActions({
      setSiteId:'nioss/site/setSiteId',
    }),
    goToMap(){
      if(!this.siteNodeDu){return};
      const {coordinates:{latitude:lat='',longitude:lon=''}={}}=this.siteNodeDu
      this.$router.push({
        name:'map',
        query:{lat,lon},
      });
    },
  },
  beforeDestroy(){
    clearTimeout(this.scrollTimeout);
  }
});
