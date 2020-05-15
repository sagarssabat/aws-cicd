import { getJsonData, postJsonData } from '../util';
import { gifMyQueryParam, gifMiQueryParam, deleteGifPayload } from '../interfaces/gif.interface';

export async function getGifMyData(queryParams: gifMyQueryParam): Promise<any> {
  return getJsonData<any>("/api/getphotobooth", queryParams)
}

export async function getGifMiData(queryParams: gifMiQueryParam): Promise<any> {
  return getJsonData<any>("/api/getadminphotobooth", queryParams)
}

export async function deleteGifData(payload: deleteGifPayload): Promise<any> {
  return postJsonData<any>("/api/deletegif", payload);
}
