import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { Player } from '@common/constants/player-list.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { PlayerStatus } from '@common/player-status/player-status';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { InteractiveListSocketService } from './interactive-list-socket.service';

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('InteractiveListSocketService', () => {
    let service: InteractiveListSocketService;
    let socketService: SocketClientServiceTestHelper;
    let sendSpy: jasmine.Spy;
    let onSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        service = TestBed.inject(InteractiveListSocketService);
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        sendSpy = spyOn(socketService, 'send').and.callThrough();
        onSpy = spyOn(socketService, 'on').and.callThrough();
        service.players = [['test', 0, 0, 'test', true]];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a promise when get Players List with the right arguments', fakeAsync(() => {
        const gatherPlayerUsernameSpy = spyOn(service, 'gatherPlayersUsername' as any);
        service.getPlayersList(1);
        tick();
        expect(gatherPlayerUsernameSpy).toHaveBeenCalled();
    }));

    it('should return a promise when get Players List with the right arguments', fakeAsync(() => {
        const gatherPlayerUsernameSpy = spyOn(service, 'gatherPlayersUsername' as any);
        service.getPlayersList(1);
        tick();
        expect(gatherPlayerUsernameSpy).toHaveBeenCalled();
    }));

    it('should toggle chat room permission correctly', () => {
        const findIndexSpy = spyOn(service, 'findPlayer' as any).and.callThrough();
        service.toggleChatPermission('test', 1);
        const [eventName, data] = sendSpy.calls.mostRecent().args;
        expect(service.players[0][4]).toBeFalsy();
        expect(eventName).toEqual(SocketEvent.TOGGLE_CHAT_PERMISSION);
        expect(data).toEqual({ roomId: 1, username: 'test' });
        expect(findIndexSpy).toHaveBeenCalled();
    });

    it('should configure socket correctly', () => {
        const resetSpy = spyOn(service, 'reset' as any);
        const handleUpdateSpy = spyOn(service, 'handleUpdateInteraction' as any);
        const handleSubmitSpy = spyOn(service, 'handleSubmitAnswer' as any);
        service.configureBaseSocketFeatures();
        expect(resetSpy).toHaveBeenCalled();
        expect(handleUpdateSpy).toHaveBeenCalled();
        expect(handleSubmitSpy).toHaveBeenCalled();
    });

    it('should check if player is gone', () => {
        const leftPlayer = [['test', 0, 0, 'test', true]] as Player[];
        const posRes = service.isPlayerGone('test', leftPlayer);
        const negRes = service.isPlayerGone('no', leftPlayer);
        expect(posRes).toBeTruthy();
        expect(negRes).toBeFalsy();
    });

    it('should gather username correctly', () => {
        const leftPlayer = [['test', 0, 0, 'test', true]] as Player[];
        const setUpPlayerSpy = spyOn(service, 'setUpPlayerList' as any).and.callThrough();
        const getPlayerScoreFromServerSpy = spyOn(service, 'getPlayerScoreFromServer' as any).and.callThrough();
        service['gatherPlayersUsername'](
            { roomId: 1, resetPlayerStatus: true },
            () => {
                return;
            },
            leftPlayer,
        );
        const [eventName, data, callback] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.GATHER_PLAYERS_USERNAME);
        expect(data).toEqual(1);
        if (typeof callback === 'function') {
            callback(service.players);
            expect(getPlayerScoreFromServerSpy).toHaveBeenCalled();
            expect(setUpPlayerSpy).toHaveBeenCalled();
        }
    });

    it('should get player from server correctly', () => {
        const leftPlayer = [['test', 0, 0, 'test', true]] as Player[];
        const addPlayerSpy = spyOn(service, 'addPlayer' as any).and.callThrough();
        service['getPlayerScoreFromServer']({ username: 'test', resetPlayerStatus: false }, 1, leftPlayer);
        const [eventName, data, callback] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.GET_SCORE);
        expect(data).toEqual({ roomId: 1, username: 'test' });
        if (typeof callback === 'function') {
            callback(0);
            expect(addPlayerSpy).toHaveBeenCalled();
        }
    });

    it('should verify if player canChat', () => {
        service['actualStatus'] = [];
        const posRes = service['canPlayerChat']('test');
        service['actualStatus'] = [
            ['test', 0, 0, 'test', true],
            ['karim', 0, 0, 'karim', false],
        ] as Player[];
        const negRes = service['canPlayerChat']('karim');
        expect(posRes).toBeTruthy();
        expect(negRes).toBeFalsy();
    });

    it('should handle update interaction properly', () => {
        const changePlayerStatusSpy = spyOn(service, 'changePlayerStatus' as any).and.callThrough();
        service['handleUpdateInteraction']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.UPDATE_INTERACTION);
        if (typeof action === 'function') {
            action('test');
            expect(changePlayerStatusSpy).toHaveBeenCalled();
        }
    });

    it('should handle submit answer properly', () => {
        const changePlayerStatusSpy = spyOn(service, 'changePlayerStatus' as any).and.callThrough();
        service['handleSubmitAnswer']();
        const [eventName, action] = onSpy.calls.mostRecent().args;
        expect(eventName).toEqual(SocketEvent.SUBMIT_ANSWER);
        if (typeof action === 'function') {
            action('test');
            expect(changePlayerStatusSpy).toHaveBeenCalled();
        }
    });

    it('should init player status correctly', () => {
        const leftPlayer = [['test', 0, 0, 'test', true]] as Player[];
        const playerGoneSpy = spyOn(service, 'isPlayerGone').and.returnValue(true);
        const getActualStatusSpy = spyOn(service, 'getActualStatus' as any).and.returnValue('test');
        const leftStatus = service['initPlayerStatus']('test', true, leftPlayer);
        playerGoneSpy.calls.reset();
        playerGoneSpy.and.returnValue(false);
        const actualStatus = service['initPlayerStatus']('test', false, leftPlayer);
        service.isFinal = true;
        const endGame = service['initPlayerStatus']('test', true, leftPlayer);
        service.isFinal = false;
        const noInteraction = service['initPlayerStatus']('test', true, leftPlayer);
        expect(getActualStatusSpy).toHaveBeenCalled();
        expect(leftStatus).toEqual(PlayerStatus.LEFT);
        expect(actualStatus).toEqual('test');
        expect(endGame).toEqual(PlayerStatus.END_GAME);
        expect(noInteraction).toEqual(PlayerStatus.NO_INTERACTION);
    });

    it('should get actual status correctly', () => {
        service['actualStatus'] = [
            ['test', 0, 0, 'test', true],
            ['karim', 0, 0, 'karim', false],
        ] as Player[];
        const status = service['getActualStatus']('test');
        expect(status).toEqual('test');
    });

    it('should reset properly', () => {
        service['reset']();
        expect(service.isFinal).toBeFalsy();
        expect(service['actualStatus'].length).toEqual(0);
        expect(service.players.length).toEqual(0);
    });
});
