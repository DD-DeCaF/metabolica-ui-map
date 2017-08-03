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
