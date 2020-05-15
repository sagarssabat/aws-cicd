import {
  ApiResponse,
  ForgotPwdRequest,
  GetProfileRequest,
  LogOutRequest,
  RegisterRequest,
  ResetPwdRequest,
  SignInRequest,
  UpdateProfileRequest,
  VerificationRequest,
  ChangePassward,
  VerifyOtp,
  SendOtp,
  Checkuserexist,
  UpdateTermsAndConditionsRequest,
  Verifypin
} from '../models/social-api-model'
import { postJsonData, getFullJsonData } from '../util'


export async function registerUser(registerData: RegisterRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/register", registerData);
}

export async function signInUser(signInData: SignInRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/signin", signInData);
}

export async function forgotPwdUser(forgotPwdData: ForgotPwdRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/ForgotPassword", forgotPwdData);
}

export async function updateProfileUser(updateProfileData: UpdateProfileRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/updateProfile", updateProfileData);
}

export async function getProfileUser1(getProfileData: GetProfileRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/getProfile", getProfileData);
}

export async function getProfileUser(getProfileData: GetProfileRequest): Promise<ApiResponse> {
  return getFullJsonData<ApiResponse>("/socialapi/auth/getProfile", getProfileData);
}

export async function logOutUser(logOutData: LogOutRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/signout", logOutData);
}

export async function verifyUser(verifyData: VerificationRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/Verification", verifyData);
}

export async function resetPwdUser(resetPwdData: ResetPwdRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/PasswordUpdate", resetPwdData);
}

export async function changePwd(cahngePwdData: ChangePassward): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/changepassword", cahngePwdData);
}

export async function verifyOtp(verifyotpData: VerifyOtp): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/verifyotp", verifyotpData)
}

export async function sendOtp(sendotpData: SendOtp): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/sendotp", sendotpData)
}

export async function checkUserExist(queryParams: Checkuserexist): Promise<ApiResponse> {
  return getFullJsonData<ApiResponse>("/socialapi/auth/checkuserexist", queryParams)
}

export async function checkPinExist(queryParams: Verifypin): Promise<ApiResponse> {
  return getFullJsonData<ApiResponse>("api/getdetailsbypincode", queryParams)
}

export async function updateTnC(payload: UpdateTermsAndConditionsRequest): Promise<ApiResponse> {
  return postJsonData<ApiResponse>("/socialapi/auth/updateusertnc", payload);
}