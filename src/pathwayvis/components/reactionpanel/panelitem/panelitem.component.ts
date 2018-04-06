// Copyright 2018 Novo Nordisk Foundation Center for Biosustainability, DTU.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as template from "./panelitem.component.html";
import "./panelitem.component.scss";

class PanelItemCtrl {
  public searchText: string = '';

  public onItemSelect: (item: any) => void;
  public querySearch: (query: string) => any[];
  public placeholder: string;
  public header: string;
  public missingItems: string;
  public items;
  public onRemoveItem: (item: any) => void;
  public itemDisplay: (item: any) => string;
  public idProperty: string;
  public selectedItemChange(item) {
    this.onItemSelect({item});
    this.searchText = '';
  }
  public $onInit() {
    this.itemDisplay = ((original: ({item}: {item: any}) => string) => (item: any) =>
      original ? original({item}) : item
    )(this.itemDisplay);
  }
}

export const PanelItemComponent = {
  controller: PanelItemCtrl,
  template: template.toString(),
  bindings: {
    onItemSelect: '&',
    querySearch: '&',
    placeholder: '<',
    missingItems: '<',
    header: '<',
    items: '<?',
    item: '<?',
    onRemoveItem: '&',
    itemDisplay: '&?',
    idProperty: '<',
  },
};
