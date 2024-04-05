Vue.component('ObjectUserNotesModal', {
  beforeCreate(){
    this.$mapOptions({
      propsCommentsListItem: {
        textKey: 'text',
        authorKey: 'author',
        dateKey: 'createdAt',
        dateHandler: DATE.parseToDateTimeString,
        showAutorLdapUserFullName: !0,
      },
    });
  },
  template: `<div class="display-contents">
    <modal-container-custom ref="modal" :footer="false" @close="onClose" :wrapperStyle="{'min-height': 'auto', 'margin-top': '4px'}">
      <div class="padding-left-right-8px">
        <div class="display-flex flex-direction-column gap-8px">
          <div class="font--15-600 text-align-center">Рабочие комментарии</div>
          
          <button-main label="Добавить комментарий" @click="$refs.ObjectAddUserNoteModal.open()" :disabled="notesLoading" buttonStyle="contained" size="full"/>
          <ObjectAddUserNoteModal ref="ObjectAddUserNoteModal" v-bind="{noteKey}" @updateNotes="getNotes"/>
          
          <loader-bootstrap v-if="notesLoading" text="получение комментариев"/>
          <message-el v-else-if="notesError" text="ошибка получение комментариев" :subText="notesError" type="warn" box/>
          <message-el v-else-if="!notes?.length" text="Нет комментариев" box type="info"/>
          <CommentsListItems v-else v-bind="{
            items: notes,
            propsCommentsListItem
          }"/>
          
        </div>
        <div class="margin-top-16px display-flex justify-content-space-around">
          <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="medium"/>
        </div>
      </div>
    </modal-container-custom>
  </div>`,
  props: {
    noteKey: {type: String, default: '', required: !0},
  },
  data: () => ({
    notesLoading: !1,
    notesError: '',
    notes: null,
  }),
  computed: {
    cacheKey(){return atop('ObjectNotes', this.noteKey)},
  },
  methods: {
    open(){//public
      this.$refs.modal.open();
      this.getNotes(!0);
    },
    close(){//public
      this.$refs.modal.close();
    },
    onClose(){
      this.$emit('updateCount', !0);
    },
    async getNotes(update = !1){
      const {noteKey, cacheKey} = this;
      const cache = this.$cache.getItem(cacheKey);
      if(cache && !update){
        this.notes = cache
        return
      };
      this.notesLoading = !0;
      this.notesError = '';
      try{
        const response = await Ping54InetcoreService.getObjectNotes(noteKey);
        if(response?.[noteKey]){
          this.notes = this.$cache.setItem(cacheKey, response[noteKey]);
        }else if(!response || response?.error || response?.isError){
          this.notesError = 'Error: getNotes';
        };
      }catch(error){
        console.warn(error);
        this.notesError = 'unexpected error';
      };
      this.notesLoading = !1;
    },
  },
});

Vue.component('ObjectAddUserNoteModal', {
  template: `<div class="display-contents">
    <modal-container-custom ref="modal" :footer="false" @close="onClose" :disabled="addCommentLoading" :wrapperStyle="{'min-height': 'auto', 'margin-top': '4px'}">
      <div class="padding-left-right-8px">
        <div class="display-flex flex-direction-column gap-8px">
          <div class="font--15-600 text-align-center">Добавить комментарий</div>
          
          <div class="border-1px-solid-c8c7c7 border-radius-4px display-flex flex-direction-column gap-8px padding-8px">
            <UITextArea2 label="Новый комментарий" v-model="comment" :disabled="addCommentLoading"/>
            <div class="display-flex justify-content-end">
              <button-main label="Отправить" v-bind="{
                loading: addCommentLoading,
                disabled: !comment || addCommentLoading
              }" @click="addComment" buttonStyle="outlined" size="medium"/>
            </div>
            <message-el v-if="addCommentError" text="ошибка сохранения комментария" :subText="addCommentError" type="warn" box/>
          </div>
          
        </div>
        <div class="margin-top-16px display-flex justify-content-space-around">
          <button-main label="Закрыть" @click="close" :disabled="addCommentLoading" buttonStyle="outlined" size="medium"/>
        </div>
      </div>
    </modal-container-custom>
  </div>`,
  props: {
    noteKey: {type: String, default: '', required: !0},
  },
  data: () => ({
    comment: '',
    addCommentLoading: !1,
    addCommentError: '',
  }),
  methods: {
    open(){//public
      this.$refs.modal.open();
    },
    close(){//public
      this.$refs.modal.close();
    },
    onClose(){
      this.$emit('updateNotes', !0);
    },
    async addComment(){
      const {comment, noteKey} = this;
      if(!comment){return};
      this.addCommentLoading = !0;
      this.addCommentError = '';
      try{
        const response = await Ping54InetcoreService.setUserNote(noteKey, comment, !0);
        if(response?.success){
          this.comment = '';
          this.close();
        }else{
          this.addCommentError = 'Error: addComment';
        };
      }catch(error){
        console.warn(error);
        this.addCommentError = 'unexpected error';
      };
      this.addCommentLoading = !1;
    },
  },
});
