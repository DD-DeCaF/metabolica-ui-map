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

import * as angular from 'angular';
import {InfoComponentCtrl} from './info.component';

describe('InfoComponentCtrl', () => {
  let element;
  let controller;
  let $controller;

  beforeEach(angular.mock.module('pathwayvis'));

  beforeEach(() => {
      angular.module('pathwayvis').controller('InfoComponentCtrl', InfoComponentCtrl);
  });

  beforeEach(angular.mock.inject((_$controller_) => {
      $controller = _$controller_;
  }));

  it('should be defiend', () => {
      controller = $controller('InfoComponentCtrl', { $scope: {} });
      expect(controller).toBeDefined();
  });
});
