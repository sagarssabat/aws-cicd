import { ApplicationObj } from "./../../main";
import { CommentsReactions } from "../../vue-components/comments-reactions/comments-reactions"

class WidgetLayout11 extends CommentsReactions {

    connect() {
        this.loadReactionsWidget();
    }
}

export default () => ApplicationObj.register("si-detail--widget-layout-11", WidgetLayout11);