// Copyright 2018 Novo Nordisk Foundation Center for Biosustainability, DTU.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as types from '../types';
import * as angular from "angular";
import * as Rx from 'rxjs/Rx';

import { APIService } from "./api";
import { ToastService } from "./toastservice";
import { ActionsService } from "./actions/actions.service";
import { MapDataObject } from "../models/MapDataObject";
import { DataHandler } from "../models/DataHandler";
import { SharedService } from '../services/shared.service';
import { Logger } from '../providers/log.provider';

// TODO @matyasfodor access these through types. (..)
import { AddedReaction, ChangedReaction, Experiment, Method, ObjectType, Phase, Sample, Species, MapSettings } from "../types";
import { ExperimentService } from "./experiment.service";

export class MapOptionService {
  private experimentService: ExperimentService;
  private apiService: APIService;
  private dataHandler: DataHandler;
  private $q: angular.IQService;
  private logger: Logger;

  public componentCB: () => void = null;

  public shouldUpdateData: boolean = false;
  public shouldLoadMap: boolean = false;
  public modelsIds: string[];

  public loaded: angular.IPromise<void>;
  public selectedCardId: number;

  public mapSettings: types.MapSettings = {
    map_id: 'Central metabolism',
    model_id: null,
  };

  private map: types.MetabolicMap;

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

  public objectiveReactionObservable: Rx.Observable<any>;
  private objectiveReactionSubject: Rx.Subject<any>;

  public objectiveDirectionObservable: Rx.Observable<any>;
  private objectiveDirectionSubject: Rx.Subject<any>;

  public changeReactionsObservable: Rx.Observable<any>;
  private changeReactionsSubject: Rx.Subject<any>;

  public setBoundsObservable: Rx.Observable<any>;
  private setBoundsReactionSubject: Rx.Subject<any>;
  // TODO rename services to lowercase
  constructor(
      api: APIService,
      toastService: ToastService,
      actions: ActionsService,
      experimentService: ExperimentService,
      $q: angular.IQService,
      logger: Logger) {
    this.apiService = api;
    this.toastService = toastService;
    this.actions = actions;
    this.experimentService = experimentService;
    this.$q = $q;
    this.logger = logger;

    this.reactionsSubject = new Rx.Subject();
    this.reactionsObservable = this.reactionsSubject.asObservable();

    this.addedReactionsSubject = new Rx.Subject();
    this.addedReactionsObservable = this.addedReactionsSubject.asObservable();

    this.removedReactionsSubject = new Rx.Subject();
    this.removedReactionsObservable = this.removedReactionsSubject.asObservable();

    this.objectiveReactionSubject = new Rx.Subject();
    this.objectiveReactionObservable = this.objectiveReactionSubject.asObservable();

    this.objectiveDirectionSubject = new Rx.Subject();
    this.objectiveDirectionObservable = this.objectiveDirectionSubject.asObservable();

    this.changeReactionsSubject = new Rx.Subject();
    this.changeReactionsObservable = this.changeReactionsSubject.asObservable();

    this.setBoundsReactionSubject = new Rx.Subject();
    this.setBoundsObservable = this.setBoundsReactionSubject.asObservable();

    this.dataHandler = new DataHandler();
  }

  public init() {
    this.mapSettings = {
      map_id: 'Central metabolism',
      model_id: null,
    };
    this.dataHandler = new DataHandler();

    this.loaded = this.$q.all([
      this.apiService.get('iloop-to-model/species/current').then((response: types.CallbackEmbeddedResponse<any>) => {
        this.speciesList = Object.entries(response.data.response)
          .map(([id, name]) => (<Species> { id, name }));
        // Set selected species
        return this.setModelsFromSpecies(this.selectedSpecies);
      }),
      this.setExperimentsFromSpecies(),
    ]).then(() => {/* */});
  }

  private setExperimentsFromSpecies(speciesCode = this.selectedSpecies): angular.IPromise<void> {
    return this.experimentService.setExperiments(speciesCode);
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

  public setRemovedReactions(reactions: string[], id: number) {
    this.getDataObject(id).setRemovedReactions(reactions);
    this.removedReactionsSubject.next(reactions);
  }

  public getObjectiveReaction(): string {
    return this.getDataObject().mapData.objectiveReaction;
  }

  public setObjectiveReaction(reaction: string) {
    this.getDataObject().setObjectiveReaction(reaction);
    this.objectiveReactionSubject.next(reaction);
  }

  public getObjectiveDirection(): string {
    return this.getDataObject().mapData.objectiveDirection;
  }

  public setObjectiveDirection(direction: string) {
    this.getDataObject().setObjectiveDirection(direction);
    this.objectiveDirectionSubject.next(direction);
  }

  public getChangedReactions(): ChangedReaction[] {
    return this.getDataObject().mapData.changedReactions;
  }

  public setChangedReactions(reactions: ChangedReaction[]): void {
    this.getDataObject().mapData.changedReactions = reactions;
    this.changeReactionsSubject.next(reactions);
  }

  public addChangedReactions(changedReactions: ChangedReaction[]): any {
    return this.actionHandler(this.actions.getAction('reaction:updateChangedReactions'), {changedReactions});
  }

  public addChangedReaction(reaction: ChangedReaction): any {
    return this.addChangedReactions([reaction]);
  }

  public removeChangedReaction(bigg_id: string): any {
    const mapData = this.getMapData();
    const index = mapData.changedReactions.findIndex((r) => r.id === bigg_id);
    mapData.changedReactions.splice(index, 1);
    // TODO add reaction here?
    return this.actionHandler(this.actions.getAction('reaction:update'), {});
  }

  public getCurrentGrowthRate(): number {
    return this.getDataObject().mapData.map.growthRate;
  }

  public setCurrentGrowthRate(growthRate: number, id: number) {
    this.getDataObject(id).mapData.map.growthRate = growthRate;
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
        .get(`iloop-to-model/experiments/${experimentId}/samples`);
    }
  }

