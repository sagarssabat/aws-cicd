import Vue from 'vue';
import { postJsonData, getCookieJSON } from '../../util';
import { URC_Cookie } from '../../models/social-api-model';

export default function (componentName: string = 's3-profile-img-input') {

    Vue.component(componentName, {
        props: {
            id: String,
            name: String,
            type: String,
            className: String,
            value: {
                type: String,
                default: null
            },
            userguid: {
                type: String,
                default: ""
            },
            username: {
                type: String,
                default: ""
            },
            error: {
                type: String,
                default: null
            }
        },
        data: function () {
            return {
                imgDomain: '',
                avtarImgPath: 'static-assets/images/cssimages/default-avatar.png'
            };
        },
        $_veeValidate: {
            // value getter
            value() {
                return this.value;
            },
            // name getter
            name() {
                return this.name;
            }
        },
        methods: {
            uploadFile(e: Event) {
                var reader = new FileReader();
                reader.onload = async (event: Event) => {
                    var objecttosend = {
                        imageName: (e.target as any).files[0].name,
                        imageUrl: (event.target as any).result,
                        imageJson: "1",
                        userguid: getCookieJSON<URC_Cookie>("_URC")!.user_guid,
                        username: this.username,
                        isCustom: 1
                    };
                    let res = await postJsonData<any>("/socialapi/auth/imagepost", objecttosend);
                    console.log('image' + res);
                    this.$data.imgDomain = res[0].imgdomain
                    this.$emit('input', res[0].imagePath + res[0].imageName);
                    this.$emit('image-uploaded');
                }
                reader.readAsDataURL((e.target as any).files[0]);
            }
        },
        template: ` 
                    <div class="user-profile">
                        <div class="img-box">
                            <img :src="imgDomain + value || imgDomain + avtarImgPath">
                            <div class="avtar-edit">
                                <label :for="id">i</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    v-bind:id="id"    
                                    v-bind:name="name"
                                    v-on:change="uploadFile"
                                    class="" :class="{ 'warning': error }" />
                            </div>               
                        </div>
                        <div class="user-name">
                        <p>{{username}}</p>
                      </div>
                    </div>`
    });
}