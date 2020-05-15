export interface SocialShareObject {
    url: string,
    title: string,
    description: string,
    imgPath: string
}

export enum ShareType {
    FB = 'fb',
    TWITTER = 'twitter',
    WHATSAPP = 'whatsapp'
}