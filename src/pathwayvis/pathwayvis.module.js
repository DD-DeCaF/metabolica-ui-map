import angular from 'angular';
import {APIService} from './services/api';
import {WSService} from './services/ws';
import {ToastService} from './services/toastservice'
import {MapOptionService} from './services/mapoption.service';
import {MapService} from './services/map.service';
import {MethodService} from './services/method.service';
import {PathwayVisComponent} from './pathwayvis.component'
import {mapComponent} from './components/map/map.component';
import {KnockoutComponent} from './components/knockout/knockout.component';
import {MapSelectorComponent} from './components/mapselector/mapselector.component';
import {MapLoaderComponent} from './components/maploader/maploader.component';
import {ActionsService} from './services/actions/actions.service';
import DONUT_LARGE from '../../img/icons/donut_large.svg';
import {DecafAPIProvider} from './providers/decafapi.provider';
import {ModelAPIProvider} from './providers/modelapi.provider';
import {ModelWSProvider} from './providers/modelws.provider';
import {LegendComponent} from './components/legend/legend.component';
import {SettingsComponent} from './components/settings/settings.component';
import {InfoComponent} from './components/info/info.component';

export const PathwayVisModule = angular.module('pathwayvis', [
	require('angular-material-data-table')
	])
	.provider('decafAPI', DecafAPIProvider)
	.provider('modelAPI', ModelAPIProvider)
	.provider('modelWS', ModelWSProvider)
	.service('api', APIService)
	.service('ws', WSService)
	.service('actions', ActionsService)
	.service('ToastService', ToastService)
	.service('MapService', MapService)
	.service('MapOptions', MapOptionService)
	.service('MethodService', MethodService)
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
            icon: 'donut_large',
			authRequired: false
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
    })
	.config(function ($sharingProvider) {
		$sharingProvider.register('app.pathwayvis', {
			accept: [
				{type: 'experiment', multiple: false}
			],
			name: 'Interactive map'
		});
	})
	.config(function ($mdThemingProvider) {
		$mdThemingProvider.theme('warn-toast');
		$mdThemingProvider.theme('error-toast');
	});
