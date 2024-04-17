Vue.component('PortActionDisable', {
  components: {
    PortActionDisableApproveModal: Vue.component('PortActionDisableApproveModal', {
      template: `<div class="display-contents">
        <modal-container-custom ref="modal" :disabled="loading" :footer="false" @open="onOpen" @close="onClose" :wrapperStyle="{'min-height': '300px','margin-top': '4px'}">
          <div class="display-flex flex-direction-column">
            <div class="font--16-700 text-align-center">Отключение порта</div>
            
            <div class="margin-top-100px">
              <loader-bootstrap v-if="loading" text="отключение порта"/>
              <div v-else-if="!loading && !disabled" class="text-align-center font--13-500 tone-500">
                {{message}}
              </div>
            </div>

            <div class="display-flex flex-direction-column gap-8px padding-left-right-8px width-100-100 margin-top-100px">
              <div class="display-flex flex-wrap-wrap gap-8px justify-content-center">
                <template v-for="index of apprBtnsCount" >
                  <button-main :key="index" label="Да" @click="apprBtnsCount--" v-bind="{
                    disabled: loading || disabled,
                    loading: loading
                  }" buttonStyle="outlined" size="medium" class="color-f87522-important border-color-f87522-important"/>
                  <button-main v-if="Math.random() > 0.8" label="Нет" @click="close" v-bind="{
                    disabled: loading || disabled,
                    loading: loading
                  }" buttonStyle="outlined" size="medium"/>
                </template>
              </div>
              
              <button-main label="Отключить" @click="portDown" v-bind="{
                disabled: loading || disabled || Boolean(apprBtnsCount),
                loading: loading
              }" buttonStyle="contained" size="full"/>
              <button-main label="Отмена" @click="close" v-bind="{
                disabled: loading
              }" buttonStyle="outlined" size="full" />
            </div>
          </div>
        </modal-container-custom>
      </div>`,
      props: {
        port: {type: Object, required: !0},
        networkElement: {type: Object, required: !0},
        disabled: {type: Boolean, default: !1},
      },
      data: () => ({
        message: 'Вы действительно хотите этот порт отключить?',
        loading: !1,
        apprBtnsCount: 16,
      }),
      watch: {
        'loading'(loading){
          this.$emit('loading', loading)
        }
      },
      methods: {
        open(){//public
          this.$refs.modal.open();
        },
        close(){//public
          this.$refs.modal.close();
        },
        onOpen(){
          this.loading = !1;
          this.apprBtnsCount = 16;
        },
        onClose(){
          
        },
        async portDown(){
          this.loading = !0;
          try{
            await httpGet(buildUrl('port_down',objectToQuery(new DNM.DevicePortParams(this.networkElement, this.port)),"/call/hdm/"));
          }catch(error){
            console.warn(error);
          };
          this.loading = !1;
          this.$emit('callParent', ['getPortStatus']);
          this.close();
        },
      },
    })
  },
  template: `<section>
    <link-block icon="reload main-red" text="Отключить порт" :disabled="loading || disabled" v-bind="$attrs" actionIcon="reload" @block-click="$refs.PortActionDisableApproveModal.open()" :loading="loading"/>
    <PortActionDisableApproveModal ref="PortActionDisableApproveModal" v-bind="{port, networkElement, disabled}" @loading="loading = $event" @callParent="$emit('callParent', $event)"/>
  </section>`,
  props: {
    port: {type: Object, required: !0},
    networkElement: {type: Object, required: !0},
    disabled: {type: Boolean, default: !1},
  },
  data: () => ({
    loading: !1,
  }),
  watch: {
    'loading'(loading){
      this.$emit('loading', loading)
    }
  },
});
