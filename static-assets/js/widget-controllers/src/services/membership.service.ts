import { getJsonData, postJsonData } from '../util';
import { ApiResponse } from '../models/social-api-model';
import { MemberShipQueryParam } from '../interfaces/membership.interface';

export async function getMembershipListing(queryParams: MemberShipQueryParam): Promise<any> {
  return getJsonData<any>("/api/Shop/getProductlisting", queryParams)
}

export async function submitMembershipData(payload: any): Promise<any> {
  return postJsonData<any>("/api/Shop/InsertcartDetails", payload);
}