import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { WaitingRoomManagementService } from '@app/services/waiting-room-management.service/waiting-room-management.service';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game.service/game.service';
import { HOST_USERNAME } from '@common/names/host-username';
import { LOCKED, UNLOCKED } from '@common/constants/waiting-room.component.const';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    @Input() isHost: boolean;
    @Input() roomId: number;
    @Input() isActive: boolean;
    private readonly route: ActivatedRoute = inject(ActivatedRoute);

    constructor(
        public waitingRoomManagementService: WaitingRoomManagementService,
        public gameService: GameService,
        private socketService: SocketClientService,
    ) {
        this.connect();
    }

    async ngOnInit() {
        this.waitingRoomManagementService.setUpService();
        if (this.isHost) await this.setUpHost();
        else this.setUpPlayer();
        window.onbeforeunload = () => this.ngOnDestroy();
    }

    ngOnDestroy() {
        if (!this.waitingRoomManagementService.isGameStarting) {
            const messageType = this.isHost ? SocketEvent.HOST_LEFT : SocketEvent.PLAYER_LEFT;
            this.socketService.send(messageType, this.roomId);
            this.gameService.destroy();
        }
        this.socketService.socket.removeAllListeners();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.waitingRoomManagementService.configureBaseSocketFeatures();
    }

    banPlayer(username: string) {
        this.waitingRoomManagementService.sendBanPlayer(username);
    }

    toggleRoomLocked() {
        this.waitingRoomManagementService.isRoomLocked = !this.waitingRoomManagementService.isRoomLocked;
        this.waitingRoomManagementService.sendToggleRoomLock();
    }

    setLockActionMessage() {
        return this.waitingRoomManagementService.isRoomLocked ? LOCKED : UNLOCKED;
    }

    startGame() {
        this.waitingRoomManagementService.sendStartSignal();
    }

    private async setUpHost() {
        const quizId = this.route.snapshot.paramMap.get('id');
        this.roomId = await this.waitingRoomManagementService.sendRoomCreation(quizId);
        this.gameService.gameRealService.username = HOST_USERNAME;
    }

    private setUpPlayer() {
        this.waitingRoomManagementService.roomId = this.roomId;
        this.waitingRoomManagementService.gatherPlayers();
    }
}
