"use strict";
exports.__esModule = true;
/**
 * Created by dandann on 28/03/2017.
 */
require("./info.component.scss");
var template = require("./info.component.html");
/**
 * sidebar component
 */
var InfoComponentCtrl = (function () {
    /* @ngInject */
    function InfoComponentCtrl($scope) {
        this._scope = $scope;
        $scope.$on('infoFromMap', function handler(ev, info) {
            ev.currentScope['ctrl'].setInfo(info);
        });
    }
    InfoComponentCtrl.prototype.setInfo = function (info) {
        this.info = info;
    };
    return InfoComponentCtrl;
}());
exports.InfoComponent = {
    controller: InfoComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
        project: '<project'
    }
};
