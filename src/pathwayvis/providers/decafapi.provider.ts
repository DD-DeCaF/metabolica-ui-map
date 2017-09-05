export class DecafAPIProvider {
  private host = 'https://api-staging.dd-decaf.eu';

  public $get() {
    return this.host;
  }
}
