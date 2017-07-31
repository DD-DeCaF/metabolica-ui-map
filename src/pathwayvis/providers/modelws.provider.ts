export class ModelWSProvider {
    private host = 'wss://api-staging.dd-decaf.eu';
    private prefix = '/wsmodels';

    public $get() {
        return `${this.host}${this.prefix}`;
    }
}
