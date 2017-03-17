"use strict";
exports.__esModule = true;
var _ = require("lodash");
var template = require("./maploader.component.html");
var MapLoaderComponentCtrl = (function () {
    function MapLoaderComponentCtrl($scope, api, toastr, $mdDialog) {
        var _this = this;
        this.selected = {};
        this._api = api;
        this._toastr = toastr;
        this.$mdDialog = $mdDialog;
        this.methods = [
            { 'id': 'fba', 'name': 'FBA' },
            { 'id': 'pfba', 'name': 'pFBA' },
            { 'id': 'fva', 'name': 'FVA' },
            { 'id': 'pfba-fva', 'name': 'pFBA-FVA' },
            { 'id': 'moma', 'name': 'MOMA' },
            { 'id': 'lmoma', 'name': 'lMOMA' },
            { 'id': 'room', 'name': 'ROOM' }
        ];
        this.selected.method = 'pfba';
        this._api.get('experiments').then(function (response) {
            _this.experiments = response.data;
        });
        this._api.get('species').then(function (response) {
            _this.organismModel = response.data;
        });
        this.samplesSpecies = {};
        $scope.$watch('ctrl.selected.method', function () {
            _this.selected.experiment = undefined;
            _this.selected.sample = undefined;
            _this.selected.phase = undefined;
        });
        $scope.$watch('ctrl.selected.experiment', function () {
            _this.selected.sample = undefined;
            _this.selected.phase = undefined;
            if (!_.isEmpty(_this.selected.experiment)) {
                _this._api.get('experiments/:experimentId/samples', {
                    experimentId: _this.selected.experiment
                }).then(function (response) {
                    _this.samples = response.data;
                    _this.samples.forEach(function (value) {
                        _this.samplesSpecies[value.id] = value.organism;
                    });
                }, function (error) {
                    _this._toastr.error('Oops! Sorry, there was a problem loading selected experiment.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });
                });
            }
        });
        $scope.$watch('ctrl.selected.sample', function () {
            _this.selected.phase = undefined;
            if (!_.isEmpty(_this.selected.sample)) {
                _this.selected.model = _this.organismModel[_this.samplesSpecies[_this.selected.sample]];
                var message = {
                    name: 'modelChanged',
                    data: _this.selected.model
                };
                $scope.$root.$broadcast('modelChanged', _this.selected.model);
                _this._api.get('samples/:sampleId/phases', {
                    sampleId: _this.selected.sample
                }).then(function (response) {
                    _this.phases = response.data;
                }, function (error) {
                    _this._toastr.error('Oops! Sorry, there was a problem loading selected sample.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });
                });
            }
        });
        $scope.$watch('ctrl.selected.phase', function () {
            if (!_.isEmpty(_this.selected.phase)) {
                // Close side_nav
                _this.hide();
                $scope.$root.$broadcast('loadMap', _this.selected);
            }
        });
    }
    MapLoaderComponentCtrl.prototype.hide = function () {
        this.$mdDialog.hide();
    };
    return MapLoaderComponentCtrl;
}());
exports.MapLoaderComponent = {
    controller: MapLoaderComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    // parent: angular.element(document.body),
    clickOutsideToClose: true
};
