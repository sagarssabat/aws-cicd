import { ApplicationObj } from "./../../main";
import Swiper from 'swiper';
import { isMobile } from "../../util"
import { CommentsReactions } from '../../vue-components/comments-reactions/comments-reactions';

class WidgetLayout130 extends CommentsReactions {
    swiperTarget: HTMLElement;

    static targets = ["swiper"];

    connect() {
        if (isMobile()) {
            this.swiperInit();
        }
        this.loadReactionsWidget();
    }

    swiperInit() {
        this.gallerySwiper = new Swiper(this.swiperTarget, {
            slidesPerView: 1,
            setWrapperSize: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false
            },
            navigation: {
                nextEl: '.widget-layout-130 .swiper-button-next',
                prevEl: '.widget-layout-130 .swiper-button-prev',
            },
        });

    }
}

export default () => ApplicationObj.register("si-listing--widget-layout-130", WidgetLayout130);
