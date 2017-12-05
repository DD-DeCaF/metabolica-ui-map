import * as _ from 'lodash';
import { ToastService } from "./toastservice";
import { ModelWSProvider } from '../providers/modelws.provider';


// interface RequestDetails {
//   path: string;
//   params: Object;
// }

interface Callback {
  id: string;
  deffered: angular.IDeferred<any>;
  data: string;
}


export class WSService {

  public reconnectInterval: number = 1000;
  public timeoutInterval: number = 10000;

  private _forcedClose: boolean = false;
  private _timedOut: boolean = false;
  private _websockets: Map<string, WebSocket>;
  private _url: string;
  private _callbacks: Callback[] = [];
  private _q: angular.IQService;
  private toastService: ToastService;
  private modelWS: ModelWSProvider;

  // TODO rename to lowercase toastService
  constructor($q: angular.IQService, toastService: ToastService, modelWS: ModelWSProvider) {
    this._q = $q;
    this.toastService = toastService;
    this.modelWS = modelWS;
    this._websockets = new Map();
  }

  public connect(path: string, reconnectAttempt: boolean) {
    this._url = this.modelWS + '/' + path;

    if (this._websockets.has(path)) return;
    const localWs = new WebSocket(this._url);
    this._websockets[path] = localWs;

    let timeout = setTimeout(() => {
      this._timedOut = true;
      localWs.close();
      this._timedOut = false;
    }, this.timeoutInterval);

    localWs.onopen = (event: Event) => {
      clearTimeout(timeout);
      reconnectAttempt = false;
      this._processRequests(localWs);
    };

    localWs.onclose = (event: CloseEvent) => {
      clearTimeout(timeout);
      this._websockets.delete(path);
      if (!this._forcedClose) {
        setTimeout(() => {
          this.connect(path, true);
        }, this.reconnectInterval);
      }
    };

    localWs.onmessage = (event) => {
      const result = JSON.parse(event.data);
      const requestId = result['request-id'];
      const callback = _.find(this._callbacks, 'id', requestId);

      _.remove(this._callbacks, (cb) => cb.id === requestId);
      return callback.deffered.resolve(result);
    };

    localWs.onerror = (event: ErrorEvent) => {
      this.toastService.showErrorToast('Oops! WebSocket error. Try again');
      this._callbacks = [];
    };
  }

  public send(path: string, data: any): angular.IPromise<any> {
    const connection = this._websockets[path];
    if (!connection) {
      console.debug(`Attempted to send data to non-existent connection ${path}`);
      return;
    }
    const requestId = this._generateID();

    _.assign(data, {
      'request-id': requestId,
    });

    const callback = {
      id: requestId,
      deffered: this._q.defer(),
      data: JSON.stringify(data),
    };

    this._callbacks.push(callback);

    if (connection && connection.readyState === WebSocket.OPEN) {
      this._processRequests(connection);
      return callback.deffered.promise;
    }
  }

  /**
   * Returns boolean, whether websocket was FORCEFULLY closed.
   */
  public close(path: string): boolean {
    const connection = this._websockets[path];
    if (connection) {
      this._forcedClose = true;
      connection.close();
      return true;
    }
    return false;
  }

  public isActive(path: string): boolean {
    const connection = this._websockets[path];
    return connection && [WebSocket.OPEN, WebSocket.CONNECTING].includes(connection.readyState);
  }

  /**
   * Additional public API method to refresh the connection if still open
   * (close, re-open). For example, if the app suspects bad data / missed
   * heart beats, it can try to refresh.
   *
   * Returns boolean, whether websocket was closed.
   */
  public refresh(path: string): boolean {
    const connection = this._websockets[path];
    if (connection) {
      connection.close();
      return true;
    }
    return false;
  }

  private _processRequests(connection: WebSocket): void {
    if (!this._callbacks.length) {
      return;
    }

    for (let request of this._callbacks) {
      connection.send(request.data);
    }
  }

  private _generateID(): string {
    return Math.random().toString(36).slice(2);
  }
}

