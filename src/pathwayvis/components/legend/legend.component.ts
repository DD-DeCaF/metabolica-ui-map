/**
 * Created by dandann on 23/03/2017.
 */
import * as template from './legend.component.html';
import './legend.component.scss';
import angular = require("angular");

class LegendComponentController{

    constructor($scope: angular.IScope){

    }

}

export const LegendComponent: angular.IComponentOptions = {
    controller: LegendComponentController,
    controllerAs: 'ctrl',
    template: template.toString()

}
