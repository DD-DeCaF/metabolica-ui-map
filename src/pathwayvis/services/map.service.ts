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

import { APIService } from "./api";


export class MapService {
  private apiService: APIService;
  public allMaps: {};

  constructor(api: APIService) {
    this.apiService = api;

    this.apiService.getModel('maps', {}).then((response: angular.IHttpPromiseCallbackArg<any>) => {
      this.allMaps = response.data;
    });
  }

  public usableMap(mapName: string, modelId: string): boolean {
    const maps = this.allMaps[modelId];
    return maps.indexOf(mapName) !== -1;
  }

  public getMapsFromModel(model): string[] {
    return this.allMaps[model];
  }

  public getDefaultMap(model): string {
    let defaultMap = 'Central metabolism';
    if (this.allMaps) {
      if (this.allMaps[model].includes(defaultMap)) {
        return defaultMap;
      }
      return this.allMaps[model][0];
    }
    return null;
  }
}
