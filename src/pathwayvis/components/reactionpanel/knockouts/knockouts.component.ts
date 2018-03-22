import * as angular from "angular";

import { MapOptionService } from "../../../services/mapoption.service";
import { AddedReaction, BiggReaction } from "../../../types";
import { ActionsService } from "../../../services/actions/actions.service";
import { access } from "fs";

const DecafBiggProxy = 'https://api-staging.dd-decaf.eu/bigg/';

class KnockoutsController {
  public modelReactions = [];
  public removedReactions = [];

  private _mapOptions: MapOptionService;
  private _actions: ActionsService;

  constructor(mapOptions: MapOptionService,
    actions: ActionsService) {
    this._mapOptions = mapOptions;
    this._actions = actions;

    mapOptions.reactionsObservable.subscribe((reactions) => {
      this.modelReactions = reactions;
    });

    mapOptions.removedReactionsObservable.subscribe((reactions) => {
      this.removedReactions = reactions;
    });
  }

  public removeReactionSelectedItem(item) {
    if (!item) return;
    const doKnockoutAction = this._actions.getAction('reaction:knockout:do');

    this._mapOptions.actionHandler(doKnockoutAction, { id: item.id })
    .then((response) => { this._mapOptions.updateMapData(response); });
  }

  public queryModelReactions(query: string): any[] {
    query = query.toLowerCase();
    return this.modelReactions.filter((reaction) => {
      return reaction.name.toLowerCase().includes(query)
        || reaction.id.toLowerCase().includes(query);
    });
  }

  public onUndoClick(selectedReaction: string): void {
    const undoKnockoutAction = this._actions.getAction('reaction:knockout:undo');
    this._mapOptions.actionHandler(undoKnockoutAction, { id: selectedReaction })
      .then((response) => { this._mapOptions.updateMapData(response); });
  }

}

export const KnockoutsComponent = {
  controller: KnockoutsController,
  template: `
  <rp-panel-item
    on-item-select="$ctrl.removeReactionSelectedItem(item)"
    query-search="$ctrl.queryModelReactions(query)"
    placeholder="'Enter the reaction you want to remove'"
    missing-items="'No knocked out reactions'"
    header="'Removed reactions:'"
    items="$ctrl.removedReactions"
    on-remove-item="$ctrl.onUndoClick(item)">
    id-property="'id'">
  </rp-panel-item>`,
};
