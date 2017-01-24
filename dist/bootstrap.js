"use strict";
// Never remove this import of `angular` from here.
// NOTE: the import form angular also makes the `angular` namespace available globally
var angular = require("angular");
require("angular-material");
require("angular-ui-router");
// Turn of WS TS inspection for the 'decaf-common' import.
// noinspection TypeScriptCheckImport
var decaf_common_1 = require("decaf-common");
var src_1 = require("src");
var app = angular.module('app', [
    // Angular
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    // 3rd Party
    'ui.router',
    // Common
    decaf_common_1.config.name,
    decaf_common_1.sharing.name,
    decaf_common_1.core.name,
    // Component
    src_1.default.name
]);
// Production config
app.config(function ($httpProvider) {
    // http://blog.thoughtram.io/angularjs/2015/01/14/exploring-angular-1.3-speed-up-with-applyAsync.html
    $httpProvider.useApplyAsync(true);
});
// AM theme config
app.config(function ($mdThemingProvider) {
    $mdThemingProvider
        .theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('grey');
});
// Router config
app.config(function ($urlMatcherFactoryProvider, $urlRouterProvider, $stateProvider) {
    // Optional slash
    $urlMatcherFactoryProvider.strictMode(false);
    // TODO: perhaps this should not happen
    // Always go to the component state when visiting the root
    $urlRouterProvider.when('', "" + src_1.default.name);
    // Root state
    $stateProvider.state('root', {
        url: '',
        abstract: true
    });
});
// Main component
var AppController = (function () {
    function AppController($window, $scope, config) {
        var _this = this;
        this.isSidebarVisible = true;
        $window.document.title = "Platform \u2013 Component({name: " + src_1.default.name + "})";
        this.config = config;
        // noinspection TypeScriptUnresolvedFunction
        config.set('componentConfig', {});
        // Hide sidebar if there is no navigation set from the component.
        $scope.$on('$stateChangeStart', function (toState, toParams) {
            if (!toParams || !toParams.hasOwnProperty('views') || !toParams.views.hasOwnProperty('navigation@')) {
                _this.isSidebarVisible = false;
            }
        });
    }
    Object.defineProperty(AppController.prototype, "color", {
        // Update color from config
        get: function () {
            // Turn off WS inspection for this
            // noinspection TypeScriptUnresolvedFunction
            return this.config.get('color');
        },
        enumerable: true,
        configurable: true
    });
    AppController.prototype.$onInit = function () {
        console.info('App is running.');
    };
    return AppController;
}());
app.component('app', {
    bindings: {},
    controller: AppController,
    controllerAs: 'app',
    transclude: {
        'navigation': '?appNavigation',
        'toolbar': '?appToolbar'
    },
    template: "\n        <div layout=\"row\" flex ui-view=\"root\">\n            <md-sidenav ng-if=\"app.isSidebarVisible\" layout=\"column\" class=\"md-sidenav-left md-whiteframe-z2\" md-component-id=\"left\" md-is-locked-open=\"$mdMedia('gt-sm')\">\n                <div ng-transclude=\"navigation\"></div>\n                <div ui-view=\"navigation\"></div>\n            </md-sidenav>\n            <div layout=\"column\" flex id=\"content\">\n                <md-toolbar class=\"component-color\" ng-style=\"{'background-color': app.color || app.component.color}\">\n                    <div class=\"md-toolbar-tools\" ui-view=\"toolbar\">\n                        <h1 flex>\n                            {{app.component.navigation.label}}\n                        </h1>\n                        <div ng-transclude=\"toolbar\"></div>\n                    </div>\n                </md-toolbar>\n                <md-content layout=\"column\"\n                            ui-view=\"content\"\n                            flex>\n                </md-content>\n            </div>\n        </div>\n    "
});
// Bootstrap
angular.element(document).ready(function () {
    angular.bootstrap(document.documentElement, [app.name], {
        // Do not enable strict DI.
        // NOTE: If we use `{strictDi: true}` we will not be able to use DI with ES6 classes
        strictDi: false
    });
});

//# sourceMappingURL=bootstrap.js.map
