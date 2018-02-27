import * as template from "./mapselector.component.html";
import { MapOptionService } from "../../services/mapoption.service";
import { MapSettings } from "../../services/mapsettings.service";


class MapSelectorComponentCtrl {
  public model: string;
  public map: string;
  public maps: any;

  public modelIds: string[];

  private _selectedMap: any;
  private mapSettingsService: MapSettings;

  constructor(
    mapSettingsService: MapSettings,
    $scope: angular.IScope,
    mapOptions: MapOptionService,
  ) {
    this.mapSettingsService = mapSettingsService;

    mapOptions.modelIds.subscribe((modelIds) => { this.modelIds = modelIds; });

    mapSettingsService.mapSettings.subscribe((mapSettings) => {
      this.model = mapSettings.model_id;
      this.map = mapSettings.map_id;
    });

    mapSettingsService.maps.subscribe((maps) => {
      this.maps = maps;
    });
    // this._selectedMap = mapOptions.getSelectedMap();

    // mapOptions.modelId.subscribe((modelId: string) => {
    //   if (!modelId) return;
    //   this.model = modelId;
    // });
    // this.mapService.getMapsFromModel(mapOptions.modelId)
    //   .subscribe((maps) => {
    //     this.maps = maps;
    //     const mapId = this.mapOptions.getSelectedMap();
    //     if (!maps.includes(mapId)) {
    //       this.mapOptions.setSelectedMap(maps[0]);
    //     }
    //   });

  }

  public setMap(map: string): void {
    // this.mapOptions.setSelectedMap(map);
  }

  public changeModel(): void {
    // this.mapOptions.setModelId(this.model);
  }
}

export const MapSelectorComponent = {
  controller: MapSelectorComponentCtrl,
  template: template.toString(),
};
