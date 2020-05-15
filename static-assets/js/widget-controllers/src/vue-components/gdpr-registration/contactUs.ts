import VeeValidate from 'vee-validate'
import Vue from 'vue'
import VueRecaptcha from 'vue-recaptcha'
import { contactUsUser } from '../../services/miscellaneous.service'
import { isNull } from '../../util'
import initMdInput from '../material-components/md-input'
import initMdTextArea from '../material-components/md-textArea'
import {
  ContactUsRequest,
} from '../../interfaces/contactUsApi'

const dictionary = {
  en: {
    messages: {
      required: function (fieldName: string) {
        return "Field is required";
      },
      email: function () {
        return "Invalid email";
      },
      is_not: function () {
        return "Field is required"
      }
    }
  }
};
VeeValidate.Validator.localize(dictionary);
Vue.use(VeeValidate);
initMdInput();
initMdTextArea();

export default function (Node: HTMLElement) {
  return new Vue({
    el: `#${Node.id}`,
    data: {
      name: "",
      email: "",
      mobileno: "",
      subject: "",
      message: "",
      isActive: false,
      reCaptchaResponse: "",
      isFormSubmitted: false,
      globalMsgDiv: "",
      isSubmitDisabled: false,
      captchaError: "",
      showLoader: false
    },
    methods: {
      submit: function (e: Event) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.isFormSubmitted = true;
        this.$validator.validate().then(async () => {
          if (this.errors.items.length == 0) {
            if (this.reCaptchaResponse == "") {
              this.captchaError = "Please fill captcha."
              return;
            }
            this.isSubmitDisabled = true
            this.showLoader = true
            let payLoad: ContactUsRequest = {
              grcaptcha: this.reCaptchaResponse,
              page_flag: "1",
              send_mail: "0",
              data: {
                full_name: this.name,
                email_id: this.email,
                mobile: this.mobileno,
                message: this.message,
                subject: this.subject,
                send_email_id: ""
              },
            };
            let responseData: string = await contactUsUser(payLoad);
            if (responseData === '1') {
              this.globalMsgDiv = "Thank you! Your query has been successfully sent. We will contact you very soon!";
              setTimeout(() => {
                location.reload();
              }, 3500)
            } else {
              this.globalMsgDiv = "Something went wrong, please try again"
            }

            this.showLoader = false
            this.isSubmitDisabled = false
          }
        });
      },
      reset: function () {
        this.name = ""
        this.mobileno = ""
        this.email = ""
        this.subject = ""
        this.isFormSubmitted = false
        this.isSubmitDisabled = false
        this.showLoader = false
        this.$validator.reset();
      },
      verifyCaptcha(response: string) {
        this.reCaptchaResponse = response;
        if (!isNull(this.reCaptchaResponse)) {
          this.captchaError = ""
        }
      },
      applyFocusIn: function () {
        this.isActive = true;
      },
      applyFocusOut: function () {
        if (isNull(this.message)) {
          this.isActive = false;
        }
      }
    },
    mounted() {

    },
    components: { VueRecaptcha }
  });
}