import { ApplicationObj } from "./../../main";
import { Controller } from "stimulus";
import { getCookie, postJsonData, triggerEventByCtrlName, isNull } from './../../util';

class WidgetLayout08 extends Controller {
    cookieBlockTarget: HTMLElement;
    static targets = ["cookieBlock"];
    gdprData: object = {
        "data": {
            "ipaddress": "1",
            "privacy_version": "1",
            "terms_conditions_version": "1",
            "cookies_policy_version": "1"
        }
    };

    connect() {
        if (getCookie("allowCookie") == "1") {
            $(this.cookieBlockTarget).hide();
        } else {
            $(this.cookieBlockTarget).show();
        }
    }
    openCookiePopup() {
        $(this.cookieBlockTarget).removeClass("notify");
        setTimeout(() => $(this.cookieBlockTarget).addClass("notify"), 100);
    }
    async closeCookie() {
        let response: any = await postJsonData("/socialapi/auth/allowcookie", this.gdprData);
        if (!isNull(response) && !isNull(response.data)) {
            if (response.data.status == "1") {
                $(this.cookieBlockTarget).hide();
                triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
            }
        }

    }
}
export default () => ApplicationObj.register("si-ads--widget-layout-08", WidgetLayout08);