import {
  ApplicationObj
} from "../../main";
import {
  Controller
} from "stimulus";
import initFanMomemtVueinstance from '../../vue-components/fan-zone/fanZoneMoment';

class FanZoneMoment extends Controller {
  fanZoneMomentVueinstance: any;
  fanZoneMomentAreaTarget: HTMLElement;

  static targets = [
      "fanZoneMomentArea"
  ];
  
  connect() {
      this.fanZoneMomentVueinstance = initFanMomemtVueinstance(this.fanZoneMomentAreaTarget);
  }
}
export default () => ApplicationObj.register("si-ads--widget-layout-09", FanZoneMoment);