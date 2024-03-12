import { HttpClientModule } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CorrectionQRLComponent } from './correction-qrl.component';
import { QrlEvaluationService } from '@app/services/qrl-evaluation.service/qrl-evaluation.service';
import { QuestionStatistics } from '@common/constants/statistic-zone.component.const';

describe('CorrectionQRLComponent', () => {
    let component: CorrectionQRLComponent;
    let fixture: ComponentFixture<CorrectionQRLComponent>;
    let qrlEvaluationServiceMock: QrlEvaluationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [CorrectionQRLComponent],
            providers: [QrlEvaluationService],
        });
        fixture = TestBed.createComponent(CorrectionQRLComponent);
        component = fixture.componentInstance;
        qrlEvaluationServiceMock = TestBed.inject(QrlEvaluationService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change when there is a change', () => {
        spyOn(qrlEvaluationServiceMock, 'initialize');
        spyOn(qrlEvaluationServiceMock, 'clearAll');
        const changes: SimpleChanges = {
            qrlAnswers: new SimpleChange(null, 'newValueOfQrlAnswers', true),
        };
        component.ngOnChanges(changes);
        expect(qrlEvaluationServiceMock.initialize).toHaveBeenCalled();
        qrlEvaluationServiceMock.usernames = ['user1', 'user2'];
        component.ngOnChanges(changes);
        expect(qrlEvaluationServiceMock.clearAll).toHaveBeenCalled();
    });

    it('should initialize qrlEvaluationService on ngOnInit', () => {
        spyOn(qrlEvaluationServiceMock, 'initialize');
        component.ngOnInit();
        expect(qrlEvaluationServiceMock.initialize).toHaveBeenCalledWith(component.qrlAnswers);
    });

    it('should clear all on ngOnDestroy', () => {
        spyOn(qrlEvaluationServiceMock, 'clearAll');
        component.ngOnDestroy();
        expect(qrlEvaluationServiceMock.clearAll).toHaveBeenCalled();
    });

    it('should submit point and update isHostEvaluating on submitPoint', () => {
        component.isHostEvaluating = true;
        const mockGameStats: QuestionStatistics[] = [];
        spyOn(qrlEvaluationServiceMock, 'submitPoint');
        qrlEvaluationServiceMock.isCorrectionFinished = false;
        component.submitPoint();
        expect(qrlEvaluationServiceMock.submitPoint).toHaveBeenCalledWith(mockGameStats);
        expect(component.isHostEvaluating).toBe(true);

        qrlEvaluationServiceMock.isCorrectionFinished = true;
        component.submitPoint();
        expect(component.isHostEvaluating).toBe(true);
    });
});
