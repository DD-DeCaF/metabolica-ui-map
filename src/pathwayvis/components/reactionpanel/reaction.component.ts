import * as _ from 'lodash';
import "./reaction.component.scss";
import * as template from "./reaction.component.html";
import * as angular from "angular";
import { MapOptionService } from "../../services/mapoption.service";
import { AddedReaction, BiggReaction } from "../../types";
import { ActionsService } from "../../services/actions/actions.service";
import * as $ from "jquery";
import PHHB from './fakeBiggReactions/PHHB.json';
import TRPHYDRO4 from './fakeBiggReactions/TRPHYDRO4.json';
import DM_melatn_c from './fakeBiggReactions/DM_melatn_c.json';

const DecafBiggProxy = 'https://api-staging.dd-decaf.eu/bigg/';

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
    this.mapOptions.actionHandler(undoKnockoutAction, { id: selectedReaction })
      .then(this.updateMapData.bind(this));
  }

  public querySearch(query: string) {
    const url = `${DecafBiggProxy}search?query=${query}&search_type=reactions`;
    // Get rid of jquery
    // $http is configured to add Auth header to all requests.
    // This triggers a preflight check, the client sends an options
    // request, which cannot be handled by the bigg database.

    // return $.getJSON(url).then((response) => response.results);
    return $.getJSON(url).then((response) => {
      return [...response.results, PHHB, TRPHYDRO4, DM_melatn_c];
    });
  }

  public selectedItemChange(item: BiggReaction) {
    if (!item) return;
    let promise;
    if ((<any> item).fake) {
      promise = Promise.resolve(item);
    } else {
      const url = `${DecafBiggProxy}${item.model_bigg_id.toLowerCase()}/reactions/${item.bigg_id}`;
      promise = $.getJSON(url);
    }
    promise.then((response) => {
        this.$scope.$apply(() => {
          const metanetx_id = <string> _.get(response, 'database_links.MetaNetX (MNX) Equation.0.id');
          const metabolites = Object.assign({}, ...response.metabolites.map((m) => {
            return {
              [`${m.bigg_id}_${m.compartment_bigg_id}`]: m.stoichiometry,
            };
          }));
          const reaction = <AddedReaction> {
            ...item,
            reaction_string: <string> response.reaction_string.replace("&#8652;", "<=>"),
            metabolites,
            metanetx_id,
          };
          this.mapOptions.addReaction(reaction).then(this.updateMapData.bind(this));
        });
      });
    this.searchText = '';
  }

  public getAddedReactions(): BiggReaction[] {
    return this.mapOptions.getAddedReactions();
  }

  public onReactionRemoveClick(bigg_id: string) {
    this.mapOptions.removeReaction(bigg_id).then(this.updateMapData.bind(this));
  }

  private updateMapData(response) {
    // @matyasfodor move this to a central place -> mapOptions?
    this.$scope.$apply(() => {
      this.mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
      this.mapOptions.setReactionData(response.fluxes);
      this.mapOptions.setDataModel(response.model);
      this.mapOptions.setRemovedReactions(response['removed-reactions']);
    });
  }
}

export const ReactionComponent = {
  controller: ReactionComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
