import { APIService } from "./api";
import * as Rx from 'rxjs/Rx';


export class MapService {
  private apiService: APIService;
  public maps: Rx.Observable<Map<string, string[]>>;

  constructor(api: APIService) {
    this.apiService = api;

    this.maps = Rx.Observable
      .fromPromise(this.apiService.getModel('maps', {}))
      .map((response: angular.IHttpPromiseCallbackArg<any>) => response.data);
  }

  public getMapsFromModel(modelObservable: Rx.Observable<string>): Rx.Observable<string[]> {
    return Rx.Observable.combineLatest(
      modelObservable,
      this.maps,
      (model, maps) => maps[model],
    );
  }
}
