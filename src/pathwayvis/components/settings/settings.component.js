"use strict";
exports.__esModule = true;
/**
 * Created by dandann on 28/03/2017.
 */
var template = require("./settings.component.html");
require("./settings.component.scss");
var SettingsComponentController = (function () {
    function SettingsComponentController($mdSidenav, MapOptions, $interval) {
        this.animationPromis = null;
        this.animating = false;
        this.mapOptions = MapOptions;
        this.$mdSidenav = $mdSidenav;
        this.$interval = $interval;
    }
    SettingsComponentController.prototype.disableInfo = function () {
        return !this.mapOptions.getCurrentMapInfo()['medium'] || this.disableForAnimation();
    };
    SettingsComponentController.prototype.disableMapSelector = function () {
        return !this.mapOptions.getModel() || this.disableForAnimation();
    };
    SettingsComponentController.prototype.disableKnockedOutTab = function () {
        return this.mapOptions.getCurrentRemovedReactions().length <= 0 || this.disableForAnimation();
    };
    SettingsComponentController.prototype.toggleRight = function () {
        this.$mdSidenav('right').toggle();
    };
    SettingsComponentController.prototype.getMapObjectsIds = function () {
        return this.mapOptions.getMapObjectsIds();
    };
    SettingsComponentController.prototype.addMapObject = function () {
        this.mapOptions.addMapObject();
    };
    SettingsComponentController.prototype.playIcon = function () {
        if (this.animationPromis) {
            return 'pause';
        }
        return 'play_arrow';
    };
    SettingsComponentController.prototype.toggleAnimation = function () {
        if (this.animationPromis) {
            this.animating = false;
            this.$interval.cancel(this.animationPromis);
            this.animationPromis = null;
        }
        else {
            this.animating = true;
            this.animationPromis = this.$interval(this.nextMapObject.bind(this), 500);
        }
    };
    SettingsComponentController.prototype.nextMapObject = function () {
        this.mapOptions.nextMapObject();
    };
    SettingsComponentController.prototype.previousMapObject = function () {
        this.mapOptions.previousMapObject();
    };
    SettingsComponentController.prototype.disablePlayBtn = function () {
        return this.mapOptions.getNumberOfMapObjects() <= 1;
    };
    SettingsComponentController.prototype.disableControls = function () {
        return this.disablePlayBtn() || this.animationPromis;
    };
    SettingsComponentController.prototype.disableForAnimation = function () {
        return !!this.animationPromis;
    };
    return SettingsComponentController;
}());
exports.SettingsComponent = {
    controller: SettingsComponentController,
    controllerAs: 'ctrl',
    template: template.toString()
};
