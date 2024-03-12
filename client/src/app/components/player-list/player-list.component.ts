import { Component, Input } from '@angular/core';
import {
    ORDER_ICON_DOWN,
    ORDER_ICON_UP,
    ORDER_INITIAL_MULTIPLIER,
    ORDER_MULTIPLIER,
    Player,
    SortType,
} from '@common/constants/player-list.component.const';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() leftPlayers: Player[];
    @Input() roomId: number;
    @Input() isHost: boolean;
    orderIcon = ORDER_ICON_UP;
    optionSelections: Map<SortType, boolean> = new Map([
        [SortType.SORT_BY_NAME, true],
        [SortType.SORT_BY_SCORE, false],
        [SortType.SORT_BY_STATUS, false],
    ]);
    protected readonly sortType = SortType;
    private order = ORDER_INITIAL_MULTIPLIER;

    constructor(
        public interactiveListService: InteractiveListSocketService,
        private sortListService: SortListService,
    ) {
        if (!this.isHost) this.sortListService.sortByScore();
    }

    changeOrder() {
        this.order *= ORDER_MULTIPLIER;
        this.orderIcon = this.order !== ORDER_MULTIPLIER ? ORDER_ICON_UP : ORDER_ICON_DOWN;
        this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers, false);
    }

    sort(sortOption: SortType) {
        this.updateOptionSelections(sortOption);
        this.selectOptionMethod(sortOption);
        this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers, false);
    }

    sortAllPlayers(): Player[] {
        this.interactiveListService.players.sort((first: Player, second: Player) => this.order * this.sortListService.sortFunction(first, second));
        return this.interactiveListService.players;
    }

    toggleChatPermission(username: string) {
        this.interactiveListService.toggleChatPermission(username, this.roomId);
    }

    private selectOptionMethod(sortOption: SortType) {
        switch (sortOption) {
            case SortType.SORT_BY_NAME:
                this.sortListService.sortByName();
                break;
            case SortType.SORT_BY_SCORE:
                this.sortListService.sortByScore();
                break;
            case SortType.SORT_BY_STATUS:
                this.sortListService.sortByStatus();
                break;
        }
    }

    private updateOptionSelections(selectedMethod: SortType) {
        this.optionSelections.forEach((isSelected, methodName) => {
            if (isSelected && methodName !== selectedMethod) this.optionSelections.set(methodName, false);
            else if (selectedMethod === methodName) this.optionSelections.set(methodName, true);
        });
    }
}
