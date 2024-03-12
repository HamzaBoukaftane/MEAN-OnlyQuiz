import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { QrlEvaluationService } from '@app/services/qrl-evaluation.service/qrl-evaluation.service';
import { GameService } from '@app/services/game.service/game.service';
import { QuestionStatistics } from '@common/constants/statistic-zone.component.const';
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('QrlEvaluationService', () => {
    let service: QrlEvaluationService;
    const gameStats: QuestionStatistics[] = [];
    const mockPoint = 40;
    const mockTimeOne = 23;
    const mockTimeTwo = 25;
    const mockTimeThree = 40;
    const mockTimeFour = 10;
    const mockTimeFive = 30;
    const initialIndex = -1;
    const mockResponsesQrl = new Map<string, { answers: string; time: number }>();
    const mockUsernames = ['Hamza', 'Arman', 'Rayan', 'Adlane', 'Ely'];
    const mockAnswers = ['Answer1', 'Answer2', 'Answer3', 'Answer4', 'Answer5'];
    const mockTimes = [mockTimeOne, mockTimeTwo, mockTimeThree, mockTimeFour, mockTimeFive];
    let socketService: SocketClientServiceTestHelper;
    let sendSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [GameService, SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        for (let i = 0; i < mockUsernames.length; i++) {
            mockResponsesQrl.set(mockUsernames[i], { answers: mockAnswers[i], time: mockTimes[i] });
        }
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        service = TestBed.inject(QrlEvaluationService);
        sendSpy = spyOn(socketService, 'send').and.callThrough();
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should update correctly correction point', () => {
        service.getCorrection(mockPoint);
        expect(service['points'][service['indexPlayer']]).toEqual(mockPoint);
    });

    it('should go to the next answer', () => {
        service['indexPlayer'] = 1;
        service.usernames = mockUsernames;
        service['answers'] = mockAnswers;
        service.nextAnswer();
        expect(service['indexPlayer']).toEqual(2);
        expect(service.currentUsername).toEqual(mockUsernames[service['indexPlayer']]);
        expect(service.currentAnswer).toEqual(mockAnswers[service['indexPlayer']]);
        const expectedIndex = 9;
        service['indexPlayer'] = 8;
        service.nextAnswer();
        expect(service['indexPlayer']).toEqual(expectedIndex);
    });

    it('should end Correction properly', () => {
        service.initialize(mockResponsesQrl);
        service['endCorrection'](gameStats);
        expect(service['correctedQrlAnswers']).toBeTruthy();
    });

    it('should clear all', () => {
        service.clearAll();
        expect(service.usernames.length).toEqual(0);
        expect(service['answers'].length).toEqual(0);
        expect(service['points'].length).toEqual(0);
        expect(service['correctedQrlAnswers'].size).toEqual(0);
        expect(service['indexPlayer']).toEqual(initialIndex);
    });

    it('should initialize correctly', () => {
        spyOn(service, 'nextAnswer');
        service.initialize(mockResponsesQrl);
        expect(service['indexPlayer']).toEqual(initialIndex);
        expect(service.usernames.length).toEqual(mockUsernames.length);
        expect(service['answers'].length).toEqual(mockAnswers.length);
        expect(service.nextAnswer).toHaveBeenCalled();
    });

    it('should submit point correctly', () => {
        spyOn(service, 'getCorrection');
        spyOn(service, 'nextAnswer').and.callThrough();
        spyOn(service, 'endCorrection' as any);
        service.initialize(mockResponsesQrl);
        service['indexPlayer'] = service.usernames.length - 1;
        service.isValid = true;
        service.inputPoint = 50;
        service.submitPoint(gameStats);
        const [sendPlayerQrlCorrection, sendPlayerQrlCorrectionObject] = sendSpy.calls.allArgs()[0];
        expect(service.getCorrection).toHaveBeenCalled();
        expect(service.nextAnswer).toHaveBeenCalled();
        expect(service.inputPoint).toEqual(0);
        expect(service.isCorrectionFinished).toBeTruthy();
        expect(service['endCorrection']).toHaveBeenCalled();
        expect(sendPlayerQrlCorrectionObject).toBeDefined();
        expect(sendPlayerQrlCorrection).toBeDefined();
    });
});
