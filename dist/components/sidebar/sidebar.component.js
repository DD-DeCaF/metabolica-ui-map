"use strict";
var angular = require("angular");
var _ = require("lodash");
var decaf_common_1 = require("decaf-common");
require("./views/sidebar.component.css!");
var component = angular.module('pathwayvis.components.sidebar', []);
/**
 * sidebar component
 */
var SidebarComponentCtrl = (function () {
    /* @ngInject */
    function SidebarComponentCtrl($scope, $http, $q, toastr, api) {
        var _this = this;
        this.loadData = {};
        this.selected = {};
        this._api = api;
        this._http = $http;
        this._q = $q;
        this._toastr = toastr;
        this.methods = [
            { 'id': 'fba', 'name': 'FBA' },
            { 'id': 'pfba', 'name': 'pFBA' },
            { 'id': 'fva', 'name': 'FVA' },
            { 'id': 'moma', 'name': 'MOMA' },
            { 'id': 'lmoma', 'name': 'lMOMA' },
            { 'id': 'room', 'name': 'ROOM' }
        ];
        this.selected.method = 'pfba';
        this._api.get('experiments').then(function (response) {
            _this.experiments = response.data;
        });
        this.samplesSpecies = {};
        $scope.$watch('ctrl.selected.experiment', function () {
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
            if (!_.isEmpty(_this.selected.sample)) {
                _this._api.get('samples/:sampleId/phases', {
                    sampleId: _this.selected.sample
                }).then(function (response) {
                    _this.phases = response.data;
                }, function (error) {
                    _this._toastr.error('Oops! Sorry, there was a problem loading selected sample.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });
                    _this.shared.loading--;
                });
            }
        });
    }
    SidebarComponentCtrl.prototype.onLoadDataSubmit = function ($event) {
        var _this = this;
        var mapUris = {
            'ECO': decaf_common_1.dirname(module.id) + "/assets/maps/iJO1366.Central metabolism.json",
            'SCE': decaf_common_1.dirname(module.id) + "/assets/maps/iMM904.Central carbon metabolism.json"
        };
        this.shared.loading++;
        var mapPromise = this._http({
            method: 'GET',
            url: mapUris[this.samplesSpecies[this.selected.sample]]
        });
        var modelPromise = this._api.get('samples/:sampleId/model', {
            'sampleId': this.selected.sample,
            'phase-id': this.selected.phase,
            'method': this.selected.method,
            'with-fluxes': 1
        });
        var infoPromise = this._api.get('samples/:sampleId/info', {
            'sampleId': this.selected.sample,
            'phase-id': this.selected.phase
        });
        this._q.all([mapPromise, modelPromise, infoPromise]).then(function (responses) {
            // Add loaded data to shared scope
            _this.shared.map.map = responses[0].data;
            _this.shared.model = responses[1].data.model;
            _this.shared.model.uid = responses[1].data['model-id'];
            _this.shared.map.reactionData = responses[1].data.fluxes;
            _this.shared.method = _this.selected.method;
            _this.info = responses[2].data;
            _this.shared.loading--;
        }, function (error) {
            _this._toastr.error('Oops! Sorry, there was a problem with fetching the data.', '', {
                closeButton: true,
                timeOut: 10500
            });
            _this.shared.loading--;
        });
    };
    return SidebarComponentCtrl;
}());
var SidebarComponent = {
    controller: SidebarComponentCtrl,
    controllerAs: 'ctrl',
    templateUrl: decaf_common_1.dirname(module.id) + "/views/sidebar.component.html",
    bindings: {
        shared: '='
    }
};
// Register component
component.component('pvSidebar', SidebarComponent);

//# sourceMappingURL=sidebar.component.js.map
