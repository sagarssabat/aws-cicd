import VeeValidate from 'vee-validate'
import Vue from 'vue'
import VueRecaptcha from 'vue-recaptcha'
import {
    City,
    CityApiRespone,
    State,
    StateApiRespone,
    StateCityQueryParams
} from '../../interfaces/state-city'
import {
    ApiResponse,
    GetProfileRequest,
    UpdateProfileRequest,
    URC_Cookie
} from '../../models/social-api-model'
import { getCities, getStates } from '../../services/address.service'
import { getProfileUser, updateProfileUser } from '../../services/user.service'
import {
    getCookieJSON,
    isNull,
    setCookie,
    triggerEventByCtrlName,
    deleteCookie
} from '../../util'
import Constants from '../../utils/constants'
import initfileUpload from '../file-uploads/s3-profile-img-input'
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
initfileUpload();

export default function (Node: HTMLElement) {
    return new Vue({
        el: `#${Node.id}`,
        data: {
            fullName: "",
            firstname: "",
            lastname: "",
            mobile: "",
            email: "",
            state: "",
            city: "",
            dob: "",
            gender: "",
            statedropdownHtml: "",
            citydropdownHtml: "",
            termsAndCondition: "",
            token: "",
            userGuid: "",
            imgSrc: "",
            epochTimestamp: "",
            profileCompletionPercentage: "",
            progressBarStyle: "",
            isHalfComplete: false,
            isFullComplete: false,
            fileInput: "",
            isFormSubmitted: false,
            globalMsgDiv: "",
            isSubmitDisabled: false,
            reCaptchaResponse: "",
            showLoader: false,
            isCustomImage: "0",
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
                        let socialImage = this.imgSrc;
                        if (this.isCustomImage == '0') {
                            socialImage = ''
                        }
                        let payLoad: UpdateProfileRequest = {
                            data: {
                                user: {
                                    name: this.fullName,
                                    mobile_no: this.mobile,
                                    social_user_image: socialImage,
                                    dob: this.dob,
                                    gender: this.gender,
                                    city_id: this.city,
                                    state_id: this.state
                                },
                                email_id: this.email,
                                user_guid: this.userGuid,
                                token: this.token,
                                epoch_timestamp: this.epochTimestamp,
                                captcha: this.reCaptchaResponse,
                                is_custom_image: this.isCustomImage
                            }
                        };
                        let responseData: ApiResponse = await updateProfileUser(payLoad);
                        if (responseData) {
                            this.showLoader = false;
                        }
                        if (responseData.data.status === '1') {
                            this.globalMsgDiv = "Your Profile has been updated Successfully.";
                            if (!isNull(responseData.data.gift_id) && responseData.data.gift_id != "0") {
                                setCookie(Constants.COOKIE_GRATIFICATION_GIFT, responseData.data.gift_name)
                                triggerEventByCtrlName("si-ads--widget-layout-01", "open-gratification-modal");
                            } else {
                                setTimeout(function () {
                                    location.reload();
                                }, 3500)
                            }
                        } else {
                            this.globalMsgDiv = responseData.data.message;
                            this.isSubmitDisabled = false;
                        }
                    }
                });
            },

            fillInputValues: function (responseData: ApiResponse) {
                this.fullName = responseData.data.user.name
                this.email = responseData.data.email_id
                this.mobile = responseData.data.user.mobile_no!
                this.state = responseData.data.user.state_id!
                this.city = responseData.data.user.city_id!
                this.dob = responseData.data.user.dob
                this.gender = responseData.data.user.gender!
                this.token = responseData.data.token!
                this.epochTimestamp = responseData.data.epoch_timestamp!
                this.profileCompletionPercentage = responseData.data.user.profile_completion_percentage!
                this.imgSrc = responseData.data.user.social_user_image!
                this.progressBarStyle = this.calculateProgressWidth()
                this.onStateChange();
            },

            calculateProgressWidth() {
                let width: string = ""
                if (!isNull(this.profileCompletionPercentage)) {
                    width = "calc(" + this.profileCompletionPercentage + "% - 10px)"
                    if (parseInt(this.profileCompletionPercentage) >= 50) {
                        this.isHalfComplete = true
                        if (parseInt(this.profileCompletionPercentage) == 100) {
                            this.isFullComplete = true
                        }
                    }
                }
                return width
            },

            verifyCaptcha(response: string) {
                this.reCaptchaResponse = response;
                if (!isNull(this.reCaptchaResponse)) {
                    this.captchaError = ""
                }
            },

            getUserProfile: async function () {
                let userCookie = getCookieJSON<URC_Cookie>('_URC');
                this.userGuid = userCookie!.user_guid;
                let payLoad: GetProfileRequest = {
                    token: this.userGuid
                };
                let responseData: ApiResponse = await getProfileUser(payLoad);
                if (responseData.data.status === "1") {
                    this.fillInputValues(responseData)
                } else {
                    deleteCookie('_URC')
                    location.href = "/"
                }
            },

            onStateChange: async function () {
                if (!isNull(this.state)) {
                    let stateIdValue = this.state
                    let queryParam: StateCityQueryParams = {
                        country_id: 101,
                        state_id: parseInt(stateIdValue)
                    }
                    let cityResponsedata: CityApiRespone = await getCities(queryParam)
                    let arrayOfCityObject: City[] = cityResponsedata.cities;
                    let listOfCities = arrayOfCityObject.map(function (cityObject: City) {
                        return `<option value="${cityObject.city_id}">${cityObject.name}</option>`
                    });
                    this.citydropdownHtml = listOfCities.join(" ").toString()
                }
            },
            imageUploaded() {
                this.isCustomImage = "1"
                console.log('is Custom Image: ', this.isCustomImage);
            },
            authorizeUser() {
                let userCookie = getCookieJSON<URC_Cookie>('_URC');
                if (isNull(userCookie!) || isNull(userCookie!.user_guid)) {
                    deleteCookie('_URC')
                    location.href = '/'
                }
            }
        },

        async mounted() {
            this.authorizeUser();
            this.getUserProfile();
            let queryParam: StateCityQueryParams = {
                country_id: 101
            }
            let stateResponsedata: StateApiRespone = await getStates(queryParam)
            let arrayOfStateObject: State[] = stateResponsedata.states;
            let listOfStates = arrayOfStateObject.map(function (stateObject: State) {
                return `<option value="${stateObject.state_id}">${stateObject.name}</option>`
            });
            this.statedropdownHtml = listOfStates.join(" ").toString()
        },
        components: { VueRecaptcha }
    });
}