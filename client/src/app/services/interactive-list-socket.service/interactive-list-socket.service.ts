import { Injectable } from '@angular/core';
import { CAN_TALK, Player, PLAYER_NOT_FOUND_INDEX, STATUS_INDEX } from '@common/constants/player-list.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { PlayerStatus } from '@common/player-status/player-status';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { UserData, RoomSettings } from '@common/constants/interactive-list-socket.service.const';

@Injectable({
    providedIn: 'root',
})
export class InteractiveListSocketService {
    players: Player[] = [];
    isFinal: boolean = false;
    private actualStatus: Player[] = [];

    constructor(private socketService: SocketClientService) {}

    // getPlayerList Method as a parameter resetPlayerStatus which when set to true will reset the player status
    // color to red for all remaining players and if set to false the method will keep the real in game live status.
    // This allows the programmer to refresh the list according to the situation (next question or in question);
    async getPlayersList(roomId: number, leftPlayers: Player[] = [], resetPlayerStatus: boolean = true) {
        return new Promise<number>((resolve) => {
            this.gatherPlayersUsername({ resetPlayerStatus, roomId }, resolve, leftPlayers);
        });
    }

    toggleChatPermission(username: string, roomId: number) {
        const playerIndex = this.findPlayer(username, this.players);
        this.players[playerIndex][CAN_TALK] = !this.players[playerIndex][CAN_TALK];
        this.socketService.send(SocketEvent.TOGGLE_CHAT_PERMISSION, { roomId, username });
    }

    configureBaseSocketFeatures() {
        this.reset();
        this.handleUpdateInteraction();
        this.handleSubmitAnswer();
    }

    isPlayerGone(username: string, leftPlayers: Player[]) {
        const foundPlayer = leftPlayers.find((player) => player[0] === username);
        return foundPlayer !== undefined;
    }

    private gatherPlayersUsername(roomSettings: RoomSettings, resolve: (value: number | PromiseLike<number>) => void, leftPlayers: Player[]) {
        this.socketService.send(SocketEvent.GATHER_PLAYERS_USERNAME, roomSettings.roomId, (players: string[]) => {
            resolve(players.length);
            this.setUpPlayerList(leftPlayers);
            players.forEach((username) => {
                this.getPlayerScoreFromServer({ username, resetPlayerStatus: roomSettings.resetPlayerStatus }, roomSettings.roomId, leftPlayers);
            });
        });
    }

    private setUpPlayerList(leftPlayers: Player[]) {
        this.actualStatus = this.players;
        this.players = [];
        this.appendLeftPlayersToActivePlayers(leftPlayers);
    }

    private getPlayerScoreFromServer(userInfo: UserData, roomId: number, leftPlayers: Player[]) {
        this.socketService.send(SocketEvent.GET_SCORE, { roomId, username: userInfo.username }, (score: Score) => {
            this.addPlayer(userInfo, score, leftPlayers);
        });
    }

    private addPlayer(userInfo: UserData, score: Score, leftPlayers: Player[]) {
        const status = this.initPlayerStatus(userInfo.username, userInfo.resetPlayerStatus, leftPlayers);
        const canChat = this.canPlayerChat(userInfo.username);
        this.players.push([userInfo.username, score.points, score.bonusCount, status, canChat]);
    }

    private canPlayerChat(username: string) {
        const playerIndex = this.findPlayer(username, this.actualStatus);
        return this.actualStatus.length === 0 ? true : this.actualStatus[playerIndex][CAN_TALK];
    }

    private appendLeftPlayersToActivePlayers(leftPlayers: Player[]) {
        leftPlayers.forEach(([username, points, bonusCount]) => this.players.push([username, points, bonusCount, PlayerStatus.LEFT, false]));
    }

    private findPlayer(username: string, players: Player[]) {
        return players.findIndex((player) => player[0] === username);
    }

    private handleUpdateInteraction() {
        this.socketService.on(SocketEvent.UPDATE_INTERACTION, (username: string) => {
            this.changePlayerStatus(username, PlayerStatus.INTERACTION);
        });
    }

    private handleSubmitAnswer() {
        this.socketService.on(SocketEvent.SUBMIT_ANSWER, (username: string) => {
            this.changePlayerStatus(username, PlayerStatus.VALIDATION);
        });
    }

    private changePlayerStatus(username: string, status: string) {
        const playerIndex = this.findPlayer(username, this.players);
        if (playerIndex !== PLAYER_NOT_FOUND_INDEX) this.players[playerIndex][STATUS_INDEX] = status;
    }

    private initPlayerStatus(username: string, resetPlayerStatus: boolean, leftPlayers: Player[]) {
        if (this.isPlayerGone(username, leftPlayers)) return PlayerStatus.LEFT;
        else if (!resetPlayerStatus) return this.getActualStatus(username);
        else return this.isFinal ? PlayerStatus.END_GAME : PlayerStatus.NO_INTERACTION;
    }

    private getActualStatus(username: string) {
        const playerIndex = this.findPlayer(username, this.actualStatus);
        return this.actualStatus[playerIndex][STATUS_INDEX];
    }

    private reset() {
        this.isFinal = false;
        this.actualStatus = [];
        this.players = [];
    }
}
