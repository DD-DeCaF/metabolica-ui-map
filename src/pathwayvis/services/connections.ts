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

import { ToastService } from "./toastservice";
import { ModelWSProvider } from '../providers/modelws.provider';
import { PvWebSocket } from './websocket';

export class ConnectionsService {
  public reconnectInterval: number = 1000;
  public timeoutInterval: number = 10000;

  private _q: angular.IQService;
  private _toastService: ToastService;
  private _modelWS: ModelWSProvider;
  private _connections: Map<string, PvWebSocket>;

  constructor($q: angular.IQService, toastService: ToastService, modelWS: ModelWSProvider) {
    this._q = $q;
    this._toastService = toastService;
    this._modelWS = modelWS;
    this._connections = new Map();
  }

  public connect(path: string, reconnectAttempt: boolean = true) {
    if (this._connections.has(path)) return;
    const options = {
      timeoutInterval: this.timeoutInterval,
      reconnectInterval: this.reconnectInterval,
      reconnect: () => {
        if (reconnectAttempt) {
          this._connections.get(path).close();
          this.connect(path, reconnectAttempt);
        }
      },
      onError: () => {
        this._toastService.showErrorToast('Oops! WebSocket error. Try again');
      },
    };

    this._connections.set(path, new PvWebSocket(
      `${this._modelWS}/${path}`,
      options,
    ));
  }

  private _assertHasConnection(path) {
    if (!this._connections.has(path)) {
      throw new Error(`Attempted to access non-existent connection ${path}`);
    }
  }

  public send(path, data, cardId: number) {
    this._assertHasConnection(path);
    const deferred = this._q.defer();
    this._connections.get(path).send(data, deferred, cardId);
    return deferred.promise;
  }

  public close(path) {
    this._assertHasConnection(path);
    this._connections.get(path).close(true);
    this._connections.delete(path);
  }

  // Not used anywhere
  public refresh(path) {
    this._assertHasConnection(path);
    // relying on the self-healing feature
    this._connections.get(path).close();
  }
}
