import { Controller } from 'stimulus'
import VeeValidate from 'vee-validate'
import Vue from 'vue'
import { JerseyVueData } from '../../interfaces/jersey'
import { SiTrackingAction } from '../../interfaces/si-tracking'
import { ApplicationObj } from '../../main'
import { sendAnalyticsData } from '../../services/miscellaneous.service'
import { getQueryStringValue, getSiTrackingPayload, isNull } from '../../util'


declare global {
  interface Window {
    gtag: any
  }
}

const dictionary = {
  en: {
    messages: {
      required: function (fieldName: string) {
        return "Field is required";
      }
    }
  }
};
VeeValidate.Validator.localize(dictionary);
Vue.use(VeeValidate);

class WidgetLayout21 extends Controller {
  connect() {
    this.initiJerseyVue()
  }

  initiJerseyVue() {
    let initialData: JerseyVueData = {
      jerseyNumber: '',
      playerName: '',
      isSubmitDisabled: false,
      showLoader: false,
      imgPath: '',
      os: ''
    }

    let vueInstance = new Vue({
      el: '#jerseyContainer',
      data: initialData,
      methods: {
        isNumber(evt: any) {
          evt = evt ? evt : window.event;
          var charCode = evt.which ? evt.which : evt.keyCode;
          if (
            charCode > 31 &&
            (charCode < 48 || charCode > 57) &&
            charCode !== 46
          ) {
            evt.preventDefault();
          } else {
            if (this.jerseyNumber.length > 2) {
              evt.preventDefault()
            } else {
              return true;
            }
          }
        },
        maxPlayerNameLength(evt: any) {
          let specialKeys = new Array();
          specialKeys.push(8);  //Backspace
          specialKeys.push(9);  //Tab
          specialKeys.push(46); //Delete
          specialKeys.push(36); //Home
          specialKeys.push(35); //End
          specialKeys.push(37); //Left
          specialKeys.push(39); //Right

          let keyCode = evt.keyCode == 0 ? evt.charCode : evt.keyCode;

          let ret = ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || keyCode == 32 || (keyCode >= 97 && keyCode <= 122) || (specialKeys.indexOf(evt.keyCode) != -1 && evt.charCode != evt.keyCode));
          if (!ret) {
            evt.preventDefault()
          }

          if (this.playerName.length > 9) {
            evt.preventDefault()
          } else {
            return true
          }
        },
        download: function (e: Event) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.$validator.validate().then(async () => {
            if (this.errors.items.length == 0) {
              this.isSubmitDisabled = true
              this.showLoader = true
              this.generateImage()
              // send share tracking
              let siTrackingPayload = getSiTrackingPayload()
              siTrackingPayload.data.action = SiTrackingAction.DOWNLOAD
              siTrackingPayload.data.extra = 'Jersey Campaign'
              sendAnalyticsData(siTrackingPayload)

              window.gtag('event', 'download', {
                event_label: 'Jersey Campaign'
              })
            }
          })
        },

        resetForm() {
          this.playerName = ''
          this.jerseyNumber = ''
        },

        generateImage() {
          let context = this;
          let payloadData = {
            templateUrl: "https://www.dummyTeam.com/static-resources/jersey-campaign/template/jersey.pug?v=" + new Date().getTime(),
            templateData: {
              payload: {
                jerseyNumber: this.jerseyNumber,
                playerName: this.playerName
              }
            }
          }
          let imageKey = 'prod/jersey-campaign/images/' + this.jerseyNumber + '-' + this.playerName + '.jpg';
          this.imgPath = 'https://www.dummyTeam.com/static-resources/jersey-campaign/images/' + this.jerseyNumber + '-' + this.playerName + '.jpg?v=' + new Date().getTime();

          let shareLinkPayload = {
            url: 'https://464okvtx8d.execute-api.ap-south-1.amazonaws.com/prod/getHtml',
            format: 'jpg',
            opType: 'POST',
            postData: JSON.stringify(payloadData),
            bucket: 'assets-dummyTeam.sportz.io',
            key: imageKey,
            width: '550',
            height: '650'
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
              context.isSubmitDisabled = false
              context.showLoader = false
              context.downloadFile()
            })
            .catch((err) => {
              console.error('err: ', err)
              context.isSubmitDisabled = false
              context.showLoader = false
            });
        },
        downloadFile() {
          if (!isNull(this.os) && this.os.toLocaleLowerCase() === 'ios') {
            location.href = this.imgPath
          } else {
            // iOS does not support downloading so open link in new page
            if (/(iP)/g.test(navigator.userAgent)) {
              location.href = this.imgPath
            } else {
              document.getElementById('downloadJersey')!.click()
              location.reload()
            }
          }
        }
      },
      mounted() {
        let os = getQueryStringValue('os')
        if (!isNull(os!)) {
          this.os = os!
        }
      }
    })
  }
}

export default () => ApplicationObj.register("si-custom--widget-layout-21", WidgetLayout21);