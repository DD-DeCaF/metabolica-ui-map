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
