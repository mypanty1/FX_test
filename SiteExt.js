Vue.component('SiteExt',{
  template:`<div class="display-contents">
    <link-block :actionIcon="open_ext?'up':'down'" icon="card" text="дополнительно" type="large" @block-click="open_ext=!open_ext"/>
    <div v-show="open_ext" class="padding-left-right-16px">
      <SitePlanDownload v-bind="$props"/>
    </div>
    <devider-line />
    <template v-if="!entrance_id">
      <link-block :actionIcon="open_pings?'up':'down'" icon="factors" text="доступность" type="large" @block-click="open_pings=!open_pings">
        <div slot="postfix" class="display-flex align-items-center gap-4px">
          <span v-if="loadingSomePing" class="ic-20 ic-loading rotating tone-500"></span>
          <template v-else>
            <div v-if="countOfflineOrError" class="display-flex align-items-center gap-2px">
              <span class="font--13-500 tone-500">{{countOfflineOrError}}</span>
              <span class="ic-20 ic-warning main-orange"></span>
            </div>
            <div v-if="countOnline" class="display-flex align-items-center gap-2px">
              <span class="font--13-500 tone-500">{{countOnline}}</span>
              <span class="ic-20 ic-status main-green"></span>
            </div>
          </template>
        </div>
      </link-block>
      <div v-show="open_pings" class="padding-left-right-16px">
        <PingGroup v-bind="{site,site_id}" @count-not-online="countOfflineOrError=$event" @count-online="countOnline=$event" @loading-some="loadingSomePing=$event"/>
      </div>
      <devider-line />
    </template>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    entrances:{type:Array,default:()=>([]),required:true},
    entrance_id:{type:String,default:''},
  },
  data:()=>({
    open_ext:false,
    open_pings:false,
    countOfflineOrError:false,
    countOnline:false,
    loadingSomePing:false,
  }),
});
