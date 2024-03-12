import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { ErrorDictionary } from '@common/browser-message/error-message/error-message';
import { RoomValidationResult, UsernameValidation } from '@common/interfaces/socket-manager.interface';
import { HOST_USERNAME } from '@common/names/host-username';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';

@Injectable({
    providedIn: 'root',
})
export class RoomValidationService {
    isActive: boolean = true;
    isLocked: boolean = false;
    isRoomIdValid: boolean = false;
    isUsernameValid: boolean = false;
    roomId: string | undefined = '';
    username: string = '';

    constructor(private socketService: SocketClientService) {}

    resetService() {
        this.isActive = true;
        this.isLocked = false;
        this.isRoomIdValid = false;
        this.isUsernameValid = false;
        this.roomId = '';
        this.username = '';
    }

    async verifyRoomId() {
        return this.isOnlyDigit() ? await this.sendRoomId() : ErrorDictionary.VALIDATION_CODE_ERROR;
    }

    async verifyUsername() {
        const whitespacePattern = /^\s*$/;
        const isFormatValid = this.username === undefined || whitespacePattern.test(this.username);
        const isHost = this.username?.toLowerCase() === HOST_USERNAME.toLowerCase();
        if (isFormatValid) return ErrorDictionary.CHAR_NUM_ERROR;
        else if (isHost) return ErrorDictionary.ORGANISER_NAME_ERROR;
        else return await this.sendUsername();
    }

    async sendJoinRoomRequest() {
        const error = await this.sendUsername();
        if (error !== '') return error;
        return new Promise<string>((resolve) => {
            const usernameData = { roomId: Number(this.roomId), username: this.username };
            this.socketService.send(SocketEvent.JOIN_GAME, usernameData, (isLocked: boolean) => {
                resolve(this.handleJoiningRoomValidation(isLocked));
            });
        });
    }

    private async sendUsername() {
        const error = await this.sendRoomId();
        if (error !== '') return error;
        return new Promise<string>((resolve) => {
            const usernameData = { roomId: Number(this.roomId), username: this.username };
            this.socketService.send(SocketEvent.VALIDATE_USERNAME, usernameData, (data: UsernameValidation) => {
                resolve(this.handleUsernameValidation(data));
            });
        });
    }

    private async sendRoomId() {
        return new Promise<string>((resolve) => {
            this.socketService.send(SocketEvent.VALIDATE_ROOM_ID, Number(this.roomId), (data: RoomValidationResult) => {
                resolve(this.handleRoomIdValidation(data));
            });
        });
    }

    private handleJoiningRoomValidation(isLocked: boolean) {
        this.isLocked = isLocked;
        return isLocked ? this.handleErrors(ErrorDictionary.ROOM_LOCKED) : '';
    }

    private handleUsernameValidation(data: UsernameValidation) {
        this.isUsernameValid = data.isValid;
        return data.isValid ? '' : data.error;
    }

    private handleRoomIdValidation(data: RoomValidationResult) {
        let error = '';
        if (!data.isRoom) error = this.handleErrors(ErrorDictionary.ROOM_CODE_EXPIRED);
        else if (data.isLocked) error = this.handleErrors(ErrorDictionary.ROOM_LOCKED);
        else this.isRoomIdValid = true;
        return error;
    }

    private handleErrors(errorType: string) {
        this.isRoomIdValid = false;
        this.isUsernameValid = false;
        return errorType;
    }

    private isOnlyDigit() {
        return this.roomId?.match('[0-9]{4}');
    }
}
