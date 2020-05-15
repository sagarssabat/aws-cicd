import { ApplicationObj } from "./../../main";
import { CommentsReactions } from "../../vue-components/comments-reactions/comments-reactions"

class WidgetLayout139 extends CommentsReactions {

    connect() {
        this.loadReactionsWidget();
    }
}

export default () => ApplicationObj.register("si-listing--widget-layout-139", WidgetLayout139);