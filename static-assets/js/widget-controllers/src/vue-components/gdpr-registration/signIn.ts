import VeeValidate from 'vee-validate'
import Vue from 'vue'
import VueRecaptcha from 'vue-recaptcha'
import { ApiResponse, SignInRequest } from '../../models/social-api-model'
import { signInUser } from '../../services/user.service'
import initMdInput from '../material-components/md-input'
import initVerifyVueInstance from './verification';
import { isNull } from '../../util'

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
            password: "",
            fileInput: "",
            uploadedcertificatePath: "",
            directoryPath: "",
            fileName: "",
            isFormSubmitted: false,
            globalMsgDiv: "",
            isSubmitDisabled: false,
            showLoader: false,
            reCaptchaResponse: "",
            captchaError: "",
            passwordFieldType: 'password'
        },
        methods: {
            submit: function (e: Event) {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.isFormSubmitted = true;
                this.$validator.validate().then(async () => {
                    if (this.errors.items.length == 0) {
                        if (isNull(this.reCaptchaResponse)) {
                            this.captchaError = "Please verify captcha to proceed.";
                            return false;
                        }
                        this.isSubmitDisabled = true;
                        this.showLoader = true;
                        let payLoad: SignInRequest = {
                            data: {
                                email_id: this.email,
                                password: this.password,
                                captcha: this.reCaptchaResponse
                            }
                        };
                        let responseData: ApiResponse = await signInUser(payLoad);
                        if (responseData) {
                            this.showLoader = false;
                            this.isSubmitDisabled = false;
                        }
                        this.globalMsgDiv = responseData.data.message;
                        if (responseData.data.status === '1') {
                            window.location.reload();
                        } else if (responseData.data.status === '2') {
                            location.href = "/user-profile";
                        } else if (responseData.data.status === "999") {
                            initVerifyVueInstance(document.getElementById("verificationForm")!);
                            document.getElementById("verificationForm")!.classList.add("show");
                            document.querySelector(".modal-signin")!.classList.remove("show");
                        }
                        let recaptcha = this.$refs.recaptcha as any
                        recaptcha.reset();
                    }
                });
            },
            verifyCaptcha(response: string) {
                this.reCaptchaResponse = response;
                if (!isNull(this.reCaptchaResponse)) {
                    this.captchaError = ""
                }
            },
            onCaptchaExpired() {
                let recaptcha = this.$refs.recaptcha as any
                recaptcha.reset();
                this.reCaptchaResponse = '';
            },
            switchVisibility() {
                if (this.passwordFieldType === 'password') {
                    this.passwordFieldType = 'text'
                    setTimeout(() => {
                        this.passwordFieldType = 'password'
                    }, 1000);
                }
            },
            reset: function () {
                this.email = ""
                this.password = ""
                this.fileInput = ""
                this.uploadedcertificatePath = ""
                this.directoryPath = ""
                this.fileName = ""
                this.isFormSubmitted = false
                this.isSubmitDisabled = false
                this.globalMsgDiv = ""
                this.onCaptchaExpired()
                this.$validator.reset();
            },
        },
        components: { 'vue-recaptcha': VueRecaptcha }
    });
}