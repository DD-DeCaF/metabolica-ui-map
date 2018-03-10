import * as types from "../types";

import MapObject from './MapObject';

class Experiment extends MapObject {
  private _item: types.SelectedItems;

  constructor() {
    super();
    this._type = types.ObjectType.Experiment;
  }

  public get name(): string {
    return [
      this._item.method,
      this._item.experiment,
      this._item.sample,
      this._item.phase].map(((prop) => prop ? prop.name : '-')).join('_');
  }
}
