import { ApplicationObj } from "./../../main";
import Swiper from 'swiper';
import { CommentsReactions } from '../../vue-components/comments-reactions/comments-reactions';

declare global {
    interface Window {
        YT: any;
    }
}
class WidgetLayout27 extends CommentsReactions {
    swiperTarget: HTMLElement;
    nextTitleTarget: HTMLElement;
    youtubevidTargets: HTMLElement[];
    showcaseDiv: any;

    static targets = ["swiper", "nextTitle", "youtubevid"];
    videoList: { [key: string]: any } = {};

    connect() {
        this.initSwiper();
        this.onYouTubeIframeAPIReady();
        this.loadReactionsWidget();
    }

    initSwiper() {
        this.gallerySwiper = new Swiper(this.swiperTarget, {
            slidesPerView: 1,
            setWrapperSize: true,
            loop: false,
            speed: 1000,
            autoplay: {
                delay: 3500,
                disableOnInteraction: true
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
                dynamicBullets: true,
            },

        });
        this.gallerySwiper.on('slideChange', () => {
            var nextSlideIndex = this.gallerySwiper.activeIndex + 1;
            if (nextSlideIndex == this.gallerySwiper.slides.length) {
                nextSlideIndex = 0
            }
            var nextTitle = this.gallerySwiper.slides[nextSlideIndex].dataset.title;
            this.nextTitleTarget.textContent = String(nextTitle);
            this.showcaseDiv = document.querySelector(".showcase-wrapper")!;
            this.showcaseDiv.querySelectorAll(".wrapper-gif").forEach((el: any) => {
                el.classList.remove("active");
            });
        });
    }
    onYouTubeIframeAPIReady() {
        this.youtubevidTargets.forEach(videoDiv => {
            let src = videoDiv.dataset.src!.split('/').pop()!;
            let assetId = videoDiv.querySelector('.embed-responsive .embed-responsive-item')!.getAttribute('id');
            this.videoList[src] = new window.YT.Player(assetId, {
                // height: '100%',
                width: '100%',
                videoId: src,
                events: {
                    'onStateChange': this.withtarget(videoDiv)
                }
            });
        });
    }


    playVideo(e: Event) {
        $(e.currentTarget!).parents('.showcase-wrapper').find('.slider-wrapper').addClass('show-video');
        $('.site').addClass('sticky');
        let src = $(e.currentTarget!).parents('.article-video').data('src').split('/').pop()!;
        this.gallerySwiper.autoplay!.stop();
        this.videoList[src].playVideo();
    }
    withtarget(target: HTMLElement) {
        let context = this;
        return function (event: any) {
            if ((event.data == window.YT.PlayerState.PAUSED) || (event.data == window.YT.PlayerState.ENDED)) {
                $(target).parents('.showcase-wrapper').find('.slider-wrapper').removeClass('show-video');
                $('.site').removeClass('sticky');
                context.gallerySwiper.autoplay!.start();
            }
        }
    }
}

export default () => ApplicationObj.register("si-showcase--widget-layout-27", WidgetLayout27);
