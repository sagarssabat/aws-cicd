export function getCommentsReactionsTemplate(): string {
  return `<div class="waf-comment-container" @mouseover="onMouseOver" @mouseleave="onMouseOut" v-cloak>
  <div class="comment-head" v-if="!isNotificationDetail">
    <div class="head-wrapper">
      <div class="reaction-icon">
        <div class="most-reacted">
          <span class="react" v-bind:class="[userReaction == 1 ? 'icon-like-fill' : 'icon-like']"
            v-on:click="submitComment(1)"></span>
          <span class="react" v-bind:class="[userReaction == 2 ? 'icon-dislike-fill' : 'icon-dislike']"
            v-on:click="submitComment(2)"></span>
          <span class="react" v-bind:class="[userReaction == 3 ? 'icon-thumbs-up-fill' : 'icon-thumbs-up']"
            v-on:click="submitComment(3)"></span>
        </div>
        <div class="likes-comment">
          <span class="meta-likes" v-if="reactionsCount > 0"
            v-on:click="showHideLikesComment()">{{getNumberInK(reactionsCount)}}</span>
          <span class="meta-comment" v-if="commentsCount > 0"
            v-on:click="goToDetail"><em>{{getNumberInK(commentsCount)}}</em>
            comments</span>
        </div>
      </div>
      <div class="social social-links">
        <span class="share-icon">share</span>
        <ul>
          <li class="facebook">
            <a href="javascript:void(0);" v-on:click="facebookShare()" class="" target="_blank">
              <span>Share on Facebook</span>
            </a>
          </li>
          <li class="twitter">
            <a href="javascript:void(0);" v-on:click="twitterShare()" class="" target="_blank">
              <span>Share on Twitter</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="comment-body" :id="commentBodyId" :class="{ 'no-comments': assetComments && assetComments.length == 0 }"
    v-bind:style="styleObj">
    <div class="body-wrapper">
      <div class="comment-list">
        <div class="comment-item" v-for="comment in assetComments">
          <div class="comment-wrap">
            <div class="user-dp">
              <img v-bind:src="comment.profile_picture_url || getDefaultImg()"
                data-src="../static-assets/images/cssimages/default-avatar.png" alt="" class="lazy avtar">
            </div>
            <div class="user-post">
              <div class="name" :class="{ 'user-verified': comment.is_admin_user == 1 }">
                <span>{{comment.user_full_name}}</span>
              </div>
              <div class="post" v-if="comment.comment_type == 2 || comment.comment_type == 3">
                <img class="lazy post-gif-img" src="/static-assets/images/cssimages/gif-cardon/gif-default.jpg"
                  :data-src="comment.comment_text">
              </div>
              <div class="post" v-else>
                <p>{{comment.comment_text}}</p>
              </div>
              <div class="user-reply icon-reply" v-bind:class="['reply-icon-'+comment.comment_id]"
                v-on:click="replyTo(comment.comment_id)">
              </div>
              <div class="user-reaction">
                <span class="react" v-bind:class="[comment.user_reaction == 1 ? 'icon-like-fill' : 'icon-like']"
                  v-on:click="submitCommentReaction(1, comment.comment_id)"></span>
                <span class="react" v-bind:class="[comment.user_reaction == 2 ? 'icon-dislike-fill' : 'icon-dislike']"
                  v-on:click="submitCommentReaction(2, comment.comment_id)"></span>
                <span class="react"
                  v-bind:class="[comment.user_reaction == 3 ? 'icon-thumbs-up-fill' : 'icon-thumbs-up']"
                  v-on:click="submitCommentReaction(3, comment.comment_id)"></span>
                <span class="meta-likes" style="cursor: pointer;"
                  v-on:click="showHideLikesComment(comment.comment_id)">{{getNumberInK(comment.reactions_count)}}</span>
              </div>
            </div>
            <div class="user-post-option" v-if="comment.is_edit_delete_allowed == 1">
              <div class="icon-vert-menu">
                <div class="option-wrap" v-if="comment.comment_type">
                  <button class="icon-trash" v-on:click="deleteComment(comment)">delete</button>
                </div>
                <div class="option-wrap" v-else>
                  <button class="icon-edit" v-on:click="onEditClicked(comment)">edit</button>
                  <button class="icon-trash" v-on:click="deleteComment(comment)">delete</button>
                </div>
              </div>
            </div>
          </div>
          <div class="comment-thread">
            <div class="comment-item" v-for="reply in comment.latest_reply">
              <div class="comment-wrap">
                <div class="user-dp">
                  <img v-bind:src="reply.profile_picture_url || getDefaultImg()"
                    data-src="../static-assets/images/cssimages/default-avatar.png" alt="" class="lazy avtar">
                </div>
                <div class="user-post">
                  <div class="name" :class="{ 'user-verified': reply.is_admin_user == 1 }">
                    <span>{{reply.user_full_name}}</span>
                  </div>
                  <!-- <div class="post">
                    <p>{{reply.comment_text}}</p>
                  </div> -->
                  <div class="post" v-if="reply.comment_type == 2 || reply.comment_type == 3">
                    <img class="lazy post-gif-img" src="/static-assets/images/cssimages/gif-cardon/gif-default.jpg"
                      :data-src="reply.comment_text">
                  </div>
                  <div class="post" v-else>
                    <p>{{reply.comment_text}}</p>
                  </div>
                  <div class="user-reply icon-reply" v-bind:class="['reply-icon-'+reply.comment_id]"
                    v-on:click="replyTo(reply.comment_id, comment.comment_id)">
                  </div>
                  <div class="user-reaction">
                    <span class="react" v-bind:class="[reply.user_reaction == 1 ? 'icon-like-fill' : 'icon-like']"
                      v-on:click="submitCommentReaction(1, reply.comment_id, comment.comment_id)"></span>
                    <span class="react" v-bind:class="[reply.user_reaction == 2 ? 'icon-dislike-fill' : 'icon-dislike']"
                      v-on:click="submitCommentReaction(2, reply.comment_id, comment.comment_id)"></span>
                    <span class="react"
                      v-bind:class="[reply.user_reaction == 3 ? 'icon-thumbs-up-fill' : 'icon-thumbs-up']"
                      v-on:click="submitCommentReaction(3, reply.comment_id, comment.comment_id)"></span>
                    <span class="meta-likes" style="cursor: pointer;"
                      v-on:click="showHideLikesComment(reply.comment_id)">{{getNumberInK(reply.reactions_count)}}</span>
                  </div>
                </div>
                <div class="user-post-option" v-if="reply.is_edit_delete_allowed == 1">
                  <div class="icon-vert-menu">
                    <div class="option-wrap" v-if="reply.comment_type">
                      <button class="icon-trash" v-on:click="deleteComment(reply, comment)">delete</button>
                    </div>
                    <div class="option-wrap" v-else>
                      <button class="icon-edit" v-on:click="onEditClicked(reply, comment)">edit</button>
                      <button class="icon-trash" v-on:click="deleteComment(reply, comment)">delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button class="view-more" v-if="showReplyLoadMore(comment)" v-on:click="getCommentsReplies(comment)">View
              more
              replies</button>
          </div>
        </div>
        <button class="view-more" v-if="moreCommentsRemainingToLoad" v-on:click="getComments()">View more
          comments</button>
      </div>
    </div>
  </div>
  <div class="comment-footer">
    <div class="footer-wrapper">
      <form v-on:submit.prevent="submitComment(4)" class="user-comment">
        <div class="form-group">
          <button class="btn-cancel" :id="cancelBtnId" type="button" v-on:click="onCancelClicked()">cancel</button>
          <input type="text" class="form-control" v-model="commentText" :id="inputCommentId" @focus="onFocus"
            v-on:blur="onBlur" placeholder="Write a comment..." autocomplete="off" />
          <button class="btn-gif btn-gold" type="button" v-on:click="openGifList">Gif</button>
        </div>
      </form>
    </div>
  </div>
  <!-- GIF List Tray -->
  <div class="gif-wrapper wrapper-gif">
    <div class="gif-tabs">
      <ul class="tabs">
        <li class="my_gif" v-on:click="toggleGifs">My gif</li>
        <li class="mi_gif active" v-on:click="toggleGifs">MI Gif</li>
      </ul>
    </div>
    <div class="tab-container my-gif" style="display: none;">
      <div class="gif-list" v-if="myGifPresent">
        <div class="gif-item" v-for="item in myData">
          <div class="gif-img" :data-id="item.gallery_id" data-comment-type="2"
            v-on:click="submitComment(4, 2, item.url)">
            <img class="lazy" src="/static-assets/images/cssimages/gif-cardon/gif-default.jpg" :data-src="item.url"
              alt="">
          </div>
        </div>
      </div>
      <div class="nogif-wrap" v-else>
        <p class="text">Login to the Mobile App and create your own GIF now</p>
        <div class="icons">
          <a href="https://play.google.com/store/apps/details?id=com.dummyTeam&hl=en_US" target="_blank" class="icon-android"></a>
          <a href="https://apps.apple.com/in/app/Dummy-team-official-app/id1098173888" target="_blank" class="icon-apple"></a>
        </div>
      </div>
    </div>
    <div class="tab-container mi-gif">
      <div class="gif-list">
        <div class="gif-item" v-for="item in mIData">
          <div class="gif-img" :data-id="item.gallery_id" data-comment-type="3"
            v-on:click="submitComment(4, 3, item.url)">
            <img class="lazy" src="/static-assets/images/cssimages/gif-cardon/gif-default.jpg" :data-src="item.url"
              alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="modal modal-comment fade list" @mouseover="onFocus" @mouseleave="onBlur"
  v-bind:class="['reaction-tab-' + assetId]">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-head">
        <span class="icon-close" v-on:click="showHideLikesComment()"></span>
        <ul class="reaction-tab">
          <li class="active rt-0" v-on:click="onReactionTabClick(0)">All
            {{getNumberInK(assetReactions.allCount)}}</li>
          <li class="icon-like-fill rt-1" v-on:click="onReactionTabClick(1)">{{getNumberInK(assetReactions.heartCount)}}
          </li>
          <li class="icon-dislike-fill rt-2" v-on:click="onReactionTabClick(2)">
            {{getNumberInK(assetReactions.heartBreakCount)}}</li>
          <li class="icon-thumbs-up-fill rt-3" v-on:click="onReactionTabClick(3)">
            {{getNumberInK(assetReactions.likeCount)}}</li>
        </ul>
      </div>
      <div class="modal-body modal-body-selector" :id="popupReactionsUserListId" v-bind:style="styleObjUserReactions">
        <div class="user-list">
          <div class="user-item" v-for="reactionUser in assetReactions.activelyShownUsers">
            <div class="user-dp">
              <img class="avtar" v-bind:src="reactionUser.profile_picture_url || getDefaultImg()"
                data-src="/static-assets/images/cssimages/default-avatar.png" alt="">
            </div>
            <div class="user-name">
              <span>{{reactionUser.user_full_name}}</span>
            </div>
            <div class="user-reacted">
              <span class="icon-like-fill" v-if="reactionUser.reaction_id == 1"></span>
              <span class="icon-dislike-fill" v-if="reactionUser.reaction_id == 2"></span>
              <span class="icon-thumbs-up-fill" v-if="reactionUser.reaction_id == 3"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
}