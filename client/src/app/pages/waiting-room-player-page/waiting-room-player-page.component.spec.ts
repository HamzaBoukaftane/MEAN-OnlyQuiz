import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { LeaveButtonComponent } from '@app/components/leave-boutton/leave-boutton.component';
import { RoomCodePromptComponent } from '@app/components/room-code-prompt/room-code-prompt.component';
import { WaitingRoomComponent } from '@app/components/waiting-room/waiting-room.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { WaitingRoomPlayerPageComponent } from './waiting-room-player-page.component';

describe('WaitingRoomPlayerPageComponent', () => {
    let component: WaitingRoomPlayerPageComponent;
    let fixture: ComponentFixture<WaitingRoomPlayerPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomPlayerPageComponent, LeaveButtonComponent, WaitingRoomComponent, RoomCodePromptComponent],
            imports: [HttpClientModule, FormsModule, RouterTestingModule, AppMaterialModule],
            providers: [MatDialog],
        });
        fixture = TestBed.createComponent(WaitingRoomPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should receive room id', () => {
        component.receiveRoomId(0);
        expect(component.roomId).toEqual(0);
    });

    it('should set validation state', () => {
        component.receiveValidation(true);
        expect(component.isValidation).toBeTruthy();
    });
});
