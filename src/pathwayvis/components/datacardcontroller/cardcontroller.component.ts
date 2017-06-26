import * as template from './cardcontroller.component.html'
import {MapOptionService} from "../../services/mapoption.service";
/**
 * Created by dandann on 26/06/2017.
 */

class CardControllerComponentCtrl{
    private $interval: angular.IIntervalService;
    private animationPromis: any = null;

    public mapOptions: MapOptionService;
    public animating: boolean = false;

    constructor(MapOptions: MapOptionService,
                $interval: angular.IIntervalService
    ){
        this.mapOptions = MapOptions;
        this.$interval = $interval;
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
        return this.mapOptions.getCollectionSize() <= 1;
    }

    public disableControls(): boolean{
        return this.disablePlayBtn() || this.animationPromis;
    }

    public disableForAnimation(): boolean{
        return !!this.animationPromis;
    }

}

export const CardControllerComponent = {
    controller: CardControllerComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
};

