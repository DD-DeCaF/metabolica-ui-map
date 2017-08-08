import * as types from '../../types';
import * as template from "./datacard.component.html";
import * as angular from "angular";
import { ToastService } from "../../services/toastservice";
import { MapOptionService } from "../../services/mapoption.service";
import { methods, defaultMethod } from "../../consts/methods";
import { Method, ObjectType, Phase, Sample, Experiment } from "../../types";
import { ExperimentService } from "../../services/experiment.service";


interface SelectedIds {
  experiment?: Experiment;
  sample?: Sample;
  phase?: Phase;
  method?: Method;
}

class DataCardComponentCtrl {
  public editing: boolean = false;
  public name: string;
  public hideSelection: boolean = false;
  public phases: types.Phase[];
  public selected: SelectedIds = {};
  public methodName: string;
  public mapOptions: MapOptionService;
  public methods: Method[];

  public animating: boolean;
  public id: number;
  public samples: types.Sample[];
  private toastService;
  private experimentService: ExperimentService;

  constructor(toastService: ToastService,
    mapOptions: MapOptionService,
    experimentService: ExperimentService) {
    this.mapOptions = mapOptions;
    this.toastService = toastService;
    this.experimentService = experimentService;

    this.selected.method = defaultMethod;
    this.methods = methods;

    if (this.mapOptions.getExperiment()) {
      this.selected.experiment = this.mapOptions.getExperiment();
      this.changeExperiment();
    }
    this.name = this.getName();
  }

  public startEditing(): void {
    this.editing = true;
    this.name = this.getName();
  }

  public stopEditing(): void {
    this.mapOptions.getDataObject(this.id).setName(this.name);
    this.editing = false;
  }

  public getName(): string {
    return this.mapOptions.getDataObject(this.id).getName();
  }

  public changeMethod(method: Method): void {
    this.mapOptions.setMethod(method);
  }

  public getExperiments(): types.Experiment[] {
    return this.experimentService.getExperiments();
  }

  public changeExperiment(): void {
    if (this.selected.experiment) {
      this.mapOptions.getSamples(this.selected.experiment.id)
        .then((response: angular.IHttpPromiseCallbackArg<types.Sample[]>) => {
          // need to set null properties first!
          this.mapOptions.setExperiment(this.selected.experiment);
          this.samples = response.data['response'];
          this.selected.sample = null;
          this.selected.phase = null;
        });
    }
  }

  public changeSample(): void {
    const sample = this.selected.sample;
    this.mapOptions.setSample(sample);
    this.mapOptions.getPhases(sample.id).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
      this.phases = response.data['response'];
      this.selected.phase = null;
    }, (error) => {
      this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
    });
  }

  public getPhaseName(): string {
    const phaseName = this.selected.phase.name;
    return phaseName.length < 10 ? phaseName : `${phaseName.substr(0, 10)}...`;
  }

  public changePhase() {
    this.mapOptions.setPhase(this.selected.phase);
  }

  public isActiveObject(): boolean {
    return this.mapOptions.isActiveObject(this.id);
  }

  public setActiveObject(): void {
    return this.mapOptions.setSelectedId(this.id);
  }

  public toggle(show: boolean): void {
    this.hideSelection = !this.hideSelection;
  }

  public getButtonName(): string {
    return this.hideSelection ? 'expand_more' : 'expand_less';
  }

  public remove() {
    this.mapOptions.removeMapObject(this.id);
  }

  public hideRemoveBtn(): boolean {
    return this.mapOptions.getMapObjectsIds().length <= 1;
  }

  public isExp(): boolean {
    return this.mapOptions.getType(this.id) === ObjectType.Experiment;
  }

  public isRef(): boolean {
    return this.mapOptions.getType(this.id) === ObjectType.Reference;
  }
}

export const DataCardComponent = {
  controller: DataCardComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
  bindings: {
    id: '<',
    animating: '<',
  },
};
