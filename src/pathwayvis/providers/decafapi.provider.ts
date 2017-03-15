export class DecafAPIProvider {
    host = 'https://api.dd-decaf.eu';

    $get() {
        return this.host;
    }
}
