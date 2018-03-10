import * as escher from '@dd-decaf/escher';
import * as d3 from 'd3';
import {event as currentEvent} from 'd3';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

import { APIService } from '../../services/api';
import { WSService } from '../../services/ws';
import { ActionsService } from '../../services/actions/actions.service';
import { SharedService } from '../../services/shared.service';
import { MapSettings } from "../../services/mapsettings.service";

import * as types from '../../types';

import './views/map.component.scss';
import * as template from './views/map.component.html';
import { ToastService } from "../../services/toastservice";
import { MapOptionService } from "../../services/mapoption.service";
import { ObjectType } from "../../types";
import * as utils from "../../utils";

const escherSettings = {
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
    { type: 'max', color: '#54B151', size: 20 },
  ],
  reaction_no_data_color: '#CBCBCB',
  reaction_no_data_size: 10,
  enable_editing: false,
};
class MapComponentCtrl {
  public shared: SharedService;
  public actions: ActionsService;
  public contextActions: types.Action[];
  public contextElement: Object;

  private resetKnockouts: boolean;
  private _mapOptions: MapOptionService;
  private mapSettingsService: MapSettings;
  private _mapElement: d3.Selection<any>;
  // private _builder: types.Builder;
  private builder: Rx.Observable<types.Builder>;
  private _api: APIService;
  private _ws: WSService;
  private $scope: angular.IScope;
  private toastService: ToastService;
  private _q: any;
  private $window: angular.IWindowService;
  private pathwayAdded = false;

  constructor($scope: angular.IScope,
    api: APIService,
    actions: ActionsService,
    ws: WSService,
    toastService: ToastService,
    $q: angular.IQService,
    mapOptions: MapOptionService,
    mapSettingsService: MapSettings,
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
    this.mapSettingsService = mapSettingsService;
    this.shared = shared;
    this.actions = actions;
    this.$scope = $scope;

    // Create the builder with the first emmitted data
    // This could be used to create the builder stream later.
    this.builder = this.mapSettingsService.mapSettings
      .take(1)
      .map((mapSettings) => {
        const escherSettingsWithCallbacks = {
          ...escherSettings,
          reaction_knockout: this._mapOptions.getRemovedReactions(),
        };
        return <types.Builder> escher.Builder(
          mapSettings.map.map,
          null,
          null,
          this._mapElement,
          escherSettingsWithCallbacks,
        );
      });

    // The other updates are handled here.
    Rx.Observable.combineLatest(
      this.mapSettingsService.mapSettings.skip(1),
      this.builder,
      (mapSettings, builder) => ({mapSettings, builder}),
    ).subscribe(({mapSettings, builder}) => {
      // should_update_data set to true just in case.
      builder.load_map(mapSettings.map.map, true);
    });

    // TODO @matyasfodor watch expressions consume too much memory
    // see https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
    // TODO @matyasfodor this call sets the map even if a completely different setting is changed.
    // which causes loading the map 3 times in some cases.
    // Disabled. Only left here for rewriting this bit
    // $scope.$watch('ctrl._mapOptions.getMapSettings()', (settings: types.MapSettings) => {
    //   if (settings.model_id && settings.map_id) {
    //     if (this._mapOptions.shouldUpdateData) {
    //       this.updateAllMaps();
    //       this._mapOptions.dataUpdated();
    //     } else {
    //       this.updateFVAMaps();
    //     }
    //     // this._setMap(this._mapOptions.getSelectedMap());

    //     if (this._builder) {
    //       this._builder.set_knockout_reactions(this._mapOptions.getRemovedReactions());
    //       this._drawAddedReactions(this._mapOptions.getAddedReactions());
    //     }
    //   }
    // }, true);

    // Map watcher
    // Disabled
    $scope.$watch('ctrl._mapOptions.getMapId()', (mapId) => {
      if (this._mapOptions.getReactionData()) {
        this._loadModel();
        this._loadData();
      }
      // if (this._builder) {
      //   this._builder.set_knockout_reactions(this._mapOptions.getRemovedReactions());
      // }
    }, true);

    $scope.$watch('ctrl._mapOptions.getDataModelId()', (modelId) => {
      if (modelId) {
        this._loadModel();
      }
    });

    $scope.$watch('ctrl._mapOptions.getSelectedId()', () => {
      this.mapChanged();
    });

    // $scope.$watch('ctrl._mapOptions.getRemovedReactions()', () => {
    //   let removedReactions = this._mapOptions.getRemovedReactions();
    //   if (this._builder && removedReactions) {
    //     this._builder.set_knockout_reactions(removedReactions);
    //   }
    // }, true);

    this._mapOptions.addedReactionsObservable.subscribe((reactions) => {
      this._drawAddedReactions(reactions);
    });

    $scope.$watch('ctrl._mapOptions.getDataModel().uid', (modelUid: string) => {
      if (!modelUid) return;
      // Open WS connection for model if it is not opened
      if (!this._ws.isActive(modelUid)) {
        this._ws.connect(modelUid, true);
      }
    });

    $scope.$watch('ctrl._mapOptions.getDataModel().notes.changes', (changes: any) => {
      if (!changes) {
        return;
      }
      this._loadModel();
      // Empty previously removed reactions
      if (this.resetKnockouts) this._mapOptions.setRemovedReactions([]);
      this.resetKnockouts = false;
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
    });

    // Listend to changes in added/removed reactions
    // Should communicate thorugh an Observable.

    // $scope.$watch('ctrl._mapOptions.getReactionData()', () => {
    //   let reactionData = this._mapOptions.getReactionData();
    //   let model = this._mapOptions.getDataModelId();
    //   if (this._builder) {
    //     if (model) {
    //       this._loadModel();
    //     }
    //     if (reactionData) {
    //       this._loadData();
    //     } else {
    //       const type = this._mapOptions.getType();
    //       if (type === ObjectType.WildType) {
    //         this._loadMap(type, this._mapOptions.getDataObject().selected, this._mapOptions.getSelectedId());
    //         reactionData = this._mapOptions.getReactionData();
    //       }
    //       this._removeOpacity();

    //       this._builder.set_reaction_data(reactionData);
    //     }
    //   }
    // }, true);

    // Detects any changes on the side panel. Should be handled in a different place
    // $scope.$watch('ctrl._mapOptions.getCurrentSelectedItems()', (selected: types.SelectedItems) => {
    //   let type = this._mapOptions.getDataObject().type;
    //   if (this._mapOptions.shouldLoadMap) {
    //     if ((selected.method !== null) &&
    //       (selected.phase !== null) &&
    //       (selected.sample !== null) &&
    //       (selected.experiment !== null)) {
    //       this._loadMap(type, selected, this._mapOptions.selectedCardId);
    //     }
    //   }
    // }, true);

    $scope.$on('$destroy', () => {
      ws.close(this._mapOptions.getDataModelId());
    });
  }

