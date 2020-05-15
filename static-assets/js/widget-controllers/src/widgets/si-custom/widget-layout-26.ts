import { Controller } from 'stimulus'
import { ApplicationObj } from '../../main'
import { URC_Cookie, ApiResponse } from '../../models/social-api-model';
import { getCookieJSON, isNull, triggerEventByCtrlName } from '../../util';
import { gifMiQueryParam, gifMyQueryParam, deleteGifPayload } from '../../interfaces/gif.interface';
import { getGifMiData, getGifMyData, deleteGifData } from '../../services/gif.service';
import Vue from 'vue'
import { ShareType } from '../../interfaces/social-share';
import { SocialShareObject } from '../../interfaces/social-share';
import Constants from '../../utils/constants';
import { ShareUtil } from '../../utils/share.util';

class WidgetLayout26 extends Controller {

  mygifTarget: HTMLElement;
  migifTarget: HTMLElement;
  mygifsTarget: HTMLElement;
  pendingTarget: HTMLElement;
  tryagainTarget: HTMLElement;
  mIData: [];
  myData: [];
  emptyMy: boolean = false;
  userUid: string;
  status: string;
  static targets = ["mygif", "migif", "mygifs", "pending", "tryagain"];

  connect() {
    this.intGifVueInstance()
    this.showGif()


  }
  showGif() {
    $('.mygif-wrap.tab-container').hide()
    $('.migif-wrap.tab-container').show()
    $('.mygifs-container').show()
    $('.pending-container').hide()
    $('.tryagain-container').hide()
    $('#gifLoginWrap').hide()
    let urcCookie = getCookieJSON<URC_Cookie>("_URC")!;
    if (isNull(urcCookie)) {
      $('#gifLoginWrap').hide()
    }
    else {
      this.userUid = urcCookie.user_guid
    }

  }
  onTabClick(e: any) {
    let currentTarget = e.currentTarget
    $(this.mygifTarget).removeClass("active");
    $(this.migifTarget).removeClass("active");
    currentTarget.classList.add('active')
    $('.migif-wrap.tab-container').hide()

    if (currentTarget.getAttribute("data-target") == this.mygifTarget.getAttribute("data-target")) {
      if (isNull(this.userUid) || this.emptyMy) {
        $('#gifLoginWrap').show()
        $('.mygif-wrap.tab-container').hide()
      }
      else {
        $('.mygif-wrap.tab-container').show()
        $('#gifLoginWrap').hide()
      }
    }
    else if (currentTarget.getAttribute("data-target") == this.migifTarget.getAttribute("data-target")) {
      $('.mygif-wrap.tab-container').hide()
      $('.migif-wrap.tab-container').show()
      $('#gifLoginWrap').hide()
    }
  }




