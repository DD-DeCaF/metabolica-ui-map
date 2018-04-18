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

import { ConnectionsService } from '../connections';

import { MapData } from "../../types";
/**
 * Abstract class for Action resources.
 */
export abstract class Action {
  public label: string;
  public type: string;
  public abstract canDisplay(context): boolean;
  public abstract callback(...args): void;
}

/**
 * Abstract class for Reaction actions with predefined context type
 */
export abstract class ReactionAction extends Action {
  public shared: MapData;
  public cardId: number;

  public callback(
    connections: ConnectionsService,
    $timeout: angular.ITimeoutService,
  ): any {
    const data = {
      'to-return': ['fluxes', 'growth-rate', 'removed-reactions', 'added-reactions', 'measured-reactions', 'model'],
      'simulation-method': this.shared.method,
      'measured-reactions': this.shared.changedReactions,
      'reactions-knockout': this.shared.removedReactions,
      'reactions-add': this.shared.addedReactions.map((r) => ({
          id: r.bigg_id,
          metabolites: r.metabolites,
        })),
      // 'objective': this.shared.objectiveReaction,
    };

    // this one is needed, because the backend cannot handle null as objective atm.
    if (this.shared.objectiveReaction) {
      data['objective'] = this.shared.objectiveReaction;
    }
    if (!this.shared.model.uid) {
      throw new Error('Model uid is required');
    }
    return connections.send(this.shared.model.uid, data, this.cardId);
  }

  public canDisplay(context) {
    return context.type === 'map:reaction';
  }
}
