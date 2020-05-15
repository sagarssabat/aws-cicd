import * as _ from 'lodash'
import { Controller } from 'stimulus'
import Swiper from 'swiper'
import Vue from 'vue'
import { ApplicationObj } from '../../main'

/* tslint:disable */



class WidgetLayout22 extends Controller {
  connect() {
    this.initAuction();
  }

  initAuction() {
    let customTeamNames = [{
      "id": 1108,
      "name": "Chennai Super Kings",
      "custom_name": "Chennai"
    },
    {
      "id": 1109,
      "name": "Delhi Capitals",
      "custom_name": "Delhi"
    },
    {
      "id": 1107,
      "name": "Kings XI Punjab",
      "custom_name": "Punjab"
    },
    {
      "id": 1106,
      "name": "Kolkata Knight Riders",
      "custom_name": "Kolkata"
    },
    {
      "id": 1111,
      "name": "Dummy Team",
      "custom_name": "Dummy Team"
    },
    {
      "id": 1110,
      "name": "Rajasthan Royals",
      "custom_name": "Rajasthan"
    },
    {
      "id": 1105,
      "name": "Royal Challengers Bangalore",
      "custom_name": "Bangalore"
    },
    {
      "id": 1379,
      "name": "Sunrisers Hyderabad",
      "custom_name": "Hyderabad"
    },
    {
      "id": 1112,
      "name": "Deccan Chargers",
      "custom_name": "Deccan"
    },
    {
      "id": 1244,
      "name": "Pune Warriors India",
      "custom_name": "Pune Warriors"
    },
    {
      "id": 1508,
      "name": "Rising Pune Supergiant",
      "custom_name": "Pune"
    },
    {
      "id": 1243,
      "name": "Kochi Tuskers Kerala",
      "custom_name": "Kochi"
    },
    {
      "id": 1509,
      "name": "Gujarat Lions",
      "custom_name": "Gujarat"
    }
    ];

    let initialVueData: any = {
      isMounted: false,
      activeTab: 'playersTab', // playersTab or updatesTab
      teamsArray: [],
      feedData: {},
      allPlayers: {},
      teamData: {},
      purseAmount: '0',
      totalSpent: '0',
      remainingSpent: '0',
      rightToMatchRemaining: 0,
      playersBought: [],
      playersRTM: [],
      playersRetained: [],
      playersTraded: [],
      currentPlayerInBidArray: [],
      currentPlayerInBid: {},
      customTeamNames: customTeamNames,
      selectedTeamId: '',
      getAllFeedsInterval: null,
      showRTM: false,
      lastLoadMoreUrl: '',
      firstSwiperInit: true,
      isRTM: true,
      totalBatsmen: 0,
      totalBowler: 0,
      totalAllRounder: 0,
      totalWicketKeeper: 0,
      avgTeamAge: 0,
      seriesId: 3130 // default last years id
    }

    let auctionApp = new Vue({
      el: '#app-auction',
      data: initialVueData,
      methods: {
        initialAppState: function () {
          this.teamData = {}
          this.purseAmount = '0'
          this.totalSpent = '0'
          this.remainingSpent = '0'
          this.rightToMatchRemaining = 0
          this.playersBought = []
          this.playersRTM = []
          this.playersRetained = []
          this.currentPlayerInBidArray = []
          this.currentPlayerInBid = {}
        },

        initAuctionSwiper: function () {
          let mySwiper = new Swiper('.team-slider .swiper-container', {
            slidesPerView: 8,
            spaceBetween: 10,
            navigation: {
              nextEl: '.team-slider .nav-right',
              prevEl: '.team-slider .nav-left',
            },
            breakpoints: {
              480: {
                slidesPerView: 3
              },
              767: {
                slidesPerView: 4
              },
            },
          });
          $("#swiperId-1111").trigger("click");
        },
        moneyConverter: function (amt: number) {
          if (this.isNull(amt) || amt === 0) {
            return '-';
          } else if (amt < 100) {
            return amt + ' L';
          } else if (amt >= 100) {
            amt = amt / 100;
            return amt + ' cr';
          }
        },
        onSliderItemClicked: function (teamId: number) {
          $('.team-item').removeClass('active');
          $('#swiperId-' + teamId).addClass('active');
          this.selectedTeamId = teamId;
          this.initialAppState();
          this.initApp();
        },
        getFeed: function () {
          return new Promise((resolve, reject) => {
            $.get(`https://www.dummyTeam.com/sifeeds/repo/cricket/live/json/1_${this.seriesId}_auctions.json`)
              .done(function (data) {
                resolve(data);
              }).fail(err => {
                console.error('Error getting feed: ', err);
              });
          });
        },
        // this function only receives current player in the bid
        getAllPlayers: function () {
          return new Promise((resolve, reject) => {
            $.get(`https://www.dummyTeam.com/sifeeds/repo/cricket/live/json/1_${this.seriesId}_auctions_current_bid.json`)
              .done(function (data) {
                resolve(data);
              }).fail(err => {
                console.error('Error getting feed: ', err);
              });
          });
        },
        // Initialize specific team data which is filtered
        initTeamData: function () {
          let teamDataArray = _.filter(this.feedData.teams, {
            team_id: this.selectedTeamId
          });

          if (!this.isNull(teamDataArray) && teamDataArray.length > 0) {
            this.teamData = teamDataArray[0];
          }
        },

        // Pass a list of players of a particular team and return list of players who are newly bought by the team (returns an array)
        getPlayersBought: function (playerList: any[]) {
          return _.filter(playerList, {
            is_sold: true
          })
        },

        // Pass a list of players of a particular team and return list of players who have been retained using RTM by the team (returns an array)
        getPlayersRTM: function (playerList: any[]) {
          return _.filter(playerList, {
            is_rtm: true
          })
        },

        // Pass a list of players of a particular team and return list of players who have been retained by the team (returns an array)
        getPlayersRetained: function (playerList: any[]) {
          return _.filter(playerList, {
            is_retained: true
          })
        },

        // Pass a list of players of a particular team and return list of players who have been traded by the team (returns an array)
        getPlayersTraded: function (playerList: any[]) {
          return _.filter(playerList, {
            is_traded: true
          })
        },

        // Pass a list of players and return a single player who is in bid (returns an array)
        getCurrentPlayerInBid: function (playerList: any[]) {
          return _.filter(playerList, {
            is_current_bid: true
          })
        },

        getTotalBatsmen(playerList: any[]) {
          let count = 0
          let players = _.filter(playerList, { skill: 'Batsman' })
          if (!this.isNull(players) && players.length > 0) {
            count = players.length
          }
          return count
        },

        getTotalWicketKeeper(playerList: any[]) {
          let count = 0
          let players = _.filter(playerList, { skill: 'Wicket-Keeper' })
          if (!this.isNull(players) && players.length > 0) {
            count = players.length
          }
          return count
        },

        getTotalBowler(playerList: any[]) {
          let count = 0
          let players = _.filter(playerList, { skill: 'Bowler' })
          if (!this.isNull(players) && players.length > 0) {
            count = players.length
          }
          return count
        },

        getTotalAllRounder(playerList: any[]) {
          let count = 0
          let players = _.filter(playerList, { skill: 'All-Rounder' })
          if (!this.isNull(players) && players.length > 0) {
            count = players.length
          }
          return count
        },

        getAverageAge(playerList: any[]) {
          let sumOfAge = playerList.reduce((a, b) => {
            return parseInt(a.age) + parseInt(b.age);
          });
          return sumOfAge / playerList.length;
        },

        // Returns an array consisting of team name and teamId
        getTeams: function () {
          let teamArray = [];
          if (!this.isNull(this.feedData.teams) && this.feedData.teams.length > 0) {
            for (let team of this.feedData.teams) {
              // since yahoo does not have right to display ipl team names, we replace actual names with factual names
              for (let customTeam of this.customTeamNames) {
                if (team.team_id == customTeam.id) {
                  let teamObj = {
                    team_name: customTeam.custom_name,
                    team_id: team.team_id
                  }
                  teamArray.push(teamObj);
                }
              }
            }
          }
          return teamArray;
        },

        initGetFeedsTimer: function () {
          let context = this;
          if (this.getAllFeedsInterval == null) {
            this.getAllFeedsInterval = setInterval(function () {
              context.getAllFeeds();
            }, 5000);
          }
        },

        getAllFeeds: async function () {
          // fetch teamwise feed
          this.feedData = await this.getFeed();

          // fetch all players list
          this.allPlayers = await this.getAllPlayers();

          // separate team names for filter
          this.teamsArray = this.getTeams();

          this.initApp();
          this.initGetFeedsTimer();
        },

        initApp: function () {
          // Getting team data for a specific team
          if (!this.isNull(this.teamsArray) && this.teamsArray.length > 0) {
            if (this.isNull(this.selectedTeamId)) {
              this.selectedTeamId = this.teamsArray[0].team_id;
              this.initAuctionSwiper();
              if (this.firstSwiperInit === true) {
                // mySwiper.slideTo(0, 1, true);
                this.firstSwiperInit = false;
              }
              $('.team-item').removeClass('active');
              $('#swiperId-' + this.selectedTeamId).addClass('active');
            }
            this.initTeamData();
          }

          this.purseAmount = this.moneyConverter(this.teamData.team_budget);
          this.totalSpent = this.moneyConverter(this.teamData.total_team_spent);
          this.remainingSpent = this.moneyConverter(this.teamData.total_team_remaining);
          this.rightToMatchRemaining = this.teamData.rtms_remaining;


          this.playersBought = this.getPlayersBought(this.teamData.players);

          this.playersRTM = this.getPlayersRTM(this.teamData.players);

          this.playersRetained = this.getPlayersRetained(this.teamData.players);

          this.playersTraded = this.getPlayersTraded(this.teamData.players);

          this.totalAllRounder = this.getTotalAllRounder(this.teamData.players);
          this.totalBatsmen = this.getTotalBatsmen(this.teamData.players);
          this.totalBowler = this.getTotalBowler(this.teamData.players);
          this.totalWicketKeeper = this.getTotalWicketKeeper(this.teamData.players);

          this.avgTeamAge = this.getAverageAge(this.teamData.players);

          this.currentPlayerInBidArray = this.getCurrentPlayerInBid(this.allPlayers.all_players);

          if (!this.isNull(this.currentPlayerInBidArray) && this.currentPlayerInBidArray.length > 0) {
            this.currentPlayerInBid = this.currentPlayerInBidArray[0];
          } else {
            this.currentPlayerInBid = {};
          }
        },
        getDataAttributes() {
          let element = document.getElementById("app-auction")!.getAttribute("data-rtm")!;
          if (element.trim() == "true") {
            this.isRTM = true;
          } else {
            this.isRTM = false;
          }

          let seriesId = document.getElementById("app-auction")!.getAttribute("data-series-id");
          if (!this.isNull(seriesId)) {
            this.seriesId = seriesId;
          }
        },
        getTeamName: function (teamId: any) {
          let teamName = ''
          let teamArray = _.filter(customTeamNames, {
            id: teamId
          })
          if (!this.isNull(teamArray) && teamArray.length > 0) {
            teamName = teamArray[0].custom_name
          }
          return teamName
        }
      },
      computed: {
        isNull() {
          return function (value: any) {
            return (value == undefined || value == null || value == "");
          }
        },
        isEmpty() {
          return function (obj: any) {
            return _.isEmpty(obj);
          }
        }
      },
      mounted() {
        this.isMounted = true;
        this.getDataAttributes();
        this.getAllFeeds();
        this.initAuctionSwiper();
      }
    });
  }
}

export default () => ApplicationObj.register("si-custom--widget-layout-22", WidgetLayout22);
