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

import * as template from './legend.component.html';
import * as angular from "angular";
import './legend.component.scss';
import { MapOptionService } from "../../services/mapoption.service";


const defaultColor = 'white';
const warningColor = '#FEEFB3';


class LegendComponentCtrl {
    private _mapOptions: MapOptionService;
    public background: string = defaultColor;
    public expanded: boolean = true;

    constructor($scope: angular.IScope,
                mapOptions: MapOptionService) {
        this._mapOptions = mapOptions;
    }

    public toggle() {
        this.expanded = !this.expanded;
    }

    public getPredictedGrowth(): string {
      const rate = this._mapOptions.getCurrentGrowthRate();
      const isRateMeaningful = Math.abs(rate) > 1e-05;
      this.background = isRateMeaningful ? defaultColor : warningColor;
      return isRateMeaningful ? rate.toPrecision(3) : '0';
    }
}


export const LegendComponent: angular.IComponentOptions = {
  controller: LegendComponentCtrl,
  template: template.toString(),
};
