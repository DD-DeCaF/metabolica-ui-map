export class SharedService {
  private loading: number = 0;

  public increment(message?): void {
    this.loading++;
    if (message) {
      console.debug(`increment ${message}`);
    }
  }

  public async(promise, message?): Promise<any> {
    this.increment(message);
    promise.finally(() => {
      this.decrement(message);
    });
    return promise;
  }

  public decrement(message?): void {
    this.loading--;
    if (message) {
      console.debug(`decrement ${message}`);
    }
  }

  public getLoading(): number {
    return this.loading;
  }

  public isLoading(): boolean {
    return this.loading > 0;
  }
}
