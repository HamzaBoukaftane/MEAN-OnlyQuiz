import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { LeaveButtonComponent } from '@app/components/leave-boutton/leave-boutton.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GameAnswersListComponent } from './game-answers-list.component';
/* eslint-disable  @typescript-eslint/no-explicit-any */

describe('GameAnswersListComponent', () => {
    let component: GameAnswersListComponent;
    let fixture: ComponentFixture<GameAnswersListComponent>;
    let socketService: SocketClientServiceTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, FormsModule, RouterTestingModule, AppMaterialModule],
            declarations: [GameAnswersListComponent, LeaveButtonComponent],
            providers: [MatDialog, SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        fixture = TestBed.createComponent(GameAnswersListComponent);
        component = fixture.componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should validate properly', () => {
        spyOn(socketService, 'send');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sendAnswerSpy = spyOn<any>(component.gameService, 'sendAnswer');
        component['gameService'].isTestMode = false;
        component['gameService'].gameRealService.validated = false;
        component.validate();
        expect(sendAnswerSpy).toHaveBeenCalled();
        sendAnswerSpy.calls.reset();
        component['gameService'].gameRealService.validated = true;
        component.validate();
        expect(sendAnswerSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple emission', () => {
        const validateSpy = spyOn<any>(component, 'validate');
        const checkIsIncremented = component['receptionDebounce'];
        component.handleMultipleEmission();
        expect(validateSpy).not.toHaveBeenCalled();
        expect(component['receptionDebounce']).toEqual(checkIsIncremented + 1);
        spyOnProperty(component['gameService'], 'question', 'get').and.returnValue({
            type: 0,
            text: 'What is the capital of France?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'Berlin', isCorrect: false },
                { text: 'Madrid', isCorrect: false },
            ],
        });
        let checkTheLength = 0;
        if (component.gameService.question?.choices?.length) {
            checkTheLength = component.gameService.question?.choices?.length - 1;
        }
        component['receptionDebounce'] = checkTheLength;
        component.handleMultipleEmission();
        expect(component['receptionDebounce']).toEqual(0);
        expect(validateSpy).toHaveBeenCalled();
    });

    it('should select the choice properly', () => {
        const selectChoiceSpy = spyOn<any>(component.gameService, 'selectChoice');
        component.selectChoice(1);
        expect(selectChoiceSpy).toHaveBeenCalled();
    });
});
