/**
 * If action is share, extra can be 'fb/twitter'
 */
export interface SiTrackingData {
  module_name: string, //"asset_view",
  user_id: string,
  url: string,
  asset_id: string,
  asset_type_id: string,
  extra: string,
  action: SiTrackingAction
}

export enum SiTrackingAction {
  VIEW = 'view',
  SHARE = 'share',
  DOWNLOAD = 'download'
}

export interface SiTrackingPayload {
  data: SiTrackingData
}