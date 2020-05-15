import VeeValidate from 'vee-validate'
import Vue from 'vue'
import VueRecaptcha from 'vue-recaptcha'
import {
    Country,
    CountryApiRespone,
    City,
    CityApiRespone,
    State,
    StateApiRespone,
    StateCityQueryParams
} from '../../interfaces/state-city'
import { ApiResponse, RegisterRequest } from '../../models/social-api-model'
import { getCities, getStates, getCountries } from '../../services/address.service'
import { registerUser, checkUserExist, verifyOtp, sendOtp } from '../../services/user.service'
import { isNull } from '../../util'
import initMdInput from '../material-components/md-input'
import initMdSelect from '../material-components/md-select'

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
const messages = {
    en: {
        email: function () {
            return "Email is already in use."
        },
        required: function () {
            return "Email is already in use."
        }
    }
}
VeeValidate.Validator.localize(dictionary);
Vue.use(VeeValidate);

VeeValidate.Validator.extend('strong_password', {
    getMessage: () => {
        return `Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ & ? etc)`;
    },
    validate: (value: any) => {
        var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        return strongRegex.test(value);
    }
});

VeeValidate.Validator.extend('age_validator', {
    getMessage() {
        return 'Age should be 13+'
    },
    validate(value: any) {
        if (!isNull(value)) {
            let dateToCheck = '31-12-2006'
            let dateToCheckArray = dateToCheck.split('-')
            let valueArray = value.split('-')
            if (valueArray.length !== 3) {
                return false;
            }
            let res = new Date(parseInt(valueArray[0]), parseInt(valueArray[1]), parseInt(valueArray[2])) < new Date(parseInt(dateToCheckArray[2]), parseInt(dateToCheckArray[1]), parseInt(dateToCheckArray[0]))
            return res
        }
        return false;
    }
})

initMdInput();
initMdSelect();

