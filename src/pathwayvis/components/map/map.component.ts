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
    private $window: angular.IWindowService;

    /* @ngInject */
    constructor ($scope: angular.IScope,
                 api: APIService,
                 actions: ActionsService,
                 ws: WSService,
                 ToastService: ToastService,
                 $q: angular.IQService,
                 MapOptions: MapOptionService,
                 $window: angular.IWindowService
    ) {
        this.$window = $window;
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
                if(this._mapOptions.shouldUpdateData){
                    this.updateAllMaps();
                    this._mapOptions.dataUpdated();
                }
                this._setMap(this._mapOptions.getSelectedMap());

                let builder = this._builder;
                if (builder){
                    this._builder.set_knockout_reactions(this._mapOptions.getCurrentRemovedReactions());
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

        $scope.$watch('ctrl._mapOptions.getCurrentMapObjectId()', () => {
            this.mapChanged();
        });

        $scope.$watch('ctrl._mapOptions.getCurrentRemovedReactions()', () => {
            let removedReactions = this._mapOptions.getCurrentRemovedReactions();
            if (this._builder && removedReactions) {
                this._builder.set_knockout_reactions(removedReactions);
                this._builder.draw_knockout_reactions();
            }
        }, true);

        $scope.$watch('ctrl._mapOptions.getCurrentReactionData()', () => {
            let reactionData = this._mapOptions.getCurrentReactionData();
            let model = this._mapOptions.getCurrentModelId();
            if (this._builder) {
                if(model){
                    this._loadModel(true);
                }
                if(reactionData) {
                    this._loadData();
                } else {
                    this._builder.set_reaction_data(reactionData);
                }
            }
        }, true);


        $scope.$watch('ctrl._mapOptions.getCurrentSelectedItems()',() => {
            let selected = this._mapOptions.getCurrentSelectedItems();
            if(this._mapOptions.shouldLoadMap){
                if (selected.method && selected.phase && selected.sample && selected.experiment) {
                    this._loadMap(selected, this._mapOptions.selectedMapObjectId);
                }
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

    private mapChanged(): void {
        let mapObject = this._mapOptions.getCurrentMapObject();
        if(this._mapOptions.isCompleteMapObject(mapObject)){
            this._builder.load_model(this._mapOptions.getCurrentModel());
            this._builder.set_knockout_reactions(this._mapOptions.getCurrentRemovedReactions());
            this._loadContextMenu();
        }
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
        }
    };

    private updateAllMaps(){
        let self = this;
        let id_list = this._mapOptions.getMapObjectsIds();
        id_list.forEach(function (id) {
            let selectedItem = self._mapOptions.getMapObject(id).selected;
            self._loadMap(selectedItem, id);
        })

    }

    private _loadMap(selectedItem: types.SelectedItems, id: number): void{
        this.shared.loading++;
        let settings = this._mapOptions.getMapSettings();

        const modelPromise = this._api.post('data-adjusted/model', {
            'sampleIds': JSON.parse(selectedItem.sample),
            'phaseId': JSON.parse(selectedItem.phase),
            'method': selectedItem.method,
            'map': settings.map_id,
            'withFluxes': true,
            'modelId': settings.model_id
        });

        const infoPromise = this._api.post('samples/info', {
            'sampleIds': JSON.parse(selectedItem.sample),
            'phaseId': JSON.parse(selectedItem.phase)
        });

        this._q.all([modelPromise, infoPromise]).then((responses: any) => {
            this._mapOptions.setModel(responses[0].data['response'][selectedItem.phase].model, responses[0].data['response']['model-id'], id);
            this._mapOptions.setReactionData(responses[0].data['response'][selectedItem.phase].fluxes, id);
            this._mapOptions.setMapInfo(responses[1].data['response'][selectedItem.phase], id);

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

        if (action.type === 'reaction:link'){
            this.$window.open('http://bigg.ucsd.edu/universal/reactions/' + data.bigg_id);
            return;
        }

        this._mapOptions.actionHandler(action, data.bigg_id).then((response) => {
            this._mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
            this._mapOptions.setReactionData(response.fluxes);
            this._mapOptions.setRemovedReactions(response['removed-reactions']);
            this.$scope.$apply();
        });
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
            reaction_knockout: this._mapOptions.getCurrentRemovedReactions()
        };
        this._builder = escher.Builder(this._mapOptions.getCurrentMap(), null, null, this._mapElement, settings);
        if (this._mapOptions.getCurrentModelId() != null){
            this._loadModel(false);
        }
    }

    /**
     * Loads model to the map
     */
    private _loadModel(restore_knockouts: Boolean): void {
        let model = this._mapOptions.getCurrentModel();
        // Load model data
        this._builder.load_model(model);

        // Empty previously removed reactions
        if (restore_knockouts) this._mapOptions.setRemovedReactions([]);
        // Check removed and added reactions and genes from model
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
        let selected = this._mapOptions.getCurrentSelectedItems();
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

        } else {
            // Remove zero values
            reactionData = _.pickBy(reactionData, (value: number) => {
                if (Math.abs(value) > Math.pow(10, -7)) return true;
            });

            this._builder.set_reaction_data(reactionData);
        }
        this._loadContextMenu();
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
                    shared: this._mapOptions.getCurrentMapData(),
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

    public showLegen(): boolean{
        return !!this._mapOptions.getCurrentReactionData();
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
