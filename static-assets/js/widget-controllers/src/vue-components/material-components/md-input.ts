import Vue from 'vue';

export default function (componentName: string = 'md-input') {
    Vue.component<any, any, any, any>(componentName, {
        props: {
            id: String,
            name: String,
            type: String,
            className: String,
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
                if (this.type != 'date') {
                    return {
                        focusin: () => this.$data.isActive = true,
                        focusout: () => {
                            this.$emit("blurfired", true);
                            return this.$data.isActive = !this.value ? false : true
                        }
                    }
                }
            }
        },
        template: `
            <div class="form-element">
                <input
                    ref="input"
                    v-bind:type="type"
                    v-bind:value="value"
                    v-bind:id="id"
                    v-bind:name="name" 
                    v-on:input="$emit('input', $event.target.value);"
                    v-on="getFocusInOutEvent"
                    class="form-control" :class="{ 'warning': error }" />
                <label v-bind:for="id" :class="{ active: isActive, show: isActive }">{{ name }}</label>
                <span v-cloak  class="errordiv" :class="{show: error}">{{ error }}</span>
            </div>`,
        watch: {
            value: function (newVal, oldVal) {
                if (this.type != 'date') {
                    this.$data.isActive = newVal != "";
                }
            }
        },
        mounted() {
            if (this.$props.type == "date") {
                this.$data.isActive = true;
            }

        }
    });
}