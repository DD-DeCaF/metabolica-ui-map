import {APIService} from "./api";
/**
 * Created by dandann on 20/04/2017.
 */

export class MapService {
    private apiService : APIService;
    private allMaps: {};

    constructor(api: APIService){
        this.apiService = api;

        this.apiService.getModel('maps', {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
            this.allMaps = response.data;
        });
    }

    public getAllMaps(): {}{
        return this.allMaps;
    }

    public usableMap(map, model): boolean{
        let maps = this.allMaps[model];
        return (maps.indexOf(map) !== -1);
    }

    public getMapsFromModel(model): string[] {
        return this.allMaps[model];
    }

    public getDefaultMap(model): string{
        let defaultMap = 'Central metabolism';
        if(this.allMaps){
            if (this.allMaps[model].includes(defaultMap)){
                return defaultMap
            }
            return this.allMaps[model][0];
        }
        return null;
    }
}
