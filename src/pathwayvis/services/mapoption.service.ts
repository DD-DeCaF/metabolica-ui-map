///<reference path="actions/actions.service.ts"/>
/**
 * Created by dandann on 03/04/2017.
 */

import * as types from '../types'
import * as _ from 'lodash';
import {APIService} from "./api";
import {ToastService} from "./toastservice";
import angular = require("angular");
import {ActionsService} from "./actions/actions.service";

interface MapSettings {
    map_id: string;
    model_id: string;
    map: types.Map
}

export class MapOptionService {
    public shouldUpdateData: boolean;
    public models: string[];
    private apiService: APIService;
    private mapObjects: types.MapObject[];
    public shouldLoadMap: boolean;

    public selectedMapObjectId: number;

    public mapSettings: MapSettings;

    private mapObjectsIds: number[];

    // TODO: should get methods and default method from backend
    public methods: types.Method[] = [
        {'id': 'fba', 'name': 'FBA'},
        {'id': 'pfba', 'name': 'pFBA'},
        {'id': 'fva', 'name': 'FVA'},
        {'id': 'pfba-fva', 'name': 'pFBA-FVA'},
        {'id': 'moma', 'name': 'MOMA'},
        {'id': 'lmoma', 'name': 'lMOMA'},
        {'id': 'room', 'name': 'ROOM'}
    ];

    public experiments: types.Experiment[];

    private toastService: ToastService;
    private actions: ActionsService;
    // private $scope: angular.IScope;

    constructor(api: APIService, ToastService: ToastService, actions: ActionsService) {
        this.apiService = api;
        this.toastService = ToastService;
        this.actions = actions;
        // this.$scope = $scope;

        this.apiService.get('experiments').then((response: angular.IHttpPromiseCallbackArg<types.Experiment[]>) => {
            this.experiments = response.data['response'];
        });

        this.init();
    }

    public init(): void{
        this.mapObjectsIds = [];
        this.mapSettings = <any>{
            map_id : 'Central metabolism',
            model_id : null,
            map: {}
        };
        this.selectedMapObjectId = 0;

        this.mapObjects = [];
        this.shouldLoadMap = false;

        this.shouldUpdateData = false;

        this.addMapObject();
    }

    public getCurrentMapObject(): types.MapObject{
        return this.mapObjects[this.selectedMapObjectId];
    }

    public getCurrentMapObjectId(): number{
        return this.selectedMapObjectId;
    }

    public getCurrentMapData(): types.MapData{
        return this.mapObjects[this.selectedMapObjectId].mapData;
    }

    public getCurrentMapId(): string{
        if(this.mapSettings.map.map) {
            return this.mapSettings.map.map[0].map_id;
        }
        return null;
    }

    public getCurrentMap(): object{
        return this.mapSettings.map.map;
    }

    public setMap(map: object): void{
        this.mapSettings.map.map = map;
    }

    public getCurrentReactionData(): object{
        if(this.mapObjects[this.selectedMapObjectId].mapData.map.reactionData){
            return this.mapObjects[this.selectedMapObjectId].mapData.map.reactionData;
        }
        return null;
    }

    public setReactionData(data: object, object_id: number=null){
        if(!object_id){
            object_id = this.selectedMapObjectId;
        }
        this.mapObjects[object_id].mapData.map.reactionData = data;
    }

    public getCurrentModel(): types.Model{
        return this.mapObjects[this.selectedMapObjectId].mapData.model;
    }

    public setModel(model: types.Model, model_id: string, object_id: number=null): void{
        if(!object_id){
            object_id = this.selectedMapObjectId;
        }

        this.mapObjects[object_id].mapData.model = model;

        if (model_id){
            this.mapObjects[object_id].mapData.model.uid = model_id;
        }
    }

    public setSelectedModel(model_id: string): void{
        if(this.mapSettings.model_id){
            this.shouldUpdateData = true;
        }
        this.mapSettings.model_id = model_id;
    }

    public getCurrentModelId(): string{
        if(this.mapObjects[this.selectedMapObjectId].mapData.model.uid){
            return this.mapObjects[this.selectedMapObjectId].mapData.model.uid;
        }
        return null;
    }

    public getCurrentMapInfo(): object{
        if(this.mapObjects[this.selectedMapObjectId].mapData.info){
            return this.mapObjects[this.selectedMapObjectId].mapData.info;
        }
        return null;
    }

    public setMapInfo(info: object, object_id: number = null){
        if(!object_id){
            object_id = this.selectedMapObjectId;
        }
        this.mapObjects[object_id].mapData.info = info;
    }

    public getCurrentRemovedReactions(): string[]{
        return this.mapObjects[this.selectedMapObjectId].mapData.removedReactions;
    }

    public setRemovedReactions(reactions: string[]){
        this.mapObjects[this.selectedMapObjectId].mapData.removedReactions = reactions;
    }

    public getCurrentGrowthRate(): number{
        return this.mapObjects[this.selectedMapObjectId].mapData.map.growthRate;
    }

    public setCurrentGrowthRate(growthRate: number){
        this.mapObjects[this.selectedMapObjectId].mapData.map.growthRate = growthRate;
        if (_.round(growthRate, 5) === 0) {
            this.toastService.showWarnToast('Growth rate is 0!');
        }
    }


    public setMethodId(method: string) : void {
        this.shouldLoadMap = true;
        this.mapObjects[this.selectedMapObjectId].selected.method = method;
    }

