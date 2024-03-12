import { RoomCodePromptComponent } from './room-code-prompt.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { TestBed } from '@angular/core/testing';
import { RoomValidationService } from '@app/services/room-validation.service/room-validation.service';

// Disable the eslint rule that changes any occurrence to unknown when running npm run lint:fix
// Because some spies are on private method
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('RoomCodePromptComponent', () => {
    let component: RoomCodePromptComponent;
    let socketService: SocketClientServiceTestHelper;
    let roomValidationService: RoomValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RoomCodePromptComponent],
            providers: [{ provide: SocketClientService, useClass: SocketClientServiceTestHelper }, RoomValidationService],
        }).compileComponents();
        component = TestBed.createComponent(RoomCodePromptComponent).componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        roomValidationService = TestBed.inject(RoomValidationService);
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should connect to the socket service on init', () => {
        const connectSpy = spyOn(component, 'connect');
        component.ngOnInit();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should connect only if socket is not alive', () => {
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return false;
        });
        const connectSpy = spyOn(socketService, 'connect');
        component.connect();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should not connect  if socket is alive', () => {
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        const connectSpy = spyOn(socketService, 'connect');
        component.connect();
        expect(connectSpy).not.toHaveBeenCalled();
    });

    it('should emit the room ID when calling sendRoomIdToWaitingRoom', () => {
        const sendRoomDataSpy = spyOn(component.sendRoomData, 'emit');
        roomValidationService.roomId = '1';
        component.sendRoomIdToWaitingRoom();
        expect(sendRoomDataSpy).toHaveBeenCalledWith(1);
    });

    it('should emit username when validation done', () => {
        const sendRoomDataSpy = spyOn(component.sendUsernameData, 'emit');
        roomValidationService.username = 'test';
        component.sendUsernameToWaitingRoom();
        expect(sendRoomDataSpy).toHaveBeenCalledWith('test');
    });

    it('should emit component status when validation done', () => {
        const sendRoomDataSpy = spyOn(component.validationDone, 'emit');
        roomValidationService.isActive = true;
        component.sendValidationDone();
        expect(sendRoomDataSpy).toHaveBeenCalledWith(true);
    });

    it('should validate room Id correctly', async () => {
        component.error = '';
        spyOn(roomValidationService, 'verifyRoomId').and.resolveTo('test');
        const handleErrorSpy = spyOn(component, 'handleError' as any);
        await component.validateRoomId();
        expect(handleErrorSpy).toHaveBeenCalled();
        expect(component.error).toEqual('test');
    });

    it('should validate username correctly', async () => {
        component.error = '';
        spyOn(roomValidationService, 'verifyUsername').and.resolveTo('test');
        const handleErrorSpy = spyOn(component, 'handleError' as any);
        await component.validateUsername();
        expect(handleErrorSpy).toHaveBeenCalled();
        expect(component.error).toEqual('test');
    });

    it('should join room if all condition are valid', async () => {
        component.error = '';
        roomValidationService.isLocked = false;
        roomValidationService.isRoomIdValid = true;
        roomValidationService.isUsernameValid = true;
        spyOn(roomValidationService, 'sendJoinRoomRequest').and.resolveTo('');
        const handleErrorSpy = spyOn(component, 'handleError' as any);
        const sendAllDataSpy = spyOn(component, 'sendAllDataToWaitingRoom' as any);
        await component.joinRoom();
        expect(handleErrorSpy).not.toHaveBeenCalled();
        expect(sendAllDataSpy).toHaveBeenCalled();
        expect(component.error).toEqual('');
    });

    it('should not join room if all condition are not valid', async () => {
        component.error = '';
        roomValidationService.isLocked = true;
        roomValidationService.isRoomIdValid = true;
        roomValidationService.isUsernameValid = true;
        spyOn(roomValidationService, 'sendJoinRoomRequest').and.resolveTo('test');
        const handleErrorSpy = spyOn(component, 'handleError' as any);
        const sendAllDataSpy = spyOn(component, 'sendAllDataToWaitingRoom' as any);
        await component.joinRoom();
        expect(handleErrorSpy).toHaveBeenCalled();
        expect(sendAllDataSpy).not.toHaveBeenCalled();
        expect(component.error).toEqual('test');
    });

    it('should send all data to waiting correctly', () => {
        const sendRoomIdToWaitingRoomSpy = spyOn(component, 'sendRoomIdToWaitingRoom');
        const sendUsernameToWaitingRoomSpy = spyOn(component, 'sendUsernameToWaitingRoom');
        const sendValidationDoneSpy = spyOn(component, 'sendValidationDone');
        component.roomValidationService.isActive = true;
        component['sendAllDataToWaitingRoom']();
        expect(component.roomValidationService.isActive).toBeFalsy();
        expect(sendRoomIdToWaitingRoomSpy).toHaveBeenCalled();
        expect(sendUsernameToWaitingRoomSpy).toHaveBeenCalled();
        expect(sendValidationDoneSpy).toHaveBeenCalled();
    });

    it('should reset component error if no error', () => {
        const showErrorFeedbackSpy = spyOn(component, 'showErrorFeedback' as any);
        const resetSpy = spyOn(component, 'reset' as any);
        component.error = '';
        component['handleError']();
        expect(showErrorFeedbackSpy).not.toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should show feedback when there is errors', () => {
        const showErrorFeedbackSpy = spyOn(component, 'showErrorFeedback' as any);
        const resetSpy = spyOn(component, 'reset' as any);
        component.error = 'test';
        component['handleError']();
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(resetSpy).not.toHaveBeenCalled();
    });

    it('should reset all feedback error', () => {
        component['reset']();
        expect(component.textColor).toEqual('');
        expect(component.inputBorderColor).toEqual('');
        expect(component.error).toEqual('');
    });

    it('should show all feedback error', () => {
        component['showErrorFeedback']();
        expect(component.textColor).toEqual('red-text');
        expect(component.inputBorderColor).toEqual('red-border');
    });
});
