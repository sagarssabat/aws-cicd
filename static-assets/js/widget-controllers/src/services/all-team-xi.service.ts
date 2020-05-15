import { postJsonData, getJsonData } from '../util';
import { PlayerInsertPayload, PlayerBySeasonRes, fetchUserTeamParams, allTimeTeamReqParams } from '../interfaces/all-team.interface';

let api_host = '';
api_host = window.location.host === 'localhost:9020' ? 'https://beta-mi.sportz.io' : '';

export const endPoints: any = {
  'all seasons': api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_season_players.json',
  2008: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_1075.json',
  2009: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_1137.json',
  2010: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_1184.json',
  2011: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_1295.json',
  2012: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_1380.json',
  2013: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_1517.json',
  2014: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_2173.json',
  2015: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_2340.json',
  2016: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_2569.json',
  2017: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_2756.json',
  2018: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_2940.json',
  2019: api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_players_3130.json',
}

export async function getPlayersBySeason(year: string = '2019'): Promise<PlayerBySeasonRes> {
  return await (await fetch(endPoints[year])).json();
}
export async function getAllSeasonPlayer(): Promise<PlayerBySeasonRes> {
  return await (await fetch(api_host + '/sifeeds/repo/cricket/static/json/iplfeeds/1111_all_season_players.json')).json();
}
export async function getMIAllTimeXI(queryParam: allTimeTeamReqParams): Promise<any> {
  return getJsonData<any>(api_host + '/api/getseasonteam', queryParam);
}
export async function getUserTeam(params: fetchUserTeamParams): Promise<PlayerInsertPayload> {
  return getJsonData<PlayerInsertPayload>(api_host + '/api/getuserteam', params)
}
export async function submitPlayerPayloadToInsert(payload: PlayerInsertPayload): Promise<any> {
  return postJsonData<any>(api_host + '/api/insertteam', payload);
}