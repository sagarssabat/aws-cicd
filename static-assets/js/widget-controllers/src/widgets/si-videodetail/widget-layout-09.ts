import { ApplicationObj } from "./../../main";
import { CommentsReactions } from "../../vue-components/comments-reactions/comments-reactions"

class WidgetLayout09 extends CommentsReactions {

    connect() {
        this.loadReactionsWidget();
    }
}

export default () => ApplicationObj.register("si-videodetail--widget-layout-09", WidgetLayout09);