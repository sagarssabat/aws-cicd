import PerfectScrollbar from 'perfect-scrollbar'
import { Controller } from 'stimulus'
import Swiper from 'swiper'
import Vue from 'vue'
import {
  AssetDataQueryParams,
  AssetDataResponse,
  AssetReactionsJson,
  CommentBoxStyle,
  Comments,
  CommentsQueryParams,
  CommentsRepliesQueryParams,
  CommentsRepliesResponse,
  CommentsReply,
  CommentsResponse,
  EditCommentEnum,
  EditCommentPayload,
  InsertCommentReactionPayload,
  NotificationDetailsQueryParams,
  PostCommentReactionResponse,
  ReactionId,
  VueAppCommentsData,
  VueAssetReactionData,
  VueCommentsInitialize
} from '../../interfaces/comments-reactions'
import { SiTrackingAction } from '../../interfaces/si-tracking'
import { SocialShareObject } from '../../interfaces/social-share'
import { URC_Cookie } from '../../models/social-api-model'
import {
  editComment,
  getAssetComments,
  getAssetData,
  getCommentsReplies,
  getNotificationDetails,
  insertCommentReaction
} from '../../services/comments-reactions.service'
import { sendAnalyticsData } from '../../services/miscellaneous.service'
import {
  containsOnlyWhiteSpace,
  getCookieJSON,
  getSiTrackingPayload,
  isNull,
  isNullString,
  triggerEventByCtrlName
} from '../../util'
import { getCommentsReactionsTemplate } from '../../utils/comments-reactions'
import Constants from '../../utils/constants'
import { gifMiQueryParam, gifMyQueryParam } from '../../interfaces/gif.interface'
import { getGifMiData, getGifMyData } from '../../services/gif.service'

declare global {
  interface Window {
    FB: any;
    no: number;
    MYDATA: Array<object>;
    MIDATA: Array<object>;
    myGifPresent: boolean;
  }
}

const COMMENTS_FIRST_LOAD_COUNT = 10

export abstract class CommentsReactions extends Controller {

  reactionsTargets: HTMLElement[]

  static targets = ["reactions"]
  reactionsMarkup: string = getCommentsReactionsTemplate()

  gallerySwiper: Swiper

  isCommentTextInFocus: boolean = false
  isMouseOver: boolean = false
  isVideoPlaying: boolean = false
  isGifTrayActive: boolean = false

  // only required for notification details
  assetType: number
  title_alias: string
  private commentId: number

  commentSectionMouseOver() {
    this.isMouseOver = true
    this.startStopSliderAutoPlay()
  }

  commentSectionMouseOut() {
    this.isMouseOver = false
    this.startStopSliderAutoPlay()
  }

  commentTextInFocus() {
    this.isCommentTextInFocus = true
    this.startStopSliderAutoPlay()
  }

  commentTextOutOfFocus() {
    this.isCommentTextInFocus = false
    this.startStopSliderAutoPlay()
  }

  startStopSliderAutoPlay() {
    if (!isNull(this.gallerySwiper) && !isNull(this.gallerySwiper.autoplay!)) {
      if (this.isCommentTextInFocus === false && this.isVideoPlaying === false && this.isMouseOver === false) {
        if (!this.isGifTrayActive) {
          this.gallerySwiper.autoplay!.start()
        }
      } else {
        this.gallerySwiper.autoplay!.stop()
      }
    }
  }

  loadNotificationWidget(commentId: number): void {
    this.commentId = commentId
    $('#notification-comments').html(this.reactionsMarkup)

    let shareObj: SocialShareObject = {
      url: '',
      title: '',
      description: '',
      imgPath: ''
    }

    let initializeCommentsObj: VueCommentsInitialize = {
      elementId: 'notification-comments',
      assetId: 0,
      assetType: 0,
      shareObj: shareObj,
      commentsResponse: { data: [] },
      isNotificationDetail: true
    }

    this.getCommentData(initializeCommentsObj, commentId)
  }

  async getCommentData(vueCommentsInitialize: VueCommentsInitialize, commentId: number) {
    // variable to hold user guid
    let userGuid: string = ''

    // get user guid from cookie
    let urcCookie = getCookieJSON<URC_Cookie>('_URC')
    if (!isNull(urcCookie!) && !isNull(urcCookie!.user_guid)) {
      userGuid = urcCookie!.user_guid
    }

    let queryParams: NotificationDetailsQueryParams = {
      user_guid: userGuid,
      comment_id: commentId
    }

    let commentsResponse: CommentsResponse = await getNotificationDetails(queryParams)
    console.log('CommentsResponse: ', commentsResponse)
    if (!isNull(commentsResponse) && !isNull(commentsResponse.data)) {
      vueCommentsInitialize.commentsResponse = commentsResponse
      this.initializeComments(vueCommentsInitialize)
    }

  }

  loadReactionsWidget(): void {
    this.getGifList();
  }

