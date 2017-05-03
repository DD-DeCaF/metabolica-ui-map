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
        return !this.mapOptions.getCurrentMapInfo()['medium'] || this.disableForAnimation();

    }

    public disableMapSelector(): boolean{
        return !this.mapOptions.getModel() || this.disableForAnimation();
    }

    public disableKnockedOutTab(): boolean{
        return this.mapOptions.getCurrentRemovedReactions().length <= 0 || this.disableForAnimation();
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

    public playIcon(): string{
        if(this.animationPromis){
            return 'pause';
        }
        return 'play_arrow';
    }

    public toggleAnimation(): void{
        if(this.animationPromis){
            this.animating = false;
            this.$interval.cancel(this.animationPromis);
            this.animationPromis = null;
        } else {
            this.animating = true;
            this.animationPromis = this.$interval(this.nextMapObject.bind(this), 500)
        }
    }

    public nextMapObject(): void{
        this.mapOptions.nextMapObject();
    }

    public previousMapObject(): void{
        this.mapOptions.previousMapObject();
    }

    public disablePlayBtn(): boolean{
        return this.mapOptions.getMapObjectsIds().length <= 1;
    }

    public disableControls(): boolean{
        return this.disablePlayBtn() || this.animationPromis;
    }

    public disableForAnimation(): boolean{
        return !!this.animationPromis;
    }
}

export const SettingsComponent : angular.IComponentOptions = {
    controller: SettingsComponentController,
    controllerAs: 'ctrl',
    template: template.toString(),
};
