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


export class APIService {
  private _http: angular.IHttpService;
  private api: DecafAPIProvider;
  private model: ModelAPIProvider;

  constructor($http: angular.IHttpService, decafAPI: DecafAPIProvider, modelAPI: ModelAPIProvider) {
    this._http = $http;
    this.api = decafAPI;
    this.model = modelAPI;
  }

  public get(path: string, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('GET', path, undefined, parameters, this.api);
  }

  public post(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('POST', path, data, parameters, this.api);
  }

  public getModel(path: string, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('GET', path, undefined, parameters, this.model);
  }

  public getWildTypeInfo(modelId: string, parameters: Object = {}): angular.IHttpPromise<Object> {
    return this._request('GET', `v1/model-info/${modelId}`, undefined, parameters, this.model);
  }

  public postModel(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('POST', path, data, parameters, this.model);
  }

  private _request(method: string, path: string, data: Object, params: Object, api): angular.IHttpPromise<any> {
    return this._http({
      method: method,
      data: data,
      url: `${api}/${path}`,
      params: params,
    });
  }

}
