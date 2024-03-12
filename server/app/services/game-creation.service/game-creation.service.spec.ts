/* eslint-disable max-lines */
import { Server } from '@app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service/socket-manager.service';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import { Message } from '@common/interfaces/message.interface';
import { fillerQuizzes } from '@app/mock-data/data';
import { Game } from '@app/classes/game/game';
import { Answers } from '@app/interface/game-interface';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { HOST_USERNAME } from '@common/names/host-username';
import { RoomData } from '@app/interface/room-data-interface';

const RESPONSE_DELAY = 200;

describe('Game Creation service tests', () => {
    let service: SocketManager;
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
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
        roomManager = sinon.createStubInstance(RoomManagingService);
        roomManager['rooms'] = new Map([[mockRoomId, mockRoom]]);
        roomManager.addRoom.returns(mockRoomId);
        roomManager.getRoomById.returns(mockRoom);
        roomManager.getGameByRoomId.returns(gameMock);
        service['roomManager'] = roomManager;
    });
    afterEach(() => {
        clientSocket.disconnect();
        clientSocket.close();
        service['sio'].close();
        sinon.restore();
    });
    it('should handle a create Room event and return a room code', (done) => {
        const clientCallBack = (roomCode: number) => {
            expect(roomCode).to.equal(mockRoomId);
            done();
        };
        clientSocket.emit(SocketEvent.CREATE_ROOM, 'test', clientCallBack);
    });
    it('should handle a "player join" event when room is locked', (done) => {
        roomManager.isRoomLocked.returns(true);
        const clientCallBack = (isLocked: boolean) => {
            expect(isLocked).to.equal(true);
            done();
        };
        clientSocket.emit(SocketEvent.JOIN_GAME, { roomId: mockRoomId, username: mockUsername }, clientCallBack);
    });
    it('should handle a "player join" event when room is unlocked', (done) => {
        roomManager.getUsernamesArray.returns(['username1', 'username2']);
        const expectedPlayers = roomManager.getUsernamesArray(mockRoomId);
        roomManager.isRoomLocked.returns(false);
        const clientCallBack = () => {
            expect(roomManager.addUser.called);
            done();
        };
        clientSocket.emit(SocketEvent.JOIN_GAME, { roomId: mockRoomId, username: mockUsername }, clientCallBack);
        clientSocket.on(SocketEvent.NEW_PLAYER, (players: string[]) => {
            expect(players).to.deep.equal(expectedPlayers);
            done();
        });
    });
    it('should handle a player ban', (done) => {
        const spy = sinon.spy(service['sio'], 'to');
        roomManager.getSocketIdByUsername.returns('Test');
        clientSocket.emit(SocketEvent.BAN_PLAYER, { roomId: mockRoomId, username: mockUsername });
        setTimeout(() => {
            assert(spy.calledWith(String(mockRoomId)));
            assert(spy.calledWith('Test'));
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle a room lock toggle', (done) => {
        clientSocket.emit(SocketEvent.TOGGLE_ROOM_LOCK, mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle a room lock toggle', (done) => {
        const initialLockState = mockRoom.locked;
        roomManager.changeLockState.callsFake(() => {
            mockRoom.locked = !mockRoom.locked;
        });
        clientSocket.emit(SocketEvent.TOGGLE_ROOM_LOCK, mockRoomId);
        setTimeout(() => {
            const finalLockState = mockRoom.locked;
            expect(initialLockState).to.not.equal(finalLockState);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle a "validate username" event when name already in use', (done) => {
        roomManager.isNameUsed.returns(true);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(false);
            expect(data.error).to.equal('Le nom choisi est déjà utiliser. Veuillez choisir un autre.');
            done();
        };
        clientSocket.emit(SocketEvent.VALIDATE_USERNAME, { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should handle a "validate username" event when name is banned', (done) => {
        roomManager.isNameUsed.returns(false);
        roomManager.isNameBanned.returns(true);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(false);
            expect(data.error).to.equal('Vous avez été banni du lobby et vous ne pouvez plus rentrez.');
            done();
        };
        clientSocket.emit(SocketEvent.VALIDATE_USERNAME, { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should handle a "validate username" event when name is unused and not banned', (done) => {
        roomManager.isNameUsed.returns(false);
        roomManager.isNameBanned.returns(false);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(true);
            done();
        };
        clientSocket.emit(SocketEvent.VALIDATE_USERNAME, { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should validate good roomID properly', (done) => {
        const clientCallBack = (isValid: boolean) => {
            expect(isValid).to.deep.equal({ isRoom: true, isLocked: false });
            done();
        };
        clientSocket.emit(SocketEvent.VALIDATE_ROOM_ID, mockRoomId, clientCallBack);
    });
    it('should validate bad roomID properly', (done) => {
        const badRoomID = 123;
        const clientCallBack = (isValid: boolean) => {
            expect(isValid).to.deep.equal({ isRoom: false, isLocked: false });
            done();
        };
        clientSocket.emit(SocketEvent.VALIDATE_ROOM_ID, badRoomID, clientCallBack);
    });
    it('should handle "gather players username" event', (done) => {
        const players = Array.from(mockRoom?.players.keys());
        roomManager.getUsernamesArray.returns(players);
        const clientCallback = (playerNames: string[]) => {
            expect(playerNames).to.deep.equal(players);
            done();
        };
        clientSocket.emit(SocketEvent.GATHER_PLAYERS_USERNAME, mockRoomId, clientCallback);
    });

    it('should handle "player abandonment" event when undefined', (done) => {
        roomManager.removeUserBySocketId.returns(undefined);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(SocketEvent.PLAYER_LEFT, mockRoomId);
        setTimeout(() => {
            expect(emitSpy.notCalled);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when defined', (done) => {
        const answer: Answers = { answers: ['1'], time: 10 };
        roomManager.removeUserBySocketId.returns({ roomId: mockRoomId, username: 'username1' });
        gameMock.playersAnswers.set('test', answer);
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(SocketEvent.PLAYER_LEFT, mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when game undefined', (done) => {
        const answer: Answers = { answers: ['1'], time: 10 };
        roomManager.removeUserBySocketId.returns({ roomId: mockRoomId, username: 'username1' });
        gameMock.playersAnswers.set('test', answer);
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        roomManager.getGameByRoomId.returns(undefined);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(SocketEvent.PLAYER_LEFT, mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when players length = 0', (done) => {
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        roomManager.removeUserBySocketId.returns({ roomId: mockRoomId, username: 'username1' });
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(SocketEvent.PLAYER_LEFT, mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should call final time transition when every player abandoned', (done) => {
        gameMock.players.clear();
        roomManager.removeUserBySocketId.returns({ roomId: mockRoomId, username: 'username1' });
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(SocketEvent.PLAYER_LEFT, mockRoomId);
        setTimeout(() => {
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle "host abandonment" event when defined', (done) => {
        roomManager.deleteRoom.callsFake((roomId) => {
            roomManager['rooms'].delete(roomId);
        });
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(SocketEvent.HOST_LEFT, mockRoomId);
        setTimeout(() => {
            expect(emitSpy.called);
            expect(roomManager['rooms'].has(mockRoomId)).to.equal(false);
            done();
        }, RESPONSE_DELAY);
    });
});
