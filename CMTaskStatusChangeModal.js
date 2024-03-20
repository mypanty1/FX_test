//fix error message
Vue.component('CMTaskStatusChangeModal',{
  template:`<div class="display-contents">
    <modal-container-custom ref="modal" :disabled="setTaskLoading" header :footer="false" @open="onOpen" @close="onClose" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
      <div class="padding-left-right-8px display-flex flex-direction-column gap-16px">
        <div v-if="selectedTaskStatus" class="font--15-600 text-align-center">Перевод наряда в статус {{selectedTaskStatusText}}</div>
        
        <div v-if="selectedTaskStatus" class="display-flex flex-direction-column gap-8px">
          <component v-for="(field,index) of selectedTaskStatusFields" :key="index" :is="field.is" v-bind="{
            mandatory:field.mandatory,
            fieldName:field.fieldName,
            taskID,
            taskInfoShort,
            taskStatusNext:selectedTaskStatus,
            disabled:setTaskLoading,
          }" @onSet="$set(taskFields,...$event)"/>
        </div>

        <template v-if="!setTaskLoading&&setTaskResult">
          <message-el v-if="setTaskResult?.taskId" text="Статус изменен" box type="success"/>
          <message-el v-else :text="setTaskResult?.text?.message||setTaskResult?.text||setTaskResult?.message||'unexpected error'" box type="warn"/>
        </template>

        <div class="display-flex justify-content-space-around">
          <button-main label="Закрыть" @click="close" :disabled="setTaskLoading" buttonStyle="outlined" size="medium"/>
          <button-main label="Сохранить" @click="setTask(modifedFields)" :disabled="setTaskLoading||!allFieldsIsValid" :loading="setTaskLoading" buttonStyle="contained" size="content"/>
        </div>
      </div>
    </modal-container-custom>
  </div>`,
  props:{
    taskID:{type:String,required:true},
    taskInfoShort:{type:Object,required:true,default:()=>({})},
  },
  data:()=>({
    taskFields:{},
  }),
  created(){
    this.clear();
  },
  computed:{
    ...mapGetters('cm',[
      'setTaskLoading',
      'setTaskResult',
    ]),
    revision(){return this.taskInfoShort.revision},
    taskTypeID(){return this.taskInfoShort.taskType.id},
    taskStatusID(){return this.taskInfoShort.taskStatus.id},
    
    selectedTaskStatus(){return this.taskFields?.taskStatus?.value},
    selectedTaskStatusText(){return this.selectedTaskStatus?.name||this.selectedTaskStatus?.id},
    selectedTaskStatusFields(){return (CM.TASK_TYPE_STATUS_FIELDS[this.taskTypeID]?.[this.selectedTaskStatus?.id]||[]).filter(({is})=>is)},
    allFieldsIsValid(){
      const {selectedTaskStatus,selectedTaskStatusFields,taskFields}=this;
      return selectedTaskStatus&&selectedTaskStatusFields.every(({mandatory,fieldName})=>{
        if(!mandatory){return !0};
        const {isNotEmpty,exceptionNoSelectableItems}=taskFields[fieldName]||{};
        // if(exceptionNoSelectableItems){this.exceptionNoSelectableItemsReport(fieldName)};
        return exceptionNoSelectableItems||isNotEmpty;
      });
    },
    modifedFields(){
      return Object.entries(this.taskFields).reduce((fields,[fieldName,{value}])=>Object.assign(fields,{[fieldName]:value}),{});
    }
  },
  methods:{
    open(selectedTaskStatus=null){//public
      this.$refs.modal.open();
      this.taskFields.taskID=new WFM.TaskFieldValue(this.taskID,!0);
      this.taskFields.revision=new WFM.TaskFieldValue(this.revision,!0);
      this.taskFields.taskStatus=new WFM.TaskFieldValue(selectedTaskStatus||null,selectedTaskStatus);
      // for(const {fieldName,initialValue} of this.selectedTaskStatusFields){
      //   this.$set(this.taskFields,fieldName,new WFM.TaskFieldValue(initialValue));
      // };
      //TODO, полей нет в назначении, нужно подгрузить тело наряда ПЕРЕД открытием
    },
    close(){//public
      this.$refs.modal.close();
    },
    onOpen(){
      
    },
    onClose(){
      this.clear();
    },
    clear(){
      this.taskFields=new CM.TaskRequiredFields();
    },
    ...mapActions('cm',[
      'setTask',
    ]),
    // exceptionNoSelectableItemsReport(fieldName){
    //   const {taskID,taskTypeID,taskStatusID,selectedTaskStatus}=this;
    //   this.$report(['wfm.exceptionNoSelectableItems',{
    //     taskID,
    //     taskTypeID,
    //     taskStatusID,
    //     selectedTaskStatusID:selectedTaskStatus.id,
    //     fieldName,
    //   }]);
    // }
  },
});
