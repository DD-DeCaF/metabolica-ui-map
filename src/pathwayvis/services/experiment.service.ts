/**
 * Created by dandann on 29/06/2017.
 */
/**
 * Created by dandann on 07/06/2017.
 */
import {Experiment} from "../types"
import {APIService} from "./api";

export class ExperimentService{
    api: APIService;

    private experiments: Experiment[];

    constructor(api: APIService){
        this.api = api;
        this.api.get('experiments').then((response: angular.IHttpPromiseCallbackArg<Experiment[]>) => {
            this.experiments = response.data['response'];
        });
    }

    public getExperiments(): Experiment[]{
        return this.experiments;
    }

    public getExperiment(id: number): Experiment{
        let result = null;
        if(this.experiments){
            this.experiments.some((item: Experiment) =>{
                if(id == item.id){
                    result = item;
                    return true
                }
            });
        }
        return result;
    }

    public getExperimentName(id: number): string{
        let result = "_";
        if(this.experiments){
            this.experiments.some((item: Experiment) =>{
                if(id == item.id){
                    result = item.name;
                    return true
                }
            });
        }
        return result;
    }

    public setExperiments(speciesCode: string) {
        this.api.get('experiments/' + speciesCode)
            .then((response: angular.IHttpPromiseCallbackArg<Experiment[]>) => {
                this.experiments = response.data['response'];
            })
    }
}
