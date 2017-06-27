/**
 * Created by dandann on 06/06/2017.
 */
import {MapData, SelectedItems, MapObject, ObjectType} from "../types";

export class MapDataObject implements MapObject{
    public id: number;
    public mapData: MapData;
    public selected: SelectedItems;
    public type: ObjectType;

    constructor(id: number,
                type: ObjectType,
                mapData: MapData,
                selected: SelectedItems){
        this.id = id;
        this.type = type;
        this.mapData = mapData;
        this.selected = selected;
    }

    public setRemovedReactions(reactions: string[]): void{
        this.mapData.removedReactions = reactions;
    }

    public isComplete(): boolean{
        if(this.mapData.map.reactionData && this.mapData.model){
            return true;
        }
        return false;
    }

    public compareSelectedItems( other: MapDataObject): boolean{
        return this.selected.method == other.selected.method &&
            this.selected.experiment == other.selected.experiment &&
            this.selected.sample == other.selected.sample &&
            this.selected.phase == other.selected.phase
    }

}
