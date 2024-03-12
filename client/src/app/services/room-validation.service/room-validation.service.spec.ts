import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { ErrorDictionary } from '@common/browser-message/error-message/error-message';
import { HOST_USERNAME } from '@common/names/host-username';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { RoomValidationService } from './room-validation.service';

describe('RoomValidationService', () => {
    let service: RoomValidationService;
    let socketService: SocketClientServiceTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        service = TestBed.inject(RoomValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset all data when calling resetService', () => {
        service.isActive = false;
        service.isLocked = true;
        service.isRoomIdValid = true;
        service.isUsernameValid = true;
        service.roomId = '1234';
        service.username = 'test';
        service.resetService();
        expect(service.isActive).toBeTruthy();
        expect(service.isLocked).toBeFalsy();
        expect(service.isRoomIdValid).toBeFalsy();
        expect(service.isUsernameValid).toBeFalsy();
        expect(service.roomId).toEqual('');
        expect(service.username).toEqual('');
    });

    it('should return the right error if room id is only digit', async () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        spyOn(service, 'isOnlyDigit' as any).and.returnValue(false);
        const sendRoomIdSpy = spyOn(service, 'sendRoomId' as any).and.resolveTo();
        const error = await service.verifyRoomId();
        expect(sendRoomIdSpy).not.toHaveBeenCalled();
        expect(error).toEqual(ErrorDictionary.VALIDATION_CODE_ERROR);
    });

    it('should return the right error if room id is not only digit', async () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        spyOn(service, 'isOnlyDigit' as any).and.returnValue(true);
        const sendRoomIdSpy = spyOn(service, 'sendRoomId' as any).and.resolveTo('test');
        const error = await service.verifyRoomId();
        expect(sendRoomIdSpy).toHaveBeenCalled();
        expect(error).toEqual('test');
    });

    it('should return the right error if username is not valid format', async () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        service.username = ' ';
        const sendUsernameSpy = spyOn(service, 'sendUsername' as any).and.resolveTo();
        const error = await service.verifyUsername();
        expect(sendUsernameSpy).not.toHaveBeenCalled();
        expect(error).toEqual(ErrorDictionary.CHAR_NUM_ERROR);
    });

    it(`should return the right error if username is ${HOST_USERNAME}`, async () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        service.username = HOST_USERNAME.toUpperCase();
        const sendUsernameSpy = spyOn(service, 'sendUsername' as any).and.resolveTo();
        const error = await service.verifyUsername();
        expect(sendUsernameSpy).not.toHaveBeenCalled();
        expect(error).toEqual(ErrorDictionary.ORGANISER_NAME_ERROR);
    });

    it('should return the right error if username is not valid on server side', async () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        service.username = ' test';
        const sendUsernameSpy = spyOn(service, 'sendUsername' as any).and.resolveTo('test');
        const error = await service.verifyUsername();
        expect(sendUsernameSpy).toHaveBeenCalled();
        expect(error).toEqual('test');
    });

    it('should return the right error if username is not valid while trying to join room', async () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const sendUsernameSpy = spyOn(service, 'sendUsername' as any).and.resolveTo('test');
        const sendSpy = spyOn(socketService, 'send');
        const error = await service.sendJoinRoomRequest();
        expect(sendSpy).not.toHaveBeenCalled();
        expect(sendUsernameSpy).toHaveBeenCalled();
        expect(error).toEqual('test');
    });

    it('should return the right error while trying to join room', fakeAsync(() => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        service.username = 'test';
        service.roomId = '1234';
        const sendUsernameSpy = spyOn(service, 'sendUsername' as any).and.resolveTo('');
        const sendSpy = spyOn(socketService, 'send');
        const handleSpy = spyOn(service, 'handleJoiningRoomValidation' as any).and.returnValue('test');
        service.sendJoinRoomRequest();
        tick();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(SocketEvent.JOIN_GAME);
        expect(data).toEqual({ roomId: Number(service.roomId), username: service.username });
        if (typeof callback === 'function') {
            callback(true);
            expect(handleSpy).toHaveBeenCalled();
        }
        expect(sendSpy).toHaveBeenCalled();
        expect(sendUsernameSpy).toHaveBeenCalled();
    }));

    it('should return the right error if room Id is not valid while trying to validate username', async () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        service.username = 'test';
        service.roomId = '1234';
        const sendRoomIdSpy = spyOn(service, 'sendRoomId' as any).and.resolveTo('test');
        const sendSpy = spyOn(socketService, 'send');
        const error = await service['sendUsername']();
        expect(sendSpy).not.toHaveBeenCalled();
        expect(sendRoomIdSpy).toHaveBeenCalled();
        expect(error).toEqual('test');
    });

    it('should return the right error while trying to validate username', fakeAsync(() => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        service.username = 'test';
        service.roomId = '1234';
        const sendRoomIdSpy = spyOn(service, 'sendRoomId' as any).and.resolveTo('');
        const sendSpy = spyOn(socketService, 'send');
        const handleSpy = spyOn(service, 'handleUsernameValidation' as any).and.returnValue('test');
        service['sendUsername']();
        tick();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(SocketEvent.VALIDATE_USERNAME);
        expect(data).toEqual({ roomId: Number(service.roomId), username: service.username });
        if (typeof callback === 'function') {
            callback(true);
            expect(handleSpy).toHaveBeenCalled();
        }
        expect(sendSpy).toHaveBeenCalled();
        expect(sendRoomIdSpy).toHaveBeenCalled();
    }));

    it('should return the right error while trying to validate room Id', fakeAsync(() => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        service.roomId = '1234';
        const sendSpy = spyOn(socketService, 'send');
        const handleSpy = spyOn(service, 'handleRoomIdValidation' as any).and.returnValue('test');
        service['sendRoomId']();
        tick();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(SocketEvent.VALIDATE_ROOM_ID);
        expect(data).toEqual(Number(service.roomId));
        if (typeof callback === 'function') {
            callback(true);
            expect(handleSpy).toHaveBeenCalled();
        }
        expect(sendSpy).toHaveBeenCalled();
    }));

    it('should handle joining room validation correctly if room is locked', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const handleSpy = spyOn(service, 'handleErrors' as any).and.returnValue('test');
        const error = service['handleJoiningRoomValidation'](true);
        expect(handleSpy).toHaveBeenCalledWith(ErrorDictionary.ROOM_LOCKED);
        expect(error).toEqual('test');
    });

    it('should handle joining room validation correctly if room is not locked', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const handleSpy = spyOn(service, 'handleErrors' as any).and.returnValue('test');
        const error = service['handleJoiningRoomValidation'](false);
        expect(handleSpy).not.toHaveBeenCalled();
        expect(error).toEqual('');
    });

    it('should handle username validation correctly if not valid', () => {
        const error = service['handleUsernameValidation']({ isValid: false, error: 'test' });
        expect(error).toEqual('test');
    });

    it('should handle username validation correctly if valid', () => {
        const error = service['handleUsernameValidation']({ isValid: true, error: 'test' });
        expect(error).toEqual('');
    });

    it('should handle room id validation when room does not exist', () => {
        service.isRoomIdValid = false;
        const handleSpy = spyOn(service, 'handleErrors' as any);
        const data = { isRoom: false, isLocked: false };
        service['handleRoomIdValidation'](data);
        expect(handleSpy).toHaveBeenCalledWith(ErrorDictionary.ROOM_CODE_EXPIRED);
        expect(service.isRoomIdValid).toBeFalsy();
    });

    it('should handle room id validation when room is locked', () => {
        service.isRoomIdValid = false;
        const handleSpy = spyOn(service, 'handleErrors' as any);
        const data = { isRoom: true, isLocked: true };
        service['handleRoomIdValidation'](data);
        expect(handleSpy).toHaveBeenCalledWith(ErrorDictionary.ROOM_LOCKED);
        expect(service.isRoomIdValid).toBeFalsy();
    });

    it('should handle room id validation when room is valid', () => {
        service.isRoomIdValid = false;
        const handleSpy = spyOn(service, 'handleErrors' as any);
        const data = { isRoom: true, isLocked: false };
        const error = service['handleRoomIdValidation'](data);
        expect(handleSpy).not.toHaveBeenCalled();
        expect(error).toEqual('');
        expect(service.isRoomIdValid).toBeTruthy();
    });

    it('should handle errors accordingly', () => {
        service.isRoomIdValid = true;
        service.isUsernameValid = true;
        const error = service['handleErrors']('test');
        expect(service.isRoomIdValid).toBeFalsy();
        expect(service.isUsernameValid).toBeFalsy();
        expect(error).toEqual('test');
    });

    it('should return false if room Id is not numerical', () => {
        service.roomId = 'abcd';
        const value = service['isOnlyDigit']();
        expect(value).toBeFalsy();
    });

    it('should return false if room Id is not numerical', () => {
        service.roomId = '1234';
        const value = service['isOnlyDigit']();
        expect(value).toBeTruthy();
    });
});
