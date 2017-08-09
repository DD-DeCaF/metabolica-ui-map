import * as template from './cardcontroller.component.html';
import { MapOptionService } from "../../services/mapoption.service";
import { Species } from "../../types";

class CardControllerComponentCtrl {
  private $interval: angular.IIntervalService;
  private animationPromise: any = null;

  public mapOptions: MapOptionService;
  public animating: boolean = false;
  public species: string;

  constructor(mapOptions: MapOptionService,
    $interval: angular.IIntervalService,
    $mdSidenav: angular.material.ISidenavService,
  ) {
    this.mapOptions = mapOptions;
    this.$interval = $interval;

    $mdSidenav('right').open();

    this.species = this.mapOptions.selectedSpecies;
  }

  public speciesList(): Species[] {
    return this.mapOptions.getSpeciesList();
  }

  public getMapObjectsIds(): number[] {
    return this.mapOptions.getMapObjectsIds();
  }

  public addExpMapObject(): void {
    this.mapOptions.addExpMapObject();
  }

  public addRefMapObject(): void {
    this.mapOptions.addRefMapObject();
  }

  public playIcon(): string {
    return this.animationPromise ? 'pause' : 'play_arrow';
  }

  public toggleAnimation(): void {
    if (this.animationPromise) {
      this.stopAnimation();

    } else {
      this.animating = true;
      this.animationPromise = this.$interval(this.nextMapObject.bind(this), 500);
    }
  }

  public changeSpecies(): void {
    this.mapOptions.speciesChanged(this.species);
  }

  private stopAnimation(): void {
    this.animating = false;
    this.$interval.cancel(this.animationPromise);
    this.animationPromise = null;
  }

  public nextMapObject(): void {
    if (this.disablePlayBtn()) {
      this.stopAnimation();
    } else {
      this.mapOptions.nextMapObject();
    }
  }

  public previousMapObject(): void {
    this.mapOptions.previousMapObject();
  }

  public disablePlayBtn(): boolean {
    return this.mapOptions.getCollectionSize() > 1;
  }

  public disableControls(): boolean {
    return this.disablePlayBtn() || this.animationPromise;
  }

  public disableForAnimation(): boolean {
    return !!this.animationPromise;
  }
}

export const CardControllerComponent = {
  controller: CardControllerComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
