import * as moment from 'moment'
import VeeValidate from 'vee-validate'
import Vue from 'vue'
import {
  FanZoneApiResponse,
  FanZoneApiSubmitResponse,
  GetPollDetailQueryParams,
  PlayerType,
  PollData,
  PollDescriptionParsed,
  PollOption,
  PollOptionParsed,
  SubmitPollOption,
  SumbitPollRequest,
  VueData
  } from '../../interfaces/fan-zone-api'
import { URC_Cookie } from '../../models/social-api-model'
import { getFanZonePollDetails, sumbitFanPollDetails } from '../../services/fanzone.service'
import {
  getCookieJSON,
  getQueryStringValue,
  isNull,
  isNullString,
  setCookie,
  triggerEventByCtrlName
  } from '../../util'
import Constants from '../../utils/constants'

Vue.use(VeeValidate);

export default function (Node: HTMLElement) {
  let dataMap: Map<string, PollData> = new Map<string, PollData>()

  let runnerUps: PollOption[] = []

  let winner: PollOption = {
    poll_option_id: '',
    option: '',
    option_order: '',
    response_count: '',
    poll_percentage: 0,
    user_vote: ''
  }

  let pollDescParsed: PollDescriptionParsed = {
    optionName: '',
    hid: '',
    homeTeam: '',
    homeShort: '',
    aid: '',
    awayTeam: '',
    awayShort: '',
    start_date: '',
    end_date: '',
    pollId: ''
  }

  let pollData: PollData = {
    pollid: "",
    alias: "",
    poll_desc: "",
    poll_desc_parsed: pollDescParsed,
    poll_type: "",
    showinweb: "",
    showinmobile: "",
    showinapp: "",
    image_path: "",
    start_date: "",
    end_date: "",
    image_file_name: "",
    poll_option: [],
    poll_response: [],
    total_response: "",
  }

  let initialData: VueData = {
    userGuid: "",
    matchPollId: "",
    playerCards: [],
    matchLists: [],
    dataMap,
    pollData,
    isDisplay: 'inline-block',
    videoUrl: "",
    isAutoPlay: "",
    isPollEnded: false,
    isMobile: false,
    winner,
    runnerUps
  }

  return new Vue({
    el: `#${Node.id}`,
    data: initialData,
    methods: {
      setUserGuid() {
        let userGuid = getQueryStringValue('user_guid')
        if (!isNull(userGuid!)) {
          this.userGuid = userGuid!
        } else {
          let userCookie = getCookieJSON<URC_Cookie>('_URC');
          if (userCookie) this.userGuid = userCookie!.user_guid;
        }

        let webview = getQueryStringValue('webview')
        if (!isNull(webview!) && webview == 'true') {
          this.isMobile = true
          $(document.body).addClass('webview')
        }
      },
      isUserLoggedIn() {
        return !isNullString(this.userGuid) ? true : false
      },
      getUserPollDetails: async function () {
        this.matchLists = []
        let queryParams: GetPollDetailQueryParams = {
          spgnnum: 1,
          sitem: 30,
          user_guid: this.userGuid
        }
        let userPollDetails: FanZoneApiResponse = await getFanZonePollDetails(queryParams)
        if (!isNull(userPollDetails) && !isNull(userPollDetails.data) && userPollDetails.data.length > 0) {
          for (let pollData of userPollDetails.data) {
            pollData.poll_desc_parsed = JSON.parse(pollData.poll_desc)
            pollData.poll_desc_parsed!.pollId = pollData.pollid
            if (!isNull(pollData.poll_option) && pollData.poll_option.length > 0) {
              for (let polloption of pollData.poll_option) {
                polloption.optionParsed = JSON.parse(polloption.option)
              }
            }
            this.dataMap.set(pollData.pollid, pollData)
            this.matchLists.push(pollData.poll_desc_parsed!)
          }
          this.matchPollId = userPollDetails.data[0].pollid
          this.setViewData()
        }
        this.pollingStatus()
      },
      pollingStatus() {
        let pollData = this.pollData!
        let startDateUTC = new Date(pollData.poll_desc_parsed!.start_date)
        let endDateUTC = new Date(pollData.poll_desc_parsed!.end_date)
        let currentUTC = new Date();
        if (!(currentUTC > startDateUTC && currentUTC < endDateUTC)) {
          this.isPollEnded = true
          this.setPollWinnerData()
        } else {
          this.isPollEnded = false
        }
      },
      setPollWinnerData() {
        let pollData = this.pollData!
        let max = pollData.poll_option.reduce(function (prev, current) {
          return (prev.response_count > current.response_count) ? prev : current
        });

        this.winner = max
        if (!isNull(pollData) && !isNull(pollData.poll_option) && pollData.poll_option.length > 0) {
          this.runnerUps = []
          for (let pollOption of pollData.poll_option) {
            if (pollOption.poll_option_id !== max.poll_option_id) {
              this.runnerUps.push(pollOption)
            }
          }
        }
      },
      setViewData() {
        let pollData = this.dataMap.get(this.matchPollId)
        if (!isNull(pollData!)) {
          this.pollData = pollData!;
          this.pollingStatus()
          if (!isNull(this.pollData.poll_desc_parsed!) && !isNull(this.pollData.poll_desc_parsed!.end_date)) {
            this.pollData.poll_desc_parsed!.end_date = moment(this.pollData.poll_desc_parsed!.end_date).format('MMMM DD, YYYY hh:mm a')
          }
        }
      },
      calcPercentage(responseCount: string, totalCount: string) {
        let votePercentage = "0%"
        let playerCount = parseInt(responseCount)
        let totalPlayerCount = parseInt(totalCount)
        if (!isNaN(playerCount) && !isNaN(totalPlayerCount)) {
          votePercentage = Math.round((playerCount / totalPlayerCount) * 100).toString() + '%';
        }
        return votePercentage
      },
      submitVote: async function (playerDetail: PollOption) {
        let isLoggedIn = this.isUserLoggedIn()
        if (!isLoggedIn && this.isMobile === false) {
          window!.event!.stopImmediatePropagation();
          triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
          return
        } else if (!isLoggedIn && this.isMobile === true) {
          $('#fpotm-login').addClass('show');
          $(document.body).addClass('no-scroll');
          return
        }

        let submitPollOptionArray: SubmitPollOption[] = []
        let submitPollOption: SubmitPollOption = {
          option_id: playerDetail.poll_option_id
        }
        submitPollOptionArray.push(submitPollOption)
        let payLoad: SumbitPollRequest = {
          data: {
            poll_id: this.matchPollId,
            polloption: submitPollOptionArray,
            user_guid: this.userGuid
          }
        };
        let responseData: FanZoneApiSubmitResponse = await sumbitFanPollDetails(payLoad);
        if (responseData.status == 200) {
          let pollData = this.pollData!
          for (let player of pollData.poll_option) {
            if (player.poll_option_id === playerDetail.poll_option_id) {
              player.user_vote = '1';
            }
          }
          this.getUserPollDetails()
          if (!isNull(responseData.content.data.gift_id) && responseData.content.data.gift_id != "0") {
            setCookie(Constants.COOKIE_GRATIFICATION_GIFT, responseData.content.data.gift_name)
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-gratification-modal");
          }
        }
      },
      isDisabled: function (userVoteFlag: string) {
        if (this.hasVoted) {
          this.isDisplay = 'none'
          return userVoteFlag == "0" ? true : false
        }
      },
      getAllRounderStats(pollOption: PollOption) {
        let returnStr: string = ''

        if (!isNull(pollOption.optionParsed!.runs)) {
          returnStr += pollOption.optionParsed!.runs + ' (' + pollOption.optionParsed!.balls + ')'
        }

        if (!isNull(pollOption.optionParsed!.wickets)) {
          if (!isNull(returnStr)) {
            returnStr += ' & '
          }
          returnStr += pollOption.optionParsed!.wickets + '/' + pollOption.optionParsed!.runsGiven
        }
        return returnStr
      }

    },
    mounted() {
      this.setUserGuid()
      this.getUserPollDetails()
    },
    computed: {
      hasVoted: function () {
        let pollData: PollData = this.pollData!
        return pollData.poll_option.some(opt => opt.user_vote == "1");
      },
      sortPollOption: function () {
        let sortedArray: PollOption[] = [];
        let pollData: PollData = this.pollData!
        if (!isNull(this.pollData) && !isNull(pollData.poll_option)) {
          sortedArray = [...pollData.poll_option].sort(function (prev, current) {
            return (prev.response_count > current.response_count) ? -1 : 1
          })
        }
        return sortedArray;
      }
    }
  });
}