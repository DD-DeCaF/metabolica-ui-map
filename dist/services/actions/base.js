"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Abstract class for Action resources.
 */
var Action = (function () {
    function Action() {
    }
    return Action;
}());
exports.Action = Action;
/**
 * Abstract class for Reaction actions with predefined context type
 */
var ReactionAction = (function (_super) {
    __extends(ReactionAction, _super);
    function ReactionAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReactionAction.prototype.canDisplay = function (context) {
        return context.type === 'map:reaction';
    };
    return ReactionAction;
}(Action));
exports.ReactionAction = ReactionAction;

//# sourceMappingURL=base.js.map
