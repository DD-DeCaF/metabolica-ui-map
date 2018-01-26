import * as types from '../types';
import * as angular from "angular";
import * as Rx from 'rxjs/Rx';

import { APIService } from "./api";
import { ToastService } from "./toastservice";
import { ActionsService } from "./actions/actions.service";
import { MapDataObject } from "../models/MapDataObject";
import { DataHandler } from "../models/DataHandler";
// TODO @matyasfodor access these through types. (..)
import { AddedReaction, Experiment, Method, ObjectType, Phase, Sample, Species, MapSettings } from "../types";
import { ExperimentService } from "./experiment.service";

export class MapOptionService {
  private experimentService: ExperimentService;
  public shouldUpdateData: boolean;
  public modelsIds: string[];
  private apiService: APIService;
  private dataHandler: DataHandler;
  public shouldLoadMap: boolean;

  public selectedCardId: number;

  public mapSettings: types.MapSettings;

  private speciesList: Species[] = [];

  public selectedSpecies: string = "ECOLX";

  private toastService: ToastService;
  private actions: ActionsService;

  public addedReactionsObservable: Rx.Observable<any>;
  private addedReactionsSubject: Rx.Subject<any>;

  public reactionsObservable: Rx.Observable<any>;
  private reactionsSubject: Rx.Subject<any>;

  public removedReactionsObservable: Rx.Observable<any>;
  private removedReactionsSubject: Rx.Subject<any>;
  // TODO rename services to lowercase
  constructor(api: APIService, toastService: ToastService,
    actions: ActionsService,
    experimentService: ExperimentService) {
    this.apiService = api;
    this.toastService = toastService;
    this.actions = actions;
    this.experimentService = experimentService;

    this.reactionsSubject = new Rx.Subject();
    this.reactionsObservable = this.reactionsSubject.asObservable();

    this.addedReactionsSubject = new Rx.Subject();
    this.addedReactionsObservable = this.addedReactionsSubject.asObservable();

    this.removedReactionsSubject = new Rx.Subject();
    this.removedReactionsObservable = this.removedReactionsSubject.asObservable();
    this.init();
  }

  public init(): void {
    this.apiService.get('species/current').then((response: types.CallbackEmbeddedResponse<any>) => {
      const species = response.data.response;
      this.speciesList = Object.entries(species).map(([id, name]) => ({ id, name }));

      // Set selected species
      this.setModelsFromSpecies(this.selectedSpecies);
    });
    this.dataHandler = new DataHandler();
    this.selectedCardId = this.dataHandler.addObject(ObjectType.Reference);

    this.mapSettings = <types.MapSettings> {
      map_id: 'Central metabolism',
      model_id: null,
      map: {},
    };

    this.shouldLoadMap = false;
    this.shouldUpdateData = false;

    this.setExperimentsFromSpecies();
  }

  private setExperimentsFromSpecies(speciesCode = this.selectedSpecies): void {
    this.experimentService.setExperiments(speciesCode);
  }

  public getSelectedSpecies(): string {
    return this.selectedSpecies;
  }

  public getSpeciesList(): Species[] {
    return this.speciesList;
  }

  public getDataObject(id: number = this.selectedCardId): MapDataObject {
    return this.dataHandler.getObject(id);
  }

  public getType(id: number = this.selectedCardId): ObjectType {
    return this.dataHandler.getObject(id).type;
  }

  public getSelectedId(): number {
    return this.selectedCardId;
  }

  public getMapData(): types.MapData {
    return this.getDataObject().mapData;
  }

  public getReactionData(): object {
    const reactionData = this.getDataObject().mapData.map.reactionData;
    return reactionData ? reactionData : null;
  }

  public setReactionData(data: object, id: number = this.selectedCardId) {
    this.getDataObject(id).mapData.map.reactionData = data;
  }

