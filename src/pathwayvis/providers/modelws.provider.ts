export class ModelWSProvider {
    host = 'wss://api.dd-decaf.eu';
    prefix = '/wsmodels';

    $get() {
        return this.host + this.prefix;
    }
}
