import {APIService} from "../../services/api";
import * as _ from 'lodash';
import * as types from '../../types';
import  * as template from "./maploader.component.html";
import * as angular from "angular";
import {ToastService} from "../../services/toastservice";
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
    private toastService: ToastService;
    private $mdDialog: ng.material.IDialogService;

    constructor ($scope: angular.IScope,
                 api: APIService,
                 ToastService: ToastService,
                 $mdDialog: ng.material.IDialogService){
        this._api = api;
        this.toastService = ToastService;
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

        $scope.$on('sharedExperiment', function handler(ev, item){
            let experiment = item.identifier;
            this.selected.experiment = experiment;
        });

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
                    this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected experiment.');
                });
            }
        });

        $scope.$watch('ctrl.selected.sample', () => {
            this.selected.phase = undefined;

            if (!_.isEmpty(this.selected.sample)) {
                this.selected.model = this.organismModel[this.samplesSpecies[this.selected.sample]];
                $scope.$root.$broadcast('modelChanged', this.selected.model);
                this._api.get('samples/:sampleId/phases', {
                    sampleId: this.selected.sample
                }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                    this.phases = response.data;
                }, (error) => {
                    this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
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
