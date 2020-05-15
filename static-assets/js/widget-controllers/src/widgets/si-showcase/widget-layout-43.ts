import Swiper from 'swiper'
import { ApplicationObj } from '../../main'
import { Controller } from 'stimulus'

class WidgetLayout43 extends Controller {
  swiperTarget: HTMLElement;
  showcaseSwiper: Swiper;
  static targets = ["swiper"];

  connect() {
    this.initSwiper();
  }

  initSwiper() {
    this.showcaseSwiper = new Swiper(this.swiperTarget, {
      slidesPerView: 1,
      setWrapperSize: true,
      loop: true,
      speed: 800,
      autoplay: {
        delay: 3500,
        disableOnInteraction: true
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      preloadImages: false,
      lazy: true,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      navigation: {
        nextEl: '.widget-layout-43 .swiper-button-next',
        prevEl: '.widget-layout-43 .swiper-button-prev',
      }
    });
  }
}

export default () => ApplicationObj.register("si-showcase--widget-layout-43", WidgetLayout43);