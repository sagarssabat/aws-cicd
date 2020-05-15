import { ApplicationObj } from "./../../main";
import Swiper from 'swiper';
import { CommentsReactions } from '../../vue-components/comments-reactions/comments-reactions';

declare global {
    interface Window {
        YT: any;
    }
}

class WidgetLayout129 extends CommentsReactions {
    swiperTarget: HTMLElement;
    youtubevidTargets: HTMLElement[];
    videoList: { [key: string]: any } = {};
    swiperDiv: any;
    static targets = ["swiper", "nextTitle", "youtubevid"];

    connect() {
        this.initSwiper();
        this.onYouTubeIframeAPIReady();
        this.loadReactionsWidget();
    }

    initSwiper() {
        this.gallerySwiper = new Swiper(this.swiperTarget, {
            slidesPerView: 1.5,
            initialSlide: 3,
            spaceBetween: 20,
            centeredSlides: true,
            setWrapperSize: true,
            speed: 1000,
            loop: false,
            autoplay: {
                delay: 6500,
                disableOnInteraction: false
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
                dynamicBullets: true,
            },
            breakpoints: {
                767: {
                    slidesPerView: 1
                }
            }
        });
        this.swiperDiv = document.querySelector(".widget-layout-129")!;
        this.gallerySwiper.on('slideChange', () => {
            this.swiperDiv.querySelectorAll(".wrapper-gif").forEach((el: any) => {
                el.classList.remove("active");
            });
        });
    }

    onYouTubeIframeAPIReady() {
        this.youtubevidTargets.forEach(videoDiv => {
            let src = videoDiv.dataset.src!.split('/').pop()!;
            let assetId = videoDiv.querySelector('.embed-responsive .embed-responsive-item')!.getAttribute('id');
            this.videoList[src] = new window.YT.Player(assetId, {
                width: '100%',
                videoId: src,
                events: {
                    'onStateChange': this.withtarget(videoDiv)
                }
            });
        });
    }

    playVideo(e: Event) {
        $(e.currentTarget!).parents('.swiper-slide').addClass('show-video');
        // $('.site').addClass('sticky');
        let src = $(e.currentTarget!).parents('.article-video').data('src'); //.split('/').pop()!;
        this.gallerySwiper.autoplay!.stop();
        this.isVideoPlaying = true;
        this.videoList[src].playVideo();
    }

    withtarget(target: HTMLElement) {
        let context = this;
        return function (event: any) {
            if ((event.data == window.YT.PlayerState.PAUSED) || (event.data == window.YT.PlayerState.ENDED)) {
                $(target).parents('.swiper-slide').removeClass('show-video');
                // $('.site').removeClass('sticky');
                context.isVideoPlaying = false;
                context.gallerySwiper.autoplay!.start();
            }
        }
    }
}

export default () => ApplicationObj.register("si-listing--widget-layout-129", WidgetLayout129);