    public setExperiment(experiment: number) : void {
        this.mapObjects[this.selectedMapObjectId].selected.sample = null;
        this.mapObjects[this.selectedMapObjectId].selected.phase = null;
        this.shouldLoadMap = true;
        this.mapObjects[this.selectedMapObjectId].selected.experiment = experiment;
    }

    public setSample(sample: string) : void {
        this.mapObjects[this.selectedMapObjectId].selected.phase = null;
        this.shouldLoadMap = true;
        this.mapObjects[this.selectedMapObjectId].selected.sample = sample;
    }

    public setPhase(phase: string) : void {
        this.shouldLoadMap = true;
        this.mapObjects[this.selectedMapObjectId].selected.phase = phase;
    }

    public getCurrentSelectedItems() : types.SelectedItems {
        return this.mapObjects[this.selectedMapObjectId].selected;
    }

    public getMapObject(id: number): types.MapObject{
        return this.mapObjects[id];
    }

    public getDeafultMethod(): string {
        return this.methods[1].id;
    }

    public getMethodName(id: string): string{
        let result = "_";
        this.methods.some((item: types.Method) =>{
            if(id.localeCompare(item.id) === 0){
                result = item.name;
                return true
            }
        });
        return result;
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
            return promise;
        }
    }

    public getPhases(sample: string) : angular.IPromise<Object> {
        if (sample) {
            return this.apiService.post('samples/phases', {
                'sampleIds': JSON.parse(sample)
            });
        }
    }

    public setModelsFromSample(sample: string): void{
        this.getModelOptions(sample).then(
            (response: angular.IHttpPromiseCallbackArg<string[]>) => {
                this.models = response.data['response'];
                this.setSelectedModel(this.models[0]);
            }, (error) => {
                this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
            });
    }

    public getModels(): string[]{
        return this.models;
    }

    public getModelOptions(sample: string) : angular.IPromise<Object> {
        if (sample) {
            return this.apiService.post('samples/model-options', {
                'sampleIds': JSON.parse(sample)
            });
        }
    }

    public getExperiment(): number {
        return this.mapObjects[this.selectedMapObjectId].selected.experiment;
    }

    public getExperiments(): types.Experiment[]{
        return this.experiments;
    }

    public getExperimentName(id: number): string{
        let result = "_";
        if(this.experiments){
            this.experiments.some((item: types.Experiment) =>{
                if(id == item.id){
                    result = item.name;
                    return true
                }
            });
        }
        return result;
    }

    public getMapObjectsIds(): number[] {
        return this.mapObjectsIds;
    }

    public isActiveObject(id: number){
        return id == this.selectedMapObjectId;
    }

    public addMapObject(): void{
        let id = this.mapObjects.length;
        let obj = <any> {
            id: id,
            selected: {
                'mapId' : 'Central metabolism',
                'modelId' : null,
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
        this.mapObjectsIds.push(id);
        this.selectedMapObjectId = id;
    }

    public removeMapObject(id: number): void {
        this.nextMapObject();
        let index = this.mapObjectsIds.indexOf(id);
        this.mapObjectsIds.splice(index, 1);
        this.mapObjects[id] = null;
    }

    public nextMapObject(): void {
        let index = this.mapObjectsIds.indexOf(this.selectedMapObjectId) + 1;
        let activeId = 0;
        if(index > this.mapObjectsIds.length - 1){
            activeId = this.mapObjectsIds[0];
        } else {
            activeId = this.mapObjectsIds[index];
        }

        this.setActiveObject(activeId);
    }

    public previousMapObject(): void {
        let index = this.mapObjectsIds.indexOf(this.selectedMapObjectId) - 1;
        let activeId = 0;
        if(index < 0){
            activeId = this.mapObjectsIds[this.mapObjectsIds.length-1];
        } else {
            activeId = this.mapObjectsIds[index];
        }
        this.setActiveObject(activeId);
    }

    public compareSelectedItems(selected1: types.SelectedItems, selected2: types.SelectedItems): boolean{
        return selected1.method == selected2.method &&
                selected1.experiment == selected2.experiment &&
                selected1.sample == selected2.sample &&
                selected1.phase == selected2.phase
    }

    public isCompleteMapObject(mapObject: types.MapObject): boolean{
         if(mapObject.mapData.map.reactionData && mapObject.mapData.model){
             return true;
         }
         return false;
    }

    public setActiveObject(id: number) {
        this.shouldLoadMap = false;
        this.selectedMapObjectId = id;
    }

    public getMethods(): object {
        return this.methods;
    }

    public getNumberOfMapObjects(): number {
        return this.mapObjects.length;
    }

    public actionHandler(action, id): any {
        const shared  = JSON.parse(JSON.stringify(this.getCurrentMapData()));

        if (action.type === 'reaction:knockout:do') shared.removedReactions.push(id);
        if (action.type === 'reaction:knockout:undo'){
            let index = shared.removedReactions.indexOf(id);
            if(index > -1){
                shared.removedReactions.splice(index, 1);
            }
        }
        return this.actions.callAction(action, {shared: shared})
    }


    public isMaster(id: number): boolean {
        return this.mapObjectsIds[0] == id;
    }

    public setModels(models: string[]) {
        this.models = models;
    }

    public dataUpdated(): void {
        this.shouldUpdateData = false;
    }
}
