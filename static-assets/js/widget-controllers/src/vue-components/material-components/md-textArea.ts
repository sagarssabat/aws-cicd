import Vue from 'vue';
import resizableTextarea from './md-autoExpand';

export default function (componentName: string = 'md-text-area') {
    Vue.component(componentName, {
        props: {
            id: String,
            name: String,
            value: {
                type: String,
                default: null
            },
            error: {
                type: String,
                default: null
            }
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
        data: function () {
            return {
                isActive: false
            };
        },
        computed: {
            getFocusInOutEvent() {
                return {
                    focusin: () => this.$data.isActive = true,
                    focusout: () => this.$data.isActive = !this.value ? false : true
                }
            }
        },
        template: ` <div class="form-element">
                    <label v-bind:for="id" :class="{ active: isActive ,show:isActive }">{{ name }}</label>
                    <resizable-textarea>
                        <textarea
                            ref="messageBox"
                            v-bind:value="value"
                            v-bind:id="id"
                            v-bind:name="name" 
                            v-on:input="$emit('input', $event.target.value);"
                            v-on="getFocusInOutEvent"
                            class="form-control" :class="{ 'warning': error }" />
                        </textarea>
                    </resizable-textarea>
                    <span v-cloak  class="errordiv" :class="{show: error}">{{ error }}</span>
                </div>`,
        watch: {

        },
        components: {
            "resizable-textarea": resizableTextarea
        }
    });
}