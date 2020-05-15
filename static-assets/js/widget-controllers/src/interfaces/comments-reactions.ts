import PerfectScrollbar from 'perfect-scrollbar'
import { SocialShareObject } from '../interfaces/social-share'
export interface Comments {
  user_guid: string,
  comment_id: number,
  comment_text: string,
  latest_reply: CommentsReply[],
  total_replies: number,
  user_full_name: string,
  reactions_count: number,
  profile_picture_url: string,
  user_reaction: number,
  currentReplyItemPage?: number, // current comment page in pagination to be called
  totalReplyItemPages?: number // total number of pages for pagination of comments
  moreCommentsReplyRemainingToLoad?: boolean // to show loadmore button
  is_edit_delete_allowed?: number
}

export interface CommentsReply {
  user_guid: string,
  comment_id: number,
  comment_text: string,
  total_replies: number,
  user_full_name: string,
  reactions_count: number,
  profile_picture_url: string,
  user_reaction: number,
  is_edit_delete_allowed?: number
}

export interface AssetReactions {
  asset_id: number,
  comments: Comments[],
  asset_type_id: number,
  user_reaction: number,
  comments_count: number,
  reactions_count: number,
  title_alias?: string
}

export interface AssetReactionsJson {
  asset_reaction_json: AssetReactions
}

export interface CommentsResponse {
  data: AssetReactionsJson[]
}

export interface CommentsQueryParams {
  user_guid: string,
  asset_id: number | string,
  asset_type_id: number | string,
  is_detail: number,
  page_number: number,
  item_number: number
}

export interface CommentsRepliesResponse {
  replies: CommentsReply[]
}

export interface CommentsRepliesQueryParams {
  user_guid: string,
  comment_id: number,
  page_number: number,
  item_number: number
}

export interface CommentBoxStyle {
  maxHeight: string,
  minHeight: string,
  position: string,
  // overflowY: string
}

export interface VueAppCommentsData {
  assetId: number,
  assetType: number,
  assetComments: Comments[],
  userReaction: number,
  reactionsCount: number,
  commentsCount: number,
  userGuid: string,
  isDetail: number,
  commentText: string,
  parentCommentId: number | null,
  assetReactions: VueAssetReactionData,
  commentItemsToLoad: number, // per page items required from db
  commentReplyItemsToLoad: number, // per page items required from db
  currentCommentItemPage: number, // current comment page in pagination to be called
  totalCommentItemPages: number, // total number of pages for pagination of comments
  moreCommentsRemainingToLoad: boolean, // to show loadmore button
  shareObj: SocialShareObject,
  styleObj: CommentBoxStyle,
  elementId: string,
  inputCommentId: string,
  styleObjUserReactions: CommentBoxStyle,
  commentToEdit?: Comments | null,
  parentCommentOfEdit?: Comments | null,
  isEditing: boolean,
  cancelBtnId: string,
  commentBodyId: string,
  popupReactionsUserListId: string,
  mainCommentScroller: PerfectScrollbar | string,
  reactionScroller: PerfectScrollbar | string,
  scrollContainer: HTMLElement | string,
  reactionScrollContainer: HTMLElement | string,
  isNotificationDetail: boolean,
  myData: object[] | undefined,
  mIData: object[] | undefined,
  myGifPresent: boolean
}

export interface VueAssetReactionData {
  heartReactionUsers: UserReaction[],
  heartBreakReactionUsers: UserReaction[],
  likeReactionUsers: UserReaction[],
  allReactionUsers: UserReaction[],
  activelyShownUsers: UserReaction[],
  allCount: number,
  heartCount: number,
  heartBreakCount: number,
  likeCount: number
}

export enum ReactionId { Heart = 1, BrokenHeart = 2, Like = 3, Comment = 4 }

export interface InsertCommentReactionPayload {
  user_guid: string,
  asset_id: number,
  asset_type_id: number,
  comment_id: number | null,
  reaction_id: ReactionId,
  comment_text: string | null,
  parent_comment_id: number | null,
  comment_type?: number | string
}

export interface PostCommentReactionResponse {
  content: CommentsResponse
}

export interface UserReaction {
  user_id: number,
  client_id: number,
  reaction_id: number,
  user_full_name: string,
  profile_picture_url: string
}

export interface UserReactionJson {
  user_reaction: UserReaction[]
}

export interface ReactionCount {
  count: number,
  reaction_id: number
}

export interface ReactionCountJson {
  reaction_count: ReactionCount[]
}

export interface AssetData {
  user_reaction_json: UserReactionJson,
  reaction_count_json: ReactionCountJson
}

export interface AssetDataResponse {
  data: AssetData[]
}

export interface AssetDataQueryParams {
  page_number: number,
  item_number: number,
  asset_id: number,
  asset_type_id: number,
  comment_id?: number
}

export interface VueCommentsInitialize {
  elementId: string,
  assetId: number,
  assetType: number,
  shareObj: SocialShareObject,
  commentsResponse: CommentsResponse,
  isNotificationDetail: boolean
}

export enum EditCommentEnum {
  EDIT = 'E',
  DELETE = 'D'
}

export interface EditCommentPayload {
  user_guid: string,
  comment_id: string,
  option: EditCommentEnum,
  source: string,
  comment_text: string
}

export interface EditCommentResponse {
  data: string
}

export interface NotificationData {
  user_id: number,
  client_id: number,
  comment_id: number,
  reply_date: string,
  reaction_id: number,
  reaction_date: string,
  user_full_name: string,
  is_custom_image: number,
  profile_picture_url: string,
  extra_text?: string
}

export interface NotificationUserDataArray {
  user_data: NotificationData[],
  notification_data?: NotificationData,
  notification_date_millis?: number,
  replies?: NotificationData[],
  reactions?: NotificationData[]
}

export enum NotificationUserDataKey {
  replies = 'replies',
  reactions = 'reactions'
}

export interface NotificationResponse {
  new: NotificationUserDataArray[]
  earlier: NotificationUserDataArray[]
}

export interface NotificationQueryParams {
  user_guid: string
}

export interface MarkNotificationReadParams {
  comment_id: string // can be single or comma (,) separated
}

export interface NotificationVueData {
  newNotifications: NotificationUserDataArray[],
  earlierNotifications: NotificationUserDataArray[],
  notificationCount: number
}

export interface NotificationDetailsQueryParams {
  user_guid: string,
  comment_id: number
}

export enum SortType {
  ASC = 'asc',
  DESC = 'desc'
}