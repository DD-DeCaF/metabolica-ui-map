import angular from 'angular';
import { APIService } from './services/api';
import { WSService } from './services/ws';
import { ToastService } from './services/toastservice'
import { MapOptionService } from './services/mapoption.service';
import { MapService } from './services/map.service';
import { MethodService } from './services/method.service';
import { ExperimentService } from './services/experiment.service';
import { PathwayVisComponent } from './pathwayvis.component'
import { mapComponent } from './components/map/map.component';
import { MapSelectorComponent } from './components/mapselector/mapselector.component';
import { DataCardComponent } from './components/datacard/datacard.component';
import { ActionsService } from './services/actions/actions.service';
import DONUT_LARGE from '../../img/icons/donut_large.svg';
import { DecafAPIProvider } from './providers/decafapi.provider';
import { ModelAPIProvider } from './providers/modelapi.provider';
import { ModelWSProvider } from './providers/modelws.provider';
import { LegendComponent } from './components/legend/legend.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InfoComponent } from './components/info/info.component';
import { CardControllerComponent } from './components/datacardcontroller/cardcontroller.component'
import { ReactionComponent } from './components/reactionpanel/reaction.component'

export const PathwayVisModule = angular.module('pathwayvis', [
  require('angular-material-data-table')
])
  .provider('decafAPI', DecafAPIProvider)
  .provider('modelAPI', ModelAPIProvider)
  .provider('modelWS', ModelWSProvider)
  .service('api', APIService)
  .service('ws', WSService)
  .service('actions', ActionsService)
  .service('toastService', ToastService)
  .service('mapService', MapService)
  .service('mapOptions', MapOptionService)
  .service('methodService', MethodService)
  .service('experimentService', ExperimentService)
  .component('pathwayvis', PathwayVisComponent)
  .component('pvMap', mapComponent)
  .component('pvMapSelector', MapSelectorComponent)
  .component('pvDataCard', DataCardComponent)
  .component('pvLegend', LegendComponent)
  .component('pvSettings', SettingsComponent)
  .component('pvInfo', InfoComponent)
  .component('pvCardController', CardControllerComponent)
  .component('pvReactionPanel', ReactionComponent)
  .config(($mdIconProvider, $stateProvider, appNavigationProvider) => {
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
  .config(($sharingProvider) => {
    $sharingProvider.register('app.pathwayvis', {
      accept: [
        { type: 'experiment', multiple: false }
      ],
      name: 'Interactive map'
    });
  })
  .config(($mdThemingProvider) => {
    $mdThemingProvider.theme('warn-toast');
    $mdThemingProvider.theme('error-toast');
  })
  .directive('showFocus', function ($timeout) {
    return function (scope, element, attrs) {
      scope.$watch(attrs.showFocus,
        function (newValue) {
          $timeout(function () {
            newValue && element[0].focus();
          });
        }, true);
    };
  });
