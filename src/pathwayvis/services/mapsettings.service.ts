import { APIService } from "./api";
import * as Rx from 'rxjs/Rx';
import * as types from '../types';

type mapsByModel = Map<string, string[]>;

export class MapSettings {
  private apiService: APIService;
  private setModelIdSubject: Rx.Subject<string> = new Rx.Subject();
  private setMapIdSubject: Rx.Subject<string> = new Rx.Subject();
  private mapsByModel: Rx.Observable<mapsByModel>;

  public mapSettings: Rx.Observable<types.MapSettings>;
  public maps: Rx.Observable<string[]>;

  constructor(api: APIService) {
    this.apiService = api;

    this.mapsByModel = Rx.Observable
      .fromPromise(this.apiService.getModel('maps', {}))
      .map((response: angular.IHttpPromiseCallbackArg<any>) => response.data);

    const setModelId = this.setModelIdSubject
      .map((modelId) => (mapSettings: types.MapSettings, maps: mapsByModel) => {
        let map_id = mapSettings.map_id;
        if (!maps[modelId].includes(map_id)) {
          map_id = maps[modelId][0];
        }

        return this._loadMap(mapSettings, map_id, modelId);
      });

    const setMapId = this.setMapIdSubject
      .map((mapId) => (mapSettings: types.MapSettings, maps: mapsByModel) =>
        this._loadMap(mapSettings, mapId, mapSettings.model_id),
    );

    this.mapSettings = Rx.Observable.combineLatest(
      Rx.Observable.merge(setModelId, setMapId),
      this.mapsByModel,
      (func, maps) => ({func, maps}),
    )
      .scan((accumulatedObservables, {func, maps}) =>
          accumulatedObservables.flatMap((accumulatedSettings) =>
          func(accumulatedSettings, maps)), Rx.Observable.of({
        map_id: 'Central metabolism',
        model_id: null,
        map: (<types.MetabolicMap> {}),
      }))
      .flatMap((a) => a);

    this.maps = Rx.Observable.combineLatest(
      this.mapSettings,
      this.mapsByModel,
      (mapSettings, maps) => maps[mapSettings.model_id],
    );
  }

  private _loadMap(mapSettings: types.MapSettings, map_id: string, model_id: string) {
    return Rx.Observable.fromPromise(this.apiService.getModel('map', {
      'model': model_id,
      'map': map_id,
    }))
      .map((response: angular.IHttpPromiseCallbackArg<Object>) => ({
        ...mapSettings,
        map: {
          ...mapSettings.map,
          map: response.data,
        },
        model_id: model_id,
        map_id,
      }));
  }

  public setModelId(modelId: string): void {
    console.log('setModelId', modelId);
    this.setModelIdSubject.next(modelId);
  }

  public setMapId(mapId: string): void {
    console.log('setMapId', mapId);
    this.setMapIdSubject.next(mapId);
  }
}
