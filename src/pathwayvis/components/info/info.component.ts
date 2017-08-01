import * as types from '../../types';
import './info.component.scss';
import * as template from './info.component.html';
import { MapOptionService } from "../../services/mapoption.service";

export class InfoComponentCtrl {
  private _mapOptions: MapOptionService;

  constructor(mapOptions: MapOptionService) {
    this._mapOptions = mapOptions;
  }

  public getGenotypeChanges(): string[] {
    return this._mapOptions.getMapInfo()['genotypeChanges'];
  }

  public showGenotypeChanges(): boolean {
    let genotypeChanges = this.getGenotypeChanges();
    if (genotypeChanges) {
      return genotypeChanges.length > 0;
    }
    return false;
  }

  public getMeasurements(): types.Measurement[] {
    return this._mapOptions.getMapInfo().measurements;
  }

  public getMedium(): types.Medium[] {
    const mapInfo: types.MapInfo = this._mapOptions.getMapInfo();
    return mapInfo && mapInfo.medium;
  }
}

export const InfoComponent = {
  controller: InfoComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
