export interface DigitalSurveyVueData {
    gender: string,
    city: string,
    ageBracketdd: string,
    supportReason: string,
    favMIPlayer: string,
    miVisit: string,
    sectionEngage: string,
    facebookPlatform: string,
    paltanFacebookGroup: string,
    twitterPlatform: string,
    instagramPlatform: string,
    youtubePlatform: string,
    snapchatPlatform: string,
    websitePlatform: string,
    mobilePlatform: string,
    contentMI: string,
    likeContentMI: string[],
    firstChoice: string,
    rateMIApp: string,
    engagingMI: string,
    videoMI: string[],
    preferredDuration: string,
    contestedPolls: string,
    purchaseMI: string,

    globalMsgDiv: string,
    isSubmitDisabled: boolean,
    showLoader: boolean
}

export interface DigitalSurveyUserData {
    gender: string,
    city: string,
    age_bracket: string,
    reason_for_supporting_mi: string,
    favourite_player: string,
    mi_visit_frequency: string,
    most_engaging_section: string,
    facebook_rank: string,
    facebookGroup_rank: string,
    twitter_rank: string,
    instagram_rank: string,
    youtube_rank: string,
    snapchat_rank: string,
    website_rank: string,
    mobile_rank: string,
    mi_social_visit_frequency: string,
    type_of_content: string,
    first_choice_of_live_match_updates: string,
    scale: string,
    most_engaging_app_feature: string,
    type_of_videos_enjoy_watching: string,
    preferred_duration_of_MITV_video: string,
    contests_and_polls: string,
    purchased_any_merchandise: string
}

export interface DigitalSurveyData {
    module_name: string,
    user_data: DigitalSurveyUserData
}

export interface DigitalSurveyPayload {
    data: DigitalSurveyData
}

export interface DigitalSurveyResponse {
    content: DigitalSurveyPayload
}