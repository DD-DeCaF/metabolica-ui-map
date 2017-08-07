import { APIService } from "./api";


export class MapService {
  private apiService: APIService;
  private allMaps: {};

  constructor(api: APIService) {
    this.apiService = api;

    this.apiService.getModel('maps', {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
      this.allMaps = response.data;
    });
  }

  // @matyasfodor No point in setting this vairable private
  public getAllMaps(): {} {
    return this.allMaps;
  }

  public usableMap(mapName: string, modelId: string): boolean {
    const maps = this.allMaps[modelId];
    return maps.indexOf(mapName) !== -1;
  }

  public getMapsFromModel(model): string[] {
    return this.allMaps[model];
  }

  public getDefaultMap(model): string {
    let defaultMap = 'Central metabolism';
    if (this.allMaps) {
      if (this.allMaps[model].includes(defaultMap)) {
        return defaultMap;
      }
      return this.allMaps[model][0];
    }
    return null;
  }
}
