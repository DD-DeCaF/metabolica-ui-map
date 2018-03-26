export interface Logger {
  log: (...args: any[]) => any;
}

export class LoggerProvider {
  public loggerFunction = (...args) => {
    console.log('[gtag]', ...args);
  }

  public $get(): Logger {
    return {
      log: this.loggerFunction,
    };
  }
}
