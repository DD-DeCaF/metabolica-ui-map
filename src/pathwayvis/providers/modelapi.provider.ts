export class ModelAPIProvider {
    host = 'https://api-staging.dd-decaf.eu';

    $get() {
        return this.host;
    }
}
