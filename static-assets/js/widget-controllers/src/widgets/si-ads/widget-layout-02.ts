import {
  ApplicationObj
} from "../../main";
import {
  Controller
} from "stimulus";
import initUpdateProfileVueinstance from '../../vue-components/gdpr-registration/updateProfile';
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
  UpdateProfileRequest,
  URC_Cookie,
  ChangePassward
} from '../../models/social-api-model'
import { getCities, getStates } from '../../services/address.service'
import { getProfileUser, updateProfileUser, changePwd } from '../../services/user.service'
import {
  getCookieJSON,
  isNull,
  setCookie,
  triggerEventByCtrlName,
  deleteCookie
} from '../../util'
import Constants from '../../utils/constants'
import initfileUpload from '../../vue-components/file-uploads/s3-profile-img-input'
import initMdInput from '../../vue-components/material-components/md-input'
import { UserProfile } from '../../models/user.profile';
import { ShareType, SocialShareObject } from '../../interfaces/social-share';
import { ShareUtil } from '../../utils/share.util'
import { MemberShipQueryParam } from '../../interfaces/membership.interface';
import { getMembershipListing } from '../../services/membership.service';
import PerfectScrollbar from 'perfect-scrollbar';


declare global {
  interface Window {
    ga: any
  }
}


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
VeeValidate.Validator.extend('verify_password', {
  getMessage: (field: any) => `The password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ & ? etc)`,
  validate: (value: any) => {
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
    return strongRegex.test(value)
  }
})
initMdInput();
initfileUpload();

class userProfile extends Controller {

  updateProfileVueinstance: any;
  updateProfileFormTarget: HTMLElement;
  changePasswordModalTarget: HTMLElement;
  onUpdatePasswordClickedTarget: HTMLElement;
  cardBenefitTarget: HTMLElement;
  shareSocialTarget: HTMLElement;
  changePasswordInstance: Vue;
  userData: ApiResponse
  invoiceDownloadClickListner: any

  static targets = [
    'updateProfileForm',
    'changePasswordModal',
    'onUpdatePasswordClicked',
    'shareSocial',
    'cardBenefit'
  ]

  connect() {
    //this.updateProfileVueinstance = initUpdateProfileVueinstance(this.updateProfileFormTarget);
    this.initiateProfile(this.updateProfileFormTarget)
    this.initChangePassword()
    this.initUpdatePassword()
    this.initBenefitPopup()

    if (isNull(this.invoiceDownloadClickListner)) {
      let InvoiceDownload = document.getElementById('downloadBtn')
      this.invoiceDownloadClickListner = InvoiceDownload!.addEventListener('click', () => {
        window.ga('send', {
          hitType: 'event',
          eventCategory: 'MembershipDownloadInvoice',
          eventAction: 'download',
          eventLabel: 'Click membership Download Invoice'
        })
      })
    }
  }

