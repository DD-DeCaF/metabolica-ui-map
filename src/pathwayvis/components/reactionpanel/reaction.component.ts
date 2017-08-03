import * as _ from 'lodash';
import "./reaction.component.scss";
import * as template from "./reaction.component.html";
import * as angular from "angular";
import { MapOptionService } from "../../services/mapoption.service";
import { AddedReaction, BiggReaction, Metabolite } from "../../types";
import { ActionsService } from "../../services/actions/actions.service";
import "jquery";

const BiggAPIBase = 'http://bigg.ucsd.edu/api/v2/';

class ReactionComponentCtrl {
  public searchText: string;

  private $http: angular.IHttpService;
  private mapOptions: MapOptionService;
  private $scope: angular.IScope;
  private actions: ActionsService;
  constructor($http: angular.IHttpService,
    mapOptions: MapOptionService,
    $scope: angular.IScope,
    actions: ActionsService) {
    this.$http = $http;
    this.mapOptions = mapOptions;
    this.$scope = $scope;
    this.actions = actions;
  }

  public getRemovedReactions(): string[] {
    return this.mapOptions.getRemovedReactions();
  }

  public onUndoClick(selectedReaction: string): void {
    const undoKnockoutAction = this.actions.getAction('reaction:knockout:undo');
    this.mapOptions.actionHandler(undoKnockoutAction, selectedReaction)
      .then(this.updateMapData.bind(this));
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
      const url = `${BiggAPIBase}${item.model_bigg_id.toLowerCase()}/reactions/${item.bigg_id}`;
      $.getJSON(url)
        .then((response) => {
          const metanetx_id = <string> _.get(response, 'database_links.MetaNetX (MNX) Equation.0.id');
          console.log('original metabolites: ', response.metabolites, 'response', response);
          const metabolites: Metabolite[] = response.metabolites.map((m) => {
            return <Metabolite> {
              bigg_id: m.bigg_id,
              compartment_bigg_id: m.compartment_bigg_id,
              coef: m.stoichiometry,
            };
          });
          const reaction = <AddedReaction> {...item,
            reaction_string: <string> response.reaction_string,
            metabolites,
            metanetx_id,
          };
          this.mapOptions.addReaction(reaction).then(this.updateMapData.bind(this));
        });
      this.searchText = "";
    }
  }

  public getAddedReactions(): BiggReaction[] {
    return this.mapOptions.getAddedReactions();
  }

  public onReactionRemoveClick(bigg_id: string) {
    this.mapOptions.removeReaction(bigg_id).then(this.updateMapData.bind(this));
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
