import * as _ from 'lodash';

import { Action, ReactionAction } from './base';

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

  constructor($injector: angular.auto.IInjectorService, $q: angular.IQService) {
    this.$injector = $injector;
    this._q = $q;
  }

  /**
   * Returns list of all actions filtered by context
   * @param  {[type]} context Object used to filter actions by
   * @return {types.Action[]} List of actions
   */
  public getList(context): types.Action[] {
    return _.filter(actionsList, (action: types.Action) => action.canDisplay(context));
  }

  /**
   * Returns specific action by given type
   * @param  {[type]} type used to filter actions by
   * @return {types.Action} Action
   */
  public getAction(type: string): types.Action {
    return _.first(_.filter(actionsList, (action: types.Action) => action.type === type));
  }

  /**
   * Invokes action callback with injected arguments
   * @param {[type]} action Callback function from action
   * @param {Object} args Object with arguments that is applied to `this` in action class
   */
  public callAction(action: Action, args: Object): any {
    return this.$injector.invoke(action.callback, args);
  }
}

@registerAction
// tslint:disable-next-line
class Knockout extends ReactionAction implements Action {
  public label = 'Knockout';
  public type: string = 'reaction:knockout:do';
  public shared: types.MapData;


  public canDisplay(context) {
    const isRemoved = !_.includes(context.shared.removedReactions, context.element.bigg_id);
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
      const isRemoved = _.includes(context.shared.removedReactions, context.element.bigg_id);
      return context.type === 'map:reaction' && isRemoved;
    }

    return false;
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

