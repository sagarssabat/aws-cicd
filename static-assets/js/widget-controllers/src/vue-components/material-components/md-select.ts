import Vue from 'vue';

export default function (componentName: string = 'md-select') {
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
            getMouseOverOutEvent() {
                return {
                    focusin: () => this.$data.isActive = true,
                    focusout: () => this.$data.isActive = !this.value ? false : true
                }
            }
        },
        template: ` <div class="select-box form-element">
                    <label v-bind:for="id" :class="{ active: isActive ,show:isActive }">{{ name }}</label>
                        <select 
                        ref="select"
                        v-bind:name="name"
                        v-bind:id="id" 
                        v-bind:value="value"
                        v-on:input="$emit('input', $event.target.value);$emit('change', $event.target.value);"
                        v-on="getMouseOverOutEvent">
                            <slot></slot> 
                        </select>    
                        <span v-cloak  class="errordiv" :class="{show: error}">{{ error }}</span>    
                </div>`,
        watch: {
            value: function (newVal, oldVal) {
                if (newVal === "") {
                    this.$data.isActive = false
                }
            }
        },
    });
}