  async getGifList() {
    if (window.no == undefined) {
      window.no = 1;
      // Get MI gifs
      let queryParams: gifMiQueryParam = {
        galleryType: '4',
        item: '10',
        page: '1'
      }
      let apiResponse = await getGifMiData(queryParams);
      if (!isNull(apiResponse) && !isNull(apiResponse.items)) {
        window.MIDATA = [...apiResponse.items];
      }

      // Get My gifs
      let urcCookie = getCookieJSON<URC_Cookie>("_URC")!;
      if (!isNull(urcCookie)) {
        let gUid = urcCookie.user_guid
        let queryParams: gifMyQueryParam = {
          galleryType: '4',
          page: '1',
          item: '10',
          status: '1', // Since it is my gif, not pending or try again
          token: gUid
        }
        let apiResponse = await getGifMyData(queryParams);
        if (!isNull(apiResponse) && !isNull(apiResponse.items)) {
          window.MYDATA = [...apiResponse.items];
        }
        if (window.MYDATA.length > 0) {
          window.myGifPresent = true;
        } else {
          window.myGifPresent = false;
        }
      }
    }
    this.initializeAllReactionWidgets()
  }

  initializeAllReactionWidgets(): void {
    let initialCommentsObjArray: VueCommentsInitialize[] = []

    for (let reactionTarget of this.reactionsTargets) {
      let elementId: string = reactionTarget.getAttribute('id')!
      let assetId = reactionTarget.getAttribute('data-asset-id')!
      let assetType = reactionTarget.getAttribute('data-asset-type')!
      //fetching attributes for social sharing:
      let url = reactionTarget.getAttribute('data-asset-url')!
      let title = reactionTarget.getAttribute('data-asset-title')!
      let description = reactionTarget.getAttribute('data-asset-description')!
      let imgPath = reactionTarget.getAttribute('data-asset-imageurl')!

      let shareObj: SocialShareObject = {
        url: url,
        title: title,
        description: description,
        imgPath: imgPath
      }

      $('#' + elementId).html(this.reactionsMarkup)

      let initializeCommentsObj: VueCommentsInitialize = {
        elementId: elementId,
        assetId: parseInt(assetId),
        assetType: parseInt(assetType),
        shareObj: shareObj,
        commentsResponse: { data: [] },
        isNotificationDetail: false
      }

      initialCommentsObjArray.push(initializeCommentsObj)
    }

    this.getInitialComments(initialCommentsObjArray)
  }

  async getInitialComments(vueCommentsInitialize: VueCommentsInitialize[]) {
    // variable to hold user guid
    let userGuid: string = ''

    // whether this is a detail page of home page
    let isDetail: number = 0

    // get user guid from cookie
    let urcCookie = getCookieJSON<URC_Cookie>('_URC')
    if (!isNull(urcCookie!) && !isNull(urcCookie!.user_guid)) {
      userGuid = urcCookie!.user_guid
    }

    // determine isDetail
    if (window.location.pathname === '/') {
      isDetail = 0;
    } else {
      let wafDetailComponent: HTMLElement = document.querySelector('.mi-waf-detail') as HTMLElement
      if (!isNull(wafDetailComponent)) {
        isDetail = 1;
      } else {
        isDetail = 0;
      }
    }

    let assetIdString: string = ''
    let assetTypeString: string = ''

    for (let vueComment of vueCommentsInitialize) {
      assetIdString += vueComment.assetId + ','
      assetTypeString += vueComment.assetType + ','
    }

    // removing the last character from the string, i.e., trailing ','
    assetIdString = assetIdString.slice(0, -1);
    assetTypeString = assetTypeString.slice(0, -1);

    let queryParams: CommentsQueryParams = {
      user_guid: userGuid,
      asset_id: assetIdString,
      asset_type_id: assetTypeString,
      is_detail: isDetail,
      page_number: 1, // since this is initialization default page will always be 1
      item_number: COMMENTS_FIRST_LOAD_COUNT // since this is initialization default item cound will always be 100
    }

    let commentsResponse: CommentsResponse = await getAssetComments(queryParams)

    // Map of assetId and corresponding values from inside of data[index].asset_reaction_json
    let assetMap = new Map<number, AssetReactionsJson>()

    // Set key-values in assetMap
    if (!isNull(commentsResponse) && !isNull(commentsResponse.data) && commentsResponse.data.length > 0) {
      for (let commentData of commentsResponse.data) {
        if (!isNull(commentData.asset_reaction_json)) {
          assetMap.set(commentData.asset_reaction_json.asset_id, commentData)
        }
      }
    }

    for (let vueComment of vueCommentsInitialize) {
      let assetVal = assetMap.get(vueComment.assetId)

      if (!isNull(assetVal!)) {
        vueComment.commentsResponse.data.push(assetVal!)
      }

      this.initializeComments(vueComment)
    }
  }

