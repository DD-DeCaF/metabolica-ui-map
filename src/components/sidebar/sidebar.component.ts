import * as angular from 'angular';
import * as _ from 'lodash';

import {dirname} from 'decaf-common';
import {APIService} from '../../services/api';
import * as types from '../../types';

import './views/sidebar.component.css!';

interface SelectedItems {
    experiment?: number;
    sample?: number;
    phase?: number;
    method?: string;
}

interface Method {
    id: string;
    name: string;
}

const component = angular.module('pathwayvis.components.sidebar', []);

/**
 * sidebar component
 */
class SidebarComponentCtrl {
    public shared: types.Shared;
    public loadData: Object = {};
    public selected: SelectedItems = {};
    public methods: Method[];
    public experiments: types.Experiment[];
    public samples: types.Sample[];
    public samplesSpecies: any;
    public phases: types.Phase[];
    public info: Object;

    private _api: APIService;
    private _http: angular.IHttpService;
    private _q: angular.IQService;
    private _toastr: angular.toastr.IToastrService;

    /* @ngInject */
    constructor ($scope: angular.IScope,
                 $http: angular.IHttpService,
                 $q: angular.IQService,
                 toastr: angular.toastr.IToastrService,
                 api: APIService) {

        this._api = api;
        this._http = $http;
        this._q = $q;
        this._toastr = toastr;

        this.methods = [
            {'id': 'fba', 'name': 'FBA'},
            {'id': 'pfba', 'name': 'pFBA'},
            {'id': 'fva', 'name': 'FVA'},
            {'id': 'moma', 'name': 'MOMA'},
            {'id': 'lmoma', 'name': 'lMOMA'},
            {'id': 'room', 'name': 'ROOM'}
        ];
        this.selected.method = 'pfba';

        this._api.get('experiments').then((response: angular.IHttpPromiseCallbackArg<types.Experiment[]>) => {
            this.experiments = response.data;
        });

        this.samplesSpecies = {};

        $scope.$watch('ctrl.selected.experiment', () => {
            if (!_.isEmpty(this.selected.experiment)) {
                this._api.get('experiments/:experimentId/samples', {
                    experimentId: this.selected.experiment
                }).then((response: angular.IHttpPromiseCallbackArg<types.Sample[]>) => {
                    this.samples = response.data;
                    this.samples.forEach((value) => {
                        this.samplesSpecies[value.id] = value.organism;
                    });
                }, (error) => {
                    this._toastr.error('Oops! Sorry, there was a problem loading selected experiment.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });
                });
            }
        });

        $scope.$watch('ctrl.selected.sample', () => {
            if (!_.isEmpty(this.selected.sample)) {
                this._api.get('samples/:sampleId/phases', {
                    sampleId: this.selected.sample
                }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                    this.phases = response.data;
                }, (error) => {
                    this._toastr.error('Oops! Sorry, there was a problem loading selected sample.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });

                    this.shared.loading--;
                });
            }
        });
    }

    public onLoadDataSubmit($event?): void {
        const mapUris = {
            'ECO': `${dirname(module.id)}/assets/maps/iJO1366.Central metabolism.json`,
            'SCE': `${dirname(module.id)}/assets/maps/iMM904.Central carbon metabolism.json`
        };
        this.shared.loading++;

        const mapPromise = this._http({
            method: 'GET',
            url: mapUris[this.samplesSpecies[this.selected.sample]]
        });

        const modelPromise = this._api.get('samples/:sampleId/model', {
            'sampleId': this.selected.sample,
            'phase-id': this.selected.phase,
            'method': this.selected.method,
            'with-fluxes': 1
        });

        const infoPromise = this._api.get('samples/:sampleId/info', {
            'sampleId': this.selected.sample,
            'phase-id': this.selected.phase
        });

        this._q.all([mapPromise, modelPromise, infoPromise]).then((responses: any) => {

            // Add loaded data to shared scope
            this.shared.map.map = responses[0].data;
            this.shared.model = responses[1].data.model;
            this.shared.model.uid = responses[1].data['model-id'];
            this.shared.map.reactionData = responses[1].data.fluxes;
            this.shared.method = this.selected.method;
            this.info = responses[2].data;

            this.shared.loading--;
        }, (error) => {
            this._toastr.error('Oops! Sorry, there was a problem with fetching the data.', '', {
                closeButton: true,
                timeOut: 10500
            });

            this.shared.loading--;
        });
    }
}

const SidebarComponent: angular.IComponentOptions = {
    controller: SidebarComponentCtrl,
    controllerAs: 'ctrl',
    templateUrl: `${dirname(module.id)}/views/sidebar.component.html`,
    bindings: {
        shared: '='
    }
};

// Register component
component.component('pvSidebar', SidebarComponent);
