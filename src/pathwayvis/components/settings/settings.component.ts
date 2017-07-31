import * as template from './settings.component.html';
import './settings.component.scss';
import * as angular from 'angular';
import { MapOptionService } from "../../services/mapoption.service";

class SettingsComponentController {
  private $interval: angular.IIntervalService;
  private $mdSidenav: angular.material.ISidenavService;

  public mapOptions: MapOptionService;
  public animating: boolean = false;

  constructor($mdSidenav: angular.material.ISidenavService,
    mapOptions: MapOptionService,
    $interval: angular.IIntervalService,
  ) {
    this.mapOptions = mapOptions;
    this.$mdSidenav = $mdSidenav;
    this.$interval = $interval;
  }

  public disableInfo(): boolean {
    return !this.mapOptions.getMapInfo()['medium'];
  }

  public disableMapSelector(): boolean {
    return !this.mapOptions.getModel();
  }

  public disableKnockedOutTab(): boolean {
    return this.mapOptions.getRemovedReactions().length === 0;
  }

  public toggleRight(): void {
    this.$mdSidenav('right').toggle();
  }
}

export const SettingsComponent = {
  controller: SettingsComponentController,
  controllerAs: 'ctrl',
  template: template.toString(),
};
