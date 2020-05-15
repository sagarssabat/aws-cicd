import * as moment from 'moment'
import Vue from 'vue'
import { ApplicationObj, onWidgetLoad } from './../../main'
import {
  NotificationData,
  NotificationResponse,
  NotificationUserDataArray,
  NotificationUserDataKey,
  NotificationVueData,
  SortType
} from '../../interfaces/comments-reactions'
import { SiTrackingAction } from '../../interfaces/si-tracking'
import { getNotifications, markNotificationAsRead } from '../../services/comments-reactions.service'
import { sendAnalyticsData } from '../../services/miscellaneous.service'
import { logOutUser, verifyUser, getProfileUser } from '../../services/user.service'
import {
  deleteCookie,
  getCookieJSON,
  getQueryStringValue,
  getSiTrackingPayload,
  isNull,
  isNullString,
  setCookie,
  triggerEventByCtrlName,
  getCookie
} from '../../util'
import Constants from '../../utils/constants'
import { CommentsReactions } from '../../vue-components/comments-reactions/comments-reactions'
import {
  URC_Cookie,
  ApiResponse,
  LogOutRequest,
  VerificationRequest,
} from '../../models/social-api-model'
import { UserProfile } from '../../models/user.profile'
import ConfettiGenerator from "confetti-js"

declare global {
  interface HTMLElement {
    value: any
  }
}

class WidgetLayout45 extends CommentsReactions {
  hamburgerTarget: HTMLElement
  formSearchTarget: HTMLElement
  userprofileTabTarget: HTMLElement
  userNameTarget: HTMLElement
  mobileMenuTarget: HTMLElement
  subMenuhamburgerTarget: HTMLElement
  stickyHeaderTarget: HTMLElement
  userprofileImageTarget: HTMLElement
  searchTextTarget: HTMLElement
  logOutBtnTarget: HTMLElement
  viewpostTarget: HTMLElement
  cardmemberTarget: HTMLElement
  membershipTarget: HTMLElement
  membershipClickListner: any
  private userGuid: string
  private notificationVueInstance: Vue
  private fetchNotificationInterval: any

  private userData: ApiResponse

  static targets = [
    "hamburger",
    "formSearch",
    "userprofileTab",
    "userName",
    "mobileMenu",
    "subMenuhamburger",
    "stickyHeader",
    "userprofileImage",
    "searchText",
    "logOutBtn",
    "viewpostTarget",
    'cardmember',
    "membership"
  ];

  connect() {
    this.getUserData()
    this.onScroll()
    // this.toggleUserProfileTab()
    this.insertUserImage()
    onWidgetLoad("si-ads--widget-layout-01", () => this.verifyUser())
    $(this.logOutBtnTarget).removeAttr('pointer-events')
    this.initNotifications()
    this.sendPageView()
    this.trackDownloads()

    if (isNull(this.membershipClickListner)) {
      let membershipClick = document.getElementById('membership')
      this.membershipClickListner = membershipClick!.addEventListener('click', () => {
        window.ga('send', {
          hitType: 'event',
          eventCategory: 'Membership',
          eventAction: 'click',
          eventLabel: 'Click membership Home page'
        })

      })
    }
    this.handleHeaderTopBanner();
  }
  handleHeaderTopBanner() {
    window.innerWidth < 768 && (
      window.addEventListener('scroll', () => {
        window.scrollY > 10 ? (
          document.body.classList.add('sticky-mobile')
        ) : (
            document.body.classList.contains('sticky-mobile') && (
              document.body.classList.remove('sticky-mobile')
            )
          )
      })
    )
  }
  async getUserData() {
    let userProfile = UserProfile.getInstance()
    if (isNull(userProfile.userData)) {
      // console.log('User-Data-Menu: ', `${new Date()} - ${userProfile.isFetching}`)
      userProfile.userData = await userProfile.fetchUserData()
    }
    this.userData = userProfile.userData
    console.log('User-Data: ', this.userData)
    this.toggleUserProfileTab()
  }

  sendPageView() {
    let siTrackingPayload = getSiTrackingPayload()
    sendAnalyticsData(siTrackingPayload)
  }

  trackDownloads() {
    document.addEventListener('click', function (event: any) {

      // If the clicked element doesn't have the right selector, bail
      if (!event.target.matches('.btn-download')) return

      // get the href and send it in url for tracking
      let href = event.target.getAttribute('href')
      if (isNull(href)) {
        href = ''
      }

      let siTrackingPayload = getSiTrackingPayload()
      siTrackingPayload.data.action = SiTrackingAction.DOWNLOAD
      siTrackingPayload.data.extra = location.href
      siTrackingPayload.data.url = href
      sendAnalyticsData(siTrackingPayload)

    }, false)
  }

