import * as types from './types';
import * as template from './views/pathwayvis.component.html';
import './views/pathwayvis.component.scss';


export class PathwayVisComponentController {
    public shared: types.Shared;
    public showInfo: any;

    constructor($scope: angular.IScope) {
        // Init shared scope
        this.shared = <any>{
            loading: 0,
            map: {},
            model: {},
            sections: {}
        };

        this.showInfo = false;

        $scope.$on('pushChangesToNodes', function (ev, message: types.Message) {
            $scope.$broadcast(message.name, message.data);
        })
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
