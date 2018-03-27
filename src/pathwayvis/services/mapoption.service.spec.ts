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

describe('MapOptionService', () => {
  let mapOptionService;
  beforeEach(angular.mock.module('pathwayvis'));

  beforeEach(angular.mock.inject(($injector) => {
    mapOptionService = $injector.get('mapOptions');
  }));

  it('should be defined', () => {
    expect(mapOptionService).toBeDefined();
  });

  describe('removeReaction', () => {
    it('should remove the seelcted bigg_id', () => {
      const addedReactions = [
        { bigg_id: '4'},
        { bigg_id: '5'},
        { bigg_id: '6'},
      ];
      spyOn(mapOptionService, 'getMapData').and.returnValue({addedReactions});
      mapOptionService.removeReaction('5');
      expect(addedReactions).toEqual([
        { bigg_id: '4'},
        { bigg_id: '6'},
      ]);
    });
  });
});
