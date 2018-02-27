import { APIService } from "./api";
import * as Rx from 'rxjs/Rx';
import * as types from '../types';


export class MapSettings {
  private apiService: APIService;
  private setModelIdSubject: Rx.Subject<string> = new Rx.Subject();
  private setMapIdSubject: Rx.Subject<string> = new Rx.Subject();

  public mapSettings: Rx.Observable<types.MapSettings>;

  constructor(api: APIService) {
    this.apiService = api;

    const setModelId = this.setModelIdSubject
      .map((modelId) => (mapSettings: types.MapSettings) => Rx.Observable.of({
        ...mapSettings,
        model_id: modelId,
      }));

    const setMapId = this.setMapIdSubject
      .map((mapId) => (mapSettings: types.MapSettings) => {
        // TODO add loader
        // TODO add error handling
        return Rx.Observable.fromPromise(this.apiService.getModel('map', {
          'model': mapSettings.model_id,
          'map': mapId,
        }))
          .map((response: angular.IHttpPromiseCallbackArg<Object>) => ({
            ...mapSettings,
            map: {
              ...mapSettings.map,
              map: response.data,
            },
          }));
      });

    // this.mapSettings = Rx.Observable.merge(setMap, setModelId)
    //   .scan((accumulated, transformFn) => transformFn(accumulated), {
    //     map_id: 'Central metabolism',
    //     model_id: null,
    //     map: (<types.MetabolicMap> {}),
    //   });
    this.mapSettings = Rx.Observable.merge(setModelId, setMapId)
      .scan((accumulatedObservables, transformFn) =>
          accumulatedObservables.flatMap((accumulatedSettings) =>
          transformFn(accumulatedSettings)), Rx.Observable.of({
        map_id: 'Central metabolism',
        model_id: null,
        map: (<types.MetabolicMap> {}),
      }))
      .flatMap((a) => a);
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
