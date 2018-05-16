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

import { MapOptionService } from "../../../../services/mapoption.service";
import { ActionsService } from "../../../../services/actions/actions.service";
import * as template from "./objectivePanel.component.html";
import "./objectivePanel.component.scss";


class ObjectivePanelController {
  public objectiveDirection = 'max';
  private _mapOptions: MapOptionService;
  private _actions: ActionsService;
  public item: any;
  public switchValue: Boolean;

  constructor(
    mapOptions: MapOptionService,
    actions: ActionsService,
    $scope: angular.IScope) {
    this._mapOptions = mapOptions;
    this._actions = actions;


    const subscription = new Rx.Subscription();

    subscription.add(mapOptions.objectiveDirectionObservable.subscribe((reactions) => {
      this.objectiveDirection = reactions;
    }));

    $scope.$on('$destroy', () => {
      subscription.unsubscribe();
    });
  }

  public onUndoClick(selectedReaction: string): void {
    const undoObjectiveAction = this._actions.getAction('reaction:objective:undo');
    this._mapOptions.setObjectiveReaction(null);
    this._mapOptions.actionHandler(undoObjectiveAction, { id: selectedReaction })
      .then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }

  public changeDirection(direction) {
    const changeDirectionAction = this._actions.getAction(direction === 'min' ? 'reaction:minimize:do' : 'reaction:maximize:do');
    this._mapOptions.actionHandler(changeDirectionAction, { id: this.item })
      .then((response) => {
          this._mapOptions.setObjectiveDirection(direction);
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }

}

export const ObjectivePanelComponent = {
  controller: ObjectivePanelController,
  template: template.toString(),
  bindings: {
    item: '<?',
  },
};
