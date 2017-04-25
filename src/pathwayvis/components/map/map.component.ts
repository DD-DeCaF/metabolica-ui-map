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
import {ToastService} from "../../services/toastservice";
import {MapOptionService} from "../../services/mapoption.service";
import {isUndefined} from "util";


/**
 * Pathway map component
 */
class MapComponentCtrl {
    public shared: types.Shared;
    public actions: ActionsService;
    public contextActions: types.Action[];
    public contextElement: Object;

    private _mapOptions: MapOptionService;
    private _mapElement: d3.Selection<any>;
    private _builder: any;
    private _api: APIService;
    private _ws: WSService;
    private $scope: angular.IScope;
    private toastService: ToastService;
    private info: Object;
    private _q: any;

    /* @ngInject */
    constructor ($scope: angular.IScope,
                 api: APIService,
                 actions: ActionsService,
                 ws: WSService,
                 ToastService: ToastService,
                 $q: angular.IQService,
                 MapOptions: MapOptionService
    ) {

        this._api = api;
        this._ws = ws;
        this._mapElement = d3.select('.map-container');
        this.toastService = ToastService;
        this._q = $q;
        this._mapOptions = MapOptions;

        this.actions = actions;
        this.$scope = $scope;

        $scope.$watch('ctrl._mapOptions.getMapSettings()', () => {
            let settings = this._mapOptions.getMapSettings();
            if(settings.model_id && settings.map_id){
                this._setMap(this._mapOptions.getSelectedMap())

                let builder = this._builder;
                if (builder){
                    builder.draw_knockout_reactions();
                }
            }
        }, true);

        // Map watcher
        $scope.$watch('ctrl._mapOptions.getCurrentMapId()', () => {
            if (this._mapOptions.getCurrentMapId()) {
                this._initMap();
                if (this._mapOptions.getCurrentReactionData()) {
                    this._loadData();
                }
                if (this._builder){
                    this._builder.draw_knockout_reactions();
                }
            }
        }, true);

        // Reaction data watcher
        $scope.$watch('ctrl._mapOptions.getCurrentReactionData()', () => {
            if (this._mapOptions.getCurrentReactionData()) {
                this._loadData();
            }
        }, true);

        $scope.$watch('ctrl._mapOptions.getCurrentModelId()', () => {
            if (this._mapOptions.getCurrentModelId()) {
                this._loadModel(true);
            }
        });

        $scope.$watch('ctrl._mapOptions.getCurrentRemovedReactions()', () => {
            if (this._builder) {
                this._builder.set_knockout_reactions(this._mapOptions.getCurrentRemovedReactions());
            }
        }, true);

        $scope.$watch('ctrl._mapOptions.getSelectedItems()', () => {
           let selected = this._mapOptions.getSelectedItems();
           if(selected.method && selected.phase && selected.method && selected.experiment){
               this._loadMap(selected);
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
    }

    private _setMap(map: string): void {
        if (map) {
            this.shared.loading++;
            let settings = this._mapOptions.getMapSettings();
            this._api.request_model('map', {
                'model': settings.model_id,
                'map': settings.map_id,
            }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
                this._mapOptions.setMap(response.data);
                this.shared.loading--;
            }, (error) => {
                this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected map.');
                this.shared.loading--;
            });
            // if (this.selected.method == 'fva' || this.selected.method == 'pfba-fva') {
            //     this.shared.removedReactions = [];
            //     this.shared.loading++;
            //     this._api.get('samples/:sampleId/model', {
            //         'sampleId': this.selected.sample,
            //         'phase-id': this.selected.phase,
            //         'method': this.selected.method,
            //         'map': this.selected.map,
            //         'with-fluxes': 1
            //     }).then((response: angular.IHttpPromiseCallbackArg<any>) => {
            //         this.shared.model = response.data.model;
            //         this.shared.model.uid = response.data['model-id'];
            //         this.shared.map.reactionData = response.data.fluxes;
            //         this.shared.loading--;
            //     }, (error) => {
            //         this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected map.');
            //         this.shared.loading--;
            //     });
            // }
        }
    };

    private _loadMap(selectedItem: types.SelectedItems): void{
        this.shared.loading++;
        let settings = this._mapOptions.getMapSettings();
        const mapPromise = this._api.request_model('map', {
            'model': settings.model_id,
            'map': settings.map_id,
        });

        const modelPromise = this._api.get('samples/:sampleId/model', {
            'sampleId': selectedItem.sample,
            'phase-id': selectedItem.phase,
            'method': selectedItem.method,
            'map': settings.map_id,
            'with-fluxes': 1
        });

        const infoPromise = this._api.get('samples/:sampleId/info', {
            'sampleId': selectedItem.sample,
            'phase-id': selectedItem.phase
        });

        this._q.all([mapPromise, modelPromise, infoPromise]).then((responses: any) => {
            // Add loaded data to shared scope
            // this.shared.map.map = responses[0].data;
            this._mapOptions.setMap(responses[0].data);
            // this.shared.model = responses[1].data.model;
            this._mapOptions.setModel(responses[1].data.model, responses[1].data['model-id']);
            // this.shared.model.uid = responses[1].data['model-id'];
            // this.shared.map.reactionData = responses[1].data.fluxes;
            this._mapOptions.setReactionData(responses[1].data.fluxes);
            // this.shared.method = selectedItem.method;
            // this.info = responses[2].data;
            this._mapOptions.setMapInfo(responses[2].data);

            // this.$scope.$root.$broadcast('infoFromMap', this.info);
            this.shared.loading--;
        }, (error) => {
            this.toastService.showErrorToast('Oops! Sorry, there was a problem with fetching the data.');
            this.shared.loading--;
        })
    }

    /**
     * Callback function for clicked action button in context menu
     */
    public processActionClick(action, data) {
        this.shared.loading++;

        const shared  = JSON.parse(JSON.stringify(this._mapOptions.getMapData()));

        if (action.type === 'reaction:knockout:do') shared.removedReactions.push(data.bigg_id);
        if (action.type === 'reaction:knockout:undo'){
            let index = shared.removedReactions.indexOf(data.bigg_id);
            if(index > -1){
                shared.removedReactions.splice(index, 1);
            }
        }
        // TODO - Remember to switch to MapData
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
            menu: 'none',
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
            reaction_knockout: this._mapOptions.getCurrentRemovedReactions() ? this._mapOptions.getCurrentRemovedReactions() : []
        };
        this._builder = escher.Builder(this._mapOptions.getCurrentMap(), null, null, this._mapElement, settings);
        if (!isUndefined(this._mapOptions.getCurrentModelId())){
            this._loadModel(false);
        }
        this._loadContextMenu();
    }

    /**
     * Loads model to the map
     */
    private _loadModel(restore_knockouts: Boolean): void {
        // Load model data
        this._builder.load_model(this._mapOptions.getCurrentModel());

        // Empty previously removed reactions
        if (restore_knockouts) this._mapOptions.setRemovedReactions([]);
        // Check removed and added reactions and genes from model
        let model = this._mapOptions.getCurrentModel();
        const changes = model.notes.changes;

        if (changes && this._mapOptions.getCurrentRemovedReactions().length == 0) {
            // this.shared.removedReactions
            let reactions = changes.removed.reactions.map(function (reaction: types.Reaction) {
                return reaction.id;
            });
            this._mapOptions.setRemovedReactions(reactions);
        }

        // Open WS connection for model if it is not opened
        if (!this._ws.readyState) {
            this._ws.connect(true, model.uid);
        }
    }

    /**
     * Loads data to the map
     * TODO: handle metabolite and gene data
     */
    private _loadData(): void {
        let reactionData = this._mapOptions.getCurrentReactionData();

        // Handle FVA method response
        let selected = this._mapOptions.getSelectedItems();
        if (selected.method === 'fva' || selected.method === 'pfba-fva') {

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
                    shared: this._mapOptions.getMapData(),
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
