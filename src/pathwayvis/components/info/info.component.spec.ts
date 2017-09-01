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
