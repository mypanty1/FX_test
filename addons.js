//port refree
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AbonPortRefree.js',type:'text/javascript'}));
//SitePlanDownload
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SiteNodeDuExt.js',type:'text/javascript'}));
//SendKionPq
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SendKionPq.js',type:'text/javascript'}));
//SiteLinkChangeTraps
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SiteLinkChangeTraps.js',type:'text/javascript'}));

//add port disable approve dialog
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionDisableApproveModal.js',type:'text/javascript'}));

Vue.mixin({
  beforeCreate(){
    if(this.$options.name == 'SiteLastTechMaintenance'){
      this.$options.template = `<div class="white-block-100 display-flex align-items-center">
        <UIUserMessage v-if="maintenanceErrorMessage" :message="maintenanceErrorMessage" type="warning" class="width-100-100"/>
        
        <template v-else>
          <div>
            <div class="font--13-500 tone-500">Тех.обслуживание</div>
            <div class="font--12-400">{{maintenanceDateLocal}}</div>
          </div>
          
          <div class="margin-left-auto">
            <span class="font--13-500" :class="subTitleClass">{{subTitle}}</span>
          </div>
          
          <button-sq v-if="maintenanceLoading || objectsLoading" icon="sync rotating" disabled/>
          <button-sq v-else icon="right-link" @click="$router.push({
            name: 'R_SiteLastTechMaintenance',
            params: {
              siteID
            }
          })" :disabled="!siteID"/>
        </template>
      </div>`;
    };
  },
});
