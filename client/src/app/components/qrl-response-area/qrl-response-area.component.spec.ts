import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { LeaveButtonComponent } from '@app/components/leave-boutton/leave-boutton.component';
import { QrlResponseAreaComponent } from '@app/components/qrl-response-area/qrl-response-area.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { DEBOUNCE_INACTIVE_TIME, INACTIVITY_TIME } from '@common/constants/qrl-response-area.component.const';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('QrlResponseAreaComponent', () => {
    let component: QrlResponseAreaComponent;
    let fixture: ComponentFixture<QrlResponseAreaComponent>;
    let socketService: SocketClientServiceTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QrlResponseAreaComponent, LeaveButtonComponent],
            providers: [MatDialog, SocketClientService, GameService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
            imports: [HttpClientModule, AppMaterialModule, FormsModule],
        }).compileComponents();
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture = TestBed.createComponent(QrlResponseAreaComponent);
        TestBed.inject(GameService);
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should validate answer when we press enter outside chat box focus', () => {
        const validateSpy = spyOn(component, 'validate');
        component.gameService.isInputFocused = false;
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.handleKeyboardEvent(keyboardEvent);
        expect(validateSpy).toHaveBeenCalled();
    });

    it('should correctly destroy the component', () => {
        const numberOfExpectedCalls = 3;
        spyOn(window, 'clearTimeout');
        component.ngOnDestroy();
        expect(component.gameService.isActive).toBeFalsy();
        expect(component.gameService.hasInteracted).toBeFalsy();
        expect(window.clearTimeout).toHaveBeenCalledTimes(numberOfExpectedCalls);
    });

    it('should emit socket events when user not active or has not interacted yet', () => {
        component.gameService.isActive = false;
        component.gameService.hasInteracted = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'resetInputTimer' as any);
        spyOn(socketService, 'send');
        component.handleActiveUser();
        expect(component.gameService.isActive).toBeTruthy();
        expect(component.gameService.hasInteracted).toBeTruthy();
        expect(socketService.send).toHaveBeenCalledWith(SocketEvent.SEND_ACTIVITY_STATUS, {
            roomId: component.gameService.gameRealService.roomId,
            isActive: true,
        });
        expect(socketService.send).toHaveBeenCalledWith(SocketEvent.NEW_RESPONSE_INTERACTION, component.gameService.gameRealService.roomId);
    });

    it('should validate and send answer', () => {
        spyOn(component.gameService, 'sendAnswer');
        spyOn(component, 'ngOnDestroy');
        component.validate();
        expect(component.gameService.isHostEvaluating).toBe(true);
        expect(component.gameService.sendAnswer).toHaveBeenCalled();
        expect(component.ngOnDestroy).toHaveBeenCalled();
    });

    it('should start waiting for the inactivity time when input stopped', fakeAsync(() => {
        spyOn(socketService, 'send');
        component['onInputStopped']();
        tick(INACTIVITY_TIME);
        expect(socketService.isSocketAlive).toHaveBeenCalled();
        expect(socketService.send).toHaveBeenCalledWith(SocketEvent.SEND_ACTIVITY_STATUS, {
            roomId: component.gameService.gameRealService.roomId,
            isActive: false,
        });
    }));

    it('should return the correct number of points obtained for a question', () => {
        component.gameService.lastQrlScore = undefined;
        let points = component.obtainedPoints();
        expect(points).toEqual(0);
        component.gameService.lastQrlScore = 50;
        points = component.obtainedPoints();
        expect(points).toEqual((component.gameService.question?.points as number) / 2);
    });

    it('should setup input debounce correctly', fakeAsync(() => {
        spyOn(socketService, 'send');
        spyOn(component, 'onInputStopped' as any);
        component['setupInputDebounce']();
        tick(DEBOUNCE_INACTIVE_TIME);
        expect(component['onInputStopped']).toHaveBeenCalledWith();
    }));

    it('should reset input timer correctly', fakeAsync(() => {
        const numberOfExpectedCalls = 2;
        spyOn(window, 'clearTimeout');
        spyOn(component, 'setupInputDebounce' as any);
        component['resetInputTimer']();
        expect(window.clearTimeout).toHaveBeenCalledTimes(numberOfExpectedCalls);
        expect(component['setupInputDebounce']).toHaveBeenCalled();
    }));
});
