import VeeValidate from 'vee-validate';
import Vue from 'vue';
import VueRecaptcha from 'vue-recaptcha';
import initMdInput from '../material-components/md-input'
import { checkUserExist, updateTnC } from '../../services/user.service';
import { isNull, getCookieJSON } from '../../util';
import { verifyOtp } from '../../services/user.service';
import { sendOtp } from '../../services/user.service';
import { getProfileUser } from '../../services/user.service';
import { URC_Cookie, SignInRequest } from '../../models/social-api-model';
import ConfettiGenerator from "confetti-js";
import { UserProfile } from '../../models/user.profile';

window.onload = async () => {
  return false;
  let userProfile = UserProfile.getInstance()
  if (isNull(userProfile.userData)) {
    // console.log('User-Data-Menu: ', `${new Date()} - ${userProfile.isFetching}`)
    userProfile.userData = await userProfile.fetchUserData()
  }
  let userData = userProfile.userData
  let userName = userData.data.user.name; // The username to be displayed
  let expdate = userData.data.user.campaign_json!.expiry_date!.split(" ")
  let date = expdate[0]!.split('-')
  let year = date[0].split('0')
  let expiryDate = date[1] + '/' + year[1]; // The expiry date to be displayed
  let userId = userData.data.token!;
  $("#successNAmeUpper").text(userName);
  $("#successNameCard").text(userName);
  $("#expiryDate").text(expiryDate);

  let templateUrl = "https://www.dummyTeam.com/static-resources/campaigns/membership/template/blue-card.pug";
  let payloadData = {
    templateUrl: `${templateUrl}?v=${new Date().getTime()}`,
    templateData: {
      membership: {
        name: userName, // replace this with actual name
        expiry: expiryDate // replace this with actual expiry in MM/YY format
      }
    }
  }

  // Replace the userId below with actual userId
  let imageKey = `prod/campaigns/membership/images/${userId}.jpg`;
  let imgPath = `https://www.dummyTeam.com/static-resources/campaigns/membership/images/${userId}.jpg?v=${new Date().getTime()}`
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
      if (document.getElementById("socialShareBtn")!.classList.contains("loading")) {
        document.getElementById("socialShareBtn")!.classList.remove("loading");
        document.getElementById("downloadLink")!.setAttribute("href", imgPath);
        document.getElementById("shareIconsUl")!.setAttribute("imgPath", imgPath);
      }
    })
    .catch((err) => {
      console.error('err: ', err)
    });

  document.querySelector(".modal-successful-verif")!.classList.add("show");
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
initMdInput();

