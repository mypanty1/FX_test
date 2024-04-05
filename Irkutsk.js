Vue.mixin({
  beforeCreate(){
    if(this.$options.name=='LbsvService'){
      this.$options.template=this.$options.template.replace('<title-main v-if="!isSamatlor" textClass="font--16-500" v-bind="{','<title-main v-if="!isSamatlor && !serviceHasPassword" textClass="font--16-500" v-bind="{');
    };
  }
})
