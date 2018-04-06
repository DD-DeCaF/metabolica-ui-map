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

export function _mapValues (object, callback) {
    return Object.assign({},
        ...Object.entries(object)
          .map(([key, value]) => ({[key]: callback(value)})));
}

export function _pickBy (object, callback) {
    return Object.assign({},
        ...Object.entries(object).filter(([key, value]) => (callback(value)))
          .map(([key, value]) => ({[key]: value})));
}
