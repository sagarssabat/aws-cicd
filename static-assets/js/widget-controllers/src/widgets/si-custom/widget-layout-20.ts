import { Controller } from 'stimulus'
import VeeValidate from 'vee-validate'
import Vue from 'vue'
import { DigitalSurveyResponse, DigitalSurveyVueData } from './../../interfaces/digital-survey'
import { ApplicationObj } from './../../main'
import { isNull, postJsonData } from './../../util'

class WidgetLayout20 extends Controller {
    connect() {
        this.initVue();
    }

    async sendAPI(dataToSend: any): Promise<any> {
        return postJsonData<string>("/api/Insertcommondetails", dataToSend);
    }

    initVue() {
        let context = this;
        const dictionary = {
            en: {
                messages: {
                    required: function (fieldName: string) {
                        return "Field is required";
                    },
                    email: function () {
                        return "Invalid email";
                    },
                    is_not: function () {
                        return "Field is required"
                    }
                }
            }
        };

        let modelData: DigitalSurveyVueData = {
            gender: "",
            city: "",
            ageBracketdd: "",
            supportReason: "",
            favMIPlayer: "",
            miVisit: "",
            sectionEngage: "",
            facebookPlatform: "",
            paltanFacebookGroup: "",
            twitterPlatform: "",
            instagramPlatform: "",
            youtubePlatform: "",
            snapchatPlatform: "",
            websitePlatform: "",
            mobilePlatform: "",
            contentMI: "",
            likeContentMI: [],
            firstChoice: "",
            rateMIApp: "",
            engagingMI: "",
            videoMI: [],
            preferredDuration: "",
            contestedPolls: "",
            purchaseMI: "",

            globalMsgDiv: "",
            isSubmitDisabled: false,
            showLoader: false
        }

        VeeValidate.Validator.localize(dictionary);
        Vue.use(VeeValidate);

        let digiSurvey = new Vue({
            el: "#digitalSurveyForm",
            data: modelData,
            methods: {
                submitForm(e: Event) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this.$validator.validate().then(async () => {
                        if (this.errors.items.length == 0) {
                            let payloadToForward = {
                                "data": {
                                    "module_name": "Digital Survey",
                                    "user_data": {
                                        "gender": this.gender,
                                        "city": this.city,
                                        "age_bracket": this.ageBracketdd,
                                        "reason_for_supporting_mi": this.supportReason,
                                        "favourite_player": this.favMIPlayer,
                                        "mi_visit_frequency": this.miVisit,
                                        "most_engaging_section": this.sectionEngage,
                                        "facebook_rank": this.facebookPlatform,
                                        "facebookGroup_rank": this.paltanFacebookGroup,
                                        "twitter_rank": this.twitterPlatform,
                                        "instagram_rank": this.instagramPlatform,
                                        "youtube_rank": this.youtubePlatform,
                                        "snapchat_rank": this.snapchatPlatform,
                                        "website_rank": this.websitePlatform,
                                        "mobile_rank": this.mobilePlatform,
                                        "mi_social_visit_frequency": this.contentMI,
                                        "type_of_content": this.likeContentMI,
                                        "first_choice_of_live_match_updates": this.firstChoice,
                                        "scale": this.rateMIApp,
                                        "most_engaging_app_feature": this.engagingMI,
                                        "type_of_videos_enjoy_watching": this.videoMI,
                                        "preferred_duration_of_MITV_video": this.preferredDuration,
                                        "contests_and_polls": this.contestedPolls,
                                        "purchased_any_merchandise": this.purchaseMI
                                    }
                                }
                            };

                            this.isSubmitDisabled = true;
                            this.showLoader = true;

                            let responseData: DigitalSurveyResponse = await context.sendAPI(payloadToForward);
                            if (!isNull(responseData) && !isNull(responseData.content)) {

                                this.globalMsgDiv = "Thank you! Your form is successfully submitted.";
                                setTimeout(() => {
                                    location.reload();
                                }, 3500);
                            } else {
                                this.isSubmitDisabled = false;
                                this.globalMsgDiv = "Something went wrong, please try again.";
                            }

                            this.showLoader = false;
                        }
                    });
                },
                isScaleTill10(evt: any) {
                    evt = evt ? evt : window.event;
                    var charCode = evt.which ? evt.which : evt.keyCode;
                    if (
                        charCode > 31 &&
                        (charCode < 48 || charCode > 57) &&
                        charCode !== 46
                    ) {
                        evt.preventDefault();
                    } else {
                        if (!isNull(this.rateMIApp) && !isNaN(parseInt(this.rateMIApp))) {
                            if (this.rateMIApp.length > 1) {
                                evt.preventDefault();
                            }
                            let rateMiApp = parseInt(this.rateMIApp);
                            if ((rateMiApp < 1 && rateMiApp > 10)) {
                                evt.preventDefault();
                            }
                        } else {
                            return true;
                        }
                    }
                }
            }
        })
    }
}

export default () => ApplicationObj.register("si-custom--widget-layout-20", WidgetLayout20);