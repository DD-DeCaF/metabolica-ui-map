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
    private mapObjects: types.MapObject[] = [];

    public selectedMapObject: number = 0;

    public mapSettings: MapSettings = {
        'map_id' : 'Central metabolism',
        'model_id' : null
    };

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

        this.addMapObject();
    }

    public getCurrentMapObject(): types.MapObject{
        return this.mapObjects[this.selectedMapObject];
    }

    public getCurrentMapData(): types.MapData{
        return this.mapObjects[this.selectedMapObject].mapData;
    }

    public getCurrentMapId(): string{
        if(this.mapObjects[this.selectedMapObject].mapData.map.map) {
            return this.mapObjects[this.selectedMapObject].mapData.map.map[0].map_id;
        }
        return null;
    }

    public getCurrentMap(): object{
        return this.mapObjects[this.selectedMapObject].mapData.map.map;
    }

    public setMap(map: object): void{
        this.mapObjects[this.selectedMapObject].mapData.map.map = map;
    }

    public getCurrentReactionData(): object{
        if(this.mapObjects[this.selectedMapObject].mapData.map.reactionData){
            return this.mapObjects[this.selectedMapObject].mapData.map.reactionData;
        }
        return null;
    }

    public setReactionData(data: object){
        this.mapObjects[this.selectedMapObject].mapData.map.reactionData = data;
    }

    public getCurrentModel(): types.Model{
        return this.mapObjects[this.selectedMapObject].mapData.model;
    }

    public setModel(model: types.Model, model_id: string): void{
        this.mapObjects[this.selectedMapObject].mapData.model = model;
        if (model_id){
            this.mapObjects[this.selectedMapObject].mapData.model.uid = model_id;
        }
    }

    public getCurrentModelId(): string{
        if(this.mapObjects[this.selectedMapObject].mapData.model.uid){
            return this.mapObjects[this.selectedMapObject].mapData.model.uid;
        }
        return null;
    }

    public getCurrentMapInfo(): object{
        if(this.mapObjects[this.selectedMapObject].mapData.info){
            return this.mapObjects[this.selectedMapObject].mapData.info;
        }
        return null;
    }

    public setMapInfo(info: object){
        this.mapObjects[this.selectedMapObject].mapData.info = info;
    }

    public getCurrentRemovedReactions(): string[]{
        return this.mapObjects[this.selectedMapObject].mapData.removedReactions;
    }

    public setRemovedReactions(reactions: string[]){
        this.mapObjects[this.selectedMapObject].mapData.removedReactions = reactions;
    }

    public getCurrentGrowthRate(): number{
        return this.mapObjects[this.selectedMapObject].mapData.map.growthRate;
    }

    public setCurrentGrowthRate(growthRate: number){
        this.mapObjects[this.selectedMapObject].mapData.map.growthRate = growthRate;
        if (_.round(growthRate, 5) === 0) {
            this.toastService.showWarnToast('Growth rate is 0!');
        }
    }


    public setMethodId(method: string) : void {
        this.mapObjects[this.selectedMapObject].selected.method = method;
    }

    public setExperiment(experiment: number) : void {
        this.mapObjects[this.selectedMapObject].selected.sample = null;
        this.mapObjects[this.selectedMapObject].selected.phase = null;
        this.mapObjects[this.selectedMapObject].selected.experiment = experiment;
    }

    public setSample(sample: number) : void {
        this.mapObjects[this.selectedMapObject].selected.phase = null;
        this.mapObjects[this.selectedMapObject].selected.sample = sample;
    }

    public setPhase(phase: number) : void {
        this.mapObjects[this.selectedMapObject].selected.phase = phase;
    }

    public getCurrentSelectedItems() : types.SelectedItems {
        return this.mapObjects[this.selectedMapObject].selected;
    }

    public getDeafultMethod(): string {
        return 'pfba';
    }

    public getMapSettings(): MapSettings {
        return this.mapSettings;
    }

    public getModel(): string {
        return this.mapSettings.model_id;
    }

    public getSelectedMap() : string {
        return this.mapSettings.map_id;
    }

    public setSelectedMap(map_id: string): void{
        this.mapSettings.map_id = map_id;
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
            this.mapSettings.model_id = this.organismModel[this.samplesSpecies[sample]];
            return this.apiService.get('samples/:sampleId/phases', {
                sampleId: sample
            });
        }
    }

    public getExperiment(): number {
        return this.mapObjects[this.selectedMapObject].selected.experiment;
    }

    public getMapObjectsIds(): number[] {
        let ids = [];
        this.mapObjects.forEach((item: types.MapObject) => {
            ids.push(item.id);
        });
        return ids;
    }

    public isActiveObject(id: number){
        return id == this.selectedMapObject;
    }

    public addMapObject(): void{
        let id = this.mapObjects.length;
        let obj = <any> {
            id: id,
            selected: {
                'map_id' : 'Central metabolism',
                'model_id' : null,
                'method': this.getDeafultMethod()
            },
            mapData: {
                map: {},
                model: {},
                sections: {},
                info: {},
                removedReactions: []
            }
        };
        this.mapObjects.push(obj);
        this.selectedMapObject = id;
    }

    public compareSelectedItems(selected1: types.SelectedItems, selected2: types.SelectedItems): boolean{
        return selected1.method == selected2.method &&
                selected1.experiment == selected2.experiment &&
                selected1.sample == selected2.sample &&
                selected1.phase == selected2.phase
    }

    public isCompleteMapObject(mapObject: types.MapObject): boolean{
         if(mapObject.mapData.map.reactionData && mapObject.mapData.model && mapObject.mapData.map.map){
             return true;
         }
         return false;
    }

    public setActiveObject(id: number) {
        this.selectedMapObject = id;
    }

    public getMethods(): object {
        return this.methods;
    }


}
