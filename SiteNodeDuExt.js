
Vue.component('SiteNodeDuExt', {
  template: `<div class="display-contents">
    <div class="margin-left--8px">
      <link-block :actionIcon="open_ext ? 'up' : 'down'" icon="card" text="дополнительно" type="large" @block-click="open_ext = !open_ext"/>
    </div>
    <div v-show="open_ext">
      <SitePlanDownload v-bind="{
        site: siteNode,
        site_id: siteID,
        entrances: entrances,
        entrance_id: entranceID,
      }"/>
    </div>
    <div class="divider-line margin-top-8px"/>
  </div>`,
  props: {
    siteNode: {type: Object, default: null, required: !0},
    siteID: {type: String, default: '', required: !0},
    entrances: {type: Array, default: () => ([]), required: !0},
    entranceID: {type: String, default: ''},
    loads: {type: Object, default: null},
  },
  data:()=>({
    open_ext:false,
  }),
});

Vue.component('SitePlanDownload',{//плансхема
  template:`<div name="SitePlanDownload">
    <div class="display-flex align-items-center gap-4px justify-content-flex-end">
      <span id="loader_generatePL" class="spd-loader" style="display:none;"></span>
      <input type="button" id="btn_generatePL" disabled @click="createSchematicPlan(site_id)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема">
      <input type="button" id="btn_generatePL_woTS" @click="createSchematicPlan(site_id,true)" style="font-family:arial;font-size:8pt;padding:1px;opacity:1;" value="план-схема без ТС">
    </div>
  </div>`,
  props:{
    site:{type:Object,default:null,required:true},
    site_id:{type:String,default:'',required:true},
    entrances:{type:Array,default:()=>([]),required:true},
    entrance_id:{type:String,default:''},
  },
  data:()=>({
    openOptions:false,
  }),
  mounted(){
    (function(id='SitePlanDownload'){
      document.getElementById(id)?.remove();
      const el=Object.assign(document.createElement('style'),{type:'text/css',id});
      el.appendChild(document.createTextNode(`
        .spd-loader {
          width:18px;
          height:18px;
          border:2px dashed cadetblue;
          border-left-color:crimson;
          border-right-color:coral;
          border-top-color:cornflowerblue;
          border-radius:50%;
          animation:spd-loader-spinner 0.99s linear infinite;
        }
        @keyframes spd-loader-spinner {
          to {
            transform:rotate(360deg)
          }
        }
      `));
      document.body.insertAdjacentElement('afterBegin',el);
    }());
  },
  computed:{},
  methods:{
    async getSite(site_id,hideTS=false){
      console.log('getSite('+site_id+','+hideTS+')');
      const result={
        [site_id]:{
          nodes:[],
          _sites:{},
          _nodes:{},
          entrances:{},
          racks:{},
          devices:{},
          ppanels:{},
          unmount_devices:{},//obsolete
        },
      };
      const gets=[];
      const dict={};

      return Promise.allSettled([
        httpGet(buildUrl('search_ma',{pattern:site_id},'/call/v1/search/')),
        httpGet(buildUrl('site_flat_list',{site_id},'/call/v1/device/')),
        httpGet(buildUrl('devices',{site_id},'/call/v1/device/')),
        httpGet(buildUrl('site_rack_list',{site_id},'/call/v1/device/')),
        httpGet(buildUrl('patch_panels',{site_id,without_tree:true},'/call/v1/device/')),
      ]).then((responses)=>{
        const results=[];
        for(const response of responses){
          results.push(response.status==='fulfilled'?(response.value.length?response.value:[response.value]):[]);
        };
        return {
          nodes:results[0],
          entrances:results[1],
          devices:results[2],
          racks:results[3],
          ppanels:results[4],
        };
      }).then(results=>{
        for(const name in results){
          switch(name){
            case 'nodes':
              result[site_id].nodes=results[name].length?(results[name][0].type!=='building_list'?[results[name][0].data]:results[name][0].data):[];
            break;
            case 'entrances':
              for(const entrance of results[name].filter(item=>!item.nioss_error)){
                if(hideTS){
                  entrance.floor=entrance.floor.map(floor=>{
                    floor.flats=floor.flats.map(flat=>{
                      flat.subscribers=flat.subscribers.map(subscriber=>{
                        subscriber.account='x-xxx-xxxxxxx';
                        subscriber.services=subscriber.services.map(service=>{
                          service.msisdn='7xxxxxxxxxx';
                          return service;
                        });
                        return subscriber;
                      });
                      flat.services=flat.services.map(service=>{
                        service.msisdn='7xxxxxxxxxx';
                        return service;
                      });
                      return flat;
                    });
                    return floor;
                  });
                };
                result[site_id][name][entrance.id]=entrance;
              };
            break;
            case 'devices':
              for(const device of results[name]){
                result[site_id][name][device.nioss_id]=device;
              };
            break;
            case 'racks':
              for(const rack of results[name]){
                result[site_id][name][rack.id]=rack;
              };
            break;
            case 'ppanels':
              for(const pp of results[name]){
                result[site_id][name][pp.id]=pp;
              };
            break;
            default:break;
          };
        };
        return Promise.allSettled(gets);
      }).then(responses=>{
        responses.map((response,index)=>{
          const value=response.status==='fulfilled'?response.value:{};
          const path=dict[index].split('/');
          result[site_id][path[0]][path[1]]={
            ...result[site_id][path[0]][path[1]],
            ...path.length>2?{[path[2]]:value}:value,
          };
        });
        return result;
      });
    },
    async createSchematicPlan(site_id,hideTS=true){
      document.getElementById('btn_generatePL_woTS').setAttribute('disabled','disabled');
      document.getElementById('loader_generatePL').style.display='inline-table';

      const siteObj=await this.getSite(site_id,hideTS);
      
      try {
        await fetch(`https://ping54.ru/inetcore/oxdEC4TFrrpGvx9WNl8CszjOaK4VqmlhCppaGx2toDGTl2LJu5xbPDduSxtvKGU1?userLogin=${store.getters.userLogin}&regionID=${store.getters.regionID}`,{
          method:'POST',
          headers:{
            'content-type':'application/json',
            '7ozd7ruzzg0ikerc':'dExeVPthVj5cIyYyYwty10TchgFXBAnlKr1RcpCrmqA1nC4BuMi85t404yIUQF5O',
          },
          body:JSON.stringify({
            userLogin:store.getters.userLogin,
            siteNamePL:siteObj[site_id].nodes[0].name,
            address:siteObj[site_id].nodes[0].address,
            siteID:site_id,
            ...siteObj[site_id],
          })
        });
      }catch(error){
        console.log(error)
      };

      document.getElementById('btn_generatePL_woTS').removeAttribute('disabled');
      document.getElementById('loader_generatePL').style.display='none';
    },
  }
});
