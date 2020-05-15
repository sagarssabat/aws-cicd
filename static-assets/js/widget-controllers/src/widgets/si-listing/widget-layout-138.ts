import { ApplicationObj } from "./../../main";
import { Controller } from "stimulus";
import { isNull } from "../../util";
import { FilterValuesAppend } from "../../interfaces/filter-values-append"

declare global {
    interface Window {
        loadmore: any;
    }
}

class WidgetLayout138 extends Controller {
    articleListTarget: HTMLElement;
    buttonTarget: HTMLElement;
    selectedSeasonTarget: HTMLElement;
    selectedCategoryTarget: HTMLElement;
    selectedTeamTarget: HTMLElement;
    selectedCityTarget: HTMLElement;
    filterDivTarget: HTMLElement;
    miLoaderTarget: HTMLElement
    myDiv: any;
    dropdownURL: string;
    loadmore_url: string;
    hasButtonTarget: boolean;
    hasSelectedCategoryTarget: boolean;
    url_primary_stub: string;
    url_stub_to_add: string = "";
    button_url: string;
    url_obj: FilterValuesAppend = {
        isAppended_season: false,
        isAppended_category: false,
        val_season: "",
        val_category: "",
        val_team: "",
        val_city: "",
        filter: ""
    };
    loadmoreActive: boolean = true;

    static targets = ["button", "articleList", "selectedSeason", "selectedCategory", "selectedTeam", "selectedCity", "filterDiv", "miLoader"];

    connect() {
        this.url_primary_stub = "";
        this.url_primary_stub = $(this.selectedSeasonTarget).children('option:nth-child(2)').attr('url')!.split('extentities')[0] + "extentities=";
    }

    loadMoreFunc() {
        if (!this.loadmoreActive) {
            return false;
        }
        this.miLoaderTarget.classList.add('loading');
        this.myDiv = $(this.buttonTarget).parent().find('.article-list');
        this.loadmore_url = $(this.buttonTarget).attr('data-loadmore')!;
        if (!isNull(this.loadmore_url)) {
            fetch(this.loadmore_url)
                .then(Response => Response.text())
                .then(text => {
                    this.miLoaderTarget.classList.remove('loading');
                    let htmltext = $(text.trim()).find('.article-list').html();
                    $(this.buttonTarget).remove();
                    let button = $(text.trim()).find('.loadmorebutton')!;
                    if (typeof htmltext == "undefined" || htmltext.length <= 0) {
                        $(this.buttonTarget).remove();
                    }
                    this.myDiv.append(htmltext);
                    this.myDiv.after(button);
                });
        }
    }
    /**
     * @deprecated
     */
    urlGeneration(id: string, filterName: string) {
        if (id == undefined || id == null) {
            id = "";
        }
        if (filterName == "season") {
            this.url_obj.val_season = "" + id + "";
        } else if (filterName == "category") {
            this.url_obj.val_category = "" + id + "";
        }
        if (this.url_obj.val_season == "" && this.url_obj.val_category != "") {
            this.url_stub_to_add = "" + this.url_obj.val_category + "";
        } else if (this.url_obj.val_season != "" && this.url_obj.val_category == "") {
            this.url_stub_to_add = "" + this.url_obj.val_season + "";
        } else if (this.url_obj.val_season == "" && this.url_obj.val_category == "") {
            this.url_stub_to_add = "";
        } else {
            this.url_stub_to_add = "" + this.url_obj.val_season + "," + this.url_obj.val_category + "";
        }
        this.dropdownURL = this.url_primary_stub + this.url_stub_to_add;
    }
    urlGenerationDependency(id: string, filterName: string) {
        if (isNull(id)) {
            id = "";
        }
        if (filterName == "season") {
            this.url_obj.val_season = "" + id + "";
        } else if (filterName == "category") {
            this.url_obj.val_category = "" + id + "";
        }
        else if (filterName == "city") {
            this.url_obj.val_city = "" + id + "";
        }
        else if (filterName == "team") {
            this.url_obj.val_team = "" + id + "";
        }
        var param = [this.url_obj.val_category, this.url_obj.val_season, this.url_obj.val_city, this.url_obj.val_team].filter(Boolean).join(",");
        this.dropdownURL = this.url_primary_stub.concat(param.trim())

    }

    resetFilter(e: Event) {
        this.url_obj.val_season = ""
        this.url_obj.val_category = ""
        this.url_obj.val_city = ""
        this.url_obj.val_team = ""
        this.filterChange(e)
    }

    filterChange(e: Event) {
        this.loadmoreActive = false;
        var element = e.target as HTMLElement;
        if (element.tagName == "SELECT") {
            this.urlGenerationDependency($(e.target!).find('option:selected').attr('id')!, $(e.target!).attr('class')!.trim());
        }
        else {
            this.dropdownURL = this.url_primary_stub
        }
        this.myDiv = $(this.filterDivTarget).parents('.widget-layout-138');
        let context = this;
        if (!isNull(this.dropdownURL)) {
            fetch(this.dropdownURL)
                .then(Response => Response.text())
                .then(text => {
                    this.myDiv.html('');
                    let htmltext = $(text.trim()).find('.article-list').parents('.widget-layout-138').html();
                    this.myDiv.append(htmltext);
                    if (this.url_obj.val_season != "") {

                        $(this.selectedSeasonTarget).children('option[id="' + this.url_obj.val_season + '"]').prop('selected', true);
                    }
                    if (this.url_obj.val_category != "") {

                        $(this.selectedCategoryTarget).children('option[id="' + this.url_obj.val_category + '"]').prop('selected', true);
                    }
                    if (this.url_obj.val_team != "") {

                        $(this.selectedTeamTarget).children('option[id="' + this.url_obj.val_team + '"]').prop('selected', true);
                    }
                    if (this.url_obj.val_city != "") {

                        $(this.selectedCityTarget).children('option[id="' + this.url_obj.val_city + '"]').prop('selected', true);
                    }
                    context.loadmoreActive = true;
                });
        }
    }
}

export default () => ApplicationObj.register("si-listing--widget-layout-138", WidgetLayout138);