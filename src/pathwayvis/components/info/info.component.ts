/**
 * Created by dandann on 28/03/2017.
 */
import './info.component.scss';
import * as template from './info.component.html';

/**
 * sidebar component
 */
class InfoComponentCtrl {
    private _scope: angular.IScope;
    public info;

    /* @ngInject */
    constructor ($scope: angular.IScope) {
        this._scope = $scope;

        $scope.$on('infoFromMap', function handler(ev, info){
            ev.currentScope['ctrl'].setInfo(info);
        })
    }

    private setInfo(info): void {
        this.info = info;
    }
}

export const InfoComponent: angular.IComponentOptions = {
    controller: InfoComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
        project: '<project'
    }
};
