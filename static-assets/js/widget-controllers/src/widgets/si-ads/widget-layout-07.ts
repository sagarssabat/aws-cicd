import {
  ApplicationObj
} from "../../main";
import {
  Controller
} from "stimulus";
import initFanZoneVueinstance from '../../vue-components/fan-zone/fanZone';

class FanZone extends Controller {
  fanZoneVueinstance: any;
  fanZoneAreaTarget: HTMLElement;

  static targets = [
      "fanZoneArea"
  ];
  
  connect() {
      this.fanZoneVueinstance = initFanZoneVueinstance(this.fanZoneAreaTarget);
  }
}
export default () => ApplicationObj.register("si-ads--widget-layout-07", FanZone);