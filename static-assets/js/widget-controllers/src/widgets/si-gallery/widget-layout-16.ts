import { ApplicationObj } from "./../../main";
import { CommentsReactions } from '../../vue-components/comments-reactions/comments-reactions';
import Swiper from 'swiper';

class WidgetLayout16 extends CommentsReactions {
    swiperTarget: HTMLElement;
    thumbnailTarget: HTMLElement;
    thumbnailToggleBtnTarget: HTMLElement;
    itemsLength: number;
    countTargets: HTMLElement[];
    galleryShowcase: Swiper;
    galleryThumbs: Swiper;
    thumbClick: any;
    thumbnailSliderTarget:HTMLElement;

    static targets = ["swiper", "thumbnail", "count","thumbnailSlider", "thumbnailToggleBtn"];    

    connect() {
        this.swiperFunc();
        this.loadReactionsWidget();
    }

    swiperFunc() {
        let context = this;
        this.itemsLength = $(this.thumbnailTarget).find('.slider-item').length;

        $(this.countTargets).html("1 - " + this.itemsLength);

        this.galleryShowcase = new Swiper(this.swiperTarget, {
            slidesPerView: 1,
            setWrapperSize: true,
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false
            },
            navigation: {
                nextEl: '.gallery-slider .swiper-button-next',
                prevEl: '.gallery-slider .swiper-button-prev',
            },
        });

        this.galleryThumbs = new Swiper(this.thumbnailTarget, {
            spaceBetween: 20, 
            autoHeight: true,
            slidesPerView: 5.5, 
            initialSlide: 8,
            centeredSlides: true, 
            touchRatio: 0.2,
            slideToClickedSlide: true,
            navigation: {
                nextEl: '.thumbnail-slider .swiper-button-next',
                prevEl: '.thumbnail-slider .swiper-button-prev',
            }, 
            breakpoints: {
                560: {
                    slidesPerView: 3
                }
            },
        });

        this.galleryShowcase.on('slideChange', function () {
            if(context.galleryShowcase.activeIndex == context.itemsLength + 1) {
                context.galleryShowcase.activeIndex = 1;
            }
            $(context.countTargets).html(String(context.galleryShowcase.activeIndex) + " - " + context.itemsLength);
            context.galleryThumbs.slideTo(context.galleryShowcase.activeIndex);
        });

        this.thumbClick = (e: Event) => {
            context.galleryShowcase.slideTo($(e.currentTarget!).index() + 1);
            $(this.countTargets).html(String($(e.currentTarget!).index() + 1) + " - " + this.itemsLength);
        };
    }

    toggleThumbNailSlider(){
        let height = $(this.thumbnailSliderTarget).innerHeight();
        if($(this.thumbnailSliderTarget).hasClass('active')){
            $(this.thumbnailSliderTarget).removeClass('active');
            $(this.thumbnailToggleBtnTarget).removeClass('active');
            $(this.thumbnailToggleBtnTarget).css({bottom: 0});
        }else{
            $(this.thumbnailSliderTarget).addClass('active');
            $(this.thumbnailToggleBtnTarget).addClass('active');            
            $(this.thumbnailToggleBtnTarget).css({bottom: height!});
        }
    }
}

export default () => ApplicationObj.register("si-gallery--widget-layout-16", WidgetLayout16);