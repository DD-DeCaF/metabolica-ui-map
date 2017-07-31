import * as _ from 'lodash';
import { DecafAPIProvider } from '../providers/decafapi.provider';
import { ModelAPIProvider } from '../providers/modelapi.provider';

interface RequestDetails {
  path: string;
  params: Object;
}

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

  public postModel(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('POST', path, data, parameters, this.model);
  }

  public put(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('PUT', path, data, parameters, this.api);
  }

  public patch(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('PATCH', path, data, parameters, this.api);
  }

  public delete(path: string, data: Object, parameters: Object = {}): angular.IPromise<Object> {
    return this._request('DELETE', path, data, parameters, this.api);
  }

  private _request(method: string, path: string, data: Object, params: Object, api): angular.IHttpPromise<any> {

    const reqDetails = this._handleParams(path, params);

    return this._http({
      method: method,
      data: data,
      url: api + '/' + reqDetails.path,
      params: reqDetails.params,
    });
  }

  private _parseUrlParams(path: string): string[] {
    return _.compact(_.map(path.split(/\W/), (param) => {
      if (!(new RegExp('^\\d+$').test(param)) && param && (new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(path))) {
        return param;
      }
    }));
  }

  private _handleParams(path: string, params: Object): RequestDetails {
    const urlParamKeys = _.intersection(_.keys(params), this._parseUrlParams(path));

    _.each(urlParamKeys, (key) => {
      path = path.replace(':' + key, params[key]);
      delete params[key];
    });

    return {
      path: path,
      params: params,
    };
  }
}

