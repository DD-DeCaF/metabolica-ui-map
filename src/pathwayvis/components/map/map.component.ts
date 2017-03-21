import * as escher from 'escher-vis';
import * as d3 from 'd3';
import * as _ from 'lodash';
import "jquery-ui";
import "jquery";

import {APIService} from '../../services/api';
import {WSService} from '../../services/ws';
import {ActionsService} from '../../services/actions/actions.service';

import * as types from '../../types';

import './views/map.component.scss';
import * as template from './views/map.component.html';


/**
 * Pathway map component
 */
class MapComponentCtrl {
    public title: string;
    public shared: types.Shared;
    public actions: ActionsService;
    public contextActions: types.Action[];
    public contextElement: Object;
    public selected: types.SelectedItems = {};

    private _mapElement: d3.Selection<any>;
    private _builder: any;
    private _api: APIService;
    private _ws: WSService;
    private $scope: angular.IScope;
    private _toastr: angular.toastr.IToastrService;
    private _model: any;
    private info: Object;
    private _q: any;

    /* @ngInject */
    constructor ($scope: angular.IScope,
                 api: APIService,
                 actions: ActionsService,
                 ws: WSService,
                 toastr: angular.toastr.IToastrService,
                 $q: angular.IQService
    ) {

        this._api = api;
        this._ws = ws;
        this._mapElement = d3.select('.map-container');
        this._toastr = toastr;
        this._q = $q;

        this.actions = actions;
        this.$scope = $scope;

        $scope.$on('selectedMapChanged', function (ev, map) {
            ev.currentScope['ctrl']._setMap(map);
        });
        $scope.$on('modelChanged', function (event, model) {
            event.currentScope['ctrl']._setModel(model);
        });
        $scope.$on('loadMap', function (ev, selected: types.SelectedItems) {
            ev.currentScope['ctrl']._loadMap(selected);
        });

        // Map watcher
        $scope.$watch('ctrl.shared.map.map[0].map_id', () => {
            if (!_.isEmpty(this.shared.map.map)) {
                this._initMap();
                if (this.shared.map.reactionData) {
                    this._loadData();
                }

                if (this._builder){
                    this._builder.draw_knockout_reactions();
                }
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
                this._loadModel(true);
            }
        });

        $scope.$watch('ctrl.shared.removedReactions', () => {
            if (this._builder) {
                this._builder.set_knockout_reactions(this.shared.removedReactions);
            }
        }, true);

        $scope.$on('$destroy', function handler() {
            ws.close();
        });

        $scope.$on('knockout', function handler(event, reaction){
            if (this._builder){
                this._builder.knockout_reaction(reaction);
            }
        });

        $scope.$on('undo_knockout', function handler(event, reaction){
            if (this._builder){
                this._builder.undo_knockout_reaction(reaction);
            }
        });

        $scope.$on('draw_knockout', function handler(ev){
            let builder = ev.currentScope['ctrl']._builder;
            if (builder){
                builder.draw_knockout_reaction();
            }
        })
    }

    private _setModel(model): void {
        this._model = model;
    }

