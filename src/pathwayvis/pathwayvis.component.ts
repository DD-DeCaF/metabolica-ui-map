import * as types from './types';
import * as template from './views/pathwayvis.component.html';
import './views/pathwayvis.component.scss';
import {MapLoaderComponent} from "./components/maploader/maploader.component";
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

        this.dialog = {
            contentElement: '#map-options-dialog',
            parent: angular.element(document.getElementsByClassName('container')[0]),
            clickOutsideToClose: true,
            escapeToClose: true
        };

        this.$mdDialog = $mdDialog;

        this.showInfo = false;

        this.showDialog();
    }

    public toggleInfo(): void {
        this.showInfo = !this.showInfo;
    }

    public showDialog(): void {
        this.$mdDialog.show(this.dialog);
    };
}

export const PathwayVisComponent: angular.IComponentOptions = {
    controller: PathwayVisComponentController,
    controllerAs: 'ctrl',
    template: template.toString()
};
