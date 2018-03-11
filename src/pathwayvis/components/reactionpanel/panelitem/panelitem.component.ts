import * as template from "./panelitem.component.html";
import "./panelitem.component.scss";

class PanelItemCtrl {
  public searchText: string = '';

  public onItemSelect: (item: any) => void;
  public querySearch: (query: string) => any[];
  public placeholder: string;
  public header: string;
  public missingItems: string;
  public items = [];
  public onRemoveItem: (item: any) => void;
  public itemDisplay: (item: any) => string;
  public idProperty: string;

  public selectedItemChange(item) {
    this.onItemSelect({item});
    this.searchText = '';
  }
}

export const PanelItemComponent: angular.IComponentOptions = {
  controller: PanelItemCtrl,
  template: template.toString(),
  bindings: {
    onItemSelect: '&',
    querySearch: '&',
    placeholder: '<',
    missingItems: '<',
    header: '<',
    items: '<',
    onRemoveItem: '&',
    itemDisplay: '&',
    idProperty: '<',
  },
};
