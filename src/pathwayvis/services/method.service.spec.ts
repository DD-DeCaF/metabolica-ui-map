import { Method } from "../types";
import { MethodService } from './method.service';

describe('MethodService', () => {
  let methodService: MethodService;

  beforeEach(() => {
    methodService = new MethodService();
  });

  describe('defaultMethod', () => {
    it('should return the second method', () => {
      expect(methodService.defaultMethod()).toEqual(<Method> { id: 'pfba', name: 'pFBA'});
    });
  });

  describe('getMethodName', () => {
    it('should return the name of the method', () => {
      expect(methodService.getMethod('pfba')).toEqual(<Method> { id: 'pfba', name: 'pFBA'});
    });

    it('should return \'-\' if id not found', () => {
      expect(methodService.getMethod('foo')).toEqual(undefined);
    });
  });
});
