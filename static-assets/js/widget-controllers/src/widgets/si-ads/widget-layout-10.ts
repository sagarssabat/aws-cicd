import * as moment from 'moment'
import { Controller } from 'stimulus'
import { ApplicationObj } from './../../main'
import {
  getCookie,
  isNull,
  isNullString,
  setCookie
  } from '../../util'



class WidgetLayout10 extends Controller {
  static targets = []

  connect() {
    this.initGreeting()
  }

  initGreeting() {
    const now = moment()
    const startday = moment('2020-01-01 00:00:00')
    const endday = moment('2020-01-01 23:59:00')
    if (now >= startday && now < endday) {
      let newYearShown = getCookie('newYearShown')
      if (isNull(newYearShown) || newYearShown != '1') {
        // show popup
        let newyearPopup = document.getElementById('newyear-popup')
        let body = document.querySelector('body')
        let vid = document.getElementById('newyear-video') as any

        newyearPopup!.style.display = 'flex'
        body!.classList.add('no-scroll')

        // vid.onloadeddata = function () {
        //   // console.log("Browser has loaded the current frame");
        //   // setTimeout(() => {
        //   //   if (!isNull(newyearPopup!)) {
        //   //     newyearPopup!.style.display = 'none'
        //   //     body!.classList.remove('no-scroll')
        //   //     setCookie('newYearShown', '1')
        //   //   }
        //   // }, 6000)
        // };

        vid.onended = function () {
          // console.log("The video has ended");
          if (!isNull(newyearPopup!)) {
            newyearPopup!.style.display = 'none'
            body!.classList.remove('no-scroll')
            setCookie('newYearShown', '1')
          }
        };

      }
    }
  }

}
export default () => ApplicationObj.register("si-ads--widget-layout-10", WidgetLayout10);