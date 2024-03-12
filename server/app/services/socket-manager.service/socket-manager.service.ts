import { QuizService } from '@app/services/quiz.service/quiz.service';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as http from 'http';
import * as io from 'socket.io';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { HistoryService } from '@app/services/history.service/history.service';
import { GameCreationService } from '@app/services/game-creation.service/game-creation.service';
import { GameManagementService } from '@app/services/game-management.service/game-management.service';
import { ChatService } from '@app/services/chat.service/chat.service';

export class SocketManager {
    private sio: io.Server;
    private roomManager: RoomManagingService;
    private gameCreationService: GameCreationService;
    private gameManagementService: GameManagementService;
    private chatService: ChatService;

    constructor(
        private quizService: QuizService,
        private historyService: HistoryService,
        server: http.Server,
    ) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.roomManager = new RoomManagingService();
        this.gameCreationService = new GameCreationService();
        this.gameManagementService = new GameManagementService(this.quizService, this.historyService);
        this.chatService = new ChatService();
    }

    handleSockets(): void {
        this.sio.on(SocketEvent.CONNECTION, (socket) => {
            this.gameCreationService.configureGameCreationSockets(this.roomManager, socket, this.sio);
            this.gameManagementService.configureGameManagingSockets(this.roomManager, socket, this.sio);
            this.chatService.configureChatSockets(this.roomManager, socket, this.sio);
        });
    }
}
