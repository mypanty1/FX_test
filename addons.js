//port refree
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AbonPortRefree.js',type:'text/javascript'}));

//SitePlanDownload
document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SiteNodeDuExt.js',type:'text/javascript'}));

//SendKionPq
//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SendKionPq.js',type:'text/javascript'}));

//SiteLinkChangeTraps
// document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/SiteLinkChangeTraps.js',type:'text/javascript'}));
//document.head.appendChild(Object.assign(document.createElement('script'), {src: 'https://ping54.ru/shared/dev/SiteLinkChangeTraps.js', type: 'text/javascript'}));

//add port disable approve dialog
//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/PortActionDisableApproveModal.js',type:'text/javascript'}));

//fix check session
//document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://mypanty1.github.io/FX_test/AbonPortBindForm.js',type:'text/javascript'}));

//temp fix scan
Vue.component('scan-passport', {
  beforeCreate() {
    this.$mapOptions({
      EDO_FORIS_CODE: EDO.FORIS_CODE
    })
  },
  components: {
    RussianPassportRecognizer: Vue.component('RussianPassportRecognizer', {
      components: {
        IconPhoto: () => importByPath('/js/IconPhoto.js'),
      },
      template: `<div>
        <button-main buttonStyle="outlined" v-on="{
          click: () => $refs.DocumentRecognizerModal.open()
        }">
          <IconPhoto size="24" color="lilac"/>
        </button-main>

        <DocumentRecognizerModal ref="DocumentRecognizerModal" v-on="{
          onRecognizeStart: () => onRecognizeStart(),
          onDocumentData: ($event) => onDocumentData($event),
        }"/>
      </div>`,
      methods: {
        onRecognizeStart(){
          this.$emit('onStart');
        },
        onDocumentData(dd){
          // this.$emit('onDocumentFields', documentFields);
          this.$emit('onData', {
            number: dd.number,
            series: dd.series,
            surname: dd.surname,
            name: dd.name,
            patronymic: dd.patronymic,
            gender: dd.gender,
            birthDate: dd.birthdate,
            birthPlace: dd.birthplace,
            issuePlace: dd.authority,
            departmentCode: dd.authority_code,
            issueDate: dd.issue_date,
          })
        },
      },
    })
  },
  template: `<section>
    <PageNavbar title="Электронный документ"> 
      <template slot="subTitle">
        <span class="ma-font--15-400">Персональные данные</span>
      </template>
      <template slot="postfix">
        <UIButtonSq icon="ic-refresh" v-on="{
          click: () => reset()
        }" iconAnimation/>
      </template>
    </PageNavbar>
    
    <UISection paddingTopBottom>
      <UILoader v-if="loading"/>
      <template v-else>
        <UISectionPart column>
          <div class="ma-font--13-500 ma-text-color--secondary">Только при наличии документа подтвердающего личность.</div>
          
          <template v-for="(input, key) in computedInputs">
            <template v-if="key != 'addressRegistration' || !isNewUserForis">
              <input-el :key="key" v-model="input.value" v-bind="{
                mask: input.mask ? input.mask() : null,
                label: input.label,
                placeholder: input.placeholder,
                disabled: type == EDO_FORIS_CODE && !isNewUserForis,
                error: input.valid ? !input.valid(input.value) : false,
              }"/>
            </template>
          </template>
        </UISectionPart>

        <input hidden type="file" @change="handleFileUpload" ref="file" accept="image/*" capture/>
      </template>

      <UISectionPart column class="margin-top-60px margin-bottom-4px">
        <template v-if="isTermAgr">
          <button-main label="Добавить дополнительный документ" @click="scanOptionalDoc" :loading="loading" buttonStyle="outlined" size="full">
            <template slot="icon">
              <UIIcon icon="ic-loading-docsis"/>
            </template>
          </button-main>
          <input hidden type="file" @change="handleOptionFilesUpload" ref="optionFile" accept="image/*" capture/>
        </template>

        <UILineGroupCenter>
          <template v-if="isPassport">
            <RussianPassportRecognizer v-if="$store.state.SCAN_V2 || !0" v-on="{
              onStart: () => onRecognizeStart(),
              onData: ($event) => onDocumentData($event),
            }"/>
            <template v-else>
              <doc-scan-fsm v-if="pilotScan && $root.widgetModeOn" @send-doc="readFile" :loading="loading"/>
              <doc-scan v-else-if="pilotScan" @send-doc="readFile" :loading="loading"/>

              <button-main v-else buttonStyle="outlined" @click="scan" :loading="loading">
                <template slot="icon">
                  <IconPhoto slot="icon" size="24" color="lilac"/>
                </template>
              </button-main>
            </template>
          </template>
          <button-main v-if="edit" label="Изменить" @click="goToFinish" :disabled="disabled" buttonStyle="contained" size="full"/>
          <button-main v-else label="Далее" @click="goTo" :disabled="disabled" buttonStyle="contained" size="full"/>
        </UILineGroupCenter>
      </UISectionPart>
    </UISection>
  </section>`,
  props: {
    accountId: { type: String, required: true },
    edit: { type: Boolean, default: false },
    type: { type: String, default: EDO.FORIS_CODE, validator: EDO.typeValidator },
    account: { type: Object, default: () => ({}) },
    taskID: { type: String, default: '' },
  },
  components: {
    IconPhoto: () => importByPath('/js/IconPhoto.js'),
  },
  data() {
    return {
      file: null,
      fileBase64: null,
      optionFiles: [],
      optionFilesBase64: [],
      documentRecognition: null,
      loading: false,
      inputs: {
        idType: {
          value: '',
          label: 'Документ, удостоверяющий личность',
        },
        series: {
          value: '',
          placeholder: 'Серия Номер',
          label: 'Серия и номер',
          mask: () => {
            if (this.isPassport) return [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/]
            return
          },
          valid: (value) => {
            if (!this.isPassport) return true
            if (!value) return true
            return value.length === 11
          }
        },
        surname: {
          value: '',
          label: 'Фамилия',
        },
        name: {
          value: '',
          label: 'Имя',
        },
        patronymic: {
          value: '',
          label: 'Отчество',
        },
        birthDate: {
          value: '',
          label: 'Дата рождения',
          mask: () => [/\d/, /\d/, '\.', /\d/, /\d/, '\.', /\d/, /\d/, /\d/, /\d/],
          valid: (value) => this.validDate(value)
        },
        birthPlace: {
          value: '',
          label: 'Место рождения',
        },
        issuePlace: {
          value: '',
          label: 'Кем выдан',
        },
        issuePlaceNoResident: {
          value: '',
          label: 'Какой организацией зарегистрирован',
        },
        issueDate: {
          value: '',
          label: 'Дата выдачи',
          mask: () => [/\d/, /\d/, '\.', /\d/, /\d/, '\.', /\d/, /\d/, /\d/, /\d/],
          valid: (value) => this.validDate(value)
        },
        departmentCode: {
          value: '',
          label: 'Код подразделения',
          mask: () => [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
          valid(value) {
            if (!value) return true
            return value.length == 7 && /\d{3}[-]\d{3}/.test(value)
          }
        },
        nameRegDoc: {
          value: '',
          label: 'Наименование регистрационного документа'
        },
        seriesRegDoc: {
          value: '',
          label: 'Серия номер регистрационного документа',
          placeholder: 'Серия Номер',
        },
        startDate: {
          value: '',
          label: 'Дата начала срока пребывания/проживания',
          mask: () => [/\d/, /\d/, '\.', /\d/, /\d/, '\.', /\d/, /\d/, /\d/, /\d/],
          valid: (value) => this.validDate(value)
        },
        endDate: {
          value: '',
          label: 'Дата окончания срока',
          mask: () => [/\d/, /\d/, '\.', /\d/, /\d/, '\.', /\d/, /\d/, /\d/, /\d/],
          valid: (value) => this.validDate(value)
        }
      },
      validDate: value => {
        if (!value) return true
        return /^(([0-2]?\d{1})|([3][0,1]{1}))[- /.]([0]?\d{1}|[1][0,1,2]{1})[- /.](19|20)\d\d$/.test(value)
      }
    }
  },
  watch: {
    'edit'(val) {
      if (val) {
        for (const key in this.inputs) {
          this.inputs[key].value = this.passport[key].value
        }
      }
    }
  },
  mounted() {
    if (this.edit) {
      for (const key in this.inputs) {
        this.inputs[key].value = this.passport[key].value
      }
    }
    if (this.type == EDO.FORIS_CODE && !this.edit) {
      if (this.isNewUserForis) return;
      const series = this.accountForis?.identification_document?.series ? this.accountForis.identification_document?.series : '';
      const number = this.accountForis?.identification_document?.number ? this.accountForis.identification_document?.number : '';
      this.inputs.series.value = series + number;
      this.inputs.issueDate.value = this.accountForis?.identification_document?.issue_date;
      this.inputs.issuePlace.value = this.accountForis?.identification_document?.issuer;
      this.inputs.birthDate.value = this.accountForis?.birthday;
      const name = this.accountForis?.customer_name?.split(' ')
      this.inputs.surname.value = name ? name[0] : '';
      this.inputs.name.value = name ? name[1] : '';
      this.inputs.patronymic.value = name ? name[2] : '';
    }
    if (this.type == EDO.LBSV_CODE && !this.edit) {
      this.inputs.series.value = `${this.accountLbsv?.passsernum} ${this.accountLbsv?.passno}`;
      this.inputs.issueDate.value = this.accountLbsv?.passissuedate?.split('-').reverse().join('.');
      this.inputs.issuePlace.value = this.accountLbsv?.passissuedep || '';
      this.inputs.birthDate.value = this.accountLbsv?.birthdate?.split('-').reverse().join('.');
      this.inputs.surname.value = this.accountLbsv?.abonentsurname || '';
      this.inputs.name.value = this.accountLbsv?.abonentname || '';
      this.inputs.patronymic.value = this.accountLbsv?.abonentpatronymic || '';
      this.inputs.birthPlace.value = this.accountLbsv?.birthplace || '';
      this.inputs.departmentCode.value = this.accountLbsv?.passissueplace || '';
    }
  },
  computed: {
    ...mapGetters({
      passport: 'docFlowB2c/passport',
      isTermAgr: 'docFlowB2c/isTerminationAgreement',
      docType: 'docFlowB2c/docType',
      task: 'docFlowB2c/task',
      accountForis: 'docFlowB2c/accountForis',
      accountLbsv: 'docFlowB2c/accountLbsv',
      isNewAgreement: 'docFlowB2c/isNewAgreement',
      documentsList: 'docFlowB2c/documentsList',
      isTransferChanel: 'docFlowB2c/isTransferChanel',
      onlyAct: 'docFlowB2c/onlyAct',
      regionID: 'regionID'
    }),
    disabled() {
      if (!this.isNewUserForis && this.type == EDO.FORIS_CODE) return false
      return Object.keys(this.computedInputs).some(key => {
        const isValid = this.inputs[key].valid ? this.inputs[key].valid(this.inputs[key].value) : true
        return !this.inputs[key].value || !isValid
      }) || this.loading
    },
    isPassport() {
      return !this.docType || this.docType == 'passport'
    },
    computedInputs() {
      const newInputs = { ...this.inputs };
      if (this.onlyAct && this.type == EDO.LBSV_CODE) {
        ['issuePlaceNoResident', 'idType', 'series', 'birthDate', 'birthPlace', 'issuePlace', 'issueDate',
          'departmentCode', 'startDate', 'endDate', 'addressRegistration', 'seriesRegDoc', 'nameRegDoc'].forEach(key => delete newInputs[key]);
        return newInputs
      }
      let delKeysForOtherDoc = []
      if (this.docType == 'noResident') {
        delKeysForOtherDoc = ['departmentCode', 'addressRegistration'];
      } else if (!this.isPassport) {
        delKeysForOtherDoc = ['issuePlaceNoResident', 'patronymic', 'addressRegistration', 'startDate', 'endDate', 'seriesRegDoc', 'nameRegDoc'];
        //['series', 'surname', 'name', 'birthDate', 'birthPlace', 'issuePlace', 'issueDate', 'departmentCode']
      } else {
        delKeysForOtherDoc = ['issuePlaceNoResident', 'idType', 'startDate', 'endDate', 'seriesRegDoc', 'nameRegDoc']
      }
      delKeysForOtherDoc.forEach(key => delete newInputs[key]);
      return newInputs
    },
    factAddress() {
      return `${this.task.address.city} ${this.task.address.street} ${this.task.address.house} ${this.task.address.flat}`
    },
    isDomofon() {
      return !!this.task?.services?.some(service => ['Домофон', 'Подключение МТС Домофон'].includes(service.operationType))
    },
    isNewUserForis() {
      return this.accountForis?.identification_document === null
    },
    pilotScan() {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
      return !isIos && [18, 43, 52, 45, 56, 16, 30, 34, 23, 61, 26, 29, 64, 22, 75, 42, 24, 54, 27, 62, 46, 57, 33, 35].includes(this.regionID)
    },
  },
  methods: {
    ...mapMutations('docFlowB2c', {
      setPassport: 'SET_PASSPORT',
      setOptionFiles: 'SET_OPTION_FILES'
    }),
    validation(method, value) {
      if (!method) return true
      return method(value)
    },
    scan() {
      this.$refs.file.click()
    },
    scanOptionalDoc() {
      this.$refs.optionFile.click()
    },
    handleOptionFilesUpload(event) {
      this.optionFiles.push(this.$refs.optionFile.files[0])
      const file = this.$refs.optionFile.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', this.readOptionFiles);
      reader.readAsDataURL(file);
      event.target.value = null;
    },
    readOptionFiles(event) {
      this.optionFilesBase64.push(event.target.result.split(',')[1]);
      this.setOptionFiles([...this.optionFilesBase64]);
    },
    handleFileUpload(event) {
      this.loading = true;
      this.file = this.$refs.file.files[0];
      const file = this.$refs.file.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', this.readFile);
      reader.readAsDataURL(file);
      event.target.value = null;
    },
    readFile(event) {
      const fullFile = event?.target?.result || event;
      this.fileBase64 = fullFile.split(',')[1];
      this.sendDoc()
    },
    async sendDoc() {
      try {
        this.loading = true;
        const response = await GoBiometrics.scanPassport(this.fileBase64)
        if (response.type == 'error') throw response;
        this.documentRecognition = response.data
        this.setInputs();
      } catch (error) {
        console.error('load document recognition error: ', error)
      } finally {
        this.loading = false;
      }
    },
    setInputs() {
      if (!this.documentRecognition) return;
      for (const key in this.inputs) {
        if (this.inputs[key]) {
          if (key == 'series') {
            this.inputs[key].value = `${this.documentRecognition[key]} ${this.documentRecognition.number}`
          } else {
            this.inputs[key].value = this.documentRecognition[key] || '-'
          }
        }
      }
    },
    reset() {
      for (const key in this.inputs) {
        if (this.inputs[key]) {
          this.inputs[key].value = ''
        }
      }
    },
    getDoc(doc) {
      this.fileBase64 = doc.split(',')[1];
      this.sendDoc()
    },
    goTo() {
      this.setPassport(this.inputs);
      const names = {
        [EDO.FORIS_CODE]: this.isNewUserForis ? 'doc-flow-address' : 'doc-flow-services',
        [EDO.LBSV_CODE]: this.onlyAct ? 'doc-flow-service-lbsv' : 'doc-flow-address-lbsv'
      }
      this.$router.push({
        name: names[this.type],
        params: {
          accountId: this.accountId,
          taskID: this.taskID,
          type: this.type
        },
      });
    },
    goToFinish() {
      this.setPassport(this.inputs);
      this.$router.push({
        name: "doc-flow-docs",
        params: {
          accountId: this.accountId,
        },
      });
    },
    onRecognizeStart(){
      this.documentRecognition = null;
    },
    onDocumentData(dd){
      this.documentRecognition = dd;
      this.setInputs();
    },
  }
})












