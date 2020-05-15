import { URC_Cookie } from '../models/social-api-model';

export interface DeletedPlayer {
  index: number;
  playerId: string;
}
export interface AllTimeXIVueData {
  squadList: PlayerData[];
  selectedSquad: (PlayerData | null)[];
  allowedSelectionCount: number;
  season: string;
  searchText: string;
  selectionStep: number;
  captainId: string;
  wicketKeeperId: string;
  focusedCaptainWKId: string;
  deletedPlayers: DeletedPlayer[];
  dragOverPlayerId: string;
  dragStartPlayerId: string;
  allowedOverseasPlayers: number;
  endPoints: any;
  loadingStatus: number;
  loggedIn: boolean;
  currentTab: string;
  userData: URC_Cookie | undefined;
  usersTeamName: string;
  playerDetailsSubmitted: boolean;
  playerDetailsSubmitError: string;
  playerDetailsSubmitSuccess: string;
  shareMenuToggle: boolean;
  mobileDevice: boolean;
  payload: PlayerInsertPayload | null;
  teamImgUrl: string;
  generatingImg: boolean;
  squadDetailAndStats: PlayerData[];
  allSeasonPlayerList: PlayerData[];
  allTimeMISquad: AllTimeMISquadData[];
  ifMITeamTabVisible: boolean;
  showSponserPopup: boolean;
  confirmAge: boolean;
}
export interface AllTimeMISquadData {
  name: string | null;
  count: number | null;
  player_id: string | null;
  is_captain: number | null;
  percentage: number | null;
  skill_name: string | null;
  is_wicket_keeper: number | null;
}
export interface AllTimeXIVueComputedProperties {
  getPlayersLeft: string;
  getForeignPlayersLeft: string;
  getFilteredSquadList: PlayerData[];
  getSquadStats: SquadStats;
  ifValidXI: boolean;
}
export interface AllTimeXIVueMethods {
  findPlayerForStats(): PlayerData[];
  formatNumber(num: number): string;
  fetchPlayers(season: string): void;
  selectCaptainWK(player: PlayerData, type: string): void;
  removePlayer(player: PlayerData, index: number): void;
  selectPlayer(player: PlayerData): void;
  handleDrop(index: number): void;
  handleDragOver(playerId: string): void;
  handleDragStart(playerId: string): void;
  handleDragEnter(playerId: string): void;
  shortenPlayerName(name: string): string;
  clearSearch(e: Event): void;
  openSelectionScreen(): void;
  continueToSubmit(): void;
  downloadImage(callback: Function | undefined, flag?: boolean | undefined): void;
  downloadAndShareImage(shareType: string): void;
  setExistingTeam(playerData: PlayerInsertPayload): void;
  scrollTop(): void;
  trackEvent(event_category: string, event_action: string, event_label: string): void;
  fetchAllSeasonPlayers(): Promise<PlayerData[]>;
  swapPlayer(player: PlayerData): void;
  editTeam(): void;
  changeTab(tabName: string): void;
  onSponserRegisterClick(): void;
}

export interface SquadStats {
  runs: number | null;
  fours: number | null;
  sixes: number | null;
  wickets: number | null;
  catches: number | null;
}
export interface BattingStats {
  matches_played: number | null;
  innings: number | null;
  not_outs: number | null;
  runs: number | null;
  balls: number | null;
  fours: number | null;
  sixes: number | null;
  strike_rate: number | null;
  average: number | null;
  fifties: number | null;
  hundred: number | null;
  boundary_frequency: number | null;
  boundary_percentage: number | null;
  dot_ball_frequency: number | null;
  dot_ball_percentage: number | null;
  highest_score: number | null;
  highest_score_notout: string | null;
}

export interface BowlingStats {
  matches_played: number | null;
  innings: number | null;
  overs: number | null;
  runs_conceded: number | null;
  maidens: number | null;
  wickets: number | null;
  average: number | null;
  economy: number | null;
  strike_rate: number | null;
  boundary_frequency: number | null;
  boundary_percentage: number | null;
  dot_ball_frequency: number | null;
  dot_ball_percentage: number | null;
  five_wickets_haul: number | null;
  four_wickets_haul: number | null;
  best: string | null;
}
export interface FieldingStats {
  catches: number | null;
  runouts: number | null
  stumpings: number | null;
}

export interface OverAllStats {
  batting: BattingStats;
  bowling: BowlingStats;
  fielding: FieldingStats;
}
export interface PlayerDetails {
  id: string;
  name: string;
  name_english: string;
  skill_id: string;
  skill: string;
  nationality_id: string;
  nationality: string;
  national_team_id: string;
  national_team: string;
  is_wicket_keeper: boolean;
  is_captain: boolean;
  is_vice_captain: boolean;
}
export interface PayloadPlayerData {
  id: string | null;
  name: string | null;
  skill_name: string | null;
  skill_id: string | null;
  is_captain: boolean | null;
  is_wicket_keeper: boolean | null;
  is_vice_captain: boolean | null;
  runs: number | null;
  sixes: number | null;
  fours: number | null;
  wickets: number | null;
  catches: number | null;
  nationality_id: string | null;
  nationality: string | null;
  national_team_id: string | null;
  national_team: string | null;
}
export interface PlayerInsertPayload {
  team_name: string;
  seasonid: string;
  weekid: string;
  players: PayloadPlayerData[];
}

export interface PlayerData {
  player_details: PlayerDetails;
  over_all_stats: OverAllStats;
}
export interface PlayerBySeasonRes {
  players: PlayerData[];
}
export interface fetchUserTeamParams {
  userId: string;
  season_id: string;
  week_id: string;
}
export interface allTimeTeamReqParams {
  season_id: string;
  week_id: string;
}