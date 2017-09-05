export class SharedService {
  private loading: number = 0;

  public increment(): void {
    this.loading++;
  }

  public decrement(): void {
    this.loading--;
  }

  public getLoading(): number {
    return this.loading;
  }

  public isLoading(): boolean {
    return this.loading > 0;
  }
}
