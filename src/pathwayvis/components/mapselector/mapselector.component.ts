import * as template from "./mapselector.component.html";
import { MapOptionService } from "../../services/mapoption.service";
import { MapService } from "../../services/map.service";
import "./mapselector.component.scss";
import * as Rx from 'rxjs/Rx';


class MapSelectorComponentCtrl {
  public model: string;
  public maps: any;

  public modelIds: string[];

  private selectedMap: string;
  private mapOptions: MapOptionService;
  private mapService: MapService;

  constructor(mapService: MapService, $scope: angular.IScope, mapOptions: MapOptionService) {
    this.mapService = mapService;
    this.mapOptions = mapOptions;

    mapOptions.modelId.subscribe((modelId: string) => {
      if (!modelId) return;
      this.model = modelId;
    });

    Rx.Observable.combineLatest(
      this.mapService.getMapsFromModel(mapOptions.modelId),
      this.mapOptions.mapId,
    )
      .subscribe(([maps, mapId]) => {
        this.maps = maps;
        if (!maps.includes(mapId)) {
          this.mapOptions.setSelectedMap(maps[0]);
          mapId = maps[0];
        }
        this.selectedMap = mapId;
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
