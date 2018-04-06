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

interface Request {
  id: string;
  deferred: angular.IDeferred<any>;
  data: object;
  cardId: number;
}

interface WebsocketOptions {
  timeoutInterval: number;
  reconnectInterval: number;
  onClose?: () => void;
  reconnect?: () => void;
  onError?: (event: ErrorEvent) => void;
}

export class PvWebSocket {
  private _url: string;
  private _ws: WebSocket;
  private _forcedClose: boolean = false;
  private _queued: Request[] = [];
  private _pending: Map<string, Request> = new Map();
  private _running: boolean = false;

  constructor(
    url: string,
    options: WebsocketOptions,
  ) {
    this._url = url;
    this._ws = new WebSocket(url);

    const timeout = setTimeout(() => {
      this._ws.close();
    }, options.timeoutInterval);

    this._ws.onopen = (event: Event) => {
      clearTimeout(timeout);
      this._processRequests();
    };

    this._ws.onclose = (event: CloseEvent) => {
      clearTimeout(timeout);
      if (!this._forcedClose) {
        setTimeout(() => {
          options.reconnect();
        }, options.reconnectInterval);
      }
    };

    this._ws.onmessage = (event) => {
      const result = JSON.parse(event.data);
      const requestId = result['request-id'];
      const request = this._pending.get(requestId);
      this._pending.delete(requestId);
      if (!request.deferred.promise) {
        throw new Error(`No promise was found for request ${requestId}`);
      }
      return request.deferred.resolve({...result, cardId: request.cardId});
    };

    this._ws.onerror = (event: ErrorEvent) => {
      options.onError(event);
    };
  }

  public send(data, deferred, cardId: number) {
    this._queued.push({
      id: this._generateID(),
      deferred,
      data,
      cardId,
    });
    if (!this._running) {
      this._processRequests();
    }
  }

  public close(forced: boolean = false) {
    this._forcedClose = forced;
    this._ws.close();
  }

  private _processRequests() {
    if (this._ws.readyState !== WebSocket.OPEN) return;
    const request = this._queued.shift();
    if (request) {
      const {id, data, deferred} = request;
      this._ws.send(JSON. stringify({
        ...data,
        'request-id': id,
      }));
      this._processRequests();
      this._pending.set(id, request);
    } else {
      this._running = false;
    }
  }

  private _generateID(): string {
    return Math.random().toString(36).slice(2);
  }
}
