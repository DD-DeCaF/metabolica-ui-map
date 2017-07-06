import "./reaction.component.scss";
import * as template from "./reaction.component.html";
import * as angular from "angular";
import {MapOptionService} from "../../services/mapoption.service";
import {AddedReaction, BiggReaction} from "../../types";
import {WSService} from "../../services/ws";


class ReactionComponentCtrl{
    public searchText: string;

    private ws: WSService;
    private $http: angular.IHttpService;
    private mapOptions: MapOptionService;
    constructor($http: angular.IHttpService, MapOptions: MapOptionService, ws: WSService){
        this.$http = $http;
        this.mapOptions = MapOptions;
        this.ws = ws;
    }

    public querySearch (query : string){
        let url = 'http://bigg.ucsd.edu/api/v2/search?query=' + query +'&search_type=reactions';
        return $.getJSON(url).then(function(response){
            return response['results']
        })
    }

    public selectedItemChange(item: BiggReaction) {
        let self = this;
        if(item){
            let url = 'http://bigg.ucsd.edu/api/v2/' + item.model_bigg_id.toLowerCase() + '/reactions/' + item.bigg_id
            $.getJSON(url)
                .then(function (response) {
                    console.log(response);
                    let reaction = <AddedReaction>item;
                    reaction.reaction_string = response['reaction_string'];

                    let db_links = response['database_links'];
                    if(db_links){
                        let metanetx = db_links['MetaNetX (MNX) Equation'][0];
                        if(metanetx){
                            reaction.metanetx_id = metanetx['id'];
                        }
                    }
                    self.mapOptions.addReaction(reaction);
                });
            this.searchText = "";
        }
    }

    public getAddedReactions(): BiggReaction[]{
        return this.mapOptions.getAddedReactions()
    }

    public onReactionRemoveClick(bigg_id: string){
        this.mapOptions.removeReaction(bigg_id);
    }
}

export const ReactionComponent = {
    controller: ReactionComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),

}
