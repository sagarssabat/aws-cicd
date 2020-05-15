import { isNull, getCookieJSON } from "../util"
import { ApiResponse, URC_Cookie, GetProfileRequest } from './social-api-model'
import { getProfileUser } from '../services/user.service'

export class UserProfile {
  static userProfileInstance: UserProfile
  userData: ApiResponse
  isFetching: boolean = false

  constructor() {
    // this.fetchUserData()
  }

  static getInstance() {
    if (isNull(this.userProfileInstance)) {
      this.userProfileInstance = new UserProfile()
    }
    return this.userProfileInstance
  }

  getUserData() {
    return this.userData
  }

  fetchUserData(): Promise<ApiResponse> {
    return new Promise(async (resolve, reject) => {
      this.isFetching = true
      let userCookie = getCookieJSON<URC_Cookie>('_URC')!
      if (!isNull(userCookie)) {
        let userGuid = userCookie!.user_guid
        let payLoad: GetProfileRequest = {
          token: userGuid
        }
        let userData = await getProfileUser(payLoad)
        this.isFetching = false
        resolve(userData)
      }
    })
  }
}