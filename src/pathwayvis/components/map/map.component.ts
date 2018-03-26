import * as escher from '@dd-decaf/escher';
import * as d3 from 'd3';
import { event as currentEvent } from 'd3';
import * as Rx from 'rxjs/Rx';
import * as tinier from 'tinier';

import { APIService } from '../../services/api';
import { ConnectionsService } from '../../services/connections';

import { ActionsService } from '../../services/actions/actions.service';
import { SharedService } from '../../services/shared.service';
import * as types from '../../types';
import './views/map.component.scss';
import * as template from './views/map.component.html';
import { ToastService } from "../../services/toastservice";
import { MapOptionService } from "../../services/mapoption.service";
import { ObjectType } from "../../types";
import * as utils from "../../utils";
import { Tooltip } from "../tooltip/escherTooltip";

class MapComponentCtrl {
  public shared: SharedService;
  public actions: ActionsService;
  public contextActions: types.Action[];
  public contextElement: Object;

  private resetKnockouts: boolean;
  private _mapOptions: MapOptionService;
  private _mapElement: d3.Selection<any>;
  private _builder: any;
  private _api: APIService;
  private _connections: ConnectionsService;
  private $scope: angular.IScope;
  private $rootscope: angular.IRootScopeService;
  private toastService: ToastService;
  private _q: any;
  private $window: angular.IWindowService;
  private pathwayAdded = false;
  private subscription: Rx.Subscription = new Rx.Subscription();

  constructor($scope: angular.IScope,
    api: APIService,
    actions: ActionsService,
    connections: ConnectionsService,
    toastService: ToastService,
    $q: angular.IQService,
    mapOptions: MapOptionService,
    $window: angular.IWindowService,
    shared: SharedService,
    $rootScope: angular.IRootScopeService,
  ) {
    this.$window = $window;
    this._api = api;
    this._connections = connections;
    this._mapElement = d3.select('.map-container');
    this.toastService = toastService;
    this._q = $q;
    this._mapOptions = mapOptions;
    this.shared = shared;
    this.actions = actions;
    this.$scope = $scope;
    this.$rootscope = $rootScope;

    this._mapOptions.componentCB = () => {
      // This callback function could be the future of data loading.
      // Less watchers -> More predictability.
      this._loadModel();
    };

    // TODO @matyasfodor watch expressions consume too much memory
    // see https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
    // TODO @matyasfodor this call sets the map even if a completely different setting is changed.
    // which causes loading the map 3 times in some cases.
    $scope.$watch('ctrl._mapOptions.getMapSettings()', (settings: types.MapSettings) => {
      if (settings.model_id && settings.map_id) {
        if (this._mapOptions.shouldUpdateData) {
          this.updateAllMaps();
          this._mapOptions.dataUpdated();
        } else {
          this.updateFVAMaps();
        }
        this._setMap(this._mapOptions.getSelectedMap());

        if (this._builder) {
          this._builder.set_knockout_reactions(this._mapOptions.getRemovedReactions());
          this._drawAddedReactions(this._mapOptions.getAddedReactions());
        }
      }
    }, true);

    // Map watcher
    $scope.$watch('ctrl._mapOptions.getMapId()', (mapId) => {
      if (!mapId) return;
      this._initMap();
      if (this._mapOptions.getReactionData()) {
        this._loadModel();
        this._loadData();
      }
      if (this._builder) {
        this._builder.set_knockout_reactions(this._mapOptions.getRemovedReactions());
      }
    }, true);

    $scope.$watch('ctrl._mapOptions.getDataModelId()', (modelId) => {
      if (modelId) {
        this._loadModel();
      }
    });

    $scope.$watch('ctrl._mapOptions.getSelectedId()', () => {
      this.mapChanged();
    });

    $scope.$watch('ctrl._mapOptions.getRemovedReactions()', () => {
      let removedReactions = this._mapOptions.getRemovedReactions();
      if (this._builder && removedReactions) {
        this._builder.set_knockout_reactions(removedReactions);
      }
    }, true);

    this.subscription.add(this._mapOptions.addedReactionsObservable
      .subscribe((reactions) => {
        this._drawAddedReactions(reactions);
    }));

    $scope.$watch('ctrl._mapOptions.getDataModel().uid', (modelUid: string) => {
      if (!modelUid) return;
      this._connections.connect(modelUid, true);
    });

    $scope.$watch('ctrl._mapOptions.getDataModel().notes.changes', (changes: any) => {
      if (!changes) {
        return;
      }
      this._loadModel();
      if (changes.added.reactions) {
        // TODO filter out adapter and DM reactions
        const reactions = changes.added.reactions.filter((reaction) => {
          return !['adapter', 'DM', 'EX_'].some((str) => {
            return reaction.id.startsWith(str);
          });
        })
          .map((reaction) => Object.assign({}, reaction, {
            bigg_id: reaction.id,
            metabolites: reaction.metabolites,
          }));
        this._mapOptions.setAddedReactions(reactions);
      }
    });

    $scope.$watch('ctrl._mapOptions.getReactionData()', (reactionData) => {
      let model = this._mapOptions.getDataModelId();
      if (!this._builder) return;
      if (model) {
        this._loadModel();
      }
      if (reactionData) {
        this._loadData();
      } else {
        const type = this._mapOptions.getType();
        if (type === ObjectType.Reference) {
          this._loadMap(type, this._mapOptions.getDataObject().selected, this._mapOptions.getSelectedId());
          reactionData = this._mapOptions.getReactionData();
        }
        this._removeOpacity();

        this._builder.set_reaction_data(reactionData);
      }
    }, true);

    $scope.$watch('ctrl._mapOptions.getCurrentSelectedItems()', (selected: types.SelectedItems) => {
      let type = this._mapOptions.getDataObject().type;
      if (this._mapOptions.shouldLoadMap) {
        if ((selected.method !== null) &&
          (selected.phase !== null) &&
          (selected.sample !== null) &&
          (selected.experiment !== null)) {
          this._loadMap(type, selected, this._mapOptions.selectedCardId);
        }
      }
    }, true);

    $scope.$on('$destroy', () => {
      this._connections.close(this._mapOptions.getDataModelId());
      this.subscription.unsubscribe();
    });
  }

