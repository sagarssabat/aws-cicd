import { SiTrackingAction, SiTrackingPayload } from './interfaces/si-tracking'
import { ApplicationObj } from './main'
import { URC_Cookie } from './models/social-api-model'

/**
 * Returns a list of controllers registered with given name
 * @param ControllerName 
 */
export function GetControllerFromKey(ControllerName: string) {
  return ApplicationObj.controllers.filter(controller => controller.identifier == ControllerName)
}

/**
 * Dispatch a custom event to a controller
 * Can be used in a scenario where you want to call a function from one controller in other controller
 * @param ControllerName 
 * @param eventName 
 */
export function triggerEventByCtrlName(ControllerName: string, eventName: string) {
  GetControllerFromKey(ControllerName).forEach(controller => {
    const event = document.createEvent("CustomEvent")
    event.initCustomEvent(eventName, true, true, null)
    controller.element.dispatchEvent(event)
  })
}

/**
 * Returns boolean if the said html element is in view or not
 * @param ele 
 */
export function isInViewport(ele: HTMLElement): boolean {
  let elementTop = $(ele).offset()!.top
  let elementBottom = elementTop + $(ele).outerHeight()!
  let viewportTop = $(window).scrollTop()!
  let viewportBottom = viewportTop + $(window).height()!

  return elementBottom > viewportTop && elementTop < viewportBottom
};

/**
 * Encode an object as url query string parameters
 * - includes the leading "?" prefix
 * - example input — {key: "value", alpha: "beta"}
 * - example output — output "?key=value&alpha=beta"
 * - returns empty string when given an empty object
 */
export function encodeQueryString(params: any): string {
  const keys = Object.keys(params)
  return keys.length
    ? "?" + keys
      .map(key => encodeURIComponent(key)
        + "=" + encodeURIComponent(params[key]))
      .join("&")
    : ""
}

/**
 * Make post requests using this function
 * @param url 
 * @param payLoad 
 */
export async function postJsonData<T>(url: string, payLoad: object): Promise<T> {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payLoad)
  })
  let responseData: T = (await response.json()) as T
  return responseData
}

/**
 * Fetches data using get request
 * @param url          api to fetch data from
 * @param queryParams  query parameters if any should be passed in the form of key-value pair, e.g., {firstname: kushang, lastname: patel}
 */
export async function getJsonData<T>(url: string, queryParams?: any): Promise<T> {
  if (undefined !== queryParams && null !== queryParams) {
    url += encodeQueryString(queryParams)
  }

  let response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })

  let responseJson = await response.json()

  let responseData: T = (responseJson.content) as T
  return responseData
}

/**
 * Fetches data using get request
 * @param url          api to fetch data from
 * @param queryParams  query parameters if any should be passed in the form of key-value pair, e.g., {firstname: kushang, lastname: patel}
 */
export async function getFullJsonData<T>(url: string, queryParams?: any): Promise<T> {
  if (undefined !== queryParams && null !== queryParams) {
    url += encodeQueryString(queryParams)
  }

  let response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })

  let responseJson = await response.json()

  let responseData: T = (responseJson) as T
  return responseData
}

/**
 * Returns a boolean stating the given input is null or not
 * @param val 
 */
export function isNull(val: string | object | number): boolean {

  if (typeof val == 'string') {
    return isNullString(val)
  }

  if (undefined === val || null === val) {
    return true
  }

  return false
}

/**
 * Null check for a string type variable
 * @param val 
 */
export function isNullString(val: string): boolean {
  if (undefined === val || null === val || '' === val) {
    return true
  }

  return false
}

/**
 * Set a cookie in browser under current domain name
 * @param cookieName 
 * @param cookieValue 
 * @param daysToExpire 
 */
export function setCookie(cookieName: string, cookieValue: any, daysToExpire?: number) {
  if (undefined === daysToExpire || null !== daysToExpire || '' !== daysToExpire) {
    daysToExpire = 365
  }
  let date: Date = new Date()
  date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000))
  document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toUTCString()
}

/**
 * Retrieve a cookie in browser under current domain name
 * @param cookieName 
 */
export function getCookie(cookieName: string) {
  let name = cookieName + "="
  let allCookieArray = document.cookie.split(';')
  for (let i = 0; i < allCookieArray.length; i++) {
    let c = allCookieArray[i].trim()
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}

/**
 * Returns cookie value parsed as JSON Object
 * NOTE: Only use this function when you know that cookie value is a stringified JSON Object
 * @param cookieName 
 */
export function getCookieJSON<T>(cookieName: string): T | undefined {
  let cookieVal = getCookie(cookieName)
  if (!isNull(cookieVal)) {
    return JSON.parse(cookieVal) as T
  }
  return undefined
}

/**
 * Delete a cookie in browser under current domain name
 * @param cookieName 
 */
export function deleteCookie(cookieName: string) {
  setCookie(cookieName, '', -1)
}

/**
 * Retrieves a value of a given query param key
 * @param paraName 
 */
export function getQueryStringValue(paraName: string): string | undefined {
  let value = decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(paraName).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"))
  return value == "" ? undefined : value
}

/**
 * Check if a string only contains spaces
 * @param val 
 */
export function containsOnlyWhiteSpace(val: string): boolean {
  if (!val.replace(/\s/g, '').length) {
    return true
  }
  return false
}

/**
 * Check if current working enviornment is our local, i.e., 119
 */
export function isLocal(): boolean {
  let ipv4Url = RegExp([
    '^https?:\/\/([a-z0-9\\.\\-_%]+:([a-z0-9\\.\\-_%])+?@)?',
    '((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4',
    '][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])?',
    '(:[0-9]+)?(\/[^\\s]*)?$'
  ].join(''), 'i')

  return ipv4Url.test(location.origin)
}

/**
 * Check if script is executing on a mobile or any other medium
 */
export const isMobile = () => window.innerWidth < 767

/**
 * Get Meta Tag Content
 *
 * @param {string} metaName The meta tag name.
 * @return {string} The meta tag content value, or empty string if not found.
 */
export function getMetaContent(metaName: string): string {
  let metas: any = document.getElementsByTagName('meta')
  let re = new RegExp('\\b' + metaName + '\\b', 'i')

  for (let meta of metas) {
    if (re.test(meta.getAttribute('name'))) {
      return meta.getAttribute('content')
    }
  }

  return ''
}

/**
 * Returns default payload for page view, which can be modified later
 */
export function getSiTrackingPayload(): SiTrackingPayload {
  let user = getCookieJSON<URC_Cookie>('_URC')
  let user_id = ''
  if (!isNull(user!) && !isNull(user!.user_guid)) {
    user_id = user!.user_guid
  }
  let url = location.href
  let asset_id = getMetaContent('assetid')
  let asset_type_id = getMetaContent('assettypeid')
  let action = SiTrackingAction.VIEW

  if (isNull(asset_id)) {
    asset_id = '0'
  }

  if (isNull(asset_type_id)) {
    asset_type_id = '0'
  }

  let siTrackingPayload: SiTrackingPayload = {
    data: {
      module_name: 'asset_view',
      user_id,
      action,
      url,
      asset_id,
      asset_type_id,
      extra: ''
    }
  }
  return siTrackingPayload
}