  initiateProfile(Node: HTMLElement) {
    let context = this
    new Vue({
      el: `#${Node.id}`,
      data: {
        fullName: "",
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
        captchaError: "",
        cardType: "",
        expiryDate: "",
        campaign_id: "",
        imgPath: "",
        cardImgUrl: "",
        delivery_via: "",
        tracking_id: "",
        delivery_status: "",
        delivery_date: "",
        invoice_link: "",
        partialRefund: false,
        showBtn: false
      },
      methods: {
        submit: function (e: Event) {
          e.preventDefault();
          e.stopImmediatePropagation()
          this.isFormSubmitted = true
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
              this.userGuid = getCookieJSON<URC_Cookie>("_URC")!.user_guid;
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
          if (!isNull(responseData.data.user.campaign_json!.expiry_date!)) {
            let expdate = responseData.data.user.campaign_json!.expiry_date!.split(" ")
            let date = expdate[0]!.split('-')
            let year = date[0].split('0')
            this.expiryDate = date[1] + '/' + year[1]
          } else {
            this.expiryDate = ''
          }
          this.delivery_via = responseData.data.user.campaign_json!.service_provider
          if (!isNull(responseData.data.user.campaign_json!.date_of_dispatch)) {
            let d = new Date(responseData.data.user.campaign_json!.date_of_dispatch)
            let month = d.toLocaleString('default', { month: 'long' });
            let dd = d.getDate()
            let yy = d.getFullYear()
            this.delivery_date = dd + ' ' + month + ' ' + yy;
          }
          else {
            this.delivery_date = ''
          }
          this.tracking_id = responseData.data.user.campaign_json!.aw_bill_number
          this.delivery_status = responseData.data.user.campaign_json!.courier_status
          this.cardType = responseData.data.user.campaign_json!.product_name!
          this.campaign_id = responseData.data.user.campaign_id!
          this.invoice_link = responseData.data.user.campaign_json!.invoice_link
          if (this.invoice_link == "" || this.invoice_link == null) {
            this.partialRefund = true;
          }
          this.cardImgUrl = '../static-assets/images/cssimages/member-cards/' + this.cardType!.split(" ")[0] + '.png'
          this.checkStatusCard()
          this.checkCourierStatus()
        },
        onClickshare() {
          context.shareSocialToggle()
        },

        checkStatusCard() {
          var values = ['6', '5', '4', '3'];
          this.campaign_id
          if (values.indexOf(this.campaign_id) !== -1) {
            $('#upgrade').remove()
          }
          else {
            $('#benefitBtn').remove()
            $('#downloadBtn').remove()
            $('.courier-details').remove()
          }
          this.showBtn = true;
        },
        checkCourierStatus() {
          if ((isNull(this.delivery_via) && isNull(this.delivery_date) && isNull(this.tracking_id)) || this.delivery_status == 'delivered') {
            $('.courier-details').remove()
          }
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
        generateImage(responseData: ApiResponse) {
          context.shareSocialTarget.classList.add('loading')
          let status = responseData.data.user.campaign_id!
          let expdate = responseData.data.user.campaign_json!.expiry_date!.split(" ")
          let expiryDate = "";
          if (expdate[0] == "") {
            expiryDate = "";
          } else {
            let date = expdate[0]!.split('-')
            let year = date[0].split('0')
            expiryDate = date[1] + '/' + year[1]; // The expiry date to be displayed
          }
          let userId = responseData.data.token
          let templateUrl = ''
          // change the conditions below based on membership status
          if (status === '1') {
            templateUrl = 'https://www.dummyTeam.com/static-resources/campaigns/membership/template/blue-card.pug'
          } else if (status === '3') {
            templateUrl = 'https://www.dummyTeam.com/static-resources/campaigns/membership/template/silver-card.pug'
          } else if (status === '4') {
            templateUrl = 'https://www.dummyTeam.com/static-resources/campaigns/membership/template/gold-card.pug'
          } else if (status === '5') {
            templateUrl = 'https://www.dummyTeam.com/static-resources/campaigns/membership/template/platinum-card.pug'
          } else if (status === '6') {
            templateUrl = 'https://www.dummyTeam.com/static-resources/campaigns/membership/template/diamond-card.pug'
          }
          let payloadData = {
            templateUrl: `${templateUrl}?v=${new Date().getTime()}`,
            templateData: {
              membership: {
                name: responseData.data.user.name, // replace this with actual name
                expiry: expiryDate // replace this with actual expiry in MM/YY format
              }
            }
          }
          // Replace the userId below with actual userId
          let imageKey = `prod/campaigns/membership/images/${userId}.jpg`;
          this.imgPath = `https://www.dummyTeam.com/static-resources/campaigns/membership/images/${userId}.jpg?v=${new Date().getTime()}`
          let shareLinkPayload = {
            url: 'https://464okvtx8d.execute-api.ap-south-1.amazonaws.com/prod/getHtml',
            format: 'jpg',
            opType: 'POST',
            postData: JSON.stringify(payloadData),
            bucket: 'assets-dummyTeam.sportz.io',
            key: imageKey,
            width: '375',
            height: '240'
          }
          fetch("https://v0yzv923b6.execute-api.ap-south-1.amazonaws.com/dev/ImageGenerator", {
            method: "POST",
            mode: 'no-cors',
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(shareLinkPayload)
          })
            .then(function (data) {
              // this is success
              context.shareSocialTarget.classList.remove('loading')
            })
            .catch((err) => {
              console.error('err: ', err)
            });
        },

        getUserProfile: async function () {

          let userProfile = UserProfile.getInstance()
          if (isNull(userProfile.userData)) {
            userProfile.userData = await userProfile.fetchUserData()
          }
          context.userData = userProfile.userData
          let responseData = context.userData

          if (responseData.data.status === "1") {
            this.fillInputValues(responseData)
            this.generateImage(responseData)
          } else {
            deleteCookie('_URC')
            location.href = "/"
          }
        },
        downloadCard() {
          window.ga('send', {
            hitType: 'event',
            eventCategory: 'MembershipDownloadCard',
            eventAction: 'download',
            eventLabel: 'Click membership download card'
          })


        },

        listingShare(e: Event) {
          e.preventDefault()
          e.stopImmediatePropagation()
          let shareType: ShareType = $(e.target!).attr('data-sharetype')!.toString() as ShareType
          let shareObj: SocialShareObject = {
            url: Constants.MEMBERSHIP_URL,
            title: `${this.imgPath} \n\n ${Constants.MEMBERSHIP_SHARE_TITLE} \n\n ${Constants.MEMBERSHIP_URL} \n\n`,
            description: Constants.MEMBERSHIP_SHARE_DESCRIPTION,
            imgPath: this.imgPath
          }
          ShareUtil.share(shareType, shareObj)
          window.ga('send', {
            hitType: 'event',
            eventCategory: 'MembershipSocialShare',
            eventAction: 'click',
            eventLabel: 'Click membership Social share'
          })
          console.log('done')

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
        },

        onChangePasswordClicked() {
          context.toggleChangePassword()
        },
        onUpdatePasswordClicked() {
          context.toggleUpdatePassword()
        },
        onCardBenefitClicked() {
          context.toggleCardsBenefit()
        },
        editProfilePage() {

          document.querySelector(".custom-form")!.querySelectorAll("input").forEach((el) => {
            el.disabled = false;
          });
          document.querySelector(".custom-form")!.querySelectorAll("select").forEach((el) => {
            el.disabled = false;
          });
          $("#email").attr("disabled", "disabled");
          $("#mobile").attr("disabled", "disabled");
          $('#fileInput').removeAttr("disabled")
          $("#updateProfileForm").removeClass('form-disabled')
          let chgpsd = document.getElementById('chngpsd') as HTMLButtonElement
          chgpsd.disabled = false
          let updAd = document.getElementById('updAdd') as HTMLButtonElement
          updAd.disabled = false

        },
        disableFields() {
          document.querySelector(".custom-form")!.querySelectorAll("input").forEach((el) => {
            el.disabled = true;
          });
          document.querySelector(".custom-form")!.querySelectorAll("select").forEach((el) => {
            el.disabled = true;
          });
          $("#fileInput").attr("disabled", "disabled")
          $("#updateProfileForm").addClass('form-disabled')
          let chgpsd = document.getElementById('chngpsd') as HTMLButtonElement
          chgpsd.disabled = true
          let updAd = document.getElementById('updAdd') as HTMLButtonElement
          updAd.disabled = true

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
        this.disableFields()
      },
      components: { VueRecaptcha }
    });
  }

  initChangePassword() {
    let context = this
    this.changePasswordInstance = new Vue({
      el: "#changePassword",
      data: {
        oldpassward: "",
        passward: "",
        confirmpwd: "",
        message: "",
        reCaptchaResponse: "",
        captchaError: "",
        passwordFieldType: 'password'
      },
      methods: {
        resetForm: function () {
          this.oldpassward = ''
          this.passward = ''
          this.confirmpwd = ''
          this.message = ''
          this.errors.clear()
        },

        onChangePasswordClicked() {
          context.toggleChangePassword()
          this.resetForm()
        },
        switchVisibility() {
          if (this.passwordFieldType === 'password') {
            this.passwordFieldType = 'text'
            setTimeout(() => {
              this.passwordFieldType = 'password'
            }, 1000);
          }
        },

        submit: function (e: Event) {
          e.preventDefault();
          e.stopImmediatePropagation();
          let userCookie = getCookieJSON<URC_Cookie>('_URC');
          let userGuid = userCookie!.user_guid;
          this.$validator.validate().then(async () => {
            if (this.errors.items.length == 0) {
              if (isNull(this.reCaptchaResponse)) {
                this.captchaError = "Please verify captcha to proceed.";
                return false;
              }
              let payLoad: ChangePassward = {
                data: {
                  user_guid: userGuid,
                  password: this.passward,
                  confirm_password: this.confirmpwd,
                  old_password: this.oldpassward,
                  captcha: this.reCaptchaResponse
                }
              };
              let responseData: ApiResponse = await changePwd(payLoad)
              if (!isNull(responseData)) {
                this.message = responseData.data.message
                setTimeout(() => {
                  context.toggleChangePassword()
                  this.resetForm()
                }, 3000)
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
        mounted() {
          this.resetForm()
          this.errors.clear()
        },


      },
      components: { 'vue-recaptcha': VueRecaptcha }

    })

  }

  initUpdatePassword() {
    let context = this
    new Vue({
      el: "#updatePassword",
      data: {},
      methods: {
        onUpdatePasswordClicked() {
          context.toggleUpdatePassword()
        },
      }

    })

  }

  initBenefitPopup() {
    let context = this
    new Vue({
      el: "#benefit",
      data: {},
      methods: {
        onCardBenefitClicked() {
          context.toggleCardsBenefit()
        },
        async getListingData() {
          let queryParams: MemberShipQueryParam = {
            pgnum: "1",
            inum: "10",
            pgsize: "10",
            p_product_typeid: "",
            entities: document.getElementById("membershipTopDiv")!.getAttribute("data-entityType")!,
            otherent: "",
            p_searchkeyword: ""
          }
          let apiResponse = await getMembershipListing(queryParams);
          let initialListingData = apiResponse.data!
          //user profile
          let userProfile = UserProfile.getInstance()

          if (isNull(userProfile.userData)) {
            userProfile.userData = await userProfile.fetchUserData()
          }
          context.userData = userProfile.userData
          let responseData = context.userData
          let status = responseData.data.user.campaign_id!
          initialListingData.forEach((el: any) => {
            if (el.product_id == status) {
              document.getElementById("knowMoreContentBody")!.innerHTML = el.description;

            }
          })

        }

      },
      mounted() {
        this.getListingData()
      }

    })

  }


  shareSocialToggle() {
    if (!this.shareSocialTarget.classList.contains('loading')) {
      if (this.shareSocialTarget.classList.contains('active')) {
        this.shareSocialTarget.classList.remove('active')
      } else {
        this.shareSocialTarget.classList.add('active')
      }
    }
  }

  toggleChangePassword() {
    if (this.changePasswordModalTarget.classList.contains('show')) {
      this.changePasswordModalTarget.classList.remove('show')
      document.body.classList.remove("no-scroll");
    } else {
      this.changePasswordModalTarget.classList.add('show')
      document.body.classList.add("no-scroll");
      let scrollContainer = document.querySelector('.content-body-selector-three') as HTMLElement
      new PerfectScrollbar(scrollContainer);
    }
  }

  toggleUpdatePassword() {
    if (this.onUpdatePasswordClickedTarget.classList.contains('show')) {
      this.onUpdatePasswordClickedTarget.classList.remove('show')
      document.body.classList.remove("no-scroll");
    } else {
      this.onUpdatePasswordClickedTarget.classList.add('show')
      document.body.classList.add("no-scroll");
      let scrollContainer = document.querySelector('.content-body-selector-two') as HTMLElement
      new PerfectScrollbar(scrollContainer);
    }
  }

  toggleCardsBenefit() {
    if (this.cardBenefitTarget.classList.contains('show')) {
      this.cardBenefitTarget.classList.remove('show')
      document.body.classList.remove("no-scroll");
    } else {
      this.cardBenefitTarget.classList.add('show')
      document.body.classList.add("no-scroll");
      let scrollContainer = document.querySelector('.content-body-selector-one') as HTMLElement
      new PerfectScrollbar(scrollContainer);
    }
  }

}
export default () => ApplicationObj.register("si-ads--widget-layout-02", userProfile);