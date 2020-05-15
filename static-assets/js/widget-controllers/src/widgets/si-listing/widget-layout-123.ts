import {
    ApplicationObj
} from "../../main";
import {
    Controller
} from "stimulus";
import Swiper from 'swiper';

class widgetLayout123 extends Controller {
    tabTargets: HTMLElement[];
    liTargets: HTMLLIElement[];
    relatedListSwiperTarget: HTMLElement;
    relatedSwiper: Swiper;

    static targets = ["tab", "li", "relatedListSwiper"];

    connect() {
        this.relatedSwiper = new Swiper(this.relatedListSwiperTarget, {
            slidesPerView: 3,
            setWrapperSize: true,
            loop: false,
            navigation: {
                nextEl: '.mod-body .swiper-button-next',
                prevEl: '.mod-body .swiper-button-prev',
            }
        });
    }
    showTab(e: Event): void {
        let selectedLi: HTMLLIElement = (e.currentTarget as HTMLLIElement);
        let currentSelectedId = selectedLi.dataset.id;
        $(this.liTargets).removeClass('active');
        $(selectedLi).addClass('active');
        $(this.tabTargets).hide().filter(`[data-id='${currentSelectedId}']`).show();
    }
}
export default () => ApplicationObj.register("si-listing--widget-layout-123", widgetLayout123);