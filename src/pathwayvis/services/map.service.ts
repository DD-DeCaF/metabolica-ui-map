import {APIService} from "./api";
/**
 * Created by dandann on 20/04/2017.
 */

export class MapService {
    private apiService : APIService;
    private allMaps: string[];

    constructor(api: APIService){
        this.apiService = api;

        this.apiService.request_model('maps', {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
            this.allMaps = response.data;
        });
    }

    public getAllMaps(): string[]{
        return this.allMaps;
    }

    public usableMap(map, model): boolean{
        let maps = this.allMaps[model];
        return (maps.indexOf(map) !== -1);
    }

    public getMapsFromModel(model): string {
        return this.allMaps[model];
    }
}
