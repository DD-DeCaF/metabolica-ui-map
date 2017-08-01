import { MapDataObject } from "./MapDataObject";
import { MethodService } from "../services/method.service";
import { ObjectType } from "../types";


export class DataHandler {
  private ids: number[];
  private dataObjects: MapDataObject[];
  private methodService: MethodService;

  constructor(methodService: MethodService) {
    this.methodService = methodService;
    this.dataObjects = [];
    this.ids = [];
  }

  public addObject(type: ObjectType = null): number {
    let id = this.dataObjects.length;

    let object_type = type;
    if (!object_type) {
      object_type = ObjectType.Experiment;
    }

    let selected = {
      'mapId': 'Central metabolism',
      'modelId': null,
      'method': this.methodService.defaultMethod(),
    };

    let mapData = <any> {
      map: {},
      model: {},
      sections: {},
      info: {},
      removedReactions: [],
      addedReactions: [],
    };

    let obj = new MapDataObject(id, object_type, mapData, selected);

    this.ids.push(id);
    this.dataObjects.push(obj);
    return id;
  }

  public removeObject(selectedId: number, id: number): number {
    let index = this.ids.indexOf(id);
    this.ids.splice(index, 1);
    this.dataObjects[id] = null;
    if (selectedId === id) {
      return this.nextMapObject(selectedId);
    }
    return selectedId;

  }

  public nextMapObject(selectedId: number): number {
    let index = this.ids.indexOf(selectedId) + 1;
    return this.ids[index % this.ids.length];
  }

  public previousMapObject(selectedId): number {
    let index = this.ids.indexOf(selectedId) - 1;
    return this.ids[(this.ids.length + index) % this.ids.length];
  }

  public getObject(id: number): MapDataObject {
    return this.dataObjects[id];
  }

  public size(): number {
    return this.ids.length;
  }

  public getIds(): number[] {
    return this.ids;
  }
  public isMaster(id: number): boolean {
    return this.ids[0] === id;
  }
}