  private _removeOpacity() {
    // TODO figure out typings
    // const noOpacity = (<Map<string, types.FvaData>> {});
    // const reactions = this._builder.map.cobra_model.reactions;
    // Object.keys(reactions).forEach((key) => {
    //   noOpacity[key] = { 'lower_bound': 0, 'upper_bound': 0 };
    // });
    // this._builder.set_reaction_fva_data(noOpacity);
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
    // this._builder.load_model(this._mapOptions.getMapData().model);

    // const reactions = item.model.reactions.map(({id, metabolites}) => ({id, metabolites}));
    // this._builder.add_pathway(reactions);
  }

  private mapChanged(): void {
    let mapObject = this._mapOptions.getDataObject();
    if (mapObject.isComplete()) {
      this._removeOpacity();
      this._loadModel();
      // this._builder.set_knockout_reactions(this._mapOptions.getRemovedReactions());
      this._loadContextMenu();
    }
  }

  private _setMap(map: string): void {
    // if (!map) return;
    // const {model_id, map_id} = this._mapOptions.getMapSettings();
    // this.shared.async(this._api.getModel('map', {
    //   'model': model_id,
    //   'map': map_id,
    // }).then((response: angular.IHttpPromiseCallbackArg<types.Phase[]>) => {
    //   this._mapOptions.setMap(response.data);
    // }, () => {
    //   this.toastService.showErrorToast('Oops! Sorry, there was a problem loading selected map.');
    // }), 'setMap');
  }

  private updateAllMaps(FVAonly: boolean = false, mapSettings: types.MapSettings) {
    const ids = this._mapOptions.getMapObjectsIds();
    ids.forEach((id) => {
      let selectedItem = this._mapOptions.getDataObject(id).selected;
      if (!FVAonly || (FVAonly && (selectedItem.method.id === 'fva' || selectedItem.method.id === 'pfba-fva'))) {
        this._loadMap(this._mapOptions.getDataObject(id).type,
          selectedItem,
          mapSettings,
          id);
      }
    });
  }

  private updateFVAMaps(mapSettings: types.MapSettings) {
    this.updateAllMaps(true, mapSettings);
  }

