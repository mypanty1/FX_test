//add backup and comments
Vue.component('LocalNotes',{
  components:{
    LocalNotesModal:Vue.component('LocalNotesModal',{
      beforeCreate(){
        this.$mapOptions({
          propsCommentsListItem:{
            textKey:'text',
            authorKey:'author',
            dateKey:'createdAt',
            dateHandler:DATE.parseToDateTimeString,
            showAutorLdapUserFullName:!0,
          },
        });
      },
      template:`<div class="display-contents">
        <modal-container-custom ref="modal" :footer="false" :disabled="addCommentLoading" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
          <div class="padding-left-right-8px">
            <div class="display-flex flex-direction-column gap-8px">
              <div class="font--15-600 text-align-center">Рабочие комментарии</div>
              
              <div class="border-1px-solid-c8c7c7 border-radius-4px display-flex flex-direction-column gap-8px padding-8px">
                <textarea-el label="Новый комментарий" v-model="comment" :disabled="addCommentLoading" class="font--13-500"/>
                <div class="display-flex justify-content-end">
                  <button-main label="Отправить" @click="addComment" :loading="addCommentLoading" :disabled="!comment||addCommentLoading" buttonStyle="outlined" size="medium"/>
                </div>
              </div>
              
              <div class="divider-line"/>
              
              <loader-bootstrap v-if="notesLoading" text="получение комментариев"/>
              <message-el v-else-if="!notes?.length" text="Нет комментариев" box type="info"/>
              <CommentsListItems v-else v-bind="{
                items:notes,
                propsCommentsListItem
              }"/>
              
            </div>
            <div class="margin-top-16px display-flex justify-content-space-around">
              <button-main label="Закрыть" @click="close" :disabled="addCommentLoading" buttonStyle="outlined" size="medium"/>
            </div>
          </div>
        </modal-container-custom>
      </div>`,
      props:{
        noteKey:{type:String,default:'',required:!0},
      },
      data:()=>({
        notesLoading:!1,
        notes:null,
        comment:'',
        addCommentLoading:!1,
      }),
      computed:{
        cacheKey(){return atok(this.noteKey,'notes')},
      },
      methods:{
        open(){//public
          this.$refs.modal.open();
          this.getNotes(!0);
        },
        close(){//public
          this.$refs.modal.close();
        },
        async getNotes(isInitial=!1){
          const {noteKey,cacheKey}=this;
          const cache=this.$cache.getItem(cacheKey);
          if(cache){
            this.notes=cache
            return
          };
          if(isInitial){
            this.notesLoading=!0;
          };
          try{
            const params={
              userLogin:this.$store.getters.userLogin,
              notes:[noteKey]
            };
            let response=await fetch(`https://ping54.ru/inetcore/aEAiMzNYOM0S67IiOdzFCSGqB1PYsobVc4vImrZdM3QYHxEeIVTpMwenTMqLuAYZ?${objectToQuery(params)}`,{
              method:'GET',
              headers:{
                'content-Type':'application/json;charset=utf-8',
                '7ozd7ruzzg0ikerc':`dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O`,
              },
            });
            if(!response.ok){throw new Error(response)};
            response=await response.json();
            if(response?.[noteKey]){
              //response[noteKey].reverse();
              this.notes=this.$cache.setItem(cacheKey,response[noteKey]);
            };
          }catch(error){
            console.warn(error);
          };
          if(isInitial){
            this.notesLoading=!1;
          };
        },
        async addComment(){
          const {comment,noteKey}=this;
          if(!comment){return};
          this.saveLoading=!0;
          try{
            await fetch(`https://ping54.ru/inetcore/hNeth5LTWIU3pFk1uw4RXFpVfFQxF4Z2dN9yTvt6lSo4mm6ad6MAfkFCUXNuMWJ3?${objectToQuery({userLogin:this.$store.getters.userLogin})}`,{
              method:'POST',
              headers:{
                'content-Type':'application/json;charset=utf-8',
                '7ozd7ruzzg0ikerc':`dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O`,
              },
              body:JSON.stringify({
                userLogin:this.$store.getters.userLogin,
                notes:[{
                  public:!0,
                  key:noteKey,
                  text:comment,
                }],
              })
            });
            this.comment='';
            this.$cache.removeItem(this.cacheKey);
            this.getNotes();
          }catch(error){
            console.warn(error);
          };
          this.saveLoading=!1;
        }
      },
    })
  },
  template:`<div class="display-flex gap-4px">
    <div class="display-flex flex-direction-column align-items-center gap-4px">
      <button-sq @click="$refs.LocalNotesModal.open()" :disabled="noteLoading" class="size-20px min-width-20px">
        <IcIcon :name="noteLoading?'loading rotating main-lilac':'log main-lilac'" size="16"/>
      </button-sq>
      <button-sq @click="userSave" :disabled="saveLoading||!isDiff" class="size-20px min-width-20px">
        <IcIcon :name="saveLoading?'loading rotating main-lilac':isDiff?'purse':'purse tone-500'" size="16"/>
      </button-sq>
    </div>
    
    <IcTextArea :ictextareaid="noteKey" placeholder="мои заметки к наряду" :rows="rows" v-model="currentText"/>
    
    <div class="display-flex flex-direction-column align-items-center gap-4px">
      <button-sq @click="erase" :disabled="eraseLoading||!currentText" class="size-20px min-width-20px">
        <IcIcon :name="eraseLoading?'loading rotating main-lilac':currentText?'contract-off':'contract-off tone-500'" size="16"/>
      </button-sq>
      <button-sq @click="$copy(currentText)" class="size-20px min-width-20px">
        <IcIcon name="copy" color="#5642BD" size="16"/>
      </button-sq>
    </div>
    
    <LocalNotesModal ref="LocalNotesModal" v-bind="{noteKey}"/>
  </div>`,
  props:{
    id:{type:[Number,String],required:!0},
    rows:{type:[String, Number],default:3}
  },
  data:()=>({
    initialText:'',
    currentText:'',
    noteLoading:!1,
    eraseLoading:!1,
    saveLoading:!1,
  }),
  created(){
    this.init();
  },
  watch:{
    'currentText'(currentText){
      const {noteKey}=this;
      console.log(noteKey,currentText)
      this.$cache.setItem(noteKey,{
        key:noteKey,
        value:currentText
      },1440);
    }
  },
  computed:{
    noteKey(){return atok(this.$options.name,this.id)},
    isDiff(){return this.initialText!==this.currentText},
  },
  methods:{
    async init(){
      const {noteKey}=this;
      const cache=this.$cache.getItem(noteKey);
      if(cache){
        this.initialText = this.currentText = cache.value || '';
        return
      };
      this.noteLoading=!0;
      try{
        const params={
          userLogin:this.$store.getters.userLogin,
          notes:[noteKey]
        };
        let response=await fetch(`https://ping54.ru/inetcore/ucUNXFXYbFARfQib0DMABJGMABcEcAAkTvs9V6BSG2y1PjMzKFWwyJjP4lUQgRh8?${objectToQuery(params)}`,{
          method:'GET',
          headers:{
            'content-Type':'application/json;charset=utf-8',
            '7ozd7ruzzg0ikerc':`dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O`,
          },
        });
        if(!response.ok){throw new Error(response)};
        response=await response.json();
        if(response?.[noteKey]){
          this.$cache.setItem(noteKey,{
            key:noteKey,
            value:response[noteKey]?.[0]?.text || ''
          },1440);
        };
      }catch(error){
        console.warn(error);
      };
      this.noteLoading=!1;
      this.initialText = this.currentText = this.$cache.getItem(noteKey)?.value || '';
    },
    async erase(){
      this.eraseLoading=!0;
      this.$el.querySelector(`[ictextareaid="${this.noteKey}"] textarea`)?.scrollTo({top:1111});
      for(const i of this.currentText) {
        if(!this.currentText.length){break};
        this.currentText=this.currentText.slice(0,-1);
        await new Promise(resolve=>setTimeout(resolve,1));
      };
      this.eraseLoading=!1;
    },
    async userSave(){
      await this.save('user');
      this.init();
    },
    async save(reason){
      const {currentText,noteKey}=this;
      this.saveLoading=!0;
      try{
        await fetch(`https://ping54.ru/inetcore/hNeth5LTWIU3pFk1uw4RXFpVfFQxF4Z2dN9yTvt6lSo4mm6ad6MAfkFCUXNuMWJ3?${objectToQuery({userLogin:this.$store.getters.userLogin,reason})}`,{
          method:'POST',
          headers:{
            'content-Type':'application/json;charset=utf-8',
            '7ozd7ruzzg0ikerc':`dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O`,
          },
          body:JSON.stringify({
            userLogin:this.$store.getters.userLogin,
            notes:[{
              key:noteKey,
              text:currentText
            }],
            reason
          })
        });
      }catch(error){
        console.warn(error);
      };
      this.saveLoading=!1;
    }
  },
  beforeDestroy(){
    const {isDiff,noteKey}=this;
    if(!isDiff){return};
    this.save('backup');
  }
});
