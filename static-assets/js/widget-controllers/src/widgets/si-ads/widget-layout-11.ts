import { Controller } from 'stimulus'
import Swiper from 'swiper'
import { ApplicationObj } from './../../main'

class WidgetLayout11 extends Controller {

  historySwiperTarget: HTMLElement
  static targets = ['historySwiper']

  connect() {
    this.initHistorySwiper()
  }

  initHistorySwiper() {
    new Swiper(this.historySwiperTarget, {
      slidesPerView: 1,
      setWrapperSize: true,
      loop: false,
      speed: 1000,
      autoplay: {
        delay: 3500,
        disableOnInteraction: true
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
        dynamicBullets: true
      }
    })
  }
}
export default () => ApplicationObj.register("si-ads--widget-layout-11", WidgetLayout11);