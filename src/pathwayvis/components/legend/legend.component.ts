import * as template from './legend.component.html';
import * as angular from "angular";
import './legend.component.scss';
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

    private getPredictedGrowth(): string {
      let rate = this._mapOptions.getCurrentGrowthRate();
      if (Math.abs(rate) > 1e-05) {
          this.background = defaultColor;
          return rate.toPrecision(3);
      }
      this.background = warningColor;
      return '0';
    }
}


export const LegendComponent: angular.IComponentOptions = {
  controller: LegendComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
