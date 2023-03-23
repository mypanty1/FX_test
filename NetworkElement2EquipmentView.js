//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/NetworkElement2EquipmentView.js',type:'text/javascript'}));


/*
<template v-if="!hideEquipmentView&&username=='mypanty1'&&networkElement.system_object_id">
  <devider-line/>
  <title-main icon="сube" text="Внешний вид" @block-click="openEquipmentView=!openEquipmentView" :opened="openEquipmentView"/>
  <!--<link-block icon="сube" text="Внешний вид" @block-click="openEquipmentView=!openEquipmentView" :actionIcon="openEquipmentView?'up':'down'" type="large"/>-->
  <div v-show="openEquipmentView"><!--<collapse-slide :opened="openEquipmentView">-->
    <EquipmentView type="networkElement" :equipment_id="networkElement.system_object_id" :object="networkElement"/>
  </div><!--</collapse-slide>-->
</template>
*/
Vue.component('NetworkElementEquipmentView',{
  template:`<div name="NetworkElementEquipmentView" class="display-content"></div>`,
  props:{
    networkElement:{type:Object,default:null},
  },
  data:()=>({}),
  created(){},
  watch:{},
  computed:{},
  methods:{},
});


/*
<template v-if="!hideEquipmentView&&networkElement?.ip&&username=='mypanty1'">
  <devider-line/>
  <!--<NetworkElementExt :networkElement="networkElement"/>-->
  <div name="NetworkElementExt" class="display-content">
    <link-block actionIcon="down" icon="card" text="Дополнительно" type="large" disabled/>
    <div v-show="false" class="margin-left-right-16px">
      
    </div>
  </div>
</template>
*/
Vue.component('NetworkElementExt',{
  template:`<div name="NetworkElementExt" class="display-content"></div>`,
  props:{
    networkElement:{type:Object,default:null},
  },
  data:()=>({}),
  created(){},
  watch:{},
  computed:{},
  methods:{},
});


Vue.component('EquipmentView',{
  template:`<div name="EquipmentView" class="display-content">
    <loader-bootstrap v-if="loading" height="72" text="поиск изображения"/>
    <div v-else-if="src" class="display-flex align-items-center justify-content-center">
      <div class="position-relative">
        <img :src="src" style="width:340px;">
        <div class="position-absolute" style="inset:0px;"></div>
      </div>
    </div>
  </div>`,
  props:{
    type:{type:String,required:true},
    equipment_id:{type:String,required:true},
    object:{type:Object,default:null},
  },
  data:()=>({
    loading:false,
    equipment:null,
  }),
  created(){
    this.getEquipmentView();
  },
  watch:{
    'equipment_id'(equipment_id){
      if(!equipment_id){return};
      this.getEquipmentView();
    },
  },
  computed:{
    src(){return this.equipment?.src||''},
    isEmpty(){return this.equipment?.isEmpty},
  },
  methods:{
    async getEquipmentView(){
      const {equipment_id,type,object}=this;
      if(!equipment_id){return};
      this.equipment=null;
      const cache=this.$cache.getItem(`img_src/${equipment_id}`);
      if(cache){
        this.equipment=cache||null;
        return;
      };
      this.loading=true;
      try{
        const query=objectToQuery({equipment_id,type,object});console.log({equipment_id,type,object},query);
        const response=await fetch(`https://script.google.com/macros/s/AKfycby26qbmgJjIAi1CGSj9sg9EBkn7mTsw5htXQk4G_DqUnncmuaBQn_wC54fYRHPaqMRa/exec?${query}`).then(resp=>resp.json());
        if(response){
          this.equipment=response;
          this.$cache.setItem(`img_src/${equipment_id}`,response);
        };
      }catch(error){
        console.warn('getEquipmentView.error',error)
      };
      this.loading=false;
    },
  },
});




