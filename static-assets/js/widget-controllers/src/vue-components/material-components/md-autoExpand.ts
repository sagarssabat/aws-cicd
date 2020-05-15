import Vue from 'vue';
import Component from 'vue-class-component';


@Component({})
export default class resizableTextarea extends Vue {

    resizeTextarea(event: any) {
        event.target.style.height = 'auto'
        event.target.style.height = (event.target.scrollHeight) + 'px'
    }
    mounted() {
        this.$nextTick(() => {
            this.$el.setAttribute('style', 'height:' + (this.$el.scrollHeight) + 'px;overflow-y:hidden;')
        })

        this.$el.addEventListener('input', this.resizeTextarea)
    }
    beforeDestroy() {
        this.$el.removeEventListener('input', this.resizeTextarea)
    }
    render() {
        return this.$slots.default![0];
    }
}
