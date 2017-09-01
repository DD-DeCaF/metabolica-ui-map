import { Experiment, CallbackEmbeddedResponse } from "../types";
import { APIService } from "./api";

export class ExperimentService {
  private api: APIService;

  public experiments: Experiment[];

  constructor(api: APIService) {
    this.api = api;
    this.setExperiments();
  }

  public setExperiments(speciesCode: string = null) {
    const url = speciesCode ? `experiments/${speciesCode}` : 'experiments';
    return this.api.get(url)
      .then((response: CallbackEmbeddedResponse<Experiment[]>) => {
        this.experiments = response.data.response;
      });
  }
}