  private _drawAddedReactions(addedReactions) {
    // if (this._builder) {
    //   this._builder.set_added_reactions(addedReactions.map((reaction) => reaction.bigg_id));
    // }
  }

  // This one should be moved to mapOption service.
  private _loadMap(type: ObjectType, selectedItem: types.SelectedItems, mapSettings: types.MapSettings, id: number): void {
    if (type === ObjectType.Experiment) {
      const sampleIds = selectedItem.sample ? selectedItem.sample.id.slice() : null;
      const phaseId = selectedItem.phase ? selectedItem.phase.id : null;

      if (sampleIds === null || phaseId === null) return;

      const modelPromise = this._api.post('data-adjusted/model', {
        sampleIds,
        phaseId,
        method: selectedItem.method.id,
        map: mapSettings.map_id,
        withFluxes: true,
        modelId: mapSettings.model_id,
      });

      const infoPromise = this._api.post('samples/info', {
        sampleIds,
        phaseId,
      });

      this.resetKnockouts = true;
      this.shared.async(this._q.all([modelPromise, infoPromise])
        .then(([modelResponse, infoResponse]: any) => {
          const phase = modelResponse.data.response[phaseId.toString()];
          this._mapOptions.setDataModel(phase.model, phase.modelId, id);
          this._mapOptions.setReactionData(phase.fluxes, id);
          this._mapOptions.setMapInfo(infoResponse.data.response[phaseId.toString()], id);
          this._mapOptions.setMethod(selectedItem.method);
          this._mapOptions.setCurrentGrowthRate(parseFloat(phase['growthRate']));

        }, (error) => {
          this.toastService.showErrorToast('Oops! Sorry, there was a problem with fetching the data.');
        }), 'Experiment');
    } else if (type === ObjectType.WildType) {
      if (!mapSettings.model_id) return;
      const addedReactions = this._mapOptions.getAddedReactions();
      const url = `models/${mapSettings.model_id}`;
      const modelPromise = this._api.postModel(url, {
        message: {
          'to-return': ['fluxes', 'model', 'growth-rate'],
          'simulation-method': this._mapOptions.getDataObject(id).selected.method.id,
          'map': mapSettings.map_id,
          'reactions-knockout': this._mapOptions.getRemovedReactions(),
          'reactions-add': addedReactions.map((r) => ({
            id: r.bigg_id,
            metabolites: r.metabolites,
          })),
        },
      });
      this.shared.async(modelPromise.then(({data}: any) => {
        this._mapOptions.setDataModel(data.model, data.model.id, id);
        this._mapOptions.setReactionData(data.fluxes, id);
        this._mapOptions.setCurrentGrowthRate(parseFloat(data['growth-rate']));
      }), 'Reference');
      this._api.getWildTypeInfo(mapSettings.model_id).then(({data: mapInfo}: any) => {
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
      this._mapOptions.actionHandler(action, { id: data.bigg_id }).then((response) => {
        this._mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
        this._mapOptions.setReactionData(response.fluxes);
        this._mapOptions.setRemovedReactions(response['removed-reactions']);
      });
    }
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
      // this._builder.load_model(model);
      const reactionsToHighlight = model.notes.changes
        .measured.reactions.map((reaction) => reaction.id);
      reactionsToHighlight.forEach((reactionId) => {
        // this._builder.map.bigg_index
        //   .getAll(reactionId)
        //   .forEach(({reaction_id}) => {
        //     d3.select(`#r${reaction_id}`)
        //       .style("filter", "url(#escher-glow-filter)");
        //   });
      });
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
      const reactionFvaData = <Map<string, types.FvaData>> reactionData;
      // const fvaData = reactionData;
      const fvaData = <Map<string, types.FvaData>> _.pickBy<Map<string, types.FvaData>>(
        reactionFvaData,
        (d: types.FvaData) => Math.abs((d.upper_bound + d.lower_bound) / 2) > 1e-7,
      );

      reactionData = utils.mapValues<types.FvaData, number>(
        fvaData, (d) => ((d.upper_bound + d.lower_bound) / 2));

      // this._builder.set_reaction_fva_data(fvaData);

    } else {
      reactionData = <Map<string, number>> reactionData;
      // Remove zero values
      reactionData = (<Map<string, number>> _.pickBy(
        reactionData,
        (value: number) => Math.abs(value) > 1e-7)
      );
    }
    // this._builder.set_reaction_data(reactionData);
    this._loadContextMenu();
  }

  /**
   * Loads context menu and fetches list of actions for selected map element
   */
  private _loadContextMenu(): void {
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
        contextMenu.style('position', 'fixed')
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
