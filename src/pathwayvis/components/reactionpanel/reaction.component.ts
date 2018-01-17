import * as _ from 'lodash';
import * as template from "./reaction.component.html";
import * as angular from "angular";
import { MapOptionService } from "../../services/mapoption.service";
import { AddedReaction, BiggReaction } from "../../types";
import { ActionsService } from "../../services/actions/actions.service";
import * as $ from "jquery";
import { IHttpResponse } from 'angular';

const DecafBiggProxy = 'https://api-staging.dd-decaf.eu/bigg/';

class ReactionComponentCtrl {
  public addedReactions = [];
  public modelReactions = [];
  public removedReactions = [];

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

    mapOptions.reactionsObservable.subscribe((reactions) => {
      this.modelReactions = reactions;
    });

    mapOptions.addedReactionsObservable.subscribe((reactions) => {
      this.addedReactions = reactions;
    });

    mapOptions.removedReactionsObservable.subscribe((reactions) => {
      this.removedReactions = reactions;
    });
  }

  public onUndoClick(selectedReaction: string): void {
    const undoKnockoutAction = this.actions.getAction('reaction:knockout:undo');
    this.mapOptions.actionHandler(undoKnockoutAction, { id: selectedReaction })
      .then(this.updateMapData.bind(this));
  }

  public querySearch(query: string) {
    return this.$http.get(`${DecafBiggProxy}search?query=${query}&search_type=reactions`)
      .then((response: IHttpResponse<any>) => response.data.results);
  }

  public queryModelReactions(query: string): any[] {
    query = query.toLowerCase();
    return this.modelReactions.filter((reaction) => {
      return reaction.name.toLowerCase().includes(query)
        || reaction.id.toLowerCase().includes(query);
    });
  }

  public async selectedItemChange(item: BiggReaction) {
    if (!item) return;

    const response = await this.$http.get(`${DecafBiggProxy}${item.model_bigg_id.toLowerCase()}/reactions/${item.bigg_id}`);
    const responseData = (<any> response.data);
    const metanetx_id = <string> _.get(response, 'database_links.MetaNetX (MNX) Equation.0.id');
    const metabolites = Object.assign({}, ...responseData.metabolites.map((m) => {
      return {
        [`${m.bigg_id}_${m.compartment_bigg_id}`]: m.stoichiometry,
      };
    }));
    const reaction = <AddedReaction> {
      ...item,
      reaction_string: <string> responseData.reaction_string.replace("&#8652;", "<=>"),
      metabolites,
      metanetx_id,
    };
    this.mapOptions.addReaction(reaction).then(this.updateMapData.bind(this));
  }

  public removeReactionSelectedItem(item) {
    if (!item) return;
    const doKnockoutAction = this.actions.getAction('reaction:knockout:do');
    this.mapOptions.actionHandler(doKnockoutAction, { id: item.id })
      .then(this.updateMapData.bind(this));
  }

  public knockoutDisplay(item) {
    return item;
  }

  public addedReactionDisplay(item) {
    return item.name || item.id;
  }

  public onReactionRemoveClick({bigg_id}) {
    this.mapOptions.removeReaction(bigg_id).then(this.updateMapData.bind(this));
  }

  private updateMapData(response) {
    this.mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
    this.mapOptions.setReactionData(response.fluxes);
    this.mapOptions.setDataModel(response.model);
    this.mapOptions.setRemovedReactions(response['removed-reactions']);
  }
}

export const ReactionComponent = {
  controller: ReactionComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
