export class DecafAPIProvider {
    host = 'https://api-staging.dd-decaf.eu';

    $get() {
        return this.host;
    }
}
