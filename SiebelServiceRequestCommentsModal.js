Vue.component("SiebelServiceRequestCommentsModal", {
  template:`<div class="display-contents">
    <modal-container-custom ref="modal" :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
      <div class="padding-left-right-8px">
        <div class="display-flex flex-direction-column gap-8px">
          <div class="font--15-600 text-align-center">Комментарии к {{srNumber}}</div>
          
          <loader-bootstrap v-if="serviceRequestCommentsLoading" text="получение комментариев"/>
          <message-el v-else-if="!serviceRequestComments?.length" text="Нет комментариев" box type="info"/>
          <CommentsListItems v-else v-bind="{
            items:serviceRequestComments,
            propsCommentsListItem
          }"/>
        </div>
        <div class="margin-top-16px display-flex justify-content-space-around">
          <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="medium"/>
        </div>
      </div>
    </modal-container-custom>
  </div>`,
  props:{
    srNumber:{type:String,required:true,default:''},
  },
  beforeCreate(){
    this.$mapOptions({
      propsCommentsListItem:CM.PRESET.SiebelServiceRequestCommentsModal.propsCommentsListItem,
    });
    this.$options.computed=mapGetters(this.$store.getters['siebel2/getServiceRequestRoute'](this.$options.propsData.srNumber),[
      'serviceRequestComments',
      'serviceRequestCommentsLoading',
    ]);
    Object.assign(this.$options.methods,mapActions(this.$store.getters['siebel2/getServiceRequestRoute'](this.$options.propsData.srNumber),[
      'getServiceRequestComments',
    ]));
  },
  methods:{
    open(){//public
      this.$refs.modal.open();
      this.getServiceRequestComments();
    },
    close(){//public
      this.$refs.modal.close();
    },
  },
});
