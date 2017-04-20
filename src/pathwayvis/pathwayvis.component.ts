import * as types from './types';
import * as template from './views/pathwayvis.component.html';
import './views/pathwayvis.component.scss';
import * as angular from "angular";
import {MapOptionService} from "./services/mapoption.service";



export class PathwayVisComponentController {
    public shared: types.Shared;
    public showInfo: any;
    private $sharing: any;
    private $scope: angular.IScope;
    private mapOptions: MapOptionService;

    constructor($scope: angular.IScope,
                $sharing,
                MapOptions: MapOptionService,
    ) {
        this.$sharing = $sharing;
        this.$scope = $scope;
        // Init shared scope
        this.shared = <any>{
            loading: 0,
            map: {},
            model: {},
            sections: {}
        };

        this.mapOptions = MapOptions;

        this.showInfo = false;
    }

    public $onInit(){
        let item = this.$sharing.item('experiment');
        if(item){
            this.mapOptions.setExperiment(item._id);
        }

    }
}

export const PathwayVisComponent: angular.IComponentOptions = {
    controller: PathwayVisComponentController,
    controllerAs: 'ctrl',
    template: template.toString()
};
