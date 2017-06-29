/**
 * Created by dandann on 06/06/2017.
 */
import {MapData, SelectedItems, MapObject, ObjectType} from "../types";

export class MapDataObject implements MapObject{
    public id: number;
    public mapData: MapData;
    public selected: SelectedItems;
    public type: ObjectType;
    private name: string = "";

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

    public getName(): string{
        if(this.name){
            return this.name;
        }

        if(this.type == ObjectType.Reference){
            return 'Reference';
        }

        if(this.type == ObjectType.Experiment){
            let name = "";

            if (this.selected.method){
                name += this.selected.method.name;
            } else {
                name += '_'
            }
            name += '-';

            if (this.selected.experiment){
                name += this.selected.experiment.name;
            } else {
                name += '_'
            }
            name += '-';

            if (this.selected.sample){
                name += this.selected.sample.name;
            } else {
                name += '_'
            }
            name += '-';

            if (this.selected.phase){
                name += this.selected.phase.name;
            } else {
                name += '_'
            }

            return name;
        }
    }

    public setName(name: string): void{
        this.name = name;
    }
}
