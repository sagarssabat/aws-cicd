//import Vue from 'vue'
import { ApplicationObj } from '../../main'
import { Controller } from 'stimulus'
class WidgetLayout23 extends Controller {
  static targets = ["timer"];

  connect() {
    var countDown = "Dec 19, 2019 15:30:00";
    this.fetchCountDownTimer(new Date(countDown).getTime());
  }

  pad(n: any, width: any, z?: any) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  fetchCountDownTimer(countDownDate: any) {

    if ($(".coutdown-box").length) {
      var renderDigits = (Value: any, Classname: any) => {
        let digits = Array.from(String(Value));
        let Spans = Array.from($(".countdown-timer").find("." + Classname + " .num"));
        digits.forEach((digit, i) => Spans[i].innerHTML = digit);
      }
      var timerInterval = setInterval(() => {

        var now = new Date().getTime();
        var distance = countDownDate - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        renderDigits(this.pad(days, 2), "days");
        renderDigits(this.pad(hours, 2), "hours");
        renderDigits(this.pad(minutes, 2), "mins");
        renderDigits(this.pad(seconds, 2), "secs");
      }, 1000);
    }

  }

}


export default () => ApplicationObj.register('si-custom--widget-layout-23', WidgetLayout23);