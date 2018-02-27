import * as angular from "angular";
import { AppModule } from 'metabolica';
import { APIService } from './services/api';
import { WSService } from './services/ws';
import { ToastService } from './services/toastservice';
import { MapOptionService } from './services/mapoption.service';
import { MapService } from './services/map.service';
import { MapSettings } from './services/mapsettings.service';
import { ExperimentService } from './services/experiment.service';
import { SharedService } from './services/shared.service';
import { PathwayVisComponent } from './pathwayvis.component';
import { mapComponent } from './components/map/map.component';
import { MapSelectorComponent } from './components/mapselector/mapselector.component';
import { DataCardComponent } from './components/datacard/datacard.component';
import { ActionsService } from './services/actions/actions.service';
import MAP_ICON from '../../img/icons/map_icon.svg';
import { DecafAPIProvider } from './providers/decafapi.provider';
import { ModelAPIProvider } from './providers/modelapi.provider';
import { ModelWSProvider } from './providers/modelws.provider';
import { LegendComponent } from './components/legend/legend.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InfoComponent } from './components/info/info.component';
import { CardControllerComponent } from './components/datacardcontroller/cardcontroller.component';
import { ReactionsPanelModule } from './components/reactionpanel/reactionspanel.module';

export const PathwayVisModule = angular.module('pathwayvis', [
  require('angular-material-data-table'),
  'ngMaterial',
  'ui.router',
  AppModule.name,
  ReactionsPanelModule.name,
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
  .service('mapSettingsService', MapSettings)
  .service('experimentService', ExperimentService)
  .service('shared', SharedService)
  .component('pathwayvis', PathwayVisComponent)
  .component('pvMap', mapComponent)
  .component('pvMapSelector', MapSelectorComponent)
  .component('pvDataCard', DataCardComponent)
  .component('pvLegend', LegendComponent)
  .component('pvSettings', SettingsComponent)
  .component('pvInfo', InfoComponent)
  .component('pvCardController', CardControllerComponent)
  .config(($mdIconProvider, $stateProvider, appNavigationProvider) => {
    $mdIconProvider.icon('map_icon', MAP_ICON, 24);

    appNavigationProvider.register('app.pathwayvis', {
      title: 'Interactive Map',
      icon: 'map_icon',
      authRequired: false,
      tooltip: 'Investigate and visualize flux distributions on different parts of metabolism. Create new strains',
    });

    $stateProvider
      .state({
        name: 'app.pathwayvis',
        url: '/pathwayvis',
        component: 'pathwayvis',
        data: {
          title: 'Interactive Map', // FIXME look up from app nagivation provider
        },
      });
  })
  .config(($sharingProvider) => {
    $sharingProvider.register('app.pathwayvis', {
      accept: [
        { type: 'experiment', multiple: false },
      ],
      name: 'Interactive map',
    });
    $sharingProvider.register('app.pathwayvis', {
      accept: [
        { type: 'pathwayPrediction', multiple: false },
      ],
      name: 'Interactive map',
    });
  })
  .config(($mdThemingProvider) => {
    $mdThemingProvider.theme('warn-toast');
    $mdThemingProvider.theme('error-toast');
  })
  // Should live somewhere else
  .directive('showFocus', ($timeout) => (scope, element, attrs) => {
      scope.$watch(attrs.showFocus,
        (newValue) => {
          $timeout(() => {
            if (newValue) {
              element[0].focus();
            }
          });
        }, true);
    });
