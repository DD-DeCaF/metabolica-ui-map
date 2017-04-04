/**
 * Created by dandann on 04/04/2017.
 */

export class ToastService{
    private $mdToast: ng.material.IToastService;

    constructor($mdToast: ng.material.IToastService){
        this.$mdToast = $mdToast;
    };

    public showWarnToast(text: string): void {
        let toast = this.$mdToast.simple()
            .textContent(text)
            .action('close')
            .position('bottom right')
            .theme("warn-toast");
        this.$mdToast.show(toast);
    }

    public showErrorToast(text: string): void {
        let toast = this.$mdToast.simple()
            .textContent(text)
            .action('close')
            .position('bottom right')
            .theme("error-toast");
        this.$mdToast.show(toast);
    }
}
