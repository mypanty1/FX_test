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

//add clear cache on wfm dictionary error
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/TasksListEmpty.js',type:'text/javascript'}));

//fix deleted CU
const DELETED_OBJECTS = new Set();
DeviceService.SiteRacks = new class SiteRacks extends RequestService {
  use(siteID){
    return this.get('site_rack_list', this.checkMandatoryParams({
      site_id: siteID
    }));
  }
  async useCache(siteID){
    const mandatory = this.checkMandatoryParams({siteID});
    const cacheKey = this.cacheKey(this, mandatory.siteID);
    try{
      const cache = localStorageCache.getItem(cacheKey);
      const response = cache || await this.use(mandatory.siteID);
      if(Array.isArray(response?.data)){
        response.data = response.data.filter(({description, rack_id}) => !/DELETE/.test(description) ? !0 : !DELETED_OBJECTS.add(rack_id))
        if(!cache){
          localStorageCache.setItem(cacheKey, response);
        };
        return response;
      }
    }catch(error){
      console.warn(error);
    };
    return {isError: !0};
  }
  delCache(siteID){
    const mandatory = this.checkMandatoryParams({siteID});
    const cacheKey = this.cacheKey(this, mandatory.siteID);
    localStorageCache.removeItem(cacheKey);
  }
}(DeviceService)
//and for old service
RequestServiceOLD.httpGet = async function (uri){
  const {url, params} = RequestServiceOLD.parseURI(uri);
  try{
    const response = await RequestServiceOLD.get(url, params);
    if(/site_rack_list/.test(url) && response?.type == 'success' && Array.isArray(response?.data)){
      response.data = response.data.filter(({description, rack_id}) => !/DELETE/.test(description) ? !0 : !DELETED_OBJECTS.add(rack_id))
    };
    if(/patch_panels/.test(url) && response?.type == 'success' && Array.isArray(response?.data)){
      response.data = response.data.map((pp) => DELETED_OBJECTS.has(pp.rack_id) ? Object.assign(pp, {rack_id: ''}) : pp)
    };
    return RequestServiceOLD.handleResponse(response);
  }catch(error){
    return RequestServiceOLD.wrapError(error);
  }
};
//test fix 500
cookieStore.set({
  name: 'check_ma',
  value: '1',
  expires: Date.now() + (24 * 60 * 60 * 1000),
  domain: location.host,
});
/*
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
*/
