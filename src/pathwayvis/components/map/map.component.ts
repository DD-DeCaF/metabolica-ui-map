import * as escher from '@dd-decaf/escher';
import * as d3 from 'd3';
import {event as currentEvent} from 'd3';
import * as _ from 'lodash';

import { APIService } from '../../services/api';
import { WSService } from '../../services/ws';
import { ActionsService } from '../../services/actions/actions.service';
import { SharedService } from '../../services/shared.service';

import * as types from '../../types';

import './views/map.component.scss';
import * as template from './views/map.component.html';
import { ToastService } from "../../services/toastservice";
import { MapOptionService } from "../../services/mapoption.service";
import { ObjectType } from "../../types";

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
  private _ws: WSService;
  private $scope: angular.IScope;
  private toastService: ToastService;
  private _q: any;
  private $window: angular.IWindowService;

  constructor($scope: angular.IScope,
    api: APIService,
    actions: ActionsService,
    ws: WSService,
    toastService: ToastService,
    $q: angular.IQService,
    mapOptions: MapOptionService,
    $window: angular.IWindowService,
    shared: SharedService,
  ) {
    this.$window = $window;
    this._api = api;
    this._ws = ws;
    this._mapElement = d3.select('.map-container');
    this.toastService = toastService;
    this._q = $q;
    this._mapOptions = mapOptions;
    this.shared = shared;
    this.actions = actions;
    this.$scope = $scope;

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
          this._drawAddedReactions();
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

    $scope.$watch('ctrl._mapOptions.getAddedReactions()', () => {
      this._drawAddedReactions();
    }, true);

    $scope.$watch('ctrl._mapOptions.getReactionData()', () => {
      let reactionData = this._mapOptions.getReactionData();
      let model = this._mapOptions.getDataModelId();
      if (this._builder) {
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
      ws.close(this._mapOptions.getDataModelId());
    });
  }

  private _removeOpacity() {
    const noOpacity = {};
    let reactions = this._builder.map.cobra_model.reactions;
    Object.keys(reactions).forEach((key) => {
      noOpacity[key] = { 'lower_bound': 0, 'upper_bound': 0 };
    });
    this._builder.set_reaction_fva_data(noOpacity);
  }

  private mapChanged(): void {
    let mapObject = this._mapOptions.getDataObject();
    if (mapObject.isComplete()) {
      this._removeOpacity();
      this._builder.load_model(this._mapOptions.getDataModel());
      this._builder.set_knockout_reactions(this._mapOptions.getRemovedReactions());
      this._loadContextMenu();
      // Reset zoom - if the zoom is set to a reaction,
      // it might not be included in the other map
      this._builder.map.zoom_extent_canvas();
    }
  }

  private _setMap(map: string): void {
    if (!map) return;
    this.shared.increment();
    const {model_id, map_id} = this._mapOptions.getMapSettings();
    this._api.getModel('map', {
      'model': model_id,
      'map': map_id,
    }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
      this._mapOptions.setMap(response.data);
    }, () => {
      this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected map.');
    })
    .then(() => { this.shared.decrement(); });
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

  private _drawAddedReactions() {
    const addedReactions = this._mapOptions.getAddedReactions();
    const newlyAddedReactionEscherIds = [];
    if (this._builder && addedReactions) {
      // Check if reaction is already drawn on the map
      addedReactions.filter((r) => {
        return Object.values(this._builder.map.reactions)
          .map((escherReaction) => escherReaction.bigg_id)
          .indexOf(r.bigg_id) === -1;
      })
        .forEach((reaction) => {
          // We store the metabolite bigg ids suffixed with compartment ids
          // Cofactors are stored without the compartment id
          // So if the metabolite looks like with 'h2o_(...)'
          // Then it is a cofactor 'h2o'
          const criteria = (m) => {
            return !this._builder.options.cofactors.some((c) => {
              return m.startsWith(`${c}_`);
            });
          };
          // parition algorithm
          const [metabolites, cofactors] = Object.entries(reaction.metabolites).reduce(
            ([_mets, _cofs], [m]) => {
              (criteria(m) ? _mets : _cofs).push(m);
              return [_mets, _cofs];
            },
            [[], []],
          );
          const nodes = Object.values(this._builder.map.nodes).filter((n) => {
            return metabolites.findIndex((id) => n.bigg_id === id) > -1;
          });
          const [node] = nodes;
          let escherProps;
          if (node) {
            escherProps = this._builder.map.new_reaction_for_metabolite(
              reaction.bigg_id,
              node.node_id,
              90);
          } else {
            escherProps = this._builder.map.new_reaction_from_scratch(
              reaction.bigg_id,
              // just came up with this
              { x: 50, y: 200 },
              90);
          }
          newlyAddedReactionEscherIds.push(escherProps.id);
        });
      const lastNewReactionId = newlyAddedReactionEscherIds.pop();
      if (lastNewReactionId) {
        this._builder.map.zoom_to_reaction(lastNewReactionId);
      }
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
      this.shared.increment();
      this._q.all([modelPromise, infoPromise]).then(([modelResponse, infoResponse]: any) => {
        const phase = modelResponse.data.response[phaseId.toString()];
        this._mapOptions.setDataModel(phase.model, phase.modelId, id);
        this._mapOptions.setReactionData(phase.fluxes, id);
        this._mapOptions.setMapInfo(infoResponse.data.response[phaseId.toString()], id);
        this._mapOptions.setMethod(selectedItem.method);

      }, (error) => {
        this.toastService.showErrorToast('Oops! Sorry, there was a problem with fetching the data.');
      })
      .then(() => {
        this.shared.decrement();
      });
    } else if (type === ObjectType.Reference) {
      if (!settings.model_id) return;
      const addedReactions = this._mapOptions.getAddedReactions();
      const url = `models/${settings.model_id}`;
      const modelPromise = this._api.postModel(url, {
        message: {
          'to-return': ['fluxes', 'model'],
          'simulation-method': this._mapOptions.getDataObject(id).selected.method.id,
          'map': settings.map_id,
          'reactions-knockout': this._mapOptions.getRemovedReactions(),
          'reactions-add': addedReactions.map((r) => ({
            id: r.bigg_id,
            metabolites: r.metabolites,
          })),
        },
      });
      this.shared.increment();
      modelPromise.then(({data}: any) => {
        this._mapOptions.setDataModel(data.model, data.model.id, id);
        this._mapOptions.setReactionData(data.fluxes, id);

        this.shared.decrement();
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
      this._mapOptions.actionHandler(action, { id: data.bigg_id }).then((response) => {
        this._mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
        this._mapOptions.setReactionData(response.fluxes);
        this._mapOptions.setRemovedReactions(response['removed-reactions']);
        this.$scope.$apply();
      });
    }
  }

  /**
   * Initializes map
   */
  private _initMap(): void {
    // Default map settings
    const settings = {
      menu: 'all',
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
        { type: 'max', color: '#54B151', size: 20 },
      ],
      reaction_no_data_color: '#CBCBCB',
      reaction_no_data_size: 10,
      reaction_knockout: this._mapOptions.getRemovedReactions(),
    };
    this._builder = escher.Builder(this._mapOptions.getMap(), null, null, this._mapElement, settings);
  }

  /**
   * Loads model to the map
   */
  private _loadModel(): void {
    let model = this._mapOptions.getDataModel();
    // Load model data
    this._builder.load_model(model);

    // Empty previously removed reactions
    if (this.resetKnockouts) this._mapOptions.setRemovedReactions([]);
    this.resetKnockouts = false;
    // Check removed and added reactions and genes from model
    const changes = model.notes.changes;

    if (changes) {
      // @matyasfodor why only when there are no removed reactions?
      if (this._mapOptions.getRemovedReactions().length === 0) {
        // this.shared.removedReactions
        let reactions = changes.removed.reactions.map((reaction: types.Reaction) => {
          return reaction.id;
        });
        this._mapOptions.setRemovedReactions(reactions);
      }

      if (changes.added.reactions) {
        // TODO filter out adapter and DM reactions
        const reactions = changes.added.reactions.filter((reaction) => {
          return !['adapter', 'DM', 'EX_'].some((str) => {
            return reaction.id.startsWith(str);
          });
        })
        .map((reaction) => {
          return Object.assign({}, reaction, {
            bigg_id: reaction.id,
            metabolites: reaction.metabolites,
          });
        });
        this._mapOptions.setAddedReactions(reactions);
      }
    }

    // Open WS connection for model if it is not opened
    if (!this._ws.isActive(model.uid)) {
      this._ws.connect(model.uid, true);
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

      // const fvaData = reactionData;
      const fvaData = _.pickBy(reactionData, (d) => Math.abs((d.upper_bound + d.lower_bound) / 2) > 1e-7);

      reactionData = _.mapValues(fvaData, (d) => (d.upper_bound + d.lower_bound) / 2);

      this._builder.set_reaction_data(reactionData);
      this._builder.set_reaction_fva_data(fvaData);

    } else {
      // Remove zero values
      reactionData = _.pickBy(reactionData, (value: number) => Math.abs(value) > 1e-7);
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

    d3.selectAll('.reaction, .reaction-label')
      .style('cursor', 'pointer')
      .on('contextmenu', (d) => {
        this.contextElement = d;
        this.contextActions = this.actions.getList({
          type: 'map:reaction',
          shared: this._mapOptions.getMapData(),
          element: this.contextElement,
        });

        if (this.contextElement) {
          this._renderContextMenu(contextMenu);
          (<MouseEvent> currentEvent).preventDefault();
        }
      });

    d3.select(document).on('click', () => {
      contextMenu.style('visibility', 'hidden');
    });
  }

    /**
     * Renders and positions context menu based on selected element
     */
    private _renderContextMenu(contextMenu): void {
        contextMenu.style('position', 'absolute')
            .style('left', `${(<MouseEvent> currentEvent).clientX}px`)
            .style('top', `${(<MouseEvent> currentEvent).clientY}px`)
            .style('visibility', 'visible');
        this.$scope.$apply();
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
