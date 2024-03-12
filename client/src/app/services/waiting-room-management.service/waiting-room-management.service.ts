import { inject, Injectable } from '@angular/core';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { DELETE_NUMBER, START_TRANSITION_DELAY } from '@common/constants/waiting-room.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Router } from '@angular/router';
import { GAME_PAGE, HOME_PAGE } from '@common/page-url/page-url';

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomManagementService {
    roomId: number = 0;
    isRoomLocked: boolean = false;
    isGameStarting: boolean = false;
    isTransition: boolean = false;
    players: string[] = [];
    time: number = 0;
    private router: Router = inject(Router);

    constructor(private socketService: SocketClientService) {}

    setUpService() {
        this.roomId = 0;
        this.isRoomLocked = false;
        this.isGameStarting = false;
        this.isTransition = false;
        this.players = [];
        this.time = 0;
    }

    async sendRoomCreation(quizId: string | null) {
        return new Promise<number>((resolve) => {
            this.socketService.send(SocketEvent.CREATE_ROOM, quizId, (roomCode: number) => {
                this.roomId = roomCode;
                resolve(roomCode);
            });
        });
    }

    sendBanPlayer(username: string) {
        this.socketService.send(SocketEvent.BAN_PLAYER, { roomId: this.roomId, username });
    }

    sendToggleRoomLock() {
        this.socketService.send(SocketEvent.TOGGLE_ROOM_LOCK, this.roomId);
    }

    sendStartSignal() {
        this.socketService.send(SocketEvent.START, { roomId: this.roomId, time: START_TRANSITION_DELAY });
    }

    removePlayer(username: string) {
        const index = this.players.indexOf(username);
        this.players.splice(index, DELETE_NUMBER);
    }

    gatherPlayers() {
        this.socketService.send(SocketEvent.GATHER_PLAYERS_USERNAME, this.roomId, (players: string[]) => {
            this.players = players;
        });
    }

    configureBaseSocketFeatures() {
        this.handleNewPlayer();
        this.handleRemovedFromGame();
        this.handleRemovedPlayer();
        this.handleTime();
        this.handleFinalTransition();
    }

    private handleNewPlayer() {
        this.socketService.on(SocketEvent.NEW_PLAYER, (players: string[]) => {
            this.players = players;
        });
    }

    private handleRemovedFromGame() {
        this.socketService.on(SocketEvent.REMOVED_FROM_GAME, () => {
            this.router.navigate([`/${HOME_PAGE}`]);
        });
    }

    private handleRemovedPlayer() {
        this.socketService.on(SocketEvent.REMOVED_PLAYER, (username: string) => {
            if (this.players.includes(username)) {
                this.removePlayer(username);
            }
        });
    }

    private handleTime() {
        this.socketService.on(SocketEvent.TIME, (timeValue: number) => {
            this.isTransition = true;
            this.time = timeValue;

            if (this.time === 0) {
                this.router.navigate([`${GAME_PAGE}`, this.roomId]);
                this.isGameStarting = true;
            }
        });
    }

    private handleFinalTransition() {
        this.socketService.on(SocketEvent.FINAL_TIME_TRANSITION, () => {
            if (this.isTransition) {
                this.router.navigate(['/']);
            }
        });
    }
}