    private _setMap(map: string): void {
        this.selected.map = map;
        if (!_.isEmpty(this.selected.map)) {
            this.shared.loading++;
            this._api.request_model('map', {
                'model': this._model,
                'map': this.selected.map,
            }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                this.shared.map.map = response.data;
                this.$scope.$emit('draw_knockout');
                this.shared.loading--;
            }, (error) => {
                this._toastr.error('Oops! Sorry, there was a problem loading selected map.', '', {
                    closeButton: true,
                    timeOut: 10500
                });

                this.shared.loading--;
            });
            if (this.selected.method == 'fva' || this.selected.method == 'pfba-fva') {
                this.shared.removedReactions = [];
                this.shared.loading++;
                this._api.get('samples/:sampleId/model', {
                    'sampleId': this.selected.sample,
                    'phase-id': this.selected.phase,
                    'method': this.selected.method,
                    'map': this.selected.map,
                    'with-fluxes': 1
                }).then((response: angular.IHttpPromiseCallbackArg<any>) => {
                    this.shared.model = response.data.model;
                    this.shared.model.uid = response.data['model-id'];
                    this.shared.map.reactionData = response.data.fluxes;
                    this.shared.loading--;
                }, (error) => {
                    this._toastr.error('Oops! Sorry, there was a problem loading selected map.', '', {
                        closeButton: true,
                        timeOut: 10500
                    });

                    this.shared.loading--;
                });
            }
        }
    };

    private _loadMap(selectedItem: types.SelectedItems){
        this.shared.loading++;
        const mapPromise = this._api.request_model('map', {
            'model': selectedItem.model,
            'map': this.selected.map,
        });

        const modelPromise = this._api.get('samples/:sampleId/model', {
            'sampleId': selectedItem.sample,
            'phase-id': selectedItem.phase,
            'method': selectedItem.method,
            'map': this.selected.map,
            'with-fluxes': 1
        });

        const infoPromise = this._api.get('samples/:sampleId/info', {
            'sampleId': selectedItem.sample,
            'phase-id': selectedItem.phase
        });

        this._q.all([mapPromise, modelPromise, infoPromise]).then((responses: any) => {
            // Add loaded data to shared scope
            this.shared.map.map = responses[0].data;
            this.shared.model = responses[1].data.model;
            this.shared.model.uid = responses[1].data['model-id'];
            this.shared.map.reactionData = responses[1].data.fluxes;
            this.shared.method = selectedItem.method;
            this.info = responses[2].data;

            this.$scope.$root.$broadcast('infoFromMap', this.info);

            this.shared.loading--;
        }, (error) => {
            this._toastr.error('Oops! Sorry, there was a problem with fetching the data.', '', {
                closeButton: true,
                timeOut: 10500
            });

            this.shared.loading--;
        })
    }

    /**
     * Callback function for clicked action button in context menu
     */
    public processActionClick(action, data) {
        this.shared.loading++;

        const shared = _.cloneDeep(this.shared);

        if (action.type === 'reaction:knockout:do') shared.removedReactions.push(data.bigg_id);
        if (action.type === 'reaction:knockout:undo') _.remove(shared.removedReactions, (id) => id === data.bigg_id);

        this.actions.callAction(action, {shared: shared}).then((response) => {
            this.shared.map.growthRate = parseFloat(response['growth-rate']);
            this.shared.map.reactionData = response.fluxes;
            this.shared.removedReactions = response['removed-reactions'];
            this.$scope.$apply();
        });
        this.shared.loading--;
    }

    /**
     * Initializes map
     */
    private _initMap(): void {
        // Default map settings
        let settings = {
            menu: 'zoom',
            scroll_behavior: 'zoom',
            fill_screen: true,
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
            reaction_no_data_size: 10,
            reaction_knockout: this.shared.removedReactions ? this.shared.removedReactions : []
        };
        this._builder = escher.Builder(this.shared.map.map, null, null, this._mapElement, settings);
        if (!_.isEmpty(this.shared.model)) this._loadModel(false);
        this._loadContextMenu();
    }

    /**
     * Loads model to the map
     */
    private _loadModel(restore_knockouts: Boolean): void {
        // Load model data
        this._builder.load_model(this.shared.model);

        // Empty previously removed reactions
        if (restore_knockouts) this.shared.removedReactions = [];
        // Check removed and added reactions and genes from model
        const changes = this.shared.model.notes.changes;

        if (!_.isEmpty(changes) && _.isEmpty(this.shared.removedReactions)) {
            this.shared.removedReactions = _.map(changes.removed.reactions, (reaction: types.Reaction) => {
                return reaction.id;
            });
        }

        // Open WS connection for model if it is not opened
        if (!this._ws.readyState) {
            this._ws.connect(true, this.shared.model.uid);
        }
    }

    /**
     * Loads data to the map
     * TODO: handle metabolite and gene data
     */
    private _loadData(): void {
        let reactionData = this.shared.map.reactionData;

        // Handle FVA method response
        if (this.shared.method === 'fva' || this.shared.method === 'pfba-fva') {

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
        contextMenu.style('position', 'absolute')
            .style('left', (<MouseEvent> d3.event).pageX + 'px')
            .style('top', (<MouseEvent> d3.event).pageY + 'px')
            .style('visibility', 'visible');
        this.$scope.$apply();
    }
}

export const mapComponent: angular.IComponentOptions = {
    controller: MapComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '='
    }
};
