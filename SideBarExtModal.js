Vue.component('SideBarExtModal',{
  //menu-sidebar
  _template:`<div @click="$refs.SideBarExtModal.open()" class="display-flex align-items-center gap-8px">
                  <IcIcon name="fas fa-grip-horizontal" color="#2139b8" class="font-size-22px"/>
                  <span>Дополнительно</span>
                </div>
                <SideBarExtModal ref="SideBarExtModal"/>`,
  template:`<modal-container-custom name="SideBarExtModal" ref="modal" :footer="false" :wrapperStyle="{'min-height':'auto','margin-top':'4px'}">
    <div class="padding-left-right-16px">
      <div class="display-flex flex-direction-column gap-8px">
        <div class="font--15-600 text-align-center">Дополнительно</div>
        
        <div class="display-flex flex-direction-column">
          
        </div>
      </div>
      <div class="margin-top-16px display-flex justify-content-space-around">
        <button-main label="Закрыть" @click="close" buttonStyle="outlined" size="medium"/>
      </div>
    </div>
  </modal-container-custom>`,
  data:()=>({
    
  }),
  computed:{
    
  },
  methods:{
    open(){//public
      this.$refs.modal.open();
    },
    close(){//public
      this.$refs.modal.close();
    },
  },
});
