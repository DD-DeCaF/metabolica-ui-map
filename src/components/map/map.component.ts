import * as angular from 'angular';
import * as escher from 'escher';
import * as d3 from 'd3';
import * as _ from 'lodash';

import {dirname} from 'decaf-common';
import {APIService} from '../../services/api';
import {WSService} from '../../services/ws';
import {ActionsService} from '../../services/actions/actions.service';

import * as types from '../../types';
import '../../services/actions/actions.service';

import './views/map.component.css!';
const component = angular.module('pathwayvis.components.map', [
    'pathwayvis.services.actions'
]);

/**
 * Pathway map component
 */
class MapComponentCtrl {
    public title: string;
    public shared: types.Shared;
    public actions: ActionsService;
    public contextActions: types.Action[];
    public contextElement: Object;

    private _mapElement: d3.Selection<any>;
    private _builder: any;
    private _api: APIService;
    private _ws: WSService;
    private $scope: angular.IScope;

    /* @ngInject */
    constructor ($scope: angular.IScope, api: APIService, actions: ActionsService, ws: WSService) {
        this._api = api;
        this._ws = ws;
        this._mapElement = d3.select('.map-container');

        this.actions = actions;
        this.$scope = $scope;

        // Map watcher
        $scope.$watch('ctrl.shared.map.map', () => {
            // Be careful that you init map only once!
            if (!_.isEmpty(this.shared.map.map) && !this._builder) {
                this._initMap();
            }
        }, true);

        // Reaction data watcher
        $scope.$watch('ctrl.shared.map.reactionData', () => {
            if (this.shared.map.reactionData) {
                this._loadData();
            }
        }, true);

        $scope.$watch('ctrl.shared.model.uid', () => {
            if (this.shared.model.uid) {
                this._loadModel();
            }
        });

        $scope.$watch('ctrl.shared.map.removedReactions', () => {
            if (this._builder) {
                this._builder.set_knockout_reactions(this.shared.map.removedReactions);
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
    public processActionClick(action, data) {

        const shared = _.cloneDeep(this.shared);

        if (action.type === 'reaction:knockout:do') shared.map.removedReactions.push(data.bigg_id);
        if (action.type === 'reaction:knockout:undo') _.remove(shared.map.removedReactions, (id) => id === data.bigg_id);

        this.actions.callAction(action, {shared: shared}).then((response) => {
            this.shared.map.growthRate = parseFloat(response['growth-rate']);
            this.shared.map.reactionData = response.fluxes;
            this.shared.map.removedReactions = response['removed-reactions'];
            this.$scope.$apply();
        });
    }

    /**
     * Initializes map
     */
    private _initMap(): void {
        this._builder = escher.Builder(this.shared.map.map, null, null, this._mapElement, this.shared.map.settings);
        if (!_.isEmpty(this.shared.model)) this._loadModel();
        this._loadContextMenu();
    }

    /**
     * Loads model to the map
     */
    private _loadModel(): void {
        // Load model data
        this._builder.load_model(this.shared.model);

        // Empty previously removed reactions
        this.shared.map.removedReactions = [];

        // Check removed and added reactions and genes from model
        const changes = this.shared.model.notes.changes;
        if (!_.isEmpty(changes)) {
            this.shared.map.removedReactions = _.map(changes.removed.reactions, (reaction: types.Reaction) => {
                return reaction.id;
            });
        }

        // Open WS connection for model
        this._ws.connect(true, this.shared.model.uid);
    }

    /**
     * Loads data to the map
     * TODO: handle metabolite and gene data
     */
    private _loadData(): void {

        let reactionData = this.shared.map.reactionData;

        // Handle FVA method response
        if (this.shared.method === 'fva') {

            // const fvaData = reactionData;
            const fvaData = _.pickBy(reactionData, (data) => {
                if (Math.abs((data.upper_bound + data.lower_bound) / 2) > Math.pow(10, -7)) return true;
            });

            reactionData = _.mapValues(fvaData, (data) => {
                return (data.upper_bound + data.lower_bound) / 2;
            });

            this._builder.set_reaction_data(reactionData);
            this._builder.set_reaction_fva_data(fvaData);

            return;
        }

        // Remove zero values
        reactionData = _.pickBy(reactionData, (value: number) => {
            if (Math.abs(value) > Math.pow(10, -7)) return true;
        });

        this._builder.set_reaction_data(reactionData);
    }

    /**
     * Loads context menu and fetches list of actions for selected map element
     */
    private _loadContextMenu(): void {
        const selection = this._builder.selection;
        const contextMenu = d3.select('.map-context-menu');

        selection.selectAll('.reaction, .reaction-label')
            .style('cursor', 'pointer')
            .on('contextmenu', (d) => {
                this.contextElement = d;
                this.contextActions = this.actions.getList({
                    type: 'map:reaction',
                    shared: this.shared,
                    element: this.contextElement
                });

                if (this.contextElement) {
                    this._renderContextMenu(contextMenu, selection);
                    (<Event> d3.event).preventDefault();
                }
            });

        d3.select(document).on('click', () => {
            contextMenu.style('visibility', 'hidden');
        });
    }

    /**
     * Renders and positions context menu based on selected element
     */
    private _renderContextMenu(contextMenu, selection): void {
        const position = d3.mouse(selection.node());
        contextMenu.style('position', 'absolute')
            .style('left', position[0] + 'px')
            .style('top', position[1] + 'px')
            .style('visibility', 'visible');
        this.$scope.$apply();
    }
}

const mapComponent: angular.IComponentOptions = {
    controller: MapComponentCtrl,
    controllerAs: 'ctrl',
    templateUrl: `${dirname(module.id)}/views/map.component.html`,
    bindings: {
        shared: '='
    }
};

// Register component
component.component('pvMap', mapComponent);
