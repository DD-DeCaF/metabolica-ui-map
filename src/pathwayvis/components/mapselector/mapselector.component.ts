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

  // TODO rename to mapService
  constructor(MapService: MapService, $scope: angular.IScope, MapOptions: MapOptionService) {
    this.mapService = MapService;
    this.mapOptions = MapOptions;

    this._selectedMap = MapOptions.getSelectedMap();
    this.allMaps = MapService.getAllMaps();

    $scope.$watch('ctrl.mapOptions.getModel()', () => {
      this.model = this.mapOptions.getModel();
      this.setMapsFromModel(this.mapOptions.getModel());
    }, true);
  }

  public setMap(map: string): void {
    this.mapOptions.setSelectedMap(map);
  }

  public getModels(): string[] {
    return this.mapOptions.getModels();
  }

  public changeModel(): void {
    this.mapOptions.setModel(this.model);
  }

  public setMapsFromModel(model): void {
    // TODO flatten logic
    if (model) {
      let map_id = this.mapOptions.getSelectedMap();
      this.maps = this.mapService.getMapsFromModel(model);
      if (!this.mapService.usableMap(map_id, model)) {
        this.mapOptions.setSelectedMap(this.maps[0]);
      }
    }
  }
}


export const MapSelectorComponent = {
  controller: MapSelectorComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),

};
