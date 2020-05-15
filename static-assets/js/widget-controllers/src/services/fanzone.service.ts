import {
  FanZoneApiResponse,
  FanZoneApiSubmitResponse,
  GetPollDetailQueryParams,
  SumbitPollRequest
  } from '../interfaces/fan-zone-api'
import { getJsonData, isLocal, postJsonData } from '../util'

export async function getFanZonePollDetails(queryParams: GetPollDetailQueryParams): Promise<FanZoneApiResponse> {
  // 602 for local, 2222 for beta / prod
  let entityId = 2222
  if (isLocal()) {
    entityId = 602
  }
  return getJsonData<FanZoneApiResponse>("/api/polldetail/" + entityId, queryParams);
}

export async function getFanMomentPollDetails(queryParams: GetPollDetailQueryParams): Promise<FanZoneApiResponse> {
  // 603 for local, 2223 for beta, 2242 for prod
  let entityId = 2242
  if (isLocal()) {
    entityId = 603
  }
  return getJsonData<FanZoneApiResponse>("/api/polldetail/" + entityId, queryParams);
}

export async function sumbitFanPollDetails(SumbitPollRequestData: SumbitPollRequest): Promise<FanZoneApiSubmitResponse> {
  return postJsonData<FanZoneApiSubmitResponse>("api/submitpoll", SumbitPollRequestData);
}