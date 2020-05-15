export interface Error {
    code?: any;
    message?: any;
}

export interface User {
    name: string;
    edition?: any;
    favourite_club?: any;
    social_user_image?: string;
    mobile_no?: string;
    dob: string;
    state_id?: string;
    state?: string;
    city_id?: string;
    city?: string;
    country_id?: string;
    gender?: string;
    profile_completion_percentage?: string
    address?: string
    campaign_id?: string
    campaign_json?: campaign_data
}

export interface Data {
    user_guid?: any;
    status: string;
    email_id: string;
    failed_attempts?: any;
    unlock_date?: any;
    message: string;
    error: Error;
    user: User;
    is_first_login: string;
    is_app?: string;
    is_custom_image: string;
    old_profile_img_url?: string;
    token?: string;
    epoch_timestamp?: string;
    gift_id: string
    gift_name: string;
    otp: number;
}

export interface campaign_data {
    expiry_date?: string
    product_name?: string
    status?: string
    date_of_dispatch: string
    service_provider: string
    aw_bill_number: string
    invoice_link: string
    courier_status: string

}

export interface ApiResponse {
    data: Data;
}

export interface RegisterData {
    email_id: string;
    otp?: string;
    password: string;
    confirm_password: string;
    user: User;
    is_app?: number;
    captcha?: string;
}

export interface RegisterRequest {
    data: RegisterData;
}

export interface SignIndata {
    email_id: string;
    password: string;
    is_app?: number;
    captcha?: string;
}

export interface SignInRequest {
    data: SignIndata;
}

export interface ForgotPwdData {
    email_id: string;
    is_app?: number;
    captcha?: string;
}

export interface ForgotPwdRequest {
    data: ForgotPwdData;
}

export interface UpdateProfileRequest {
    data: UpdateProfileData
}

export interface UpdateProfileData {
    user_guid: string;
    token: string;
    epoch_timestamp: string;
    email_id: string;
    user: User;
    is_app?: number;
    captcha: string;
    is_custom_image?: string;
}

export interface GetProfileRequest {
    token: string
}

export interface GetProfileData {
    user_guid: string;
}

export interface LogOutRequest {
    data: LogOutData
}

export interface LogOutData {
    user_guid: string;
}

export interface VerificationRequest {
    data: VerificationData
}

export interface VerificationData {
    verification_key: string;
}

export interface ResetPwdRequest {
    data: ResetPwdData
}

export interface ResetPwdData {
    reset_key: string,
    password: string,
    confirm_password: string,

}

export interface ChangePassward {
    data: ChangePwdInner
}

export interface ChangePwdInner {
    user_guid: string,
    password: string,
    confirm_password: string,
    old_password: string,
    captcha: string
}
export interface VerifyOtp {
    data: VerifyOtpInner
}

export interface VerifyOtpInner {
    mobile_no: string,
    otp: string
}

export interface SendOtp {
    data: SendOtpInner
}

export interface SendOtpInner {
    mobile_no: string
}


export interface URC_Cookie {
    user_guid: string;
    name: string;
    email_id: string;
    is_first_login: string;
    favourite_club: string;
    edition: string;
    status: string;
    is_app?: string;
    is_custom_image: string;
    social_user_image: string;
}

export interface Checkuserexist {
    email_id?: string,
    mobile_no?: string
}

export interface Verifypin {
    pincode: string
}

export interface UpdateTermsAndConditionsRequest {
    data: UpdateTnCInnerData
}

export interface UpdateTnCInnerData {
    user_guid: string;
    otp: string;
    is_active: string;
    user: UpdateTnCInnerDataUser
}

export interface UpdateTnCInnerDataUser {
    mobile_no: string
}