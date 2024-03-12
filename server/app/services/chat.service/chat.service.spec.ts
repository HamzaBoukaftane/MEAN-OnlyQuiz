/* eslint-disable max-lines */
import { Server } from '@app/server';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service/socket-manager.service';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import { Message } from '@common/interfaces/message.interface';
import { fillerQuizzes } from '@app/mock-data/data';
import { Game } from '@app/classes/game/game';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { HOST_USERNAME } from '@common/names/host-username';
import { RoomData } from '@app/interface/room-data-interface';

const RESPONSE_DELAY = 200;

describe('Chat service tests', () => {
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
    it('should handle "get messages" event', (done) => {
        roomManager.getRoomById.returns(mockRoom);
        const clientCallback = (messages: string[]) => {
            expect(messages).to.deep.equal(mockMessages);
            done();
        };
        clientSocket.emit(SocketEvent.GET_MESSAGES, mockRoomId, clientCallback);
    });
    it('should handle "get messages" event if messages is undefined', (done) => {
        roomManager.getRoomById.returns(undefined);
        const clientCallback = (messages?: string[]) => {
            expect(messages).to.equal(null);
            done();
        };
        clientSocket.emit(SocketEvent.GET_MESSAGES, mockRoomId, clientCallback);
    });
    it('should handle "get username" event', (done) => {
        roomManager.getUsernameBySocketId.returns(mockUsername);
        const clientCallback = (username: string) => {
            expect(roomManager.getSocketIdByUsername.calledWith(mockRoomId, clientSocket.id));
            expect(username).to.deep.equal(mockUsername);
            done();
        };
        clientSocket.emit(SocketEvent.GET_USERNAME, mockRoomId, clientCallback);
    });
    it('should handle "new message" event', (done) => {
        const newMessage: Message = { sender: 'user1', content: 'New message', time: 'time 1' };
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        setTimeout(() => {
            expect(emitSpy.called);
            expect(emitSpy.calledWith('message received'));
            expect(roomManager.addMessage.calledWith(mockRoomId, newMessage)).to.equal(true);
            done();
        }, RESPONSE_DELAY);
        clientSocket.emit(SocketEvent.NEW_MESSAGE, { roomId: mockRoomId, message: newMessage });
    });

    it('should toggle chat permission', (done) => {
        clientSocket.emit(SocketEvent.TOGGLE_CHAT_PERMISSION, { roomId: mockRoomId, username: mockUsername });
        setTimeout(() => {
            expect(roomManager.getUsernameBySocketId.called);
            done();
        }, RESPONSE_DELAY);
    });
});
