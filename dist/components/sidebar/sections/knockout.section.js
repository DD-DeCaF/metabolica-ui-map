"use strict";
var angular = require("angular");
var _ = require("lodash");
var decaf_common_1 = require("decaf-common");
require("./views/knockout.section.css!");
var section = angular.module('pathwayvis.components.sections.knockout', []);
/**
 * Knockout component
 */
var KnockoutComponentCtrl = (function () {
    /* @ngInject */
    function KnockoutComponentCtrl($scope, toastr, actions, ws) {
        var _this = this;
        this._ws = ws;
        this._actions = actions;
        this.$scope = $scope;
        // Reaction data watcher
        $scope.$watch('ctrl.shared.map.growthRate', function () {
            if (!_.isUndefined(_this.shared.map.growthRate)) {
                _this.growthRate = _this.shared.map.growthRate;
                _this.removedReactions = _this.shared.map.removedReactions;
                if (_.round(_this.growthRate, 5) === 0) {
                    toastr.warning('Growth rate is 0!', '', {
                        closeButton: true,
                        timeOut: 0,
                        extendedTimeOut: 0
                    });
                }
            }
        }, true);
    }
    KnockoutComponentCtrl.prototype.onReactionRemoveClick = function (selectedReaction) {
        var _this = this;
        var undoKnockoutAction = this._actions.getAction('reaction:knockout:undo');
        var shared = _.cloneDeep(this.shared);
        _.remove(shared.map.removedReactions, function (id) { return id === selectedReaction; });
        var sharedKO = {
            element: {
                bigg_id: selectedReaction
            },
            shared: shared
        };
        this._actions.callAction(undoKnockoutAction, sharedKO).then(function (response) {
            _this.shared.map.growthRate = parseFloat(response['growth-rate']);
            _this.shared.map.reactionData = response.fluxes;
            _this.shared.map.removedReactions = response['removed-reactions'];
            _this.$scope.$apply();
        });
    };
    return KnockoutComponentCtrl;
}());
var KnockoutComponent = {
    controller: KnockoutComponentCtrl,
    controllerAs: 'ctrl',
    templateUrl: decaf_common_1.dirname(module.id) + "/views/knockout.section.html",
    bindings: {
        shared: '='
    }
};
// Register component
section.component('pvKnockout', KnockoutComponent);

//# sourceMappingURL=knockout.section.js.map
