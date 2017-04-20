/**
 * Created by dandann on 03/04/2017.
 */

import * as types from '../types'
import {APIService} from "./api";
import {ToastService} from "./toastservice";
import angular = require("angular");

interface Method {
    id: string;
    name: string;
}

export class MapOptionService {
    private apiService;
    private samplesSpecies: any = {};

    public selectedMap: string = 'Central metabolism';

    // TODO: should get methods and default method from backend
    public methods: Method[] = [
        {'id': 'fba', 'name': 'FBA'},
        {'id': 'pfba', 'name': 'pFBA'},
        {'id': 'fva', 'name': 'FVA'},
        {'id': 'pfba-fva', 'name': 'pFBA-FVA'},
        {'id': 'moma', 'name': 'MOMA'},
        {'id': 'lmoma', 'name': 'lMOMA'},
        {'id': 'room', 'name': 'ROOM'}
    ];
    public selectedItems: types.SelectedItems =
        {
            'method': 'pfba',
            'map': 'Central metabolism'
        };

    public experiments: any;
    public organismModel: any;

    private toastService: ToastService;

    constructor(api: APIService, ToastService: ToastService) {
        this.apiService = api;
        this.toastService = ToastService;

        this.apiService.get('experiments').then((response: angular.IHttpPromiseCallbackArg<types.Experiment[]>) => {
            this.experiments = response.data;
        });

        this.apiService.get('species').then((response: angular.IHttpPromiseCallbackArg<any>) => {
            this.organismModel = response.data;
        });
    }

    public setMethod(method: string) : void {
        this.selectedItems.method = method;
    }

    public setExperiment(experiment: number) : void {
        this.selectedItems.sample = null;
        this.selectedItems.phase = null;
        this.selectedItems.experiment = experiment;
    }

    public setSample(sample: number) : void {
        this.selectedItems.phase = null;
        this.selectedItems.sample = sample;
    }

    public setPhase(phase: number) : void {
        this.selectedItems.phase = phase;
    }

    public getSelectedMap() : string {
        return this.selectedItems.map;
    }

    public getSelectedItems() : types.SelectedItems {
        return this.selectedItems;
    }

    public getDeafultMethod(): string {
        return 'pfba';
    }

    public getModel(): string {
        return this.selectedItems.model;
    }

    public getSamples(experiment: number) : angular.IPromise<Object> {
        if(experiment){
            let promise = this.apiService.get('experiments/:experimentId/samples', {
                experimentId: experiment
            });
            promise.then((response: angular.IHttpPromiseCallbackArg<types.Sample[]>) => {
                response.data.forEach((value) => {
                    this.samplesSpecies[value.id] = value.organism;
                });
            }, (error) => {
                this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected experiment.');
            });
            return promise;
        }
    }

    public getPhases(sample: number) : angular.IPromise<Object> {
        if (sample) {
            this.selectedItems.model = this.organismModel[this.samplesSpecies[sample]];
            return this.apiService.get('samples/:sampleId/phases', {
                sampleId: sample
            });
        }
    }
}
