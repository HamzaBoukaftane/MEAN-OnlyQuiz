import { Component } from '@angular/core';

@Component({
    selector: 'app-waiting-room-player-page',
    templateUrl: './waiting-room-player-page.component.html',
    styleUrls: ['./waiting-room-player-page.component.scss'],
})
export class WaitingRoomPlayerPageComponent {
    roomId: number;
    isValidation: boolean = true;

    receiveRoomId(roomId: number) {
        this.roomId = roomId;
    }

    receiveValidation(isValid: boolean) {
        this.isValidation = isValid;
    }
}