  intGifVueInstance() {
    let context = this;
    new Vue({
      el: '#initGifVue',
      data: {
        mIData: [],
        myData: [],
        userUid: this.userUid,
        status: this.status,
        toDownload: true,
        detailImgPath: '',
        detailGalleryId: '',
        detailThumbnail: '',
        detailDate: ''
      },
      methods: {
        isDownload(e: any) {
          let userCookie = getCookieJSON<URC_Cookie>("_URC")!;
          if (isNull(userCookie)) {
            // Show the login popup
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
            e.preventDefault()
            e.stopImmediatePropagation()
            return false;
          }
        },
        onClickshare(e: any) {
          let userCookie = getCookieJSON<URC_Cookie>("_URC")!;
          if (isNull(userCookie)) {
            // Show the login popup
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
            e.preventDefault()
            e.stopImmediatePropagation()
            return false;
          } else {
            e.preventDefault()
            e.stopImmediatePropagation()
            let currentTarget = e.currentTarget
            if (currentTarget.classList.contains('active')) {
              currentTarget.classList.remove('active')
            } else {
              currentTarget.classList.add('active')
            }
          }
        },
        async onClickDelete(e: Event) {
          e.preventDefault()
          e.stopImmediatePropagation()
          let gallery_id: string = $(e.target!).attr('data-gallery')!.toString() as string;
          let thumbnail: string = $(e.target!).attr('data-thumbnail')!.toString() as string;
          let payload: deleteGifPayload = {
            data: [{
              gallery_id: gallery_id,
              thumbnail: thumbnail,
            }]
          }
          let res: any = await deleteGifData(payload)
          if (!isNull(res.content.status)) {
            setTimeout(() => {
              this.detailPage(e)
              $("#firstSubtab").trigger("click");
            }, 3000)
          }

        },

        listingShare(e: Event) {
          e.preventDefault()
          e.stopImmediatePropagation()
          let shareType: ShareType = $(e.target!).attr('data-sharetype')!.toString() as ShareType
          let shareObj: SocialShareObject = {
            url: Constants.GIF_URL,
            title: `${this.detailImgPath} \n\n ${Constants.GIF_SHARE_TITLE} \n\n`,
            description: Constants.MEMBERSHIP_SHARE_DESCRIPTION,
            imgPath: this.detailImgPath
          }
          ShareUtil.share(shareType, shareObj)

        },
        formatDate(value: string) {
          let d = value.split("T");
          let date = d[0].split("-");
          return date[2] + "/" + date[1] + "/" + date[0];

        },
        detailPage(e: any) {
          if ($('#detailPopup').hasClass('show')) {
            $('#detailPopup').removeClass('show')
          }
          else {
            let currentTarget = e.currentTarget
            let gallery_id = currentTarget!.getAttribute("data-gallery")
            this.myData.forEach((el: any) => {
              if (gallery_id == el.gallery_id) {
                this.detailImgPath = el.url
                this.detailGalleryId = el.gallery_id
                this.detailThumbnail = el.thumbnail
                if (!isNull(el.thumbnail)) {
                  this.detailDate = this.formatDate(el.photobooth_date)
                }
                else {
                  this.detailDate = ''
                }
              }
            })
            $('#detailPopup').addClass("show")
          }
        },

        async showMITab() {
          let queryParams: gifMiQueryParam = {
            galleryType: '4',
            item: '10',
            page: '1'
          }
          let apiResponse = await getGifMiData(queryParams);
          if (!isNull(apiResponse) && !isNull(apiResponse.items)) {
            this.mIData = apiResponse.items
          }
        },

        async showMyTab() {
          let urcCookie = getCookieJSON<URC_Cookie>("_URC")!;
          if (!isNull(urcCookie)) {
            let gUid = urcCookie.user_guid
            let queryParams: gifMyQueryParam = {
              galleryType: '4',
              page: '1',
              item: '10',
              status: this.status,
              token: gUid
            }
            let apiResponse = await getGifMyData(queryParams);
            if (!isNull(apiResponse) && !isNull(apiResponse.items)) {
              this.myData = apiResponse.items
              if (apiResponse.items.length <= 0) {
                context.emptyMy = true;
              } else {
                context.emptyMy = false;
              }
              console.log('a', this.myData);
            }
          }

        },
        onSubTabClick(e: any) {
          let currentTarget = e.currentTarget
          $('.subtab').removeClass("active");
          $('.mygifs-container').hide()
          $('.pending-container').hide()
          $('.tryagain-container').hide()
          currentTarget.classList.add('active');
          if (currentTarget.getAttribute("data-target") == context.mygifsTarget.getAttribute("data-target")) {
            $('.mygifs-container').show();
            this.status = '1'
          }
          else if (currentTarget.getAttribute("data-target") == context.pendingTarget.getAttribute("data-target")) {
            $('.pending-container').show()
            this.status = '0'
          }
          else if (currentTarget.getAttribute("data-target") == context.tryagainTarget.getAttribute("data-target")) {
            $('.tryagain-container').show()
            this.status = '2'
          }
          this.showMyTab();
        }

      },
      mounted() {
        this.showMITab()
        $("#firstSubtab").trigger("click");
      }



    })

  }

}
export default () => ApplicationObj.register("si-custom--widget-layout-26", WidgetLayout26);