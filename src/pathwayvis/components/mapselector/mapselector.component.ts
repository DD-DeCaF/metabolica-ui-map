import {APIService} from "../../services/api";
import * as template from "./mapselector.component.html";
import * as types from '../../types';
/**
 * Created by dandann on 15/03/2017.
 */


class MapSelectorComponentCtrl {
    public allMaps: any;
    public maps: any;
    private _api: APIService;
    private _selectedMap: any;
    private default_map = "Central metabolism";

    constructor (api: APIService, $scope: angular.IScope){
        this._api = api;

        this._api.request_model('maps', {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
            this.allMaps = response.data;
        });

        $scope.$watch('ctrl._selectedMap', () => {
            $scope.$root.$broadcast('selectedMapChanged', this._selectedMap)
        });

        $scope.$on('modelChanged', function (event, model) {
            event.currentScope['ctrl'].setMapsFromModel(model);
        })
    }

    public setMap(map): void {
        this._selectedMap = map;
    }

    public openMenu($mdMenu, ev): void {
        var originatorEv = ev;
        $mdMenu.open(originatorEv);
    };

    public setMapsFromModel(model): void{
        this.maps = this.allMaps[model];
        if (this.maps.indexOf(this.default_map) !== -1){
            this._selectedMap = this.default_map;
        } else {
            this._selectedMap = this.maps[0];
        }
    }

}


export const MapSelectorComponent: angular.IComponentOptions = {
    controller: MapSelectorComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),

}
