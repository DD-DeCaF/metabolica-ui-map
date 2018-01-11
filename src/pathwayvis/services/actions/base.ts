import { WSService } from "../ws";
import { SharedService } from '../shared.service';

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

  public callback(ws: WSService, $timeout: angular.ITimeoutService, shared: SharedService): any {

    const data = {
      'to-return': ['fluxes', 'growth-rate', 'removed-reactions', 'added-reactions', 'model'],
      'simulation-method': this.shared.method,
      'reactions-knockout': this.shared.removedReactions,
      'reactions-add': this.shared.addedReactions.map((r) => ({
        id: r.bigg_id,
        metabolites: r.metabolites,
      })),
    };
    return ws.send(this.shared.model.uid, data);
  }

  public canDisplay(context) {
    return context.type === 'map:reaction';
  }
}
