import { ShareType, SocialShareObject } from '../interfaces/social-share'
import { isMobile, isNull } from '../util'

declare global {
  interface Window {
    FB: any
  }
}

export class ShareUtil {

  static share(shareType: string, shareObj: SocialShareObject) {
    if (!isNull(shareType) && !isNull(shareObj!)) {
      switch (shareType) {
        case ShareType.FB:
          ShareUtil.facebookShare(shareObj!)
          break
        case ShareType.TWITTER:
          ShareUtil.twitterShare(shareObj!)
          break
        case ShareType.WHATSAPP:
          ShareUtil.whatsappShare(shareObj!)
          break
        default:
          break
      }
    } else {
      console.error('Share type or share object not defined')
    }
  }

  static facebookShare(shareObj: SocialShareObject) {
    window.FB.XFBML.parse();
    window.FB.ui({
      method: 'share',
      action_type: 'og.shares',
      action_properties: JSON.stringify({
        object: {
          'og:url': shareObj.url,
          'og:title': shareObj.title,
          'og:description': shareObj.description,
          'og:image': shareObj.imgPath
        }
      })
    });
  }

  static twitterShare(shareObj: SocialShareObject) {
    let twitterTitle = shareObj.title
    let url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(twitterTitle) + "&url=" + encodeURIComponent(shareObj.url);
    window.open(url, 'Share_Page', 'width=600,height=400, scrollbars=no, resizable=no, top=250, left=250', false);
  }

  static whatsappShare(shareObj: SocialShareObject) {
    let ele = document.createElement('a')
    let watsAppTitle = shareObj.title
    let whatsAppUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(watsAppTitle)
    if (isMobile()) {
      whatsAppUrl = 'whatsapp://send?text=' + encodeURIComponent(watsAppTitle)
      ele.setAttribute('href', whatsAppUrl)
      ele.setAttribute('data-action', 'share/whatsapp/share')
      ele.click()
      document.removeChild(ele)
    } else {
      window.open(whatsAppUrl, "_blank", "toolbar=yes,top=500,left=500,width=500,height=500");
    }
  }
}