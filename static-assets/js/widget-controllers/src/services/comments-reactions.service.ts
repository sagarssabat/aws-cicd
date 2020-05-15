import {
  AssetDataQueryParams,
  AssetDataResponse,
  CommentsQueryParams,
  CommentsRepliesQueryParams,
  CommentsRepliesResponse,
  CommentsResponse,
  EditCommentPayload,
  EditCommentResponse,
  InsertCommentReactionPayload,
  MarkNotificationReadParams,
  NotificationDetailsQueryParams,
  NotificationQueryParams,
  NotificationResponse,
  PostCommentReactionResponse
  } from '../interfaces/comments-reactions'
import { getJsonData, postJsonData } from '../util'


export async function getAssetComments(queryParams: CommentsQueryParams): Promise<CommentsResponse> {
  return getJsonData<CommentsResponse>("/api/getcommentsdata", queryParams)
}

export async function getCommentsReplies(queryParams: CommentsRepliesQueryParams): Promise<CommentsRepliesResponse> {
  return getJsonData<CommentsRepliesResponse>("/api/getreplydata", queryParams)
}

export async function insertCommentReaction(commentReactionPayload: InsertCommentReactionPayload) {
  return postJsonData<PostCommentReactionResponse>("/api/insertcomment", commentReactionPayload);
}

export async function getAssetData(queryParams: AssetDataQueryParams): Promise<AssetDataResponse> {
  return getJsonData<AssetDataResponse>("/api/getassetdata", queryParams)
}

export async function editComment(editComment: EditCommentPayload): Promise<EditCommentResponse> {
  return postJsonData<EditCommentResponse>("/api/deletecomment", editComment)
}

export async function getNotifications(queryParams: NotificationQueryParams): Promise<NotificationResponse> {
  return getJsonData<NotificationResponse>("/api/getnotificationsdata", queryParams)
}

export async function markNotificationAsRead(queryParams: MarkNotificationReadParams) {
  getJsonData("/api/readcomment", queryParams)
}

export async function getNotificationDetails(queryParams: NotificationDetailsQueryParams): Promise<CommentsResponse> {
  return getJsonData<CommentsResponse>("/api/getnotificationdetail", queryParams)
}