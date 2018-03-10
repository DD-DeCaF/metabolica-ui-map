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

  public isComplete(): boolean {
    return !!(this.mapData.map.reactionData && this.mapData.model);
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
      this.type === ObjectType.WildType ? 'Wild type' :
        this.type === ObjectType.Experiment ? this._experimentName(this.selected) :
          undefined;
  }

  public setName(name: string): void {
    this.name = name;
  }
}
