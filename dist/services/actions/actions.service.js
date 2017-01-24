"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var angular = require("angular");
var _ = require("lodash");
var base_1 = require("./base");
/**
 * Creates @registerAction decorator that is used for registering new actions
 */
exports.actionsList = [];
function registerAction(ActionClass) {
    var action = new ActionClass();
    exports.actionsList.push(action);
}
exports.registerAction = registerAction;
var actions = angular.module('pathwayvis.services.actions', []);
/**
 * Actions service provides all registered actions as injectable service.
 */
var ActionsService = (function () {
    function ActionsService($injector, $q) {
        this.$injector = $injector;
        this._q = $q;
    }
    /**
     * Returns list of all actions filtered by context
     * @param  {[type]} context Object used to filter actions by
     * @return {types.Action[]} List of actions
     */
    ActionsService.prototype.getList = function (context) {
        return _.filter(exports.actionsList, function (action) { return action.canDisplay(context); });
    };
    /**
     * Returns specific action by given type
     * @param  {[type]} type used to filter actions by
     * @return {types.Action} Action
     */
    ActionsService.prototype.getAction = function (type) {
        return _.first(_.filter(exports.actionsList, function (action) { return action.type === type; }));
    };
    /**
     * Invokes action callback with injected arguments
     * @param {[type]} action Callback function from action
     * @param {Object} args Object with arguments that is applied to `this` in action class
     */
    ActionsService.prototype.callAction = function (action, args) {
        return this.$injector.invoke(action.callback, args);
    };
    return ActionsService;
}());
exports.ActionsService = ActionsService;
actions.service('actions', ActionsService);
/**
 * Knockout reaction
 */
var Knockout = (function (_super) {
    __extends(Knockout, _super);
    function Knockout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.label = 'Knockout';
        _this.type = 'reaction:knockout:do';
        return _this;
    }
    // @ngInject
    Knockout.prototype.callback = function (ws, $timeout) {
        var data = {
            'to-return': ['fluxes', 'growth-rate', 'removed-reactions'],
            'simulation-method': this.shared.method,
            'reactions-knockout': this.shared.map.removedReactions
        };
        return $timeout(function () {
            return ws.send(data).then(function (data) {
                return data;
            }, function (error) {
                // TODO: set error
            });
        }, 0, false);
    };
    Knockout.prototype.canDisplay = function (context) {
        var isRemoved = !_.includes(context.shared.map.removedReactions, context.element.bigg_id);
        return context.type === 'map:reaction' && isRemoved;
    };
    return Knockout;
}(base_1.ReactionAction));
Knockout = __decorate([
    registerAction
], Knockout);
/**
 * Undo knockout reaction
 */
var UndoKnockout = (function (_super) {
    __extends(UndoKnockout, _super);
    function UndoKnockout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.label = 'Undo knockout';
        _this.type = 'reaction:knockout:undo';
        return _this;
    }
    UndoKnockout.prototype.canDisplay = function (context) {
        if (context.shared.map.removedReactions) {
            var isRemoved = _.includes(context.shared.map.removedReactions, context.element.bigg_id);
            return context.type === 'map:reaction' && isRemoved;
        }
        return false;
    };
    return UndoKnockout;
}(Knockout));
UndoKnockout = __decorate([
    registerAction
], UndoKnockout);

//# sourceMappingURL=actions.service.js.map
