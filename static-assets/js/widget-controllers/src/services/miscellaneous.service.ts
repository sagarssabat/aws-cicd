import { ContactUsRequest } from '../interfaces/contactUsApi'
import { SiTrackingPayload } from '../interfaces/si-tracking'
import { postJsonData } from '../util'

export async function contactUsUser(contactUsData: ContactUsRequest): Promise<string> {
  return postJsonData<string>("/api/insertcontactuserdetails", contactUsData);
}

export async function sendAnalyticsData(siTrackingPayload: SiTrackingPayload): Promise<any> {
  //TODO: add url
  return postJsonData('/api/insertpageviewdetails?prefix=labmi.labmi', siTrackingPayload)
}