//Vue.config.warnHandler=(message,vm,trace)=>console.warn(message,vm,trace);
//Vue.config.errorHandler=(err,vm,info)=>console.warn(err,vm,info);

document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/VueRecycleScroller.js',type:'text/javascript'}));

Vue.component('EngineerSectionProfile', {
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="person tone-500" :text="'Я ' + post" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="userProfileLoading ? 'sync rotating' : 'sync'" :disabled="userProfileLoading" type="large" @click="getUserProfile"/>
      </title-main>
    </div>
    
    <template v-if="userProfileLoading || userProfileErrorMessage">
      <div class="divider-line"/>
      
      <loader-bootstrap v-if="userProfileLoading" text="поиск пользователя"/>
      
      <div v-else-if="userProfileErrorMessage" class="padding-left-right-12px">
        <UIUserMessage :message="userProfileErrorMessage" type="warning"/>
      </div>
    </template>
    
    <template v-else-if="userProfile">
      <div class="padding-left-right-12px display-flex flex-direction-column">
        <img v-if="photo" :src="photo" class="width-100px margin-left-right-auto margin-bottom-8px"/>
        <span class="font--13-500">{{fullName}}</span>
        <span class="font--12-400">{{company}}</span>
        <span class="font--12-400">{{department}}</span>
        <PhoneCall v-if="mobile" :phone="mobile" :descr="post" showSendSms class="margin-top-8px"/>
      </div>
      
      <template v-if="managerProfile">
        <div class="divider-line"/>
        
        <div class="padding-left-12px">
          <title-main icon="persones tone-500" text="Руководитель" class="padding-unset margin-top-bottom--8px">
            <button-sq :icon="userProfileLoading ? 'sync rotating' : 'sync'" :disabled="userProfileLoading" type="large" @click="getUserProfile"/>
          </title-main>
        </div>
        
        <div class="padding-left-right-12px display-flex flex-direction-column">
          <span class="font--13-500">{{manager_fullName}}</span>
          <span class="font--12-400">{{manager_company}}</span>
          <span class="font--12-400">{{manager_department}}</span>
          <PhoneCall v-if="manager_mobile" :phone="manager_mobile" :descr="manager_post" showSendSms class="margin-top-8px"/>
        </div>
      </template>
    </template>
  </div>`,
  computed:mapGetters('Engineer/SectionsL1/Profile',[
    'userProfileLoading',
    'userProfileErrorMessage',
    'userProfile',
    'managerProfile',
    
    'userLogin',
    'fullName',
    'displayName',
    'post',
    'department',
    'company',
    'mobile',
    'photo',
    'birthday',
    
    'manager_fullName',
    'manager_displayName',
    'manager_post',
    'manager_department',
    'manager_company',
    'manager_mobile',
  ]),
  methods:mapActions('Engineer/SectionsL1/Profile',[
    'getUserProfile',
  ]),
});


Vue.component('EngineerSectionNotes', {
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="person tone-500" text="комментарии" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="loadingSomeNotes ? 'sync rotating' : 'sync'" :disabled="loadingSomeNotes" type="large" @click="getUserNotes"/>
      </title-main>
    </div>
  </div>`,
  computed:mapGetters('Engineer/SectionsL1/Notes',[
    'loadingSomeNotes',
  ]),
  methods:mapActions('Engineer/SectionsL1/Notes',[
    'getUserNotes',
  ]),
});
Vue.component('EngineerSectionNotesPrivate', {
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="factors tone-500" text="Приватные комментарии" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="userNotesPrivateLoading ? 'sync rotating' : 'sync'" :disabled="userNotesPrivateLoading" type="large" @click="getUserNotesPrivate"/>
      </title-main>
    </div>
    
    <div class="divider-line"/>
    
    <loader-bootstrap v-if="userNotesPrivateLoading" text="комментарии ..."/>
    
    <div v-else-if="userNotesPrivateErrorMessage" class="padding-left-right-12px">
      <UIUserMessage :message="userNotesPrivateErrorMessage" type="warning"/>
    </div>
    
    <template v-else-if="userNotesPrivate">
      <div v-if="!userNotesPrivate?.length" class="padding-left-right-12px">
        <UIUserMessage message="Нет комментариев" type="info"/>
      </div>
      
      <div v-else class="padding-left-right-12px">
        <CommentsListItems v-bind="{
          ...configuration.CommentsListItems,
          items: userNotesPrivate,
        }"/>
      </div>
    </template>
  </div>`,
  computed:mapGetters('Engineer/SectionsL1/Notes/SectionsL2/Private',[
    'userNotesPrivateLoading',
    'userNotesPrivateErrorMessage',
    'userNotesPrivate',
    'configuration',
  ]),
  methods:mapActions('Engineer/SectionsL1/Notes/SectionsL2/Private',[
    'getUserNotesPrivate',
  ]),
});
Vue.component('EngineerSectionNotesPublic', {
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="factors tone-500" text="Публичные комментарии" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="userNotesPublicLoading ? 'sync rotating' : 'sync'" :disabled="userNotesPublicLoading" type="large" @click="getUserNotesPublic"/>
      </title-main>
    </div>
    
    <div class="divider-line"/>
    
    <loader-bootstrap v-if="userNotesPublicLoading" text="комментарии ..."/>
    
    <div v-else-if="userNotesPublicErrorMessage" class="padding-left-right-12px">
      <UIUserMessage :message="userNotesPublicErrorMessage" type="warning"/>
    </div>
    
    <template v-else-if="userNotesPublic">
      <div v-if="!userNotesPublic?.length" class="padding-left-right-12px">
        <UIUserMessage message="Нет комментариев" type="info"/>
      </div>
      
      <div v-else class="padding-left-right-12px">
        <CommentsListItems v-bind="{
          ...configuration.CommentsListItems,
          items: userNotesPublic,
        }"/>
      </div>
    </template>
  </div>`,
  computed:mapGetters('Engineer/SectionsL1/Notes/SectionsL2/Public',[
    'userNotesPublicLoading',
    'userNotesPublicErrorMessage',
    'userNotesPublic',
    'configuration',
  ]),
  methods:mapActions('Engineer/SectionsL1/Notes/SectionsL2/Public',[
    'getUserNotesPublic',
  ]),
});


