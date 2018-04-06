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

import * as template from "./mapselector.component.html";
import { MapOptionService } from "../../services/mapoption.service";
import { MapService } from "../../services/map.service";


class MapSelectorComponentCtrl {
  public model: string;
  public allMaps: any;
  public maps: any;
  private _selectedMap: any;
  private mapOptions: MapOptionService;
  private mapService: MapService;

  constructor(mapService: MapService, $scope: angular.IScope, mapOptions: MapOptionService) {
    this.mapService = mapService;
    this.mapOptions = mapOptions;

    this._selectedMap = mapOptions.getSelectedMap();
    this.allMaps = mapService.allMaps;

    $scope.$watch('$ctrl.mapOptions.getModelId()', (modelId: string) => {
      this.model = modelId;
      this.setMapsFromModel(modelId);
    }, true);
  }

  public setMap(map: string): void {
    this.mapOptions.setSelectedMap(map);
  }

  public getModels(): string[] {
    return this.mapOptions.modelsIds;
  }

  public changeModel(): void {
    this.mapOptions.setModelId(this.model);
  }

  public setMapsFromModel(model): void {
    if (!model) return;
    let map_id = this.mapOptions.getSelectedMap();
    this.maps = this.mapService.getMapsFromModel(model);
    if (!this.mapService.usableMap(map_id, model)) {
      this.mapOptions.setSelectedMap(this.maps[0]);
    }
  }
}

export const MapSelectorComponent = {
  controller: MapSelectorComponentCtrl,
  template: template.toString(),
};
