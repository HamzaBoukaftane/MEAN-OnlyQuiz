import { Server } from '@app/server';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service/socket-manager.service';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';

import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { GameCreationService } from '@app/services/game-creation.service/game-creation.service';
import { GameManagementService } from '@app/services/game-management.service/game-management.service';
import { ChatService } from '@app/services/chat.service/chat.service';

const RESPONSE_DELAY = 200;

describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';
    let roomManager: SinonStubbedInstance<RoomManagingService>;
    let gameCreationService: SinonStubbedInstance<GameCreationService>;
    let gameManagingService: SinonStubbedInstance<GameManagementService>;
    let chatService: SinonStubbedInstance<ChatService>;

    beforeEach(async () => {
        sinon.stub(console, 'log');
        server = Container.get(Server);
        await server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
        roomManager = sinon.createStubInstance(RoomManagingService);
        gameCreationService = sinon.createStubInstance(GameCreationService);
        gameManagingService = sinon.createStubInstance(GameManagementService);
        chatService = sinon.createStubInstance(ChatService);
        service['roomManager'] = roomManager;
        service['gameCreationService'] = gameCreationService;
        service['gameManagementService'] = gameManagingService;
        service['chatService'] = chatService;
    });
    afterEach(() => {
        clientSocket.disconnect();
        clientSocket.close();
        service['sio'].close();
        sinon.restore();
    });

    it('should handle socket connection event', (done) => {
        clientSocket.emit(SocketEvent.CONNECTION);
        setTimeout(() => {
            expect(gameCreationService.configureGameCreationSockets.called);
            expect(gameManagingService.configureGameManagingSockets.called);
            expect(chatService.configureChatSockets.called);
            done();
        }, RESPONSE_DELAY);
    });
});
