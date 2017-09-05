import * as template from './legend.component.html';
import * as angular from "angular";
import './legend.component.scss';


export const LegendComponent: angular.IComponentOptions = {
  controllerAs: 'ctrl',
  template: template.toString(),
};
