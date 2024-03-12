import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameHistoryService } from '@app/services/game-history.service/game-history.service';
import { GameInfo } from '@common/interfaces/game-info.interface';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let httpMock: HttpTestingController;
    const MOCK_GAMES: GameInfo[] = [
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

    const putAndPatchResponse = { status: 200, statusText: 'Game history updated successfully' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameHistoryService],
        });

        service = TestBed.inject(GameHistoryService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    const expectRequestTypeAndFlush = <T>(url: string, method: string, response: T extends object ? T : never) => {
        const req = httpMock.expectOne(`${service.baseUrl}${url}`);
        expect(req.request.method).toBe(method);
        req.flush(response);
    };

    it('should get all games in the game history', () => {
        service.getAll().subscribe((games) => {
            expect(games).toEqual(MOCK_GAMES);
        });
        expectRequestTypeAndFlush('/history', 'GET', MOCK_GAMES);
    });

    it('should delete the game history', () => {
        service.deleteAll().subscribe();
        expectRequestTypeAndFlush('/history', 'DELETE', putAndPatchResponse);
    });
});