  private _loaded() {
    this.$rootscope.$broadcast('modelLoaded');
  }

  private _removeOpacity() {
    const noOpacity = {};
    if (this._builder.map.cobra_model === null) return;
    let reactions = this._builder.map.cobra_model.reactions;
    Object.keys(reactions).forEach((key) => {
      noOpacity[key] = { 'lower_bound': 0, 'upper_bound': 0 };
    });
    this._builder.set_reaction_fva_data(noOpacity);
  }

  /**
   * addPathway
   * this method adds the pathway shared form the pathway predictor
   */
  private addPathway(item, model) {
    const modelId = (<any> item.param.model_id);
    this._mapOptions.getMapData().model = Object.assign({}, model, {
      id: modelId,
      uid: modelId,
      metabolites: [...model.metabolites, ...item.model.metabolites],
      reactions: [...model.reactions, ...item.model.reactions],
    });
    this._builder.load_model(this._mapOptions.getMapData().model);

    const reactions = item.model.reactions.map(({ id, metabolites }) => ({ id, metabolites }));
    this._builder.add_pathway(reactions);
  }

  private mapChanged(): void {
    let mapObject = this._mapOptions.getDataObject();
    if (mapObject.isComplete()) {
      this._removeOpacity();
      this._loadModel();
      this._builder.set_knockout_reactions(this._mapOptions.getRemovedReactions());
      this._loadContextMenu();
    }
  }

