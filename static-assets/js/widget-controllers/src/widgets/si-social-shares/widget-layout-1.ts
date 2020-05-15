import { ApplicationObj } from "./../../main";
import { Controller } from "stimulus";

class socialSharesTab extends Controller {

    static targets = ["btn"];
    btnTarget: HTMLElement;

    socialShares(e: Event) {
        let provider: string = (e.currentTarget as HTMLElement).dataset.provider!;
        let PageUrl = window.location.href;
        let title = "Kings XI Punjab" + (e.currentTarget as HTMLElement).dataset.title;
        window.open(this.getShareUrl(provider, PageUrl, title), "Share_Page", "width=600,height=400, scrollbars=no, resizable=no, top=250, left=250", false);
    }

    getShareUrl(provider: string, share_url: string, title: string) {
        switch (provider) {
            case "facebook":
                return `https://www.facebook.com/dialog/share?app_id=424301804669465&display=popup&href=${encodeURIComponent(share_url)}?utm-source=facebook`;
            case "twitter":
                return `https://twitter.com/home?status=${title} ${encodeURIComponent(share_url)}?utm-source=twitter`;
            case "google plus":
                return `https://plus.google.com/share?url=${encodeURIComponent(share_url)}?utm-source=gplus`;
            default:
                return "";
        }
    }
}
export default () => ApplicationObj.register("si-social-shares--widget-layout-1", socialSharesTab);
