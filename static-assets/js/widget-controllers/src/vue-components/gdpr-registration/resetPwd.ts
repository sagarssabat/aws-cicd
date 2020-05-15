import VeeValidate from 'vee-validate'
import Vue from 'vue'
import { ApiResponse, ResetPwdRequest } from '../../models/social-api-model'
import { resetPwdUser } from '../../services/user.service'
import { getQueryStringValue, isNull } from '../../util'
import initMdInput from '../material-components/md-input'
/**
 * Author:    Yash Mistry
 * Created:   26.02.2019
 * Description :  Dummy Team Reset Pwd form
 **/

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
VeeValidate.Validator.extend('strong_password', {
    getMessage: () => {
        return `Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ & ? etc)`;
    },
    validate: (value: any) => {
        var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        return strongRegex.test(value);
    }
});
export default function (Node: HTMLElement) {
    return new Vue({
        el: `#${Node.id}`,
        data: {
            resetkey: "",
            newPassword: "",
            confirmPassword: "",
            globalMsgDiv: "",
            isSubmitDisabled: false,
            showLoader: false,
        },
        methods: {
            submit: function (e: Event) {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.$validator.validate().then(async () => {
                    if (this.errors.items.length == 0 && this.resetkey) {
                        this.showLoader = true;
                        this.isSubmitDisabled = true;
                        let payLoad: ResetPwdRequest = {
                            data: {
                                reset_key: this.resetkey,
                                password: this.newPassword,
                                confirm_password: this.confirmPassword
                            }
                        };
                        let responseData: ApiResponse = await resetPwdUser(payLoad);
                        if (responseData) {
                            this.showLoader = false;
                            this.isSubmitDisabled = false;
                        }
                        this.globalMsgDiv = responseData.data.message;
                        if (responseData.data.status === '1') {
                            setTimeout(function () {
                                location.href = "/";
                            }, 3500)
                        }
                    } else {
                        this.globalMsgDiv = "Invalid data."
                    }
                });
            },
            reset: function () {
                this.newPassword = ""
                this.confirmPassword = ""
                this.isSubmitDisabled = false
                this.globalMsgDiv = ""
                this.$validator.reset();
            },
        },
        mounted() {
            this.resetkey = getQueryStringValue("reset")!
        }
    });
}