  private _setMap(map: string): void {
    if (!map) return;
    const { model_id, map_id } = this._mapOptions.getMapSettings();
    this.shared.async(this._api.getModel('map', {
      'model': model_id,
      'map': map_id,
    }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
      this._mapOptions.setMap(response.data);
    }, () => {
      this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected map.');
    }), 'setMap');
  }

  private updateAllMaps(FVAonly: boolean = false) {
    const ids = this._mapOptions.getMapObjectsIds();
    ids.forEach((id) => {
      let selectedItem = this._mapOptions.getDataObject(id).selected;
      if (!FVAonly || (FVAonly && (selectedItem.method.id === 'fva' || selectedItem.method.id === 'pfba-fva'))) {
        this._loadMap(this._mapOptions.getDataObject(id).type,
          selectedItem,
          id);
      }
    });
  }

  private updateFVAMaps() {
    this.updateAllMaps(true);
  }

  private _drawAddedReactions(addedReactions) {
    if (this._builder) {
      this._builder.set_added_reactions(addedReactions.map((reaction) => reaction.bigg_id));
    }
  }

  private _loadMap(type: ObjectType, selectedItem: types.SelectedItems, id: number): void {
    const settings = this._mapOptions.getMapSettings();
    if (type === ObjectType.Experiment) {
      const sampleIds = selectedItem.sample ? selectedItem.sample.id.slice() : null;
      const phaseId = selectedItem.phase ? selectedItem.phase.id : null;

      if (sampleIds === null || phaseId === null) return;

      const modelPromise = this._api.post('data-adjusted/model', {
        sampleIds,
        phaseId,
        method: selectedItem.method.id,
        map: settings.map_id,
        withFluxes: true,
        modelId: settings.model_id,
      });

      const infoPromise = this._api.post('samples/info', {
        sampleIds,
        phaseId,
      });

      this.resetKnockouts = true;
      this.shared.async(this._q.all([modelPromise, infoPromise])
        .then(([modelResponse, infoResponse]: any) => {
          const phase = modelResponse.data.response[phaseId.toString()];
          // TODO use mapOptions.loadData
          this._mapOptions.setDataModel(phase.model, phase.modelId, id);
          this._mapOptions.setReactionData(phase.fluxes, id);
          this._mapOptions.setMapInfo(infoResponse.data.response[phaseId.toString()], id);
          this._mapOptions.setMethod(selectedItem.method);
          this._mapOptions.setCurrentGrowthRate(parseFloat(phase['growthRate']), id);
          this._loaded();
        }, (error) => {
          this.toastService.showErrorToast('Oops! Sorry, there was a problem with fetching the data.');
        }), 'Experiment');
    } else if (type === ObjectType.Reference) {
      if (!settings.model_id) return;
      const addedReactions = this._mapOptions.getAddedReactions();
      const url = `models/${settings.model_id}`;
      const modelPromise = this._api.postModel(url, {
        message: {
          'to-return': ['fluxes', 'model', 'growth-rate'],
          'simulation-method': this._mapOptions.getDataObject(id).selected.method.id,
          'map': settings.map_id,
          'reactions-knockout': this._mapOptions.getRemovedReactions(),
          'reactions-add': addedReactions.map((r) => ({
            id: r.bigg_id,
            metabolites: r.metabolites,
          })),
        },
      });
      this.shared.async(modelPromise.then(({ data }: any) => {
        // TODO use mapOptions.loadData
        this._mapOptions.setDataModel(data.model, data.model.id, id);
        this._mapOptions.setReactionData(data.fluxes, id);
        this._mapOptions.setCurrentGrowthRate(parseFloat(data['growth-rate']), id);
        this._loaded();
      }), 'Reference');
      this._api.getWildTypeInfo(settings.model_id).then(({ data: mapInfo }: any) => {
        this._mapOptions.setMapInfo(mapInfo, id);
      });
    }
  }

  /**
   * Callback function for clicked action button in context menu
   */
  public processActionClick(action, data) {
    if (action.type === 'reaction:link') {
      this.$window.open(`http://bigg.ucsd.edu/universal/reactions/${data.bigg_id}`);
    } else {
      this.shared.async(this._mapOptions.actionHandler(action, { id: data.bigg_id }).then((response) => {
        this._mapOptions.updateMapData(response, this._mapOptions.getSelectedId());
        if (action.type.startsWith('reaction:objective')) {
          this._mapOptions.setObjectiveReaction(action.type.endsWith('undo') ? null : data.bigg_id);
        } else if (data.bigg_id === this._mapOptions.getObjectiveReaction()) {
          this._mapOptions.setObjectiveReaction(null);
        }
        this._getContext();
      }, (error) => {
        this.toastService.showErrorToast('Oops! Sorry, there was a problem.');
      }), 'Objective');
    }
  }

  /**
   * Initializes map
   */
  private _initMap(): void {
    // Default map settings
    const settings = {
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
      tooltip_component: Tooltip,
      reaction_scale: [
        { type: 'min', color: '#A841D0', size: 20 },
        { type: 'Q1', color: '#868BB2', size: 20 },
        { type: 'Q3', color: '#6DBFB0', size: 20 },
        { type: 'max', color: '#54B151', size: 20 },
      ],
      reaction_no_data_color: '#CBCBCB',
      reaction_no_data_size: 10,
      reaction_knockout: this._mapOptions.getRemovedReactions(),
      enable_editing: false,
    };
    this._builder = escher.Builder(this._mapOptions.getMap(), null, null, this._mapElement, settings);
  }

  /**
   * Loads model to the map
   */
  private _loadModel(): void {
    const sharedPathway = this._mapOptions.getSharedPathway();
    if (!this.pathwayAdded && sharedPathway) {
      // Adds the model as well
      this.addPathway(sharedPathway, this._mapOptions.getDataModel());
      this.pathwayAdded = true;
    } else {
      d3.selectAll('#reactions > .reaction').style('filter', null);
      const model = this._mapOptions.getDataModel();
      this._builder.load_model(model);
      if (model.notes.changes) {
        const reactionsToHighlight = model.notes.changes
        .measured.reactions.map((reaction) => reaction.id);
        reactionsToHighlight.forEach((reactionId) => {
          this._builder.map.bigg_index
            .getAll(reactionId)
            .forEach(({ reaction_id }) => {
              d3.select(`#r${reaction_id}`)
                .style("filter", "url(#escher-glow-filter)");
            });
        });
      }
    }
  }

  // @matyasfodor Note: Do not use data -> vague definition.
  // IIUC data here means flux.
  /**
   * Loads data to the map
   * TODO: handle metabolite and gene data
   */
  private _loadData(): void {
    let reactionData = this._mapOptions.getReactionData();
    this._removeOpacity();

    // Handle FVA method response
    let selected = this._mapOptions.getCurrentSelectedItems();
    if (selected.method.id === 'fva' || selected.method.id === 'pfba-fva') {
      const fvaData = utils._pickBy(reactionData, (d) => Math.abs((d.upper_bound + d.lower_bound) / 2) > 1e-7);
      reactionData = utils._mapValues(fvaData, (d) => (d.upper_bound + d.lower_bound) / 2);
      this._builder.set_reaction_data(reactionData);
      this._builder.set_reaction_fva_data(fvaData);

    } else {
      // Remove zero values
      reactionData = utils._pickBy(reactionData, (value: number) => Math.abs(value) > 1e-7);
      this._builder.set_reaction_data(reactionData);
    }
    this._loadContextMenu();
  }

  /**
   * Loads context menu with _getContext method when you over a reaction.
   */
  private _loadContextMenu(): void {
    const contextMenu = d3.select('.map-context-menu');
    const tooltipContainer = d3.select('div#tooltip-container');
    d3.selectAll('text.reaction-label').on('mouseenter', (d) => {
      if (tooltipContainer.select('#knockoutbutton')) {
        this._getContext();
        tooltipContainer.select('#knockoutbutton').on('click', () => {
          this.processActionClick(this.contextActions[0], this.contextElement);
        });
        tooltipContainer.select('#objectivebutton').on('click', () => {
          this.processActionClick(this.contextActions[1], this.contextElement);
        });
      }
    });
  }

 /**
  * Get context menu and fetches list of actions for selected map element
  */
  private _getContext(): void {
    const tooltipContainer = d3.select('div#tooltip-container');
    const {biggId, ...restData} = JSON.parse(d3.select('div#tooltip-container').select('#knockoutbutton').attr("data"));
    this.contextElement = Object.assign({bigg_id: biggId}, ...restData);
    this.contextActions = this.actions.getList({
      type: 'map:reaction',
      shared: this._mapOptions.getMapData(),
      element: this.contextElement,
    });
    tooltipContainer.select('#knockoutbutton').text(this.contextActions[0].label);
    tooltipContainer.select('#objectivebutton').text(this.contextActions[1].label);
  }

  public showLegend(): boolean {
    return !!this._mapOptions.getReactionData();
  }
}

export const mapComponent = {
  controller: MapComponentCtrl,
  controllerAs: 'ctrl',
  template: template.toString(),
};
