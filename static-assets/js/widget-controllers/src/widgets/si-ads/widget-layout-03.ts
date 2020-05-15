import {
    ApplicationObj
} from "../../main";
import {
    Controller
} from "stimulus";
import initResetpwdVueinstance from '../../vue-components/gdpr-registration/resetPwd';

class ResetPwd extends Controller {
    resetpwdVueinstance: any;
    resetpwdFormTarget: HTMLElement;

    static targets = [
        "resetpwdForm"
    ];
    
    connect() {
        this.resetpwdVueinstance = initResetpwdVueinstance(this.resetpwdFormTarget);
    }
}
export default () => ApplicationObj.register("si-ads--widget-layout-03", ResetPwd);