  public getDataModel(): types.Model {
    return this.getDataObject().mapData.model;
  }

// TODO @matyasfodor make distinciton between uid and id.
  public setDataModel(model: types.Model,
    modelId?: string,
    objectId: number = this.selectedCardId): void {

    this.reactionsSubject.next(model.reactions
      .map(({id, name}) => ({id, name})));
    // Save the original uid, if the new uid is not provided, re-use it
    const uid = this.getDataObject(objectId).mapData.model.uid;
    this.getDataObject(objectId).mapData.model = model;
    this.getDataObject(objectId).mapData.model.uid = modelId || uid;
  }

  public getDataModelId(): string {
    const dataModelId = this.getDataObject().mapData.model.uid;
    return dataModelId ? dataModelId : null;
  }

  public getMapInfo(): types.MapInfo {
    return this.getDataObject().mapData.info;
  }

  public setMapInfo(info: object, id: number = this.selectedCardId) {
    this.dataHandler.getObject(id).mapData.info = info;
  }

  public getRemovedReactions(): string[] {
    return this.getDataObject().mapData.removedReactions;
  }

  public setRemovedReactions(reactions: string[]) {
    this.getDataObject().setRemovedReactions(reactions);
    this.removedReactionsSubject.next(reactions);
  }

  public getCurrentGrowthRate(): number {
    return this.getDataObject().mapData.map.growthRate;
  }

  public setCurrentGrowthRate(growthRate: number) {
    this.getDataObject().mapData.map.growthRate = growthRate;
  }

  // @matyasfodor no check for undefined
  public setMethod(method: Method): void {
    this.shouldLoadMap = true;
    this.getDataObject().selected.method = method;
    this.getDataObject().mapData.method = method.id;
  }

  public setExperiment(experiment: Experiment): void {
    this.getDataObject().selected.sample = null;
    this.getDataObject().selected.phase = null;
    this.shouldLoadMap = true;
    this.getDataObject().selected.experiment = experiment;
  }

  public setSample(sample: Sample): void {
    this.getDataObject().selected.phase = null;
    this.shouldLoadMap = true;
    this.getDataObject().selected.sample = sample;
  }

  public setPhase(phase: Phase): void {
    this.shouldLoadMap = true;
    this.getDataObject().selected.phase = phase;
  }

  public getCurrentSelectedItems(): types.SelectedItems {
    return this.getDataObject().selected;
  }

  public getSamples(experimentId: number): angular.IPromise<Object> {
    // Why check for experimentId here? It fails if it's 0
    // Return value is not obvious.
    if (experimentId) {
      return this.apiService
        .get('experiments/:experimentId/samples', { experimentId });
    }
  }

  public getPhases(sampleIds: number[]): angular.IPromise<Object> {
    // Check should not happen here
    if (sampleIds) {
      return this.apiService.post('samples/phases', { sampleIds });
    }
  }

  public setModelsFromSample(sample: string): void {
    this.getModelOptions(sample).then((response: angular.IHttpPromiseCallbackArg<any>) => {
        this.modelsIds = response.data.response;
        this.setModelId(this.modelsIds[0]);
      }, (error) => {
        this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
      });
  }

  public speciesChanged(species: string): void {
    this.setModelsFromSpecies(species);
    this.setExperimentsFromSpecies(species);
  }

  public setModelsFromSpecies(species: string): void {
    if (species) {
      let url = 'model-options/' + species;
      this.apiService.getModel(url, {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
        this.modelsIds = response.data;
        this.shouldUpdateData = true;
        this.mapSettings.model_id = this.modelsIds[0];
      });
    }
  }

  public getModels(): string[] {
    return this.modelsIds;
  }

  public getModelOptions(sample: string): angular.IPromise<Object> {
    if (sample) {
      return this.apiService.post('samples/model-options', {
        sampleIds: JSON.parse(sample),
      });
    }
  }

  public getExperiment(): Experiment {
    return this.getDataObject().selected.experiment;
  }

  public getMapObjectsIds(): number[] {
    return this.dataHandler.ids;
  }

