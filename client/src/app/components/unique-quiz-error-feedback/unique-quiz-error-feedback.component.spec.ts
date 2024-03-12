import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniqueQuizErrorFeedbackComponent } from './unique-quiz-error-feedback.component';
import { FormsModule } from '@angular/forms';

describe('UniqueQuizErrorFeedbackComponent', () => {
    let component: UniqueQuizErrorFeedbackComponent;
    let fixture: ComponentFixture<UniqueQuizErrorFeedbackComponent>;
    let sendNewQuizNameSpy: jasmine.Spy;
    let cancelOperationSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [UniqueQuizErrorFeedbackComponent],
            imports: [FormsModule],
        });
        fixture = TestBed.createComponent(UniqueQuizErrorFeedbackComponent);
        component = fixture.componentInstance;
        sendNewQuizNameSpy = spyOn(component.sendNewQuizName, 'emit');
        cancelOperationSpy = spyOn(component.cancelOperation, 'emit');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the new quiz name when change button is clicked', () => {
        const changeBtn = fixture.debugElement.nativeElement.querySelector('.enter');
        component.newQuizName = 'New Quiz Name';
        changeBtn.click();
        expect(sendNewQuizNameSpy).toHaveBeenCalledWith('New Quiz Name');
    });

    it('should emit true when cancel button is clicked', () => {
        const cancelBtn = fixture.debugElement.nativeElement.querySelector('.cancel');
        cancelBtn.click();
        expect(cancelOperationSpy).toHaveBeenCalledWith(true);
    });

    it('should show an error message if the newQuizName is undefined', () => {
        component.newQuizName = undefined;
        component.emitQuizName();
        expect(component.error).toBe('Le nom ne doit pas être vide!');
        expect(component.textColor).toBe('red-text');
        expect(component.inputBorderColor).toBe('red-border');
    });

    it('should reset the component state after emitting the quiz name', () => {
        component.newQuizName = 'New Quiz Name';
        component.emitQuizName();
        expect(component.newQuizName).toBe('');
        expect(component.error).toBe('');
        expect(component.textColor).toBe('');
        expect(component.inputBorderColor).toBe('');
    });
});
