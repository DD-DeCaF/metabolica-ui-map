// Copyright 2018 Novo Nordisk Foundation Center for Biosustainability, DTU.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as types from '../../types';
import * as template from './settings.component.html';
import * as angular from "angular";
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
    $mdComponentRegistry,
  ) {
    this.mapOptions = mapOptions;
    this.$mdSidenav = $mdSidenav;
    this.$interval = $interval;

    $mdComponentRegistry.when('right').then((sideNav) => {
      sideNav.open();
    });
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

export const SettingsComponent = {
  controller: SettingsComponentController,
  controllerAs: 'ctrl',
  template: template.toString(),
};
