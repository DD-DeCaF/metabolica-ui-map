/// <reference path="../typings/index.d.ts"/>
import * as angular from 'angular';

import {Config, dirname} from 'decaf-common';
import * as types from './types';

import 'angular-toastr';
import './services/api';
import './services/ws';
import './components/base';
import './views/pathwayvis.component.css!';

export const COMPONENT_NAME = 'pathwayvis';
const main = angular.module(COMPONENT_NAME, [
    'pathwayvis.services.api',
    'pathwayvis.services.ws',
    'pathwayvis.components',
    'toastr'
]);

// TODO: we need to make it so the module name and the .register() are decoupled and not dependant on each other
main.config(function (platformProvider) {
    platformProvider
        .register(COMPONENT_NAME, {
            sharing: {
                accept: [{type: 'money', multiple: true}],
                name: 'Decaf Visualisations Component'
            }
        })
        .state(COMPONENT_NAME, {
            url: `/${COMPONENT_NAME}`,
            views: {
                'content@': {
                    templateUrl: `${dirname(module.id)}/views/pathwayvis.component.html`,
                    controller: PathwayVisComponentController,
                    controllerAs: 'ctrl'
                }
            },
            onEnter(config: Config) {
                config.set('color', '#34495e');
            },
            onExit(config: Config) {
                // Turn of WS inspection for TS
                // noinspection TypeScriptUnresolvedFunction
                config.set('color', null);
            }
        });
});


class PathwayVisComponentController {
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

export default main;
