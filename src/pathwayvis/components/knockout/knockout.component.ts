import * as _ from 'lodash';

import {WSService} from '../../services/ws';
import {ActionsService} from '../../services/actions/actions.service';

import * as types from '../../types';
import * as template from './knockout.component.html';
import {ToastService} from "../../services/toastservice";
import {MapOptionService} from "../../services/mapoption.service";


/**
 * Knockout component
 */
class KnockoutComponentCtrl {
    private mapOptions: MapOptionService;
    public shared: types.Shared;
    public removedReactions: string[];
    private _actions: ActionsService;
    private $scope: angular.IScope;

    /* @ngInject */
    constructor ($scope: angular.IScope, MapOptions: MapOptionService, actions: ActionsService) {
        this._actions = actions;
        this.mapOptions = MapOptions;
        this.$scope = $scope;
    }

    public getRemovedReactions(): string[]{
        return this.mapOptions.getRemovedReactions();
    }

    public getCurrentGrowthRate(): number{
        return this.mapOptions.getCurrentGrowthRate();
    }

    public onReactionRemoveClick(selectedReaction: string): void {
        const undoKnockoutAction = this._actions.getAction('reaction:knockout:undo');
        this.mapOptions.actionHandler(undoKnockoutAction, selectedReaction).then((response) => {
            this.mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']));
            this.mapOptions.setReactionData(response.fluxes);
            this.mapOptions.setRemovedReactions(response['removed-reactions']);
            this.$scope.$apply();
        });
    }
}

export const KnockoutComponent = {
    controller: KnockoutComponentCtrl,
    controllerAs: 'ctrl',
    template: template.toString(),
    bindings: {
        shared: '=',
        project: '<project'
    }
};

