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
import {MapDataObject} from "../models/MapDataObject"
import {DataHandler} from "../models/DataHandler";
import {MethodService} from "./method.service";

interface MapSettings {
    map_id: string;
    model_id: string;
    map: types.Map
}

export class MapOptionService {
    private methodService: MethodService;
    public shouldUpdateData: boolean;
    public models: string[];
    private apiService: APIService;
    // private mapObjects: MapDataObject[];
    private dataHandler: DataHandler;
    public shouldLoadMap: boolean;

    public selectedCardId: number;

    public mapSettings: MapSettings;

    // private mapObjectsIds: number[];

    // TODO: should get methods and default method from backend
    // public methods: types.Method[] = [
    //     {'id': 'fba', 'name': 'FBA'},
    //     {'id': 'pfba', 'name': 'pFBA'},
    //     {'id': 'fva', 'name': 'FVA'},
    //     {'id': 'pfba-fva', 'name': 'pFBA-FVA'},
    //     {'id': 'moma', 'name': 'MOMA'},
    //     {'id': 'lmoma', 'name': 'lMOMA'},
    //     {'id': 'room', 'name': 'ROOM'}
    // ];

    public experiments: types.Experiment[];

    private toastService: ToastService;
    private actions: ActionsService;
    // private $scope: angular.IScope;

    constructor(api: APIService, ToastService: ToastService,
                actions: ActionsService,
                MethodService: MethodService) {
        this.apiService = api;
        this.toastService = ToastService;
        this.actions = actions;
        this.methodService = MethodService;

        // this.$scope = $scope;

        this.apiService.get('experiments').then((response: angular.IHttpPromiseCallbackArg<types.Experiment[]>) => {
            this.experiments = response.data['response'];
        });

        this.init();
    }

    public init(): void{
        this.dataHandler = new DataHandler(this.methodService);
        this.selectedCardId = this.dataHandler.addObject();

        this.mapSettings = <any>{
            map_id : 'Central metabolism',
            model_id : null,
            map: {}
        };

        this.shouldLoadMap = false;
        this.shouldUpdateData = false;

    }

    public getDataObject(id: number = this.selectedCardId): MapDataObject{
        return this.dataHandler.getObject(id);
    }

    public getSelectedId(): number{
        return this.selectedCardId;
    }

    public getMapData(): types.MapData{
        return this.getDataObject().mapData;
    }

    public getReactionData(): object{
        let reactionData = this.getDataObject().mapData.map.reactionData;
        if(reactionData){
            return reactionData;
        }
        return null;
    }

    public setReactionData(data: object, id: number=this.selectedCardId){
        this.getDataObject(id).mapData.map.reactionData = data;
    }

    public getDataModel(): types.Model{
        return this.getDataObject().mapData.model;
    }

    public setDataModel(model: types.Model,
                        modelId: string,
                        objectId: number=this.selectedCardId): void{

        this.getDataObject(objectId).mapData.model = model;

        if (modelId){
            this.getDataObject(objectId).mapData.model.uid = modelId;
        }
    }


    public getDataModelId(): string{
        let dataModelId = this.getDataObject().mapData.model.uid;
        if(dataModelId){
            return dataModelId;
        }
        return null;
    }

    public getMapInfo(): object{
        let info = this.getDataObject().mapData.info;
        if(info){
            return info;
        }
        return null;
    }

    public setMapInfo(info: object, id: number = this.selectedCardId){
        this.dataHandler.getObject(id).mapData.info = info;
    }

    public getRemovedReactions(): string[]{
        return this.getDataObject().mapData.removedReactions;
    }

    public setRemovedReactions(reactions: string[]){
        this.getDataObject().setRemovedReactions(reactions);
    }

    public getCurrentGrowthRate(): number{
        return this.getDataObject().mapData.map.growthRate;
    }

