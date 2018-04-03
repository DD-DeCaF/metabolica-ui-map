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
    $scope: angular.IScope,
  ) {
    this.mapOptions = mapOptions;
    this.$interval = $interval;

    $mdSidenav('right').open();

    this.species = this.mapOptions.selectedSpecies;

    $scope.$watch('this.mapOptions.selectedSpecies', (selectedSpecies: string) => {
      if (selectedSpecies) {
        this.species = selectedSpecies;
      }
    });
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
    return this.mapOptions.getCollectionSize() < 2;
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
