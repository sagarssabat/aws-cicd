import { ApplicationObj } from "./../../main";
import Swiper from 'swiper';
import { CommentsReactions } from '../../vue-components/comments-reactions/comments-reactions';

declare global {
    interface Window {
        YT: any;
    }
}

class WidgetLayout140 extends CommentsReactions {
    nextTitleTarget: HTMLElement;
    youtubevidTargets: HTMLElement[];
    showcaseVideo: Swiper;
    videoList: { [key: string]: any } = {};

    static targets = ["swiper", "nextTitle", "youtubevid"];

    connect() {
        this.onYouTubeIframeAPIReady();
        this.loadReactionsWidget();
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
        $(e.currentTarget!).parents('.article-wrap').addClass('show-video');
        $('.site').addClass('sticky');
        let src = $(e.currentTarget!).parents('.article-video').data('src').split('/').pop()!;
        this.videoList[src].playVideo();
    }
    
    withtarget(target: HTMLElement) {
        let context = this;
        return function (event: any) {
            if ((event.data == window.YT.PlayerState.PAUSED) || (event.data == window.YT.PlayerState.ENDED)) {
                $(target).parents('.article-wrap').removeClass('show-video');
                $('.site').removeClass('sticky');
                context.showcaseVideo.autoplay!.start();
            }
        }
    }
}

export default () => ApplicationObj.register("si-listing--widget-layout-140", WidgetLayout140)