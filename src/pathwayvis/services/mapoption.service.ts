/**
 * Created by dandann on 03/04/2017.
 */

import * as types from '../types'
import * as _ from 'lodash';
import {APIService} from "./api";
import {ToastService} from "./toastservice";
import angular = require("angular");

interface Method {
    id: string;
    name: string;
}

interface MapSettings {
    map_id: string;
    model_id: string;
}

export class MapOptionService {
    private apiService: APIService;
    private samplesSpecies: any = {};

    public mapData: types.MapData = <any>{
        map: {},
        model: {},
        sections: {},
        info: {}
    };

    public mapsettings: MapSettings = {
        'map_id' : 'Central metabolism',
        'model_id' : null
    };

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

    public getMapData(): types.MapData{
        return this.mapData;
    }

    public getCurrentMapId(): string{
        if(this.mapData.map.map) {
            return this.mapData.map.map[0].map_id;
        }
        return null;
    }

    public getCurrentMap(): object{
        return this.mapData.map.map;
    }

    public setMap(map: object): void{
        this.mapData.map.map = map;
    }

    public getCurrentReactionData(): object{
        if(this.mapData.map.reactionData){
            return this.mapData.map.reactionData;
        }
        return null;
    }

    public setReactionData(data: object){
        this.mapData.map.reactionData = data;
    }

    public getCurrentModel(): types.Model{
        return this.mapData.model
    }

    public setModel(model: types.Model, model_id: string): void{
        this.mapData.model = model;
        if (model_id){
            this.mapData.model.uid = model_id;
        }
    }

    public getCurrentModelId(): string{
        if(this.mapData.model.uid){
            return this.mapData.model.uid;
        }
        return null;
    }

    public getCurrentMapInfo(): object{
        if(this.mapData.info){
            return this.mapData.info;
        }
        return null;
    }

    public setMapInfo(info: object){
        this.mapData.info = info;
    }

    public getCurrentRemovedReactions(): string[]{
        return this.mapData.removedReactions;
    }

    public setRemovedReactions(reactions: string[]){
        this.mapData.removedReactions = reactions;
    }

    public getCurrentGrowthRate(): number{
        return this.mapData.map.growthRate;
    }

    public setCurrentGrowthRate(growthRate: number){
        this.mapData.map.growthRate = growthRate;
        if (_.round(growthRate, 5) === 0) {
            this.toastService.showWarnToast('Growth rate is 0!');
        }
    }


    public setMethodId(method: string) : void {
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

    public getSelectedItems() : types.SelectedItems {
        return this.selectedItems;
    }

    public getDeafultMethod(): string {
        return 'pfba';
    }

    public getMapSettings(): MapSettings {
        return this.mapsettings;
    }

    public getModel(): string {
        return this.mapsettings.model_id;
    }

    public getSelectedMap() : string {
        return this.mapsettings.map_id;
    }

    public setSelectedMap(map_id: string): void{
        this.mapsettings.map_id = map_id;
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
            this.mapsettings.model_id = this.organismModel[this.samplesSpecies[sample]];
            return this.apiService.get('samples/:sampleId/phases', {
                sampleId: sample
            });
        }
    }

    public getExperiment(): number {
        return this.selectedItems.experiment;
    }
}
