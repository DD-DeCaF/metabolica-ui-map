import * as _ from 'lodash';
import 'angular-toastr';

import {APIService} from '../../services/api';
import * as types from '../../types';

import './views/sidebar.component.scss';
import * as template from './views/sidebar.component.html';

interface SelectedItems {
    experiment?: number;
    sample?: number;
    phase?: number;
    method?: string;
    map?: string;
}

interface Method {
    id: string;
    name: string;
}

export const MAPS_URL = 'https://api.dd-decaf.eu/maps';

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
    public organismModel: any;
    public allMaps: any;
    public maps: any;
    public phases: types.Phase[];
    public info: Object;

    private _api: APIService;
    private _http: angular.IHttpService;
    private _q: angular.IQService;
    private _toastr: angular.toastr.IToastrService;
    private _scope: angular.IScope;

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
        this._scope = $scope;

        this.methods = [
            {'id': 'fba', 'name': 'FBA'},
            {'id': 'pfba', 'name': 'pFBA'},
            {'id': 'fva', 'name': 'FVA'},
            {'id': 'pfba-fva', 'name': 'pFBA-FVA'},
            {'id': 'moma', 'name': 'MOMA'},
            {'id': 'lmoma', 'name': 'lMOMA'},
            {'id': 'room', 'name': 'ROOM'}
        ];
        this.selected.method = 'pfba';

        this._api.get('experiments').then((response: angular.IHttpPromiseCallbackArg<types.Experiment[]>) => {
            this.experiments = response.data;
        });

        this._api.get('species').then((response: angular.IHttpPromiseCallbackArg<any>) => {
            this.organismModel = response.data;
        });

        this._api.request_model('maps', {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
            this.allMaps = response.data;
        });

        this.samplesSpecies = {};

        $scope.$watch('ctrl.selected.experiment', () => {
            if (!_.isEmpty(this.selected.experiment)) {
                this.shared.map.reactionData = [];
                this.phases = [];
                this.maps = [];
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
                this.maps = this.allMaps[this.organismModel[this.samplesSpecies[this.selected.sample]]];
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

        $scope.$watch('ctrl.selected.map', () => {;
            if (!_.isEmpty(this.selected.map)) {
                this.shared.loading++;
                this._api.request_model('map', {
                    'model': this.organismModel[this.samplesSpecies[this.selected.sample]],
                    'map': this.selected.map,
                }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                    this.shared.map.map = response.data;
                    $scope.$emit('draw_knockout');
                    this.shared.loading--;
                }, (error) => {
                    this._toastr.error('Oops! Sorry, there was a problem loading selected map.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });

                    this.shared.loading--;
                });
                if (this.selected.method == 'fva' || this.selected.method == 'pfba-fva') {
                    this.shared.removedReactions = [];
                    this.shared.loading++;
                    this._api.get('samples/:sampleId/model', {
                        'sampleId': this.selected.sample,
                        'phase-id': this.selected.phase,
                        'method': this.selected.method,
                        'map': this.selected.map,
                        'with-fluxes': 1
                    }).then((response: angular.IHttpPromiseCallbackArg<any>) => {
                        this.shared.model = response.data.model;
                        this.shared.model.uid = response.data['model-id'];
                        this.shared.map.reactionData = response.data.fluxes;
                        this.shared.loading--;
                    }, (error) => {
                        this._toastr.error('Oops! Sorry, there was a problem loading selected map.', '', {
                            closeButton: true,
                            timeOut: 10500
                        });

                        this.shared.loading--;
                    });
                }
            }
        });
    }

    public onLoadDataSubmit($event?): void {
        this.shared.removedReactions = [];
        this.shared.loading++;

        const mapPromise = this._api.request_model('map', {
            'model': this.organismModel[this.samplesSpecies[this.selected.sample]],
            'map': this.selected.map,
        });

        const modelPromise = this._api.get('samples/:sampleId/model', {
            'sampleId': this.selected.sample,
            'phase-id': this.selected.phase,
            'method': this.selected.method,
            'map': this.selected.map,
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

export const SidebarComponent: angular.IComponentOptions = {
    controller: SidebarComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
        project: '<project'
    }
};

