import {
    ApplicationObj
} from "./../../main";
import {
    Controller
} from "stimulus";
import {
    getCookieJSON, isNull, setCookie, getCookie, triggerEventByCtrlName, deleteCookie, isMobile
} from '../../util';

import initRegisterVueinstance from '../../vue-components/gdpr-registration/registration';
import initSignInVueinstance from '../../vue-components/gdpr-registration/signIn';
import initforgotPwdVueinstance from '../../vue-components/gdpr-registration/forgotPassword';
import initVerifyVueInstance from '../../vue-components/gdpr-registration/verification';
import { URC_Cookie } from '../../models/social-api-model';
import PerfectScrollbar from 'perfect-scrollbar'
import Constants from '../../utils/constants';
import { ScratchCard, SCRATCH_TYPE } from 'scratchcard-js'
import { logOutUser } from '../../services/user.service';
import { ShareType } from '../../interfaces/social-share';
import { SocialShareObject } from '../../interfaces/social-share';
import { ShareUtil } from '../../utils/share.util';

declare global {
    interface Window {
        ga: any
    }
}

class WidgetLayout01 extends Controller {

    signInPopupTarget: HTMLElement;
    modalRegisterTarget: HTMLElement;
    signInFormTarget: HTMLElement;
    forgotPasswordFormTarget: HTMLElement;
    modalSigninTarget: HTMLElement;
    modalVerifyTarget: HTMLElement;
    successPopupTarget: HTMLElement;
    registerVueinstance: any;
    signInVueInstance: any;
    verifyVueInstance: any;
    forgotPwdVueInstance: any;
    inputFieldTarget: HTMLElement[];
    scrollTopBtnTarget: HTMLElement;
    gratificationTarget: HTMLElement;
    scratchPadTarget: HTMLElement;
    cardDownloadListener: any

    CloseEvent: any

    static targets = [
        "signInPopup",
        "modalRegister",
        "modalSignin",
        "modalVerify",
        "successPopup",
        "inputField",
        "signInForm",
        "forgotPasswordForm",
        "scrollTopBtn",
        "gratification",
        "scratchPad",
    ];

    connect() {
        //  this.showPopUp()
        this.signInVueInstance = initSignInVueinstance(this.signInFormTarget);
        this.forgotPwdVueInstance = initforgotPwdVueinstance(this.forgotPasswordFormTarget);
        this.registerVueinstance = initRegisterVueinstance(this.modalRegisterTarget);
        // check if urc cookie has set status == 999. then go about showing the verification popup
        this.showVerifyPopup();

        if (isNull(this.cardDownloadListener)) {
            let cardDownload = document.getElementById('downloadLink')
            this.cardDownloadListener = cardDownload!.addEventListener('click', () => {
                window.ga('send', {
                    hitType: 'event',
                    eventCategory: 'MembershipDownloadCard',
                    eventAction: 'download',
                    eventLabel: 'Click membership download card'
                })

            })
        }
    }

    toggleShare(e: any) {
        if (e.target.classList.contains("icon-download")) {
            window.location.href = e.target.getAttribute("href");
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.target.classList.contains("social-wrap")) {
            if (e.target.classList.contains("loading")) {
                return false;
            }
            if (e.target.classList.contains("active")) {
                e.target.classList.remove("active");
            } else {
                e.target.classList.add("active");
            }
        }
    }

    shareImage(e: any) {
        e.preventDefault()
        e.stopImmediatePropagation()
        let shareType: ShareType = $(e.target!).attr('data-type')!.toString() as ShareType
        let shareObj: SocialShareObject = {
            url: Constants.MEMBERSHIP_URL,
            title: `${document.getElementById("shareIconsUl")!.getAttribute("imgPath")!} \n\n ${Constants.MEMBERSHIP_SHARE_TITLE} \n\n`,
            description: Constants.MEMBERSHIP_SHARE_DESCRIPTION,
            imgPath: document.getElementById("shareIconsUl")!.getAttribute("imgPath")!
        }
        ShareUtil.share(shareType, shareObj)
    }

