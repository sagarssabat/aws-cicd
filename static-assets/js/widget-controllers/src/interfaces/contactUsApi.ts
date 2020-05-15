export interface ContactUsRequest{
    grcaptcha:string;
    page_flag:string;
    send_mail:string;
    data:ContactUsData;
    teamSrcID?:string;
}

export interface ContactUsData {
    full_name: string;
    email_id: string;
    mobile: string;
    message: string;
    subject: string;
    send_email_id: string;
}