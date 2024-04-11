//search wfm
Vue.mixin({
  beforeCreate(){
    if(this.$options.name == 'SearchPage'){
      Object.assign(this.$options.methods, {
        searchByText: async function(_text){
          let text = decodeURIComponent(_text || this.text);
          this.error = null;
          if (!text || this.loading.search) return;
          
          const br_oam_prefix = REGIONs[this.regionID]?.BR_OAM;
          const srNumber = text.match(/1-\d{12}/g)?.[0];
          const wfmOrderID = text.match(/WFM\d{12}/gi)?.[0];
          if(text.startsWith("CMTS")){
            this.goToDocsis(text);
            return;
          }else if(srNumber){//поиск СЗ
            this.goToSiebelServiceRequest(srNumber);
            return;
          }else if(wfmOrderID){//поиск WFM
            this.$router.replace({name:'R_WFMTask',params:{taskID: wfmOrderID}});
            return;
          }else if(/^\d{1,3}[бю.,./]\d{1,3}$/i.test(text) && br_oam_prefix){//поиск СЭ по двум последним октетам
            text = text.replace(/[бю.,./]/gi,'.');
            this.$router.replace({
              name: "search",
              params: {
                text: `@D_IP:${br_oam_prefix}.${text}`
              }
            });
            return;
          }else if(/^10[бю.,./]2(\d{2}[бю.,./])(\d{1,3}[бю.,./])\d{1,3}$/i.test(text)){//поиск сэ по маске 10.2x.x.x
            text = text.replace(/[бю.,./]/gi,'.');
            this.$router.replace({
              name: "search",
              params: {
                text: `@D_IP:${text}`
              }
            });
            return;
          };

          this.loading.search = !0;
          let response;
          try{
            response = await SearchService.searchMa(encodeURIComponent(text));
          }catch(error){
            console.warn(error)
          };
          this.loading.search = !1;
          
          if(!response){
            this.error = ['unexpected search error'];
            return;
          };

          if(!response.data){
            this.error = [response.message || 'unknown search error', response.text];
            return;
          };

          if(!response.data.data){
            this.error = [response.data.text || 'search error'];
            return;
          };

          this.mapper(response.data);
        }
      })
    }
  }
})

