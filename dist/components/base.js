"use strict";
var angular = require("angular");
require("./map/map.component");
require("./sidebar/sidebar.component");
require("./sidebar/sections/knockout.section");
var components = angular.module('pathwayvis.components', [
    'pathwayvis.components.map',
    'pathwayvis.components.sidebar',
    'pathwayvis.components.sections.knockout'
]);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = components;

//# sourceMappingURL=base.js.map
