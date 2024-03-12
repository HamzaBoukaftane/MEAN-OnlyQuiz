import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { QrlResponseAreaComponent } from '@app/components/qrl-response-area/qrl-response-area.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GameInterfaceComponent } from './game-interface.component';
import { StatisticHistogramComponent } from '@app/components/statistic-histogram/statistic-histogram.component';
import { GameInterfaceManagementService } from '@app/services/game-interface-management.service/game-interface-management.service';
import { HOST_USERNAME } from '@common/names/host-username';
import { QUIZ_TESTING_PAGE } from '@common/page-url/page-url';

describe('GameInterfaceComponent', () => {
    let component: GameInterfaceComponent;
    let fixture: ComponentFixture<GameInterfaceComponent>;
    let socketService: SocketClientServiceTestHelper;
    let gameInterfaceManagementService: GameInterfaceManagementService;
    let setupSpy: jasmine.Spy;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [GameInterfaceComponent, PlayerListComponent, QrlResponseAreaComponent, StatisticHistogramComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                GameInterfaceManagementService,
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' }, url: [{ path: 'url-path' }] } } },
            ],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        gameInterfaceManagementService = TestBed.inject(GameInterfaceManagementService);
        setupSpy = spyOn(gameInterfaceManagementService, 'setup');
        spyOn(gameInterfaceManagementService, 'reset');
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        fixture = TestBed.createComponent(GameInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        setupSpy.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set isTestMode to true when path is "quiz-testing-page"', () => {
        component.ngOnInit();
        expect(gameInterfaceManagementService.gameService.isTestMode).toBeFalsy();
        component['route'].snapshot.url[0].path = QUIZ_TESTING_PAGE;
        fixture = TestBed.createComponent(GameInterfaceComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        expect(gameInterfaceManagementService.gameService.isTestMode).toBeTruthy();
    });

    it('should call setup method when username is not HOST_USERNAME', () => {
        gameInterfaceManagementService.gameService.gameRealService.username = 'SomeUser';
        component.ngOnInit();
        expect(setupSpy).toHaveBeenCalledWith('1');
    });

    it('should not call setup method when username is HOST_USERNAME', () => {
        gameInterfaceManagementService.gameService.gameRealService.username = HOST_USERNAME;
        setupSpy.calls.reset();
        component.ngOnInit();
        expect(setupSpy).not.toHaveBeenCalled();
    });

    it('should call reset method on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(gameInterfaceManagementService.reset).toHaveBeenCalled();
    });

    it('should get correct player score', () => {
        gameInterfaceManagementService.gameService.isTestMode = false;
        expect(component.score).toEqual(0);
    });

    it('should get correct player score', () => {
        gameInterfaceManagementService.gameService.isTestMode = true;
        spyOnProperty(gameInterfaceManagementService.gameService, 'playerScore', 'get').and.returnValue(1);
        expect(component.score).toEqual(gameInterfaceManagementService.gameService.playerScore);
    });

    it('should get correct player bonus', () => {
        gameInterfaceManagementService.gameService.isTestMode = false;
        expect(component.bonusStatus).toBeFalsy();
    });

    it('should get correct bonus player score', () => {
        gameInterfaceManagementService.gameService.isTestMode = true;
        spyOnProperty(gameInterfaceManagementService.gameService, 'isBonus', 'get').and.returnValue(true);
        expect(component.bonusStatus).toBeTruthy();
    });
});