    async closeVerificationBackdrop(e: any) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.target.classList.contains("modal-tnc")) {
            this.modalSigninTarget.classList.remove("show");
            this.modalVerifyTarget.classList.remove("show");
            document.body.classList.remove("no-scroll");

            // Call logout API
            let payload = {
                data: {
                    user_guid: getCookieJSON<URC_Cookie>("_URC")!.user_guid
                }
            }

            let logoutResponse = await logOutUser(payload);
            if (logoutResponse.data.status == "1") {
                window.location.reload();
            }
        }
    }

    closeSuccessPopup(e: any) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.successPopupTarget.classList.remove("show");
        document.body.classList.remove("no-scroll");
        window.location.href = window.location.origin;
    }

    goToMembership(e: any) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = window.location.origin + "/mi-membership";
    }

    closeSuccessPopupOuter(e: any) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.target.classList.contains("modal-successful-verif")) {
            this.successPopupTarget.classList.remove("show");
            document.body.classList.remove("no-scroll");
            window.location.href = window.location.origin;
        }
    }

    showVerifyPopup() {
        // if (isNull(this.verifyVueInstance)) {
        //     this.verifyVueInstance = initVerifyVueInstance(this.modalVerifyTarget);
        // }
        let urcCookie = getCookieJSON<URC_Cookie>("_URC")!;
        if (!isNull(urcCookie)) {
            if (urcCookie.status == "999") {
                this.verifyVueInstance = initVerifyVueInstance(this.modalVerifyTarget);
                this.modalVerifyTarget.classList.add("show");
                document.body.classList.add("no-scroll");
            }
        }
    }

    showPopUp() {
        if (window.location.pathname == "/") {
            let userCookie = getCookieJSON<URC_Cookie>('_URC');
            let isPopupSkipped = getCookie('mi-log-skipped');
            let logSkipped: boolean = false;

            if (!isNull(isPopupSkipped) && isPopupSkipped == "true") {
                logSkipped = true
            }

            if (!userCookie && logSkipped === false) {
                this.openSigninPopup()
                this.bindBackDropCloseEvent();
            }
        }
    }

    showScrollTopBtn() {
        if (window.pageYOffset || document.documentElement.scrollTop > 200) {
            this.scrollTopBtnTarget.style.display = "block"
        } else {
            this.scrollTopBtnTarget.style.display = "none"
        }
    }

    bindBackDropCloseEvent() {
        document.body.classList.add('no-scroll');
        return false
        this.CloseEvent = (e: Event) => {
            let modalBody = $(this.element).find('.modal-dialog');
            let currentElement = e.target as HTMLElement;
            if (!(modalBody.is(currentElement) || modalBody.has(currentElement).length > 0)) {
                $([this.modalRegisterTarget, this.modalSigninTarget]).removeClass('show');
                document.removeEventListener('click', this.CloseEvent);
                document.body.classList.remove('no-scroll');
                $(this.signInPopupTarget).removeClass("show-forgot-wrap")
                this.resetForms()
            }
        };
        document.addEventListener('click', this.CloseEvent);
    }

    async closeLoginRegistrationDialog() {
        let logOutStatus = false;
        if (this.modalVerifyTarget.classList.contains("show")) {
            logOutStatus = true;
        }
        $([this.modalRegisterTarget, this.modalSigninTarget, this.modalVerifyTarget]).removeClass('show');
        document.removeEventListener('click', this.CloseEvent);
        document.body.classList.remove('no-scroll');
        $(this.signInPopupTarget).removeClass("show-forgot-wrap")
        this.resetForms()

        setCookie('mi-log-skipped', true)
        if (logOutStatus) {
            // Call logout API
            let payload = {
                data: {
                    user_guid: getCookieJSON<URC_Cookie>("_URC")!.user_guid
                }
            }

            let logoutResponse = await logOutUser(payload);
            if (logoutResponse.data.status == "1") {
                window.location.reload();
            }
        }
    }

    resetForms() {
        if (!isNull(this.registerVueinstance)) {
            this.registerVueinstance.reset()
        }

        if (!isNull(this.signInVueInstance)) {
            this.signInVueInstance.reset()
        }

        if (!isNull(this.forgotPwdVueInstance)) {
            this.forgotPwdVueInstance.reset()
        }
    }

    openSigninPopup() {
        let AllowCookie = getCookie("allowCookie");
        if (AllowCookie == "1") {
            this.modalSigninTarget.classList.add('show', 'fade');
            this.bindBackDropCloseEvent();
            if (isMobile()) {
                const container = this.modalSigninTarget.querySelector('.modal-content') as HTMLElement;
                if (container) {
                    container.setAttribute('style', 'position: relative;');
                    new PerfectScrollbar(container, { suppressScrollX: true });
                }
            }
            else {
                new PerfectScrollbar(this.signInPopupTarget, { suppressScrollX: true });
            }
        } else {
            triggerEventByCtrlName('si-ads--widget-layout-08', 'open-cookie-popup');
        }
    }

    showForgotPwd() {
        $(this.signInPopupTarget).addClass("show-forgot-wrap")
    }

    showSignin() {
        $(this.signInPopupTarget).removeClass("show-forgot-wrap")
    }

    showRegistration() {
        // if (isNull(this.registerVueinstance)) {
        //     this.registerVueinstance = initRegisterVueinstance(this.modalRegisterTarget);
        // }
        $(this.modalRegisterTarget).addClass("show fade");
        $(this.modalSigninTarget).removeClass("show fade");
        let scrollContainer = document.querySelector('.content-body-selector') as HTMLElement
        new PerfectScrollbar(scrollContainer);
    }

    hideRegistration() {
        $(this.modalRegisterTarget).removeClass("show fade");
        $(this.modalSigninTarget).addClass("show fade")
    }

    focusInLabel(e: Event) {
        $(e.currentTarget as HTMLElement).parents('.form-group').find('label').addClass('active');
    }

    focusOutLabel(e: Event) {
        let CurrentInput = $(e.currentTarget as HTMLElement);
        if (!CurrentInput.val()) {
            CurrentInput.parents('.form-group').find('label').removeClass('active');
        }
    }

    focusOutDOB(e: Event) {
        let CurrentInput = $(e.currentTarget as HTMLElement).find('input');
        if (!CurrentInput.val()) {
            CurrentInput.parents('.form-group').find('label').removeClass('active');
        }
    }

    facebookLogin(e: Event) {
        let path = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = '/socialapi/auth/facebook?cbkurl=' + path;
    }

    twitterLogin(e: Event) {
        let path = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = '/socialapi/auth/twitter?cbkurl=' + path;
    }

    scrollToTop() {
        $("html, body").css({ 'scroll-behavior': 'smooth' }).animate({ scrollTop: 0 });
    }

    showGratification() {
        let cookieGratificationGift = getCookie(Constants.COOKIE_GRATIFICATION_GIFT)
        if (isNull(cookieGratificationGift)) {
            return
        }

        let giftName = cookieGratificationGift

        $(this.gratificationTarget).show();
        let windowOrigin = location.origin
        let bg1 = windowOrigin + '/static-assets/images/cssimages/gratify/scratchpad-luck.png';
        let bg2 = windowOrigin + '/static-assets/images/cssimages/gratify/scratchpad-winner-tshirt.png';
        let bg3 = windowOrigin + '/static-assets/images/cssimages/gratify/scratchpad-winner-mug.png';
        let bg4 = windowOrigin + '/static-assets/images/cssimages/gratify/scratchpad-winner-bag.png';
        let bgImg;
        switch (giftName) {
            case 'BETTER LUCK NEXT TIME':
                bgImg = bg1
                break;
            case 'T-SHIRT':
                bgImg = bg2
                break;
            case 'MUG':
                bgImg = bg3
                break;
            case 'BAG':
                bgImg = bg4
                break;
        }


        let padId = $(this.scratchPadTarget).attr('id')

        let containerWidthHeight = 500
        if (isMobile()) {
            containerWidthHeight = 300
        }

        let scratchCardOptions: any = {
            scratchType: SCRATCH_TYPE.CIRCLE,
            containerWidth: containerWidthHeight,
            containerHeight: containerWidthHeight,
            imageForwardSrc: windowOrigin + '/static-assets/images/cssimages/gratify/scratchpad-default.png',
            imageBackgroundSrc: bgImg,
            clearZoneRadius: 30,
            percentToFinish: 50, // When the percent exceeds 50 on touchend event the callback will be exec.
            callback: function () {
                setTimeout(function () {
                    deleteCookie(Constants.COOKIE_GRATIFICATION_GIFT)
                    window.location.reload()
                }, 5000)
            }
        }

        const sc = new ScratchCard('#' + padId, scratchCardOptions)
        sc.init()
    }

}
export default () => ApplicationObj.register("si-ads--widget-layout-01", WidgetLayout01);