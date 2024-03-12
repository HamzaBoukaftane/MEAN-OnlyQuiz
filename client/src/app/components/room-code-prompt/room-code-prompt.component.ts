import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { RoomValidationService } from '@app/services/room-validation.service/room-validation.service';
import { NO_COLOR, RED_BORDER, RED_TEXT } from '@common/style/style';

@Component({
    selector: 'app-room-code-prompt',
    templateUrl: './room-code-prompt.component.html',
    styleUrls: ['./room-code-prompt.component.scss'],
})
export class RoomCodePromptComponent implements OnInit {
    @Output() sendRoomData: EventEmitter<number> = new EventEmitter<number>();
    @Output() sendUsernameData: EventEmitter<string> = new EventEmitter<string>();
    @Output() validationDone: EventEmitter<boolean> = new EventEmitter<boolean>();
    inputBorderColor: string = '';
    error: string | undefined = '';
    textColor: string = '';

    constructor(
        public roomValidationService: RoomValidationService,
        private socketService: SocketClientService,
    ) {}

    ngOnInit() {
        this.connect();
        this.roomValidationService.resetService();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }

    sendRoomIdToWaitingRoom() {
        this.sendRoomData.emit(Number(this.roomValidationService.roomId));
    }

    sendUsernameToWaitingRoom() {
        this.sendUsernameData.emit(this.roomValidationService.username);
    }

    sendValidationDone() {
        this.validationDone.emit(this.roomValidationService.isActive);
    }

    async validateRoomId() {
        this.error = await this.roomValidationService.verifyRoomId();
        this.handleError();
    }

    async validateUsername() {
        this.error = await this.roomValidationService.verifyUsername();
        this.handleError();
    }

    async joinRoom() {
        this.error = await this.roomValidationService.sendJoinRoomRequest();
        const isValid =
            !this.roomValidationService.isLocked && this.roomValidationService.isRoomIdValid && this.roomValidationService.isUsernameValid;
        if (isValid) this.sendAllDataToWaitingRoom();
        else this.handleError();
    }

    private sendAllDataToWaitingRoom() {
        this.sendRoomIdToWaitingRoom();
        this.sendUsernameToWaitingRoom();
        this.roomValidationService.isActive = false;
        this.sendValidationDone();
    }

    private handleError() {
        if (this.error === '') this.reset();
        else this.showErrorFeedback();
    }

    private reset() {
        this.textColor = NO_COLOR;
        this.inputBorderColor = NO_COLOR;
        this.error = '';
    }

    private showErrorFeedback() {
        this.textColor = RED_TEXT;
        this.inputBorderColor = RED_BORDER;
    }
}
