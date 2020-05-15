import { ApplicationObj } from "./../../main";
import { Controller } from "stimulus";
import ConfettiGenerator from "confetti-js";
import { isNull } from '../../util'


class WidgetLayout04 extends Controller {
  confettiTarget: HTMLElement;
  cardDownloadListener: any
  static targets = ["confetti"];

  connect() {
    this.initConfetti();
    if (isNull(this.cardDownloadListener)) {
      let cardDownload = document.getElementById('downloadLink')
      this.cardDownloadListener = cardDownload!.addEventListener('click', () => {
        window.ga('send', {
          hitType: 'event',
          eventCategory: 'MembershipDownloadCard',
          eventAction: 'download',
          eventLabel: 'Click membership download card'
        })

      })
    }
  }

  initConfetti() {
    let confettiSettings = {
      "target": "confetti-canvasSuccess",
      "max": "80",
      "size": "2",
      "animate": true,
      "props": ["circle", "square", "triangle", "line"],
      "colors": [
        [165, 104, 246],
        [230, 61, 135],
        [0, 199, 228],
        [253, 214, 126]
      ],
      "clock": "20",
      "rotate": false,
      "width": "1299",
      "height": "669",
      "start_from_edge": false,
      "respawn": true
    };
    var confetti = new ConfettiGenerator(confettiSettings);
    confetti.clock = 1000

    confetti.render();

    setTimeout(function () {
      confetti.clear();
      document.getElementById("confetti-canvasSuccess")!.remove();
    }, 5000);
  }
}

export default () => ApplicationObj.register("si-paymentstatus--widget-layout-04", WidgetLayout04);