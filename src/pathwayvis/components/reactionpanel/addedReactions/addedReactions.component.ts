// Copyright 2018 Novo Nordisk Foundation Center for Biosustainability, DTU.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as angular from "angular";
import * as Rx from 'rxjs/Rx';

import { MapOptionService } from "../../../services/mapoption.service";
import { SharedService } from '../../../services/shared.service';
import { AddedReaction, BiggReaction } from "../../../types";

class AddedReactionsController {
  public addedReactions = [];

  private _$http: angular.IHttpService;
  private _mapOptions: MapOptionService;
  private _shared: SharedService;
  private _decafBiggProxy: string;

  constructor(
    $http: angular.IHttpService,
    mapOptions: MapOptionService,
    $scope: angular.IScope,
    decafBiggProxy: string,
    shared: SharedService) {
      this._$http = $http;
      this._mapOptions = mapOptions;
      this._shared = shared;
      this._decafBiggProxy = decafBiggProxy;

      const subscription = new Rx.Subscription();
      subscription.add(mapOptions.addedReactionsObservable.subscribe((reactions) => {
        this.addedReactions = reactions;
      }));

      $scope.$on('$destroy', () => {
        subscription.unsubscribe();
      });
  }

  public async selectedItemChange(item: BiggReaction) {
    if (!item) return;

    const url = `${this._decafBiggProxy}/${item.model_bigg_id.toLowerCase()}/reactions/${item.bigg_id}`;
    const biggResponse = await this._shared.async(this._$http.get(url));
    const responseData = (<any> biggResponse.data);
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
    this._shared.async(this._mapOptions.addReaction(reaction).then((response) => {
      this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
    }));
  }

  public querySearch(query: string) {
    return this._$http.get(`${this._decafBiggProxy}/search?query=${query}&search_type=reactions`)
      .then((response: angular.IHttpResponse<any>) => response.data.results);
  }

  public onReactionRemoveClick({bigg_id}) {
    this._mapOptions.removeReaction(bigg_id).then((response) => {
      this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
    });
  }

  public addedReactionDisplay(item) {
    return item.name || item.id;
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
