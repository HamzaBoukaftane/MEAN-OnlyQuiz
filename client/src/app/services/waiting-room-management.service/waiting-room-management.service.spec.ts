import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { WaitingRoomManagementService } from './waiting-room-management.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { Router } from '@angular/router';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { START_TRANSITION_DELAY } from '@common/constants/waiting-room.component.const';

describe('WaitingRoomManagementService', () => {
    let service: WaitingRoomManagementService;
    let socketService: SocketClientServiceTestHelper;
    let router: Router;
    let sendSpy: jasmine.Spy;
    let onSpy: jasmine.Spy;
    let routerSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        service = TestBed.inject(WaitingRoomManagementService);
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        router = TestBed.inject(Router);
        sendSpy = spyOn(socketService, 'send').and.callThrough();
        onSpy = spyOn(socketService, 'on').and.callThrough();
        routerSpy = spyOn(router, 'navigate');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should setUpService correctly', () => {
        service.roomId = 1234;
        service.isRoomLocked = true;
        service.isGameStarting = true;
        service.isTransition = true;
        service.players = ['test', 'test'];
        service.time = 5;
        service.setUpService();
        expect(service.roomId).toEqual(0);
        expect(service.isRoomLocked).toBeFalsy();
        expect(service.isGameStarting).toBeFalsy();
        expect(service.isTransition).toBeFalsy();
        expect(service.players.length).toEqual(0);
        expect(service.time).toEqual(0);
    });

    it('should create a room code properly', fakeAsync(() => {
        service.sendRoomCreation('123');
        tick();
        const [eventName, sentData, callback] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.CREATE_ROOM);
        expect(sentData).toEqual('123');
        if (typeof callback === 'function') {
            callback(0);
            expect(service.roomId).toEqual(0);
        }
    }));

    it('should return a room number when resolving sendRoomCreationPromise', async () => {
        spyOn(service, 'sendRoomCreation').and.resolveTo(0);
        const roomId = await service.sendRoomCreation('123');
        expect(roomId).toEqual(0);
    });

    it('should send ban player event properly', fakeAsync(() => {
        service.roomId = 1;
        service.sendBanPlayer('test');
        tick();
        const [eventName, sentData] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.BAN_PLAYER);
        expect(sentData).toEqual({ roomId: 1, username: 'test' });
    }));

    it('should send toggle room lock event properly', fakeAsync(() => {
        service.roomId = 1;
        service.sendToggleRoomLock();
        tick();
        const [eventName, sentData] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.TOGGLE_ROOM_LOCK);
        expect(sentData).toEqual(1);
    }));

    it('should send start signal event properly', fakeAsync(() => {
        service.roomId = 1;
        service.sendStartSignal();
        tick();
        const [eventName, sentData] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.START);
        expect(sentData).toEqual({ roomId: 1, time: START_TRANSITION_DELAY });
    }));

    it('should remove player correctly from list', () => {
        service.players = ['test', 'karim'];
        service.removePlayer('test');
        expect(service.players).toEqual(['karim']);
    });

    it('should create a room code properly', fakeAsync(() => {
        service.roomId = 1;
        service.gatherPlayers();
        tick();
        const [eventName, sentData, callback] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.GATHER_PLAYERS_USERNAME);
        expect(sentData).toEqual(1);
        if (typeof callback === 'function') {
            callback(['test']);
            expect(service.players).toEqual(['test']);
        }
    }));

    it('should configure correctly socket features', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const handleNewPlayerSpy = spyOn(service, 'handleNewPlayer' as any);
        const handleRemovedFromGameSpy = spyOn(service, 'handleRemovedFromGame' as any);
        const handleRemovedPlayerSpy = spyOn(service, 'handleRemovedPlayer' as any);
        const handleTimeSpy = spyOn(service, 'handleTime' as any);
        const handleFinalTransitionSpy = spyOn(service, 'handleFinalTransition' as any);
        service.configureBaseSocketFeatures();
        expect(handleNewPlayerSpy).toHaveBeenCalled();
        expect(handleRemovedFromGameSpy).toHaveBeenCalled();
        expect(handleRemovedPlayerSpy).toHaveBeenCalled();
        expect(handleTimeSpy).toHaveBeenCalled();
        expect(handleFinalTransitionSpy).toHaveBeenCalled();
    });

    it('should handle new player correctly', fakeAsync(() => {
        service['handleNewPlayer']();
        tick();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.NEW_PLAYER);
        if (typeof action === 'function') {
            action(['test']);
            expect(service.players).toEqual(['test']);
        }
    }));

    it('should handle removed from game correctly', fakeAsync(() => {
        service['handleRemovedFromGame']();
        tick();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.REMOVED_FROM_GAME);
        if (typeof action === 'function') {
            action();
            expect(routerSpy).toHaveBeenCalledWith(['/home']);
        }
    }));

    it('should handle removed player correctly', fakeAsync(() => {
        const removedPlayerSpy = spyOn(service, 'removePlayer').and.callThrough();
        service.players = ['test', 'karim'];
        service['handleRemovedPlayer']();
        tick();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.REMOVED_PLAYER);
        if (typeof action === 'function') {
            action('test');
            expect(removedPlayerSpy).toHaveBeenCalledWith('test');
            expect(service.players).toEqual(['karim']);
        }
    }));

    it('should handle time correctly', fakeAsync(() => {
        service.roomId = 1;
        service.time = 1;
        service['handleTime']();
        tick();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.TIME);
        if (typeof action === 'function') {
            action(0);
            expect(service.isTransition).toBeTruthy();
            expect(service.time).toEqual(0);
            expect(routerSpy).toHaveBeenCalledWith(['game', 1]);
            expect(service.isGameStarting).toBeTruthy();
        }
    }));

    it('should handle final transition correctly', fakeAsync(() => {
        service.isTransition = true;
        service['handleFinalTransition']();
        tick();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.FINAL_TIME_TRANSITION);
        if (typeof action === 'function') {
            action();
            expect(routerSpy).toHaveBeenCalledWith(['/']);
        }
    }));
});
