/**
 * Created by dandann on 28/03/2017.
 */
import * as template from './settings.component.html'
import './settings.component.scss';
import angular = require("angular");
import {MapOptionService} from "../../services/mapoption.service";
import * as types from '../../types';

class SettingsComponentController{

    private $mdSidenav: angular.material.ISidenavService;
    public mapOptions: MapOptionService;

    constructor($mdSidenav: angular.material.ISidenavService,
                MapOptions: MapOptionService
    ){
        this.mapOptions = MapOptions;
        this.$mdSidenav = $mdSidenav;
    }
    //
    // public getSelectedItems(): types.SelectedItems {
    //     return this.mapOptions.selectedItems;
    // }

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
}

export const SettingsComponent : angular.IComponentOptions = {
    controller: SettingsComponentController,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
    }
}
