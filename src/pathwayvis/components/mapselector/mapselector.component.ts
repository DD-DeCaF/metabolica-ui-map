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
    private mapSerivce: MapService

    constructor (MapService: MapService, $scope: angular.IScope, MapOptions: MapOptionService){
        this.mapSerivce = MapService;
        this.mapOptions = MapOptions;

        this._selectedMap = MapOptions.getSelectedMap();
        this.allMaps = MapService.getAllMaps();

        $scope.$watch('ctrl.mapOptions.getModel()', () => {
            this.setMapsFromModel(this.mapOptions.getModel());
        }, true);
    }


    public setMapsFromModel(model): void{
        if(model){
            this.maps = this.mapSerivce.getMapsFromModel(model);
            if (!this.mapSerivce.usableMap(this._selectedMap, this.maps))
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