    public setCurrentGrowthRate(growthRate: number){
        this.getDataObject().mapData.map.growthRate = growthRate;
        if (_.round(growthRate, 5) === 0) {
            this.toastService.showWarnToast('Growth rate is 0!');
        }
    }


    public setMethodId(method: string) : void {
        this.shouldLoadMap = true;
        this.getDataObject().selected.method = method;
        this.getDataObject().mapData.method = method;
    }

    public setExperiment(experiment: number) : void {
        this.getDataObject().selected.sample = null;
        this.getDataObject().selected.phase = null;
        this.shouldLoadMap = true;
        this.getDataObject().selected.experiment = experiment;
    }

    public setSample(sample: string) : void {
        this.getDataObject().selected.phase = null;
        this.shouldLoadMap = true;
        this.getDataObject().selected.sample = sample;
    }

    public setPhase(phase: string) : void {
        this.shouldLoadMap = true;
        this.getDataObject().selected.phase = phase;
    }

    public getCurrentSelectedItems() : types.SelectedItems {
        return this.getDataObject().selected;
    }

    // public getMapObject(id: number): types.MapObject{
    //     return this.mapObjects[id];
    // }

    // public getDeafultMethod(): string {
    //     return this.methods[1].id;
    // }

    // public getMethodName(id: string): string{
    //     let result = "_";
    //     this.methods.some((item: types.Method) =>{
    //         if(id.localeCompare(item.id) === 0){
    //             result = item.name;
    //             return true
    //         }
    //     });
    //     return result;
    // }

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
                this.setModel(this.models[0]);
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
        return this.getDataObject().selected.experiment;
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
        return this.dataHandler.getIds();
    }

    public isActiveObject(id: number){
        return id == this.selectedCardId;
    }

    public addMapObject(): void{
        this.selectedCardId = this.dataHandler.addObject();
    }

    public removeMapObject(id: number): void {
        let selectedId = this.dataHandler.removeObject(this.selectedCardId, id);
        this.setSelectedId(selectedId);
    }

    public nextMapObject(): void {
        let selectedId = this.dataHandler.nextMapObject(this.selectedCardId);
        this.setSelectedId(selectedId)
    }

    public previousMapObject(): void {
        let selectedId = this.dataHandler.previousMapObject(this.selectedCardId);
        this.setSelectedId(selectedId)
    }

    public setSelectedId(id: number) {
        this.shouldLoadMap = false;
        this.selectedCardId = id;
    }

    public actionHandler(action, id): any {
        let shared  = JSON.parse(JSON.stringify(this.getMapData()));

        if (action.type === 'reaction:knockout:do'){
            shared.removedReactions.push(id);

        }
        if (action.type === 'reaction:knockout:undo'){
            let index = shared.removedReactions.indexOf(id);
            if(index > -1){
                shared.removedReactions.splice(index, 1);
            }
        }
        return this.actions.callAction(action, {shared: shared})
    }

    public isMaster(id: number): boolean {
            return this.dataHandler.isMaster(id);
    }

    public dataUpdated(): void {
        this.shouldUpdateData = false;
    }

    public getMap(): object{
        return this.mapSettings.map.map;
    }

    public setMap(map: object): void{
        this.mapSettings.map.map = map;
    }

    public setModel(modelId: string): void{
        if(this.mapSettings.model_id){
            this.shouldUpdateData = true;
        }
        this.mapSettings.model_id = modelId;
    }

    public getModel(): string {
        return this.mapSettings.model_id;
    }

    public getMapId(): string{
        if(this.mapSettings.map.map) {
            return this.mapSettings.map.map[0].map_id;
        }
        return null;
    }
    public getMapSettings(): MapSettings {
        return this.mapSettings;
    }

    public getSelectedMap() : string {
        return this.mapSettings.map_id;
    }

    public setSelectedMap(map_id: string): void{
        this.mapSettings.map_id = map_id;
    }

    public getCollectionSize(): number{
        return this.dataHandler.size();
    }
}