export default function (Node: HTMLElement) {
  return new Vue({
    el: `#${Node.id}`,
    data: {
      email: "",
      mobile: "",
      otp: "",
      isSubmitDisabled: false,
      globalMsgDiv: "",
      showLoader: false,
      isFormSubmitted: false
    },
    methods: {
      submit: async function (e: Event) {
        e.preventDefault();
        e.stopImmediatePropagation();

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
            if (verifiedResponse.data.status == "1") {
              // this.otpVerifyStatus = true;
              $("#VerifyMobile").attr("disabled", "disabled");
              document.getElementById("VerifOTPVerifErrorSpan")!.innerText = "OTP Successfully verified!"
              document.getElementById("VerifOTPVerifErrorSpan")!.classList.add("show");
              setTimeout(function () {
                document.getElementById("VerifOTPVerifErrorSpan")!.classList.remove("show");
              }, 2000);

              // CALL SUBMIT FUNCTION
              this.isFormSubmitted = true;
              this.$validator.validate().then(async () => {
                // if (!this.otpVerifyStatus) {
                //   this.globalMsgDiv = "Please verify your OTP to proceed.";
                //   setTimeout(() => {
                //     this.globalMsgDiv = "";
                //   }, 2500);
                //   return false;
                // }
                if (this.errors.items.length == 0) {
                  this.isSubmitDisabled = true;
                  this.showLoader = true;
                  let payload = {
                    data: {
                      user_guid: getCookieJSON<URC_Cookie>("_URC")!.user_guid,
                      otp: this.otp,
                      is_active: "1",
                      user: {
                        mobile_no: this.mobile,
                      }
                    }
                  }
                  let responseData: any = await updateTnC(payload);
                  if (!isNull(responseData)) {
                    if (responseData.data.status == "1") {
                      // show the success popup
                      // document.getElementById("successNAme")!.innerHTML = getCookieJSON<URC_Cookie>("_URC")!.name;
                      document.querySelector(".modal-successful-verif")!.classList.add("show");
                      document.getElementById("verificationForm")!.classList.remove("show");
                      this.getImageData();
                      this.callConfettiFunc();
                      document.body.classList.add("no-scroll");
                    } else {
                      this.globalMsgDiv = "Please try again after some time.";
                      setTimeout(() => {
                        this.globalMsgDiv = "";
                      }, 2500);
                    }
                  }
                }
              });

            } else {
              document.getElementById("verif_otp")!.focus();
              document.getElementById("VerifOTPVerifErrorSpan")!.classList.add("show");
              setTimeout(function () {
                document.getElementById("VerifOTPVerifErrorSpan")!.classList.remove("show");
              }, 2000);
              // this.otpVerifyStatus = false;
            }
          }
        }
      },

      async getImageData() {
        let userProfile = UserProfile.getInstance()
        if (isNull(userProfile.userData)) {
          // console.log('User-Data-Menu: ', `${new Date()} - ${userProfile.isFetching}`)
          userProfile.userData = await userProfile.fetchUserData()
        }
        let userData = userProfile.userData
        let userName = userData.data.user.name; // The username to be displayed
        let expdate = userData.data.user.campaign_json!.expiry_date!.split(" ")
        let expiryDate = "";
        if (expdate[0] == "") {
          expiryDate = "";
        } else {
          let date = expdate[0]!.split('-')
          let year = date[0].split('0')
          expiryDate = date[1] + '/' + year[1]; // The expiry date to be displayed
        }
        let userId = userData.data.token!;
        $("#successNAmeUpper").text(userName);
        $("#successNameCard").text(userName);
        $("#expiryDate").text(expiryDate);

        let templateUrl = "https://www.dummyTeam.com/static-resources/campaigns/membership/template/blue-card.pug";
        let payloadData = {
          templateUrl: `${templateUrl}?v=${new Date().getTime()}`,
          templateData: {
            membership: {
              name: userName, // replace this with actual name
              expiry: expiryDate // replace this with actual expiry in MM/YY format
            }
          }
        }

        // Replace the userId below with actual userId
        let imageKey = `prod/campaigns/membership/images/${userId}.jpg`;
        let imgPath = `https://www.dummyTeam.com/static-resources/campaigns/membership/images/${userId}.jpg?v=${new Date().getTime()}`
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
            if (document.getElementById("socialShareBtn")!.classList.contains("loading")) {
              document.getElementById("socialShareBtn")!.classList.remove("loading");
              document.getElementById("downloadLink")!.setAttribute("href", imgPath);
              document.getElementById("shareIconsUl")!.setAttribute("imgPath", imgPath);
            }
          })
          .catch((err) => {
            console.error('err: ', err)
          });

        document.querySelector(".modal-successful-verif")!.classList.add("show");
      },

      callConfettiFunc() {
        let confettiSettings = {
          "target": "confetti-canvas",
          "max": "80",
          "size": "2",
          "animate": true,
          "props": ["circle", "square", "triangle", "line"],
          "colors": [
            [165, 104, 246],
            [230, 61, 135],
            [0, 199, 228],
            [253, 214, 126]
          ],
          "clock": "20",
          "rotate": false,
          "width": "1299",
          "height": "669",
          "start_from_edge": false,
          "respawn": true
        };
        var confetti = new ConfettiGenerator(confettiSettings);
        confetti.clock = 1000

        confetti.render();

        setTimeout(function () {
          confetti.clear();
          document.getElementById("confetti-canvas")!.remove();
        }, 5000);
      },

      async verifyMobileNumber(e: any) { // called on blur
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
              document.getElementById("VerifMobileVerifErrorSpan")!.classList.remove("show");
            } else if (verifiedResponse.data.status == "0" && this.mobile != "") {
              document.getElementById("VerifyMobile")!.focus();
              document.getElementById("VerifMobileVerifErrorSpan")!.classList.add("show");
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
            if (verifiedResponse.data.status == "1") {
              // this.otpVerifyStatus = true;
              $("#VerifyMobile").attr("disabled", "disabled");
              document.getElementById("VerifOTPVerifErrorSpan")!.innerText = "OTP Successfully verified!"
              document.getElementById("VerifOTPVerifErrorSpan")!.classList.add("show");
              setTimeout(function () {
                document.getElementById("VerifOTPVerifErrorSpan")!.classList.remove("show");
              }, 2000);
              $("#verifSendOTPBtn").hide();
            } else {
              document.getElementById("verif_otp")!.focus();
              document.getElementById("VerifOTPVerifErrorSpan")!.classList.add("show");
              setTimeout(function () {
                document.getElementById("VerifOTPVerifErrorSpan")!.classList.remove("show");
              }, 2000);
              // this.otpVerifyStatus = false;
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
                  document.getElementById("verifSendOTPBtn")!.innerHTML = "Resend OTP"
                  if (!isNull(otpSentResponse.data.otp)) {
                    console.log("The OTP is => ", otpSentResponse.data.otp);
                  }
                }
              }
            } else if (verifiedResponse.data.status == "0" && this.mobile != "") {
              document.getElementById("VerifyMobile")!.focus();
              document.getElementById("VerifMobileVerifErrorSpan")!.classList.add("show");
              setTimeout(function () {
                document.getElementById("VerifMobileVerifErrorSpan")!.classList.remove("show");
              }, 2000);
            }
          }
        }
      },

      reset: function () {
        /*
        this.email = ""
        this.password = ""
        this.fileInput = ""
        this.uploadedcertificatePath = ""
        this.directoryPath = ""
        this.fileName = ""
        this.isFormSubmitted = false
        this.isSubmitDisabled = false
        this.globalMsgDiv = ""
        this.$validator.reset();
        */
      },
      async getProfileData() {
        let token = getCookieJSON<URC_Cookie>("_URC")!.user_guid;
        let queryParam = {
          token: token
        }
        let profileData = await getProfileUser(queryParam);
        if (!isNull(profileData) && !isNull(profileData.data)) {
          this.email = profileData.data.email_id;
        }
      }
    },
    mounted() {
      this.getProfileData();
    },
    components: { 'vue-recaptcha': VueRecaptcha }
  });
}