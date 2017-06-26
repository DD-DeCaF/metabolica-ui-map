/**
 * Created by dandann on 28/03/2017.
 */
import * as template from './settings.component.html'
import './settings.component.scss';
import angular = require("angular");
import {MapOptionService} from "../../services/mapoption.service";

class SettingsComponentController{
    private $interval: angular.IIntervalService;
    private $mdSidenav: angular.material.ISidenavService;
    private animationPromis: any = null;

    public mapOptions: MapOptionService;
    public animating: boolean = false;

    constructor($mdSidenav: angular.material.ISidenavService,
                MapOptions: MapOptionService,
                $interval: angular.IIntervalService
    ){
        this.mapOptions = MapOptions;
        this.$mdSidenav = $mdSidenav;
        this.$interval = $interval;
    }

    public disableInfo(): boolean{
        return !this.mapOptions.getMapInfo()['medium'];

    }

    public disableMapSelector(): boolean{
        return !this.mapOptions.getModel();
    }

    public disableKnockedOutTab(): boolean{
        return this.mapOptions.getRemovedReactions().length <= 0;
    }

    public toggleRight(): void{
        this.$mdSidenav('right').toggle()
    }


}

export const SettingsComponent = {
    controller: SettingsComponentController,
    controllerAs: 'ctrl',
    template: template.toString(),
};
