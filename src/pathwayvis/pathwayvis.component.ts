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

import * as types from './types';
import * as template from './views/pathwayvis.component.html';
import './views/pathwayvis.component.scss';
import * as angular from "angular";
import {MapOptionService} from "./services/mapoption.service";
import { SharedService } from './services/shared.service';

export class PathwayVisComponentController {
    public showInfo: any;
    private $sharing: any;
    private $scope: angular.IScope;
    private mapOptions: MapOptionService;
    private $q: angular.IQService;
    private $timeout: angular.ITimeoutService;
    private shared: SharedService;

    constructor($scope: angular.IScope,
                $sharing,
                mapOptions: MapOptionService,
                $q: angular.IQService,
                $timeout: angular.ITimeoutService,
                shared: SharedService,
    ) {
        this.$sharing = $sharing;
        this.$scope = $scope;
        this.mapOptions = mapOptions;
        this.showInfo = false;
        this.$q = $q;
        this.$timeout = $timeout;
        this.shared = shared;
    }

    public async $onInit() {
        this.mapOptions.init();
        let item = this.$sharing.item('experiment');
        if (item) {
            this.mapOptions.addExpMapObject();
            this.mapOptions.setExperiment(item);
            return;
        }

        const cardId = this.mapOptions.addRefMapObject();
        item = this.$sharing.item('pathwayPrediction');
        if (item) {
          // This is only temporary, before we add species to the pathway predictor
          const speciesByModel = {
            iJN746: 'PSEPU',
            iMM904: 'YEAST',
            ecYeast7: 'YEAST',
            ecYeast7_proteomics: 'YEAST',
            iJO1366: 'ECOLX',
            e_coli_core: 'ECOLX',
          };
          const modelLoaded = new Promise((resolve) => {
            const cancel = this.$scope.$on('modelLoaded', () => {
              resolve();
              cancel();
            });
          });

          this.shared.async(this.$q.all([
            this.mapOptions.loaded,
            modelLoaded,
          ]).then(async () => {
            await this.mapOptions.speciesChanged(speciesByModel[item.modelId]);
            this.mapOptions.setModelId(item.modelId);
            this.mapOptions.addReactions(item.pathway.map(({reaction}) => ({
              bigg_id: reaction,
              metabolites: item.model.reactions.find((r) => r.id === reaction).metabolites,
            }))).then((response) => {
              this.mapOptions.updateMapData(response, cardId);
            });
          }));
        }
    }
}

export const PathwayVisComponent: angular.IComponentOptions = {
    controller: PathwayVisComponentController,
    template: template.toString(),
};
