Vue.component('AccountCpContent',{
  template:`<div name="AccountCpContent">
    <loader-bootstrap v-if="loadingCp" text="поиск порта абонента"/>
    <template v-else-if="cp">
      <template v-if="isGpon">
        <title-main text="Порт OLT" @open="show.serveOltPort=!show.serveOltPort">
          <button-sq v-if="loading.networkElement" icon="loading rotating"/>
        </title-main>
        <device-info v-if="networkElement&&show.serveOltPort" :networkElement="networkElement" :ports="[cpServePort]" hideEntrances showLocation addBorder autoSysInfo class="padding-top-bottom-8px margin-left-right-16px"/>
        <title-main text="Абонентский ONT" @open="show.abonOnt=!show.abonOnt">
          <button-sq v-if="loading.onts" icon="loading rotating"/>
        </title-main>
        <OntInfo v-if="abonOnt&&show.abonOnt&&!loading.onts" :ont="abonOnt" :port="cpServePort" class="margin-bottom-0"/>
        <message-el v-if="!loading.onts&&!abonOnt" text="терминал абонента не найден" type="warn" box/>
      </template>
      <template v-else>
        <title-main text="Порт подключения">
          <button-sq v-if="loading.networkElement" icon="loading rotating"/>
        </title-main>
        <device-info v-if="networkElement" :networkElement="networkElement" :ports="[cpServePort]" hideEntrances showLocation addBorder autoSysInfo class="padding-top-bottom-8px margin-left-right-16px"/>
      </template>
    </template>
    <message-el v-else text="порт абонента не найден" type="warn" box/>
  </div>`,
  props:{
    loadingCp:{type:Boolean,default:false},
    cp:{type:Object,default:null},
  },
  data:()=>({
    
  }),
  computed:{
    
  },
  methods:{
    
  },
});
