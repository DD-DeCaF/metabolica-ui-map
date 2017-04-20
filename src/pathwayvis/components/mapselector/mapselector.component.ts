import {APIService} from "../../services/api";
import * as template from "./mapselector.component.html";
import * as types from '../../types';
import {MapOptionService} from "../../services/mapoption.service";
import {MapService} from "../../services/map.service";
/**
 * Created by dandann on 15/03/2017.
 */


class MapSelectorComponentCtrl {
    public allMaps: any;
    public maps: any;
    private _selectedMap: any;
    private mapOptions: MapOptionService;
    private mapService: MapService

    constructor (MapService: MapService, $scope: angular.IScope, MapOptions: MapOptionService){
        this.mapService = MapService;
        this.mapOptions = MapOptions;

        this._selectedMap = MapOptions.getSelectedMap();
        this.allMaps = MapService.getAllMaps();

        $scope.$watch('ctrl.mapOptions.getModel()', () => {
            this.setMapsFromModel(this.mapOptions.getModel());
        }, true);
    }

    public setMap(map: string): void{
        this.mapOptions.setSelectedMap(map);
    }


    public setMapsFromModel(model): void{
        if(model){
            let map_id = this.mapOptions.getSelectedMap();
            this.maps = this.mapService.getMapsFromModel(model);
            if (!this.mapService.usableMap(map_id, model))
            {
                this._selectedMap = this.maps[0];
            }
        }
    }
}


export const MapSelectorComponent: angular.IComponentOptions = {
    controller: MapSelectorComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),

}
