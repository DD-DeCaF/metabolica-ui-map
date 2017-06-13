export class ModelWSProvider {
    host = 'wss://api-staging.dd-decaf.eu';
    prefix = '/wsmodels';

    $get() {
        return this.host + this.prefix;
    }
}
