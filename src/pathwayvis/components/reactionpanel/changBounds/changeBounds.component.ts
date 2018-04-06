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
import { AddedReaction, BiggReaction } from "../../../types";
import { ActionsService } from "../../../services/actions/actions.service";
import { access } from "fs";

const DecafBiggProxy = 'https://api-staging.dd-decaf.eu/bigg/';

class ChangeBoundsController {
  public modelReactions = [];
  public changedReactions = [];

  private _mapOptions: MapOptionService;
  private _actions: ActionsService;

  constructor(
    mapOptions: MapOptionService,
    actions: ActionsService,
    $scope: angular.IScope) {
      this._mapOptions = mapOptions;
      this._actions = actions;

      const subscription = new Rx.Subscription();
      subscription.add(mapOptions.reactionsObservable.subscribe((reactions) => {
        this.modelReactions = reactions;
      }));

      subscription.add(mapOptions.changeBoundsObservable.subscribe((reactions) => {
        this.changedReactions = reactions;
      }));

      $scope.$on('$destroy', () => {
        subscription.unsubscribe();
      });
  }

  public changedBoundsSelectedItem(item) {
    if (!item) return;
    const changeBoundsAction = this._actions.getAction('reaction:bounds:do');

    this._mapOptions.actionHandler(changeBoundsAction, { id: item.id })
      .then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }

  public queryModelReactions(query: string): any[] {
    query = query.toLowerCase();
    return this.modelReactions.filter((reaction) => {
      return reaction.name.toLowerCase().includes(query)
        || reaction.id.toLowerCase().includes(query);
    });
  }

  public onUndoClick(selectedReaction: string): void {
    const undoKnockoutAction = this._actions.getAction('reaction:knockout:undo');
    this._mapOptions.actionHandler(undoKnockoutAction, { id: selectedReaction })
      .then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }

}

export const ChangeBoundsComponent = {
  controller: ChangeBoundsController,
  template: `
  <rp-panel-item
    on-item-select="$ctrl.removeReactionSelectedItem(item)"
    query-search="$ctrl.queryModelReactions(query)"
    placeholder="'Enter the reaction you want to remove'"
    missing-items="'No knocked out reactions'"
    header="'Removed reactions:'"
    items="$ctrl.removedReactions"
    on-remove-item="$ctrl.onUndoClick(item)">
    id-property="'id'">
  </rp-panel-item>`,
};
