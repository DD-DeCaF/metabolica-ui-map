import * as types from "../types";


export default class MapObject {
  protected _name: string;
  protected _type: types.ObjectType;

  public set name(name: string) {
    this._name = name;
  }
}
