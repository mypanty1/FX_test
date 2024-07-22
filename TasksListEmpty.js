//add clear cache on wfm dictionary error
Vue.component('TasksListEmpty', {
  components: {
    IconTools: () => importByPath('/js/IconTools.js'),
    IconSqError: () => importByPath('/js/IconSqError.js'),
  },
  template:`<div class="white-block-100 display-flex flex-direction-column gap-8px padding-top-bottom-8px padding-left-right-12px">
    
    <div class="display-flex flex-direction-column align-items-center margin-24px">
      <IconSqError v-if="errorMessage" size="96"/>
      <IconTools v-else size="96"/>
    </div>

    <UIUserMessage v-if="infoMessage" :message="infoMessage" type="info"/>
    
    <UIUserMessage v-if="errorMessage" :message="errorMessage" type="warning">
      <template slot="bottom" v-if="!cleared && /справочник/i.test(errorMessage)">
        <div class="display-flex flex-direction-row-reverse">
          <button-main label="Удалть кэш" @click="clearCache" buttonStyle="outlined" size="medium" class="color-f87522-important border-color-f87522-important"/>
        </div>
      </template>
    </UIUserMessage>

    <div class="font--13-500 tone-500 text-align-center">Найти нужную информацию можно на карте или воспользовавшись поиском</div>

    <button class="border-none background-none font--13-500 main-lilac padding-8px" @click="$router.push({name:'R_Map'})">Открыть карту</button>
  </div>`,
  data: () => ({
    cleared: !1,
  }),
  computed: {
    ...mapGetters('tasks', [
      'tasksListEmptyMessage'
    ]),
    infoMessage(){
      return this.tasksListEmptyMessage?.infoMessage || 'Список пуст'
    },
    errorMessage(){
      return this.tasksListEmptyMessage?.errorMessage || ''
    },
  },
  methods: {
    clearCache(){
      localStorage.clear();
      this.cleared=!0;
    }
  }
});
