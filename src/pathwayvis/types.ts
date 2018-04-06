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

export interface MetabolicMap {
  map: Object;
  settings: Object;
  reactionData: Object;
  geneData: Object;
  metaboliteData: Object;
  growthRate: number;
  removedReactions: string[];
}

export interface Model {
  compartments: any;
  genes: any;
  id: string;
  uid: string;
  metabolites: any;
  notes: any;
  reactions: Reaction[];
  version: number;
}

export interface Reaction {
  annotation: Object;
  gene_reaction_rule: any;
  id: string;
  lower_bound: number;
  metabolites: Object;
  name: string;
  notes: Object;
  subsystem: string;
  upper_bound: number;
}

export interface Shared {
  loading?: number;
}

export interface Measurement {
  name: string;
  measurements: string[];
  unit: number;
}

export interface Medium {
  name: string;
  concentration: number;
}

export interface MapInfo {
  genotypeChanges?: string[];
  measurements?: Measurement[];
  medium?: Medium[];
}

export interface MapData {
  map?: MetabolicMap;
  model?: Model;
  sections?: any;
  method?: string;
  removedReactions?: string[];
  addedReactions?: AddedReaction[];
  objectiveReaction?: string;
  info?: MapInfo;
  selected?: SelectedItems;
  pathwayData?: any;
}

export interface MapSettings {
  map_id: string;
  model_id: string;
  map: MetabolicMap;
}

export interface MapObject {
  id: number;
  mapData: MapData;
  selected: SelectedItems;
}

export interface SelectedItems {
  experiment?: Experiment;
  sample?: Sample;
  phase?: Phase;
  method?: Method;
  map?: string;
  model?: string;
}

export interface Message {
  name: string;
  data: any;
}

export interface Method {
  id: string;
  name: string;
}

interface APIitem {
  id: number;
  name: string;
}

export interface Phase extends APIitem { }
export interface Sample {
  id: number[];
  name: string;
  organism: string;
}
export interface Experiment extends APIitem { }

export interface Action {
  type: string;
  label: string;
  callback: any;
  canDisplay: any;
}

export interface Species {
  id: string;
  name: string;
}

export enum ObjectType {
  Experiment,
  Reference,
}

export interface BiggReaction {
  model_bigg_id: string;
  bigg_id: string;
  name: string;
  organism: string;
}

// TODO add these once there are typings for Escher
export interface ReactionEscherProps {
  undo: any;
  redo: any;
  id: any;
}

export interface AddedReaction extends BiggReaction {
  metanetx_id: string;
  reaction_string: string;
  metabolites: Map<String, Number>;
}

export interface EmbeddedResponse<T> {
  response: T;
}

export type CallbackEmbeddedResponse<T> = angular.IHttpPromiseCallbackArg<EmbeddedResponse<T>>;
