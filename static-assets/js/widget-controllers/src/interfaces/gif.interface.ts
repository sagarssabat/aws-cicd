export interface gifMyQueryParam {
  galleryType: string;
  item: string;
  page: string;
  status: string;
  token: string;
}

export interface gifMiQueryParam {
  galleryType: string;
  item: string;
  page: string;
}

export interface deleteGifPayload {
  data: deleteGifPayloadInner[]
}

export interface deleteGifPayloadInner {
  thumbnail: string;
  gallery_id: string;

}