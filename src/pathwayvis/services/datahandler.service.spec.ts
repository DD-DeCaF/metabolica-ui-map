import * as angular from 'angular';

import {DataHandlerService} from './datahandler.service';
import * as types from '../types';

describe('DataHandlerService', () => {
  let dataHandlerService: DataHandlerService<string>;

  let timer;
  beforeEach(angular.mock.module('pathwayvis'));

  beforeEach(angular.mock.inject(($injector) => {
    dataHandlerService = $injector.get('dataHandlerService');
  }));

  it('should be defined', () => {
    expect(dataHandlerService).toBeDefined();
  });

  it('should return a new element', () => {
    dataHandlerService.allCards.subscribe((cards) => {
      expect(cards.map((card) => card.item)).toEqual(['hello']);
    });

    dataHandlerService.add('hello');
  });

  it('should return noth new elements', () => {
    let counter = 0;
    let results = [];
    dataHandlerService.allCards.subscribe((cards) => {
      results.push(cards.map((card) => card.item));
      counter++;
      if (counter === 2) {
        expect(results).toEqual([
          ['foo'],
          ['foo', 'bar'],
        ]);
      }
    });

    dataHandlerService.add('foo');
    dataHandlerService.add('bar');
  });

  describe('remove', () => {
    it('removes the first element', () => {
      dataHandlerService.add('foo');
      dataHandlerService.add('bar');

      // dataHandlerService.allCards.subscribe((cards) => {
      //   expect(cards[0].item).toBe('bar');
      // });

      dataHandlerService.remove(0);
    });

    it('should fail if there\'s only one item left', () => {
      dataHandlerService.add('foo');
      dataHandlerService.allCards.subscribe(() => {});
      expect(() => {
        dataHandlerService.remove(0);
      }).toThrowError();
    });

    it('should fail but then it should work again', () => {
      dataHandlerService.add('foo');
      dataHandlerService.allCards.subscribe(() => {});
      expect(() => {
        dataHandlerService.remove(0);
      }).toThrowError();
      dataHandlerService.add('bar');
      // dataHandlerService.allCards.subscribe((cards) => {
      //   expect(cards[0].item).toBe('bar');
      // });
      // dataHandlerService.remove(0);
    });
  });

  // describe('selection', () => {

  // });
});
