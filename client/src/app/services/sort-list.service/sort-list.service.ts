import { Injectable } from '@angular/core';
import { ORDER_FIRST, ORDER_LAST, ORDER_SECOND, ORDER_THIRD, STATUS, PlayerData } from '@common/constants/sort-list.service.const';
import { PlayerStatus } from '@common/player-status/player-status';

@Injectable({
    providedIn: 'root',
})
export class SortListService {
    readonly mapStatus = new Map([
        [PlayerStatus.NO_INTERACTION, ORDER_FIRST],
        [PlayerStatus.INTERACTION, ORDER_SECOND],
        [PlayerStatus.VALIDATION, ORDER_THIRD],
        [PlayerStatus.LEFT, ORDER_LAST],
    ]);
    sortFunction: (arg1: PlayerData, arg2: PlayerData) => number = this.sortComparaisonByName;

    sortByName() {
        this.sortFunction = this.sortComparaisonByName.bind(this);
    }

    sortByScore() {
        this.sortFunction = this.sortComparaisonByScore.bind(this);
    }

    sortByStatus() {
        this.sortFunction = this.sortComparaisonByStatus.bind(this);
    }

    private sortComparaisonByName(firstPlayer: PlayerData, secondPlayer: PlayerData) {
        return firstPlayer[0].localeCompare(secondPlayer[0]);
    }

    private sortComparaisonByScore(firstPlayer: PlayerData, secondPlayer: PlayerData) {
        const scoreComparaison = secondPlayer[1] - firstPlayer[1];
        if (scoreComparaison !== 0) return scoreComparaison;
        return this.sortComparaisonByName(firstPlayer, secondPlayer);
    }

    private sortComparaisonByStatus(firstPlayer: PlayerData, secondPlayer: PlayerData) {
        const statusComparaison = (this.mapStatus.get(secondPlayer[STATUS]) ?? 0) - (this.mapStatus.get(firstPlayer[STATUS]) ?? 0);
        if (statusComparaison !== 0) return statusComparaison;
        return this.sortComparaisonByName(firstPlayer, secondPlayer);
    }
}
