// Copyright 2018 Novo Nordisk Foundation Center for Biosustainability, DTU.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { DecafAPIProvider } from '../providers/decafapi.provider';
import { ModelAPIProvider } from '../providers/modelapi.provider';
import { deterministicStringify } from "../utils";

export class APIService {
  private _http: angular.IHttpService;
  private _q: angular.IQService;
  private api: DecafAPIProvider;
  private modelAPI: ModelAPIProvider;
  private modelCache = new Map();

  constructor(
    $http: angular.IHttpService,
    decafAPI: DecafAPIProvider,
    modelAPI: ModelAPIProvider,
    $q: angular.IQService) {
      this._http = $http;
      this._q = $q;
      this.api = decafAPI;
      this.modelAPI = modelAPI;
  }

  public get(path: string, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('GET', path, undefined, parameters, this.api);
  }

  public post(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('POST', path, data, parameters, this.api);
  }

  public getModel(path: string, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('GET', `model/${path}`, undefined, parameters, this.modelAPI);
  }

  public getWildTypeInfo(modelId: string, parameters: Object = {}): angular.IHttpPromise<Object> {
    return this._request('GET', `model/v1/model-info/${modelId}`, undefined, parameters, this.modelAPI, {cache: true});
  }

  public postModel(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    const key = btoa(deterministicStringify({path, data}));
    return this.modelCache.has(key)
      ? this._q.resolve(this.modelCache.get(key))
      : this._request('POST', path, data, parameters, this.modelAPI)
        .then((response) => {
          this.modelCache.set(key, response);
          return response;
        });
  }

  private _request(
    method: string,
    path: string,
    data: Object,
    params: Object,
    api,
    settings: object = {}): angular.IHttpPromise<any> {
      return this._http({
        method,
        url: `${api}/${path}`,
        data,
        params,
        ...settings,
      });
  }

}
