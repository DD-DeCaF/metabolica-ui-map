import * as types from './types';
import * as template from './views/pathwayvis.component.html';
import './views/pathwayvis.component.scss';
import * as _ from 'lodash';
import * as angular from "angular";



export class PathwayVisComponentController {
    public shared: types.Shared;
    public showInfo: any;
    private $mdDialog: ng.material.IDialogService;
    private dialog: any;


    constructor($scope: angular.IScope,
                $mdDialog: ng.material.IDialogService) {
        // Init shared scope
        this.shared = <any>{
            loading: 0,
            map: {},
            model: {},
            sections: {}
        };

        this.$mdDialog = $mdDialog;

        this.showInfo = false;

        this.showDialog();
    }

    public toggleInfo(): void {
        this.showInfo = !this.showInfo;
    }

    public showDialog(): void {
        let dialog = {
            contentElement: '#map-options-dialog',
            parent: angular.element(document.getElementsByClassName('container')[0]),
            clickOutsideToClose: !_.isEmpty(this.shared.map),
            escapeToClose: !_.isEmpty(this.shared.map)
        };

        this.$mdDialog.show(dialog);
    };
}

export const PathwayVisComponent: angular.IComponentOptions = {
    controller: PathwayVisComponentController,
    controllerAs: 'ctrl',
    template: template.toString()
};
