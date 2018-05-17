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

import { Experiment, CallbackEmbeddedResponse } from "../types";
import { APIService } from "./api";

export class ExperimentService {
  private api: APIService;

  public experiments: Experiment[];

  constructor(api: APIService) {
    this.api = api;
    this.setExperiments();
  }

  public setExperiments(speciesCode: string = null) {
    const url = 'iloop-to-model/experiments' + (speciesCode ? `/${speciesCode}` : '');
    return this.api.get(url)
      .then((response: CallbackEmbeddedResponse<Experiment[]>) => {
        this.experiments = response.data.response;
      });
  }
}
