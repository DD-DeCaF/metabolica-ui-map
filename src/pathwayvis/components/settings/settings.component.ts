/**
 * Created by dandann on 28/03/2017.
 */
import * as template from './settings.component.html'
import './settings.component.scss';
import angular = require("angular");

class SettingsComponentController{

    private $mdSidenav: angular.material.ISidenavService;

    constructor($mdSidenav: angular.material.ISidenavService){
        this.$mdSidenav = $mdSidenav;
    }


    public toggleRight(): void{
        this.$mdSidenav('right').toggle()
    }
}

export const SettingsComponent : angular.IComponentOptions = {
    controller: SettingsComponentController,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
    }
}
