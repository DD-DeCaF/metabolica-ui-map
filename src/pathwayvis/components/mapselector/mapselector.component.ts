import * as template from "./mapselector.component.html";
import { MapOptionService } from "../../services/mapoption.service";
import { MapSettings } from "../../services/mapsettings.service";
import "./mapselector.component.scss";


class MapSelectorComponentCtrl {
  public selectedModel: string;
  public selectedMap: string;
  public maps: string[];

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
      this.selectedModel = mapSettings.model_id;
      this.selectedMap = mapSettings.map_id;
    });

    mapSettingsService.maps.subscribe((maps) => {
      this.maps = maps;
    });
  }

  public setMap(map: string): void {
    this.mapSettingsService.setMapId(map);
  }

  public changeModel(): void {
    this.mapSettingsService.setModelId(this.selectedModel);
  }
}

export const MapSelectorComponent = {
  controller: MapSelectorComponentCtrl,
  template: template.toString(),
};
