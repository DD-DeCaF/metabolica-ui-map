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
import { ActionsService } from "../../../services/actions/actions.service";

class ObjectivesController {
  public modelReactions = [];
  public objectiveReaction: string = null;
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

      subscription.add(mapOptions.objectiveReactionObservable.subscribe((reaction) => {
        this.objectiveReaction = reaction;
      }));

      $scope.$on('$destroy', () => {
        subscription.unsubscribe();
      });
  }

  public queryModelReactions(query: string): any[] {
    query = query.toLowerCase();
    return this.modelReactions.filter((reaction) => {
      return reaction.name.toLowerCase().includes(query)
        || reaction.id.toLowerCase().includes(query);
    });
  }

  public setAsObjectiveSelectedItem(item) {
    if (!item) return;
    const doObjectiveAction = this._actions.getAction('reaction:objective:do');
    this._mapOptions.setObjectiveReaction(item.id);
    this._mapOptions.actionHandler(doObjectiveAction, { id: item.id })
      .then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }

  public onUndoClick(selectedReaction: string): void {
    const undoObjectiveAction = this._actions.getAction('reaction:objective:undo');
    this._mapOptions.setObjectiveReaction(null);
    this.objectiveReaction = null;
    this._mapOptions.actionHandler(undoObjectiveAction, { id: selectedReaction })
      .then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }


}

export const ObjectivesComponent = {
  controller: ObjectivesController,
  template: `
  <rp-panel-item
    on-item-select="$ctrl.setAsObjectiveSelectedItem(item)"
    query-search="$ctrl.queryModelReactions(query)"
    placeholder="'Enter the reaction to set as objective'"
    missing-items="'Nothing as objective'"
    header="'Objective:'"
    item="$ctrl.objectiveReaction"
    on-remove-item="$ctrl.onUndoClick(item)">
    id-property="'id'">
  </rp-panel-item>`,
};
