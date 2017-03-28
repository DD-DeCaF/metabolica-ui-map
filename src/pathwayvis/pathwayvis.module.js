import angular from 'angular';
import toastr from 'angular-toastr';
import {APIService} from './services/api';
import {WSService} from './services/ws';
import {PathwayVisComponent} from './pathwayvis.component'
import {mapComponent} from './components/map/map.component';
import {KnockoutComponent} from './components/knockout/knockout.component';
import {MapSelectorComponent} from './components/mapselector/mapselector.component';
import {MapLoaderComponent} from './components/maploader/maploader.component';
import {ActionsService} from './services/actions/actions.service';
import DONUT_LARGE from '../../img/icons/donut_large.svg';
import {DecafAPIProvider} from './providers/decafapi.provider';
import {ModelAPIProvider} from './providers/modelapi.provider';
import {LegendComponent} from './components/legend/legend.component';
import {SettingsComponent} from './components/settings/settings.component';
import {InfoComponent} from './components/info/info.component';

export const PathwayVisModule = angular.module('pathwayvis', [
		toastr
	])
	.provider('decafAPI', DecafAPIProvider)
	.provider('modelAPI', ModelAPIProvider)
	.service('api', APIService)
	.service('ws', WSService)
	.service('actions', ActionsService)
	.component('pathwayvis', PathwayVisComponent)
	.component('pvMap', mapComponent)
	.component('pvKnockout', KnockoutComponent)
	.component('pvMapSelector', MapSelectorComponent)
	.component('pvMaploader', MapLoaderComponent)
	.component('pvLegend', LegendComponent)
	.component('pvSettings', SettingsComponent)
	.component('pvInfo', InfoComponent)
	.config(function ($mdIconProvider, $stateProvider, appNavigationProvider) {
		$mdIconProvider.icon('donut_large', DONUT_LARGE, 24);

        appNavigationProvider.register('app.pathwayvis', {
            title: 'Interactive Map',
            icon: 'donut_large'
        });

        $stateProvider
            .state({
                name: 'app.pathwayvis',
                url: '/pathwayvis',
                component: 'pathwayvis',
                data: {
                    title: 'Interactive Map' // FIXME look up from app nagivation provider
                }
            })
    });
