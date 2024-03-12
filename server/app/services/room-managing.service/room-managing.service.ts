import { Message } from '@common/interfaces/message.interface';
import { Service } from 'typedi';
import { HOST_USERNAME } from '@common/names/host-username';
import { RoomData } from '@app/interface/room-data-interface';

type SocketId = string;
type Username = string;

@Service()
export class RoomManagingService {
    private rooms: Map<number, RoomData>;

    constructor() {
        this.rooms = new Map<number, RoomData>();
    }

    get roomMap() {
        return this.rooms;
    }

    clearRoomTimer(roomId: number) {
        const room = this.getRoomById(roomId);
        if (room) clearInterval(room.timer);
    }

    getRoomById(roomId: number) {
        return this.rooms.get(roomId);
    }

    getGameByRoomId(roomId: number) {
        return this.rooms.get(roomId)?.game;
    }

    addRoom(quizId: string): number {
        const roomId = this.generateUniqueRoomId();
        const roomData: RoomData = {
            room: roomId,
            quizId,
            players: new Map<Username, SocketId>(),
            locked: false,
            game: null,
            bannedNames: [],
            messages: [],
            timer: null,
        };
        this.rooms.set(roomId, roomData);
        return roomId;
    }

    deleteRoom(roomId: number): void {
        this.clearRoomTimer(roomId);
        this.rooms.delete(roomId);
    }

    addUser(roomId: number, username: string, socketId: string) {
        this.getRoomById(roomId).players.set(username, socketId);
    }

    addMessage(roomId: number, message: Message) {
        this.getRoomById(roomId).messages?.push(message);
    }

    getSocketIdByUsername(roomId: number, username: string): string {
        return this.getRoomById(roomId).players.get(username);
    }

    getUsernameBySocketId(roomId: number, userSocketId: string): string {
        const playersMap = this.getRoomById(roomId).players;
        for (const [username] of playersMap.entries()) {
            if (playersMap.get(username) === userSocketId) return username;
        }
        return undefined;
    }

    removeUserFromRoom(roomId: number, name: string): void {
        const playerMap = this.getRoomById(roomId).players;
        playerMap.delete(name);
    }

    removeUserBySocketId(userSocketId: string) {
        for (const [roomId, roomData] of this.rooms.entries()) {
            for (const [username, socketId] of roomData.players.entries()) {
                if (userSocketId === socketId) {
                    this.removeUserFromRoom(roomId, username);
                    return { roomId, username };
                }
            }
        }
        return undefined;
    }

    getUsernamesArray(roomId: number) {
        if (roomId !== undefined) {
            const players = Array.from(this.getRoomById(roomId).players.keys());
            players.splice(players.indexOf(HOST_USERNAME), 1);
            return players;
        } else return undefined;
    }

    banUser(roomId: number, name: string): void {
        this.rooms.get(roomId).bannedNames.push(name);
        this.removeUserFromRoom(roomId, name);
    }

    isNameUsed(roomId: number, name: string): boolean {
        const room = this.getRoomById(roomId);
        return Array.from(room.players.keys()).some((username) => username.toLowerCase() === name.toLowerCase());
    }

    isNameBanned(roomId: number, name: string): boolean {
        const room = this.getRoomById(roomId);
        return Array.from(room.bannedNames).some((username) => username.toLowerCase() === name.toLowerCase());
    }

    isRoomLocked(roomId: number): boolean {
        return this.getRoomById(roomId).locked;
    }

    changeLockState(roomId: number): void {
        const room = this.rooms.get(roomId);
        room.locked = !room.locked;
    }

    private isRoomExistent(code: number): boolean {
        return this.rooms.has(code);
    }

    private generateUniqueRoomId(): number {
        let roomId: number;
        const UPPER_BOUND_MULTIPLIER = 9000;
        const LOWER_BOUND = 1000;
        do {
            roomId = Math.floor(Math.random() * UPPER_BOUND_MULTIPLIER) + LOWER_BOUND;
        } while (this.isRoomExistent(roomId));
        return roomId;
    }
}
