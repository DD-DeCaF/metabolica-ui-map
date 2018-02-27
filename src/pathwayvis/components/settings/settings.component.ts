import * as angular from 'angular';

import * as types from '../../types';

import { MapOptionService } from '../../services/mapoption.service';
import { MapSettings } from '../../services/mapsettings.service';

import * as template from './settings.component.html';
import './settings.component.scss';

class SettingsComponentController {
  private $interval: angular.IIntervalService;
  private $mdSidenav: angular.material.ISidenavService;
  public modelLoaded: boolean = false;

  public mapOptions: MapOptionService;
  public animating: boolean = false;

  constructor($mdSidenav: angular.material.ISidenavService,
    mapOptions: MapOptionService,
    mapSettingsService: MapSettings,
    $interval: angular.IIntervalService,
  ) {
    this.mapOptions = mapOptions;
    this.$mdSidenav = $mdSidenav;
    this.$interval = $interval;

    mapSettingsService.mapSettings.subscribe((mapSettings) => {
      this.modelLoaded = !!mapSettings.model_id;
    });
  }

  public disableInfo(): boolean {
    const mapInfo: types.MapInfo = this.mapOptions.getMapInfo();
    return !(mapInfo && mapInfo.medium);
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
