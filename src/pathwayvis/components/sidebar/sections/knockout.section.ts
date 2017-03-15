import * as _ from 'lodash';
import 'angular-toastr';

import {WSService} from '../../../services/ws';
import {ActionsService} from '../../../services/actions/actions.service';

import * as types from '../../../types';

import './views/knockout.section.scss';
import * as template from './views/knockout.section.html';


/**
 * Knockout component
 */
class KnockoutComponentCtrl {
    public shared: types.Shared;
    public growthRate: number;
    public removedReactions: string[];
    private _ws: WSService;
    private _actions: ActionsService;
    private $scope: angular.IScope;

    /* @ngInject */
    constructor ($scope: angular.IScope, toastr: angular.toastr.IToastrService, actions: ActionsService, ws: WSService) {
        this._ws = ws;
        this._actions = actions;
        this.$scope = $scope;

        // Reaction data watcher
        $scope.$watch('ctrl.shared.map.growthRate', () => {
            if (!_.isUndefined(this.shared.map.growthRate)) {
                this.growthRate = this.shared.map.growthRate;
                this.removedReactions = this.shared.removedReactions;
                if (_.round(this.growthRate, 5) === 0) {
                    toastr.warning('Growth rate is 0!', '', {
                        closeButton: true,
                        timeOut: 0,
                        extendedTimeOut: 0
                    });
                }
            }
        }, true);

        $scope.$watch('ctrl.shared.removedReactions', () => {
            this.removedReactions = this.shared.removedReactions;
        })
    }

    public onReactionRemoveClick(selectedReaction: string): void {

        const undoKnockoutAction = this._actions.getAction('reaction:knockout:undo');
        const shared = _.cloneDeep(this.shared);

        _.remove(shared.removedReactions, (id) => id === selectedReaction);

        let sharedKO = {
            element: {
                bigg_id: selectedReaction
            },
            shared: shared
        };

        this._actions.callAction(undoKnockoutAction, sharedKO).then((response) => {
            this.shared.map.growthRate = parseFloat(response['growth-rate']);
            this.shared.map.reactionData = response.fluxes;
            this.shared.removedReactions = response['removed-reactions'];
            this.$scope.$apply();
        });
    }
}

export const KnockoutComponent: angular.IComponentOptions = {
    controller: KnockoutComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
        project: '<project'
    }
};

