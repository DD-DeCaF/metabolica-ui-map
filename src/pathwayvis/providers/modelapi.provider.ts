export class ModelAPIProvider {
    host = 'https://api.dd-decaf.eu';

    $get() {
        return this.host;
    }
}
