import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { LeaveButtonComponent } from '@app/components/leave-boutton/leave-boutton.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { WaitingRoomManagementService } from '@app/services/waiting-room-management.service/waiting-room-management.service';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { WaitingRoomComponent } from './waiting-room.component';

const DIGIT_CONSTANT = 1;
// Disable the eslint rule that changes any occurrence to unknown when running npm run lint:fix
// Because some spies are on private method
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let socketService: SocketClientServiceTestHelper;
    let waitingRoomService: WaitingRoomManagementService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppMaterialModule, HttpClientModule],
            declarations: [WaitingRoomComponent, LeaveButtonComponent],
            providers: [
                MatDialog,
                SocketClientService,
                GameService,
                WaitingRoomManagementService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
            ],
        });
        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        waitingRoomService = TestBed.inject(WaitingRoomManagementService);
        TestBed.inject(ActivatedRoute);
        TestBed.inject(GameService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set up waiting room for host if it is the host of the game', async () => {
        const setUpServiceSpy = spyOn(waitingRoomService, 'setUpService');
        const setUpHostSpy = spyOn(component, 'setUpHost' as any).and.resolveTo();
        const setUpPlayerSpy = spyOn(component, 'setUpPlayer' as any);
        component.isHost = true;
        await component.ngOnInit();
        expect(setUpServiceSpy).toHaveBeenCalled();
        expect(setUpHostSpy).toHaveBeenCalled();
        expect(setUpPlayerSpy).not.toHaveBeenCalled();
        expect(window.onbeforeunload).toEqual(jasmine.any(Function));
    });

    it('should set up waiting room for player if it is not the host of the game', async () => {
        const setUpServiceSpy = spyOn(waitingRoomService, 'setUpService');
        const setUpHostSpy = spyOn(component, 'setUpHost' as any).and.resolveTo();
        const setUpPlayerSpy = spyOn(component, 'setUpPlayer' as any);
        component.isHost = false;
        await component.ngOnInit();
        expect(setUpServiceSpy).toHaveBeenCalled();
        expect(setUpHostSpy).not.toHaveBeenCalled();
        expect(setUpPlayerSpy).toHaveBeenCalled();
        expect(window.onbeforeunload).toEqual(jasmine.any(Function));
    });

    it('should send a host abandonment event on component destruction if it is host', () => {
        const sendSpy = spyOn(socketService, 'send');
        waitingRoomService.isGameStarting = false;
        component.isHost = true;
        component.roomId = DIGIT_CONSTANT;
        component.ngOnDestroy();
        expect(sendSpy).toHaveBeenCalledWith(SocketEvent.HOST_LEFT, DIGIT_CONSTANT);
    });

    it('should send a player abandonment event on component destruction if not host', () => {
        const sendSpy = spyOn(socketService, 'send');
        waitingRoomService.isGameStarting = false;
        component.isHost = false;
        component.roomId = DIGIT_CONSTANT;
        component.ngOnDestroy();
        expect(sendSpy).toHaveBeenCalledWith(SocketEvent.PLAYER_LEFT, DIGIT_CONSTANT);
    });

    it('should not send abandonment event on component destruction if game is starting', () => {
        const sendSpy = spyOn(socketService, 'send');
        waitingRoomService.isGameStarting = true;
        component.ngOnDestroy();
        expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should connect socket only if socket is not alive', () => {
        const connectSpy = spyOn(socketService, 'connect');
        const socketConfigureSpy = spyOn(waitingRoomService, 'configureBaseSocketFeatures');
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return false;
        });
        component.connect();
        expect(connectSpy).toHaveBeenCalled();
        expect(socketConfigureSpy).toHaveBeenCalled();
    });

    it('should not connect socket if socket is alive', () => {
        const connectSpy = spyOn(socketService, 'connect');
        const socketConfigureSpy = spyOn(waitingRoomService, 'configureBaseSocketFeatures');
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        component.connect();
        expect(connectSpy).not.toHaveBeenCalled();
        expect(socketConfigureSpy).toHaveBeenCalled();
    });

    it('should call sendBanPlayer with username when banning player', () => {
        const sendBanPlayerSpy = spyOn(waitingRoomService, 'sendBanPlayer');
        component.banPlayer('test');
        expect(sendBanPlayerSpy).toHaveBeenCalledWith('test');
    });

    it('should change room locked value on host action', () => {
        const sendToggleRoomLockSpy = spyOn<any>(waitingRoomService, 'sendToggleRoomLock');
        waitingRoomService.isRoomLocked = true;
        component.toggleRoomLocked();
        expect(sendToggleRoomLockSpy).toHaveBeenCalled();
    });

    it('should display the proper message if room is locked', () => {
        waitingRoomService.isRoomLocked = true;
        expect(component.setLockActionMessage()).toEqual('verrouillée');
        waitingRoomService.isRoomLocked = false;
        expect(component.setLockActionMessage()).toEqual('ouverte');
    });

    it('should send a start game signal when host starts game', () => {
        const sendStartSignalSpy = spyOn<any>(waitingRoomService, 'sendStartSignal');
        component.startGame();
        expect(sendStartSignalSpy).toHaveBeenCalled();
    });

    it('should set up waiting room correctly for the host', async () => {
        const sendRoomCreationSpy = spyOn(waitingRoomService, 'sendRoomCreation').and.resolveTo(1);
        await component['setUpHost']();
        expect(sendRoomCreationSpy).toHaveBeenCalledWith('1');
        expect(component.roomId).toEqual(1);
    });

    it('should set up waiting room correctly for the player', () => {
        component.roomId = 1;
        const gatherSpy = spyOn(waitingRoomService, 'gatherPlayers');
        component['setUpPlayer']();
        expect(waitingRoomService.roomId).toEqual(1);
        expect(gatherSpy).toHaveBeenCalled();
    });
});
