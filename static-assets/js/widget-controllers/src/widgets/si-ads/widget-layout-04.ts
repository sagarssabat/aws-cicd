import {
    ApplicationObj
} from "../../main";
import {
    Controller
} from "stimulus";
import initContactUsVueinstance from '../../vue-components/gdpr-registration/contactUs';

class ContactUs extends Controller {
    contactUsVueinstance: any;
    contactUsFormTarget: HTMLElement;

    static targets = [
        "contactUsForm"
    ];
    
    connect() {
        this.contactUsVueinstance = initContactUsVueinstance(this.contactUsFormTarget);
    }
}
export default () => ApplicationObj.register("si-ads--widget-layout-04", ContactUs);