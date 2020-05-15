import { ApplicationObj } from "./../../main";
import { Controller } from "stimulus";

class WidgetLayout53 extends Controller {
  tabTargets: HTMLElement[];
  showMoreTarget: HTMLElement;

  static targets = ["tab", "showMore"];

  showTab(e: Event): void {
    // let { id: currentSelected, showMoreUrl } = (e.currentTarget as HTMLElement).dataset;
    let selectedData = (e.currentTarget as HTMLElement).dataset;
    let currentSelected = selectedData.id;
    let showMoreUrl = selectedData.showmoreurl;
    
    $(this.tabTargets).hide().filter(`[data-id='${currentSelected}']`).show();
    if (showMoreUrl) {
      $(this.showMoreTarget)
        .show()
        .attr("href", showMoreUrl);
    } else {
      $(this.showMoreTarget).hide();
    }
  }
}

export default () => ApplicationObj.register("galleryFilter", WidgetLayout53);
