export class ModelAPIProvider {
    private host = 'https://api-staging.dd-decaf.eu';

    public $get() {
        return this.host;
    }
}
