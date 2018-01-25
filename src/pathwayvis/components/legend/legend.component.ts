import * as template from './legend.component.html';
import * as angular from "angular";
import './legend.component.scss';
import * as _ from 'lodash';
import { MapOptionService } from "../../services/mapoption.service";


const defaultColor = 'white';
const warningColor = '#FEEFB3';


class LegendComponentCtrl {
    private _mapOptions: MapOptionService;
    private background: string;

    constructor($scope: angular.IScope,
                mapOptions: MapOptionService) {
        this._mapOptions = mapOptions;
        this.background = defaultColor;
    }

    private getPredictedGrowth(): number {
      let rate = _.round(this._mapOptions.getCurrentGrowthRate(), 3);
      this.background = rate !== 0.0 ? defaultColor : warningColor;
      return rate;
    }
}


export const LegendComponent: angular.IComponentOptions = {
  controller: LegendComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
