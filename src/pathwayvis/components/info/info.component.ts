import './info.component.scss';
import * as template from './info.component.html';
import { MapOptionService } from "../../services/mapoption.service";

class InfoComponentCtrl {
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

  public getMeasurements(): object[] {
    return this._mapOptions.getMapInfo()['measurements'];
  }

  public getMedium(): object[] {
    return this._mapOptions.getMapInfo()['medium'];
  }
}

export const InfoComponent = {
  controller: InfoComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
  bindings: {
    shared: '=',
    project: '<project',
  },
};
