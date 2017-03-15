import * as types from './types';
import * as template from './views/pathwayvis.component.html';
import './views/pathwayvis.component.scss';


export class PathwayVisComponentController {
    public shared: types.Shared;

    constructor() {
        // Init shared scope
        this.shared = <any>{
            loading: 0,
            map: {},
            model: {},
            sections: {}
        };
    }
}

export const PathwayVisComponent: angular.IComponentOptions = {
    controller: PathwayVisComponentController,
    controllerAs: 'ctrl',
    template: template.toString()
};
