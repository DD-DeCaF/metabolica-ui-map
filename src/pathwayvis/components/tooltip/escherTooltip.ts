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
/* tslint:disable */

import * as tinier from 'tinier';
import * as _ from 'underscore';

function decompartmentalize(id) {
  const result = /(.*)_([a-z0-9]{1,2})$/.exec(id);
  return result !== null ? result.slice(1, 3) : [id, null];
}

function decompartmentalizeCheck(id, type) {
  // ID without compartment, if metabolite.
  return type === 'metabolite' ? decompartmentalize(id)[0] : id;
}

function capitalizeFirstLetter(s) {
  return s === null ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

// Create the component
export const Tooltip = (callbacks) =>
  tinier.createComponent({
    displayName: 'DefaultTooltip',

    init: () =>
      Object.assign({}, {
        biggId: '',
        name: '',
        loc: { x: 0, y: 0 },
        data: null,
        type: null,
      }),
    reducers: {
      setContainerData: (args) => {
        callbacks.newArgs(args);
        return {
          ...args.state,
          biggId: args.biggId,
          name: args.name,
          loc: args.loc,
          data: args.data,
          type: args.type,
        };
      },
    },

    methods: {
      openBigg: function (args) {
        let object = Object.assign({}, args.state, {
          type: args.state.type,
          biggId: args.state.biggId,
          pref: 'http://bigg.ucsd.edu/',
          url: (args.state.type === 'gene' ?
            'http://bigg.ucsd.edu/' + 'search?query=' + args.state.biggId :
            'http://bigg.ucsd.edu/' + 'universal/' + args.state.type + 's/' +
            decompartmentalizeCheck(args.state.biggId, args.state.type)),
        });
        window.open(object.url);
      },
      knockout: callbacks.knockout,
      setAsObjective: callbacks.setAsObjective,
      changeBounds: callbacks.changeBounds,
      resetBounds: callbacks.resetBounds,
      objectiveDirection: callbacks.objectiveDirection,
    },
    render: function (args) {
      let decomp = decompartmentalizeCheck(args.state.biggId, args.state.type);
      let biggButtonText = 'Open ' + decomp + ' in BiGG Models.';
      let knockoutButtonText = 'Knockout ';
      let torender: any = tinier.render(
        // parent node
        args.el,
        // the new tooltip element
        tinier.createElement('div',
        ));
      if (args.state.type === 'reaction') {
        torender = tinier.render(
          // parent node
          args.el,
          // the new tooltip element
          tinier.createElement('div',
            // tooltip style
            { class: 'container-style-reaction' },
            // id
            tinier.createElement('span', { class: 'id-style' }, args.state.biggId),
            tinier.createElement('br'),
            // descriptive name
            'name: ' + args.state.name,
            tinier.createElement('br'),
            // data
            'data: ' + (args.state.data && args.state.data !== '(nd)' ?
              args.state.data : 'no data'),
            tinier.createElement('br'),
            // BiGG Models button
            tinier.createElement('button',
              { class: 'button-style', onClick: args.methods.openBigg },
              biggButtonText),
            tinier.createElement('br'),
            //  Knockout button
            tinier.createElement('button',
              {
                class: 'button-knockout-style',
                id: 'knockoutbutton',
                onClick: args.methods.knockout,
                data: JSON.stringify(args.state),
              },
              knockoutButtonText),
            tinier.createElement('button',
              {
                class: 'button-objective-style',
                id: 'objectivebutton',
                onClick: args.methods.setAsObjective,
                data: JSON.stringify(args.state),
              },
              'Set as objective'),
            tinier.createElement('span', { class: 'objective-direction' }, 'Min'),

            tinier.createElement('input', {
              type: 'checkbox',
              id: 'objectivedirectioncheckbox',
            }),
            tinier.createElement('label', {
              for: 'switch',
              id: 'objectivedirection',
              class: 'objective-direction',
              onClick: args.methods.objectiveDirection
            }),
            tinier.createElement('span', { class: 'objective-direction span-margin-left' }, 'Max'),
            tinier.createElement('br'),
            tinier.createElement('div',
              // tooltip style
              { class: 'container-bounds-style' },
              tinier.createElement('span', {}, 'Lower bound'),
              tinier.createElement('input',
                {
                  class: 'input-style',
                  id: 'lowerbound',
                  type: 'number',
                }),
              tinier.createElement('span', {}, 'Upper bound'),
              tinier.createElement('input',
                {
                  class: 'input-style',
                  id: 'upperbound',
                  type: 'number',
                }),
              tinier.createElement('br'),
              tinier.createElement('button',
                {
                  class: 'button-bound-style',
                  id: 'boundbutton',
                  onClick: args.methods.changeBounds,
                  data: JSON.stringify(args.state),
                },
                'Change bounds'),
              tinier.createElement('button',
                {
                  class: 'button-bound-style',
                  id: 'resetBoundsbutton',
                  onClick: args.methods.resetBounds,
                  data: JSON.stringify(args.state),
                },
                'Reset bounds'),
            ),
            // type label
            tinier.createElement('div',
              { class: 'type-label-style' },
              capitalizeFirstLetter(args.state.type))),
        );
      } else {
        torender = tinier.render(
          // parent node
          args.el,
          // the new tooltip element
          tinier.createElement('div',
            // tooltip style
            { class: 'container-style' },
            // id
            tinier.createElement('span', { class: 'id-style' }, args.state.biggId),
            tinier.createElement('br'),
            // descriptive name
            'name: ' + args.state.name,
            tinier.createElement('br'),
            // data
            'data: ' + (args.state.data && args.state.data !== '(nd)' ?
              args.state.data : 'no data'),
            tinier.createElement('br'),
            // BiGG Models button
            tinier.createElement('button',
              { class: 'button-style', onClick: args.methods.openBigg },
              biggButtonText),
            // type label
            tinier.createElement('div',
              { class: 'type-label-style' },
              capitalizeFirstLetter(args.state.type))),
        );
      }
      return torender;
    },
  });
