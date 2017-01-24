"use strict";
var angular = require("angular");
var escher = require("escher");
var d3 = require("d3");
var _ = require("lodash");
var decaf_common_1 = require("decaf-common");
require("../../services/actions/actions.service");
require("./views/map.component.css!");
var component = angular.module('pathwayvis.components.map', [
    'pathwayvis.services.actions'
]);
/**
 * Pathway map component
 */
var MapComponentCtrl = (function () {
    /* @ngInject */
    function MapComponentCtrl($scope, api, actions, ws) {
        var _this = this;
        this._api = api;
        this._ws = ws;
        this._mapElement = d3.select('.map-container');
        this.actions = actions;
        this.$scope = $scope;
        // Map watcher
        $scope.$watch('ctrl.shared.map.map', function () {
            // Be careful that you init map only once!
            if (!_.isEmpty(_this.shared.map.map) && !_this._builder) {
                _this._initMap();
            }
        }, true);
        // Reaction data watcher
        $scope.$watch('ctrl.shared.map.reactionData', function () {
            if (_this.shared.map.reactionData) {
                _this._loadData();
            }
        }, true);
        $scope.$watch('ctrl.shared.model.uid', function () {
            if (_this.shared.model.uid) {
                _this._loadModel();
            }
        });
        $scope.$watch('ctrl.shared.map.removedReactions', function () {
            if (_this._builder) {
                _this._builder.set_knockout_reactions(_this.shared.map.removedReactions);
            }
        }, true);
        // Default map settings
        this.shared.map.settings = {
            menu: 'all',
            ignore_bootstrap: true,
            never_ask_before_quit: true,
            reaction_styles: ['color', 'size', 'text', 'abs'],
            identifiers_on_map: 'bigg_id',
            hide_all_labels: false,
            hide_secondary_metabolites: false,
            highlight_missing: true,
            reaction_scale: [
                { type: 'min', color: '#A841D0', size: 20 },
                { type: 'Q1', color: '#868BB2', size: 20 },
                { type: 'Q3', color: '#6DBFB0', size: 20 },
                { type: 'max', color: '#54B151', size: 20 }
            ],
            reaction_no_data_color: '#CBCBCB',
            reaction_no_data_size: 10
        };
        $scope.$on('$destroy', function handler() {
            ws.close();
        });
    }
    /**
     * Callback function for clicked action button in context menu
     */
    MapComponentCtrl.prototype.processActionClick = function (action, data) {
        var _this = this;
        var shared = _.cloneDeep(this.shared);
        if (action.type === 'reaction:knockout:do')
            shared.map.removedReactions.push(data.bigg_id);
        if (action.type === 'reaction:knockout:undo')
            _.remove(shared.map.removedReactions, function (id) { return id === data.bigg_id; });
        this.actions.callAction(action, { shared: shared }).then(function (response) {
            _this.shared.map.growthRate = parseFloat(response['growth-rate']);
            _this.shared.map.reactionData = response.fluxes;
            _this.shared.map.removedReactions = response['removed-reactions'];
            _this.$scope.$apply();
        });
    };
    /**
     * Initializes map
     */
    MapComponentCtrl.prototype._initMap = function () {
        this._builder = escher.Builder(this.shared.map.map, null, null, this._mapElement, this.shared.map.settings);
        if (!_.isEmpty(this.shared.model))
            this._loadModel();
        this._loadContextMenu();
    };
    /**
     * Loads model to the map
     */
    MapComponentCtrl.prototype._loadModel = function () {
        // Load model data
        this._builder.load_model(this.shared.model);
        // Empty previously removed reactions
        this.shared.map.removedReactions = [];
        // Check removed and added reactions and genes from model
        var changes = this.shared.model.notes.changes;
        if (!_.isEmpty(changes)) {
            this.shared.map.removedReactions = _.map(changes.removed.reactions, function (reaction) {
                return reaction.id;
            });
        }
        // Open WS connection for model
        this._ws.connect(true, this.shared.model.uid);
    };
    /**
     * Loads data to the map
     * TODO: handle metabolite and gene data
     */
    MapComponentCtrl.prototype._loadData = function () {
        var reactionData = this.shared.map.reactionData;
        // Handle FVA method response
        if (this.shared.method === 'fva') {
            // const fvaData = reactionData;
            var fvaData = _.pickBy(reactionData, function (data) {
                if (Math.abs((data.upper_bound + data.lower_bound) / 2) > Math.pow(10, -7))
                    return true;
            });
            reactionData = _.mapValues(fvaData, function (data) {
                return (data.upper_bound + data.lower_bound) / 2;
            });
            this._builder.set_reaction_data(reactionData);
            this._builder.set_reaction_fva_data(fvaData);
            return;
        }
        // Remove zero values
        reactionData = _.pickBy(reactionData, function (value) {
            if (Math.abs(value) > Math.pow(10, -7))
                return true;
        });
        this._builder.set_reaction_data(reactionData);
    };
    /**
     * Loads context menu and fetches list of actions for selected map element
     */
    MapComponentCtrl.prototype._loadContextMenu = function () {
        var _this = this;
        var selection = this._builder.selection;
        var contextMenu = d3.select('.map-context-menu');
        selection.selectAll('.reaction, .reaction-label')
            .style('cursor', 'pointer')
            .on('contextmenu', function (d) {
            _this.contextElement = d;
            _this.contextActions = _this.actions.getList({
                type: 'map:reaction',
                shared: _this.shared,
                element: _this.contextElement
            });
            if (_this.contextElement) {
                _this._renderContextMenu(contextMenu, selection);
                d3.event.preventDefault();
            }
        });
        d3.select(document).on('click', function () {
            contextMenu.style('visibility', 'hidden');
        });
    };
    /**
     * Renders and positions context menu based on selected element
     */
    MapComponentCtrl.prototype._renderContextMenu = function (contextMenu, selection) {
        var position = d3.mouse(selection.node());
        contextMenu.style('position', 'absolute')
            .style('left', position[0] + 'px')
            .style('top', position[1] + 'px')
            .style('visibility', 'visible');
        this.$scope.$apply();
    };
    return MapComponentCtrl;
}());
var mapComponent = {
    controller: MapComponentCtrl,
    controllerAs: 'ctrl',
    templateUrl: decaf_common_1.dirname(module.id) + "/views/map.component.html",
    bindings: {
        shared: '='
    }
};
// Register component
component.component('pvMap', mapComponent);

//# sourceMappingURL=map.component.js.map
