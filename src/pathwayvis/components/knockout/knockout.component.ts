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
    public growthRate: number;
    public removedReactions: string[];
    private _ws: WSService;
    private toastService: ToastService;
    private _actions: ActionsService;
    private $scope: angular.IScope;

    /* @ngInject */
    constructor ($scope: angular.IScope, MapOptions: MapOptionService, actions: ActionsService) {
        this._actions = actions;
        this.mapOptions = MapOptions;
        this.$scope = $scope;
    }

    public getRemovedReactions(): string[]{
        return this.mapOptions.getCurrentRemovedReactions();
    }

    public getCurrentGrowthRate(): number{
        return this.mapOptions.getCurrentGrowthRate();
    }

    public onReactionRemoveClick(selectedReaction: string): void {

        const undoKnockoutAction = this._actions.getAction('reaction:knockout:undo');
        const shared = _.cloneDeep(this.mapOptions.getCurrentMapData());

        _.remove(shared.removedReactions, (id) => id === selectedReaction);

        let sharedKO = {
            element: {
                bigg_id: selectedReaction
            },
            shared: shared
        };

        this._actions.callAction(undoKnockoutAction, sharedKO).then((response) => {
            // this.shared.map.growthRate = parseFloat(response['growth-rate']);
            this.mapOptions.setCurrentGrowthRate(parseFloat(response['growth-rate']))
            // this.shared.map.reactionData = response.fluxes;
            this.mapOptions.setReactionData(response.fluxes);
            // this.shared.removedReactions = response['removed-reactions'];
            this.mapOptions.setRemovedReactions( response['removed-reactions']);
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

