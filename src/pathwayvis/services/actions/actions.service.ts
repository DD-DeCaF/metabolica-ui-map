import * as _ from 'lodash';

import { Action, ReactionAction, ReactionSetAsObjectiveAction } from './base';
import { SharedService } from '../shared.service';
import * as types from '../../types';

/**
 * Creates @registerAction decorator that is used for registering new actions
 */
export let actionsList = [];
export function registerAction(ActionClass) {
  const action = new ActionClass();
  actionsList.push(action);
}

/**
 * Actions service provides all registered actions as injectable service.
 */
export class ActionsService {
  private $injector: angular.auto.IInjectorService;
  private _q: angular.IQService;
  private _shared: SharedService;

  constructor($injector: angular.auto.IInjectorService, $q: angular.IQService, shared: SharedService) {
    this.$injector = $injector;
    this._q = $q;
    this._shared = shared;
  }

  /**
   * Returns list of all actions filtered by context
   * @param  {[type]} context Object used to filter actions by
   * @return {types.Action[]} List of actions
   */
  public getList(context): types.Action[] {
    return actionsList.filter((action: types.Action) => action.canDisplay(context));
  }

  /**
   * Returns specific action by given type
   * @param  {[type]} type used to filter actions by
   * @return {types.Action} Action
   */
  public getAction(type: string): types.Action {
    const actionSelected = actionsList.filter((action: types.Action) => action.type === type);
    return actionSelected[0] || null;
  }

  /**
   * Invokes action callback with injected arguments
   * @param {[type]} action Callback function from action
   * @param {Object} args Object with arguments that is applied to `this` in action class
   */
  public callAction(action: Action, args: Object): any {
    return this._shared.async(this.$injector.invoke(action.callback, args), 'callAction');
  }
}

@registerAction
// tslint:disable-next-line
class Knockout extends ReactionAction implements Action {
  public label = 'Knockout';
  public type: string = 'reaction:knockout:do';
  public shared: types.MapData;


  public canDisplay(context) {
    const isRemoved = !context.shared.removedReactions.includes(context.element.bigg_id);
    return context.type === 'map:reaction' && isRemoved;
  }
}

@registerAction
// tslint:disable-next-line
class UndoKnockout extends Knockout {
  public label = 'Undo knockout';
  public type: string = 'reaction:knockout:undo';

  public canDisplay(context) {
    if (context.shared.removedReactions) {
      const isRemoved = context.shared.removedReactions.includes(context.element.bigg_id);
      return context.type === 'map:reaction' && isRemoved;
    }

    return false;
  }
}

@registerAction
// tslint:disable-next-line
class SetObjective extends ReactionSetAsObjectiveAction implements Action {
  public label = 'Set as objective';
  public type: string = 'reaction:objective:do';
  public shared: types.MapData;

  public canDisplay(context) {
    const isRemoved = context.shared.objectiveReaction !== context.element.bigg_id;
    return context.type === 'map:reaction' && isRemoved;
  }
}

@registerAction
// tslint:disable-next-line
class UndoSetObjective extends ReactionAction {
  public label = 'Undo set as objective';
  public type: string = 'reaction:objective:undo';

  public canDisplay({type, shared, element}) {
    return shared.objectiveReaction &&
      shared.objectiveReaction === element.bigg_id &&
      type === 'map:reaction';
  }
}

@registerAction
// tslint:disable-next-line
class UpdateReaction extends ReactionAction implements Action {
  public type: string = 'reaction:update';

  public canDisplay(context) {
    return false;
  }
}
