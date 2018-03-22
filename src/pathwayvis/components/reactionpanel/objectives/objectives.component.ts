import * as angular from "angular";

import { MapOptionService } from "../../../services/mapoption.service";
import { ActionsService } from "../../../services/actions/actions.service";

class ObjectivesController {
  public modelReactions = [];
  public objectiveReaction: string = null;
  private _mapOptions: MapOptionService;
  private _actions: ActionsService;

  constructor(mapOptions: MapOptionService,
    actions: ActionsService) {
    this._mapOptions = mapOptions;
    this._actions = actions;

    mapOptions.reactionsObservable.subscribe((reactions) => {
      this.modelReactions = reactions;
    });

    mapOptions.objectiveReactionObservable.subscribe((reaction) => {
      this.objectiveReaction = reaction;
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
    .then((response) => { this._mapOptions.updateMapData(response); });
  }

  public onUndoClick(selectedReaction: string): void {
    const undoObjectiveAction = this._actions.getAction('reaction:objective:undo');
    this._mapOptions.setObjectiveReaction(null);
    this.objectiveReaction = null;
    this._mapOptions.actionHandler(undoObjectiveAction, { id: selectedReaction })
    .then((response) => { this._mapOptions.updateMapData(response); });
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
