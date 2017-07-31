import "./reaction.component.scss";
import * as template from "./reaction.component.html";
import * as angular from "angular";
import { MapOptionService } from "../../services/mapoption.service";
import { AddedReaction, BiggReaction } from "../../types";
import { ActionsService } from "../../services/actions/actions.service";
import "jquery";

// @matyasfodor:
// Fix indentation
// Add linter

const BiggAPIBase = 'http://bigg.ucsd.edu/api/v2/';

class ReactionComponentCtrl {
  public searchText: string;

  private $http: angular.IHttpService;
  private mapOptions: MapOptionService;
  private $scope: angular.IScope;
  private actions: ActionsService;
  constructor($http: angular.IHttpService,
    MapOptions: MapOptionService,
    $scope: angular.IScope,
    actions: ActionsService) {
    this.$http = $http;
    this.mapOptions = MapOptions;
    this.$scope = $scope;
    this.actions = actions;
  }

  public getRemovedReactions(): string[] {
    return this.mapOptions.getRemovedReactions();
  }

  public onUndoClick(selectedReaction: string): void {
    const undoKnockoutAction = this.actions.getAction('reaction:knockout:undo');
    this.mapOptions.actionHandler(undoKnockoutAction, selectedReaction)
      .then(this.updateMapData);
  }

  public querySearch(query: string) {
    // Use template string
    // Use a constant for the API root
    let url = `${BiggAPIBase}search?query=${query}&search_type=reactions`;
    // Get rid of jquery
    return $.getJSON(url).then((response) => response.results);
  }

  public selectedItemChange(item: BiggReaction) {
    if (item) {
      let url = `${BiggAPIBase}${item.model_bigg_id.toLowerCase()}/reactions/${item.bigg_id}`;
      $.getJSON(url)
        .then((response) => {
          let reaction = <AddedReaction> item;
          reaction.reaction_string = response['reaction_string'];

          const db_links = response['database_links'];
          if (db_links) {
            const metanetx = db_links['MetaNetX (MNX) Equation'][0];
            if (metanetx) {
              reaction.metanetx_id = metanetx['id'];
            }
          }
          this.mapOptions.addReaction(reaction).then(this.updateMapData);
        });
      this.searchText = "";
    }
  }

  public getAddedReactions(): BiggReaction[] {
    return this.mapOptions.getAddedReactions();
  }

  public onReactionRemoveClick(bigg_id: string) {
    this.mapOptions.removeReaction(bigg_id).then(this.updateMapData);
  }

  private updateMapData(response) {
    this.mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
    this.mapOptions.setReactionData(response.fluxes);
    this.mapOptions.setRemovedReactions(response['removed-reactions']);
    this.$scope.$apply();
  }
}

export const ReactionComponent = {
  controller: ReactionComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
