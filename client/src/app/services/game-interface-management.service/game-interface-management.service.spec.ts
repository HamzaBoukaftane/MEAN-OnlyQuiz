import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { TransportStatsFormat } from '@common/constants/host-interface.component.const';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { QrlResponseAreaComponent } from '@app/components/qrl-response-area/qrl-response-area.component';
import { StatisticHistogramComponent } from '@app/components/statistic-histogram/statistic-histogram.component';
import { question } from '@common/constants/statistic-zone.component.const';
import { GameInterfaceManagementService } from '@app/services/game-interface-management.service/game-interface-management.service';
import { GameService } from '@app/services/game.service/game.service';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { TimerMessage } from '@common/browser-message/displayable-message/timer-message';
import { QuestionType } from '@common/enums/question-type.enum';
import { Score } from '@common/interfaces/score.interface';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';

describe('GameInterfaceManagementService', () => {
    let service: GameInterfaceManagementService;
    let socketService: SocketClientServiceTestHelper;
    let onSpy: jasmine.Spy;
    let sendSpy: jasmine.Spy;
    const mockQuestion = {
        type: QuestionType.QCM,
        text: 'What is the capital of France?',
        points: 10,
        choices: [
            { text: 'Paris', isCorrect: true },
            { text: 'Berlin', isCorrect: false },
            { text: 'Madrid', isCorrect: false },
        ],
    };
    const mockScore: Score = {
        points: 1,
        bonusCount: 1,
        isBonus: true,
    };
    const mockTimeValue = 123;
    const mockRoomIdValue = 100;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [PlayerListComponent, QrlResponseAreaComponent, StatisticHistogramComponent],
            providers: [
                SocketClientService,
                GameService,
                InteractiveListSocketService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' }, url: [{ path: 'url-path' }] } } },
            ],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        service = TestBed.inject(GameInterfaceManagementService);
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        onSpy = spyOn(socketService, 'on').and.callThrough();
        sendSpy = spyOn(socketService, 'send').and.callThrough();
        spyOn(service['interactiveListService'], 'getPlayersList');
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should setup service correctly', () => {
        service.gameService.isTestMode = true;
        spyOn(service.gameService, 'init');
        spyOn(service, 'configureBaseSocketFeatures');
        spyOn(service['socketService'], 'disconnect');
        service.setup('');
        expect(service['socketService'].isSocketAlive).toHaveBeenCalledTimes(2);
        expect(service['socketService'].disconnect).toHaveBeenCalled();
        expect(service.gameService.init).toHaveBeenCalledWith('');
        expect(service.configureBaseSocketFeatures).toHaveBeenCalled();
    });

    it('should reset properly', () => {
        service.reset();
        expect(service.players).toEqual([]);
        expect(service.isGameOver).toBeFalsy();
        expect(service.isBonus).toBeFalsy();
        expect(service.inPanicMode).toBeFalsy();
        expect(service.playerScore).toEqual(0);
        expect(service.gameStats).toEqual([]);
        expect(service.timerText).toEqual(TimerMessage.TIME_LEFT);
    });

    it('should configure base socket features for end question correctly', () => {
        mockQuestion.type = QuestionType.QCM;
        service.gameService.gameRealService.roomId = 1;
        service.gameService.gameRealService.question = mockQuestion;
        service.gameService.gameRealService.username = 'test';
        spyOnProperty(service.gameService, 'username', 'get').and.returnValue('test');
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[0];
        expect(socketOnText).toEqual(SocketEvent.END_QUESTION);
        socketOnFunc();
        const [sendText, sendObject, sendCallback] = sendSpy.calls.allArgs()[0];
        expect(sendText).toEqual(SocketEvent.GET_SCORE);
        expect(sendObject).toEqual({ roomId: 1, username: 'test' });
        sendCallback(mockScore);
        expect(service.playerScore).toEqual(mockScore.points);
        expect(service.isBonus).toEqual(mockScore.isBonus);
        service.gameService.gameRealService.question = mockQuestion;
        service.gameService.gameRealService.question.type = QuestionType.QRL;
        socketOnFunc();
        expect(service.gameService.qrlAnswer).toEqual('');
        expect(service.gameService.gameRealService.validated).toBeTruthy();
    });

    it('should configure base socket features for time transition correctly', () => {
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[2];
        expect(socketOnText).toEqual(SocketEvent.TIME_TRANSITION);
        socketOnFunc(mockTimeValue);
        expect(service.gameService.timer).toEqual(mockTimeValue);
        socketOnFunc(0);
        expect(service.gameService.lockedStatus).toEqual(false);
        expect(service.gameService.validatedStatus).toEqual(false);
        expect(service.isBonus).toEqual(false);
    });

    it('should configure base socket features for end of evaluation QRL', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getScoreSpy = spyOn(service, 'getScore' as any);
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[1];
        expect(socketOnText).toEqual(SocketEvent.EVALUATION_OVER);
        socketOnFunc();
        expect(getScoreSpy).toHaveBeenCalled();
    });

    it('should configure base socket features for final time transition correctly', () => {
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[3];
        expect(socketOnText).toEqual(SocketEvent.FINAL_TIME_TRANSITION);
        socketOnFunc(mockTimeValue);
        expect(service.gameService.timer).toEqual(mockTimeValue);
        socketOnFunc(0);
        expect(service.isGameOver).toEqual(true);
    });

    it('should configure base socket features for removed from game correctly', () => {
        const routerSpy = spyOn(service['router'], 'navigate');
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[4];
        expect(socketOnText).toEqual(SocketEvent.REMOVED_FROM_GAME);
        socketOnFunc();
        expect(routerSpy).toHaveBeenCalledWith(['/']);
    });

    it('should configure base socket features for play audio correctly', () => {
        const audioSpy = spyOn(service.gameService.audio, 'play');
        service.gameService.gameRealService.timer = mockTimeValue;
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[5];
        expect(socketOnText).toEqual(SocketEvent.PANIC_MODE);
        socketOnFunc({ roomId: mockRoomIdValue, timer: mockTimeValue });
        expect(service.gameService.timer).toEqual(mockTimeValue);
        expect(audioSpy).toHaveBeenCalled();
    });

    it('should configure base socket features for pausing the audio', () => {
        const audioSpy = spyOn(service.gameService.audio, 'play');
        service.gameService.gameRealService.audioPaused = true;
        service.inPanicMode = true;
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[6];
        expect(socketOnText).toEqual(SocketEvent.PAUSE_TIMER);
        socketOnFunc(mockRoomIdValue);
        expect(service.gameService.gameRealService.audioPaused).toBeFalsy();
        expect(audioSpy).toHaveBeenCalled();
    });

    it('should configure base socket features for Unpausing the audio', () => {
        const audioSpy = spyOn(service.gameService.audio, 'pause');
        service.gameService.gameRealService.audioPaused = false;
        service.inPanicMode = true;
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[6];
        expect(socketOnText).toEqual(SocketEvent.PAUSE_TIMER);
        socketOnFunc(mockRoomIdValue);
        expect(service.gameService.gameRealService.audioPaused).toBeTruthy();
        expect(audioSpy).toHaveBeenCalled();
    });

    it('should configure base socket features for removed from game correctly', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const unpackSpy = spyOn(service, 'unpackStats' as any);
        const parseSpy = spyOn(service, 'parseGameStats' as any);
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        service['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[7];
        expect(socketOnText).toEqual(SocketEvent.GAME_STATUS_DISTRIBUTION);
        socketOnFunc();
        expect(parseSpy).toHaveBeenCalled();
        expect(unpackSpy).toHaveBeenCalled();
    });

    it('should correctly update player points', () => {
        const expectedPercentage = 50;
        service.gameService.isTestMode = false;
        service.gameService.gameRealService.question = mockQuestion;
        mockQuestion.type = QuestionType.QRL;
        const score = service.playerScore + mockQuestion.points / 2;
        service['updateScore'](score);
        expect(service.gameService.lastQrlScore).toEqual(expectedPercentage);
    });

    it('should parse game stats correctly', () => {
        const statsString = '{"stats": "some stats"}';
        const parsedStats = service['parseGameStats'](statsString);
        expect(parsedStats).toEqual({ stats: 'some stats' });
    });

    it('should unpack game stats correctly', () => {
        const stats: TransportStatsFormat = [
            [
                [
                    ['value1', true],
                    ['value2', false],
                ],
                [
                    ['response1', 0],
                    ['response2', 0],
                ],
                question,
            ],
        ];
        service['unpackStats'](stats);
        expect(service.gameStats.length).toBe(1);
    });
});
