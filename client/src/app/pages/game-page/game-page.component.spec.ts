import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { GameInterfaceComponent } from '@app/components/game-interface/game-interface.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { GamePageComponent } from './game-page.component';
import { HOST_USERNAME } from '@common/names/host-username';
import { StatisticHistogramComponent } from '@app/components/statistic-histogram/statistic-histogram.component';

const DIGIT_CONSTANT = 1;
describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let socketService: SocketClientServiceTestHelper;
    let sendSpy: jasmine.Spy;

    const mockActivatedRoute = {
        snapshot: {
            url: [
                {
                    path: 'url-path',
                },
            ],
            paramMap: convertToParamMap({ key: 'value' }),
        },
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule],
            declarations: [GamePageComponent, SidebarComponent, GameInterfaceComponent, PlayerListComponent, StatisticHistogramComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                {
                    provide: ActivatedRoute,
                    useValue: mockActivatedRoute,
                },
            ],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup isHost correctly', () => {
        component['gameService'].gameRealService.username = HOST_USERNAME;
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        expect(component.isHost).toBeTruthy();
        component['gameService'].gameRealService.username = 'player';
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        expect(component.isHost).toBeFalsy();
    });

    it('should send host abandonment event on component destruction if game is starting', () => {
        sendSpy = spyOn(socketService, 'send');
        component['gameService'].gameRealService.username = HOST_USERNAME;
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        component.isHost = true;
        spyOn(component['gameService'], 'destroy');
        component.ngOnDestroy();
        expect(sendSpy).toHaveBeenCalledWith(SocketEvent.HOST_LEFT, DIGIT_CONSTANT);
    });

    it('should send player abandonment event on component destruction if game is starting', () => {
        sendSpy = spyOn(socketService, 'send');
        component['gameService'].gameRealService.username = 'Player';
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        spyOn(component['gameService'], 'destroy');
        component.ngOnDestroy();
        expect(sendSpy).toHaveBeenCalledWith(SocketEvent.PLAYER_LEFT, DIGIT_CONSTANT);
    });
    it('should send room creation event if it is the host of the game', () => {
        component.ngOnInit();
        expect(window.onbeforeunload).toEqual(jasmine.any(Function));
        expect(window.onload).toEqual(jasmine.any(Function));
        if (window) {
            if (window.onbeforeunload) {
                const spyOnNgOnDestroy = spyOn(component, 'ngOnDestroy');
                // @ts-ignore
                window.onbeforeunload();
                expect(spyOnNgOnDestroy).toHaveBeenCalled();
            }
            if (window.onload) {
                const spyRoute = spyOn(component['route'], 'navigate');
                // @ts-ignore
                window.onload();
                expect(spyRoute).toHaveBeenCalledWith(['/']);
            }
        }
    });
});
