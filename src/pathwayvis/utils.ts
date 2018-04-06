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

export const _mapValues = (object, callback) =>
    Object.assign({},
        ...Object.entries(object)
          .map(([key, value]) => ({[key]: callback(value)})));


export const _pickBy = (object, callback) =>
    Object.assign({},
        ...Object.entries(object).filter(([key, value]) => (callback(value)))
          .map(([key, value]) => ({[key]: value})));

export const sortObj = (obj) => (
    obj === null || typeof obj !== 'object'
    ? obj
    : Array.isArray(obj)
    ? obj.map(sortObj)
    : Object.assign({},
        ...Object.entries(obj)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .map(([k, v]) => ({ [k]: sortObj(v) }),
      ))
  );

export const deterministicStringify = (obj) => JSON.stringify(sortObj(obj));
