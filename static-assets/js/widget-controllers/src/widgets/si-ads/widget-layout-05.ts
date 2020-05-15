import { ApplicationObj } from "./../../main";
import { Controller } from "stimulus";
import Swiper from 'swiper';

class WidgetLayout05 extends Controller {
    swiperOneTarget: HTMLElement;
    swiperTwoTarget: HTMLElement;
    swiperThreeTarget: HTMLElement;
    swiperFourTarget: HTMLElement;
    swiperFiveTarget: HTMLElement;
    swiperSixTarget: HTMLElement;

    static targets = ["swiperOne", "swiperTwo", "swiperThree", "swiperFour", "swiperFive", "swiperSix"];

    KitSwiper: Swiper;
    MerchandiseSwiper: Swiper;
    AudioSwiper: Swiper;
    CapsuleSwiper: Swiper;
    HeadSwiper: Swiper;
    InternationalSwiper: Swiper;

    objToSend = {
        slidesPerView: 4,
        setWrapperSize: true,
        loop: false,
        speed: 1000,
        autoplay: {
            delay: 3500,
            disableOnInteraction: true
        },
        navigation: {
            nextEl: '.swiper-container .swiper-button-next',
            prevEl: '.swiper-container .swiper-button-prev',
        },
        spaceBetween: 20,
        breakpoints: {
            767: {
                slidesPerView: 1.5,
                spaceBetween: 10
            }
        }
    };

    connect() {
        this.KitSwiper = new Swiper(this.swiperOneTarget, this.objToSend);
        this.MerchandiseSwiper = new Swiper(this.swiperTwoTarget, this.objToSend);
        this.AudioSwiper = new Swiper(this.swiperThreeTarget, this.objToSend);
        this.CapsuleSwiper = new Swiper(this.swiperFourTarget, this.objToSend);
        this.HeadSwiper = new Swiper(this.swiperFiveTarget, this.objToSend);
        this.InternationalSwiper = new Swiper(this.swiperSixTarget, this.objToSend);
    }
}

export default () => ApplicationObj.register("si-ads--widget-layout-05", WidgetLayout05);