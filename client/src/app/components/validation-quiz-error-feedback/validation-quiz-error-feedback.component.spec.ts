import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidationQuizErrorFeedbackComponent } from './validation-quiz-error-feedback.component';
import { FormsModule } from '@angular/forms';

describe('ValidationQuizErrorFeedbackComponent', () => {
    let component: ValidationQuizErrorFeedbackComponent;
    let fixture: ComponentFixture<ValidationQuizErrorFeedbackComponent>;
    let cancelOperationSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ValidationQuizErrorFeedbackComponent],
            imports: [FormsModule],
        });
        fixture = TestBed.createComponent(ValidationQuizErrorFeedbackComponent);
        component = fixture.componentInstance;
        cancelOperationSpy = spyOn(component.cancelOperation, 'emit');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit true when enter button is clicked', () => {
        const enterBtn = fixture.debugElement.nativeElement.querySelector('.enter');
        enterBtn.click();
        expect(cancelOperationSpy).toHaveBeenCalledWith(true);
    });

    it('should replace blank space with <br> for HTML rendering', () => {
        component.errors = '\n\n\n';
        const expectedResult = '<br><br><br>';
        expect(component.errorsWithLineBreaks).toEqual(expectedResult);
    });
});
