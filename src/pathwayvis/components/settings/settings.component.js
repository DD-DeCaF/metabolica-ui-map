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
    //
    // public getSelectedItems(): types.SelectedItems {
    //     return this.mapOptions.selectedItems;
    // }
    SettingsComponentController.prototype.disableInfo = function () {
        return !this.mapOptions.getCurrentMapInfo()['medium'];
    };
    SettingsComponentController.prototype.disableMapSelector = function () {
        return !this.mapOptions.getModel();
    };
    SettingsComponentController.prototype.disableKnockedOutTab = function () {
        return !this.mapOptions.getCurrentRemovedReactions();
    };
    SettingsComponentController.prototype.toggleRight = function () {
        this.$mdSidenav('right').toggle();
    };
    SettingsComponentController.prototype.getMapObjectsIds = function () {
        return this.mapOptions.getMapObjectsIds();
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
