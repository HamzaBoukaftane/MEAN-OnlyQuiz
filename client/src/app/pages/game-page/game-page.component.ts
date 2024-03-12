import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { HOST_USERNAME } from '@common/names/host-username';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy, OnInit {
    isHost: boolean;
    private route: Router = inject(Router);

    constructor(
        private gameService: GameService,
        private readonly socketService: SocketClientService,
        private interactiveListService: InteractiveListSocketService,
    ) {
        this.isHost = this.gameService.gameRealService.username === HOST_USERNAME;
    }

    ngOnInit() {
        if (this.socketService.isSocketAlive()) this.interactiveListService.configureBaseSocketFeatures();
        window.onbeforeunload = () => this.ngOnDestroy();
        window.onload = async () => this.route.navigate(['/']);
    }

    ngOnDestroy() {
        const messageType = this.isHost ? SocketEvent.HOST_LEFT : SocketEvent.PLAYER_LEFT;
        if (this.socketService.isSocketAlive()) {
            this.socketService.send(messageType, this.gameService.gameRealService.roomId);
        }
        this.gameService.destroy();
        this.gameService.audio.pause();
    }
}
