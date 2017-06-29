import {APIService} from "../../services/api";
import * as types from '../../types';
import  * as template from "./datacard.component.html";
import * as angular from "angular";
import {ToastService} from "../../services/toastservice";
import {MapOptionService} from "../../services/mapoption.service";
import {MethodService} from "../../services/method.service";
import {Method, ObjectType, Phase, Sample} from "../../types";
import {ExperimentService} from "../../services/experiment.service";
/**
 * Created by dandann on 15/03/2017.
 */


interface SelectedIds {
    experiment?: number;
    sample?: string;
    phase?: string;
    method?: string;
}

class DataCardComponentCtrl {
    methodService: MethodService;
    public hideSelection: boolean = false;
    public phases: types.Phase[];
    public selected: SelectedIds = {};
    public methodName: string;

    public animating: boolean;
    public id: number;
    public samples: types.Sample[];
    private mapOptions: MapOptionService;
    private toastService;
    private experimentService: ExperimentService;

    constructor (ToastService: ToastService,
                 MapOptions: MapOptionService,
                 MethodService: MethodService,
                 ExperimentService: ExperimentService)
    {
        this.mapOptions = MapOptions;
        this.toastService = ToastService;
        this.methodService = MethodService;
        this.experimentService = ExperimentService;

        this.selected.method = MethodService.defaultMethod().id;

        if(this.mapOptions.getExperiment()){
            this.selected.experiment = this.mapOptions.getExperiment().id;
            this.changeExperiment();
        }

    };

    public getMethods(): Method[]{
        return this.methodService.methods;
    }

    public changeMethod(): void{
        let method = this.methodService.getMethod(this.selected.method);
        this.mapOptions.setMethodId(method);
    }

    public getMethodName(): string{
        return this.methodService.getMethodName(this.selected.method);
    }

    public getExperiments(): types.Experiment[]{
        return this.experimentService.getExperiments();
    }

    public getExperimentName(): string{
        return this.experimentService.getExperimentName(this.selected.experiment);
    }

    public changeExperiment(): void{
        if(this.selected.experiment){
            this.mapOptions.getSamples(this.selected.experiment)
                .then((response: angular.IHttpPromiseCallbackArg<types.Sample[]>) => {
                    // need to set null properties first!
                    let experiment = this.experimentService.getExperiment(this.selected.experiment);
                    this.mapOptions.setExperiment(experiment);
                    this.samples = response.data['response'];
                    this.selected.sample = null;
                    this.selected.phase = null;
                });
        }
    }

    public getSampleName(): string{
        let result = "_";
        if(this.samples && this.selected.sample){
            this.samples.some((item: types.Sample) =>{
                if(this.selected.sample.toString() == JSON.stringify(item.id)){
                    result = item.name;
                    return true
                }
            });
        }
        return result;
    }

    public changeSample(): void{
        let sampleId = this.selected.sample;
        if(sampleId){
            this.mapOptions.getPhases(sampleId).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                let sample = this.getSample(sampleId);
                this.mapOptions.setSample(sample);
                this.phases = response.data['response'];
                this.selected.phase = null;
            }, (error) => {
                this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
            });
        }
    }

    private getSample(ids: string): Sample{
        let result = null;
        if(this.samples){
            this.samples.some((item: Sample) =>{
                let itemId = JSON.stringify(item.id);
                if(ids == itemId){
                    result = item;
                    return true
                }
            });
        }
        return result;
    }

    public hideModelSelect(): boolean{
        return !this.mapOptions.isMaster(this.id)
    }

    public getPhaseName(): string{
        let result = "_";
        if(this.phases){
            this.phases.some((item: types.Phase) =>{
                if(this.selected.phase == item.id.toString()){
                    result = item.name;
                    return true
                }
            });
        }
        if(result.length > 10){
            result = result.substr(0, 10) + "..."
        }
        return result;
    }

    public changePhase(){
        let phase = this.getPhase();
        this.mapOptions.setPhase(phase);
    }

    private getPhase(): Phase{
        let result = null;
        if(this.phases){
            this.phases.some((item: types.Phase) =>{
                if(this.selected.phase == item.id.toString()){
                    result = item;
                    return true
                }
            });
        }
        return result;
    }

    public isActiveObject(): boolean{
        return this.mapOptions.isActiveObject(this.id);
    }

    public setActiveObject(): void{
        return this.mapOptions.setSelectedId(this.id);
    }

    public toggle(show: boolean) : void{
        this.hideSelection = !this.hideSelection;
    }

    public getButtonName(): string{
        if (this.hideSelection){
            return "expand_more";
        }
        return "expand_less"
    }

    public remove(){
        this.mapOptions.removeMapObject(this.id);
    }

    public hideRemoveBtn(): boolean{
        return this.mapOptions.getMapObjectsIds().length <= 1;
    }

    public isExp(): boolean{
        return this.mapOptions.getType(this.id) === ObjectType.Experiment;
    }

    public isRef(): boolean{
        return this.mapOptions.getType(this.id) === ObjectType.Reference;
    }

}

export const DataCardComponent = {
    controller: DataCardComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        id: '<',
        animating: '<'
    }
};
