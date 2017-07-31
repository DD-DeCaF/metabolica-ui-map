import * as template from './legend.component.html';
import './legend.component.scss';
import * as angular from 'angular';


export const LegendComponent: angular.IComponentOptions = {
  controllerAs: 'ctrl',
  template: template.toString(),
};
