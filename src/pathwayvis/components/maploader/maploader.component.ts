import {APIService} from "../../services/api";
import * as types from '../../types';
import  * as template from "./maploader.component.html";
import * as angular from "angular";
import {ToastService} from "../../services/toastservice";
import {MapOptionService} from "../../services/mapoption.service";
/**
 * Created by dandann on 15/03/2017.
 */

class MapLoaderComponentCtrl {
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
                 $mdSidenav: angular.material.ISidenavService,
                 MapOptions: MapOptionService)
    {
        this.mapOptions = MapOptions;
        this.toastService = ToastService;

        this.selected.method = this.mapOptions.getDeafultMethod();

        if(this.mapOptions.getExperiment()){
            this.selected.experiment = this.mapOptions.getExperiment();
        }
        $mdSidenav('right').open();
    };

    public changeMethod(): void{
        this.mapOptions.setMethodId(this.selected.method);
    }

    public getMethodName(): string{
        return this.mapOptions.getMethodName(this.selected.method);
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
                    this.samples = response.data;
                    this.selected.sample = null;
                    this.selected.phase = null;
                    this.selected.model = null;
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
        if(this.selected.sample){
            this.mapOptions.getModelOptions(this.selected.sample).then(
                (response: angular.IHttpPromiseCallbackArg<string[]>) => {
                    this.mapOptions.setModels(response.data)
                    this.mapOptions.setSelectedModel(this.selected.model);
                }, (error) => {
                    this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
                });


            this.mapOptions.getPhases(this.selected.sample).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                this.mapOptions.setSample(this.selected.sample);
                this.phases = response.data;
                this.selected.phase = null;
            }, (error) => {
                this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
            });
        }
    }

    public changeModel(): void{
        this.mapOptions.setSelectedModel(this.selected.model);
    }

    public hideModelSelect(): boolean{
        return !this.mapOptions.isMaster(this.id)
    }

    public getPhaseName(): string{
        let result = "_";
        if(this.phases){
            this.phases.some((item: types.Phase) =>{
                if(this.selected.phase == item.id){
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
        return this.mapOptions.getMethods();
    }

    public isActiveObject(): boolean{
        return this.mapOptions.isActiveObject(this.id);
    }

    public setActiveObject(): void{
        return this.mapOptions.setActiveObject(this.id);
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

}

export const MapLoaderComponent: angular.IComponentOptions = {
    controller: MapLoaderComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        id: '<',
        animating: '<'
    }
};
