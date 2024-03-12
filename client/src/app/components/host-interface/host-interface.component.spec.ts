import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { CorrectionQRLComponent } from '@app/components/correction-qrl/correction-qrl.component';
import { LeaveButtonComponent } from '@app/components/leave-boutton/leave-boutton.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { StatisticHistogramComponent } from '@app/components/statistic-histogram/statistic-histogram.component';
import { StatisticZoneComponent } from '@app/components/statistic-zone/statistic-zone.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game.service/game.service';
import { HostInterfaceManagementService } from '@app/services/host-interface-management.service/host-interface-management.service';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { NgChartsModule } from 'ng2-charts';
import { HostInterfaceComponent } from './host-interface.component';

describe('HostInterfaceComponent', () => {
    let component: HostInterfaceComponent;
    let fixture: ComponentFixture<HostInterfaceComponent>;
    let socketService: SocketClientServiceTestHelper;
    let mockQuestion: QuizQuestion;
    let activatedRoute: ActivatedRoute;
    let interactiveListService: InteractiveListSocketService;
    let hostservice: HostInterfaceManagementService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                HostInterfaceComponent,
                StatisticHistogramComponent,
                PlayerListComponent,
                CorrectionQRLComponent,
                StatisticZoneComponent,
                LeaveButtonComponent,
            ],
            providers: [
                MatDialog,
                HostInterfaceManagementService,
                InteractiveListSocketService,
                SocketClientService,
                GameService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
            ],
            imports: [NgChartsModule, HttpClientModule, MatTooltipModule, AppMaterialModule],
        }).compileComponents();
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture = TestBed.createComponent(HostInterfaceComponent);
        TestBed.inject(GameService);
        interactiveListService = TestBed.inject(InteractiveListSocketService);
        hostservice = TestBed.inject(HostInterfaceManagementService);
        activatedRoute = TestBed.inject(ActivatedRoute);
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        component = fixture.componentInstance;
        spyOn(interactiveListService, 'getPlayersList').and.resolveTo(1);
        component.gameService.gameRealService.question = mockQuestion;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should configure sockets if socket is alive', () => {
        const initSpy = spyOn(component.gameService, 'init');
        fixture = TestBed.createComponent(HostInterfaceComponent);
        component = fixture.componentInstance;
        spyOn(activatedRoute.snapshot.paramMap, 'get');
        expect(initSpy).toHaveBeenCalled();
    });

    it('should check if disable properly', () => {
        component['isLastButton'] = false;
        const posRes = component.isDisabled();
        expect(posRes).toBeTruthy();
    });

    it('should check if disable if false properly', () => {
        component['isLastButton'] = false;
        component.gameService.gameRealService.locked = true;
        const posRes = component.isDisabled();
        expect(posRes).toBeFalsy();
    });

    it('should update commend correctly', () => {
        component.gameService.gameRealService.isLast = true;
        const last = component.updateHostCommand();
        component.gameService.gameRealService.isLast = false;
        const before = component.updateHostCommand();
        expect(last).toEqual('Montrer résultat');
        expect(before).toEqual('Prochaine question');
    });

    it('should handle host command correctly', () => {
        const saveSpy = spyOn(hostservice, 'saveStats');
        const lastQuestionSpy = spyOn(hostservice, 'handleLastQuestion');
        const nextQuestionSpy = spyOn(hostservice, 'requestNextQuestion');
        component.gameService.gameRealService.isLast = true;
        component.handleHostCommand();
        expect(saveSpy).toHaveBeenCalled();
        expect(lastQuestionSpy).toHaveBeenCalled();
        expect(nextQuestionSpy).not.toHaveBeenCalled();
        saveSpy.calls.reset();
        lastQuestionSpy.calls.reset();
        nextQuestionSpy.calls.reset();
        component.gameService.gameRealService.isLast = false;
        component.handleHostCommand();
        expect(saveSpy).toHaveBeenCalled();
        expect(lastQuestionSpy).not.toHaveBeenCalled();
        expect(nextQuestionSpy).toHaveBeenCalled();
    });
});
