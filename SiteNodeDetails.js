Vue.component("SiteNodeDetails", {
  template:`<div>
    <title-main text="Инфо по площадке*" @open="show=!show">
      <button-sq :icon="loading?'loading rotating':'mark-circle'" @click="help.show=!help.show"/>
      <button-sq v-if="show&&siteNode" :icon="$refs.SiteNodeDetailsEditModal?.loadingSome?'loading rotating':'edit'" @click="$refs.SiteNodeDetailsEditModal.open()" :disabled="loading||$refs.SiteNodeDetailsEditModal?.loadingSome"/>
    </title-main>
    <info-text-icon v-if="help.show" icon="info" :text="help.text"/>
    <SiteNodeDetailsEditModal v-if="siteNode" ref="SiteNodeDetailsEditModal" v-bind="modalProps" @onNodeSaveOk="get_nioss_object('node',siteNode?.node_id,'update')" @onSiteSaveOk="get_nioss_object('site',siteNode?.id,'update')"/>
    <template v-if="show&&siteNode">
      <template v-if="siteNode.lessor">
        <info-text-sec :text="siteNode.lessor?.name" class="margin-bottom-4px"/>
        <div class="display-flex flex-direction-column gap-4px padding-left-right-16px">
          <PhoneCall v-if="siteNode.lessor?.phone" :phone="siteNode.lessor.phone" title="Контактный номер телефона" :descr="[siteNode.lessor.person,siteNode.lessor.position]"/>
          <PhoneCall v-if="siteNode.lessor?.phone2" :phone="siteNode.lessor.phone2" title="Контактный номер телефона по вопросам доступа"/>
          <PhoneCall v-if="siteNode.lessor?.phone3" :phone="siteNode.lessor.phone3" title="Телефонные номера аварийных служб"/>
        </div>
      </template>
      
      <devider-line/>
      <info-text-sec :title="address_descr_title" :text="address_descr"/>
      
      <devider-line/>
      <info-text-sec :title="site_descr_title" :text="site_descr"/>
      
      <devider-line/>
      <info-text-sec :title="node_descr_title" :text="node_descr"/>
      
      <template v-if="address_id">
        <devider-line/>
        <UrlLink :url="urlToInventory"/>
      </template>
    </template>
  </div>`,
  props:{
    siteNode:{type:Object},
  },
  data:()=>({
    show:true,
    help:{
      text:`Информация об арендодателе площадей под размещение оборудования ПАО МТС может быть устаревшей либо вовсе не быть информацией по доступу. 
      Для корректировки данной информации нужно обратиться к ФГТСЖ. Подробная информация по доступу в помещения подъезда находится на странице Подъезд`,
      show:false,
    },
    resps:{//8100749217013993313 - получены все доступные атрибуты
      node:null,
      site:null,
      address:null,
    },
    loads:{
      node:false,
      site:false,
      address:null,
    },
  }),
  created(){
    this.get_nioss_object('address',this.siteNode?.address_id);
    this.get_nioss_object('site',this.siteNode?.id);
    this.get_nioss_object('node',this.siteNode?.node_id||this.siteNode?.uzel_id);
  },
  watch:{
    'siteNode'(siteNode){
      if(!siteNode){return};
      if(!this.resps.site&&!this.loads.site){
        this.get_nioss_object('site',this.siteNode?.id);
      }
      if(!this.resps.node&&!this.loads.node){
        this.get_nioss_object('node',this.siteNode?.node_id||this.siteNode?.uzel_id);
      }
    },
    'address_id'(address_id){
      if(address_id&&!this.resps.address&&!this.loads.address){
        this.get_nioss_object('address',address_id);
      }
    }
  },
  computed:{
    loading(){return Object.values(this.loads).some(l=>l)},
    address_descr(){return [this.resps.address?.description,this.siteNode?.details].filter(Boolean).join('\n')||'—'},
    address_descr_title(){return `Примечание к адресу ${[this.resps.address?.BuildingType||this.resps.address?.BldType||'',this.resps.address?.resourceBusinessName||''].filter(Boolean).join(' ')}`},
    site_descr(){return (this.resps.site?this.resps.site?.description:this.siteNode?.site_descr)||'—'},
    site_descr_title(){return `Примечание к площадке ${this.siteNode?.name||''}`},
    node_descr(){return (this.resps.node?this.resps.node?.description:this.siteNode?.node_descr)||'—'},
    //node_descr_title(){return `Примечание к ООС ${this.siteNode?.type||''}`},
    node_descr_title(){return `Примечание к ООС ${this.siteNode?.node||''}`},
    address_id(){return this.resps.site?.AddressPA?.NCObjectKey||this.siteNode?.address_id||''},
    site_name(){return this.resps.site?.SiteName||this.siteNode?.name||''},
    urlToInventory(){return {title:`Инвентори площадки ${this.site_name}`,hideUrl:!0,url:`https://inventory.ural.mts.ru/tb/address_view.php?id_address=${this.address_id}`}},
    modalProps(){
      const {id:site_id,node_id}=this.siteNode;
      const {site,node}=this.resps;
      return {site,site_id,node,node_id}
    },
  },
  methods:{
    async get_nioss_object(object='unknown',object_id='',update=false){
      if(!object_id){return};
      if(!update){
        const cache=this.$cache.getItem(`get_nioss_object/${object_id}`);
        if(cache){
          this.resps[object]=cache;
          return;
        };
      }
      this.loads[object]=true;
      const response=await this.get_nioss_object_and_save({object_id,object});
      this.resps[object]=response||null;
      this.loads[object]=false;
    },
    async get_nioss_object_and_save({object_id,object}){
      try{
        const response=await httpGet(buildUrl("get_nioss_object",{object_id,cache:!0},"/call/nioss/"),true);
        if(response?.parent){this.$cache.setItem(`get_nioss_object/${object_id}`,response)};
        return response;
      }catch(error){
        console.warn("get_nioss_object.error",{object_id},error);
      }
      return null;
    },
  }
});