  initializeComments(vueCommentInitialize: VueCommentsInitialize): void {
    let classContext = this;

    let isFirstLoad: boolean = true
    let commentsLoadCount: number = COMMENTS_FIRST_LOAD_COUNT

    let perfectScrollbarOptions: PerfectScrollbar.Options = {
      suppressScrollX: true
    }

    let initialComments: Comments[] = [];

    let assetReactionsData: VueAssetReactionData = {
      heartReactionUsers: [],
      heartBreakReactionUsers: [],
      likeReactionUsers: [],
      allReactionUsers: [],
      activelyShownUsers: [],
      allCount: 0,
      heartCount: 0,
      heartBreakCount: 0,
      likeCount: 0
    }

    let commentStyle: CommentBoxStyle = {
      maxHeight: '100%',
      minHeight: '0px',
      position: 'relative'
    }

    let userReactionsStyle: CommentBoxStyle = {
      maxHeight: '100%',
      minHeight: 'auto',
      position: 'relative'
    }

    let vueAppData: VueAppCommentsData = {
      assetId: vueCommentInitialize.assetId,
      assetType: vueCommentInitialize.assetType,
      assetComments: initialComments,
      userReaction: 0,
      reactionsCount: 0,
      commentsCount: 0,
      userGuid: '',
      isDetail: 0,
      commentText: '',
      parentCommentId: null,
      assetReactions: assetReactionsData,
      commentItemsToLoad: COMMENTS_FIRST_LOAD_COUNT, // change this to 100
      commentReplyItemsToLoad: 10, // change this to 10
      currentCommentItemPage: 1,
      totalCommentItemPages: 1,
      moreCommentsRemainingToLoad: true,
      shareObj: vueCommentInitialize.shareObj,
      styleObj: commentStyle,
      elementId: vueCommentInitialize.elementId,
      inputCommentId: vueCommentInitialize.elementId + vueCommentInitialize.assetId,
      styleObjUserReactions: userReactionsStyle,
      isEditing: false,
      cancelBtnId: Constants.CANCEL_BTN_PREFIX + vueCommentInitialize.elementId + vueCommentInitialize.assetId,
      commentBodyId: Constants.COMMENT_BODY_PREFIX + vueCommentInitialize.elementId + vueCommentInitialize.assetId,
      popupReactionsUserListId: Constants.POPUP_REACTIONS_USERLIST_PREFIX + vueCommentInitialize.elementId + vueCommentInitialize.assetId,
      mainCommentScroller: '',
      reactionScroller: '',
      scrollContainer: '',
      reactionScrollContainer: '',
      isNotificationDetail: vueCommentInitialize.isNotificationDetail,
      mIData: window.MIDATA,
      myData: window.MYDATA,
      myGifPresent: window.myGifPresent,
    }

    let rApp: { [key: string]: any } = {};
    rApp[vueCommentInitialize.elementId] = new Vue({
      el: '#' + vueCommentInitialize.elementId,
      data: vueAppData,
      methods: {
        setUserGuid() {
          let urcCookie = getCookieJSON<URC_Cookie>('_URC')
          if (!isNull(urcCookie!) && !isNull(urcCookie!.user_guid)) {
            this.userGuid = urcCookie!.user_guid
          }
        },
        isUserLoggedIn() {
          return !isNullString(this.userGuid) ? true : false
        },
        setIsDetail() {
          if (window.location.pathname === '/') {
            this.isDetail = 0;
            this.styleObj.maxHeight = '196px';
            this.styleObj.minHeight = '0px';
          } else {
            let wafDetailComponent: HTMLElement = document.querySelector('.mi-waf-detail') as HTMLElement
            if (!isNull(wafDetailComponent)) {
              this.isDetail = 1;
              this.styleObj.maxHeight = 'auto'
              this.styleObj.minHeight = '0px'
            } else {
              this.isDetail = 0;
              this.styleObj.maxHeight = '196px';
              this.styleObj.minHeight = '0px';
            }
          }
        },
        initializeWidget() {
          this.setUserGuid();
          this.setIsDetail();
          if (this.isNotificationDetail === false) {
            this.setComments(vueCommentInitialize.commentsResponse)
          } else if (this.isNotificationDetail === true) {
            this.setCommentDetail(vueCommentInitialize.commentsResponse)
          }

          this.setCustomScroll()
        },
        setCustomScroll() {
          this.scrollContainer = document.querySelector('#' + this.commentBodyId) as HTMLElement
          if (!isNull(this.scrollContainer)) {
            // this.mainCommentScroller = new PerfectScrollbar(this.scrollContainer, perfectScrollbarOptions);
          }

          this.reactionScrollContainer = document.querySelector('#' + this.popupReactionsUserListId) as HTMLElement
          if (!isNull(this.reactionScrollContainer)) {
            // this.reactionScroller = new PerfectScrollbar(this.reactionScrollContainer, perfectScrollbarOptions)
          }
        },
        setCommentHeight() {
          if (this.isDetail === 1) {
            let wafDetailComponent: HTMLElement = document.querySelector('.mi-waf-detail') as HTMLElement
            if (!isNull(wafDetailComponent)) {
              if (!isNull(this.assetComments) && this.assetComments.length > 0) {
                this.styleObj.maxHeight = 'auto'
                this.styleObj.minHeight = '0px'
              } else {
                this.styleObj.maxHeight = '0px'
                this.styleObj.minHeight = '0px'
              }
            }
          }
        },
        facebookShare() {
          window.FB.XFBML.parse();
          window.FB.ui({
            method: 'share',
            action_type: 'og.shares',
            action_properties: JSON.stringify({
              object: {
                'og:url': this.shareObj.url,
                'og:title': this.shareObj.title,
                'og:description': this.shareObj.description,
                'og:image': this.shareObj.imgPath
              }
            })
          });

          // send share tracking
          let siTrackingPayload = getSiTrackingPayload()
          siTrackingPayload.data.action = SiTrackingAction.SHARE
          siTrackingPayload.data.extra = 'fb'
          sendAnalyticsData(siTrackingPayload)
        },
        twitterShare() {
          let twitterTitle = this.shareObj.title
          let url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(twitterTitle) + "&url=" + encodeURIComponent(this.shareObj.url);
          window.open(url, 'Share_Page', 'width=600,height=400, scrollbars=no, resizable=no, top=250, left=250', false);

          // send share tracking
          let siTrackingPayload = getSiTrackingPayload()
          siTrackingPayload.data.action = SiTrackingAction.SHARE
          siTrackingPayload.data.extra = 'twitter'
          sendAnalyticsData(siTrackingPayload)
        },
        setCommentDetail(commentsResponse: CommentsResponse) {
          if (!isNull(commentsResponse) && !isNull(commentsResponse.data) && commentsResponse.data.length > 0 && !isNull(commentsResponse.data[0].asset_reaction_json)) {
            this.assetComments = this.assetComments.concat(commentsResponse.data[0].asset_reaction_json.comments);
            this.assetId = commentsResponse.data[0].asset_reaction_json.asset_id
            this.assetType = commentsResponse.data[0].asset_reaction_json.asset_type_id

            classContext.assetType = this.assetType
            classContext.title_alias = commentsResponse.data[0].asset_reaction_json.title_alias!
          }
          this.moreCommentsRemainingToLoad = false
        },
        setComments(commentsResponse: CommentsResponse, reactionId?: ReactionId) {
          if (!isNull(commentsResponse) && !isNull(commentsResponse.data) && commentsResponse.data.length > 0 && !isNull(commentsResponse.data[0].asset_reaction_json)) {
            this.userReaction = commentsResponse.data[0].asset_reaction_json.user_reaction;
            let reactionsCount: number = commentsResponse.data[0].asset_reaction_json.reactions_count;
            let commentsCount: number = commentsResponse.data[0].asset_reaction_json.comments_count;
            if (!isNaN(reactionsCount)) {
              this.reactionsCount = reactionsCount
            }

            if (!isNaN(commentsCount)) {
              this.commentsCount = commentsCount

              if (this.isDetail === 1) {
                // pagination logic
                if (isFirstLoad === true) {
                  isFirstLoad = false
                  this.totalCommentItemPages = this.getPaginationPages(commentsCount, COMMENTS_FIRST_LOAD_COUNT)
                } else {
                  this.totalCommentItemPages = this.getPaginationPages(commentsCount, this.commentItemsToLoad)
                }

                if (this.totalCommentItemPages > this.currentCommentItemPage) {
                  this.currentCommentItemPage += 1
                } else if (this.totalCommentItemPages <= this.currentCommentItemPage) {
                  this.moreCommentsRemainingToLoad = false;
                }

                // concat comments only if comment is posted and not when a reaction is posted
                if (undefined === reactionId || reactionId === 4) {
                  if (!isNull(commentsResponse.data[0].asset_reaction_json.comments) && commentsResponse.data[0].asset_reaction_json.comments.length > 0) {
                    this.assetComments = this.assetComments.concat(commentsResponse.data[0].asset_reaction_json.comments);
                    // scroll to bottom if isDetail on adding comment
                    $('#' + this.commentBodyId).animate({
                      scrollTop: $('#' + this.commentBodyId)[0].scrollHeight
                    }, "slow");
                  } else {
                    if (this.assetComments.length === 0) {
                      this.moreCommentsRemainingToLoad = false;
                    }
                  }

                } else {
                  // reaction was posted for comment or reply
                  if (!isNull(commentsResponse.data[0].asset_reaction_json.comments)) {
                    for (let comment of this.assetComments) {
                      for (let responseComment of commentsResponse.data[0].asset_reaction_json.comments) {
                        if (comment.comment_id === responseComment.comment_id) {
                          comment.reactions_count = responseComment.reactions_count
                          comment.total_replies = responseComment.total_replies
                          comment.user_reaction = responseComment.user_reaction
                          if ((!isNull(comment.latest_reply) && (comment.latest_reply.length > 0)) && (!isNull(responseComment.latest_reply) && (responseComment.latest_reply.length > 0))) {
                            for (let commentReply of comment.latest_reply) {
                              if (commentReply.comment_id === responseComment.latest_reply[0].comment_id) {
                                commentReply.reactions_count = responseComment.latest_reply[0].reactions_count
                                commentReply.total_replies = responseComment.latest_reply[0].total_replies
                                commentReply.user_reaction = responseComment.latest_reply[0].user_reaction
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                // for homepage there is no loadmore
                this.moreCommentsRemainingToLoad = false;
                // concat comments only if comment is posted and not when a reaction is posted
                if (undefined === reactionId || reactionId === 4) {
                  if (!isNull(commentsResponse.data[0].asset_reaction_json.comments) && commentsResponse.data[0].asset_reaction_json.comments.length > 0) {
                    this.assetComments = this.assetComments.concat(commentsResponse.data[0].asset_reaction_json.comments);
                    // scroll to bottom if isDetail on adding comment
                    $('#' + this.commentBodyId).animate({
                      scrollTop: $('#' + this.commentBodyId)[0].scrollHeight
                    }, "slow");
                  } else {
                    if (this.assetComments.length === 0) {
                      this.moreCommentsRemainingToLoad = false;
                    }
                  }
                } else {
                  // reaction was posted
                  for (let comment of this.assetComments) {
                    for (let responseComment of commentsResponse.data[0].asset_reaction_json.comments) {
                      if (comment.comment_id === responseComment.comment_id) {
                        comment.reactions_count = responseComment.reactions_count
                        comment.total_replies = responseComment.total_replies
                        comment.user_reaction = responseComment.user_reaction
                        if ((!isNull(comment.latest_reply) && (comment.latest_reply.length > 0)) && (!isNull(responseComment.latest_reply) && (responseComment.latest_reply.length > 0))) {
                          for (let commentReply of comment.latest_reply) {
                            if (commentReply.comment_id === responseComment.latest_reply[0].comment_id) {
                              commentReply.reactions_count = responseComment.latest_reply[0].reactions_count
                              commentReply.total_replies = responseComment.latest_reply[0].total_replies
                              commentReply.user_reaction = responseComment.latest_reply[0].user_reaction
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

          } else {
            if (this.assetComments.length === 0) {
              this.moreCommentsRemainingToLoad = false;
            }
          }
          this.setCommentHeight()
          if (!isNull(this.mainCommentScroller)) {
            (this.mainCommentScroller as PerfectScrollbar).update();
          }
        },
        async getComments() {
          let queryParams: CommentsQueryParams = {
            user_guid: this.userGuid,
            asset_id: this.assetId,
            asset_type_id: this.assetType,
            is_detail: this.isDetail,
            page_number: this.currentCommentItemPage,
            item_number: this.commentItemsToLoad
          }
          let commentsResponse: CommentsResponse = await getAssetComments(queryParams)
          this.setComments(commentsResponse)
        },

        async getCommentsReplies(comment: Comments) {
          if (isNaN(comment.currentReplyItemPage!)) {
            comment.currentReplyItemPage! = 1
          }

          let queryParams: CommentsRepliesQueryParams = {
            user_guid: this.userGuid,
            comment_id: comment.comment_id,
            page_number: comment.currentReplyItemPage!,
            item_number: this.commentReplyItemsToLoad
          }

          let commentsReplies: CommentsRepliesResponse = await getCommentsReplies(queryParams)

          if (!isNull(commentsReplies) && !isNull(commentsReplies.replies) && commentsReplies.replies.length > 0) {
            for (let assetComment of this.assetComments) {
              if (assetComment.comment_id === comment.comment_id) {
                assetComment.latest_reply = assetComment.latest_reply.concat(commentsReplies.replies);

                assetComment.totalReplyItemPages = this.getPaginationPages(assetComment.total_replies, this.commentReplyItemsToLoad)

                if (assetComment.totalReplyItemPages > assetComment.currentReplyItemPage!) {
                  assetComment.currentReplyItemPage! += 1
                }
                break;
              }
            }
          }
        },

        getComment(commentId: number, parentCommentId?: number): Comments | CommentsReply {
          let res: Comments | CommentsReply
          if (!isNull(parentCommentId!)) {
            // this is a reply
            for (let comment of this.assetComments) {
              if (comment.comment_id === parentCommentId) {
                for (let reply of comment.latest_reply) {
                  if (reply.comment_id === commentId) {
                    res = reply
                    break
                  }
                }
              }
            }
          } else {
            // this is the parent comment
            for (let comment of this.assetComments) {
              if (comment.comment_id === commentId) {
                res = comment
              }
            }
          }

          return res!
        },

        replyTo(commentId: number, parentCommentId?: number) {
          let parentCommId = commentId
          if (!isNull(parentCommentId!)) {
            parentCommId = parentCommentId!
          }

          $('.icon-reply').removeClass('active')

          let replyComment: Comments | CommentsReply = this.getComment(commentId, parentCommentId)
          let commentField = $('#' + this.inputCommentId)

          $('.reply-icon-' + commentId).toggleClass('active');

          if ($('.reply-icon-' + commentId).hasClass('active')) {
            this.parentCommentId = parentCommId;
            commentField.focus()
            commentField.attr('placeholder', 'Replying to ' + replyComment.user_full_name);
          } else {
            this.parentCommentId = null;
            commentField.attr('placeholder', 'Write a comment...');
          }
        },

        clearReplyTo() {
          this.parentCommentId = null
          $('.icon-reply').removeClass('active');
          // change placeholder text
          let commentField = $('#' + this.inputCommentId)
          commentField.attr('placeholder', 'Write a comment...')
        },

        clearEditing() {
          delete this.commentToEdit
          delete this.parentCommentOfEdit
          this.isEditing = false
          this.commentText = ''
          let commentField = $('#' + this.inputCommentId)
          commentField.attr('placeholder', 'Write a comment...')
          $('#' + this.cancelBtnId).removeClass('active')
        },

        async getReactionPopupData(commentId?: number) {
          this.assetReactions = {
            heartReactionUsers: [],
            heartBreakReactionUsers: [],
            likeReactionUsers: [],
            allReactionUsers: [],
            activelyShownUsers: [],
            allCount: 0,
            heartCount: 0,
            heartBreakCount: 0,
            likeCount: 0
          };
          let reactionDataPayload: AssetDataQueryParams = {
            page_number: 1,
            item_number: 1000,
            asset_id: this.assetId,
            asset_type_id: this.assetType
          }

          if (!isNull(commentId!) && typeof commentId == 'number') {
            reactionDataPayload.comment_id = commentId!
          }

          let assetDataResponse: AssetDataResponse = await getAssetData(reactionDataPayload)
          if (!isNull(assetDataResponse) && !isNull(assetDataResponse.data) && assetDataResponse.data.length > 0) {
            let assetReaction = assetDataResponse.data[0]

            if (!isNull(assetReaction.reaction_count_json) && !isNull(assetReaction.reaction_count_json.reaction_count) && assetReaction.reaction_count_json.reaction_count.length > 0) {
              for (let reactionCount of assetReaction.reaction_count_json.reaction_count) {
                this.assetReactions.allCount += reactionCount.count

                if (reactionCount.reaction_id === 1) {
                  this.assetReactions.heartCount = reactionCount.count
                } else if (reactionCount.reaction_id === 2) {
                  this.assetReactions.heartBreakCount = reactionCount.count
                } else if (reactionCount.reaction_id === 3) {
                  this.assetReactions.likeCount = reactionCount.count
                }
              }
            }

            if (!isNull(assetReaction.user_reaction_json) && !isNull(assetReaction.user_reaction_json.user_reaction) && assetReaction.user_reaction_json.user_reaction.length > 0) {
              for (let userReaction of assetReaction.user_reaction_json.user_reaction) {
                this.assetReactions.allReactionUsers.push(userReaction)

                if (userReaction.reaction_id === 1) {
                  this.assetReactions.heartReactionUsers.push(userReaction)
                } else if (userReaction.reaction_id === 2) {
                  this.assetReactions.heartBreakReactionUsers.push(userReaction)
                } else if (userReaction.reaction_id === 3) {
                  this.assetReactions.likeReactionUsers.push(userReaction)
                }
              }

              // set default shown users to all reaction
              this.assetReactions.activelyShownUsers = this.assetReactions.allReactionUsers;
            }
          }
          if (!isNull(this.reactionScroller)) {
            (this.reactionScroller as PerfectScrollbar).update()
          }
        },

        submitComment(reactionId: ReactionId, gifCommentType?: number | string, gifUrl?: string) {
          if (!this.isUserLoggedIn()) {
            window!.event!.stopImmediatePropagation();
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
            return
          }

          if (this.isEditing === true) {
            this.editComment()
            return
          }

          let submitCommentPayload: InsertCommentReactionPayload = {
            user_guid: '',
            asset_id: 0,
            asset_type_id: 0,
            comment_id: null,
            reaction_id: 0,
            comment_text: null,
            parent_comment_id: null
          }
          if (reactionId === 4) {
            // Posting comment
            if (!isNullString(this.commentText) && !containsOnlyWhiteSpace(this.commentText) && gifCommentType == undefined) {
              let commentId = null

              submitCommentPayload = {
                user_guid: this.userGuid,
                asset_id: this.assetId,
                asset_type_id: this.assetType,
                comment_id: commentId,
                reaction_id: reactionId,
                comment_text: this.commentText,
                parent_comment_id: this.parentCommentId
              }
            } else if (gifCommentType !== undefined) {
              // Posting GIF
              let commentId = null

              let gifPathToForward: string = "";
              if (gifUrl!.includes("beta-mi.sportz.io")) {
                gifPathToForward = gifUrl!.split("beta-mi.sportz.io").pop()!;
              } else if (gifUrl!.includes("dummyTeam.com")) {
                gifPathToForward = gifUrl!.split("dummyTeam.com").pop()!;
              }
              submitCommentPayload = {
                user_guid: this.userGuid,
                asset_id: this.assetId,
                asset_type_id: this.assetType,
                comment_id: commentId,
                reaction_id: reactionId,
                comment_text: gifPathToForward!,
                parent_comment_id: this.parentCommentId,
                comment_type: gifCommentType
              }
            }
          } else {
            // Posting reaction
            submitCommentPayload = {
              user_guid: this.userGuid,
              asset_id: this.assetId,
              asset_type_id: this.assetType,
              comment_id: null,
              reaction_id: reactionId,
              comment_text: null,
              parent_comment_id: null
            }
          }
          this.postCommentReaction(submitCommentPayload, reactionId, this.parentCommentId!)
        },

        submitCommentReaction(reactionId: ReactionId, commentId: number, parentCommentId?: number) {
          if (!this.isUserLoggedIn()) {
            window!.event!.stopImmediatePropagation();
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
            return
          }

          let parentId = null
          if (!isNull(parentCommentId!)) {
            parentId = parentCommentId
          }

          let submitCommentPayload: InsertCommentReactionPayload = {
            user_guid: this.userGuid,
            asset_id: this.assetId,
            asset_type_id: this.assetType,
            comment_id: commentId,
            reaction_id: reactionId,
            comment_text: null,
            parent_comment_id: parentId!
          }

          this.postCommentReaction(submitCommentPayload, reactionId, parentCommentId);
        },

        setCommentsReply(submitCommentPayload: InsertCommentReactionPayload, comments: CommentsResponse, parentCommentId: number) {
          let commentIdToCompare = submitCommentPayload.comment_id

          if (!isNull(parentCommentId)) {
            commentIdToCompare = parentCommentId
          }

          for (let comment of this.assetComments) {
            if (comment.comment_id === commentIdToCompare) {
              let responseComment: Comments = comments.data[0].asset_reaction_json.comments[0]
              // if a comment reply was posted then append it to existing list
              if (submitCommentPayload.reaction_id === 4) {
                if (isNull(comment.latest_reply)) {
                  comment.latest_reply = [];
                }
                comment.latest_reply = comment.latest_reply.concat(responseComment.latest_reply)
              } else {
                // if reaction was posted
                comment.reactions_count = responseComment.reactions_count
                comment.total_replies = responseComment.total_replies
                comment.user_reaction = responseComment.user_reaction
                if ((!isNull(comment.latest_reply) && (comment.latest_reply.length > 0)) && (!isNull(responseComment.latest_reply) && (responseComment.latest_reply.length > 0))) {
                  for (let commentReply of comment.latest_reply) {
                    if (commentReply.comment_id === responseComment.latest_reply[0].comment_id) {
                      commentReply.reactions_count = responseComment.latest_reply[0].reactions_count
                      commentReply.total_replies = responseComment.latest_reply[0].total_replies
                      commentReply.user_reaction = responseComment.latest_reply[0].user_reaction
                    }
                  }
                }
              }
            }
          }
        },

        async postCommentReaction(submitCommentPayload: InsertCommentReactionPayload, reactionId: ReactionId, parentCommentId?: number) {
          if (!isNull(submitCommentPayload) && isNull(submitCommentPayload.user_guid)) {
            return
          }
          let postCommentResponse: PostCommentReactionResponse = await insertCommentReaction(submitCommentPayload)
          // clear replyTo variable if used (it's a sanitary check)
          this.clearReplyTo()

          if (!isNull(postCommentResponse) && !isNull(postCommentResponse.content)) {
            if (isNaN(submitCommentPayload.parent_comment_id!) || submitCommentPayload.parent_comment_id === null) {
              this.setComments(postCommentResponse.content, reactionId);
            } else {
              this.setCommentsReply(submitCommentPayload, postCommentResponse.content, parentCommentId!);
            }
            this.commentText = '';
            this.parentCommentId = null;
            // Close all GIF Trays
            document.querySelectorAll(".wrapper-gif").forEach((el: any) => {
              el.classList.remove("active");
            });
          } else {
            console.log('Comment could not be posted');
          }
        },

        onCancelClicked() {
          this.clearEditing()
        },

        onEditClicked(comment: Comments, parentComment?: Comments) {
          if (isNull(comment)) {
            return
          }

          this.commentToEdit = comment
          if (!isNull(parentComment!)) {
            this.parentCommentOfEdit = parentComment
          }

          this.isEditing = true
          let commentField = $('#' + this.inputCommentId)
          commentField.focus()
          this.commentText = comment.comment_text

          $('#' + this.cancelBtnId).addClass('active')
        },

        async editComment() {
          let commentToEdit = $('#' + this.inputCommentId).val() as string

          if (isNull(commentToEdit!) || containsOnlyWhiteSpace(commentToEdit)) {
            return
          }

          this.commentToEdit!.comment_text = commentToEdit

          let editCommentPayload: EditCommentPayload = {
            user_guid: this.userGuid,
            comment_id: this.commentToEdit!.comment_id.toString(),
            option: EditCommentEnum.EDIT,
            source: 'F',
            comment_text: this.commentToEdit!.comment_text
          }

          if (isNullString(editCommentPayload.comment_text) || containsOnlyWhiteSpace(editCommentPayload.comment_text)) {
            return
          }

          await editComment(editCommentPayload)

          if (!isNull(this.assetComments) && this.assetComments.length > 0) {
            if (!isNull(this.parentCommentOfEdit!)) {
              // edit a reply comment
              for (let assetComment of this.assetComments) {
                if (assetComment.comment_id === this.parentCommentOfEdit!.comment_id) {
                  if (!isNull(assetComment.latest_reply) && assetComment.latest_reply.length > 0) {
                    for (let assetCommentReply of assetComment.latest_reply) {
                      if (assetCommentReply.comment_id === this.commentToEdit!.comment_id) {
                        assetCommentReply.comment_text = this.commentToEdit!.comment_text
                        break
                      }
                    }
                  }
                }
              }
            } else {
              // edit main comment
              for (let assetComment of this.assetComments) {
                if (assetComment.comment_id === this.commentToEdit!.comment_id) {
                  assetComment.comment_text = this.commentToEdit!.comment_text
                  break
                }
              }
            }
          } else {
            // nothing to edit
          }

          // editing complete so clear editing tasks
          this.clearEditing()
        },

        async deleteComment(comment: Comments, parentComment?: Comments) {
          let editCommentPayload: EditCommentPayload = {
            user_guid: this.userGuid,
            comment_id: comment.comment_id.toString(),
            option: EditCommentEnum.DELETE,
            source: 'F',
            comment_text: ''
          }

          await editComment(editCommentPayload)

          if (!isNull(comment) && !isNull(this.assetComments) && this.assetComments.length > 0) {
            if (!isNull(parentComment!)) {
              // delete a reply comment
              for (let assetComment of this.assetComments) {
                if (assetComment.comment_id === parentComment!.comment_id) {
                  if (!isNull(assetComment.latest_reply) && assetComment.latest_reply.length > 0) {
                    assetComment.latest_reply = this.arrayRemove((assetComment.latest_reply) as Comments[], comment)
                    assetComment.total_replies -= 1
                  }
                }
              }
            } else {
              // delete main comment
              this.assetComments = this.arrayRemove(this.assetComments, comment)
              this.commentsCount -= 1
            }
          } else {
            // nothing to delete
          }
        },

        arrayRemove(arr: Comments[], value: Comments) {
          return arr.filter((ele: Comments) => {
            return ele.comment_id != value.comment_id;
          });
        },

        showHideLikesComment(commentId?: number) {
          this.onReactionTabClick(0);
          let reactionsTabContainer = $('.reaction-tab-' + this.assetId);
          if (reactionsTabContainer.hasClass('show')) {
            reactionsTabContainer.removeClass('show');
          } else {
            reactionsTabContainer.addClass('show');
            this.getReactionPopupData(commentId);
          }
        },

        goToDetail() {
          if (this.isDetail === 0) {
            if (!isNull(this.shareObj) && !isNull(this.shareObj.url)) {
              location.href = this.shareObj.url
            }
          }
          return
        },

        onReactionTabClick(val: number) {
          $('.reaction-tab>li.active').removeClass('active');
          $('.rt-' + val).addClass('active');

          switch (val) {
            case 0:
              this.assetReactions.activelyShownUsers = this.assetReactions.allReactionUsers;
              break;
            case 1:
              this.assetReactions.activelyShownUsers = this.assetReactions.heartReactionUsers;
              break;
            case 2:
              this.assetReactions.activelyShownUsers = this.assetReactions.heartBreakReactionUsers;
              break;
            case 3:
              this.assetReactions.activelyShownUsers = this.assetReactions.likeReactionUsers;
              break;
            default:
              break;
          }
        },

        showReplyLoadMore(comment: Comments) {
          if (this.isNotificationDetail === false) {
            if (this.isDetail === 1) {
              if (!isNull(comment.latest_reply) && comment.latest_reply.length < comment.total_replies) {
                return true
              }
              return false
            } else {
              // no pagination for homepage
              return false
            }
          } else if (this.isNotificationDetail === true) {
            // if it's loaded inside notifications then load more is disabled
            return false
          }
        },

        openGifList(e: any) {
          if (this.mIData != []) {
            if (!this.isUserLoggedIn()) {
              window!.event!.stopImmediatePropagation();
              triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
              return
            }

            // Toggle the tray
            let parentMostEle = $(e.currentTarget).parents(".article-comment");
            let gifWrapper = $(parentMostEle).find(".wrapper-gif");
            // Empty the trays
            /*$(gifWrapper).find(".my-gif .gif-list").empty();
            $(gifWrapper).find(".mi-gif .gif-list").empty();*/
            if ($(gifWrapper).hasClass("active")) {
              $(gifWrapper).removeClass("active");
              if (!isNull(classContext.gallerySwiper) && !isNull(classContext.gallerySwiper.autoplay!)) {
                classContext.gallerySwiper.autoplay!.start()
                classContext.isGifTrayActive = false;
              }
              $(parentMostEle).find(".tab-container.mi-gif").trigger("click");
            } else {
              $(gifWrapper).addClass("active");
              if (!isNull(classContext.gallerySwiper) && !isNull(classContext.gallerySwiper.autoplay!)) {
                classContext.gallerySwiper.autoplay!.stop()
                classContext.isGifTrayActive = true;
              }
              let tabContainer = document.querySelectorAll('.gif-wrapper');
              tabContainer.forEach((el: any) => {
                el.querySelectorAll('.tab-container').forEach((elx: any) => {
                  new PerfectScrollbar(elx);
                });
              });
            }
          }
        },

        toggleGifs(e: any) {
          let currentTarget = e.currentTarget;
          let parentEle = $(currentTarget).parents(".gif-wrapper")
          let miGifTray = $(parentEle).find(".tab-container.mi-gif");
          let myGifTray = $(parentEle).find(".tab-container.my-gif");
          if (!currentTarget.classList.contains("active") && currentTarget.classList.contains("mi_gif")) {
            currentTarget.classList.add("active");
            $(currentTarget).siblings("li").removeClass("active");
            $(miGifTray).css({ "display": "block" });
            $(myGifTray).css({ "display": "none" });
          } else if (!currentTarget.classList.contains("active") && currentTarget.classList.contains("my_gif")) {
            currentTarget.classList.add("active");
            $(currentTarget).siblings("li").removeClass("active");
            $(myGifTray).css({ "display": "block" });
            $(miGifTray).css({ "display": "none" });
          }
        },

        getNumberInK(num: number): string {
          return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString()
        },

        getPaginationPages(totalItems: number, itemsPerPage: number): number {
          return parseInt((totalItems / itemsPerPage).toFixed())
        },

        getDefaultImg() {
          return location.origin + '/static-assets/images/cssimages/default-avatar.png'
        },

        onFocus() {
          classContext.commentTextInFocus();
        },

        onBlur() {
          classContext.commentTextOutOfFocus();
        },

        onMouseOver() {
          classContext.commentSectionMouseOver();
        },

        onMouseOut() {
          classContext.commentSectionMouseOut();
        }
      },
      async mounted() {
        this.initializeWidget();
      },
    });
  }

}