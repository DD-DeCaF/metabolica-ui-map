import 'angular-toastr';

import './views/sidebar.component.scss';
import * as template from './views/sidebar.component.html';

/**
 * sidebar component
 */
class SidebarComponentCtrl {
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

export const SidebarComponent: angular.IComponentOptions = {
    controller: SidebarComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
        project: '<project'
    }
};

