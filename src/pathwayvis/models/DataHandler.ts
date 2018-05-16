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

import { MapDataObject } from "./MapDataObject";
import { defaultMethod } from "../consts/methods";
import { ObjectType, SelectedItems, MapData } from "../types";


export class DataHandler {
  public ids: number[];
  private dataObjects: MapDataObject[];

  constructor() {
    this.dataObjects = [];
    this.ids = [];
  }

  public addObject(type: ObjectType = null): number {
    const id = this.dataObjects.length;

    const object_type = type || ObjectType.Experiment;

    const selected = <SelectedItems> {
      mapId: 'Central metabolism',
      modelId: null,
      method: defaultMethod,
    };

    const mapData = <MapData> {
      map: {},
      model: {},
      sections: {},
      info: {},
      removedReactions: [],
      addedReactions: [],
      objectiveReaction: null,
      objectiveDirection: 'max',
      bounds: [],
      changedReactions: [],
    };

    const obj = new MapDataObject(id, object_type, mapData, selected);

    this.ids.push(id);
    this.dataObjects.push(obj);
    return id;
  }

  public removeObject(selectedId: number, id: number): number {
    const index = this.ids.indexOf(id);
    this.ids.splice(index, 1);
    this.dataObjects[id] = null;
    if (selectedId === id) {
      return this.nextMapObject(selectedId);
    }
    return selectedId;
  }

  public nextMapObject(selectedId: number): number {
    const index = this.ids.indexOf(selectedId) + 1;
    return this.ids[index % this.ids.length];
  }

  public previousMapObject(selectedId): number {
    const index = this.ids.indexOf(selectedId) - 1;
    return this.ids[(this.ids.length + index) % this.ids.length];
  }

  public getObject(id: number): MapDataObject {
    return this.dataObjects[id];
  }

  public size(): number {
    return this.ids.length;
  }
}
