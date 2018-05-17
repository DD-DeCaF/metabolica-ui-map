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

import { MapData, SelectedItems, MapObject, ObjectType, AddedReaction } from "../types";

export class MapDataObject implements MapObject {
  public id: number;
  public mapData: MapData;
  public selected: SelectedItems;
  public type: ObjectType;
  private name: string = "";

  constructor(id: number,
    type: ObjectType,
    mapData: MapData,
    selected: SelectedItems) {
    this.id = id;
    this.type = type;
    this.mapData = mapData;
    this.selected = selected;
  }

  public setRemovedReactions(reactions: string[]): void {
    this.mapData.removedReactions = reactions;
  }

  public setObjectiveReaction(reaction: string): void {
    this.mapData.objectiveReaction = reaction;
  }

  public isComplete(): boolean {
    return !!(this.mapData.map.reactionData && this.mapData.model);
  }

  public compareSelectedItems(other: MapDataObject): boolean {
    return this.selected.method === other.selected.method &&
      this.selected.experiment === other.selected.experiment &&
      this.selected.sample === other.selected.sample &&
      this.selected.phase === other.selected.phase;
  }

  private _experimentName(item: SelectedItems): string {
    return [
      item.method,
      item.experiment,
      item.sample,
      item.phase].map(((prop) => prop ? prop.name : '-')).join('_');
  }

  public getName(): string {
    return this.name ? this.name :
      this.type === ObjectType.Reference ? 'Wild type' :
        this.type === ObjectType.Experiment ? this._experimentName(this.selected) :
          undefined;
  }

  public setName(name: string): void {
    this.name = name;
  }
}
