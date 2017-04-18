import * as types from './types';
import * as template from './views/pathwayvis.component.html';
import './views/pathwayvis.component.scss';
import * as angular from "angular";



export class PathwayVisComponentController {
    public shared: types.Shared;
    public showInfo: any;
    private $sharing: any;
    private $scope: angular.IScope;


    constructor($scope: angular.IScope,
                $sharing
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

        this.showInfo = false;
    }

    public $onInit(){
        let item = this.$sharing.item('experiment');
        this.$scope.$root.$broadcast('sharedExperiment', item)
    }

    public toggleInfo(): void {
        this.showInfo = !this.showInfo;
    }

}

export const PathwayVisComponent: angular.IComponentOptions = {
    controller: PathwayVisComponentController,
    controllerAs: 'ctrl',
    template: template.toString()
};
