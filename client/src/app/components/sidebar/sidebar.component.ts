import { AfterViewInit, Component, ElementRef, Injector, Input, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MESSAGE_MAX_CHARACTERS } from '@common/constants/sidebar.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Message } from '@common/interfaces/message.interface';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { getCurrentDateService } from 'src/utils/current-date-format/current-date-format';
import { QUIZ_TESTING_PAGE } from '@common/page-url/page-url';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
    @ViewChildren('messageContainer') messageElements: QueryList<ElementRef>;
    @Input() isHost: boolean;
    myName: string;
    roomId: string;
    messageForm: FormGroup;
    messages: Message[];
    socketService: SocketClientService;
    formBuilder: FormBuilder;
    route: ActivatedRoute;
    gameService: GameService;
    canChat: boolean;

    constructor(injector: Injector) {
        this.socketService = injector.get<SocketClientService>(SocketClientService);
        this.formBuilder = injector.get<FormBuilder>(FormBuilder);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.gameService = injector.get<GameService>(GameService);
        this.myName = '';
        this.roomId = '';
        this.messages = [];
        this.canChat = true;
        const roomId = this.route.snapshot.paramMap.get('id');
        const isTestMode = this.route.snapshot.url[0].path === QUIZ_TESTING_PAGE;
        if (isTestMode) {
            if (this.socketService.isSocketAlive()) this.socketService.disconnect();
        }
        if (roomId) {
            this.roomId = roomId;
            this.setup();
        }
        this.messageForm = this.formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
        });
    }
    ngAfterViewInit() {
        this.scrollToBottom();
    }

    sendMessage() {
        const newMessageContent: string = this.messageForm.get('message')?.value;
        if (this.socketService.isSocketAlive()) {
            if (this.messageForm.get('message')?.valid && newMessageContent.trim()) {
                const newMessage: Message = { sender: this.myName, content: newMessageContent, time: getCurrentDateService() };
                this.socketService.send(SocketEvent.NEW_MESSAGE, { roomId: Number(this.roomId), message: newMessage });
                this.messageForm.get('message')?.setValue('');
            }
        }
    }

    onChatFocus() {
        this.gameService.isInputFocused = true;
    }

    onChatBlur() {
        this.gameService.isInputFocused = false;
    }

    scrollToBottom() {
        if (this.messageElements.last) {
            const containerElement = this.messageElements.last.nativeElement;
            containerElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
    }

    private setup() {
        if (this.socketService.isSocketAlive()) {
            this.getUsername();
            this.getRoomMessages();
            this.configureBaseSocketFeatures();
        }
    }

    private getRoomMessages() {
        this.socketService.send(SocketEvent.GET_MESSAGES, Number(this.roomId), (messages: Message[]) => {
            this.messages = messages ?? [];
        });
    }

    private getUsername() {
        this.socketService.send(SocketEvent.GET_USERNAME, Number(this.roomId), (name: string) => {
            this.myName = name;
        });
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.RECEIVED_MESSAGE, (message: Message) => {
            this.messages.push(message);
            setTimeout(() => {
                this.scrollToBottom();
            });
        });

        this.socketService.on(SocketEvent.TOGGLE_CHAT_PERMISSION, () => {
            this.canChat = !this.canChat;
        });
    }
}
