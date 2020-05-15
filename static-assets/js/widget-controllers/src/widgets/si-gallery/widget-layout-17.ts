import Swiper from 'swiper'
import { ApplicationObj } from './../../main'
import { CommentsReactions } from '../../vue-components/comments-reactions/comments-reactions'

class WidgetLayout17 extends CommentsReactions {
    swiperTarget: HTMLElement;
    itemsLength: number;
    currentActiveTarget: HTMLElement;

    static targets = ["swiper", "count", "currentActive"];

    connect() {
        this.swiperInit();
        this.loadReactionsWidget();
    }

    swiperInit() {
        let context = this;
        this.itemsLength = $(this.swiperTarget).find('.swiper-slide').length;

        $(this.currentActiveTarget).html("1 - " + this.itemsLength);

        this.gallerySwiper = new Swiper(this.swiperTarget, {
            slidesPerView: 1,
            setWrapperSize: true,
            autoplay: {
                delay: 7000,
                disableOnInteraction: false
            },
            navigation: {
                nextEl: '.gallery-slider .swiper-button-next',
                prevEl: '.gallery-slider .swiper-button-prev',
            },
        });

        this.gallerySwiper.on('slideChange', () => {
            $(context.currentActiveTarget).html(String(context.gallerySwiper.activeIndex + 1) + " - " + context.itemsLength);
        });
    }
}

export default () => ApplicationObj.register("si-gallery--widget-layout-17", WidgetLayout17);