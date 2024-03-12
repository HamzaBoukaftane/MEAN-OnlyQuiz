import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistoryListComponent } from './game-history-list.component';
import { GameHistoryService } from '@app/services/game-history.service/game-history.service';
import { of } from 'rxjs';
import { GameInfo } from '@common/interfaces/game-info.interface';
import { MatDialog } from '@angular/material/dialog';

describe('GameHistoryListComponent', () => {
    let component: GameHistoryListComponent;
    let fixture: ComponentFixture<GameHistoryListComponent>;
    let gameHistoryService: jasmine.SpyObj<GameHistoryService>;
    let MOCK_GAMES: GameInfo[];
    beforeEach(async () => {
        const gameHistoryServiceSpy = jasmine.createSpyObj('GameHistoryService', ['getAll', 'deleteAll']);
        gameHistoryServiceSpy.getAll.and.returnValue(of([]));
        gameHistoryServiceSpy.deleteAll.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            declarations: [GameHistoryListComponent],
            providers: [{ provide: GameHistoryService, useValue: gameHistoryServiceSpy }, MatDialog],
        }).compileComponents();

        gameHistoryService = TestBed.inject(GameHistoryService) as jasmine.SpyObj<GameHistoryService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameHistoryListComponent);
        component = fixture.componentInstance;
        component.games = [];
        fixture.detectChanges();

        MOCK_GAMES = [
            {
                gameName: 'Quiz 1',
                startTime: '2023-11-13 15:30:00',
                playersCount: 4,
                bestScore: 30,
            },
            {
                gameName: 'Quiz 2',
                startTime: '2023-11-14 10:45:00',
                playersCount: 2,
                bestScore: 25,
            },
            {
                gameName: 'Quiz 3',
                startTime: '2023-11-15 20:00:00',
                playersCount: 3,
                bestScore: 40,
            },
        ];
    });

    it('should get the games correctly', () => {
        gameHistoryService.getAll.and.returnValue(of(MOCK_GAMES));
        component.getAllGames();
        expect(gameHistoryService.getAll).toHaveBeenCalled();
    });

    it('should delete the games correctly', () => {
        component.games = MOCK_GAMES;
        component.deleteAllGames();
        expect(gameHistoryService.deleteAll).toHaveBeenCalled();
        expect(component.games).toEqual([]);
    });

    it('should sort by date', () => {
        component.games = [...MOCK_GAMES];
        component['isDateAscendingOrder'] = true;
        component.sort('date');
        expect(component.games).toEqual([...MOCK_GAMES].reverse());
        component['isDateAscendingOrder'] = false;
        component.sort('date');
        expect(component.games).toEqual(MOCK_GAMES);
    });

    it('should sort by name', () => {
        component.games = [...MOCK_GAMES];
        component['isNameAscendingOrder'] = true;
        component.sort('name');
        expect(component.games).toEqual([...MOCK_GAMES].reverse());
        component['isNameAscendingOrder'] = false;
        component.sort('name');
        expect(component.games).toEqual(MOCK_GAMES);
    });

    it('should get the appropriate icon', () => {
        component['isNameAscendingOrder'] = false;
        let res = component.getSortIcon('name');
        expect(res).toEqual('▼');
        component['isNameAscendingOrder'] = true;
        res = component.getSortIcon('name');
        expect(res).toEqual('▲');
        component['isDateAscendingOrder'] = true;
        res = component.getSortIcon('date');
        expect(res).toEqual('▲');
        component['isDateAscendingOrder'] = false;
        res = component.getSortIcon('date');
        expect(res).toEqual('▼');
    });

    it('should convert string date into number correctly', () => {
        const stringDate = '2023-11-15 19:45:35';
        const numberDate = 20231115194535;
        const res = component['convertDateToNumber'](stringDate);
        expect(res).toEqual(numberDate);
    });
});
