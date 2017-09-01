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
