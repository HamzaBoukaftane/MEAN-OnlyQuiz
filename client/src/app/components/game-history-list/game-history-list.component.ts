import { Component, OnInit } from '@angular/core';
import { GameHistoryService } from '@app/services/game-history.service/game-history.service';
import { GameInfo } from '@common/interfaces/game-info.interface';
import { ARROW_DOWN, ARROW_UP, COLUMN_DATE, COLUMN_NAME, DEFAULT_RADIX_VALUE } from '@common/constants/game-history-list.component.const';

@Component({
    selector: 'app-history-list',
    templateUrl: './game-history-list.component.html',
    styleUrls: ['./game-history-list.component.scss'],
})
export class GameHistoryListComponent implements OnInit {
    games: GameInfo[] = [];
    isNameIconClicked: boolean = false;
    isDateIconClicked: boolean = false;
    private isNameAscendingOrder = false;
    private isDateAscendingOrder = false;
    constructor(private gameHistoryServices: GameHistoryService) {}

    ngOnInit(): void {
        this.getAllGames();
    }

    getAllGames() {
        this.gameHistoryServices.getAll().subscribe((res) => {
            this.games = res;
            this.sort(COLUMN_NAME);
        });
    }

    deleteAllGames() {
        this.gameHistoryServices.deleteAll().subscribe();
        this.games = [];
    }

    sort(option: string) {
        this.changeOrder(option);
        this.isNameIconClicked = option === COLUMN_NAME;
        this.isDateIconClicked = option === COLUMN_DATE;
        if (option === COLUMN_NAME) this.sortGameName();
        else if (option === COLUMN_DATE) this.sortDate();
    }

    getSortIcon(column: string) {
        if (column === COLUMN_NAME) return this.isNameAscendingOrder ? ARROW_UP : ARROW_DOWN;
        else return this.isDateAscendingOrder ? ARROW_UP : ARROW_DOWN;
    }

    private sortDate() {
        this.games.sort((firstGame, secondGame) => {
            const firstDate = this.convertDateToNumber(firstGame.startTime);
            const secondDate = this.convertDateToNumber(secondGame.startTime);
            return this.isDateAscendingOrder ? firstDate - secondDate : secondDate - firstDate;
        });
    }

    private sortGameName() {
        this.games.sort((firstGame, secondGame) => {
            const firstGameName = firstGame.gameName.toLowerCase();
            const secondGameName = secondGame.gameName.toLowerCase();
            return this.isNameAscendingOrder ? firstGameName.localeCompare(secondGameName) : secondGameName.localeCompare(firstGameName);
        });
    }

    private changeOrder(option: string) {
        if (option === COLUMN_NAME) this.isNameAscendingOrder = !this.isNameAscendingOrder;
        else if (option === COLUMN_DATE) this.isDateAscendingOrder = !this.isDateAscendingOrder;
    }

    private convertDateToNumber(dateString: string) {
        const cleanedString = dateString.replace(/[-: ]/g, '');
        return parseInt(cleanedString, DEFAULT_RADIX_VALUE);
    }
}
