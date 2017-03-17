import {APIService} from "../../services/api";
import * as _ from 'lodash';
import * as types from '../../types';
import  * as template from "./maploader.component.html";
import * as angular from "angular";
/**
 * Created by dandann on 15/03/2017.
 */

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

class MapLoaderComponentCtrl {
    public selected: types.SelectedItems = {};
    public methods: Method[];
    public experiments: any;
    public organismModel: any;
    public samples: types.Sample[];
    public phases: types.Phase[];
    private _api: any;
    private samplesSpecies: any;
    private _toastr: angular.toastr.IToastrService;
    private $mdDialog: ng.material.IDialogService;

    constructor ($scope: angular.IScope,
                 api: APIService,
                 toastr: angular.toastr.IToastrService,
                 $mdDialog: ng.material.IDialogService){
        this._api = api;
        this._toastr = toastr;
        this.$mdDialog = $mdDialog;

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

        this.samplesSpecies = {};

        $scope.$watch('ctrl.selected.method', () => {
            this.selected.experiment = undefined;
            this.selected.sample = undefined;
            this.selected.phase = undefined;
        });

        $scope.$watch('ctrl.selected.experiment', () => {
            this.selected.sample = undefined;
            this.selected.phase = undefined;

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
            this.selected.phase = undefined;

            if (!_.isEmpty(this.selected.sample)) {
                this.selected.model = this.organismModel[this.samplesSpecies[this.selected.sample]];
                var message = {
                    name: 'modelChanged',
                    data: this.selected.model
                }
                $scope.$root.$broadcast('modelChanged', this.selected.model);
                this._api.get('samples/:sampleId/phases', {
                    sampleId: this.selected.sample
                }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                    this.phases = response.data;
                }, (error) => {
                    this._toastr.error('Oops! Sorry, there was a problem loading selected sample.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });
                });
            }
        });

        $scope.$watch('ctrl.selected.phase', () => {
            if (!_.isEmpty(this.selected.phase)){

                // Close side_nav
                this.hide();

                $scope.$root.$broadcast('loadMap', this.selected);


            }
        });
    }

    public hide(): void{
        this.$mdDialog.hide()
    }
}

export const MapLoaderComponent: angular.IComponentOptions = {
    controller: MapLoaderComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString()
};
