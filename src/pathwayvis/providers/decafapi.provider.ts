export class DecafAPIProvider {
    // host = 'http://localhost:7000';
    host = 'https://api.dd-decaf.eu';

    $get() {
        return this.host;
    }
}
