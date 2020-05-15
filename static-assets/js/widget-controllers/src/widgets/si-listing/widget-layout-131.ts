import { ApplicationObj } from "./../../main";
import Swiper from 'swiper';
import { CommentsReactions } from "../../vue-components/comments-reactions/comments-reactions";

class WidgetLayout131 extends CommentsReactions {
    swiperTarget: HTMLElement;
    currentActiveTarget: HTMLElement;

    static targets = ["swiper","currentActive"];
   
    connect() {
         this.initSwiper();
         this.loadReactionsWidget();
    }

    initSwiper() {
        this.gallerySwiper = new Swiper(this.swiperTarget, {
            slidesPerView: 1,
            setWrapperSize: true,
            speed: 1000,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false
            },
            
        });
        this.gallerySwiper.on('slideChange', () => {
            this.currentActiveTarget.textContent = String(this.gallerySwiper.realIndex + 1);
        });
    }
}

export default () => ApplicationObj.register("si-listing--widget-layout-131", WidgetLayout131);
