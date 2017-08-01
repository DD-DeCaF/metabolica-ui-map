import * as angular from 'angular';
import {MethodService} from "../services/method.service";
import {DataHandler} from './DataHandler';

describe('DataHandler', () => {
    let dataHandler: DataHandler;

    beforeEach(() => {
        dataHandler = new DataHandler(new MethodService());
        [0, 1, 2].forEach(() => {
            dataHandler.addObject();
        });
    });

    describe('getIds', () => {
        it('should return the ids', () => {
            expect(dataHandler.getIds()).toEqual([0, 1, 2]);
        });
    });

    describe('nextMapObject', () => {
        it('should return 1 for 0', () => {
            expect(dataHandler.nextMapObject(0)).toBe(1);
        });

        it('should return 2 for 1', () => {
            expect(dataHandler.nextMapObject(1)).toBe(2);
        });

        it('should return 0 for 2', () => {
            expect(dataHandler.nextMapObject(2)).toBe(0);
        });

        it('should return 2 for 0 if 1 is deleted', () => {
            dataHandler.removeObject(0, 1);
            expect(dataHandler.nextMapObject(0)).toBe(2);
        });
    });

    describe('previousMapObject', () => {
        it('should return 1 for 0', () => {
            expect(dataHandler.previousMapObject(1)).toBe(0);
        });

        it('should return 2 for 1', () => {
            expect(dataHandler.previousMapObject(2)).toBe(1);
        });

        it('should return 0 for 2', () => {
            expect(dataHandler.previousMapObject(0)).toBe(2);
        });

        it('should return 2 for 0 if 1 is deleted', () => {
            dataHandler.removeObject(0, 1);
            expect(dataHandler.previousMapObject(2)).toBe(0);
        });
    });

    describe('removeObject', () => {
        it('should remove the removed ids', () => {
            dataHandler.removeObject(0, 1);
            expect(dataHandler.getIds()).toEqual([0, 2]);
        });

        it('should shorten the list of objects', () => {
            dataHandler.removeObject(0, 1);
            expect(dataHandler.size()).toEqual(2);
        });
    });
});