  toggleUserProfileTab() {
    let userData = this.userData
    if (userData && !isNull(userData.data.token!)) {
      $(this.userprofileTabTarget).removeClass("user-logged-in")
      $(this.userprofileTabTarget).addClass("active")
      this.userNameTarget.innerHTML = userData.data.user.name
      this.cardmemberTarget.innerHTML = (userData.data.user.campaign_json!.product_name!).split(" ")[0] + ' Tier Member'
      let className = (userData.data.user.campaign_json!.product_name!).split(" ")[0].toLowerCase()
      $(this.membershipTarget).addClass(className)
    } else {
      $(this.userprofileTabTarget).addClass("user-logged-in")
      $(this.userprofileTabTarget).removeClass("active")
    }
  }

  toggleMiJunior(e: any) {
    e.preventDefault()
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      if (e.target.classList.contains("icon-down-arrow")) {
        if (e.target.parentElement.classList.contains("active")) {
          e.target.parentElement.classList.remove("active")
        } else {
          e.target.parentElement.classList.add("active")
        }
      } else {
        if (e.target.classList.contains("icon-mi-junior")) {
          location.pathname = e.target.getAttribute("href")
        } else if (e.target.classList.contains("mi-junior")) {
          location.pathname = e.target.parentElement.getAttribute("href")
        }
      }
    }
  }

  async logOutUser() {
    $(this.logOutBtnTarget).css({ 'pointer-events': 'none' })

    let userCookie = getCookieJSON<URC_Cookie>('_URC')

    let payLoad: LogOutRequest = {
      data: {
        user_guid: userCookie!.user_guid
      }
    }
    let responseData: ApiResponse = await logOutUser(payLoad)

    if (responseData.data.status === "1") {
      deleteCookie('_URC')
      location.href = "/"
    }
  }

  async getImageData() {
    let userProfile = UserProfile.getInstance()
    if (isNull(userProfile.userData)) {
      // console.log('User-Data-Menu: ', `${new Date()} - ${userProfile.isFetching}`)
      // userProfile.userData = await userProfile.fetchUserData()
      let pl = {
        token: getCookieJSON<URC_Cookie>("_URC")!.user_guid
      }
      userProfile.userData = await getProfileUser(pl)
    }
    let userData = userProfile.userData
    let userName = userData.data.user.name // The username to be displayed
    let expdate = userData.data.user.campaign_json!.expiry_date!.split(" ")
    let expiryDate = ""
    if (expdate[0] == "") {
      expiryDate = ""
    } else {
      let date = expdate[0]!.split('-')
      let year = date[0].split('0')
      expiryDate = date[1] + '/' + year[1] // The expiry date to be displayed
    }

    let userId = userData.data.token!
    $("#successNAmeUpper").text(userName)
    $("#successNameCard").text(userName)
    $("#expiryDate").text(expiryDate)

    let templateUrl = "https://www.dummyTeam.com/static-resources/campaigns/membership/template/blue-card.pug"
    let payloadData = {
      templateUrl: `${templateUrl}?v=${new Date().getTime()}`,
      templateData: {
        membership: {
          name: userName, // replace this with actual name
          expiry: expiryDate // replace this with actual expiry in MM/YY format
        }
      }
    }

    // Replace the userId below with actual userId
    let imageKey = `prod/campaigns/membership/images/${userId}.jpg`
    let imgPath = `https://www.dummyTeam.com/static-resources/campaigns/membership/images/${userId}.jpg?v=${new Date().getTime()}`
    let shareLinkPayload = {
      url: 'https://464okvtx8d.execute-api.ap-south-1.amazonaws.com/prod/getHtml',
      format: 'jpg',
      opType: 'POST',
      postData: JSON.stringify(payloadData),
      bucket: 'assets-dummyTeam.sportz.io',
      key: imageKey,
      width: '375',
      height: '240'
    }
    fetch("https://v0yzv923b6.execute-api.ap-south-1.amazonaws.com/dev/ImageGenerator", {
      method: "POST",
      mode: 'no-cors',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(shareLinkPayload)
    })
      .then(function (data) {
        // this is success
        if (document.getElementById("socialShareBtn")!.classList.contains("loading")) {
          document.getElementById("socialShareBtn")!.classList.remove("loading")
          document.getElementById("downloadLink")!.setAttribute("href", imgPath)
          document.getElementById("shareIconsUl")!.setAttribute("imgPath", imgPath)
        }
      })
      .catch((err) => {
        console.error('err: ', err)
      })

    document.querySelector(".modal-successful-verif")!.classList.add("show")
  }

  callConfettiFunc() {
    let confettiSettings = {
      "target": "confetti-canvas",
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
    }
    var confetti = new ConfettiGenerator(confettiSettings)
    confetti.clock = 1000

    confetti.render()

    setTimeout(function () {
      confetti.clear()
      document.getElementById("confetti-canvas")!.remove()
    }, 5000)
  }

  async verifyUser() {
    let verificationKey = getQueryStringValue("verify")
    if (undefined !== verificationKey) {
      let payLoad: VerificationRequest = {
        data: {
          verification_key: verificationKey
        }
      }
      let responseData: ApiResponse = await verifyUser(payLoad)
      if (responseData.data.status === "1") {
        if (!isNull(responseData.data.gift_id) && responseData.data.gift_id != "0") {
          setCookie(Constants.COOKIE_GRATIFICATION_GIFT, responseData.data.gift_name)
          triggerEventByCtrlName("si-ads--widget-layout-01", "open-gratification-modal")
        } else {
          // Show confetti tab
          document.querySelector(".modal-successful-verif")!.classList.add("show")
          document.getElementById("verificationForm")!.classList.remove("show")
          this.getImageData()
          this.callConfettiFunc()
          document.body.classList.add("no-scroll")
        }
      } else if (responseData.data.status === "2") {
        location.href = "user-profile"
      } else if (responseData.data.status === "0" || Number(responseData.data.status) < 0) {
        window.location.href = window.location.origin
      }
    }
  }

  toggleSubMenuHamburger() {
    this.toggleSubmenuActive()
    if ($(this.subMenuhamburgerTarget).hasClass("active")) {
      let CloseEvent = (e: Event) => {
        let modalBody = $(this.subMenuhamburgerTarget).parent('.submenu')
        let currentElement = e.target as HTMLElement
        let submenuContainer = $(this.subMenuhamburgerTarget)
        if (!(submenuContainer.is(currentElement) || submenuContainer.has(currentElement).length > 0)) {
          this.toggleSubmenuActive()
          document.removeEventListener('click', CloseEvent)
        }
      }
      document.addEventListener('click', CloseEvent)
    }
  }
  toggleSubmenuActive() {
    $(this.subMenuhamburgerTarget).parent('.submenu').toggleClass("active")
    $(this.subMenuhamburgerTarget).toggleClass("active")
  }

  openSearch() {
    $(this.formSearchTarget).addClass("active")
    this.searchTextTarget.focus()
  }

  closeSearch() {
    $(this.formSearchTarget).removeClass("active")
    this.searchTextTarget.value = ""
    this.searchTextTarget.blur()
  }

  openSignin(e: Event) {
    e.stopPropagation()
    triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal")
  }

  toggleMobileMenu(e: Event) {
    if ($(this.mobileMenuTarget).hasClass('active')) {
      $(this.mobileMenuTarget).removeClass('active')
      $(this.hamburgerTarget).removeClass('active')
      $(this.formSearchTarget).removeClass("active")
    } else {
      $(this.mobileMenuTarget).addClass('active')
      $(this.hamburgerTarget).addClass('active')
      $(this.formSearchTarget).addClass("active")
    }
  }

  insertUserImage() {
    let userCookie = getCookieJSON<URC_Cookie>('_URC')
    if (userCookie && !isNull(userCookie.social_user_image)) {
      let imgeSrc = userCookie!.social_user_image
      this.userprofileImageTarget.setAttribute("src", imgeSrc)
    }
  }

  onScroll() {
    let context = this
    $(window).scroll(function () {
      if (Number($(window).width()) > 992) {
        if (Number($(this).scrollTop()) > 180) {
          $(".site").addClass("sticky")
        } else {
          $(".site").removeClass("sticky")
        }
      }
    })
  }

  onSearchSubmit(e: Event) {
    e.preventDefault()
    let searchText = this.searchTextTarget.value
    if (!isNull(searchText)) {
      location.href = location.origin + '/search?q=' + searchText
    }
  }

  toggleNotificationActive() {
    $('#user-notification').toggleClass('active')
    if (!$('#user-notification').hasClass('active')) {
      $('.site').removeClass('no-scroll')
    }
  }

  toggleNotification() {
    this.toggleNotificationActive()

    if ($('#user-notification').hasClass("active")) {
      $('.site').addClass('no-scroll')
      let CloseEvent = (e: Event) => {
        let currentElement = e.target as HTMLElement
        let notificationContainer = $('#user-notification')
        if (!(notificationContainer.is(currentElement) || notificationContainer.has(currentElement).length > 0)) {
          $('#user-notification').removeClass('active')
          document.removeEventListener('click', CloseEvent)
          $('.site').removeClass('no-scroll')
        }
      }
      document.addEventListener('click', CloseEvent)
    }
  }

  toggleLoginWrapActive() {
    $('#login-wrap').toggleClass('active')
    if (!$('#login-wrap').hasClass('active')) {
      $('.site').removeClass('no-scroll')
    }
  }

  toggleLoginWrap() {
    this.toggleLoginWrapActive()

    if ($('#login-wrap').hasClass("active")) {
      // $('.site').addClass('no-scroll')
      let CloseEvent = (e: Event) => {
        let currentElement = e.target as HTMLElement
        let loginContainer = $('#login-wrap')
        if (!(loginContainer.is(currentElement) || loginContainer.has(currentElement).length > 0)) {
          $('#login-wrap').removeClass('active')
          document.removeEventListener('click', CloseEvent)
          // $('.site').removeClass('no-scroll')
        }
      }
      document.addEventListener('click', CloseEvent)
    }
  }

  switchNotificationsToReactions(commentId: number) {
    $('#userNotifications').hide()
    $('#notificationCommentsContainer').show()
    this.loadNotificationWidget(commentId)
  }

  switchReactionsToNotifications() {
    $('#userNotifications').show()
    $('#notificationCommentsContainer').hide()
  }

  viewPost() {
    let redirectUrl: string = ''
    let assetType = 0
    if (!isNull(this.assetType) && !isNull(this.title_alias)) {
      assetType = this.assetType
    }

    switch (assetType) {
      case 1:
        redirectUrl += '/news/'
        break
      case 2:
        redirectUrl += '/photos/'
        break
      case 4:
        redirectUrl += '/videos/'
        break
      default:
        return
    }

    if (!isNullString(redirectUrl)) {
      redirectUrl += this.title_alias
      location.href = redirectUrl
    }
  }

  initNotifications() {
    let context = this
    let userCookie = getCookieJSON<URC_Cookie>('_URC')
    if (!isNull(userCookie!) && !isNull(userCookie!.user_guid)) {
      this.userGuid = userCookie!.user_guid
    }
    if (isNull(this.userGuid)) {
      return
    }

    let newNotifications: NotificationUserDataArray[] = []
    let earlierNotifications: NotificationUserDataArray[] = []

    let notificationVueData: NotificationVueData = {
      newNotifications,
      earlierNotifications,
      notificationCount: 0
    }

    if (isNull(this.notificationVueInstance)) {
      this.notificationVueInstance = new Vue({
        el: '#userNotifications',
        data: notificationVueData,
        methods: {
          async getNotifications() {
            let notificationResponse: NotificationResponse = await getNotifications({ user_guid: context.userGuid })
            if (!isNull(notificationResponse)) {
              this.newNotifications = []
              this.earlierNotifications = []
              if (!isNull(notificationResponse.new) && notificationResponse.new.length > 0) {
                for (let notification of notificationResponse.new) {

                  let userReactedNotifications: NotificationData[] = []
                  let userRepliedNotification: NotificationData[] = []

                  if (!isNull(notification.user_data) && notification.user_data.length > 0) {
                    for (let notificationData of notification.user_data) {
                      if (notificationData.reaction_id == 4) {
                        userRepliedNotification.push(notificationData)
                      } else {
                        userReactedNotifications.push(notificationData)
                      }
                    }
                  }
                  notification.replies = userRepliedNotification
                  notification.reactions = userReactedNotifications

                  let notificationOne = this.getNotificationData({ ...notification }, NotificationUserDataKey.replies)
                  if (!isNull(notificationOne) && !isNull(notificationOne.notification_data!) && !isNull(notificationOne.notification_data!.reaction_date)) {
                    this.newNotifications.push(notificationOne)
                  }

                  let notificationTwo = this.getNotificationData({ ...notification }, NotificationUserDataKey.reactions)
                  if (!isNull(notificationTwo) && !isNull(notificationTwo.notification_data!) && !isNull(notificationTwo.notification_data!.reaction_date)) {
                    this.newNotifications.push(notificationTwo)
                  }
                }

                this.newNotifications = this.sortNotifications(this.newNotifications, SortType.DESC)

                // new notification count
                if (this.newNotifications.length > 0) {
                  this.notificationCount = this.newNotifications.length
                }
                this.updateNotificationCount()
              }

              if (!isNull(notificationResponse.earlier) && notificationResponse.earlier.length > 0) {
                for (let notification of notificationResponse.earlier) {
                  let userReactedNotifications: NotificationData[] = []
                  let userRepliedNotification: NotificationData[] = []

                  if (!isNull(notification.user_data) && notification.user_data.length > 0) {
                    for (let notificationData of notification.user_data) {
                      if (notificationData.reaction_id == 4) {
                        userRepliedNotification.push(notificationData)
                      } else {
                        userReactedNotifications.push(notificationData)
                      }
                    }
                  }
                  notification.replies = userRepliedNotification
                  notification.reactions = userReactedNotifications

                  let notificationOne = this.getNotificationData({ ...notification }, NotificationUserDataKey.replies)
                  if (!isNull(notificationOne) && !isNull(notificationOne.notification_data!) && !isNull(notificationOne.notification_data!.reaction_date)) {
                    this.earlierNotifications.push(notificationOne)
                  }

                  let notificationTwo = this.getNotificationData({ ...notification }, NotificationUserDataKey.reactions)
                  if (!isNull(notificationTwo) && !isNull(notificationTwo.notification_data!) && !isNull(notificationTwo.notification_data!.reaction_date)) {
                    this.earlierNotifications.push(notificationTwo)
                  }
                }

                this.earlierNotifications = this.sortNotifications(this.earlierNotifications, SortType.DESC)
              }
            } else {
              // No Notifications
            }
          },
          getNotificationData(notification: NotificationUserDataArray, key: NotificationUserDataKey): NotificationUserDataArray {
            notification.notification_data = notification[key!]![0]
            if (!isNull(notification.notification_data) && !isNull(notification.notification_data.comment_id)) {
              notification.notification_data.extra_text = ''
              notification.notification_date_millis = moment(notification.notification_data.reaction_date).valueOf()
              notification.notification_data.reaction_date = moment(notification.notification_data.reaction_date).fromNow()

              if (notification[key!]!.length > 1) {
                notification.notification_data.extra_text = ' and ' + (notification[key!]!.length - 1) + ' other people have '
              }

              if (notification.notification_data.reaction_id == 4) {
                notification.notification_data.extra_text += 'replied '
              } else {
                notification.notification_data.extra_text += 'reacted '
              }
              notification.notification_data.extra_text += 'to your comment'

              return notification
            } else {
              let notificationData: NotificationData = {
                user_id: 0,
                client_id: 0,
                comment_id: 0,
                reply_date: '',
                reaction_id: 0,
                reaction_date: '',
                user_full_name: '',
                is_custom_image: 0,
                profile_picture_url: '',
              }

              return {
                user_data: [],
                notification_data: notificationData,
                notification_date_millis: 0,
                replies: [],
                reactions: []
              }
            }

          },
          sortNotifications(notifications: NotificationUserDataArray[], sortOrder: SortType): NotificationUserDataArray[] {
            return notifications.sort((a: NotificationUserDataArray, b: NotificationUserDataArray) => {
              if (sortOrder === SortType.ASC) {
                if (a.notification_date_millis! > b.notification_date_millis!) {
                  return 1
                } else {
                  return -1
                }
              } else {
                if (a.notification_date_millis! < b.notification_date_millis!) {
                  return 1
                } else {
                  return -1
                }
              }

            })
          },
          updateNotificationCount() {
            if (this.notificationCount > 0) {
              $('#notificationCount').show()
              $('#notificationCount').html(this.notificationCount.toString())
            } else {
              $('#notificationCount').html('')
              $('#notificationCount').hide()
            }
          },
          markAllAsRead() {
            let commentId: string = ''
            for (let notification of this.newNotifications) {
              commentId += notification.notification_data!.comment_id + ','
            }
            // remove the last comma
            commentId = commentId.replace(/,\s*$/, '')
            markNotificationAsRead({ comment_id: commentId })
            this.notificationCount = 0
            this.updateNotificationCount()
          },
          onNotificationClick(notificationData: NotificationData) {
            markNotificationAsRead({ comment_id: notificationData.comment_id.toString() })
            if (this.notificationCount > 0) {
              --this.notificationCount
              this.updateNotificationCount()
            }
            context.switchNotificationsToReactions(notificationData.comment_id)
          },
          startNotificationInterval() {
            if (isNull(context.fetchNotificationInterval)) {
              context.fetchNotificationInterval = setInterval(() => {
                this.getNotifications()
              }, 120000)
            }
          }
        },
        mounted() {
          this.getNotifications()
          this.startNotificationInterval()
        },
        destroyed() {
          if (!isNull(context.fetchNotificationInterval)) {
            context.fetchNotificationInterval.clearInterval()
          }
        }
      })
    }
  }
}

export default () => ApplicationObj.register("si-menu--widget-layout-45", WidgetLayout45)