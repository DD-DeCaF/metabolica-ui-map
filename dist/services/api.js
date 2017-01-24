"use strict";
var angular = require("angular");
var _ = require("lodash");
var api = angular.module('pathwayvis.services.api', []);
// API url
exports.API_ROOT_URL = 'https://api.dd-decaf.eu/';
var APIService = (function () {
    function APIService($http) {
        this._http = $http;
    }
    APIService.prototype.get = function (path, parameters) {
        if (parameters === void 0) { parameters = {}; }
        return this._request('GET', path, undefined, parameters);
    };
    APIService.prototype.post = function (path, data, parameters) {
        if (parameters === void 0) { parameters = {}; }
        return this._request('POST', path, data, parameters);
    };
    APIService.prototype.put = function (path, data, parameters) {
        if (parameters === void 0) { parameters = {}; }
        return this._request('PUT', path, data, parameters);
    };
    APIService.prototype.patch = function (path, data, parameters) {
        if (parameters === void 0) { parameters = {}; }
        return this._request('PATCH', path, data, parameters);
    };
    APIService.prototype.delete = function (path, data, parameters) {
        if (parameters === void 0) { parameters = {}; }
        return this._request('DELETE', path, data, parameters);
    };
    APIService.prototype._request = function (method, path, data, params) {
        var reqDetails = this._handleParams(path, params);
        return this._http({
            method: method,
            data: data,
            url: exports.API_ROOT_URL + reqDetails.path,
            params: reqDetails.params
        });
    };
    APIService.prototype._parseUrlParams = function (path) {
        return _.compact(_.map(path.split(/\W/), function (param) {
            if (!(new RegExp('^\\d+$').test(param)) && param && (new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(path))) {
                return param;
            }
        }));
    };
    APIService.prototype._handleParams = function (path, params) {
        var urlParamKeys = _.intersection(_.keys(params), this._parseUrlParams(path));
        _.each(urlParamKeys, function (key) {
            path = path.replace(':' + key, params[key]);
            delete params[key];
        });
        return {
            'path': path,
            'params': params
        };
    };
    return APIService;
}());
exports.APIService = APIService;
api.service('api', APIService);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = api;

//# sourceMappingURL=api.js.map
