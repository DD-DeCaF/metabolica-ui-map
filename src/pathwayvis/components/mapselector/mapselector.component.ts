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

    constructor (api: APIService, $scope: angular.IScope){
        this._api = api;

        this._api.request_model('maps', {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
            this.allMaps = response.data;
        });

        $scope.$watch('ctrl._selectedMap', () => {
            var message = {
                name: 'selectedMapChanged',
                data: this._selectedMap
            };
            $scope.$emit('pushChangesToNodes', message)
        })

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
        this._selectedMap = this.maps[0];
    }

}


export const MapSelectorComponent: angular.IComponentOptions = {
    controller: MapSelectorComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),

}
