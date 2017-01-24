import * as angular from 'angular';

import './map/map.component';
import './sidebar/sidebar.component';
import './sidebar/sections/knockout.section';

const components: angular.IModule = angular.module('pathwayvis.components', [
    'pathwayvis.components.map',
    'pathwayvis.components.sidebar',
    'pathwayvis.components.sections.knockout'
]);

export default components;
