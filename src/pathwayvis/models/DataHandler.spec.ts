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
import { DataHandler } from './DataHandler';
import { ObjectType } from "../types";

describe('DataHandler', () => {
  let dataHandler: DataHandler;

  beforeEach(() => {
    dataHandler = new DataHandler();
    [0, 1, 2].forEach(() => {
      dataHandler.addObject();
    });
  });

  describe('addObject', () => {
    it('should create en experiment if type is not provided', () => {
      const id = dataHandler.addObject();
      const newObject = dataHandler.getObject(id);
      expect(newObject.type).toBe(ObjectType.Experiment);
    });

    it('should create en reference if passed as argument', () => {
      const id = dataHandler.addObject(ObjectType.Reference);
      const newObject = dataHandler.getObject(id);
      expect(newObject.type).toBe(ObjectType.Reference);
    });
  });

  describe('getIds', () => {
    it('should return the ids', () => {
      expect(dataHandler.ids).toEqual([0, 1, 2]);
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
      expect(dataHandler.ids).toEqual([0, 2]);
    });

    it('should shorten the list of objects', () => {
      dataHandler.removeObject(0, 1);
      expect(dataHandler.size()).toEqual(2);
    });
  });
});
