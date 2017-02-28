import angular from 'angular';
import toastr from 'angular-toastr';
import {APIService} from './services/api';
import {WSService} from './services/ws';
import {PathwayVisComponent} from './pathwayvis.component'
import {mapComponent} from './components/map/map.component';
import {KnockoutComponent} from './components/sidebar/sections/knockout.section';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {ActionsService} from './services/actions/actions.service';
import DONUT_LARGE from '../../img/icons/donut_large.svg';

console.log(toastr);

export const PathwayVisModule = angular.module('pathwayvis', [
		toastr
	])
	.service('api', APIService)
	.service('ws', WSService)
	.service('actions', ActionsService)
	.component('pathwayvis', PathwayVisComponent)
	.component('pvMap', mapComponent)
	.component('pvKnockout', KnockoutComponent)
	.component('pvSidebar', SidebarComponent)
	.config(function ($mdIconProvider, $stateProvider, appNavigationProvider) {
		$mdIconProvider.icon('donut_large', DONUT_LARGE, 24);

        appNavigationProvider.register('app.project.pathwayvis', {
            title: 'Interactive Map',
            icon: 'donut_large',
            requiresProject: true
        });

        $stateProvider
            .state({
                name: 'app.project.pathwayvis',
                url: '/pathwayvis',
                component: 'pathwayvis',
                data: {
                    title: 'Interactive Map' // FIXME look up from app nagivation provider
                }
            })
    });