  public isActiveObject(id: number) {
    return id === this.selectedCardId;
  }

  public addRefMapObject(): void {
    this.selectedCardId = this.dataHandler.addObject(ObjectType.Reference);
  }

  public addExpMapObject(): void {
    this.selectedCardId = this.dataHandler.addObject(ObjectType.Experiment);
  }

  public addMapObject(type: ObjectType = null): void {
    this.selectedCardId = this.dataHandler.addObject(type);
  }

  public removeMapObject(id: number): void {
    let selectedId = this.dataHandler.removeObject(this.selectedCardId, id);
    this.setSelectedId(selectedId);
  }

  public nextMapObject(): void {
    let selectedId = this.dataHandler.nextMapObject(this.selectedCardId);
    this.setSelectedId(selectedId);
  }

  public previousMapObject(): void {
    let selectedId = this.dataHandler.previousMapObject(this.selectedCardId);
    this.setSelectedId(selectedId);
  }

  public setSelectedId(id: number) {
    this.shouldLoadMap = false;
    this.selectedCardId = id;
  }

  public actionHandler(
    action,
    {id = null, reaction = null, reactions = null}: {id?: string, reaction?: AddedReaction, reactions?: AddedReaction[]}): any {
    const shared = angular.copy(this.getMapData());

    // TODO write a nice, functional switch-case statement
    if (action.type === 'reaction:knockout:do') {
      if (id) shared.removedReactions.push(id);
    } else if (action.type === 'reaction:knockout:undo') {
      let index = shared.removedReactions.indexOf(id);
      if (index > -1) {
        shared.removedReactions.splice(index, 1);
      }
    } else if (action.type === 'reaction:update') {
      if (reaction) shared.addedReactions.push(reaction);
    }
    return this.actions.callAction(action, { shared: shared });
  }

  public dataUpdated(): void {
    this.shouldUpdateData = false;
  }

  public getMap(): object {
    return this.mapSettings.map.map;
  }

  public setMap(map: object): void {
    this.mapSettings.map.map = map;
  }

  public setModel(model: types.Model, id: number = this.selectedCardId) {
    this.shouldUpdateData = true;
    this.getDataObject(id).mapData.model = model;
  }

  public setModelId(modelId: string): void {
    if (this.mapSettings.model_id) {
      this.shouldUpdateData = true;
    }
    this.mapSettings.model_id = modelId;
  }

  public getModelId(): string {
    return this.mapSettings.model_id;
  }

  public getMapId(): string {
    if (this.mapSettings.map.map) {
      return this.mapSettings.map.map[0].map_id;
    }
    return null;
  }
  public getMapSettings(): types.MapSettings {
    return this.mapSettings;
  }

  public getSelectedMap(): string {
    return this.mapSettings.map_id;
  }

  public setSelectedMap(map_id: string): void {
    this.mapSettings.map_id = map_id;
  }

  public getCollectionSize(): number {
    return this.dataHandler.size();
  }

  public getAddedReactions(): AddedReaction[] {
    return this.getDataObject().mapData.addedReactions;
  }

  public setAddedReactions(reactions: AddedReaction[]): void {
    this.getDataObject().mapData.addedReactions = reactions;
    this.addedReactionsSubject.next(reactions);
  }

  public addReaction(addedReaction: AddedReaction): any {
    return this.actionHandler(this.actions.getAction('reaction:update'), {reaction: addedReaction});
  }

  public removeReaction(bigg_id: string): any {
    const mapData = this.getMapData();
    const index = mapData.addedReactions.findIndex((r) => r.bigg_id === bigg_id);
    mapData.addedReactions.splice(index, 1);
    // TODO add reaction here?
    return this.actionHandler(this.actions.getAction('reaction:update'), {});
  }

  public setSharedPathway(item): void {
    this.getMapData().pathwayData = item;
  }

  public getSharedPathway(): any {
    return this.getMapData().pathwayData;
  }
}
