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

import * as angular from 'angular';

import { AddedReactionsComponent } from './addedReactions/addedReactions.component';
import { KnockoutsComponent } from './knockouts/knockouts.component';
import { PanelItemComponent } from './panelitem/panelitem.component';
import { ReactionComponent } from './reaction.component';
import { ObjectivesComponent } from './objectives/objectives.component';

export const ReactionsPanelModule = angular.module('ReactionsPanel', [
  'ngMaterial',
])
  .component('rpAddedReactions', AddedReactionsComponent)
  .component('rpKnockouts', KnockoutsComponent)
  .component('rpObjectives', ObjectivesComponent)
  .component('rpPanelItem', PanelItemComponent)
  .component('rpReactionPanel', ReactionComponent);
