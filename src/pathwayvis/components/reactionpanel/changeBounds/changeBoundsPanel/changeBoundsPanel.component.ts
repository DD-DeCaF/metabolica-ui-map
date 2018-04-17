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
import { AddedReaction, BiggReaction, ChangedReaction } from "../../../../types";
import { ActionsService } from "../../../../services/actions/actions.service";
import { access } from "fs";
import { SharedService } from '../../../../services/shared.service';
import * as template from "./changeBoundsPanel.component.html";
import "./changeBoundsPanel.component.scss";

const DecafBiggProxy = 'https://api-staging.dd-decaf.eu/bigg/';

class ChangeBoundsPanelController {
  public modelReactions = [];
  public changedReactions = [];
  public changeBounds = true;
  private _mapOptions: MapOptionService;
  private _actions: ActionsService;
  private $scope: angular.IScope;
  public clickedItem: string;
  public lowerbound: number;
  public upperbound: number;
  public items: any;

  constructor(
    mapOptions: MapOptionService,
    actions: ActionsService,
    $scope: angular.IScope) {
    this._mapOptions = mapOptions;
    this._actions = actions;
    this.$scope = $scope;

    const subscription = new Rx.Subscription();
    subscription.add(mapOptions.reactionsObservable.subscribe((reactions) => {
      this.modelReactions = reactions;
    }));

    subscription.add(mapOptions.changeReactionsObservable.subscribe((reactions) => {
      this.changedReactions = reactions;
      this.updateElementSelected();
    }));

    $scope.$on('$destroy', () => {
      subscription.unsubscribe();
    });
  }

  public onResetBounds(selectedReaction): void {
    const resetBounds = this._actions.getAction('reaction:bounds:undo');
    this._mapOptions.actionHandler(resetBounds, { id: selectedReaction.item.id })
      .then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }

  public onApplyBounds(selectedReaction): void {
    const changeBoundsAction = this._actions.getAction('reaction:bounds:do');
    const bounds = { lower: 0, upper: 0 };
    bounds.lower = this.lowerbound;
    bounds.upper = this.upperbound;
    this._mapOptions.actionHandler(changeBoundsAction, { id: selectedReaction.item.id, bounds })
      .then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
      });
  }

  public clickedItemFunction(item) {
    this.clickedItem = item.item.id;
    this.lowerbound = item.item.lower_bound;
    this.upperbound = item.item.upper_bound;
  }

  public changedReactionDisplay(item) {
    return item.id;
  }

  public showFunction(item, first) {
    return this.clickedItem === item.id || (first && !this.clickedItem) || this.items.length === 1;
  }

  public updateElementSelected() {
    if (this.changedReactions.length === 1) {
      this.clickedItem = this.changedReactions[0].id;
      this.lowerbound = this.changedReactions[0].lower_bound;
      this.upperbound = this.changedReactions[0].upper_bound;
    }
  }
}

export const ChangeBoundsPanelComponent = {
  controller: ChangeBoundsPanelController,
  template: template.toString(),
  bindings: {
    items: '<?',
  },
};
