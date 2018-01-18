import * as angular from 'angular';

import { AddedReactionsComponent } from './addedReactions/addedReactions.component';
import { KnockoutsComponent } from './knockouts/knockouts.component';
import { PanelItemComponent } from './panelitem/panelitem.component';
import { ReactionComponent } from './reaction.component';

export const ReactionsPanelModule = angular.module('ReactionsPanel', [
  'ngMaterial',
])
  .component('rpAddedReactions', AddedReactionsComponent)
  .component('rpKnockouts', KnockoutsComponent)
  .component('rpPanelItem', PanelItemComponent)
  .component('rpReactionPanel', ReactionComponent);
