"use strict";
var angular = require("angular");
var _ = require("lodash");
;
;
var ws = angular.module('pathwayvis.services.ws', []);
// WS url
exports.WS_ROOT_URL = 'wss://api.dd-decaf.eu/wsmodels/';
var WSService = (function () {
    function WSService($q, toastr) {
        this.reconnectInterval = 1000;
        this.timeoutInterval = 10000;
        this._forcedClose = false;
        this._timedOut = false;
        this._callbacks = [];
        this.onopen = function (event) { };
        this.onclose = function (event) { };
        this.onconnecting = function () { };
        this.onmessage = function (event) { };
        this.onerror = function (event) { };
        this._q = $q;
        this._toastr = toastr;
    }
    WSService.prototype.connect = function (reconnectAttempt, path) {
        var _this = this;
        this.readyState = WebSocket.CONNECTING;
        this._url = exports.WS_ROOT_URL + path;
        this._ws = new WebSocket(this._url);
        this.onconnecting();
        var localWs = this._ws;
        var timeout = setTimeout(function () {
            _this._timedOut = true;
            localWs.close();
            _this._timedOut = false;
        }, this.timeoutInterval);
        this._ws.onopen = function (event) {
            clearTimeout(timeout);
            _this.readyState = WebSocket.OPEN;
            reconnectAttempt = false;
            _this._processRequests();
            _this.onopen(event);
        };
        this._ws.onclose = function (event) {
            clearTimeout(timeout);
            _this._ws = null;
            if (_this._forcedClose) {
                _this.readyState = WebSocket.CLOSED;
                _this.onclose(event);
            }
            else {
                _this.readyState = WebSocket.CONNECTING;
                _this.onconnecting();
                if (!reconnectAttempt && !_this._timedOut) {
                    _this.onclose(event);
                }
                setTimeout(function () {
                    _this.connect(true, path);
                }, _this.reconnectInterval);
            }
        };
        this._ws.onmessage = function (event) {
            var result = JSON.parse(event.data);
            var requestId = result['request-id'];
            var callback = _.find(_this._callbacks, 'id', requestId);
            _.remove(_this._callbacks, function (cb) { return cb.id === requestId; });
            return callback.deffered.resolve(result);
        };
        this._ws.onerror = function (event) {
            _this._toastr.error('Oops! WebSocket error. Try again', '', {
                closeButton: true,
                timeOut: 2500
            });
            _this._callbacks = [];
            _this.onerror(event);
        };
    };
    WSService.prototype.send = function (data) {
        var requestId = this._generateID();
        _.assign(data, {
            'request-id': requestId
        });
        var callback = {
            id: requestId,
            deffered: this._q.defer(),
            data: JSON.stringify(data)
        };
        this._callbacks.push(callback);
        if (this._ws && this._ws.readyState === WebSocket.OPEN) {
            this._processRequests();
            return callback.deffered.promise;
        }
    };
    /**
     * Returns boolean, whether websocket was FORCEFULLY closed.
     */
    WSService.prototype.close = function () {
        if (this._ws) {
            this._forcedClose = true;
            this._ws.close();
            return true;
        }
        return false;
    };
    /**
     * Additional public API method to refresh the connection if still open
     * (close, re-open). For example, if the app suspects bad data / missed
     * heart beats, it can try to refresh.
     *
     * Returns boolean, whether websocket was closed.
     */
    WSService.prototype.refresh = function () {
        if (this._ws) {
            this._ws.close();
            return true;
        }
        return false;
    };
    WSService.prototype._processRequests = function () {
        if (!this._callbacks.length) {
            return;
        }
        for (var _i = 0, _a = this._callbacks; _i < _a.length; _i++) {
            var request = _a[_i];
            this._ws.send(request.data);
        }
    };
    WSService.prototype._generateID = function () {
        return Math.random().toString(36).slice(2);
    };
    return WSService;
}());
exports.WSService = WSService;
ws.service('ws', WSService);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ws;

//# sourceMappingURL=ws.js.map
