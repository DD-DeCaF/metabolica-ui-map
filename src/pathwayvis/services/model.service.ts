import { APIService } from "./api";
import { applyPatch } from 'fast-json-patch';


export class ModelService {
  private _apiService: APIService;
  private _$q: angular.IQService;

  constructor(api: APIService, $q: angular.IQService) {
    this._apiService = api;
    this._$q = $q;
  }

  public get(modelId, change): angular.IPromise<Object> {
    return this._$q.all([this._apiService.getModel(modelId), this._apiService.postModel(modelId, change)])
      .then((values) => {
        const [{data: wildtypeModel}, {data: changes}] = values;
        return {
          ...changes,
          model: applyPatch(wildtypeModel, (<any> changes).model).newDocument,
        };
      });
  }
}
