/**
 * Created by dandann on 28/03/2017.
 */
import * as template from './settings.component.html'
import './settings.component.scss';
import angular = require("angular");
import {MapOptionService} from "../../services/mapoption.service";

class SettingsComponentController{

    private $mdSidenav: angular.material.ISidenavService;
    public mapOptions: MapOptionService;

    constructor($mdSidenav: angular.material.ISidenavService,
                MapOptions: MapOptionService
    ){
        this.mapOptions = MapOptions;
        this.$mdSidenav = $mdSidenav;
    }

    public disableInfo(): boolean{
        return !this.mapOptions.getCurrentMapInfo()['medium'];

    }

    public disableMapSelector(): boolean{
        return !this.mapOptions.getModel();
    }

    public disableKnockedOutTab(): boolean{
        return !this.mapOptions.getCurrentRemovedReactions();
    }

    public toggleRight(): void{
        this.$mdSidenav('right').toggle()
    }

    public getMapObjectsIds(): number[]{
        return this.mapOptions.getMapObjectsIds();
    }

    public addMapObject(): void{
        this.mapOptions.addMapObject();
    }

    public nextMapObject(): void{
        this.mapOptions.nextMapObject();
    }

    public previousMapObject(): void{
        this.mapOptions.previousMapObject();
    }

    public disablePlayBtn(): boolean{
        return this.mapOptions.getNumberOfMapObjects() <= 1;
    }
}

export const SettingsComponent : angular.IComponentOptions = {
    controller: SettingsComponentController,
    controllerAs: 'ctrl',
    template: template.toString(),
};
