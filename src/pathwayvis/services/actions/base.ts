import { WSService } from "../ws";
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
  public ws: WSService;
  public shared: MapData;

  public callback(ws: WSService, $timeout: angular.ITimeoutService): any {

    const data = {
      'to-return': ['fluxes', 'growth-rate', 'removed-reactions', 'added-reactions', 'model'],
      'simulation-method': this.shared.method,
      'reactions-knockout': this.shared.removedReactions,
      'reactions-add': this.shared.addedReactions.map((r) => ({
        id: r.bigg_id,
        metabolites: r.metabolites,
      })),
    };

    return $timeout(() => {
      return ws.send(data);
    }, 0, false);
  }

  public canDisplay(context) {
    return context.type === 'map:reaction';
  }
}
