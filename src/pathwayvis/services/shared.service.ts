export class SharedService {
  private loading: number = 0;

  public increment(message?): void {
    this.loading++;
    if (message) {
      console.debug(`increment ${message}`);
    }
  }

  public async(promise, message?): void {
    this.increment(message);
    promise.finally(() => {
      this.decrement(message);
    });
  }

  public decrement(message?): void {
    this.loading--;
    if (message) {
      console.log(`decrement ${message}`);
    }
  }

  public getLoading(): number {
    return this.loading;
  }

  public isLoading(): boolean {
    return this.loading > 0;
  }
}
