
export interface SumbitPollRequest {
    data: SubmitPollData
}

export interface SubmitPollData {
    user_guid: string,
    poll_id: string,
    polloption: SubmitPollOption[]
}
export interface SubmitPollOption {
    option_id: string
}

export interface GetPollDetailQueryParams {
    spgnnum: number,
    sitem: number,
    user_guid: string
}

export interface FanZoneApiResponse {
    data: PollData[],
    remaining_vote_cnt: string
}

export interface PollData {
    pollid: string,
    alias: string,
    title?: string,
    poll_desc: string,
    poll_desc_parsed?: PollDescriptionParsed,
    poll_type: string,
    meta_info?: string,
    showinweb: string,
    showinmobile: string,
    showinapp: string,
    image_path: string,
    start_date: string,
    end_date: string,
    image_file_name: string,
    poll_option: PollOption[],
    poll_response: any[],
    total_response: string
}

export interface PollOption {
    poll_option_id: string,
    option: string,
    optionParsed?: PollOptionParsed,
    option_order: string,
    response_count: string
    poll_percentage: number
    user_vote: string
}

export interface PollOptionParsed {
    order: number,
    pid: number,
    player: string,
    pos: string,
    position: string,
    runs: string,
    wickets: string,
    balls: string,
    runsGiven: string,
    title: string,
    imgUrl: string,
    videoId: string
}

export interface VueData {
    userGuid: string,
    playerCards: PollOption[],
    matchLists: PollDescriptionParsed[],
    dataMap: Map<string, PollData>,
    pollData: PollData
    matchPollId: string,
    isDisplay: string,
    isPollEnded: boolean,
    isMobile: boolean,
    isAutoPlay: string,
    videoUrl: string,
    pollWinnerName?: string,
    pollWinnerPercentage?: string,
    pollWinnerStats?: string,
    pollWinnerImgName?: string,
    pollWinnerTitle?: string,
    pollWinnerImgUrl?: string,
    pollWinnerOrder?: string,
    pollWinnerVideoId?: string,
    winner?: PollOption,
    runnerUps?: PollOption[]
}

export interface PollDescriptionParsed {
    optionName: string,
    hid: string,
    homeTeam: string,
    homeShort: string,
    aid: string,
    awayTeam: string,
    awayShort: string,
    start_date: string,
    end_date: string,
    pollId?: string
}

export interface FanZoneApiSubmitResponse {
    status: number
    content: Contentdata
}

export interface Contentdata {
    data: DataFields
}

export interface DataFields {
    poll_id: string,
    poll_option: PollOptionArray[],
    total_responses: string,
    gift_id: string,
    gift_name: string
}

export interface PollOptionArray {
    option_id: string,
    response_count: string
}

export enum PlayerType {
    Batsman = "Batsman",
    AllRounder = "All-Rounder",
    Bowler = "Bowler"
}