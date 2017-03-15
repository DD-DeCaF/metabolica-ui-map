import angular from 'angular';
import {DevAppModule} from 'metabolica';
import {PathwayVisModule} from './pathwayvis/pathwayvis.module';
export {PathwayVisModule} from './pathwayvis/pathwayvis.module';


export const PathwayVisAppModule = angular.module('PathwayVisApp', [
	DevAppModule.name,
    PathwayVisModule.name
]);
