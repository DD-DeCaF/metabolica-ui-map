import * as angular from "angular";

import { MapOptionService } from "../../../services/mapoption.service";
import { AddedReaction, BiggReaction } from "../../../types";

const DecafBiggProxy = 'https://api-staging.dd-decaf.eu/bigg/';

class AddedReactionsController {
  public addedReactions = [];

  private _$http: angular.IHttpService;
  private _mapOptions: MapOptionService;

  constructor($http: angular.IHttpService,
    mapOptions: MapOptionService) {
    this._$http = $http;
    this._mapOptions = mapOptions;

    mapOptions.addedReactionsObservable.subscribe((reactions) => {
      this.addedReactions = reactions;
    });
  }

  public async selectedItemChange(item: BiggReaction) {
    if (!item) return;

    const response = await this._$http.get(`${DecafBiggProxy}${item.model_bigg_id.toLowerCase()}/reactions/${item.bigg_id}`);
    const responseData = (<any> response.data);
    let metanetx_id: string;
    try {
      metanetx_id = responseData.database_links['MetaNetX (MNX) Equation'][0].id;
    } catch (e) {
      metanetx_id = '';
    }
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
    this._mapOptions.addReaction(reaction).then(this.updateMapData.bind(this));
  }

  public querySearch(query: string) {
    return this._$http.get(`${DecafBiggProxy}search?query=${query}&search_type=reactions`)
      .then((response: angular.IHttpResponse<any>) => response.data.results);
  }

  public onReactionRemoveClick({bigg_id}) {
    this._mapOptions.removeReaction(bigg_id).then(this.updateMapData.bind(this));
  }

  public addedReactionDisplay(item) {
    return item.name || item.id;
  }

  private updateMapData(response) {
    this._mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
    this._mapOptions.setReactionData(response.fluxes);
    this._mapOptions.setDataModel(response.model);
    this._mapOptions.setRemovedReactions(response['removed-reactions']);
  }
}

export const AddedReactionsComponent = {
  controller: AddedReactionsController,
  template: `
  <rp-panel-item
    on-item-select="$ctrl.selectedItemChange(item)"
    query-search="$ctrl.querySearch(query)"
    placeholder="'Enter the reaction you want to add'"
    missing-items="'No added reactions'"
    header="'Added reactions:'"
    items="$ctrl.addedReactions"
    on-remove-item="$ctrl.onReactionRemoveClick(item)"
    item-display="$ctrl.addedReactionDisplay(item)"
    id-property="'bigg_id'">
  </rp-panel-item>`,
};