  public getPhases(sampleIds: number[]): angular.IPromise<Object> {
    return this.apiService.post('iloop-to-model/samples/phases', { sampleIds });
  }

  public setModelsFromSample(sample: string): void {
    this.getModelOptions(sample).then((response: angular.IHttpPromiseCallbackArg<any>) => {
        this.modelsIds = response.data.response;
        this.setModelId(this.modelsIds[0]);
      }, (error) => {
        this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
      });
  }

  public speciesChanged(species: string): any {
    return this.$q.all([
      this.setModelsFromSpecies(species),
      this.setExperimentsFromSpecies(species),
    ]);
  }

  public setModelsFromSpecies(species: string): angular.IPromise<void> {
    return this.apiService.getModel(`model-options/${species}`)
      .then((response: angular.IHttpPromiseCallbackArg<any>) => {
        this.modelsIds = response.data;
        this.shouldUpdateData = true;
        this.mapSettings.model_id = this.modelsIds[0];
    });
  }

  public getModels(): string[] {
    return this.modelsIds;
  }

  public getModelOptions(sample: string): angular.IPromise<Object> {
    if (sample) {
      return this.apiService.post('iloop-to-model/samples/model-options', {
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

  public addRefMapObject(): number {
    const id = this.dataHandler.addObject(ObjectType.Reference);
    this.selectedCardId = id;
    return id;
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

    const newMapData = this.getDataObject().mapData;
    this.componentCB();
    this.addedReactionsSubject.next(newMapData.addedReactions);
    this.removedReactionsSubject.next(newMapData.removedReactions);
    this.objectiveReactionSubject.next(newMapData.objectiveReaction);
    this.reactionsSubject
      .next(newMapData.model.reactions
        .map((r) => ({id: r.id, name: r.name})));
  }

  public actionHandler(
    action,
    {id = null, reactions = [], changedReactions = null, bounds = null}: {id?: string,
      reactions?: AddedReaction[], changedReactions?: ChangedReaction[], bounds?}): any {
    const shared = angular.copy(this.getMapData());
    // TODO write a nice, functional switch-case statement
    if (action.type === 'reaction:knockout:do') {
      if (id) {
        shared.removedReactions.push(id);
        if (id === this.getObjectiveReaction()) {
          this.setObjectiveReaction(null);
        }
      }
      this.logger.log('event', 'knockout', {
        event_category: 'PathwayMap',
        event_label: id,
      });
    } else if (action.type === 'reaction:knockout:undo') {
      let index = shared.removedReactions.indexOf(id);
      if (index > -1) {
        shared.removedReactions.splice(index, 1);
      }
    } else if (action.type === 'reaction:update') {
      shared.addedReactions = [...shared.addedReactions, ...reactions];
      this.logger.log('event', 'add reaction', {
        event_category: 'PathwayMap',
        event_label: id,
      });
    } else if (action.type === 'reaction:objective:do') {
      if (id) {
        shared.objectiveReaction = id;
        shared.objectiveDirection = 'max';
        this.logger.log('event', 'set objective reaction', {
          event_category: 'PathwayMap',
          event_label: id,
        });
      }
    } else if (action.type === 'reaction:objective:undo') {
      shared.objectiveReaction = null;
    }
    if (action.type === 'reaction:bounds:do') {
      let index = shared.changedReactions.findIndex((reaction) => reaction.id === id);
      shared.changedReactions[index > -1 ? index : shared.changedReactions.length] = {
        id: id,
        lower_bound: bounds.lower,
        upper_bound: bounds.upper,
      };
    } else if (action.type === 'reaction:bounds:undo') {
      shared.changedReactions = shared.changedReactions.filter((reaction) => reaction.id !== id);
    }
    if (action.type === 'reaction:updateChangedReactions') {
      shared.changedReactions = [...shared.changedReactions, ...changedReactions];
      this.logger.log('event', 'changed reaction', {
        event_category: 'PathwayMap',
        event_label: id,
      });
    }
    shared.objectiveDirection = action.type === 'reaction:minimize:do' ? 'min' : 'max';
    return this.actions.callAction(action, { shared, cardId: this.getSelectedId()});
  }

  public dataUpdated(): void {
    this.shouldUpdateData = false;
  }

  public getMap(): object {
    return this.map;
  }

  public setMap(map: types.MetabolicMap): void {
    this.map = map;
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
    if (this.map) {
      return this.map[0].map_id;
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

  public addReactions(reactions: AddedReaction[]): any {
    return this.actionHandler(this.actions.getAction('reaction:update'), {reactions});
  }

  public addReaction(reaction: AddedReaction): any {
    return this.addReactions([reaction]);
  }

  public removeReaction(bigg_id: string): any {
    const mapData = this.getMapData();
    const index = mapData.addedReactions.findIndex((r) => r.bigg_id === bigg_id);
    mapData.addedReactions.splice(index, 1);
    // TODO add reaction here?
    return this.actionHandler(this.actions.getAction('reaction:update'), {});
  }

  public updateMapData(data, id: number, modelId: string = null) {
    // Bug: If a ws computation is triggered
    // and the user navigates to a different card
    // then the changes will be present there.
    this.setCurrentGrowthRate(parseFloat(data['growth-rate']), id);
    this.setReactionData(data.fluxes, id);
    this.setDataModel(data.model, modelId, id);
    this.setRemovedReactions(data['removed-reactions'], id);
    if (this.getSelectedId() === id) {
      this.componentCB();
    }
  }
}
