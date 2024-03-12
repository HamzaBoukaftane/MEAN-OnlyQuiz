import { TestBed } from '@angular/core/testing';

import { PlayerData } from '@common/constants/sort-list.service.const';
import { PlayerStatus } from '@common/player-status/player-status';
import { SortListService } from './sort-list.service';
const SCORE_HIGH = 20;
const SCORE_LOW = 10;
const SCORE_MIDDLE = 15;
const INVALID_STATUS = 'Ouais kho kidhayer ?';
const STATUS_INDEX = 3;
const SCORE_INDEX = 1;
const LEN = 4;

describe('SortListService', () => {
    let service: SortListService;
    let mockPlayers: PlayerData[];
    let name: string;
    let score: number;
    let status: string;
    const findByName = (player: PlayerData) => player[0] === name;
    const findByScore = (player: PlayerData) => player[1] === score;
    const findByStatus = (player: PlayerData) => player[3] === status;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SortListService);
        mockPlayers = [
            ['Bob', SCORE_HIGH, 2, PlayerStatus.INTERACTION, true],
            ['Karim', SCORE_MIDDLE, 1, PlayerStatus.VALIDATION, true],
            ['Alice', SCORE_LOW, 1, PlayerStatus.NO_INTERACTION, true],
            ['Mahmoud', SCORE_MIDDLE, 0, PlayerStatus.VALIDATION, true],
        ];
    });
    const verifySortByName = () => {
        name = 'Alice';
        expect(mockPlayers.findIndex(findByName)).toEqual(0);
        name = 'Bob';
        expect(mockPlayers.findIndex(findByName)).toEqual(1);
        name = 'Karim';
        expect(mockPlayers.findIndex(findByName)).toEqual(2);
        name = 'Mahmoud';
        expect(mockPlayers.findIndex(findByName)).toEqual(3);
    };

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should sort players alphabetically by name', () => {
        service.sortByName();
        mockPlayers.sort(service.sortFunction);
        verifySortByName();
    });

    it('should sort players by score', () => {
        service.sortByScore();
        mockPlayers.sort(service.sortFunction);
        score = SCORE_HIGH;
        expect(mockPlayers.findIndex(findByScore)).toEqual(0);
        score = SCORE_MIDDLE;
        expect(mockPlayers.findIndex(findByScore)).toEqual(1);
        name = 'Mahmoud';
        expect(mockPlayers.findIndex(findByName)).toEqual(2);
        score = SCORE_LOW;
        expect(mockPlayers.findIndex(findByScore)).toEqual(3);
    });

    it('should sort players by name when score is the same', () => {
        for (let i = 0; i < LEN; i++) mockPlayers[i][SCORE_INDEX] = SCORE_LOW;
        service.sortByScore();
        mockPlayers.sort(service.sortFunction);
        verifySortByName();
    });

    it('should sort players by status', () => {
        service.sortByStatus();
        mockPlayers.sort(service.sortFunction);
        status = PlayerStatus.NO_INTERACTION;
        expect(mockPlayers.findIndex(findByStatus)).toEqual(0);
        status = PlayerStatus.INTERACTION;
        expect(mockPlayers.findIndex(findByStatus)).toEqual(1);
        status = PlayerStatus.VALIDATION;
        expect(mockPlayers.findIndex(findByStatus)).toEqual(2);
        name = 'Mahmoud';
        expect(mockPlayers.findIndex(findByName)).toEqual(3);
    });

    it('should sort by name players when they dont have right status or same status', () => {
        for (let i = 0; i < LEN; i++) mockPlayers[i][STATUS_INDEX] = INVALID_STATUS;
        service.sortByStatus();
        mockPlayers.sort(service.sortFunction);
        verifySortByName();
    });
});
