export class ToastService {
  private $mdToast: ng.material.IToastService;

  constructor($mdToast: ng.material.IToastService) {
    this.$mdToast = $mdToast;
  }

  public showWarnToast(text: string): void {
    this._showToast('warn-toast', text);
  }

  public showErrorToast(text: string): void {
    this._showToast('error-toast', text);
  }

  private _showToast(theme: string, text: string): void {
    const toast = this.$mdToast.simple()
      .textContent(text)
      .action('close')
      .position('bottom right')
      .theme(theme)
      .hideDelay(6000);
    this.$mdToast.show(toast);
  }
}
