import { ApplicationObj } from '../../main';
import { Controller } from 'stimulus';


class WidgetLayout25 extends Controller {

  triggerbuynowButton(e: Event) {
    let currentTargetData = e.currentTarget! as HTMLElement;
    let input = currentTargetData.getAttribute("data-type");
    e.stopPropagation()
    $('.card-button.btn-gold[data-type=' + input + '').trigger("click")
  }
}
export default () => ApplicationObj.register('si-custom--widget-layout-25', WidgetLayout25);