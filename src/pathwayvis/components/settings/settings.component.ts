import * as angular from "angular";

import * as types from '../../types';
import * as template from './settings.component.html';
import './settings.component.scss';
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
    const mapInfo: types.MapInfo = this.mapOptions.getMapInfo();
    return !(mapInfo && mapInfo.medium);
  }

  public disableMapSelector(): boolean {
    return !this.mapOptions.getModelId();
  }

  public toggleRight(): void {
    this.$mdSidenav('right').toggle();
  }
}

export const SettingsComponent: angular.IComponentOptions = {
  controller: SettingsComponentController,
  controllerAs: 'ctrl',
  template: template.toString(),
};
