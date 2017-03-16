"use strict";
exports.__esModule = true;
var template = require("./mapselector.component.html");
/**
 * Created by dandann on 15/03/2017.
 */
var MapSelectorComponentCtrl = (function () {
    function MapSelectorComponentCtrl(api, $scope) {
        var _this = this;
        this._api = api;
        this._api.request_model('maps', {}).then(function (response) {
            _this.allMaps = response.data;
        });
        $scope.$watch('ctrl._selectedMap', function () {
            $scope.$root.$broadcast('selectedMapChanged', _this._selectedMap);
        });
        $scope.$on('modelChanged', function (event, model) {
            event.currentScope['ctrl'].setMapsFromModel(model);
        });
    }
    MapSelectorComponentCtrl.prototype.setMap = function (map) {
        this._selectedMap = map;
    };
    MapSelectorComponentCtrl.prototype.openMenu = function ($mdMenu, ev) {
        var originatorEv = ev;
        $mdMenu.open(originatorEv);
    };
    ;
    MapSelectorComponentCtrl.prototype.setMapsFromModel = function (model) {
        this.maps = this.allMaps[model];
        this._selectedMap = this.maps[0];
    };
    return MapSelectorComponentCtrl;
}());
exports.MapSelectorComponent = {
    controller: MapSelectorComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString()
};
