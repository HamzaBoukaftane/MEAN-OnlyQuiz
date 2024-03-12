import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { PlayerMessage, PlayerUsername } from '@common/interfaces/socket-manager.interface';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as io from 'socket.io';

export class ChatService {
    configureChatSockets(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        this.handleGetMessage(roomManager, socket);
        this.handleNewMessage(roomManager, socket, sio);
        this.handleToggleChatPermission(roomManager, socket, sio);
        this.handleGetUsername(roomManager, socket);
    }
    private handleGetMessage(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.GET_MESSAGES, (data: number, callback) => {
            const messages = roomManager.getRoomById(data)?.messages;
            callback(messages);
        });
    }

    private handleNewMessage(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.NEW_MESSAGE, (data: PlayerMessage) => {
            roomManager.addMessage(data.roomId, data.message);
            sio.to(String(data.roomId)).emit(SocketEvent.RECEIVED_MESSAGE, data.message);
        });
    }

    private handleToggleChatPermission(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.TOGGLE_CHAT_PERMISSION, (data: PlayerUsername) => {
            const playerSocket = roomManager.getSocketIdByUsername(data.roomId, data.username);
            sio.to(playerSocket).emit(SocketEvent.TOGGLE_CHAT_PERMISSION);
        });
    }

    private handleGetUsername(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.GET_USERNAME, (data: number, callback) => {
            const username = roomManager.getUsernameBySocketId(data, socket.id);
            callback(username);
        });
    }
}
