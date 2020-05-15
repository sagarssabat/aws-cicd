import { Controller } from 'stimulus'
import { ApplicationObj } from './../../main'
import { isNull } from '../../util'

class WidgetLayout12 extends Controller {

  onTabClick(e: any) {
    let currentTarget = e.currentTarget
    if (!isNull(currentTarget)) {
      let currentId = currentTarget!.getAttribute('id')
      let pos = currentId.split('tabSelection')[1]
      let tabs = document.querySelectorAll('.tab')
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active')
      }
      currentTarget.classList.add('active')

      let tabRows = document.getElementsByClassName('tab-row') as any
      for (let i = 0; i < tabRows.length; i++) {
        tabRows[i].style.display = 'none'
      }
      document.getElementById('tabContent' + pos)!.style.display = 'flex'
    }
  }
  onCardClick(e: Event) {
    let cardItems = document.getElementsByClassName('card-item')! as any
    for (let i = 0; i < cardItems.length; i++) {
      cardItems[i].style.display = 'none'
    }
    document.getElementById('starting-soon-div')!.style.display = 'block'

    setTimeout(() => {
      for (let i = 0; i < cardItems.length; i++) {
        cardItems[i].style.display = 'block'
      }
      document.getElementById('starting-soon-div')!.style.display = 'none'
    }, 3500)
  }
}
export default () => ApplicationObj.register("si-ads--widget-layout-12", WidgetLayout12);