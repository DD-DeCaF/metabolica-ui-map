import * as template from "./mapselector.component.html";
import { MapOptionService } from "../../services/mapoption.service";
import { MapService } from "../../services/map.service";


class MapSelectorComponentCtrl {
  public model: string;
  public maps: any;

  public modelIds: string[];

  private _selectedMap: any;
  private mapOptions: MapOptionService;
  private mapService: MapService;

  constructor(mapService: MapService, $scope: angular.IScope, mapOptions: MapOptionService) {
    this.mapService = mapService;
    this.mapOptions = mapOptions;

    this._selectedMap = mapOptions.getSelectedMap();

    mapOptions.modelId.subscribe((modelId: string) => {
      if (!modelId) return;
      this.model = modelId;
    });
    this.mapService.getMapsFromModel(mapOptions.modelId)
      .subscribe((maps) => {
        this.maps = maps;
        const mapId = this.mapOptions.getSelectedMap();
        if (!maps.includes(mapId)) {
          this.mapOptions.setSelectedMap(maps[0]);
        }
      });

    this.mapOptions.modelIds.subscribe((modelIds) => { this.modelIds = modelIds; });
  }

  public setMap(map: string): void {
    this.mapOptions.setSelectedMap(map);
  }

  public changeModel(): void {
    this.mapOptions.setModelId(this.model);
  }
}

export const MapSelectorComponent = {
  controller: MapSelectorComponentCtrl,
  template: template.toString(),
};
