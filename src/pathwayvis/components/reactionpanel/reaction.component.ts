/**
 * Created by Danny on 7/4/2017.
 */
/**
 * Created by dandann on 03/07/2017.
 */
import "./reaction.component.scss";
import * as template from "./reaction.component.html";
import * as angular from "angular";
import {MapOptionService} from "../../services/mapoption.service";
import {AddedReaction, BiggReaction} from "../../types";
/**
 * Created by dandann on 15/03/2017.
 */


class ReactionComponentCtrl{
    searchText: string;
    private $http: angular.IHttpService;
    private mapOptions: MapOptionService;
    constructor($http: angular.IHttpService, MapOptions: MapOptionService){
        this.$http = $http;
        this.mapOptions = MapOptions;
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
                    self.mapOptions.getMapData().addedReactions.push(reaction);
                });
            this.searchText = "";
        }
    }

    /**
     * Create filter function for a query string
     */
    public createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };

    }

    public getAddedReactions(): BiggReaction[]{
        return this.mapOptions.getAddedReactions()
    }

    public onReactionRemoveClick(bigg_id: string){
        for(let i = 0; i < this.mapOptions.getMapData().addedReactions.length; i++) {
            if(this.mapOptions.getMapData().addedReactions[i].bigg_id == bigg_id) {
                console.log('removed: ', this.mapOptions.getMapData().addedReactions[i].metanetx_id);
                this.mapOptions.getMapData().addedReactions.splice(i, 1);
                break;
            }
        }
    }

}

export const ReactionComponent = {
    controller: ReactionComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),

}
