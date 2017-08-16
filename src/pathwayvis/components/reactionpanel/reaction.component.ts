import "./reaction.component.scss";
import * as template from "./reaction.component.html";
import * as angular from "angular";
import {MapOptionService} from "../../services/mapoption.service";
import {AddedReaction, BiggReaction} from "../../types";
import {ActionsService} from "../../services/actions/actions.service";
import "jquery";


class ReactionComponentCtrl{
    public searchText: string;

    private $http: angular.IHttpService;
    private mapOptions: MapOptionService;
    private $scope: angular.IScope;
    private actions: ActionsService;
    constructor($http: angular.IHttpService,
                MapOptions: MapOptionService,
                $scope: angular.IScope,
                actions: ActionsService){
        this.$http = $http;
        this.mapOptions = MapOptions;
        this.$scope = $scope;
        this.actions = actions;
    }

    public getRemovedReactions(): string[]{
        return this.mapOptions.getRemovedReactions();
    }

    public onUndoClick(selectedReaction: string): void {
        const undoKnockoutAction = this.actions.getAction('reaction:knockout:undo');
        this.mapOptions.actionHandler(undoKnockoutAction, selectedReaction).then((response) => {
            this.mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
            this.mapOptions.setReactionData(response.fluxes);
            this.mapOptions.setRemovedReactions(response['removed-reactions']);
            this.$scope.$apply();
        });
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
                    let reaction = <AddedReaction>item;
                    reaction.reaction_string = response['reaction_string'];

                    let db_links = response['database_links'];
                    if(db_links){
                        let metanetx = db_links['MetaNetX (MNX) Equation'][0];
                        if(metanetx){
                            reaction.metanetx_id = metanetx['id'];
                        }
                    }
                    self.updateMapData(self.mapOptions.addReaction(reaction));
                });
            this.searchText = "";
        }
    }

    public getAddedReactions(): BiggReaction[]{
        return this.mapOptions.getAddedReactions()
    }

    public onReactionRemoveClick(bigg_id: string){
        this.updateMapData(this.mapOptions.removeReaction(bigg_id));
    }

    private updateMapData(promise): void{
        promise.then((response)=>{
            this.mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
            this.mapOptions.setReactionData(response.fluxes);
            this.mapOptions.setRemovedReactions(response['removed-reactions']);
            this.$scope.$apply();
        })
    }

}

export const ReactionComponent = {
    controller: ReactionComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),

}
