import {WSService} from "../ws";
import {MapData} from "../../types";
/**
 * Abstract class for Action resources.
 */
export abstract class Action {
    public label: string;
    public type: string;
    public abstract canDisplay(context): boolean;
    public abstract callback(... args): void;
}

/**
 * Abstract class for Reaction actions with predefined context type
 */
export abstract class ReactionAction extends Action {
    public ws: WSService;
    public shared: MapData;

    // @ngInject
    public callback(ws: WSService, $timeout: angular.ITimeoutService): any {
        let addedReactions = [];
        this.shared.addedReactions.forEach((item)=>{
            addedReactions.push(item.metanetx_id);
        });
        console.log(addedReactions);

        const data = {
            'to-return': ['fluxes', 'growth-rate', 'removed-reactions'],
            'simulation-method': this.shared.method,
            'reactions-knockout': this.shared.removedReactions,
            // 'reactions-add': addedReactions
        };

        return $timeout(() => {
            return ws.send(data).then((data) => {
                return data;
            }, (error) => {
                // TODO: set error
            });
        }, 0, false);
    }

    public canDisplay(context) {
        return context.type === 'map:reaction';
    }
}
