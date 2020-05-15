import VeeValidate from 'vee-validate'
import Vue from 'vue'
import VueRecaptcha from 'vue-recaptcha'
import { ApiResponse, ForgotPwdRequest } from '../../models/social-api-model'
import { forgotPwdUser } from '../../services/user.service'
import { isNull } from '../../util'
import initMdInput from '../material-components/md-input'

const dictionary = {
    en: {
        messages: {
            required: function (fieldName: string) {
                // return fieldName + " is required";\
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

export default function (Node: HTMLElement) {
    return new Vue({
        el: `#${Node.id}`,
        data: {
            email: "",
            fileInput: "",
            uploadedcertificatePath: "",
            directoryPath: "",
            fileName: "",
            isFormSubmitted: false,
            globalMsgDiv: "",
            isSubmitDisabled: false,
            showLoader: false,
            reCaptchaResponse: "",
            captchaError: ""
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
                        this.showLoader = true;
                        let payLoad: ForgotPwdRequest = {
                            data: {
                                email_id: this.email,
                                captcha: this.reCaptchaResponse
                            }
                        };
                        let responseData: ApiResponse = await forgotPwdUser(payLoad);
                        if (responseData) {
                            this.showLoader = false;

                        }
                        this.globalMsgDiv = responseData.data.message;
                        if (responseData.data.status === '4') {
                            setTimeout(function () {
                                location.reload();
                            }, 3500)
                        }
                    }
                });
            },
            verifyCaptcha(response: string) {
                this.reCaptchaResponse = response;
                if (!isNull(this.reCaptchaResponse)) {
                    this.captchaError = ""
                }
            },
            reset: function () {
                this.email = ""
                this.fileInput = ""
                this.uploadedcertificatePath = ""
                this.directoryPath = ""
                this.fileName = ""
                this.isFormSubmitted = false
                this.isSubmitDisabled = false
                this.globalMsgDiv = ""
                this.$validator.reset();
            },
        },
        components: { VueRecaptcha }
    });
}