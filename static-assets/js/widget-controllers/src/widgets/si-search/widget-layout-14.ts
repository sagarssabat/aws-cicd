import {
  ApplicationObj
} from "./../../main";
import {
  Controller
} from "stimulus";
import {
  isNull,
} from '../../util';
import { isInViewport } from '../../util';

declare global {
  interface HTMLElement {
    value: any
  }
}

class WidgetLayout14 extends Controller {
  searchTextTarget: HTMLElement;
  loadMoreButtonTarget: HTMLElement;
  myDiv: any;
  loadmore_url: string;

  static targets = ["searchText", "loadMoreButton"];

  connect() {
    $(window).scroll(function () {
      if (isInViewport($('.site-footer')[0])) {
        $('.waf-tab').addClass('hide');
        if (! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          $('.waf-tab').parents('.layout-wrapper').addClass('fluid');
        }
      } else {
        $('.waf-tab').removeClass('hide');
        if (! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          $('.waf-tab').parents('.layout-wrapper').removeClass('fluid');
        }
      }
    });
  }

  loadMoreArticles() {
    this.loadMoreButtonTarget.classList.add('loading');
    this.myDiv = $(this.loadMoreButtonTarget).parents('.waf-body').find('.article-list');
    this.loadmore_url = $(this.loadMoreButtonTarget).attr('data-loadmore')!;
    if (!isNull(this.loadmore_url)) {
      fetch(this.loadmore_url)
        .then(Response => Response.text())
        .then(text => {
          this.loadMoreButtonTarget.classList.remove('loading');
          let htmltext = $(text.trim()).find('.article-list').html();
          $(this.loadMoreButtonTarget).remove();
          let button = $(text.trim()).find('.loadmore')!;
          if (typeof htmltext == "undefined" || htmltext.length <= 0) {
            $(this.loadMoreButtonTarget).remove();
          }
          this.myDiv.append(htmltext);
          this.myDiv.after(button);
        });
    }
  }

  onSearchSubmit(e: Event) {
    e.preventDefault()
    let searchText = this.searchTextTarget.value
    if (!isNull(searchText)) {
      location.href = location.origin + '/search?q=' + searchText
    }
  }
}

export default () => ApplicationObj.register("si-search--widget-layout-14", WidgetLayout14);