Vue.component('IconBookmarkAdd',{
  template: `<svg :width="size" :height="size" viewBox="-2 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <template v-if="type == 'solid'">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.0415247 12.9898C0.0156955 12.0423 0 11.0331 0 9.97948C0 8.43336 0.0675909 7.0841 0.167628 5.93383C0.343395 3.9128 0.431278 2.90228 1.72529 1.6155C3.0193 0.328716 3.99009 0.248071 5.93167 0.0867819C6.58015 0.032912 7.27359 0 8 0C8.72646 0 9.41994 0.0329163 10.0685 0.0867926C12.0099 0.248085 12.9807 0.328731 14.2747 1.61549C15.5687 2.90225 15.6566 3.91271 15.8323 5.93362C15.9324 7.08393 16 8.43326 16 9.97948C16 11.0331 15.9843 12.0423 15.9585 12.9898C15.8868 15.6175 15.851 16.9313 15.1579 18.0655C14.1823 19.662 12.5749 20.6593 10.8673 19.4664C9.4811 18.4981 8.78801 18.014 7.99996 18.014C7.21191 18.014 6.51883 18.4981 5.13266 19.4664C3.44299 20.6467 1.8599 19.7311 0.842019 18.0654C0.14898 16.9312 0.113161 15.6174 0.0415247 12.9898ZM7.00183 11C7.00183 11.5523 7.44955 12 8.00183 12C8.55412 12 9.00183 11.5523 9.00183 11V8.99996L11.0018 9C11.5541 9.00001 12.0018 8.55231 12.0018 8.00002C12.0018 7.44774 11.5541 7.00001 11.0019 7L9.00183 6.99996V5C9.00183 4.44772 8.55412 4 8.00183 4C7.44955 4 7.00183 4.44772 7.00183 5V6.99992L5.00185 6.99988C4.44957 6.99987 4.00184 7.44757 4.00183 7.99986C4.00182 8.55214 4.44953 8.99987 5.00181 8.99988L7.00183 8.99992V11Z" :fill="fill"/>
    </template>
    <template v-else>
      <path d="M11 8.99994C11.5523 8.99995 12 8.55225 12 7.99996C12 7.44768 11.5523 6.99995 11 6.99994L9 6.9999V5C9 4.44772 8.55228 4 8 4C7.44771 4 7 4.44772 7 5V6.99986L5.00002 6.99982C4.44774 6.99981 4.00001 7.44751 4 7.9998C3.99999 8.55208 4.44769 8.99981 4.99998 8.99982L7 8.99986V11C7 11.5523 7.44772 12 8 12C8.55229 12 9 11.5523 9 11V8.9999L11 8.99994Z" :fill="fill"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.0415247 12.9898C0.0156955 12.0423 0 11.0331 0 9.97948C0 8.43336 0.0675909 7.0841 0.167628 5.93383C0.343395 3.9128 0.431278 2.90228 1.72529 1.6155C3.0193 0.328716 3.99009 0.248071 5.93167 0.0867819C6.58015 0.032912 7.27359 0 8 0C8.72646 0 9.41994 0.0329163 10.0685 0.0867926C12.0099 0.248085 12.9807 0.328731 14.2747 1.61549C15.5687 2.90225 15.6566 3.91271 15.8323 5.93362C15.9324 7.08393 16 8.43326 16 9.97948C16 11.0331 15.9843 12.0423 15.9585 12.9898C15.8868 15.6175 15.851 16.9313 15.1579 18.0655C14.1823 19.662 12.5749 20.6593 10.8673 19.4664C9.4811 18.4981 8.78801 18.014 7.99996 18.014C7.21191 18.014 6.51883 18.4981 5.13266 19.4664C3.44299 20.6467 1.8599 19.7311 0.842019 18.0654C0.14898 16.9312 0.113161 15.6174 0.0415247 12.9898ZM2.04078 12.9353C2.0154 12.0044 2 11.0134 2 9.97948C2 8.49173 2.06504 7.20028 2.16011 6.10712C2.25378 5.03007 2.30861 4.50868 2.43808 4.08942C2.53394 3.77898 2.6867 3.48 3.13553 3.03367C3.59461 2.57716 3.89046 2.42873 4.17933 2.33893C4.57354 2.21639 5.0599 2.16609 6.09724 2.07992C6.69574 2.0302 7.33373 2 8 2C8.66631 2 9.30434 2.0302 9.90287 2.07993C10.9402 2.1661 11.4265 2.2164 11.8207 2.33894C12.1095 2.42873 12.4054 2.57715 12.8644 3.03366C13.3133 3.48 13.466 3.77897 13.5619 4.08938C13.6913 4.5086 13.7462 5.02994 13.8399 6.10693C13.935 7.20013 14 8.49164 14 9.97948C14 11.0134 13.9846 12.0043 13.9592 12.9353C13.8818 15.7754 13.8031 16.447 13.4513 17.0226C13.0969 17.6026 12.7408 17.8751 12.5338 17.9593C12.4502 17.9933 12.4002 17.9945 12.362 17.9899C12.322 17.985 12.2069 17.9626 12.0126 17.8268L11.9388 17.7753C11.3096 17.3356 10.7098 16.9165 10.165 16.6202C9.55448 16.2881 8.8481 16.014 7.99996 16.014C7.15182 16.014 6.44545 16.2881 5.83497 16.6202C5.29015 16.9165 4.69044 17.3356 4.06123 17.7752L3.98734 17.8268C3.78786 17.9662 3.66833 17.9918 3.62568 17.9976C3.58718 18.0028 3.5429 18.0017 3.46922 17.9727C3.28257 17.899 2.92678 17.6414 2.54862 17.0225C2.19687 16.4469 2.11821 15.7754 2.04078 12.9353Z" :fill="fill"/>
    </template>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    type: {type: String, default: 'regular'},//default=regular solid
    color: {type: String, default: 'grey'},//grey lilac red
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
        'red':'#FF0032',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconSqXmarkRegular',{
  template: `<svg :width="size" :height="size" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.2071 5.79256C12.5976 6.18308 12.5976 6.81625 12.2071 7.20677L10.4139 8.99994L12.2069 10.7929C12.5974 11.1834 12.5974 11.8166 12.2069 12.2071C11.8164 12.5976 11.1832 12.5976 10.7927 12.2071L8.99973 10.4142L7.20711 12.2068C6.81658 12.5973 6.18342 12.5973 5.79289 12.2068C5.40237 11.8162 5.40237 11.1831 5.79289 10.7926L7.58551 8.99994L5.79268 7.20711C5.40216 6.81658 5.40216 6.18342 5.79268 5.79289C6.18321 5.40237 6.81637 5.40237 7.20689 5.79289L8.99973 7.58572L10.7929 5.79256C11.1834 5.40203 11.8166 5.40203 12.2071 5.79256Z" :fill="fill"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.68597 1.68743C0.373095 3.00031 0.275748 4.3083 0.0810531 6.92429C0.0305833 7.60242 0 8.30194 0 9.00146C0 9.70099 0.0305834 10.4005 0.0810532 11.0786C0.275748 13.6946 0.373095 15.0026 1.68597 16.3155C2.99884 17.6284 4.30684 17.7257 6.92282 17.9204C7.60095 17.9709 8.30048 18.0015 9 18.0015C9.69952 18.0015 10.399 17.9709 11.0772 17.9204C13.6932 17.7257 15.0012 17.6284 16.314 16.3155C17.6269 15.0026 17.7243 13.6946 17.9189 11.0786C17.9694 10.4005 18 9.70099 18 9.00146C18 8.30194 17.9694 7.60242 17.9189 6.92429C17.7243 4.3083 17.6269 3.00031 16.314 1.68743C15.0012 0.37456 13.6932 0.277213 11.0772 0.082518C10.399 0.0320482 9.69952 0.00146484 9 0.00146484C8.30048 0.00146484 7.60095 0.0320482 6.92282 0.082518C4.30684 0.277213 2.99884 0.37456 1.68597 1.68743ZM9 2.00146C8.35779 2.00146 7.70842 2.02958 7.07126 2.077C4.3209 2.2817 3.80638 2.39545 3.10018 3.10165C2.39398 3.80785 2.28023 4.32237 2.07554 7.07273C2.02812 7.70988 2 8.35925 2 9.00146C2 9.64368 2.02812 10.293 2.07554 10.9302C2.28023 13.6806 2.39398 14.1951 3.10018 14.9013C3.80638 15.6075 4.3209 15.7212 7.07126 15.9259C7.70842 15.9733 8.35779 16.0015 9 16.0015C9.64221 16.0015 10.2916 15.9733 10.9287 15.9259C13.6791 15.7212 14.1936 15.6075 14.8998 14.9013C15.606 14.1951 15.7198 13.6806 15.9245 10.9302C15.9719 10.293 16 9.64368 16 9.00146C16 8.35925 15.9719 7.70988 15.9245 7.07273C15.7198 4.32237 15.606 3.80785 14.8998 3.10165C14.1936 2.39545 13.6791 2.2817 10.9287 2.077C10.2916 2.02958 9.64221 2.00146 9 2.00146Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconSqInfoRegular',{
  template: `<svg :width="size" :height="size" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.70711 8.29289C9.89464 8.48043 10 8.73479 10 9L9.99999 13C9.99999 13.5523 9.55227 14 8.99999 14C8.4477 14 7.99999 13.5523 7.99999 13L8 10H7.5C6.94772 10 6.5 9.55229 6.5 9C6.5 8.44772 6.94772 8 7.5 8H9C9.26522 8 9.51957 8.10536 9.70711 8.29289Z" :fill="fill"/>
    <path d="M8.7512 6.24773C9.44092 6.24773 10.0001 5.68859 10.0001 4.99887C10.0001 4.30914 9.44092 3.75 8.7512 3.75C8.06147 3.75 7.50233 4.30914 7.50233 4.99887C7.50233 5.68859 8.06147 6.24773 8.7512 6.24773Z" :fill="fill"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.68597 1.68597C0.373095 2.99884 0.275748 4.30684 0.0810531 6.92282C0.0305833 7.60095 0 8.30048 0 9C0 9.69952 0.0305834 10.399 0.0810532 11.0772C0.275748 13.6932 0.373095 15.0012 1.68597 16.314C2.99884 17.6269 4.30684 17.7243 6.92282 17.9189C7.60095 17.9694 8.30048 18 9 18C9.69952 18 10.399 17.9694 11.0772 17.9189C13.6932 17.7243 15.0012 17.6269 16.314 16.314C17.6269 15.0012 17.7243 13.6932 17.9189 11.0772C17.9694 10.399 18 9.69952 18 9C18 8.30048 17.9694 7.60095 17.9189 6.92282C17.7243 4.30684 17.6269 2.99884 16.314 1.68597C15.0012 0.373095 13.6932 0.275748 11.0772 0.0810531C10.399 0.0305833 9.69952 0 9 0C8.30048 0 7.60095 0.0305834 6.92282 0.0810532C4.30684 0.275748 2.99884 0.373095 1.68597 1.68597ZM9 2C8.35779 2 7.70842 2.02812 7.07126 2.07554C4.3209 2.28023 3.80638 2.39398 3.10018 3.10018C2.39398 3.80638 2.28023 4.3209 2.07554 7.07126C2.02812 7.70842 2 8.35779 2 9C2 9.64221 2.02812 10.2916 2.07554 10.9287C2.28023 13.6791 2.39398 14.1936 3.10018 14.8998C3.80638 15.606 4.3209 15.7198 7.07126 15.9245C7.70842 15.9719 8.35779 16 9 16C9.64221 16 10.2916 15.9719 10.9287 15.9245C13.6791 15.7198 14.1936 15.606 14.8998 14.8998C15.606 14.1936 15.7198 13.6791 15.9245 10.9287C15.9719 10.2916 16 9.64221 16 9C16 8.35779 15.9719 7.70842 15.9245 7.07126C15.7198 4.3209 15.606 3.80638 14.8998 3.10018C14.1936 2.39398 13.6791 2.28023 10.9287 2.07554C10.2916 2.02812 9.64221 2 9 2Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconSqQuestionRegular',{
  template: `<svg :width="size" :height="size" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.40774 4.14689C7.05851 4.0791 8.02408 4 9.00004 4C9.86696 4 10.7248 4.06239 11.36 4.12359L11.4474 4.13171C11.8638 4.16966 12.4242 4.22073 12.9199 4.66451C13.4119 5.10494 13.5123 5.59075 13.5887 5.96032L13.6 6.01443C13.6607 6.30408 13.7059 6.63964 13.7059 7C13.7059 7.33166 13.6676 7.64752 13.6154 7.92583L13.6019 7.99903C13.5275 8.40582 13.4274 8.95265 12.9029 9.41294C12.3748 9.8764 11.7515 9.90681 11.2896 9.92935C11.2534 9.93112 11.2181 9.93284 11.184 9.93472L11.0515 9.94182L10 10C10 10 10 11 9.00001 11C8.23325 11 8.05441 10.4121 8.0127 10.1378C8.01898 10.014 8.02836 9.8961 8.04237 9.78597C8.08955 9.41512 8.20429 8.98359 8.54938 8.61999C8.89923 8.25137 9.33448 8.11673 9.70339 8.05149C10.041 7.99179 10.4569 7.97011 10.8949 7.94727C11.0707 7.93792 11.2468 7.93063 11.4222 7.9157C11.4973 7.90931 11.5464 7.90291 11.5793 7.89715C11.5839 7.88038 11.5895 7.85802 11.5962 7.82842C11.6117 7.75957 11.6271 7.67786 11.6496 7.55762C11.6847 7.3706 11.7059 7.18085 11.7059 7C11.7059 6.80465 11.6811 6.60883 11.6425 6.42451C11.6208 6.32088 11.6068 6.25477 11.593 6.19968C11.5895 6.18546 11.5863 6.17372 11.5837 6.1641C11.5592 6.15907 11.5225 6.15283 11.4668 6.14571C11.3884 6.13569 11.2966 6.12675 11.1682 6.11438C10.5683 6.05657 9.7796 6 9.00004 6C8.1207 6 7.23096 6.07196 6.61495 6.13612C6.5519 6.14269 6.509 6.1472 6.47237 6.15171C6.41463 6.15882 6.41272 6.19763 6.40429 6.2296C6.30072 6.67147 5.90411 7.00049 5.43066 7.00049C4.87838 7.00049 4.43066 6.55277 4.43066 6.00049C4.43066 5.90695 4.44351 5.81641 4.46753 5.73053C4.517 5.54178 4.5765 5.31482 4.77123 5.02925C4.88042 4.86913 5.02094 4.73383 5.12637 4.64341C5.23179 4.553 5.38694 4.43475 5.56183 4.35124C5.87651 4.20099 6.1532 4.17283 6.36717 4.15105L6.40774 4.14689Z" :fill="fill"/>
    <path d="M9.00009 12.2513C9.68981 12.2513 10.249 12.8104 10.249 13.5002C10.249 14.1899 9.68981 14.749 9.00009 14.749C8.31036 14.749 7.75122 14.1899 7.75122 13.5002C7.75122 12.8104 8.31036 12.2513 9.00009 12.2513Z" :fill="fill"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.68597 1.68597C0.373095 2.99884 0.275748 4.30684 0.0810531 6.92282C0.0305833 7.60095 0 8.30048 0 9C0 9.69952 0.0305834 10.399 0.0810532 11.0772C0.275748 13.6932 0.373095 15.0012 1.68597 16.314C2.99884 17.6269 4.30684 17.7243 6.92282 17.9189C7.60095 17.9694 8.30048 18 9 18C9.69952 18 10.399 17.9694 11.0772 17.9189C13.6932 17.7243 15.0012 17.6269 16.314 16.314C17.6269 15.0012 17.7243 13.6932 17.9189 11.0772C17.9694 10.399 18 9.69952 18 9C18 8.30048 17.9694 7.60095 17.9189 6.92282C17.7243 4.30684 17.6269 2.99884 16.314 1.68597C15.0012 0.373095 13.6932 0.275748 11.0772 0.0810531C10.399 0.0305833 9.69952 0 9 0C8.30048 0 7.60095 0.0305834 6.92282 0.0810532C4.30684 0.275748 2.99884 0.373095 1.68597 1.68597ZM9 2C8.35779 2 7.70842 2.02812 7.07126 2.07554C4.3209 2.28023 3.80638 2.39398 3.10018 3.10018C2.39398 3.80638 2.28023 4.3209 2.07554 7.07126C2.02812 7.70842 2 8.35779 2 9C2 9.64221 2.02812 10.2916 2.07554 10.9287C2.28023 13.6791 2.39398 14.1936 3.10018 14.8998C3.80638 15.606 4.3209 15.7198 7.07126 15.9245C7.70842 15.9719 8.35779 16 9 16C9.64221 16 10.2916 15.9719 10.9287 15.9245C13.6791 15.7198 14.1936 15.606 14.8998 14.8998C15.606 14.1936 15.7198 13.6791 15.9245 10.9287C15.9719 10.2916 16 9.64221 16 9C16 8.35779 15.9719 7.70842 15.9245 7.07126C15.7198 4.3209 15.606 3.80638 14.8998 3.10018C14.1936 2.39398 13.6791 2.28023 10.9287 2.07554C10.2916 2.02812 9.64221 2 9 2Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconSqTrashcanRegular',{
  template: `<svg :width="size" :height="size" viewBox="-1 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 9C7.55228 9 8 9.44771 8 10V14.0001C8 14.5523 7.55229 15.0001 7 15.0001C6.44772 15.0001 6 14.5523 6 14.0001V10C6 9.44772 6.44772 9 7 9Z" :fill="fill"/>
    <path d="M11 9C11.5523 9 12 9.44771 12 10V14.0001C12 14.5523 11.5523 15.0001 11 15.0001C10.4477 15.0001 10 14.5523 10 14.0001V10C10 9.44772 10.4477 9 11 9Z" :fill="fill"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13 3H17C17.5523 3 18 3.44772 18 4C18 4.55228 17.5523 5 17 5H16.7446C16.7755 5.29056 16.8027 5.6038 16.8324 5.94594C16.9325 7.09866 17.0001 8.45089 17.0001 10.0003C17.0001 11.5503 16.9324 12.9028 16.8323 14.0557C16.6565 16.08 16.5687 17.0921 15.2749 18.3815C13.9811 19.6708 13.0109 19.7517 11.0704 19.9135C10.4213 19.9676 9.7272 20.0007 9.00004 20.0007C8.27291 20.0007 7.57882 19.9676 6.92979 19.9135C4.98923 19.7517 4.01895 19.6708 2.72517 18.3815C1.43138 17.0921 1.3435 16.0799 1.16774 14.0556C1.06764 12.9027 1 11.5503 1 10.0003C1 8.45099 1.06759 7.09891 1.16763 5.94624C1.19733 5.60398 1.22453 5.29064 1.25546 5H1C0.447715 5 0 4.55228 0 4C0 3.44772 0.447715 3 1 3H5C5 2.76953 5.01494 2.54404 5.03965 2.32869C5.12036 1.62545 5.16071 1.27383 5.63843 0.784375C6.11615 0.294925 6.52797 0.237515 7.35161 0.122694C7.85789 0.0521147 8.42605 0 9 0C9.57395 0 10.1421 0.0521148 10.6484 0.122694C11.472 0.237515 11.8838 0.294925 12.3616 0.784375C12.8393 1.27383 12.8796 1.62545 12.9603 2.32869C12.9851 2.54404 13 2.76953 13 3ZM9 2C8.54196 2 8.06925 2.04199 7.62775 2.10354C7.41101 2.13375 7.27325 2.15328 7.15835 2.17399C7.12255 2.18044 7.09437 2.1861 7.07251 2.19085C7.0595 2.27358 7.04724 2.377 7.02661 2.55672C7.00943 2.70641 7 2.85521 7 3H11C11 2.85521 10.9906 2.70641 10.9734 2.55672C10.9528 2.37699 10.9405 2.27358 10.9275 2.19085C10.9056 2.1861 10.8775 2.18044 10.8416 2.17399C10.7268 2.15328 10.589 2.13375 10.3722 2.10354C9.93075 2.04199 9.45804 2 9 2ZM3.16014 6.11916C3.20038 5.65551 3.23346 5.29444 3.2684 5H14.7317C14.7666 5.2944 14.7997 5.65541 14.8399 6.11897C14.935 7.2147 15.0001 8.50915 15.0001 10.0003C15.0001 11.492 14.935 12.7868 14.8398 13.8827C14.7462 14.9613 14.6913 15.4843 14.5616 15.9051C14.4654 16.2172 14.3121 16.5174 13.8631 16.9648C13.4038 17.4226 13.1081 17.5711 12.82 17.6609C12.4265 17.7836 11.9411 17.834 10.9042 17.9204C10.3053 17.9704 9.66682 18.0007 9.00004 18.0007C8.33328 18.0007 7.69484 17.9704 7.09597 17.9204C6.05904 17.834 5.57355 17.7836 5.18008 17.6609C4.89199 17.5711 4.59628 17.4226 4.13696 16.9648C3.68796 16.5174 3.53468 16.2172 3.43846 15.905C3.30876 15.4842 3.25389 14.9612 3.16024 13.8826C3.06509 12.7867 3 11.492 3 10.0003C3 8.50924 3.06505 7.21485 3.16014 6.11916Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac red orange2
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
        'orange2':'#F95721',
        'red':'#FF0032',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconSqCheckedSolid',{
  template: `<svg :width="size" :height="size" viewBox="-1 -1 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.68585 1.68597C0.372973 2.99884 0.275626 4.30684 0.080931 6.92282C0.0304613 7.60095 -0.00012207 8.30048 -0.00012207 9C-0.00012207 9.69952 0.0304613 10.399 0.0809311 11.0772C0.275626 13.6932 0.372973 15.0012 1.68585 16.314C2.99872 17.6269 4.30671 17.7243 6.9227 17.9189C7.60083 17.9694 8.30035 18 8.99988 18C9.6994 18 10.3989 17.9694 11.0771 17.9189C13.693 17.7243 15.001 17.6269 16.3139 16.314C17.6268 15.0012 17.7241 13.6932 17.9188 11.0772C17.9693 10.399 17.9999 9.69952 17.9999 9C17.9999 8.30048 17.9693 7.60095 17.9188 6.92282C17.7241 4.30684 17.6268 2.99884 16.3139 1.68597C15.001 0.373095 13.693 0.275748 11.0771 0.0810531C10.3989 0.0305833 9.6994 0 8.99988 0C8.30035 0 7.60083 0.0305834 6.9227 0.0810532C4.30671 0.275748 2.99872 0.373095 1.68585 1.68597ZM13.2069 7.20711C13.5974 6.81658 13.5974 6.18342 13.2069 5.79289C12.8164 5.40237 12.1832 5.40237 11.7927 5.79289L7.99977 9.58579L6.70688 8.29289C6.31635 7.90237 5.68319 7.90237 5.29266 8.29289C4.90214 8.68342 4.90214 9.31658 5.29266 9.70711L7.29266 11.7071C7.68319 12.0976 8.31635 12.0976 8.70688 11.7071L13.2069 7.20711Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconSqRegular',{
  template: `<svg :width="size" :height="size" viewBox="-1 -1 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.24787 2.24787C0.49756 3.99819 0.367746 5.74205 0.108119 9.22978C0.0407973 10.1342 0 11.0671 0 12C0 12.9329 0.0407973 13.8658 0.108119 14.7702C0.367746 18.2579 0.497559 20.0018 2.24787 21.7521C3.99819 23.5024 5.74205 23.6323 9.22978 23.8919C10.1342 23.9592 11.0671 24 12 24C12.9329 24 13.8658 23.9592 14.7702 23.8919C18.2579 23.6323 20.0018 23.5024 21.7521 21.7521C23.5024 20.0018 23.6323 18.2579 23.8919 14.7702C23.9592 13.8658 24 12.9329 24 12C24 11.0671 23.9592 10.1342 23.8919 9.22978C23.6323 5.74205 23.5024 3.99819 21.7521 2.24787C20.0018 0.49756 18.2579 0.367746 14.7702 0.108119C13.8658 0.0407973 12.9329 0 12 0C11.0671 0 10.1342 0.0407973 9.22978 0.108119C5.74205 0.367746 3.99819 0.497559 2.24787 2.24787ZM12 2.5C11.1387 2.5 10.2685 2.53771 9.41537 2.60122C5.75966 2.87335 5.00763 3.02366 4.01564 4.01564C3.02366 5.00763 2.87335 5.75966 2.60122 9.41537C2.53771 10.2685 2.5 11.1387 2.5 12C2.5 12.8613 2.53771 13.7315 2.60122 14.5846C2.87335 18.2403 3.02366 18.9924 4.01564 19.9844C5.00763 20.9763 5.75966 21.1266 9.41537 21.3988C10.2685 21.4623 11.1387 21.5 12 21.5C12.8613 21.5 13.7315 21.4623 14.5846 21.3988C18.2403 21.1266 18.9924 20.9763 19.9844 19.9844C20.9763 18.9924 21.1266 18.2403 21.3988 14.5846C21.4623 13.7315 21.5 12.8613 21.5 12C21.5 11.1387 21.4623 10.2685 21.3988 9.41537C21.1266 5.75966 20.9763 5.00763 19.9844 4.01564C18.9924 3.02366 18.2403 2.87335 14.5846 2.60122C13.7315 2.53771 12.8613 2.5 12 2.5Z" ;fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconHorisontalDots',{
  template: `<svg :width="size" :height="size" viewBox="-1 -8 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.0180118 1.53841C0.0612773 0.957075 0.08291 0.666409 0.37466 0.37466C0.666409 0.08291 0.957075 0.0612773 1.53841 0.0180118C1.6891 0.00679629 1.84455 0 2 0C2.15545 0 2.3109 0.00679629 2.46159 0.0180118C3.04293 0.0612773 3.33359 0.08291 3.62534 0.37466C3.91709 0.666409 3.93872 0.957075 3.98199 1.53841C3.9932 1.6891 4 1.84455 4 2C4 2.15545 3.9932 2.3109 3.98199 2.46159C3.93872 3.04293 3.91709 3.33359 3.62534 3.62534C3.33359 3.91709 3.04293 3.93872 2.46159 3.98199C2.3109 3.9932 2.15545 4 2 4C1.84455 4 1.6891 3.9932 1.53841 3.98199C0.957075 3.93872 0.666409 3.91709 0.37466 3.62534C0.08291 3.33359 0.0612773 3.04293 0.0180118 2.46159C0.00679629 2.3109 0 2.15545 0 2C0 1.84455 0.00679629 1.6891 0.0180118 1.53841Z" :fill="fill"/>
    <path d="M7.01801 1.53841C7.06128 0.957075 7.08291 0.666409 7.37466 0.37466C7.66641 0.08291 7.95707 0.0612773 8.53841 0.0180118C8.6891 0.00679629 8.84455 0 9 0C9.15545 0 9.3109 0.00679629 9.46159 0.0180118C10.0429 0.0612773 10.3336 0.08291 10.6253 0.37466C10.9171 0.666409 10.9387 0.957075 10.982 1.53841C10.9932 1.6891 11 1.84455 11 2C11 2.15545 10.9932 2.3109 10.982 2.46159C10.9387 3.04293 10.9171 3.33359 10.6253 3.62534C10.3336 3.91709 10.0429 3.93872 9.46159 3.98199C9.3109 3.9932 9.15545 4 9 4C8.84455 4 8.6891 3.9932 8.53841 3.98199C7.95707 3.93872 7.66641 3.91709 7.37466 3.62534C7.08291 3.33359 7.06128 3.04293 7.01801 2.46159C7.0068 2.3109 7 2.15545 7 2C7 1.84455 7.0068 1.6891 7.01801 1.53841Z" :fill="fill"/>
    <path d="M14.3747 0.37466C14.0829 0.666409 14.0613 0.957075 14.018 1.53841C14.0068 1.6891 14 1.84455 14 2C14 2.15545 14.0068 2.3109 14.018 2.46159C14.0613 3.04293 14.0829 3.33359 14.3747 3.62534C14.6664 3.91709 14.9571 3.93872 15.5384 3.98199C15.6891 3.9932 15.8446 4 16 4C16.1554 4 16.3109 3.9932 16.4616 3.98199C17.0429 3.93872 17.3336 3.91709 17.6253 3.62534C17.9171 3.33359 17.9387 3.04293 17.982 2.46159C17.9932 2.3109 18 2.15545 18 2C18 1.84455 17.9932 1.6891 17.982 1.53841C17.9387 0.957075 17.9171 0.666409 17.6253 0.37466C17.3336 0.08291 17.0429 0.0612773 16.4616 0.0180118C16.3109 0.00679629 16.1554 0 16 0C15.8446 0 15.6891 0.00679629 15.5384 0.0180118C14.9571 0.0612773 14.6664 0.08291 14.3747 0.37466Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconPen2',{
  template: `<svg :width="size" :height="size" viewBox="-1 -1 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4788 0.00746568C12.8251 0.0598684 12.4177 0.412273 11.6029 1.11708C10.2959 2.24773 8.44909 3.88863 6.94648 5.39079C5.44386 6.89294 3.80245 8.73915 2.67146 10.0458C2.36674 10.3978 2.12788 10.6738 1.95063 10.9264C1.62569 11.3329 1.3956 12.0901 1.04235 13.2527L0.514634 14.9895C0.0352647 16.5671 -0.20442 17.356 0.219899 17.7802C0.644215 18.2044 1.43328 17.9647 3.01141 17.4855L4.74876 16.958C5.98041 16.584 6.75726 16.3481 7.14413 15.9914C7.37696 15.8205 7.633 15.599 7.95112 15.3238C9.25816 14.1932 11.1049 12.5523 12.6076 11.0501C14.1102 9.54797 15.7516 7.70176 16.8826 6.39512C17.5876 5.58061 17.9401 5.17335 17.9925 4.5198C18.045 3.86626 17.8198 3.50177 17.3694 2.77279C17.1126 2.35721 16.8011 1.93356 16.4335 1.56604C16.0658 1.19852 15.6421 0.887124 15.2264 0.630439C14.4972 0.180188 14.1326 -0.044937 13.4788 0.00746568ZM3.52706 12.1618C3.52875 12.1586 3.53037 12.1553 3.53037 12.1553L3.55327 12.1267L3.58928 12.0753C3.69511 11.9245 3.85677 11.7342 4.18498 11.3551C5.30704 10.0587 6.91096 8.25596 8.36174 6.80562C8.92296 6.24458 9.53693 5.66063 10.1539 5.09052L12.9079 7.84366C12.3376 8.46047 11.7535 9.07425 11.1923 9.63529C9.7415 11.0856 7.93817 12.6891 6.64145 13.8108C6.30277 14.1038 6.11386 14.2653 5.95974 14.3784L5.86948 14.4447L5.83526 14.4762C5.80512 14.4918 5.7214 14.5337 5.55359 14.5973C5.23461 14.7182 4.80697 14.8491 4.16704 15.0435L2.42973 15.571L2.95744 13.8342C3.14021 13.2327 3.26737 12.8169 3.3848 12.4988C3.46465 12.2825 3.51381 12.1875 3.52706 12.1618ZM14.2529 6.35858C14.6566 5.90447 15.0343 5.47262 15.3691 5.08586C15.5507 4.87603 15.6844 4.72134 15.7954 4.58529C15.8863 4.474 15.9421 4.39913 15.9773 4.34739C15.9645 4.32261 15.9473 4.29098 15.9246 4.2511C15.8623 4.14167 15.7843 4.01494 15.6665 3.82424C15.4664 3.50036 15.2472 3.20983 15.0182 2.98087C14.7892 2.75192 14.4986 2.53283 14.1746 2.33278C13.9838 2.21499 13.8571 2.13703 13.7476 2.07474C13.7077 2.05205 13.6761 2.03491 13.6513 2.02203C13.5995 2.0573 13.5246 2.11309 13.4133 2.2039C13.2772 2.31493 13.1225 2.44857 12.9126 2.63014C12.5257 2.96481 12.0937 3.34236 11.6395 3.74593L14.2529 6.35858Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});
Vue.component('IconCalendar',{
  template: `<svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" :fill="fill"/>
  </svg>`,
  props: {
    size: {type: [String, Number], default: 24},
    color: {type: String, default: 'grey'},//grey lilac
  },
  computed: {
    fill(){
      return {
        'grey':'#ADABAB',
        'lilac':'#5642bd',
      }[this.color] || this.color
    }
  }
});

Vue.component('BookmarkCard',{
  beforeMount(){
    console.time([this.$options.name,this.bookmark?.favorite_id,'mounted'])
  },
  mounted(){
    console.timeEnd([this.$options.name,this.bookmark?.favorite_id,'mounted'])
  },
  beforeDestroy(){
    console.time([this.$options.name,this.bookmark?.favorite_id,'destroyed'])
  },
  destroyed(){
    console.timeEnd([this.$options.name,this.bookmark?.favorite_id,'destroyed'])
  },
  template:`<div class="white-shadow-block-rounded-padding-8 display-flex flex-direction-column gap-4px">
    <div class="font--15-600">{{title}}</div>
    <link-block :text="name" @block-click="click" :disabled="groupDeleteMode" textClass="font--13-500" actionIcon="right-link" type="medium" class="height-24px padding-left-0"/>
    <div class="bg-main-f2f3f7 border-radius-4px display-flex align-items-start justify-content-space-between padding-4px">
      <info-text-sec :text="descr" :rowsMax="expandDescr ? 0 : 1" class="padding-unset"/>
      <button-sq @click="expandDescr = !expandDescr" class="size-20px min-width-20px">
        <IcIcon :name="expandDescr ? 'fa fa-chevron-up' : 'fa fa-chevron-down'" color="#5642bd"/>
      </button-sq>
    </div>
    <div class="display-flex align-items-center justify-content-space-between">
      <span class="font--12-400 tone-500">Дата добавления: {{date}}</span>
      <button-sq @click="$emit('openBookmarkEditOrDeleteModal',bookmark)" :disabled="groupDeleteMode" class="size-20px min-width-20px">
        <IconHorisontalDots size="20" :color="!groupDeleteMode ? 'lilac' : 'grey'"/>
      </button-sq>
    </div>
  </div>`,
  props: {
    bookmark: {type: Object, required: !0},
  },
  computed: {
    ...mapGetters('Engineer/SectionsL1/Bookmarks', [
      'getBookmarkProp',
      'groupDeleteMode',
    ]),
    expandDescr: {
      get(){
        return Boolean(this.getBookmarkProp(this.bookmark.favorite_id, 'expandDescr'))
      },
      set(expandDescr){
        this.setBookmarkProp([this.bookmark.favorite_id, {expandDescr: !!expandDescr}]);
      }
    },
    date(){return new Date(Date.parse(this.bookmark.create_date)).toLocaleDateString()},
    title(){return this.bookmark.object_type||''},//"Коммутатор",
    name(){return this.bookmark.object_name||''},//"ETH_54KR_00340_14",
    descr(){return this.bookmark.description||''},//"",
    object_id(){return this.bookmark.object_id||''},//"9157470089313556000",
    path(){return this.bookmark.url||''},//"/network-element-ETH_54KR_00340_14",
  },
  methods: {
    ...mapActions('Engineer/SectionsL1/Bookmarks', [
      'setBookmarkProp',
      'clickBookmark'
    ]),
    click(){
      this.clickBookmark(this.bookmark.favorite_id);
      const {path,object_id}=this;
      if(path){
        this.$router.push(/^PORT-/i.test(object_id)?`/${encodeURIComponent(object_id)}`:path);
      }else{
        this.$router.push({name:'search',params:{text:object_id}})
      };
    },
  },
});
Vue.component('FavBtnLinkBlock',{//proxy props to BookmarkSection
  template:`<div class="display-contents">
    <BookmarkSection v-bind="{
      objectType: title,
      objectID: id,
      objectName: name,
      url: path || this.$route.path,
      comment: descr
    }"/>
  </div>`,
  props:{
    title:{type:[String,Number],default:'',required:true},
    name:{type:[String,Number],default:'',required:true},
    id:{type:[String,Number],default:'',required:true},
    path:{type:String,default:''},
    descr:{type:String,default:''},
  },
});
Vue.component('BookmarkSection',{
  template:`<div class="display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main :text="exist ? 'Сохранено в закладках' : 'Сохранить в закладки'" textClass="font--16-500" class="padding-unset margin-top-bottom--8px--">
        <template slot="icon">
          <button class="reset--button" @click="$router.push({name: 'R_Engineer_SectionL1', params: {sectionL1Name: 'Bookmarks'}})">
            <IconBookmarkAdd size="20" color="grey" :type="exist ? 'solid' : 'regular'"/>
          </button>
        </template>
        
        <template>
          <button-sq v-if="bookmark" :disabled="loadingSome" type="large" @click="$refs.BookmarkEditOrDeleteModal.open(bookmark)">
            <IconPen2 size="20" :color="loadingSome ? 'grey' : 'lilac'"/>
          </button-sq>
          <button-sq v-else :disabled="loadingSome" type="large" @click="createBookmark([objectType, objectID, objectName, url, comment])">
            <IconBookmarkAdd size="20" :color="loadingSome ? 'grey' : 'lilac'"  :type="exist ? 'solid' : 'regular'"/>
          </button-sq>
        </template>
      </title-main>
    </div>
    
    <loader-bootstrap v-if="createBookmarkLoading" text="сохранение ..."/>
    
    <div v-else-if="createBookmarkErrorMessage" class="padding-left-right-12px">
      <UIUserMessage :message="createBookmarkErrorMessage" type="warning"/>
    </div>
    
    <div v-if="bookmark" class="padding-left-right-12px display-flex flex-direction-column gap-4px">
      <UIInfoText :text="bookmark.description"/>
      <div class="display-flex align-items-center justify-content-space-between">
        <span class="font--12-400 tone-500">Дата добавления: {{createDate}}</span>
        <button-sq @click="$refs.BookmarkEditOrDeleteModal.open(bookmark)" class="size-20px min-width-20px">
          <IconHorisontalDots size="20" color="lilac"/>
        </button-sq>
      </div>
    </div>
    
    <BookmarkEditOrDeleteModal v-if="bookmark" ref="BookmarkEditOrDeleteModal"/>
  </div>`,
  props: {
    objectType: {type: [String, Number], default: '',required: !0},
    objectName: {type: [String, Number], default: '',required: !0},
    objectID: {type: [String, Number], default: '',required: !0},
    url: {type: String, default: ''},
    comment: {type: String, default: ''},
  },
  computed: {
    ...mapGetters('Engineer/SectionsL1/Bookmarks', [
      'userBookmarksLoading',
      'findBookmark',
      'createBookmarkLoading',
      'createBookmarkErrorMessage',
      'createBookmarkSuccessMessage',
      'loadingSome',
    ]),
    bookmark(){
      return this.findBookmark(this.objectID)
    },
    createDate(){return new Date(Date.parse(this.bookmark?.create_date)).toLocaleDateString()},
    exist(){return Boolean(this.bookmark)},
  },
  methods: {
    ...mapActions('Engineer/SectionsL1/Bookmarks', [
      'createBookmark',
    ]),
  },
});
Vue.component('BookmarkEditOrDeleteModal', {
  template:`<div class="display-contents">
    <modal-container-custom ref="modal" :footer="false" header @close="onClose" :disabled="changeBookmarkCommentLoading || deleteBookmarkLoading" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
      <div class="padding-left-right-8px display-flex flex-direction-column gap-16px">
        <div v-if="editDescrMode" class="font--15-600 text-align-center">{{titleText}}</div>
        
        <template v-if="!editDescrMode">
          <button-main :label="btnModeLabel" @click="editDescrMode = !editDescrMode" :disabled="deleteBookmarkLoading" size="full" class="justify-content-start">
            <template slot="icon">
              <IconPen2 size="20" color="lilac"/>
            </template>
          </button-main>
          
          <div class="display-flex flex-direction-column gap-4px">
            <loader-bootstrap v-if="deleteBookmarkLoading" text="удаление ..."/>
            
            <UIUserMessage v-else-if="deleteBookmarkErrorMessage" :message="deleteBookmarkErrorMessage" type="warning"/>
            <UIUserMessage v-else-if="deleteBookmarkSuccessMessage" :message="deleteBookmarkSuccessMessage" type="success"/>
            
            <button-main label="Удалить зпаись" @click="deleteBookmark" :disabled="deleteBookmarkLoading" size="full" class="justify-content-start">
              <template slot="icon">
                <IconSqTrashcanRegular size="20" color="orange2"/>
              </template>
            </button-main>
          </div>
        </template>
        
        <div v-else class="display-flex flex-direction-column gap-4px">
          <UITextArea ref="UITextArea" rows="14" :label="textLabel" v-model="descriptionSync" :disabled="changeBookmarkCommentLoading" :error="descrIsOver512"/>
          
          <div class="display-flex align-items-center justify-content-space-between margin-top--4px gap-4px">
            <div class="display-flex align-items-center gap-4px">
              <button-sq @click="clearDescr" class="size-20px min-width-20px" title="очистить">
                <IcIcon name="contract-off" color="#5642bd" size="16"/>
              </button-sq>
              <button-sq @click="$copy(descriptionSync)" class="size-20px min-width-20px" title="копировать">
                <IcIcon name="copy" color="#5642bd" size="16"/>
              </button-sq>
            </div>
            <div v-if="descrIsOver512" class="display-flex align-items-center gap-4px">
              <input-error text="Не более 512 символов" class="padding-unset"/>
              <button-sq @click="sliceDescr512" :disabled="sliceDescr512Loading" class="size-20px min-width-20px border-1px-solid-c8c7c7 border-radius-4px" title="обрезать до 512">
                <IcIcon :name="sliceDescr512Loading ? 'loading rotating' : 'left-link'" color="#5642bd" size="16"/>
              </button-sq>
            </div>
          </div>
          
          <loader-bootstrap v-if="changeBookmarkCommentLoading" text="сохранение ..."/>
          
          <UIUserMessage v-else-if="changeBookmarkCommentErrorMessage" :message="changeBookmarkCommentErrorMessage" type="warning"/>
          <UIUserMessage v-else-if="changeBookmarkCommentSuccessMessage" :message="changeBookmarkCommentSuccessMessage" type="success"/>
          
          <button-main :label="btnChangeLabel" @click="changeBookmarkComment" :disabled="sliceDescr512Loading || changeBookmarkCommentLoading || descrIsOver512" buttonStyle="contained" size="full"/>
        </div>
        
        <div class="display-flex justify-content-space-around">
          <button-main label="Отмена" @click="close" :disabled="changeBookmarkCommentLoading || deleteBookmarkLoading" buttonStyle="outlined" size="medium"/>
        </div>
      </div>
    </modal-container-custom>
  </div>`,
  data: () => ({
    textLabel: 'Ваш комментарий',
    editDescrMode: false,
    sliceDescr512Loading: false,
    sliceDescr512Timer: null,
  }),
  watch: {
    'sliceDescr512Loading'(loading){
      if(loading){
        this.textLabel = 'Ваш комментарий обрезается...';
      }else{
        this.textLabel = 'Ваш комментарий обрезан';
        this.sliceDescr512Timer = setTimeout(()=>{
          this.textLabel = 'Ваш комментарий'
        }, 2222);
      }
    }
  },
  computed: {
    ...mapGetters('Engineer/SectionsL1/Bookmarks/Bookmark',[
      'changeBookmarkCommentLoading',
      'changeBookmarkCommentErrorMessage',
      'changeBookmarkCommentSuccessMessage',
      'deleteBookmarkLoading',
      'deleteBookmarkErrorMessage',
      'deleteBookmarkSuccessMessage',
      'description',
    ]),
    descriptionSync: {
      get(){
        return this.description
      },
      set(description){
        this.setDescription(description)
      }
    },
    descrIsOver512(){return this.descriptionSync.length > 512},
    titleText(){return this.descriptionSync ? 'Редактирование комментария' : 'Добавление комментария'},
    btnModeLabel(){return this.descriptionSync ? 'Редактировать комментарий' : 'Добавить комментарий'},
    btnChangeLabel(){return !this.descriptionSync ? 'Добавить комментарий' : 'Сохранить изменения'},
  },
  methods: {
    open(bookmark){//public
      this.$refs.modal.open();
      this.setCurrentBookmarkID(bookmark?.favorite_id);
    },
    close(){//public
      this.$refs.modal.close();
    },
    onClose(){
      this.editDescrMode = !1;
      this.setCurrentBookmarkID();
      this.getUserBookmarks();
    },
    ...mapActions('Engineer/SectionsL1/Bookmarks',[
      'setCurrentBookmarkID',
      'getUserBookmarks',
    ]),
    ...mapActions('Engineer/SectionsL1/Bookmarks/Bookmark',[
      'setDescription',
      'deleteBookmark',
      'changeBookmarkComment',
    ]),
    async sliceDescr512(){
      clearTimeout(this.sliceDescr512Timer);
      this.sliceDescr512Loading=true;
      await this.$refs.UITextArea.erase(512);
      this.sliceDescr512Loading=false;
    },
    clearDescr(){
      this.descriptionSync = '';
    },
  },
});
Vue.component('BookmarksGroupDeleteConfirmModal', {
  template:`<div class="display-contents">
    <modal-container-custom ref="modal" :footer="false" header :disabled="deleteSelectedGroupLoading" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
      <div class="padding-left-right-8px display-flex flex-direction-column gap-16px">
        <div class="font--15-600 text-align-center">Удаление записей <span class="tone-500">({{markedToDeleteCount}})</span></div>
        
        <loader-bootstrap v-if="deleteSelectedGroupLoading" text="удаление ..."/>
        
        <UIUserMessage v-else-if="deleteSelectedGroupErrorMessage" :message="deleteSelectedGroupErrorMessage" type="warning"/>
        
        <div class="font--13-500 text-align-center">Вы действительно хотите удалить выбранные записи из списка сохраненных?</div>
        
        <div class="display-flex flex-direction-column gap-16px margin-top-16px">
          <button-main label="Да" @click="deleteSelectedGroup" :disabled="deleteSelectedGroupLoading" buttonStyle="contained" size="full"/>
        </div>
        
        <div class="display-flex justify-content-space-around">
          <button-main label="Закрыть" @click="close" :disabled="deleteSelectedGroupLoading" buttonStyle="outlined" size="medium"/>
        </div>
      </div>
    </modal-container-custom>
  </div>`,
  computed:mapGetters('Engineer/SectionsL1/Bookmarks',[
    'deleteSelectedGroupLoading',
    'deleteSelectedGroupErrorMessage',
    'markedToDeleteCount',
  ]),
  methods:{
    open(){//public
      this.$refs.modal.open();
    },
    close(){//public
      this.$refs.modal.close();
    },
    ...mapActions('Engineer/SectionsL1/Bookmarks',[
      'deleteSelectedGroup',
    ]),
  },
});

Vue.component('EngineerSectionBookmarks', {
  template:`<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main text="Сохраненные объекты" class="padding-unset margin-top-bottom--8px">
        <template slot="icon">
          <IconBookmarkAdd size="20" color="grey" type="regular"/>
        </template>
        
        <template>
          <button-sq v-if="userBookmarks && !groupDeleteMode" :disabled="userBookmarksLoading" type="large" @click="() => setGroupDeleteMode(!0)">
            <IconSqTrashcanRegular size="20" :color="userBookmarksLoading ? 'grey' : 'lilac'"/>
          </button-sq>
          <button-sq :icon="userBookmarksLoading ? 'sync rotating' : 'sync'" :disabled="loadingSome" type="large" @click="() => getUserBookmarks()"/>
        </template>
      </title-main>
    </div>
    
    <template v-if="userBookmarks && groupDeleteMode">
      <div class="divider-line"/>
      
      <div class="padding-left-12px---">
        <title-main v-if="groupDeleteMode" text="Выбрано" :text2="markedToDeleteCount" class="padding-unset margin-top-bottom--8px">
          <template slot="icon">
            <button-sq v-if="groupDeleteMode" :disabled="deleteSelectedGroupLoading" type="large" @click="() => setGroupDeleteMode(!1)">
              <IconSqXmarkRegular size="20" :color="deleteSelectedGroupLoading ? 'grey' : 'lilac'"/>
            </button-sq>
          </template>
          
          <div class="display-flex align-items-center gap-4px">
            <span :style="{color:markedToDeleteCount?'#FF0032':'#918f8f'}" class="font--13-500 font-weight-700">Удалить</span>
            <button-sq :disabled="loadingSome" type="large" @click="$refs.BookmarksGroupDeleteConfirmModal.open()">
              <IconSqTrashcanRegular size="20" :color="markedToDeleteCount ? 'red' : 'grey'"/>
            </button-sq>
          </div>
        </title-main>
      </div>
      
      <BookmarksGroupDeleteConfirmModal ref="BookmarksGroupDeleteConfirmModal"/>
    </template>
    
    
    <loader-bootstrap v-if="userBookmarksLoading && !userBookmarks" text="закладки ..."/>
    
    <div v-else-if="userBookmarksErrorMessage" class="padding-left-right-12px">
      <UIUserMessage :message="userBookmarksErrorMessage" type="warning"/>
    </div>
    
    <div v-else-if="userBookmarks && !userBookmarks.length" class="padding-left-right-12px">
      <UIUserMessage message="Нет закладок" type="info"/>
    </div>
  </div>`,
  watch: {
    'userBookmarks'(){
      this.setGroupDeleteMode(!1);
    }
  },
  computed:mapGetters('Engineer/SectionsL1/Bookmarks',[
    'userBookmarksLoading',
    'userBookmarksErrorMessage',
    'userBookmarks',
    'groupDeleteMode',
    'markedToDeleteCount',
    'deleteSelectedGroupLoading',
    'loadingSome',
  ]),
  methods:mapActions('Engineer/SectionsL1/Bookmarks',[
    'getUserBookmarks',
    'setGroupDeleteMode',
  ]),
});
Vue.component('EngineerSectionBookmarksScroller', {
  template:`<div class="display-flex flex-direction-column padding-left-right-12px--" style="overflow: hidden;" :style="style">
    <BookmarkEditOrDeleteModal ref="BookmarkEditOrDeleteModal"/>
    
    <DynamicScroller v-bind="{
      minItemSize: 8,
      keyField: 'favorite_id',
      items: userBookmarks
    }">
      <template slot-scope="{item,index,active}">
        <DynamicScrollerItem v-bind="{
          item,
          active,
          dataIndex:index,
          dataActive:active,
          sizeDependencies:[ item.favorite_id ]
        }">
          
          <div class="display-flex flex-direction-column margin-top-4px margin-left-right-12px" :class="[groupDeleteMode && 'padding-left-24px']">
            <span class="font--13-500 tone-500 text-align-center">{{index + 1}}</span>
            <component v-bind="{
              is: groupDeleteMode ? 'CardCheckboxLeft' : 'div',
              class: [!groupDeleteMode && 'display-contents'],
              checked: getBookmarkProp(item.favorite_id, 'markToDelete'),
            }" left="27" v-on="{
              change: ($event) => setBookmarkProp([item.favorite_id,['markToDelete',$event]])
            }">
              <BookmarkCard :bookmark="item" @openBookmarkEditOrDeleteModal="$refs.BookmarkEditOrDeleteModal.open($event)"/>
            </component>
          </div>
          
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>`,
  data: () => ({
    offsetTop: 0,
  }),
  created() {
    window.addEventListener('resize', this.resizeHandler)
  },
  computed:{
    ...mapGetters('Engineer/SectionsL1/Bookmarks',[
      'userBookmarks',
      'getBookmarkProp',
      'groupDeleteMode',
    ]),
    style(){
      return {
        height: `calc(100vh - ${this.offsetTop}px)`
      }
    },
  },
  methods: {
    ...mapActions('Engineer/SectionsL1/Bookmarks', [
      'setBookmarkProp'
    ]),
    resizeHandler(e){
      console.log({offsetTop: this.offsetTop = this.$el.offsetTop})
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler)
  },
});


Vue.component('EngineerSectionDocumentsContractor', {
  template: `<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="persones tone-500" text="Контрактор" class="padding-unset margin-top-bottom--8px">
        <button-sq :icon="loadingSome ? 'sync rotating' : 'sync'" :disabled="loadingSome" type="large" @click="getUserSettings"/>
      </title-main>
    </div>
    
    <div class="divider-line"/>
    
    <div class="padding-left-right-12px">
      <input-el label="Инженер ФИО (Исполнитель работ)" placeholder="Фамилия И. О." v-model="docData_engineerFIO" :disabled="loadingSome">
        <button-sq slot="postfix2" :icon="loadingSome ? 'loading rotating tone-500' : docData_engineerFIO_modifed ? 'purse' : 'purse tone-500'" @click="setUserSettings" :disabled="loadingSome || !docData_engineerFIO_modifed" type="large"/>
      </input-el>
      <input-el label="Ведущий инженер ФИО (Акт выдал)" placeholder="Фамилия И. О." v-model="docData_brigadirFIO" :disabled="loadingSome">
        <button-sq slot="postfix2" :icon="loadingSome ? 'loading rotating tone-500' : docData_brigadirFIO_modifed ? 'purse' : 'purse tone-500'" @click="setUserSettings" :disabled="loadingSome || !docData_brigadirFIO_modifed" type="large"/>
      </input-el>
    </div>
    
    <div v-if="setUserSettingsErrorMessage" class="padding-left-right-12px">
      <UIUserMessage :message="setUserSettingsErrorMessage" type="warning"/>
    </div>
    
    <div v-if="someContractorModifed" class="padding-left-right-12px">
      <UIUserMessage message="Изменения не сохранены" type="info"/>
    </div>
  </div>`,
  data: () => ({
    docData_engineerFIO_initial: '',
    docData_brigadirFIO_initial: '',
  }),
  mounted(){
    this.docData_engineerFIO_initial = this.docData_engineerFIO;
    this.docData_brigadirFIO_initial = this.docData_brigadirFIO;
  },
  watch: {
    'userSettings'(){
      this.docData_engineerFIO_initial = this.docData_engineerFIO;
      this.docData_brigadirFIO_initial = this.docData_brigadirFIO;
    },
    'someModifed'(someModifed){
      this.setSomeContractorModifed(someModifed)
    },
  },
  computed:{
    ...mapGetters('Engineer/SectionsL1/Documents',[
      'someContractorModifed',
    ]),
    ...mapGetters('Engineer/SectionsL1/Settings',[
      'userSettings',
      'setUserSettingsErrorMessage',
      'loadingSome',
      'getValue',
    ]),
    docData_engineerFIO: {
      get(){
        return this.getValue('docData_engineerFIO') || ''
      },
      set(docData_engineerFIO = ''){
        this.setValue({docData_engineerFIO})
      }
    },
    docData_brigadirFIO: {
      get(){
        return this.getValue('docData_brigadirFIO') || ''
      },
      set(docData_brigadirFIO = ''){
        this.setValue({docData_brigadirFIO})
      }
    },
    docData_engineerFIO_modifed(){return this.docData_engineerFIO_initial !== this.docData_engineerFIO},
    docData_brigadirFIO_modifed(){return this.docData_brigadirFIO_initial !== this.docData_brigadirFIO},
    someModifed(){
      return this.docData_engineerFIO_modifed || this.docData_brigadirFIO_modifed
    },
  },
  methods:{
    ...mapActions('Engineer/SectionsL1/Documents',[
      'setSomeContractorModifed',
    ]),
    ...mapActions('Engineer/SectionsL1/Settings',[
      'getUserSettings',
      'setUserSettings',
      'setValue',
    ]),
  },
  beforeDestroy(){
    if(this.someModifed){
      this.setUserSettings();
    }
  },
});
Vue.component('EngineerSectionDocuments', {
  template: `<div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px">
    <div class="padding-left-12px">
      <title-main icon="sms tone-500" text="Документы по нарядам" :textSub="tasksListDateText" textSubClass="font--13-500" class="padding-unset margin-top-bottom--8px">
        <template>
          <button-sq :disabled="tasksAssignmentsLoading" type="large" @click="$refs.CalendarDatePicker_modal.open()">
            <IconCalendar size="24" :color="tasksAssignmentsLoading ? 'grey' : 'lilac'"/>
          </button-sq>
          <button-sq :icon="tasksAssignmentsLoading ? 'sync rotating' : 'sync'" :disabled="tasksAssignmentsLoading" type="large" @click="getTasksAssignments"/>
        </template>
      </title-main>
    </div>
    <modal-container ref="CalendarDatePicker_modal" @close="getTasksAssignments">
      <CalendarDatePicker :initialDate="tasksListDate" @set:date="setTasksListDate" @close="$refs.CalendarDatePicker_modal.close()"/>
    </modal-container>
    
    <div class="divider-line"/>
    
    <loader-bootstrap v-if="tasksAssignmentsLoading && !tasksAssignments" text="наряды ..."/>
    
    <div v-else-if="tasksAssignmentsErrorMessage" class="padding-left-right-12px">
      <UIUserMessage :message="tasksAssignmentsErrorMessage" type="warning"/>
    </div>
    
    <div v-else-if="tasksAssignmentsCount" class="padding-left-right-12px display-flex flex-direction-column gap-8px">
      <div class="display-flex flex-direction-column border-1px-solid-c8c7c7 border-radius-4px">
        <div class="font--13-500 margin-left-8px">Фильтр по типам:</div>
        <div class="divider-line"/>
        <checkbox-el v-for="(value,taskType) in taskTypesFilter" :key="taskType" :checked="value" @change="setTaskTypeFilter([taskType, $event])" reverse class="margin-left-8px">
          <div slot="label" :class="{'tone-500 text-decoration-line-through' : !taskTypesFilter[taskType]}">{{taskType}}</div>
        </checkbox-el>
      </div>
      
      <div class="display-flex flex-direction-column border-1px-solid-c8c7c7 border-radius-4px">
        <div class="font--13-500 margin-left-8px">Фильтр по статусам:</div>
        <div class="divider-line"/>
        <checkbox-el v-for="(value,taskStatus) in taskStatusesFilter" :key="taskStatus" :checked="value" @change="setTaskStatusFilter([taskStatus, $event])" reverse class="margin-left-8px">
          <div slot="label" :class="{'tone-500 text-decoration-line-through' : !taskStatusesFilter[taskStatus]}">{{taskStatus}}</div>
        </checkbox-el>
      </div>
      
      <div class="font--13-500 text-align-center">Наряды: {{tasksAssignmentsFilteredCount}} {{tasksAssignmentsFilteredCount !== tasksAssignmentsCount ? ('из ' + tasksAssignmentsCount) : ''}}</div>
      
      <button-main label="Отправить себе" @click="generateDocuments" v-bind="{
        disabled: !tasksAssignmentsFilteredCount || generateDocumentsLoading || someContractorModifed,
        loading: generateDocumentsLoading
      }" buttonStyle="contained" size="full"/>
      
      <loader-bootstrap v-if="generateDocumentsLoading" text="отправка ..."/>
      
      <UIUserMessage v-else-if="generateDocumentsErrorMessage" :message="generateDocumentsErrorMessage" type="warning"/>
      
      <UIUserMessage v-else-if="generateDocumentsSuccessMessage" :message="generateDocumentsSuccessMessage" type="success"/>
    </div>
    
    <div v-else class="padding-left-right-12px">
      <UIUserMessage message="Нарядов нет" type="info"/>
    </div>
  </div>`,
  computed:{
    ...mapGetters('Engineer/SectionsL1/Documents',[
      'tasksListDate',
      'tasksAssignmentsLoading',
      'tasksAssignmentsErrorMessage',
      'tasksAssignments',
      'tasksAssignmentsCount',
      'someContractorModifed',
      'taskTypesFilter',
      'taskStatusesFilter',
      'tasksAssignmentsFiltered',
      'tasksAssignmentsFilteredCount',
      'generateDocumentsLoading',
      'generateDocumentsErrorMessage',
      'generateDocumentsSuccessMessage',
    ]),
    tasksListDateText(){return this.tasksListDate.toLocaleDateString()},
  },
  methods:{
    ...mapActions('Engineer/SectionsL1/Documents',[
      'setTasksListDate',
      'getTasksAssignments',
      'setTaskTypeFilter',
      'setTaskStatusFilter',
      'generateDocuments',
    ]),
  },
});




const Ping54InetcoreServiceSettings = new class extends RequestService {
  defaultHeaders={'7ozd7ruzzg0ikerc':'dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O'}
  defaultQueryParams={userLogin: store.getters.userLogin, regionID: store.getters.regionID}
  getUserSettings(){
    return this.get('wbYWLqwlzEs6YnTupX4rcRD7NilO4lHM62iuO0eBOJmruMsSj2DXopKqCBZJGSmd');
  }
  setUserSettings(settings = {}){
    return this.post('kPK2XxxzwBwhCZrXTxKBl4b2FiSu0h5O1daE3sZuJQiRk8UfrzQ6Vy5cVqjkHKgV', {
      userLogin: store.getters.userLogin,
      vars: settings
    });
  }
}('https://ping54.ru/inetcore');
const Ping54InetcoreServiceUserNotes = new class extends RequestService {
  defaultHeaders={'7ozd7ruzzg0ikerc':'dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O'}
  defaultQueryParams={userLogin: store.getters.userLogin, regionID: store.getters.regionID}
  getUserNotesPrivate(){
    return this.get('k395nz8nMm7qgKixDju0qTFul3KBLu2NZXUVZ6BN0LbOg1UUlojLFXiDNfBktz6I');
  }
  getUserNotesPublic(){
    return this.get('nc6ZnsJ2G3LtawdraQk3yXN7IDd3CuiAL7KGOU7rtuyxjDyTqIM4yuXEFh6Ru0cB');
  }
}('https://ping54.ru/inetcore');
const Ping54InetcoreServiceGenDoc = new class extends RequestService {
  defaultHeaders={'7ozd7ruzzg0ikerc':'dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O'}
  defaultQueryParams={userLogin: store.getters.userLogin, regionID: store.getters.regionID}
  generateDocuments(documents = []){
    return this.post('x8ygqD1JAJkDys7RDbRnmGCYCxpK5LSGS7Bc042rZzcD921hGq8Vk6UoNm9uvPNT', {
      userLogin: store.getters.userLogin,
      documents
    });
  }
}('https://ping54.ru/inetcore');

const _createSubModuleEngineer_Sections = function(modulePath, options = {}){
  const {state = {}, getters = {}, mutations = {}, actions = {}, modules = {}} = options;
  return STORE.createSubModule(modulePath, {
    modules,
    state: {
      ...state,
      _selectedSectionName: '',
      CONFIG_UILineScrollSelector: Object.freeze({
        idKey: 'sectionName',
        labelKey: 'sectionLabel',
        disabledKey: 'sectionDisabled',
        counterKey: 'sectionCounter',
      }),
    },
    getters: {
      ...getters,
      CONFIG_UILineScrollSelector: (state) => state.CONFIG_UILineScrollSelector,
      selectedSectionName: (state) => state._selectedSectionName,
      sections: (state, getters) => getters.$subModulesKeys.map((sectionName) => getters[atop(sectionName, 'section')]),
      selectedSection: (state, getters) => getters[atop(state._selectedSectionName, 'section')],
      selectedSectionComponents: (state, getters) => getters[atop(state._selectedSectionName, 'sectionComponents')],
    },
    mutations: {
      ...mutations,
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, dispatch}){
        
      },
      ...actions,
      selectSection({commit}, {sectionName = ''} = {}){
        commit('_setStateProp', {_selectedSectionName: sectionName || ''});
      },
    }
  })
};
const _createSubModuleEngineer_Section = function(modulePath, sectionName = '', options = {}){
  const {state = {}, getters = {}, mutations = {}, actions = {}, modules = {}} = options;
  return STORE.createSubModule(modulePath, {
    modules,
    state: {
      ...state,
      _sectionName: sectionName,
    },
    getters: {
      sectionLabel: (state) => state._sectionName,
      sectionDisabled: () => !0,
      sectionCounter: () => 0,
      sectionComponents: (state, getters) => [
        Vue.component(`EngineerSectionDefault`,{
          template:`<div transition-group-item class="display-contents">
            <div class="white-block-100 padding-top-bottom-8px display-flex flex-direction-column gap-8px height-100px" v-if="!0">
              <div class="padding-left-right-12px">
                <div class="font--13-500 tone-500 text-align-center">${state._sectionName}</div>
                <div class="font--12-400 tone-500 text-align-center">undefined sectionComponents</div>
              </div>
            </div>
          </div>`,
        }),
      ],
      ...getters,
      sectionName: (state) => state._sectionName,
      section: (state, getters) => ({
        sectionName: state._sectionName,
        sectionLabel: getters.sectionLabel || state._sectionName,
        sectionDisabled: getters.sectionDisabled,
        sectionCounter: getters.sectionCounter || 0,
      }),
    },
    mutations: {
      ...mutations,
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      ...actions,
    },
  })
};

const extendSubModuleEngineer_Section_as_L2_PrivateNotes = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Private', {
    state: {
      _userNotesPrivateLoading: !1,
      _userNotesPrivateErrorMessage: null,
      _userNotesPrivate: null,
      configuration: Object.freeze({
        CommentsListItems: Object.freeze({
          propsCommentsListItem: Object.freeze({
            textKey: 'text',
            authorKey: 'key',
            dateKey: 'createdAt',
            dateHandler: DATE.parseToDateTimeString,
          })
        }),
      }),
    },
    getters: {
      sectionLabel: () => 'Приватные',
      sectionDisabled: () => !1,
      sectionCounter: (state) => state._userNotesPrivate?.length || 0,
      sectionComponents: (state, getters) => [
        'EngineerSectionNotesPrivate'
      ],
      configuration: (state) => state.configuration,
      userNotesPrivateLoading: (state) => state._userNotesPrivateLoading,
      userNotesPrivateErrorMessage: (state) => state._userNotesPrivateErrorMessage,
      userNotesPrivate: (state) => state._userNotesPrivate,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, dispatch}){
        dispatch('getUserNotesPrivate');
      },
      async getUserNotesPrivate({commit}){
        commit('_setStateProp', {_userNotesPrivateLoading: !0});
        commit('_setStateProp', {_userNotesPrivate: null});
        commit('_setStateProp', {_userNotesPrivateErrorMessage: null});
        try{
          const response = await Ping54InetcoreServiceUserNotes.getUserNotesPrivate();
          if(response && !response.error && Array.isArray(response)){
            commit('_setStateProp', {_userNotesPrivate: response});
          }else{
            commit('_setStateProp', {_userNotesPrivateErrorMessage: [
              'Ошибка получения комментариев',
              'Error: unknown',
            ]});
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_userNotesPrivateErrorMessage: [
            'Ошибка получения комментариев',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_userNotesPrivateLoading: !1});
      },
    },
  })
};
const extendSubModuleEngineer_Section_as_L2_PublicNotes = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Public', {
    state: {
      _userNotesPublicLoading: !1,
      _userNotesPublicErrorMessage: null,
      _userNotesPublic: null,
      configuration: Object.freeze({
        CommentsListItems: Object.freeze({
          propsCommentsListItem: Object.freeze({
            textKey: 'text',
            authorKey: 'key',
            dateKey: 'createdAt',
            dateHandler: DATE.parseToDateTimeString,
          })
        }),
      }),
    },
    getters: {
      sectionLabel: () => 'Публичные',
      sectionDisabled: () => !1,
      sectionCounter: (state) => state._userNotesPublic?.length || 0,
      sectionComponents: (state, getters) => [
        'EngineerSectionNotesPublic'
      ],
      configuration: (state) => state.configuration,
      userNotesPublicLoading: (state) => state._userNotesPublicLoading,
      userNotesPublicErrorMessage: (state) => state._userNotesPublicErrorMessage,
      userNotesPublic: (state) => state._userNotesPublic,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, dispatch}){
        /*dispatch('$addSubModule', _createSubModuleEngineer_Sections([state.$modulePath, 'SectionsL3'], {
          actions: {
            async $initModule({state, dispatch}){
              dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L3_test1([state.$modulePath, 'test1']));
              dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L3_test2([state.$modulePath, 'test2']));
            },
          }
        }));*/
        dispatch('getUserNotesPublic');
      },
      async getUserNotesPublic({commit}){
        commit('_setStateProp', {_userNotesPublicLoading: !0});
        commit('_setStateProp', {_userNotesPublic: null});
        commit('_setStateProp', {_userNotesPublicErrorMessage: null});
        try{
          const response = await Ping54InetcoreServiceUserNotes.getUserNotesPublic();
          if(response && !response.error && Array.isArray(response)){
            commit('_setStateProp', {_userNotesPublic: response});
          }else{
            commit('_setStateProp', {_userNotesPublicErrorMessage: [
              'Ошибка получения комментариев',
              'Error: unknown',
            ]});
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_userNotesPublicErrorMessage: [
            'Ошибка получения комментариев',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_userNotesPublicLoading: !1});
      },
    },
  })
};

const extendSubModuleEngineer_Section_as_L1_Bookmarks = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Bookmarks', {
    state: {
      _userBookmarksLoading: !1,
      _userBookmarksErrorMessage: null,
      _userBookmarks: null,
      _bookmarksProps: {},
      _groupDeleteMode: !1,
      _deleteSelectedGroupLoading: !1,
      _deleteSelectedGroupErrorMessage: null,
      _currentBookmarkID: '',
      _createBookmarkLoading: !1,
      _createBookmarkErrorMessage: null,
      _createBookmarkSuccessMessage: null,
    },
    getters: {
      sectionLabel: () => 'Закладки',
      sectionDisabled: () => !1,
      sectionCounter: (state) => state._userBookmarks?.length || 0,
      sectionComponents: (state) => [
        'EngineerSectionBookmarks',
        ...state._userBookmarks?.length ? [
          'EngineerSectionBookmarksScroller'
        ] : []
      ],
      userBookmarksLoading: (state) => state._userBookmarksLoading,
      userBookmarksErrorMessage: (state) => state._userBookmarksErrorMessage,
      userBookmarks: (state) => state._userBookmarks,
      userBookmarksCount: (state) => state._userBookmarks?.length || 0,
      getBookmarkProp: (state) => (favorite_id, propName) => state._bookmarksProps[favorite_id]?.[propName],
      groupDeleteMode: (state) => state._groupDeleteMode,
      markedToDeleteCount: (state) => Object.values(state._bookmarksProps).filter(({markToDelete})=>!!markToDelete).length,
      deleteSelectedGroupLoading: (state) => state._deleteSelectedGroupLoading,
      deleteSelectedGroupErrorMessage: (state) => state._deleteSelectedGroupErrorMessage,
      loadingSome: (state) => [
        state._userBookmarksLoading,
        state._deleteSelectedGroupLoading,
        state._createBookmarkLoading,
      ].some(Boolean),
      currentBookmarkID: (state) => state._currentBookmarkID,
      findBookmark: (state) => (objectID) => state._userBookmarks?.find(({object_id}) => object_id == objectID),
      createBookmarkLoading: (state) => state._createBookmarkLoading,
      createBookmarkErrorMessage: (state) => state._createBookmarkErrorMessage,
      createBookmarkSuccessMessage: (state) => state._createBookmarkSuccessMessage,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
      _setBookmarkProp: STORE.mutations.setStatePathProp('_bookmarksProps'),
    },
    actions: {
      async $initModule({state, dispatch}){
        dispatch('getUserBookmarks', !0);
      },
      async getUserBookmarks({commit, state, dispatch}, fullUpdate = !1){
        commit('_setStateProp', {_userBookmarksLoading: !0});
        if(fullUpdate){
          commit('_setStateProp', {_userBookmarks: null});
        };
        commit('_setStateProp', {_userBookmarksErrorMessage: null});
        try{
          const response = await Favorite.getFavoritesList();
          if(Array.isArray(response?.data)){
            const sorted = response.data.map(item => objectKeysToLowerCase(item)).sort((a, b)=>{
              const date_a = Math.max(new Date(a.create_date), new Date(a.last_click_date));
              const date_b = Math.max(new Date(b.create_date), new Date(b.last_click_date));
              return date_b - date_a
            });
            commit('_setStateProp', {_userBookmarks: sorted});
          }else{
            commit('_setStateProp', {_userBookmarksErrorMessage: [
              'Ошибка получения закладок',
              response?.message || 'Error: unknown',
            ]});
          }
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_userBookmarksErrorMessage: [
            'Ошибка получения закладок',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_userBookmarksLoading: !1});
      },
      setBookmarkProp({state, commit, dispatch, getters}, _prop = []){
        const [favorite_id, prop] = STORE.propToKeyValue(_prop);
        const [propName, value] = STORE.propToKeyValue(prop);
        if(!state._bookmarksProps[favorite_id]){
          commit('_setBookmarkProp', [favorite_id, {}]);
        };
        commit('_setBookmarkProp', [atod(favorite_id, propName), value]);
      },
      setGroupDeleteMode({state, commit}, _groupDeleteMode = !1){
        commit('_setStateProp', {_groupDeleteMode: !!_groupDeleteMode});
        if(!_groupDeleteMode){
          for(const favorite_id in state._bookmarksProps){
            commit('_setBookmarkProp', [atod(favorite_id, 'markToDelete'), !1]);
          }
        }
      },
      async deleteSelectedGroup({commit, state, dispatch}){
        commit('_setStateProp', {_deleteSelectedGroupLoading: !0});
        commit('_setStateProp', {_deleteSelectedGroupErrorMessage: null});
        try{
          await Promise.allSettled(Object.entries(state._bookmarksProps).filter(([favorite_id, {markToDelete}]) => !!markToDelete).map(([favorite_id]) => Favorite.delFavorite(favorite_id)));
          dispatch('setGroupDeleteMode', !1);
          dispatch('getUserBookmarks');
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_deleteSelectedGroupErrorMessage: [
            'Ошибка удаления закладок',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_deleteSelectedGroupLoading: !1});
      },
      setCurrentBookmarkID({state, commit, dispatch}, _currentBookmarkID){
        commit('_setStateProp', {_currentBookmarkID});
        dispatch('Bookmark/setBookmark', state._userBookmarks?.find(({favorite_id}) => favorite_id == _currentBookmarkID));
      },
      async createBookmark({state, commit, dispatch, getters}, [objectType, objectID, objectName, url, comment] = []){
        commit('_setStateProp', {_createBookmarkLoading: !0});
        commit('_setStateProp', {_createBookmarkErrorMessage: null});
        commit('_setStateProp', {_createBookmarkSuccessMessage: null});
        try{
          const response = await Favorite.addFavorite(objectType, objectID, objectName, url, comment);
          if(response?.data == 'OK'){
            commit('_setStateProp', {_createBookmarkSuccessMessage: [
              'сохранено',
            ]});
            dispatch('getUserBookmarks');
          }else{
            commit('_setStateProp', {_createBookmarkErrorMessage: [
              'Ошибка сохранения',
              response?.message || 'Error: unknown',
            ]});
          }
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_createBookmarkErrorMessage: [
            'Ошибка сохранения',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_createBookmarkLoading: !1});
      },
      async clickBookmark({state, commit, dispatch, getters}, bookmarkID){
        if(!bookmarkID){return};
        try{
          const response = await Favorite.clickFavorite(bookmarkID);
        }catch(error){
          console.warn(error);
        };
      },
    },
    modules: {
      Bookmark: {
        namespaced: !0,
        state: () => ({
          _bookmark: null,
          _deleteBookmarkLoading: !1,
          _deleteBookmarkErrorMessage: null,
          _deleteBookmarkSuccessMessage: null,
          _changeBookmarkCommentLoading: !1,
          _changeBookmarkCommentErrorMessage: null,
          _changeBookmarkCommentSuccessMessage: null,
          _description: '',
        }),
        getters: {
          bookmark: (state) => state._bookmark,
          bookmarkID: (state) => state._bookmark?.favorite_id,
          changeBookmarkCommentLoading: (state) => state._changeBookmarkCommentLoading,
          changeBookmarkCommentErrorMessage: (state) => state._changeBookmarkCommentErrorMessage,
          changeBookmarkCommentSuccessMessage: (state) => state._changeBookmarkCommentSuccessMessage,
          deleteBookmarkLoading: (state) => state._deleteBookmarkLoading,
          deleteBookmarkErrorMessage: (state) => state._deleteBookmarkErrorMessage,
          deleteBookmarkSuccessMessage: (state) => state._deleteBookmarkSuccessMessage,
          description: (state) => state._description,
        },
        mutations: {
          _setStateProp: STORE.mutations.setStateProp,
        },
        actions: {
          setBookmark({state, commit, getters}, _bookmark = null){
            if(!_bookmark || _bookmark?.favorite_id != getters.bookmarkID){
              commit('_setStateProp', {_deleteBookmarkLoading: !1});
              commit('_setStateProp', {_deleteBookmarkErrorMessage: null});
              commit('_setStateProp', {_deleteBookmarkSuccessMessage: null});
              commit('_setStateProp', {_changeBookmarkCommentLoading: !1});
              commit('_setStateProp', {_changeBookmarkCommentErrorMessage: null});
              commit('_setStateProp', {_changeBookmarkCommentSuccessMessage: null});
              commit('_setStateProp', {_description: ''});
            };
            commit('_setStateProp', {_bookmark});
            commit('_setStateProp', {_description: _bookmark?.description || ''});
          },
          async deleteBookmark({commit, state, getters, dispatch}){
            commit('_setStateProp', {_deleteBookmarkLoading: !0});
            commit('_setStateProp', {_deleteBookmarkErrorMessage: null});
            commit('_setStateProp', {_deleteBookmarkSuccessMessage: null});
            try{
              const response = await Favorite.delFavorite(getters.bookmarkID);
              if(response?.data == 'OK'){
                commit('_setStateProp', {_deleteBookmarkSuccessMessage: [
                  'удалено',
                ]});
              }else{
                commit('_setStateProp', {_deleteBookmarkErrorMessage: [
                  'Ошибка удаления',
                  response?.message || 'Error: unknown',
                ]});
              }
            }catch(error){
              console.warn(error);
              commit('_setStateProp', {_deleteBookmarkErrorMessage: [
                'Ошибка удаления',
                'Error: unexpected',
                error.stack
              ]});
            };
            commit('_setStateProp', {_deleteBookmarkLoading: !1});
          },
          async changeBookmarkComment({commit, state, getters, dispatch}){
            commit('_setStateProp', {_changeBookmarkCommentLoading: !0});
            commit('_setStateProp', {_changeBookmarkCommentErrorMessage: null});
            commit('_setStateProp', {_changeBookmarkCommentSuccessMessage: null});
            try{
              const response = await Favorite.changeFavoriteComment(getters.bookmarkID, getters.description);
              if(response?.data == 'OK'){
                commit('_setStateProp', {_changeBookmarkCommentSuccessMessage: [
                  'сохранено',
                ]});
              }else{
                commit('_setStateProp', {_changeBookmarkCommentErrorMessage: [
                  'Ошибка сохранения',
                  response?.message || 'Error: unknown',
                ]});
              }
            }catch(error){
              console.warn(error);
              commit('_setStateProp', {_changeBookmarkCommentErrorMessage: [
                'Ошибка сохранения',
                'Error: unexpected',
                error.stack
              ]});
            };
            commit('_setStateProp', {_changeBookmarkCommentLoading: !1});
          },
          setDescription({state, commit}, _description = ''){
            commit('_setStateProp', {_description});
          },
        },
      }
    }
  })
};
const extendSubModuleEngineer_Section_as_L1_Notes = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Notes', {
    state: {
      
    },
    getters: {
      sectionLabel: () => 'Комментарии',
      sectionDisabled: () => !1,
      sectionCounter: (state, getters) => getters['SectionsL2/Private/sectionCounter'] +  getters['SectionsL2/Public/sectionCounter'],
      sectionComponents: (state, getters) => [
        //'EngineerSectionNotes'
      ],
      loadingSomeNotes: (state, getters) => [
        getters['SectionsL2/Private/userNotesPrivateLoading'],
        getters['SectionsL2/Public/userNotesPublicLoading']
      ].some(Boolean)
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, dispatch}){
        dispatch('$addSubModule', _createSubModuleEngineer_Sections([state.$modulePath, 'SectionsL2'], {
          actions: {
            async $initModule({state, dispatch}){
              dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L2_PrivateNotes([state.$modulePath, 'Private']));
              dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L2_PublicNotes([state.$modulePath, 'Public']));
            },
          }
        }));
      },
      async getUserNotes({state, dispatch}){
        await Promise.allSettled([
          dispatch('SectionsL2/Private/getUserNotesPrivate'),
          dispatch('SectionsL2/Private/getUserNotesPublic'),
        ])
      }
    },
  })
};
const extendSubModuleEngineer_Section_as_L1_Documents = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Documents', {
    state: {
      _someContractorModifed: !1,
      _tasksListDate:new Date(),
      _tasksAssignmentsLoading: !1,
      _tasksAssignmentsErrorMessage: null,
      _tasksAssignments: null,
      _taskTypesFilter: {},
      _taskStatusesFilter: {},
      _generateDocumentsLoading: !1,
      _generateDocumentsErrorMessage: null,
      _generateDocumentsSuccessMessage: null,
    },
    getters: {
      sectionLabel: () => 'Документы',
      sectionDisabled: () => !1,
      sectionCounter: (state, getters) => getters.tasksAssignmentsCount,
      sectionComponents: (state, getters) => [
        'EngineerSectionDocumentsContractor',
        'EngineerSectionDocuments',
      ],
      someContractorModifed: (state) => state._someContractorModifed,
      tasksListDate: (state) => state._tasksListDate,
      tasksAssignmentsLoading: (state) => state._tasksAssignmentsLoading,
      tasksAssignmentsErrorMessage: (state) => state._tasksAssignmentsErrorMessage,
      tasksAssignments: (state) => state._tasksAssignments,
      tasksAssignmentsCount: (state) => state._tasksAssignments?.length || 0,
      tasksAssignmentsFiltered: (state, getters) => {
        if(!state._tasksAssignments?.length){return []};
        const taskTypes = Object.entries(state._taskTypesFilter).filter(([,en]) => en).map(([key]) => key);
        const taskStatuses = Object.entries(state._taskStatusesFilter).filter(([,en]) => en).map(([key]) => key);
        return state._tasksAssignments.filter(({taskInfo: {taskType: {name}}})=>{
          return taskTypes.includes(name);
        }).filter(({taskInfo: {taskStatus: {name}}})=>{
          return taskStatuses.includes(name);
        });
      },
      tasksAssignmentsFilteredCount: (state, getters) => getters.tasksAssignmentsFiltered.length,
      taskTypesFilter: (state) => state._taskTypesFilter,
      taskStatusesFilter: (state) => state._taskStatusesFilter,
      generateDocumentsLoading: (state) => state._generateDocumentsLoading,
      generateDocumentsErrorMessage: (state) => state._generateDocumentsErrorMessage,
      generateDocumentsSuccessMessage: (state) => state._generateDocumentsSuccessMessage,
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
      _setTaskTypeProp: STORE.mutations.setStatePathProp('_taskTypesFilter'),
      _setTaskStatusProp: STORE.mutations.setStatePathProp('_taskStatusesFilter'),
    },
    actions: {
      async $initModule({state, dispatch}){
        
      },
      setSomeContractorModifed({commit}, _someContractorModifed = !1){
        commit('_setStateProp', {_someContractorModifed});
      },
      async setTasksListDate({commit}, _tasksListDate){
        commit('_setStateProp', {_tasksListDate});
      },
      async getTasksAssignments({state, rootGetters, commit, dispatch, getters}){
        const dates = WFM.periodFromDate(getters.tasksListDate);
        commit('_setStateProp', {_tasksAssignmentsLoading: !0});
        commit('_setStateProp', {_tasksAssignments: null});
        commit('_setStateProp', {_tasksAssignmentsErrorMessage: null});
        dispatch('_initFilter');
        try{
          const response = await WFMService.getEngineerTasks(rootGetters.userLogin, dates.periodStart, dates.periodFinish);
          if(Array.isArray(response?.data?.taskAssignments)){
            const TASK_STATUSES_ALLOW_VISIBLE=[/*124153857, */124153858, 124153859, 124153860, 124153861, 124153862, 124153863];
            const taskAssignmentsFiltered = response.data.taskAssignments.filter(({taskInfo: {taskStatus: {id} = {}} = {}}) => TASK_STATUSES_ALLOW_VISIBLE.includes(+id));
            commit('_setStateProp', {_tasksAssignments: taskAssignmentsFiltered});
            dispatch('_initFilter');
          }else{
            if(response?.data?.fault){
              commit('_setStateProp', {_tasksAssignmentsErrorMessage: [
                'Ошибка получения нарядов (dcgw)',
                '',
                response.data.fault.description || 'Error: unknown',
              ]});
            }else if(response?.data?.message){
              commit('_setStateProp', {_tasksAssignmentsErrorMessage: [
                'Ошибка получения нарядов',
                response.data.message || 'Error: unknown',
                response.data.reason,
                response.data.traceId,
              ]});
            }else{
              commit('_setStateProp', {_tasksAssignmentsErrorMessage: [
                'Ошибка получения нарядов',
                'unknown',
                response?.text || 'Error: unknown',
              ]});
            };
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_tasksAssignmentsErrorMessage: [
            'Ошибка получения нарядов',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_tasksAssignmentsLoading: !1});
      },
      _initFilter({state, commit}){
        const {_taskTypesFilter, _taskStatusesFilter} = (state._tasksAssignments || []).reduce((filters, tasksAssignment) => {
          const {taskInfo} = tasksAssignment;
          const {taskType, taskStatus} = taskInfo;
          filters._taskTypesFilter[taskType.name] = !0;
          filters._taskStatusesFilter[taskStatus.name] = !0;
          return filters
        }, {
          _taskTypesFilter: {},
          _taskStatusesFilter: {},
        });
        commit('_setStateProp', {_taskTypesFilter});
        commit('_setStateProp', {_taskStatusesFilter});
      },
      setTaskTypeFilter({commit}, prop = []){
        commit('_setTaskTypeProp', prop);
      },
      setTaskStatusFilter({commit}, prop = []){
        commit('_setTaskStatusProp', prop);
      },
      async generateDocuments({state, rootGetters, commit, dispatch, getters}){
        commit('_setStateProp', {_generateDocumentsLoading: !0});
        commit('_setStateProp', {_generateDocumentsErrorMessage: null});
        commit('_setStateProp', {_generateDocumentsSuccessMessage: null});
        try{
          const documents = getters.tasksAssignmentsFiltered.map(tasksAssignment=>({
            templateID: 'f8707f49-3533-4733-bea7-8bafdf0977dc',
            tasksAssignment
          }))
          const response = await Ping54InetcoreServiceGenDoc.generateDocuments(documents);
          if(response?.success && response?.data?.success){
            commit('_setStateProp', {_generateDocumentsSuccessMessage: [
              `документы отправлены на ${rootGetters.userLogin}@mts.ru`,
            ]});
          }else{
            if(response?.data?.error){
              commit('_setStateProp', {_generateDocumentsErrorMessage: [
                'ошибка сервиса gendoc',
                'Error: unknown',
                'service2'
              ]});
            }else if(response?.error){
              commit('_setStateProp', {_generateDocumentsErrorMessage: [
                'ошибка сервиса gendoc',
                'Error: unknown',
                'proxy2',
              ]});
            }else{
              commit('_setStateProp', {_generateDocumentsErrorMessage: [
                'ошибка сервиса gendoc',
                'Error: unknown',
              ]});
            }
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_generateDocumentsErrorMessage: [
            'ошибка сервиса gendoc',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_generateDocumentsLoading: !1});
      },
    },
  })
};
const extendSubModuleEngineer_Section_as_L1_Tools = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Tools', {
    state: {
      
    },
    getters: {
      sectionLabel: () => 'Инструменты',
      sectionDisabled: () => !1,
      /*sectionComponents: (state, getters) => [
        
      ],*/
    },
    mutations: {
      
    },
    actions: {
      async $initModule({state, dispatch}){
        
      },
    },
  })
};
const extendSubModuleEngineer_Section_as_L1_Messages = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Messages', {
    state: {
      
    },
    getters: {
      sectionLabel: () => 'Сообщения',
      sectionDisabled: () => !0,
      sectionCounter: () => 14,
      /*sectionComponents: (state, getters) => [
        
      ],*/
    },
    mutations: {
      
    },
    actions: {
      async $initModule({state, dispatch}){
        
      },
    },
  })
};
const extendSubModuleEngineer_Section_as_L1_Settings = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Settings', {
    state: {
      _userSettingsLoading: !1,
      _userSettingsErrorMessage: null,
      _userSettings: null,
      _setUserSettingsLoading: !1,
      _setUserSettingsErrorMessage: null,
    },
    getters: {
      sectionLabel: () => 'Настройки',
      sectionDisabled: () => !0,
      sectionCounter: (state, getters) => Object.keys(getters.userSettings).length,
      /*sectionComponents: (state, getters) => [
        
      ],*/
      userSettingsLoading: (state) => state._userSettingsLoading,
      userSettingsErrorMessage: (state) => state._userSettingsErrorMessage,
      userSettings: (state) => state._userSettings || {},
      findSettings: (state) => (keys) => filterKeys(state._userSettings, keys),
      setUserSettingsLoading: (state) => state._setUserSettingsLoading,
      setUserSettingsErrorMessage: (state) => state._setUserSettingsErrorMessage,
      loadingSome: (state) => [
        state._userSettingsLoading,
        state._setUserSettingsLoading,,
      ].some(Boolean),
      getValue: (state) => (key) => state._userSettings?.[key],
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
      _setSettingsProp: STORE.mutations.setStatePathProp('_userSettings'),
    },
    actions: {
      async $initModule({state, dispatch}){
        dispatch('getUserSettings');
      },
      async getUserSettings({commit}){
        commit('_setStateProp', {_userSettingsLoading: !0});
        commit('_setStateProp', {_userSettingsErrorMessage: null});
        try{
          const response = await Ping54InetcoreServiceSettings.getUserSettings();
          if(response && !response.error){
            commit('_setStateProp', {_userSettings: response});
          }else{
            commit('_setStateProp', {_userSettingsErrorMessage: [
              'Ошибка получения конфигурации',
              'Error: unknown',
            ]});
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_userSettingsErrorMessage: [
            'Ошибка получения конфигурации',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_userSettingsLoading: !1});
      },
      async setUserSettings({commit, getters, dispatch, state}){
        commit('_setStateProp', {_setUserSettingsLoading: !0});
        commit('_setStateProp', {_setUserSettingsErrorMessage: null});
        try{
          const response = await Ping54InetcoreServiceSettings.setUserSettings(getters.userSettings);
          if(response && !response.error){
            dispatch('getUserSettings');
            /*if(response.result && response.success){// props in result only from request
              const _userSettings = Object.values(response.result).reduce((settings, {key, value}) => Object.assign(settings, {[key]: value}), {});
              commit('_setStateProp', {_userSettings});
            };*/
          }else{
            commit('_setStateProp', {_setUserSettingsErrorMessage: [
              'Ошибка сохранения конфигурации',
              'Error: unknown',
            ]});
          };
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_setUserSettingsErrorMessage: [
            'Ошибка сохранения конфигурации',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_setUserSettingsLoading: !1});
      },
      setValue({commit}, prop = []){
        commit('_setSettingsProp', prop);
      }
    },
  })
};
const extendSubModuleEngineer_Section_as_L1_Profile = function(modulePath){
  return _createSubModuleEngineer_Section(modulePath, 'Profile', {
    state: {
      _userProfileLoading: !1,
      _userProfileErrorMessage: null,
      _userProfile: null,
    },
    getters: {
      sectionLabel: () => 'Профиль',
      sectionDisabled: () => !1,
      sectionComponents: (state, getters) => [
        'EngineerSectionProfile'
      ],
      userProfileLoading: (state) => state._userProfileLoading,
      userProfileErrorMessage: (state) => state._userProfileErrorMessage,
      
      userProfile: (state) => state._userProfile,
      userLogin: STORE.getters.getStateProp('_userProfile.userLogin', CAST.toEmptyString),
      fullName: STORE.getters.getStateProp('_userProfile.fullName', CAST.toEmptyString),
      displayName: STORE.getters.getStateProp('_userProfile.displayName', CAST.toEmptyString),
      post: STORE.getters.getStateProp('_userProfile.post', CAST.toEmptyString),
      department: STORE.getters.getStateProp('_userProfile.department', CAST.toEmptyString),
      company: STORE.getters.getStateProp('_userProfile.company', CAST.toEmptyString),
      mobile: STORE.getters.getStateProp('_userProfile.mobile', CAST.toEmptyString),
      photo: STORE.getters.getStateProp('_userProfile.photo', CAST.toEmptyString),
      birthday: STORE.getters.getStateProp('_userProfile.birthday', CAST.toEmptyString),
      
      managerProfile: (state) => state._userProfile?.manager,
      manager_fullName: STORE.getters.getStateProp('_userProfile.manager.fullName', CAST.toEmptyString),
      manager_displayName: STORE.getters.getStateProp('_userProfile.manager.displayName', CAST.toEmptyString),
      manager_post: STORE.getters.getStateProp('_userProfile.manager.post', CAST.toEmptyString),
      manager_department: STORE.getters.getStateProp('_userProfile.manager.department', CAST.toEmptyString),
      manager_company: STORE.getters.getStateProp('_userProfile.manager.company', CAST.toEmptyString),
      manager_mobile: STORE.getters.getStateProp('_userProfile.manager.mobile', CAST.toEmptyString),
      
    },
    mutations: {
      _setStateProp: STORE.mutations.setStateProp,
    },
    actions: {
      async $initModule({state, dispatch}){
        dispatch('getUserProfile');
      },
      async getUserProfile({commit, rootGetters}){
        commit('_setStateProp', {_userProfileLoading: !0});
        commit('_setStateProp', {_userProfile: null});
        commit('_setStateProp', {_userProfileErrorMessage: null});
        try{
          const response = await MainService.LDAPUser.useCache(rootGetters.userLogin);
          if(response?.data?.userLogin){
            commit('_setStateProp', {_userProfile: response.data});
          }else{
            commit('_setStateProp', {_userProfileErrorMessage: [
              'Ошибка поиска профиля',
              response?.message || 'Error: unknown',
              //response?.text
            ]});
          }
        }catch(error){
          console.warn(error);
          commit('_setStateProp', {_userProfileErrorMessage: [
            'Ошибка поиска профиля',
            'Error: unexpected',
            error.stack
          ]});
        };
        commit('_setStateProp', {_userProfileLoading: !1});
      },
    },
  })
};

STORE.createSubModule('Engineer', {
  state: {
    
  },
  getters: {
    
  },
  mutations: {
    
  },
  actions: {
    async $initModule({state, dispatch}){
      dispatch('$addSubModule', _createSubModuleEngineer_Sections([state.$modulePath, 'SectionsL1'], {
        actions: {
          async $initModule({state, dispatch}){
            dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L1_Bookmarks([state.$modulePath, 'Bookmarks']));
            dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L1_Notes([state.$modulePath, 'Notes']));
            dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L1_Documents([state.$modulePath, 'Documents']));
            //dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L1_Tools([state.$modulePath, 'Tools']));
            //dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L1_Messages([state.$modulePath, 'Messages']));
            dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L1_Settings([state.$modulePath, 'Settings']));
            dispatch('$addSubModule', extendSubModuleEngineer_Section_as_L1_Profile([state.$modulePath, 'Profile']));
          },
        }
      }));
    },
  }
}).register();





Vue.component('EngineerPage', {
  template: `<div class="display-flex flex-direction-column gap-8px padding-bottom-100px">
    <router-view name="navbar"/>
    <transition name="slide-page" mode="out-in">
      <router-view name="content"/>
    </transition>
  </div>`,
});
Vue.component('EngineerPageNavbar', {
  template: `<div class="display-flex flex-direction-column gap-8px">
    <PageNavbar title="Разное">
      <template slot="btn-right">
        <button-sq disabled type="large">
          <IcIcon name="info" color="#918F8F" size="24"/>
        </button-sq>
      </template>
    </PageNavbar>
  </div>`,
});
Vue.component('EngineerPageContent', {
  template: `<div class="display-flex flex-direction-column gap-4px">
    <div class="white-block-100" v-if="sectionsL1?.length">
      <UILineScrollSelector v-bind="{
        ...CONFIG_UILineScrollSelector,
        selectedItem: selectedSectionL1,
        items: sectionsL1,
      }" v-on="{
        onSelect: ($event) => $router.replace({
          ...$route,
          name: 'R_Engineer_SectionL1',
          params: {
            ...$route.params,
            sectionL1Name: $event.sectionName
          },
        })
      }" hideZeroCounter/>
    </div>
    
    <transition name="slide-page" mode="out-in">
      <router-view/>
    </transition>
  </div>`,
  beforeRouteEnter(to, from, next){
    next((vm) => {
      vm.guardL1(to, from, next)
    })
  },
  beforeRouteUpdate(to, from, next){
    this.guardL1(to, from, next)
  },
  beforeRouteLeave(to, from, next){
    next();
  },
  methods: {
    guardL1(to, from, next){
      const sectionsL1 = store.getters['Engineer/SectionsL1/$subModulesKeys'];
      const sectionL1Name = sectionsL1[0];
      if(!to.params.sectionL1Name){
        console.log('!sectionL1Name');
        return next({
          ...to,
          name: 'R_Engineer_SectionL1',
          params: {
            sectionL1Name
          },
        })
      }else if(!sectionsL1.includes(to.params.sectionL1Name)){
        console.log('?sectionL1Name',to.params.sectionL1Name);
        return next({
          ...to,
          name: 'R_Engineer_SectionL1',
          params: {
            sectionL1Name
          },
        })
      }else if(store.getters[atop('Engineer/SectionsL1',to.params.sectionL1Name,'sectionDisabled')] && to.params.sectionL1Name !== sectionL1Name){
        console.log('sectionL1Disabled',to.params.sectionL1Name);
        return next({
          ...to,
          name: 'R_Engineer_SectionL1',
          params: {
            sectionL1Name
          },
        });
      };
      store.dispatch('Engineer/SectionsL1/selectSection',{sectionName: to.params.sectionL1Name});
      next();
    }
  },
  computed:mapGetters('Engineer/SectionsL1',{
    sectionsL1: 'sections',
    selectedSectionL1: 'selectedSection',
    CONFIG_UILineScrollSelector: 'CONFIG_UILineScrollSelector',
  }),
});
Vue.component('EngineerSectionL1Content', {
  beforeCreate(){
    this.$mapDynamicNamespaceGetters('Engineer/SectionsL1/:selectedSectionL1Name/SectionsL2', {
      sectionsL2: 'sections',
      selectedSectionL2: 'selectedSection',
      CONFIG_UILineScrollSelector: 'CONFIG_UILineScrollSelector',
    });
  },
  template: `<div class="display-flex flex-direction-column gap-4px">
    <transition-group v-if="selectedSectionL1Components?.length" name="slide-page" tag="div" transition-group class="display-flex flex-direction-column gap-8px">
      <component v-for="(component, index) of selectedSectionL1Components" :key="index" :is="component"/>
    </transition-group>
    
    <div class="white-block-100" v-if="sectionsL2?.length">
      <UILineScrollSelector v-bind="{
        ...CONFIG_UILineScrollSelector,
        selectedItem: selectedSectionL2,
        items: sectionsL2,
      }" v-on="{
        onSelect: ($event) => $router.replace({
          ...$route,
          name: 'R_Engineer_SectionL2',
          params: {
            ...$route.params,
            sectionL2Name: $event.sectionName
          },
        })
      }" hideZeroCounter/>
    </div>
    
    <transition name="slide-page" mode="out-in">
      <router-view/>
    </transition>
  </div>`,
  beforeRouteEnter(to, from, next){
    next((vm) => {
      vm.guardL2(to, from, next)
    })
  },
  beforeRouteUpdate(to, from, next){
    this.guardL2(to, from, next)
  },
  beforeRouteLeave(to, from, next){
    next();
  },
  methods: {
    guardL2(to, from, next){
      const sectionsL2 = store.getters[atop('Engineer/SectionsL1',to.params.sectionL1Name,'SectionsL2/$subModulesKeys')];
      if(!sectionsL2?.length){
        console.log('!sectionsL2');
        return next();
      };
      const sectionL2Name = sectionsL2[0];
      if(!to.params.sectionL2Name){
        console.log('!sectionL2Name');
        return next({
          ...to,
          name: 'R_Engineer_SectionL2',
          params: {
            sectionL1Name: to.params.sectionL1Name,
            sectionL2Name
          },
        })
      }else if(!sectionsL2.includes(to.params.sectionL2Name)){
        console.log('?sectionL2Name',to.params.sectionL2Name);
        return next({
          ...to,
          name: 'R_Engineer_SectionL1',
          params: {
            sectionL1Name: to.params.sectionL1Name,
          },
        })
      }else if(store.getters[atop('Engineer/SectionsL1',to.params.sectionL1Name,'SectionsL2',to.params.sectionL2Name,'sectionDisabled')] && to.params.sectionL2Name !== sectionL2Name){
        console.log('sectionL2Disabled',to.params.sectionL2Name);
        return next({
          ...to,
          name: 'R_Engineer_SectionL1',
          params: {
            sectionL1Name: to.params.sectionL1Name,
          },
        })
      };
      store.dispatch(atop('Engineer/SectionsL1',to.params.sectionL1Name,'SectionsL2/selectSection'),{sectionName: to.params.sectionL2Name});
      next();
    }
  },
  computed:mapGetters('Engineer/SectionsL1',{
    selectedSectionL1Name: 'selectedSectionName',
    selectedSectionL1Components: 'selectedSectionComponents',
  }),
});
Vue.component('EngineerSectionL2Content', {
  beforeCreate(){
    this.$mapDynamicNamespaceGetters('Engineer/SectionsL1/:selectedSectionL1Name/SectionsL2', {
      selectedSectionL2Name: 'selectedSectionName',
      selectedSectionL2Components: 'selectedSectionComponents',
    });
    this.$mapDynamicNamespaceGetters('Engineer/SectionsL1/:selectedSectionL1Name/SectionsL2/:selectedSectionL2Name/SectionsL3', {
      sectionsL3: 'sections',
      selectedSectionL3: 'selectedSection',
      CONFIG_UILineScrollSelector: 'CONFIG_UILineScrollSelector',
    });
  },
  template: `<div class="display-flex flex-direction-column gap-4px">
    <transition-group v-if="selectedSectionL2Components?.length" name="slide-page" tag="div" transition-group class="display-flex flex-direction-column gap-8px">
      <component v-for="(component, index) of selectedSectionL2Components" :key="index" :is="component"/>
    </transition-group>
    
    <div class="white-block-100" v-if="sectionsL3?.length">
      <UILineScrollSelector v-bind="{
        ...CONFIG_UILineScrollSelector,
        selectedItem: selectedSectionL3,
        items: sectionsL3,
      }" v-on="{
        onSelect: ($event) => $router.replace({
          ...$route,
          name: 'R_Engineer_SectionL3',
          params: {
            ...$route.params,
            sectionL3Name: $event.sectionName
          },
        })
      }" hideZeroCounter/>
    </div>
    
    <transition name="slide-page" mode="out-in">
      <router-view/>
    </transition>
  </div>`,
  beforeRouteEnter(to, from, next){
    next((vm) => {
      vm.guardL3(to, from, next)
    })
  },
  beforeRouteUpdate(to, from, next){
    this.guardL3(to, from, next)
  },
  beforeRouteLeave(to, from, next){
    next();
  },
  methods: {
    guardL3(to, from, next){
      const sectionsL3 = store.getters[atop('Engineer/SectionsL1',to.params.sectionL1Name,'SectionsL2',to.params.sectionL2Name,'SectionsL3/$subModulesKeys')];
      if(!sectionsL3?.length){
        console.log('!sectionsL3');
        return next();
      };
      const sectionL3Name = sectionsL3[0];
      if(!to.params.sectionL3Name){
        console.log('!sectionL3Name');
        return next({
          ...to,
          name: 'R_Engineer_SectionL3',
          params: {
            sectionL1Name: to.params.sectionL1Name,
            sectionL2Name: to.params.sectionL2Name,
            sectionL3Name
          },
        })
      }else if(!sectionsL3.includes(to.params.sectionL3Name)){
        console.log('?sectionL3Name',to.params.sectionL3Name);
        return next({
          ...to,
          name: 'R_Engineer_SectionL2',
          params: {
            sectionL1Name: to.params.sectionL1Name,
            sectionL2Name: to.params.sectionL2Name,
          },
        })
      }else if(store.getters[atop('Engineer/SectionsL1',to.params.sectionL1Name,'SectionsL2',to.params.sectionL2Name,'SectionsL3',to.params.sectionL3Name,'sectionDisabled')] && to.params.sectionL3Name !== sectionL3Name){
        console.log('sectionL3Disabled',to.params.sectionL3Name);
        return next({
          ...to,
          name: 'R_Engineer_SectionL2',
          params: {
            sectionL1Name: to.params.sectionL1Name,
            sectionL2Name: to.params.sectionL2Name,
          },
        })
      };
      store.dispatch(atop('Engineer/SectionsL1',to.params.sectionL1Name,'SectionsL2',to.params.sectionL2Name,'SectionsL3/selectSection'),{sectionName: to.params.sectionL3Name});
      next();
    }
  },
  computed:mapGetters('Engineer/SectionsL1',{
    selectedSectionL1Name: 'selectedSectionName',
  }),
});
Vue.component('EngineerSectionL3Content', {
  beforeCreate(){
    this.$mapDynamicNamespaceGetters('Engineer/SectionsL1/:selectedSectionL1Name/SectionsL2', {
      selectedSectionL2Name: 'selectedSectionName',
    });
    this.$mapDynamicNamespaceGetters('Engineer/SectionsL1/:selectedSectionL1Name/SectionsL2/:selectedSectionL2Name/SectionsL3', {
      selectedSectionL3Components: 'selectedSectionComponents',
    });
  },
  template: `<div class="display-flex flex-direction-column gap-4px">
    <transition-group v-if="selectedSectionL3Components?.length" name="slide-page" tag="div" transition-group class="display-flex flex-direction-column gap-8px">
      <component v-for="(component, index) of selectedSectionL3Components" :key="index" :is="component"/>
    </transition-group>
    
    <transition name="slide-page" mode="out-in">
      <router-view/>
    </transition>
  </div>`,
  computed:mapGetters('Engineer/SectionsL1',{
    selectedSectionL1Name: 'selectedSectionName',
  }),
});


//redirect
Vue.component('SideBarMenuItemBookmarks',{
  template:`<div class="display-flex align-items-center gap-8px cursor-pointer" @click="onClick">
    <IcIcon name="BookmarkAdd" color="#FF0032" size="22"/>
    <span>Закладки</span>
    <IcIcon name="loading" size="22" class="rotating main-lilac" v-if="userBookmarksLoading"/>
    <div class="display-flex align-items-center gap-4px" v-else-if="userBookmarksCount">
      <span class="tone-500">•</span><span>{{userBookmarksCount}}</span>
    </div>
    <div class="margin-left-auto">
      <IcIcon name="fa fa-chevron-right"/>
    </div>
  </div>`,
  computed:mapGetters('Engineer/SectionsL1/Bookmarks',[
    'userBookmarksLoading',
    'userBookmarksErrorMessage',
    'userBookmarksCount',
  ]),
  methods:{
    onClick(){
      this.$router.push({name:'R_Engineer_SectionL1', params: {sectionL1Name: 'Bookmarks'}});
      this.$store.dispatch('menu/close');
    },
  }
});
Vue.component('SideBarMenuItemTools',{
  template:`<div class="display-flex align-items-center gap-8px cursor-pointer" @click="onClick">
    <IcIcon name="fas fa-grip-horizontal" color="#2139b8" class="font-size-22px"/>
    <span>Инструменты</span>
    <div class="margin-left-auto">
      <IcIcon name="fa fa-chevron-right"/>
    </div>
  </div>`,
  methods:{
    onClick(){
      this.$router.push({name:'R_Engineer_SectionL1', params: {sectionL1Name: 'Documents'}});
      this.$store.dispatch('menu/close');
    },
  }
});
router.beforeEach((to, from, next)=>{
  if(to.name == 'R_Tools'){
    return next({
      name: 'R_Engineer_SectionL1',
      params:{
        sectionL1Name: 'Documents'
      },
    })
  }else if(to.name == 'R_Favs'){
    return next({
      name: 'R_Engineer_SectionL1',
      params:{
        sectionL1Name: 'Bookmarks'
      },
    })
  }
  next();
});


app.$router.addRoutes([
  {
    path: '/Engineer',
    component: Vue.component('EngineerPage'),
    children: [
      {
        path: '',
        name: 'R_Engineer',
        components: {
          navbar: Vue.component('EngineerPageNavbar'),
          content: Vue.component('EngineerPageContent')
        },
        children: [
          {
            path: ':sectionL1Name',
            name: 'R_Engineer_SectionL1',
            component: Vue.component('EngineerSectionL1Content'),
            children: [
              {
                path: ':sectionL2Name',
                name: 'R_Engineer_SectionL2',
                component: Vue.component('EngineerSectionL2Content'),
                children: [
                  {
                    path: ':sectionL3Name',
                    name: 'R_Engineer_SectionL3',
                    component: Vue.component('EngineerSectionL3Content'),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

//app.$router.push({name:'R_Engineer'});