export default function (Node: HTMLElement) {
    return new Vue({
        el: `#${Node.id}`,
        data: {
            fullName: "",
            mobile: "",
            email: "",
            password: "",
            cpassword: "",
            state: "",
            city: "",
            country: "",
            dob: "",
            gender: "male",
            termsAndCondition: false,
            statedropdownHtml: "",
            citydropdownHtml: "",
            stateLists: [] as object[],
            cityLists: [] as Array<any>,
            countryLists: [] as object[],
            fileInput: "",
            uploadedcertificatePath: "",
            directoryPath: "",
            fileName: "",
            isFormSubmitted: false,
            isIndia: true,
            globalMsgDiv: "",
            isSubmitDisabled: false,
            showLoader: false,
            reCaptchaResponse: "",
            captchaError: "",
            otp: "",
            otpVerifyStatus: false,
            passwordFieldType: 'password'
        },
        methods: {
            async submit(e: Event) {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.isFormSubmitted = true;
                this.$validator.validate().then(async () => {
                    if (this.errors.items.length == 0) {
                        await this.verifyOTP(e)
                        if (!this.otpVerifyStatus) {
                            this.globalMsgDiv = "Please verify your OTP to proceed.";
                            setTimeout(() => {
                                this.globalMsgDiv = "";
                            }, 2500);
                            return false;
                        }
                        if (this.reCaptchaResponse == "") {
                            this.captchaError = "Please fill captcha."
                            return;
                        }
                        this.isSubmitDisabled = true
                        this.showLoader = true;
                        let payLoad: RegisterRequest = {
                            data: {
                                user: {
                                    name: this.fullName,
                                    mobile_no: this.mobile,
                                    social_user_image: "",
                                    dob: this.dob,
                                    gender: this.gender,
                                    state_id: this.state,
                                    city_id: this.city,
                                    country_id: this.country
                                },
                                email_id: this.email,
                                otp: this.otp,
                                password: this.password,
                                confirm_password: this.cpassword,
                                captcha: this.reCaptchaResponse
                            }
                        };
                        let responseData: ApiResponse = await registerUser(payLoad);
                        if (responseData) {
                            this.showLoader = false;
                            this.isSubmitDisabled = false;
                        }
                        if (responseData.data.status === '3') {
                            this.globalMsgDiv = "Registration successful! Verification link has been sent to your e-mail address. Kindly verify the link to activate your account.";
                        } else {
                            this.globalMsgDiv = responseData.data.message;
                        }
                        setTimeout(function () {
                            location.href = "/";
                        }, 3500)
                    }
                });
            },
            async verifyEmailAddress(e: any) { // called on blur
                let valid = true;
                if (this.errors.items.length > 0) {
                    this.errors.items.forEach((el) => {
                        if (el.field == "email") {
                            valid = false;
                        }
                    });
                }
                if (valid) {
                    // verify email
                    let queryParam = {
                        email_id: this.email
                    };
                    let verifiedResponse: any = await checkUserExist(queryParam);
                    if (!isNull(verifiedResponse) && !isNull(verifiedResponse.data)) {
                        if (verifiedResponse.data.status == "1" && this.email != "") {
                            document.getElementById("RegEmailVerifErrorSpan")!.classList.remove("show");
                        } else if (verifiedResponse.data.status == "0" && this.email != "") {
                            document.getElementById("RegisterEmail")!.focus();
                            document.getElementById("RegEmailVerifErrorSpan")!.classList.add("show");
                            setTimeout(function () {
                                document.getElementById("RegEmailVerifErrorSpan")!.classList.remove("show");
                            }, 2000);
                        }
                    }
                }
            },
            async verifyMobileNumber() { // called on blur
                let valid = true;
                if (this.errors.items.length > 0) {
                    this.errors.items.forEach((el) => {
                        if (el.field == "mobile") {
                            valid = false;
                        }
                    });
                }
                if (valid) {
                    // verify phone
                    let queryParam = {
                        mobile_no: this.mobile
                    };
                    let verifiedResponse = await checkUserExist(queryParam);
                    if (!isNull(verifiedResponse)) {
                        if (verifiedResponse.data.status == "1" && this.mobile != "") {
                            document.getElementById("RegMobileVerifErrorSpan")!.classList.remove("show");
                        } else if (verifiedResponse.data.status == "0" && this.mobile != "") {
                            document.getElementById("RegisterMobile")!.focus();
                            document.getElementById("RegMobileVerifErrorSpan")!.classList.add("show");
                            setTimeout(function () {
                                document.getElementById("RegMobileVerifErrorSpan")!.classList.remove("show");
                            }, 2000);
                        }
                    }
                }
            },
            async verifyOTP(e: any) { // called on blur
                let valid = true;

                if (this.errors.items.length > 0) {
                    this.errors.items.forEach((el) => {
                        if (el.field == "otp") {
                            valid = false;
                        }
                    });
                }
                if (valid) {
                    // verify otp payload
                    let payload = {
                        data: {
                            mobile_no: this.mobile,
                            otp: this.otp
                        }
                    };
                    let verifiedResponse = await verifyOtp(payload);
                    if (!isNull(verifiedResponse)) {
                        if (!isNull(verifiedResponse.data)) {
                            if (verifiedResponse.data.status == "1") {
                                this.otpVerifyStatus = true;
                                $("#RegisterMobile").attr("disabled", "disabled");
                                document.getElementById("RegOTPVerifErrorSpan")!.innerText = "OTP Successfully verified!"
                                document.getElementById("RegOTPVerifErrorSpan")!.classList.add("show");
                                setTimeout(function () {
                                    document.getElementById("RegOTPVerifErrorSpan")!.classList.remove("show");
                                }, 2000);
                                $("#regSendOTPBtn").hide();
                            } else {
                                this.otpVerifyStatus = false;
                                document.getElementById("reg_otp")!.focus();
                                document.getElementById("RegOTPVerifErrorSpan")!.classList.add("show");
                                setTimeout(function () {
                                    document.getElementById("RegOTPVerifErrorSpan")!.classList.remove("show");
                                }, 2000);

                            }
                        } else {
                            this.otpVerifyStatus = false;
                            document.getElementById("reg_otp")!.focus();
                            document.getElementById("RegOTPVerifErrorSpan")!.classList.add("show");
                            setTimeout(function () {
                                document.getElementById("RegOTPVerifErrorSpan")!.classList.remove("show");
                            }, 2000);
                        }
                    }
                }
            },
            async sendOTP(e?: any) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
                if (isNull(this.mobile)) {
                    return false;
                }

                // Function to verify mobile number first
                let valid = true;
                if (this.errors.items.length > 0) {
                    this.errors.items.forEach((el) => {
                        if (el.field == "mobile") {
                            valid = false;
                        }
                    });
                }
                if (valid) {
                    // verify phone
                    let queryParam = {
                        mobile_no: this.mobile
                    };
                    let verifiedResponse = await checkUserExist(queryParam);
                    if (!isNull(verifiedResponse)) {
                        if (verifiedResponse.data.status == "1" && this.mobile != "") {
                            document.getElementById("RegMobileVerifErrorSpan")!.classList.remove("show");
                            // Call otp thingy
                            let payload = {
                                data: {
                                    mobile_no: this.mobile
                                }
                            }
                            let otpSentResponse = await sendOtp(payload);
                            if (!isNull(otpSentResponse)) {
                                if (otpSentResponse.data.status == "1") {
                                    // For time being, to be removed
                                    document.getElementById("regSendOTPBtn")!.innerHTML = "Resend OTP"
                                    if (!isNull(otpSentResponse.data.otp)) {
                                        console.log("The OTP is => ", otpSentResponse.data.otp);
                                    }
                                }
                            }
                        } else if (verifiedResponse.data.status == "0" && this.mobile != "") {
                            document.getElementById("RegisterMobile")!.focus();
                            document.getElementById("RegMobileVerifErrorSpan")!.classList.add("show");
                            setTimeout(function () {
                                document.getElementById("RegMobileVerifErrorSpan")!.classList.remove("show");
                            }, 2000);
                        }
                    }
                }
            },
            onCaptchaExpired() {
                let recaptcha = this.$refs.recaptcha as any
                recaptcha.reset();
                this.reCaptchaResponse = '';
                this.captchaError = 'Captch is Required'
            },
            reset: function () {
                this.fullName = ""
                this.mobile = ""
                this.email = ""
                this.password = ""
                this.cpassword = ""
                this.state = ""
                this.city = ""
                this.country = ""
                this.dob = ""
                this.gender = ""
                this.fileInput = ""
                this.uploadedcertificatePath = ""
                this.directoryPath = ""
                this.fileName = ""
                this.globalMsgDiv = ""
                this.isFormSubmitted = false
                this.isSubmitDisabled = false
                this.isIndia = false
                this.otp = ""
                this.termsAndCondition = false
                this.onCaptchaExpired()
                this.$validator.reset();
                // New addition
            },
            verifyCaptcha(response: string) {
                this.reCaptchaResponse = response;
                if (!isNull(this.reCaptchaResponse)) {
                    this.captchaError = ""
                }
            },
            onStateChange: async function (e: Event) {
                let stateIdValue = this.state
                let queryParam: StateCityQueryParams = {
                    country_id: 101,
                    state_id: parseInt(stateIdValue)
                }
                let cityResponsedata: CityApiRespone = await getCities(queryParam)
                let arrayOfCityObject: City[] = cityResponsedata.cities;
                this.cityLists = arrayOfCityObject;
            },
            // onCountryChange: async function (e: number | string) {
            //     if (e == '101') {
            //         this.isIndia = true
            //         let queryParam: StateCityQueryParams = {
            //             country_id: 101
            //         }
            //         let stateResponsedata: StateApiRespone = await getStates(queryParam)
            //         let arrayOfStateObject: State[] = stateResponsedata.states;
            //         this.stateLists = arrayOfStateObject;
            //     } else {
            //         this.isIndia = false
            //         this.state = ""
            //         this.city = ""
            //     }
            // },
            // fetchCountry: async function () {
            //     let countryResponsedata: CountryApiRespone = await getCountries()
            //     let arrayOfCountryObject: Country[] = countryResponsedata.countries;
            //     this.countryLists = arrayOfCountryObject;
            // },
            fetchState: async function () {
                let queryParam: StateCityQueryParams = {
                    country_id: 101
                }
                let stateResponsedata: StateApiRespone = await getStates(queryParam)
                let arrayOfStateObject: State[] = stateResponsedata.states;
                this.stateLists = arrayOfStateObject;

            },
            switchVisibility() {
                if (this.passwordFieldType === 'password') {
                    this.passwordFieldType = 'text'
                    setTimeout(() => {
                        this.passwordFieldType = 'password'
                    }, 1000);
                }
            }


        },

        mounted() {
            // this.fetchCountry();
            this.fetchState()

        },
        components: { VueRecaptcha }
    });
} 