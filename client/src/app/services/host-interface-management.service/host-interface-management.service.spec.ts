/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { ACTIVE, INACTIVE } from '@common/constants/host-interface.component.const';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game.service/game.service';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { TimerMessage } from '@common/browser-message/displayable-message/timer-message';
import { QuestionType } from '@common/enums/question-type.enum';
import { HOST_USERNAME } from '@common/names/host-username';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { HostInterfaceManagementService } from './host-interface-management.service';

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('HostInterfaceManagementServiceService', () => {
    let service: HostInterfaceManagementService;
    let socketService: SocketClientServiceTestHelper;
    let gameService: GameService;
    let interactiveListService: InteractiveListSocketService;
    let sendSpy: jasmine.Spy;
    let onSpy: jasmine.Spy;
    let getPlayerListSpy: jasmine.Spy;
    const mockValuesMap = new Map([
        ['Paris', true],
        ['Berlin', false],
        ['Madrid', false],
    ]);
    const mockResponseMap = new Map([
        ['Paris', 0],
        ['Berlin', 0],
        ['Madrid', 0],
    ]);
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
    const mockTimeValue = 123;
    const mockRoomIdValue = 100;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, HttpClientModule, AppMaterialModule],
            providers: [InteractiveListSocketService, SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        service = TestBed.inject(HostInterfaceManagementService);
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        gameService = TestBed.inject(GameService);
        interactiveListService = TestBed.inject(InteractiveListSocketService);
        sendSpy = spyOn(socketService, 'send').and.callThrough();
        onSpy = spyOn(socketService, 'on').and.callThrough();
        getPlayerListSpy = spyOn(interactiveListService, 'getPlayersList');
        gameService.gameRealService.question = mockQuestion;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send pause signal to server', () => {
        service.isPaused = false;
        gameService.gameRealService.roomId = 0;
        service.sendPauseTimer();
        const [eventName, data] = sendSpy.calls.mostRecent().args;
        expect(service.isPaused).toBeTruthy();
        expect(eventName).toEqual(SocketEvent.PAUSE_TIMER);
        expect(data).toEqual(0);
    });

    it('should start panic mode', () => {
        service.isPanicMode = false;
        gameService.gameRealService.roomId = 0;
        gameService.gameRealService.timer = 1;
        service.startPanicMode();
        const [eventName, data] = sendSpy.calls.mostRecent().args;
        expect(service.isPanicMode).toBeTruthy();
        expect(eventName).toEqual(SocketEvent.PANIC_MODE);
        expect(data).toEqual({ roomId: 0, timer: 1 });
    });

    it('should save stats correctly', () => {
        service.gameStats = [];
        service.histogramDataValue = mockValuesMap;
        service.histogramDataChangingResponses = mockResponseMap;
        service.saveStats();
        expect(service.gameStats).toEqual([[mockValuesMap, mockResponseMap, mockQuestion]]);
    });

    it('should request next question correctly', () => {
        service.isPanicMode = true;
        gameService.gameRealService.roomId = 0;
        service.requestNextQuestion();
        const [eventName, data] = sendSpy.calls.mostRecent().args;
        expect(service.isPanicMode).toBeFalsy();
        expect(eventName).toEqual(SocketEvent.START_TRANSITION);
        expect(data).toEqual(0);
    });

    it('should handle last question correctly', () => {
        const sendGameStatsSpy = spyOn(service, 'sendGameStats' as any);
        service.isPanicMode = true;
        gameService.gameRealService.roomId = 0;
        service.handleLastQuestion();
        const [eventName, data] = sendSpy.calls.mostRecent().args;
        expect(sendGameStatsSpy).toHaveBeenCalled();
        expect(eventName).toEqual(SocketEvent.SHOW_RESULT);
        expect(data).toEqual(0);
    });

    it('should configure sockets correctly', () => {
        const resetSpy = spyOn(service, 'reset' as any);
        const handleTimeTransitionSpy = spyOn(service, 'handleTimeTransition' as any);
        const handleEndQuestionSpy = spyOn(service, 'handleEndQuestion' as any);
        const handleFinalTimeTransitionSpy = spyOn(service, 'handleFinalTimeTransition' as any);
        const handleRefreshChoicesStatsSpy = spyOn(service, 'handleRefreshChoicesStats' as any);
        const handleGetInitialQuestionSpy = spyOn(service, 'handleGetInitialQuestion' as any);
        const handleGetNextQuestionSpy = spyOn(service, 'handleGetNextQuestion' as any);
        const handleRemovedPlayerSpy = spyOn(service, 'handleRemovedPlayer' as any);
        const handleEndQuestionAfterRemovalSpy = spyOn(service, 'handleEndQuestionAfterRemoval' as any);
        const handleEvaluationOverSpy = spyOn(service, 'handleEvaluationOver' as any);
        const handleRefreshActivityStatsSpy = spyOn(service, 'handleRefreshActivityStats' as any);
        service.configureBaseSocketFeatures();
        expect(resetSpy).toHaveBeenCalled();
        expect(handleTimeTransitionSpy).toHaveBeenCalled();
        expect(handleEndQuestionSpy).toHaveBeenCalled();
        expect(handleFinalTimeTransitionSpy).toHaveBeenCalled();
        expect(handleRefreshChoicesStatsSpy).toHaveBeenCalled();
        expect(handleGetInitialQuestionSpy).toHaveBeenCalled();
        expect(handleGetNextQuestionSpy).toHaveBeenCalled();
        expect(handleRemovedPlayerSpy).toHaveBeenCalled();
        expect(handleEndQuestionAfterRemovalSpy).toHaveBeenCalled();
        expect(handleEvaluationOverSpy).toHaveBeenCalled();
        expect(handleRefreshActivityStatsSpy).toHaveBeenCalled();
    });

    it('should handle time transition correctly', () => {
        service.gameService.gameRealService.roomId = 0;
        service['handleTimeTransition']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.TIME_TRANSITION);
        if (typeof action === 'function') {
            action(0);
            const [secondEventName, data] = sendSpy.calls.mostRecent().args;
            expect(secondEventName).toEqual(SocketEvent.NEXT_QUESTION);
            expect(data).toEqual(0);
        }
    });

    it('should handle end question correctly', () => {
        const sendQrlAnswerSpy = spyOn(service, 'sendQrlAnswer' as any);
        service['handleEndQuestion']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.END_QUESTION);
        if (typeof action === 'function') {
            action();
            expect(getPlayerListSpy).toHaveBeenCalled();
            expect(sendQrlAnswerSpy).not.toHaveBeenCalled();
            gameService.gameRealService.question = null;
            getPlayerListSpy.calls.reset();
            sendQrlAnswerSpy.calls.reset();
            action();
            expect(getPlayerListSpy).not.toHaveBeenCalled();
            expect(sendQrlAnswerSpy).toHaveBeenCalled();
        }
    });

    it('should handle final time transition correctly', () => {
        gameService.gameRealService.username = HOST_USERNAME;
        service['handleFinalTimeTransition']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.FINAL_TIME_TRANSITION);
        if (typeof action === 'function') {
            action(0);
            expect(getPlayerListSpy).toHaveBeenCalled();
        }
    });

    it('should handle refresh choices stats correctly', () => {
        const createChoicesStatsMapSpy = spyOn(service, 'createChoicesStatsMap' as any);
        service['handleRefreshChoicesStats']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.REFRESH_CHOICES_STATS);
        if (typeof action === 'function') {
            action([1, 1]);
            expect(createChoicesStatsMapSpy).toHaveBeenCalled();
        }
    });

    it('should handle get initial question correctly', async () => {
        const initGraphSpy = spyOn(service, 'initGraph' as any);
        service['handleGetInitialQuestion']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.GET_INITIAL_QUESTION);
        if (typeof action === 'function') {
            await action({
                question: mockQuestion,
                index: 0,
                isLast: true,
                numberOfQuestions: 0,
            });
            expect(getPlayerListSpy).toHaveBeenCalled();
            expect(initGraphSpy).toHaveBeenCalled();
        }
    });

    it('should handle get next question correctly', async () => {
        const initGraphSpy = spyOn(service, 'initGraph' as any);
        service['handleGetNextQuestion']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.GET_NEXT_QUESTION);
        if (typeof action === 'function') {
            await action({
                question: mockQuestion,
                index: 0,
                isLast: true,
            });
            expect(getPlayerListSpy).toHaveBeenCalled();
            expect(initGraphSpy).toHaveBeenCalled();
        }
    });

    it('should handle removed player correctly', () => {
        service['handleRemovedPlayer']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.REMOVED_PLAYER);
        if (typeof action === 'function') {
            interactiveListService.players = [['test', 0, 0, 'test', false]];
            action('test');
            expect(getPlayerListSpy).toHaveBeenCalled();
        }
    });

    it('should handle end question after removal correctly', () => {
        const resetSpy = spyOn(service, 'resetInterface' as any);
        service['handleEndQuestionAfterRemoval']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.END_QUESTION_AFTER_REMOVAL);
        if (typeof action === 'function') {
            action();
            expect(resetSpy).toHaveBeenCalled();
        }
    });

    it('should handle evaluation over correctly', () => {
        service['handleEvaluationOver']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.EVALUATION_OVER);
        if (typeof action === 'function') {
            action();
            expect(getPlayerListSpy).toHaveBeenCalled();
        }
    });

    it('should handle evaluation over correctly', () => {
        service.histogramDataChangingResponses = mockResponseMap;
        service['handleRefreshActivityStats']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.REFRESH_ACTIVITY_STATS);
        if (typeof action === 'function') {
            action([0, 0]);
            const map = new Map([
                [ACTIVE, 0],
                [INACTIVE, 0],
            ]);
            expect(service.histogramDataChangingResponses).toEqual(map);
        }
    });

    it('should initialize correctly histogram data when QCM', () => {
        const expectedMapChanginResponses = new Map();
        gameService.gameRealService.question = mockQuestion;
        service['initGraph'](mockQuestion);
        expect(service.histogramDataValue).toEqual(mockValuesMap);
        expect(service.histogramDataChangingResponses).toEqual(expectedMapChanginResponses);
    });

    it('should initialize correctly histogram data when QRL', () => {
        const expectedMapChanginResponses = new Map([
            [ACTIVE, 0],
            [INACTIVE, undefined],
        ]);
        const expectedDataValueMap = new Map([
            [ACTIVE, true],
            [INACTIVE, false],
        ]);
        gameService.gameRealService.question = null;
        service['initGraph'](mockQuestion);
        expect(service.histogramDataValue).toEqual(expectedDataValueMap);
        expect(service.histogramDataChangingResponses).toEqual(expectedMapChanginResponses);
    });

    it('should create choices stats map correctly', () => {
        const posRes = service['createChoicesStatsMap']([0, 0, 0]);
        const expectedMap = new Map([
            ['Paris', 0],
            ['Berlin', 0],
            ['Madrid', 0],
        ]);
        expect(posRes).toEqual(expectedMap);
    });

    it('should send Qrl Answer', () => {
        service.isHostEvaluating = false;
        gameService.gameRealService.roomId = 0;
        service['sendQrlAnswer']();
        const [eventName, data, callback] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.GET_PLAYER_ANSWERS);
        expect(data).toEqual(0);
        if (typeof callback === 'function') {
            spyOn(JSON, 'parse').and.returnValue([['0', { answer: 'test', time: 0 }]]);
            callback();
            expect(service.responsesQRL).toEqual(new Map<string, { answer: string; time: number }>([['0', { answer: 'test', time: 0 }]]));
        }
    });

    it('should send game stats', () => {
        gameService.gameRealService.roomId = 1;
        spyOn(service, 'stringifyStats' as any).and.returnValue('test');
        service['sendGameStats']();
        const [eventName, data] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.GAME_STATUS_DISTRIBUTION);
        expect(data).toEqual({ roomId: 1, stats: 'test' });
    });

    it('should stringify correctly', () => {
        service.gameStats = [
            [
                new Map<string, boolean>([
                    ['value1', true],
                    ['value2', false],
                ]),
                new Map<string, number>([
                    ['response1', 0],
                    ['response2', 0],
                ]),
                mockQuestion,
            ],
        ];
        const test = service['stringifyStats']();
        expect(test).toEqual(
            '[[[["value1",true],["value2",false]],[["response1",0],["response2",0]],{"type":0,"text":"What is ' +
                'the capital of France?","points":10,"choices":[{"text":"Paris","isCorrect":true},{"text":"Berlin","isCorrect"' +
                ':false},{"text":"Madrid","isCorrect":false}]}]]',
        );
    });

    it('should configure base socket features for play audio correctly', () => {
        const audioSpy = spyOn(service.gameService.audio, 'play');
        service.gameService.gameRealService.timer = mockTimeValue;
        service['handleHostPanicMode']();
        const [socketOnText, socketOnFunc] = onSpy.calls.mostRecent().args;
        expect(socketOnText).toEqual(SocketEvent.PANIC_MODE);
        socketOnFunc({ roomId: mockRoomIdValue, timer: mockTimeValue });
        expect(service.gameService.timer).toEqual(mockTimeValue);
        expect(audioSpy).toHaveBeenCalled();
    });

    it('should configure base socket features for pausing the audio', () => {
        const audioSpy = spyOn(service.gameService.audio, 'play');
        service.gameService.gameRealService.audioPaused = true;
        service.isPanicMode = true;
        service['handleHostTimerPause']();
        const [socketOnText, socketOnFunc] = onSpy.calls.mostRecent().args;
        expect(socketOnText).toEqual(SocketEvent.PAUSE_TIMER);
        socketOnFunc(mockRoomIdValue);
        expect(service.gameService.gameRealService.audioPaused).toBeFalsy();
        expect(audioSpy).toHaveBeenCalled();
    });

    it('should configure base socket features for Unpausing the audio', () => {
        const audioSpy = spyOn(service.gameService.audio, 'pause');
        service.gameService.gameRealService.audioPaused = false;
        service.isPanicMode = true;
        service['handleHostTimerPause']();
        const [socketOnText, socketOnFunc] = onSpy.calls.mostRecent().args;
        expect(socketOnText).toEqual(SocketEvent.PAUSE_TIMER);
        socketOnFunc(mockRoomIdValue);
        expect(service.gameService.gameRealService.audioPaused).toBeTruthy();
        expect(audioSpy).toHaveBeenCalled();
    });

    it('should prepare stats transport correctly', () => {
        service.gameStats = [
            [
                new Map<string, boolean>([
                    ['value1', true],
                    ['value2', false],
                ]),
                new Map<string, number>([
                    ['response1', 0],
                    ['response2', 0],
                ]),
                mockQuestion,
            ],
        ];
        const preparedStats = service['prepareStatsTransport']();
        expect(preparedStats).toEqual([
            [
                [
                    ['value1', true],
                    ['value2', false],
                ],
                [
                    ['response1', 0],
                    ['response2', 0],
                ],
                mockQuestion,
            ],
        ]);
    });

    it('should reset service properley', () => {
        service['reset']();
        expect(service.timerText).toEqual(TimerMessage.TIME_LEFT);
        expect(service.isGameOver).toBeFalsy();
        expect(service.histogramDataChangingResponses).toEqual(new Map<string, number>());
        expect(service.histogramDataValue).toEqual(new Map<string, boolean>());
        expect(service.leftPlayers).toEqual([]);
        expect(service.responsesQRL).toEqual(new Map<string, { answers: string; time: number }>());
        expect(service.isHostEvaluating).toBeFalsy();
        expect(service.gameStats).toEqual([]);
        expect(service.isPaused).toBeFalsy();
        expect(service.isPanicMode).toBeFalsy();
    });
});
