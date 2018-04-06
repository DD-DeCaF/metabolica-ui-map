// Copyright 2018 Novo Nordisk Foundation Center for Biosustainability, DTU.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as types from '../../types';
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
