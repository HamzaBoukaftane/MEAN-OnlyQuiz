import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Message } from '@common/interfaces/message.interface';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { getCurrentDateService } from 'src/utils/current-date-format/current-date-format';
import SpyObj = jasmine.SpyObj;

const MESSAGE_MAX_CHARACTERS = 200;
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let socketService: SocketClientServiceTestHelper;
    let formBuilder: FormBuilder;
    let gameService: SpyObj<GameService>;
    let longMessage: string;
    beforeEach(() => {
        gameService = jasmine.createSpyObj('GameService', ['destroy']);
        TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            imports: [ReactiveFormsModule, FormsModule],
            providers: [
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                FormBuilder,
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' }, url: [{ path: 'url-path' }] } } },
                { provide: GameService, useValue: gameService },
            ],
        });
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        formBuilder = TestBed.inject(FormBuilder);
        // gameService = TestBed.inject(GameService) as unknown as SpyObj<GameService>;
        fixture.detectChanges();
    });

    beforeEach(() => {
        longMessage =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum pretium euismod urna, ' +
            'ut aliquam ligula. Nulla bibendum, nunc nec laoreet bibendum, arcu elit bibendum sapien....' +
            '.....................\n';
        component.messageForm = formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
        });
        const mockMessageElements = {
            last: jasmine.createSpyObj('last', ['nativeElement']),
        };
        component.messageElements = mockMessageElements as any;
        mockMessageElements.last.nativeElement = jasmine.createSpyObj('containerElement', ['scrollIntoView']);
    });

    it('should create in test mode if active route is quiz-testing-page', () => {
        component['route'].snapshot.url[0].path = 'quiz-testing-page';
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize roomId and messageForm when a roomId is provided', () => {
        spyOn<any>(component, 'getRoomMessages');
        spyOn<any>(component, 'configureBaseSocketFeatures');
        spyOn<any>(component, 'getUsername');

        expect(component.roomId).toBe('1');
        expect(component.messageForm).toBeDefined();
    });

    it('should set isInputFocused to true when calling onChatFocus', () => {
        component.onChatFocus();
        expect(gameService.isInputFocused).toBeTruthy();
    });

    it('should set isInputFocused to false when calling onChatBlur', () => {
        component.onChatBlur();
        expect(gameService.isInputFocused).toBeFalsy();
    });

    it('should call getUsername() when setting up the chat', () => {
        const getUsernameSpy = spyOn<any>(component, 'getUsername');
        component['setup']();
        expect(getUsernameSpy).toHaveBeenCalled();
    });

    it('should call getRoomMessages() and configureBaseSocketFeatures()', () => {
        const getRoomMessagesSpy = spyOn(component, 'getRoomMessages' as any);
        const configureSocketsSpy = spyOn(component, 'configureBaseSocketFeatures' as any);
        component['setup']();
        expect(getRoomMessagesSpy).toHaveBeenCalled();
        expect(configureSocketsSpy).toHaveBeenCalled();
    });

    it('should send a new message when the message is valid and not empty', () => {
        spyOn(socketService, 'send');
        spyOn(component.messageForm.get('message') as FormControl, 'setValue').and.callThrough();
        component.roomId = '1234';
        component.myName = 'TestUser';
        const newValidMessageContent = 'Hello, World';
        component.messageForm = formBuilder.group({
            message: [newValidMessageContent, [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
        });
        component.sendMessage();

        const expectedMessage = {
            sender: 'TestUser',
            content: newValidMessageContent,
            time: getCurrentDateService(),
        };
        expect(socketService.send).toHaveBeenCalledWith(SocketEvent.NEW_MESSAGE, {
            roomId: Number(component.roomId),
            message: expectedMessage,
        });
    });

    it('should not send a message when the message is invalid', () => {
        spyOn(socketService, 'send');
        const messageControl = component.messageForm.get('message') as FormControl;
        messageControl.setValue('');
        component.sendMessage();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should not send a message when the message is empty', () => {
        spyOn(socketService, 'send');
        const messageControl = component.messageForm.get('message') as FormControl;
        messageControl.setValue('      ');
        component.sendMessage();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should not send a message when the message length is above 200 characters', () => {
        spyOn(socketService, 'send');
        const messageControl = component.messageForm.get('message') as FormControl;
        messageControl.setValue(longMessage);
        component.sendMessage();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should set myName when getting username', () => {
        const username = 'User 1';
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component['getUsername']();
        const [event, roomId, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(SocketEvent.GET_USERNAME);
        expect(roomId).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback(username);
            expect(component.myName).toEqual(username);
        }
    });

    it('should get messages related to a room', () => {
        const roomMessages: Message[] = [
            { sender: 'user 1', content: 'message content 1', time: 'time 1' },
            { sender: 'user 2', content: 'message content 2', time: 'time 2' },
        ];
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component['getRoomMessages']();
        const [event, roomId, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(SocketEvent.GET_MESSAGES);
        expect(roomId).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback(roomMessages);
            expect(component.messages).toEqual(roomMessages);
        }
        component['getRoomMessages']();
        if (typeof callback === 'function') {
            callback(undefined);
            expect(component.messages).toEqual([]);
        }
    });

    it('should configure the right socket event listener', () => {
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        const newMessage: Message = { sender: 'user 2', content: 'message content 2', time: 'time 2' };
        component['messages'] = [{ sender: 'user 1', content: 'message content 1', time: 'time 1' }];
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction], [secondEvent, secondAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(SocketEvent.RECEIVED_MESSAGE);
        expect(secondEvent).toEqual(SocketEvent.TOGGLE_CHAT_PERMISSION);

        if (typeof firstAction === 'function') {
            firstAction(newMessage);
            expect(component['messages']).toEqual([
                { sender: 'user 1', content: 'message content 1', time: 'time 1' },
                { sender: 'user 2', content: 'message content 2', time: 'time 2' },
            ]);
        }
        if (typeof secondAction === 'function') {
            component.canChat = true;
            secondAction(true);
            expect(component.canChat).toBeFalsy();
        }
    });
});
