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
    public phases: types.Phase[];
    public selected: types.SelectedItems;
    public id: number;
    public samples: types.Sample[];
    private _api: any;
    private toastService: ToastService;
    private $mdDialog: ng.material.IDialogService;
    public mapOptions: MapOptionService;

    constructor ($scope: angular.IScope,
                 api: APIService,
                 ToastService: ToastService,
                 $mdDialog: ng.material.IDialogService,
                 MapOptions: MapOptionService)
    {
        this._api = api;
        this.toastService = ToastService;
        this.$mdDialog = $mdDialog;
        this.mapOptions = MapOptions;

        this.selected = this.mapOptions.getSelectedItems();

        $scope.$watch('ctrl.selected.experiment', () => {
            if(this.selected.experiment){
                this.mapOptions.getSamples(this.selected.experiment)
                    .then((response: angular.IHttpPromiseCallbackArg<types.Sample[]>) => {
                        // need to set null properties first!
                        this.selected.sample = null;
                        this.selected.phase = null;
                        this.samples = response.data;
                    });
            }
        });

        $scope.$watch('ctrl.selected.sample', () => {
            if(this.selected.sample){
                this.mapOptions.getPhases(this.selected.sample).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                    this.selected.phase = null;
                    this.phases = response.data;
                }, (error) => {
                    this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected sample.');
                });
            }
        });
    }

    public hide(): void{
        this.$mdDialog.hide()
    }
}

export const MapLoaderComponent: angular.IComponentOptions = {
    controller: MapLoaderComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        id: '<',
    }
};
