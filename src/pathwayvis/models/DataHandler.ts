import {MapDataObject} from "./MapDataObject";
import {MethodService} from "../services/method.service";
import {ObjectType} from "../types";

export class DataHandler {
    private ids: number[];
    private dataObjects: MapDataObject[];
    private methodService: MethodService;

    constructor(MethodService: MethodService) {
        this.methodService = MethodService;
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
            'mapId' : 'Central metabolism',
            'modelId' : null,
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
        let activeId = 0;
        if (index > this.ids.length - 1) {
            activeId = this.ids[0];
        } else {
            activeId = this.ids[index];
        }

        return activeId;
    }

    public previousMapObject(selectedId): number {
        let index = this.ids.indexOf(selectedId) - 1;
        let activeId = 0;
        if (index < 0) {
            activeId = this.ids[this.ids.length - 1];
        } else {
            activeId = this.ids[index];
        }
        return activeId;
    }

    public getObject(id: number): MapDataObject {
        return this.dataObjects[id];
    }

    public size(): number {
        return this.dataObjects.length;
    }

    // There's no point in keeping this variable private then
    public getIds(): number[] {
        return this.ids;
    }
    public isMaster(id: number): boolean {
        return this.ids[0] === id;
    }
}
