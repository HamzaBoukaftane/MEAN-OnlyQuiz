import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { SinonStubbedInstance } from 'sinon';
import * as sinon from 'sinon';
import { TimerService } from '@app/services/timer.service/timer.service';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import { SocketManager } from '@app/services/socket-manager.service/socket-manager.service';
import { Server } from '@app/server';
import { io as ioClient, Socket } from 'socket.io-client';
import { GameCreationService } from '@app/services/game-creation.service/game-creation.service';
import { GameManagementService } from '@app/services/game-management.service/game-management.service';
import { ChatService } from '@app/services/chat.service/chat.service';
import { Container } from 'typedi';
import { Game } from '@app/classes/game/game';
import { fillerQuizzes } from '@app/mock-data/data';
import { HOST_USERNAME } from '@common/names/host-username';
import { Message } from '@common/interfaces/message.interface';
import { RoomData } from '@app/interface/room-data-interface';
import { ONE_SECOND_DELAY } from '@common/constants/socket-manager.service.const';

describe('Timer service tests', () => {
    let timerService: TimerService;
    let socketManager: SocketManager;
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';
    let roomManager: SinonStubbedInstance<RoomManagingService>;
    let gameCreationService: SinonStubbedInstance<GameCreationService>;
    let gameManagingService: SinonStubbedInstance<GameManagementService>;
    let chatService: SinonStubbedInstance<ChatService>;
    const mockRoomId = 1000;
    const mockMessages: Message[] = [{ sender: 'user 1', content: 'message 1', time: 'time 1' }];
    let mockRoom: RoomData;
    let gameMock: sinon.SinonStubbedInstance<Game>;

    beforeEach(async () => {
        gameMock = sinon.createStubInstance(Game);
        gameMock.paused = false;
        gameMock.quiz = fillerQuizzes[0];
        gameMock.currentQuizQuestion = fillerQuizzes[0].questions[0];
        gameMock.players = new Map();
        gameMock.playersAnswers = new Map();
        gameMock.players.set('test', { points: 0, bonusCount: 0, isBonus: false });
        gameMock.paused = true;
        mockRoom = {
            room: mockRoomId,
            quizId: 'quiz123',
            players: new Map([
                [HOST_USERNAME, 'socket organisateur'],
                ['username1', 'socketId1'],
                ['username2', 'socketId2'],
            ]),
            locked: false,
            game: gameMock,
            bannedNames: ['John', 'Alice'],
            messages: mockMessages,
            timer: null,
        };
        sinon.stub(console, 'log');
        server = Container.get(Server);
        await server.init();
        socketManager = server['socketManager'];
        clientSocket = ioClient(urlString);
        roomManager = sinon.createStubInstance(RoomManagingService);
        gameCreationService = sinon.createStubInstance(GameCreationService);
        gameManagingService = sinon.createStubInstance(GameManagementService);
        chatService = sinon.createStubInstance(ChatService);
        socketManager['roomManager'] = roomManager;
        socketManager['roomManager']['rooms'] = new Map([[1, mockRoom]]);
        socketManager['gameCreationService'] = gameCreationService;
        socketManager['gameManagementService'] = gameManagingService;
        socketManager['chatService'] = chatService;
        timerService = new TimerService(socketManager['roomManager'], socketManager['sio']);
        roomManager.getRoomById.returns(mockRoom);
        roomManager.getGameByRoomId.returns(gameMock);
    });

    afterEach(() => {
        clientSocket.disconnect();
        clientSocket.close();
        socketManager['sio'].close();
        sinon.restore();
    });

    it('should do nothing if game is paused', (done) => {
        const mockTimeValue = 5;
        const mockEventName = 'customEvent';
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const emitSpy = sinon.spy(timerService, 'emitTime' as any);
        timerService.startTimer({ roomId: mockRoomId, time: mockTimeValue }, mockEventName);
        setTimeout(() => {
            expect(emitSpy.notCalled);
            done();
        }, ONE_SECOND_DELAY);
    });

    it('should emit time if game is not paused', (done) => {
        const mockTimeValue = 5;
        const mockEventName = 'customEvent';
        gameMock.paused = false;
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const emitSpy = sinon.spy(timerService, 'emitTime' as any);
        timerService.startTimer({ roomId: mockRoomId, time: mockTimeValue }, mockEventName);
        setTimeout(() => {
            expect(emitSpy.called);
            done();
        }, ONE_SECOND_DELAY);
    });
});
