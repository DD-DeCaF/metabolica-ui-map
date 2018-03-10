import * as types from "../types";

import MapObject from './MapObject';

class Experiment extends MapObject {
  constructor() {
    super();
    this._type = types.ObjectType.WildType;
  }

  public get name(): string {
    return this._name && 'Wild type';
  }
}
