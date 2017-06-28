import {APIService} from "../../services/api";
import * as types from '../../types';
import  * as template from "./datacard.component.html";
import * as angular from "angular";
import {ToastService} from "../../services/toastservice";
import {MapOptionService} from "../../services/mapoption.service";
import {MethodService} from "../../services/method.service";
import {ObjectType} from "../../types";
/**
 * Created by dandann on 15/03/2017.
 */

class DataCardComponentCtrl {
    methodService: MethodService;
    public hideSelection: boolean = false;
    public phases: types.Phase[];
    public selected: types.SelectedItems = {};
    public methodName: string;

    public animating: boolean;
    public id: number;
    public samples: types.Sample[];
    private mapOptions: MapOptionService;
    private toastService;


    constructor ($scope: angular.IScope,
                 ToastService: ToastService,

                 MapOptions: MapOptionService,
                 MethodService: MethodService)
    {
        this.mapOptions = MapOptions;
        this.toastService = ToastService;
        this.methodService = MethodService;

        this.selected.method = MethodService.defaultMethod();

        if(this.mapOptions.getExperiment()){
            this.selected.experiment = this.mapOptions.getExperiment();
            this.changeExperiment();
        }

    };

    public changeMethod(): void{
        this.mapOptions.setMethodId(this.selected.method);
    }

    public getMethodName(): string{
        return this.methodService.getMethodName(this.selected.method);
    }

    public getExperiments(): types.Experiment[]{
        return this.mapOptions.getExperiments();
    }

    public getExperimentName(): string{
        return this.mapOptions.getExperimentName(this.selected.experiment);
    }

    public changeExperiment(): void{
        if(this.selected.experiment){
            this.mapOptions.getSamples(this.selected.experiment)
                .then((response: angular.IHttpPromiseCallbackArg<types.Sample[]>) => {
                    // need to set null properties first!
                    this.mapOptions.setExperiment(this.selected.experiment);
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
        let sample = this.selected.sample;
        if(sample){
            this.mapOptions.getPhases(sample).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                this.mapOptions.setSample(sample);
                this.phases = response.data['response'];
                this.selected.phase = null;
            }, (error) => {
                this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
            });
        }
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
        this.mapOptions.setPhase(this.selected.phase);
    }

    public getMethods(): object{
        return this.methodService.methods;
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
