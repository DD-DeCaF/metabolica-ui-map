"use strict";
exports.__esModule = true;
/**
 * Created by dandann on 28/03/2017.
 */
var template = require("./settings.component.html");
require("./settings.component.scss");
var SettingsComponentController = (function () {
    function SettingsComponentController($mdSidenav, MapOptions) {
        this.mapOptions = MapOptions;
        this.$mdSidenav = $mdSidenav;
    }
    SettingsComponentController.prototype.getSelectedItems = function () {
        return this.mapOptions.selectedItems;
    };
    SettingsComponentController.prototype.toggleRight = function () {
        this.$mdSidenav('right').toggle();
    };
    return SettingsComponentController;
}());
exports.SettingsComponent = {
    controller: SettingsComponentController,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '='
    }
};
