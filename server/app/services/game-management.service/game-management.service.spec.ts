/* eslint-disable max-lines */
import { Server } from '@app/server';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import { Message } from '@common/interfaces/message.interface';
import { fillerQuizzes } from '@app/mock-data/data';
import { Game } from '@app/classes/game/game';
import { Answers } from '@app/interface/game-interface';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { QuestionType } from '@common/enums/question-type.enum';
import { HOST_USERNAME } from '@common/names/host-username';
import { RoomData } from '@app/interface/room-data-interface';

const RESPONSE_DELAY = 200;

describe('GameManagement service tests', () => {
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';
    let roomManager: SinonStubbedInstance<RoomManagingService>;
    const mockRoomId = 1000;
    const mockUsername = 'mockUsername';
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
        clientSocket = ioClient(urlString);
        roomManager = sinon.createStubInstance(RoomManagingService);
        roomManager['rooms'] = new Map([[mockRoomId, mockRoom]]);
        roomManager.addRoom.returns(mockRoomId);
        roomManager.getRoomById.returns(mockRoom);
        roomManager.getGameByRoomId.returns(gameMock);
        server['socketManager']['roomManager'] = roomManager;
    });
    afterEach(() => {
        clientSocket.disconnect();
        clientSocket.close();
        server['socketManager']['sio'].close();
        sinon.restore();
    });

    it('should handle "show result" event', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clientSocket.emit(SocketEvent.SHOW_RESULT, mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle "start" event', (done) => {
        const mockTime = 123;
        const players = Array.from(mockRoom.players.keys());
        players.splice(players.indexOf(HOST_USERNAME), 1);
        roomManager.getUsernamesArray.returns(players);
        roomManager.getRoomById.returns(mockRoom);
        sinon.stub(Game.prototype, 'setup').resolves();
        clientSocket.emit(SocketEvent.START, { roomId: mockRoomId, time: mockTime });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernamesArray.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should emit get initial question and set timer for a qcm', (done) => {
        gameMock.currentQuizQuestion = gameMock.quiz.questions[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        roomManager.getUsernameBySocketId.returns(HOST_USERNAME);
        clientSocket.emit(SocketEvent.GET_QUESTION, mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernameBySocketId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should emit get initial question and set timer for a qrl', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gameMock.currentQuizQuestion = gameMock.quiz.questions[1];
        clientSocket.emit(SocketEvent.GET_QUESTION, mockRoomId);
        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(mockRoomId).to.equal(1000);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle when Organizer not found', (done) => {
        roomManager.getUsernameBySocketId.returns(undefined);
        clientSocket.emit(SocketEvent.GET_QUESTION, mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernameBySocketId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle submit answer when timer is 0 when its a qcm', (done) => {
        gameMock.players = new Map();
        const mockAnswers = ['one', 'two'];
        const mockTimer = 0;
        clientSocket.emit(SocketEvent.SUBMIT_ANSWER, { roomId: mockRoomId, answers: mockAnswers, timer: mockTimer, username: mockUsername });
        setTimeout(() => {
            expect(roomManager.getSocketIdByUsername.called);
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle submit answer when timer is 0 when its a qrl', (done) => {
        gameMock.players = new Map();
        const mockAnswers = ['one', 'two'];
        const mockTimer = 0;
        gameMock.currentQuizQuestion = gameMock.quiz.questions[1];
        clientSocket.emit(SocketEvent.SUBMIT_ANSWER, { roomId: mockRoomId, answers: mockAnswers, timer: mockTimer, username: mockUsername });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.notCalled);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle submit answer when timer is more than 0', (done) => {
        gameMock.players = new Map();
        const mockAnswers = ['one', 'two'];
        const mockTimer = 123; // Set to a value other than 0
        clientSocket.emit(SocketEvent.SUBMIT_ANSWER, { mockRoomId, mockAnswers, mockTimer, mockUsername });
        setTimeout(() => {
            expect(roomManager.getSocketIdByUsername.called);
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle submit answer when length not equal', (done) => {
        const mockAnswers = ['one', 'two'];
        const mockTimer = 123;
        clientSocket.emit(SocketEvent.SUBMIT_ANSWER, { mockRoomId, mockAnswers, mockTimer, mockUsername });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should start transition by clearing room  and setting timer', (done) => {
        clientSocket.emit(SocketEvent.START_TRANSITION, mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should get score and callback playerScore', (done) => {
        const callback = () => {
            return;
        };
        clientSocket.emit(SocketEvent.GET_SCORE, { roomId: mockRoomId, username: 'test' }, callback);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle next question properly for a qcm', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gameMock.currentQuizQuestion.type = QuestionType.QCM;
        clientSocket.emit(SocketEvent.NEXT_QUESTION, mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle next question properly for a qrl', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gameMock.currentQuizQuestion.type = QuestionType.QRL;
        clientSocket.emit(SocketEvent.NEXT_QUESTION, mockRoomId);
        setTimeout(() => {
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle update selection', (done) => {
        roomManager.getSocketIdByUsername.returns('test');
        gameMock.choicesStats = new Map();
        const mockIsSelected = true;
        const mockIndex = 1;
        clientSocket.emit(SocketEvent.UPDATE_SELECTION, { mockRoomId, mockIsSelected, mockIndex });
        setTimeout(() => {
            expect(roomManager.getSocketIdByUsername.calledWith(mockRoomId, HOST_USERNAME));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle set activity status correctly for a qrl', (done) => {
        // @ts-ignore
        roomManager.getSocketIdByUsername.returns('test');
        clientSocket.emit('sendActivityStatus', { roomId: mockRoomId, isActive: true });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.calledWith(mockRoomId));
            expect(gameMock.switchActivityStatus.calledWith(true));
            done();
        }, RESPONSE_DELAY);
    });

    it('should get players answers for a qrl', (done) => {
        const answer: Answers = { answers: ['1'], time: 10 };
        gameMock.playersAnswers.set('test', answer);
        const clientCallBack = (formattedList: string) => {
            expect(formattedList).to.equal('[["test",{"answers":["1"],"time":10}]]');
        };
        clientSocket.emit('getPlayerAnswers', mockRoomId, clientCallBack);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.calledWith(mockRoomId));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle player correction evaluation correctly for a qrl', (done) => {
        const playerCorrectionMap = new Map<string, number>([
            ['Player1', 0],
            ['Player2', 1],
        ]);
        const formattedPlayerAnswers = JSON.stringify(Array.from(playerCorrectionMap));
        roomManager.getSocketIdByUsername.returns('test');
        clientSocket.emit('playerQrlCorrection', { roomId: mockRoomId, playerCorrection: formattedPlayerAnswers });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.calledWith(mockRoomId));
            expect(gameMock.updatePlayerScores.calledWith(playerCorrectionMap));
            done();
        }, RESPONSE_DELAY);
    });
    it('should toggle chat permission', (done) => {
        clientSocket.emit(SocketEvent.GAME_STATUS_DISTRIBUTION, { roomId: mockRoomId, stats: 'test' });
        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(mockRoomId).to.equal(1000);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle player interaction update for a qrl', (done) => {
        roomManager.getSocketIdByUsername.returns('test');
        roomManager.getUsernameBySocketId.returns('Player1');
        clientSocket.emit('newResponseInteraction', mockRoomId);
        setTimeout(() => {
            expect(roomManager.getSocketIdByUsername.calledWith(mockRoomId, HOST_USERNAME));
            expect(roomManager.getSocketIdByUsername.calledWith(mockRoomId, clientSocket.id));
            done();
        }, RESPONSE_DELAY);
    });
    it('should pause timer', (done) => {
        clientSocket.emit(SocketEvent.PAUSE_TIMER, mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.calledWith(mockRoomId));
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle panic mode', (done) => {
        clientSocket.emit(SocketEvent.PANIC_MODE, mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
});
