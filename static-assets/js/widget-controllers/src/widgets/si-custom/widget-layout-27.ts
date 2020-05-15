import { Controller } from "stimulus";
import { ApplicationObj } from '../../main';
import Vue from 'vue'
import { AllTimeXIVueData, AllTimeXIVueMethods, AllTimeXIVueComputedProperties, PlayerData, SquadStats, PayloadPlayerData, PlayerInsertPayload, PlayerBySeasonRes, fetchUserTeamParams } from '../../interfaces/all-team.interface';

import { getCookieJSON, triggerEventByCtrlName } from '../../util';
import { URC_Cookie } from '../../models/social-api-model';
import { getPlayersBySeason, submitPlayerPayloadToInsert, getAllSeasonPlayer, getUserTeam, endPoints, getMIAllTimeXI } from '../../services/all-team-xi.service';
import { ShareType } from '../../interfaces/social-share';
import { SocialShareObject } from '../../interfaces/social-share';
import { ShareUtil } from '../../utils/share.util';
import { UserProfile } from '../../models/user.profile';

declare global {
  interface Window {
    gtag: any
  }
}

class AllTeamXI extends Controller {
  connect() {
    this.initVueComponent();
  }
  initVueComponent() {
    const context = this;
    new Vue<AllTimeXIVueData, AllTimeXIVueMethods, AllTimeXIVueComputedProperties>({
      el: '#allTeam',
      data: {
        squadList: [],
        selectedSquad: [],
        allowedSelectionCount: 11,
        season: 'all seasons',
        searchText: '',
        selectionStep: 0, // selection steps{ 0: edit, 1: pick player from list, 2: preview players}
        captainId: '',
        wicketKeeperId: '',
        focusedCaptainWKId: '',
        deletedPlayers: [],
        dragOverPlayerId: '',
        dragStartPlayerId: '',
        allowedOverseasPlayers: 4,
        endPoints,
        loadingStatus: 0,
        loggedIn: false,
        currentTab: 'create',
        userData: undefined,
        usersTeamName: 'My All-Time MI XI',
        playerDetailsSubmitted: false,
        playerDetailsSubmitError: '',
        playerDetailsSubmitSuccess: '',
        shareMenuToggle: false,
        mobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 992,
        payload: null,
        teamImgUrl: '',
        generatingImg: false,
        squadDetailAndStats: [],
        allSeasonPlayerList: [],
        allTimeMISquad: [],
        ifMITeamTabVisible: false,
        showSponserPopup: false,
        confirmAge: false,
      },
      computed: {
        ifValidXI() {
          return this.selectedSquad.filter(p => p && p.player_details).length === this.allowedSelectionCount
        },
        getPlayersLeft() {
          const validPlayers = this.selectedSquad.filter(p => p && p.player_details.hasOwnProperty('id'));
          return validPlayers.length + '/' + this.allowedSelectionCount;
        },
        getForeignPlayersLeft() {
          const overseas = this.selectedSquad.filter(player => player && player.player_details.nationality_id !== '4')
          return overseas.length + '/' + this.allowedOverseasPlayers;
        },
        getFilteredSquadList() {
          if (this.searchText) {
            return this.squadList.filter((s: PlayerData) => s.player_details.name.toLowerCase().includes(this.searchText.toLowerCase()));
          }
          return this.squadList;
        },
        getSquadStats() {
          const stat: SquadStats = {
            runs: 0,
            wickets: 0,
            fours: 0,
            sixes: 0,
            catches: 0,
          };
          if (this.squadDetailAndStats.length) {
            stat.runs = this.squadDetailAndStats.reduce((prevValue, currPlayer) => prevValue + currPlayer!.over_all_stats.batting.runs!, 0);
            stat.fours = this.squadDetailAndStats.reduce((prevValue, currPlayer) => prevValue + currPlayer!.over_all_stats.batting.fours!, 0);
            stat.sixes = this.squadDetailAndStats.reduce((prevValue, currPlayer) => prevValue + currPlayer!.over_all_stats.batting.sixes!, 0);
            stat.wickets = this.squadDetailAndStats.reduce((prevValue, currPlayer) => prevValue + currPlayer!.over_all_stats.bowling.wickets!, 0);
            stat.catches = this.squadDetailAndStats.reduce((prevValue, currPlayer) => prevValue + currPlayer!.over_all_stats.fielding.catches!, 0);
          }
          return stat;
        },
      },
      methods: {
        findPlayerForStats() {
          let result: PlayerData[] = [];
          this.selectedSquad.forEach(pl => {
            this.allSeasonPlayerList.forEach(playerData => {
              if (pl && pl.player_details && pl!.player_details.id === playerData.player_details.id) {
                result.push(playerData);
              }
            })
          });
          this.squadDetailAndStats = result;
          if (this.squadDetailAndStats.length) {
            context.element.classList.add('team-submit');
          }
          else {
            context.element.classList.contains('team-submit') &&
              context.element.classList.remove('team-submit');
          }
          return result;
        },
        formatNumber(num: number) {
          if (isNaN(num)) {
            return '';
          }
          return new Intl.NumberFormat('en-IN').format(num);
        },
        swapPlayer(player: PlayerData) {
          if (this.selectionStep === 0) {
            if (this.focusedCaptainWKId === '') {
              this.focusedCaptainWKId = player.player_details.id;
              if (this.mobileDevice) {
                this.dragStartPlayerId = player.player_details.id;
                this.dragOverPlayerId = '';
              }
            }
            else {
              if (this.focusedCaptainWKId === player.player_details.id) {
                this.focusedCaptainWKId = '';
                if (this.mobileDevice) {
                  this.dragStartPlayerId = '';
                  this.dragOverPlayerId = '';
                }
              }
              else if (this.mobileDevice) {
                this.dragOverPlayerId = player.player_details.id;
                let index = -1;
                this.selectedSquad.forEach((p, i) => {
                  if (p!.player_details.id === player.player_details.id) {
                    index = i;
                  }
                });
                this.handleDrop(index);
                this.focusedCaptainWKId = '';
                this.dragStartPlayerId = '';
                this.dragOverPlayerId = '';
              }
            }
          }
        },
        async onSponserRegisterClick() {
          const _userProfile = await UserProfile.getInstance();
          const userData: any = await _userProfile.fetchUserData();
          const email = userData!.data.email_id;
          const name = this.userData!.name
          this.trackEvent(
            'Marriott Bonvoy Register Button',
            'click on register button',
            'user email: ' + email + ', name: ' + name);
        },
        async continueToSubmit() {
          if (this.captainId === '' || this.wicketKeeperId === '') {
            alert('Please select your Captain and Wicket Keeper');
            setTimeout(() => {
              this.playerDetailsSubmitError = '';
            }, 5000);
            return;
          }
          else {
            try {
              this.playerDetailsSubmitSuccess = '';
              this.searchText = '';
              this.loadingStatus = 1;
              const result = this.findPlayerForStats();
              if (result.length) {
                const AllPlayers: PayloadPlayerData[] = result.map(player => ({
                  id: player!.player_details.id,
                  name: player!.player_details.name,
                  skill_name: player!.player_details.skill,
                  skill_id: player!.player_details.skill_id,
                  is_captain: player!.player_details.id === this.captainId,
                  is_wicket_keeper: player!.player_details.id === this.wicketKeeperId,
                  is_vice_captain: false,
                  runs: player!.over_all_stats.batting.runs,
                  sixes: player!.over_all_stats.batting.sixes,
                  fours: player!.over_all_stats.batting.fours,
                  wickets: player!.over_all_stats.bowling.wickets,
                  catches: player!.over_all_stats.fielding.catches,
                  nationality_id: player!.player_details.nationality_id,
                  nationality: player!.player_details.nationality,
                  national_team_id: player!.player_details.national_team_id,
                  national_team: player!.player_details.national_team,
                }));
                const payload: PlayerInsertPayload = {
                  team_name: this.usersTeamName,
                  seasonid: '2020',
                  weekid: '1',
                  players: AllPlayers
                }
                this.playerDetailsSubmitError = '';
                this.playerDetailsSubmitted = false;
                const res = await submitPlayerPayloadToInsert(payload);
                this.payload = payload;
                context.element.classList.add('team-submit');
                this.downloadImage(undefined);
                this.loadingStatus = 0;
                if (res && res['content'] && res['content'].hasOwnProperty('Status')) {
                  if (res['content'].Status == 1 || res['content'].Status === '1') {
                    this.playerDetailsSubmitted = true;
                    this.squadDetailAndStats = result;
                    this.playerDetailsSubmitSuccess = 'Your Team submitted successfully';
                    this.ifMITeamTabVisible = true;
                    setTimeout(() => {
                      this.playerDetailsSubmitSuccess = '';
                    }, 5000);
                    this.trackEvent('TeamSubmit', 'team submit success', 'user_guid: ' + this.userData!.user_guid);
                  }
                  else if (res['content'].Status === 0 || res['content'].Status === '0' || res['content'].Status === -4 || res['content'].Status === '-4') {
                    this.playerDetailsSubmitError = "Your team already exists";
                  }
                  else if (res['content'].Status === -2 || res['content'].Status === '-2') {
                    this.playerDetailsSubmitError = "Your team seams to have no players selected";
                  }
                  else {
                    this.playerDetailsSubmitError = "Something went wrong, please try after sometime.";
                    this.trackEvent('TeamSubmit', 'team submit failed', 'user_guid: ' + this.userData!.user_guid);
                  }
                  setTimeout(() => {
                    this.playerDetailsSubmitError = '';
                  }, 5000);
                }
              }
            }
            catch (e) {
              console.log(e);
            }
          }
        },
        scrollTop() {
          window && window.scroll(0, 0);
        },
        clearSearch(e: Event) {
          this.searchText = '';
          const btnEl: HTMLButtonElement = e.target as HTMLButtonElement;
          const parent = btnEl.parentElement;
          if (parent) {
            const parentParent = parent.parentElement;
            if (parentParent) {
              const input = parentParent.querySelector('input');
              input && input.focus();
            }
          }
        },
        shortenPlayerName(name): string {
          const wordArr = name.split(' ');
          if (wordArr.length === 1) {
            return name;
          }
          else if (wordArr.length > 1) {
            const firstWord = wordArr[0];
            const firstLetter = firstWord.slice(0, 1) + '. ';
            const remaining = wordArr.filter((_, i) => i > 0);
            const remainingName = remaining.join(' ');
            return firstLetter + remainingName;
          }
          return ''
        },
        selectPlayer(player: PlayerData) {
          if (!this.loggedIn) {
            this.openSelectionScreen();
            return;
          }
          if (this.currentTab != 'create') {
            return;
          }
          const found = this.selectedSquad.filter(pl => pl && pl.player_details.id === player.player_details.id);
          if (found.length > 0) {
            this.selectedSquad.forEach((p, i) => {
              if (p && p!.player_details.id === found[0]!.player_details.id) {
                this.removePlayer(player, i);
              }
            });
            return;
          }
          const overseas = this.selectedSquad.filter(player => player && player.player_details.nationality_id !== '4');
          if (overseas.length === this.allowedOverseasPlayers && player.player_details.nationality_id !== '4') {
            alert('Only 4 foreign players allowed');
            setTimeout(() => {
              this.playerDetailsSubmitError = '';
            }, 5000);
            return;
          }
          if (this.deletedPlayers.length === 0) {
            alert('You have already selected ' + this.allowedSelectionCount + ', please remove players to add another.')
            setTimeout(() => {
              this.playerDetailsSubmitError = '';
            }, 5000);
            return;
          }
          const { index } = this.deletedPlayers[0];
          const squad = this.selectedSquad.map((p, ind) => {
            if (ind === index) {
              p = player;
              this.deletedPlayers.shift();
            }
            return p;
          });
          this.selectedSquad = squad;
          this.findPlayerForStats();
        },
        removePlayer(player: PlayerData, index: number) {
          if (!this.loggedIn) {
            this.openSelectionScreen();
            return;
          }
          if (this.currentTab != 'create') {
            return;
          }
          if (this.deletedPlayers.length && this.deletedPlayers.length === 11) {
            this.deletedPlayers[index].playerId = player.player_details.id;
          }
          else {
            this.deletedPlayers.unshift({ index, playerId: player.player_details.id });
          }
          if (player.player_details.id === this.captainId) {
            this.captainId = '';
          }
          if (player.player_details.id === this.wicketKeeperId) {
            this.wicketKeeperId = '';
          }
          const squadList = [...this.selectedSquad];
          squadList[index] = null;
          this.selectedSquad = squadList;
          this.focusedCaptainWKId = '';

          this.findPlayerForStats();
        },
        selectCaptainWK(player: PlayerData, type: string) {
          if (!this.loggedIn) {
            this.openSelectionScreen();
            return;
          }
          if (this.currentTab != 'create') {
            return;
          }
          if (this.selectionStep !== 0) {
            return;
          }
          if (type === 'c') {
            if (this.captainId === this.focusedCaptainWKId) {
              this.captainId = '';
            }
            else {
              this.captainId = player.player_details.id
            }
          }
          else if (type === 'wk') {
            if (this.wicketKeeperId === this.focusedCaptainWKId) {
              this.wicketKeeperId = '';
            }
            else {
              this.wicketKeeperId = player.player_details.id
            }
          }
          this.focusedCaptainWKId = '';
        },
        async fetchPlayers(season: string) {
          this.loadingStatus = 1;
          try {
            let players: PlayerData[] = [];
            if (season === 'all seasons' && this.allSeasonPlayerList.length) {
              players = this.allSeasonPlayerList;
            }
            else {
              const res: PlayerBySeasonRes = await getPlayersBySeason(season);
              players = res.players;
            }
            if (players && players.length) {
              this.squadList = players;
              this.squadList = this.squadList.sort((p1, p2) => {
                const a = p1.player_details.name.toUpperCase();
                const b = p2.player_details.name.toUpperCase();
                if (a > b) {
                  return 1
                }
                if (a < b) {
                  return -1
                }
                return 0
              });
              this.loadingStatus = 0;
              this.selectionStep = 1;
              // testing purpose for auto selecting 11 india players
              // this.selectedSquad = this.squadList.filter(p => p.player_details.nationality_id === '4').slice(0, 11)
              // this.deletedPlayers = [];
              // end of - testing purpose for auto selecting 11 india players
            }
            this.trackEvent('FilterUse', 'change season filter', 'Selected season filter: ' + season);
          }
          catch (e) {
            console.log(e);
            this.loadingStatus = 2;
          }
        },
        trackEvent(event_category: string, event_action: string, event_label: string) {
          window.gtag && window.gtag('event', 'click', {
            event_category,
            event_action,
            event_label
          })
        },
        handleDrop(index: number) {
          if (this.playerDetailsSubmitted) {
            return;
          }
          if (this.currentTab != 'create') {
            return;
          }
          if (this.selectionStep !== 0) {
            return true;
          }
          const squad = this.selectedSquad;
          const droppedOnPlayer = squad[index];
          let droppingPlayerId = -1;
          const droppingPlayer = squad.filter((player, index) => {
            if (player && this.dragStartPlayerId === player.player_details.id) {
              droppingPlayerId = index;
              return player;
            }
          });
          squad[index] = droppingPlayer[0];
          squad[droppingPlayerId] = droppedOnPlayer;
          this.selectedSquad = squad;
          this.dragOverPlayerId = '';
        },
        handleDragOver(playerId: string) {
          if (this.playerDetailsSubmitted) {
            return;
          }
          if (this.currentTab != 'create') {
            return;
          }
          if (this.selectionStep !== 0) {
            return true;
          }
          this.dragOverPlayerId = playerId;
        },
        handleDragStart(playerId: string) {
          if (this.playerDetailsSubmitted) {
            return;
          }
          if (this.currentTab != 'create') {
            return;
          }
          if (this.selectionStep !== 0) {
            return true;
          }
          this.dragStartPlayerId = playerId;
        },
        handleDragEnter(playerId: string) {
          if (this.playerDetailsSubmitted) {
            return;
          }
          if (this.currentTab != 'create') {
            return;
          }
          if (this.selectionStep !== 0) {
            return true;
          }
          if (this.mobileDevice)
            this.dragStartPlayerId = playerId;
        },
        openSelectionScreen() {
          if (this.loggedIn) {
            this.selectionStep = 1;
          }
          else {
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
          }
        },
        editTeam() {
          this.selectionStep = this.mobileDevice ? 0 : 1;
          this.playerDetailsSubmitted = false;
          this.teamImgUrl = '';
        },
        async downloadImage(callback: Function, flag?: boolean | undefined) {
          this.generatingImg = true;
          const imageKey = 'prod/team-create/atxi/my-all-time-mi-xi-' + this.userData!.user_guid + '.jpg';
          const imgPath = 'https://www.dummyTeam.com/static-resources/team-create/atxi/my-all-time-mi-xi-' + this.userData!.user_guid + '.jpg?v=' + new Date().getTime();
          const templateUrl = "https://www.dummyTeam.com/static-resources/team-create/template/team-create.pug?v=" + new Date().getTime()
          let players: PayloadPlayerData[] = [...this.payload!.players];
          players = players.map(p => {
            const short_name = this.shortenPlayerName(p.name!);
            return {
              short_name,
              ...p
            }
          })
          let payloadData = {
            templateUrl,
            templateData: {
              payload: {
                players,
                stats: this.getSquadStats
              }
            }
          }

          let shareLinkPayload = {
            url: 'https://464okvtx8d.execute-api.ap-south-1.amazonaws.com/prod/getHtml',
            format: 'jpg',
            opType: 'POST',
            postData: JSON.stringify(payloadData),
            bucket: 'assets-dummyTeam.sportz.io',
            key: imageKey,
            width: '1200',
            height: '1200'
          }

          try {
            // image generation
            const res = await fetch("https://v0yzv923b6.execute-api.ap-south-1.amazonaws.com/dev/ImageGenerator", {
              method: "POST",
              mode: 'no-cors',
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify(shareLinkPayload)
            });
            if (res) {
              this.generatingImg = false;
              this.loadingStatus = 0;
              this.teamImgUrl = imgPath;
              if (callback && typeof callback === 'function') {
                callback(this.teamImgUrl);
              }
              else if (flag) {
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                  location.href = this.teamImgUrl;
                }
                else {
                  try {
                    const getDataUrl = (img: any) => {
                      const canvas = document.createElement('canvas') as HTMLCanvasElement;
                      const ctx = canvas.getContext('2d')

                      canvas.width = img.width
                      canvas.height = img.height
                      ctx!.drawImage(img, 0, 0)
                      return canvas.toDataURL()
                    }
                    const img = document.createElement('img');
                    img.src = this.teamImgUrl;
                    img.crossOrigin = 'anonymous';
                    img.addEventListener('load', () => {
                      const dataurl = getDataUrl(img);
                      const anchor = document.createElement('a');
                      anchor.setAttribute('href', dataurl);
                      anchor.setAttribute('download', this.payload!.team_name);
                      anchor.setAttribute('style', 'opacity: 0;');
                      document.body.appendChild(anchor);
                      anchor.click();
                      document.body.removeChild(anchor);
                    });
                  }
                  catch (e) {
                    console.log(e);
                  }
                  this.trackEvent('DownloadTeamImageAndShare', 'download', 'Click on Download Button');
                }
              }
            }
            else {
              console.log('error', res);
              this.teamImgUrl = '';
            }
          }
          catch (e) {
            console.log(e);
            this.teamImgUrl = '';
          }
        },
        downloadAndShareImage(shareTypeStr: string) {
          let shareType: ShareType = ShareType.FB;
          switch (shareTypeStr) {
            case 'facebook':
              shareType = ShareType.FB;
              this.trackEvent('DownloadTeamImageAndShare', 'share', 'Click on Facebook share');
              break;
            case 'twitter':
              shareType = ShareType.TWITTER;
              this.trackEvent('DownloadTeamImageAndShare', 'share', 'Click on Twitter share');
              break;
            case 'whatsapp':
              shareType = ShareType.WHATSAPP;
              this.trackEvent('DownloadTeamImageAndShare', 'share', 'Click on WhatsApp share');
              break;
          }
          const shareObj: SocialShareObject = {
            url: window.location.href,
            title: 'Here’s My All-Time MI XI!\n' + this.teamImgUrl + '\n\nCreate your own MI XI:\n' + (shareType !== ShareType.TWITTER ? window.location.href : ''),
            description: '',
            imgPath: this.teamImgUrl
          }
          if (this.teamImgUrl === '') {
            this.downloadImage((imgUrl: string) => {
              shareObj.title = 'Here’s My All-Time MI XI!\n' + imgUrl + '\n\nCreate your own MI XI:\n' + (shareType !== ShareType.TWITTER ? window.location.href : '');
              ShareUtil.share(shareType, shareObj);
            })
          } else {
            ShareUtil.share(shareType, shareObj);
          }
        },
        async setExistingTeam(playerData: PlayerInsertPayload) {
          const players = playerData.players;
          this.selectedSquad = [];
          this.squadDetailAndStats = [];
          this.allSeasonPlayerList.forEach(p => {
            players.forEach((pl, index) => {
              if (p.player_details.id === pl.id) {
                this.selectedSquad[index] = p;
                this.squadDetailAndStats[index] = p;
                if (pl.is_captain)
                  this.captainId = p.player_details.id;
                if (pl.is_wicket_keeper)
                  this.wicketKeeperId = p.player_details.id;
              }
            })
          });
          if (this.selectedSquad.length === this.allowedSelectionCount) {
            this.deletedPlayers = [];
            this.payload = playerData;
            this.downloadImage(undefined, false);
            this.selectionStep = 3;
            this.playerDetailsSubmitted = true;
            this.loadingStatus = 0;
            this.ifMITeamTabVisible = true;
            context.element.classList.add('team-submit');
            this.$forceUpdate();
          }
        },
        async fetchAllSeasonPlayers() {
          const res = await getAllSeasonPlayer();
          this.allSeasonPlayerList = res.players
          return this.allSeasonPlayerList;
        },
        async changeTab(tabName: string) {
          this.currentTab = tabName;
          if (this.currentTab === 'mi') {
            this.searchText = '';
            if (!this.allTimeMISquad.length) {
              try {
                const res = await getMIAllTimeXI({ season_id: '2020', week_id: '1' });
                this.allTimeMISquad = res.players;
                console.log(this.allTimeMISquad);
              }
              catch (e) {
                console.log(e);
              }
            }
            context.element.classList.contains('team-submit') &&
              context.element.classList.remove('team-submit');
          }
          else {
            context.element.classList.add('team-submit');
          }
        },
      },
      async mounted() {
        await this.fetchAllSeasonPlayers();
        this.fetchPlayers(this.season);

        // testing purpose for auto editing new team
        const squad = this.selectedSquad;
        for (let i = 0; i < this.allowedSelectionCount; i++) {
          squad.push(null);
          this.deletedPlayers[i] = { index: i, playerId: '' }
        }
        this.selectedSquad = squad;
        // end of - testing purpose for auto editing new team
        this.userData = getCookieJSON<URC_Cookie>('_URC');
        if (this.userData && this.userData.user_guid) {
          this.loggedIn = true;
          const params: fetchUserTeamParams = {
            userId: this.userData.user_guid,
            season_id: '2020',
            week_id: '1'
          }
          this.loadingStatus = 1;
          const res = await getUserTeam(params);
          if (res && res.players) {
            // testing purpose for auto editing new team
            this.setExistingTeam(res);
            // end of - testing purpose for auto editing new team
            this.loadingStatus = 0;
          }
          else {
            this.loadingStatus = 0;
          }
        }
        else {
          setTimeout(() => {
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
          }, 2000);
        }

        window.addEventListener('resize', () => {
          this.mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 992;
        });

      }
    })
  }
}
export default () => ApplicationObj.register('si-custom--widget-layout-27', AllTeamXI)