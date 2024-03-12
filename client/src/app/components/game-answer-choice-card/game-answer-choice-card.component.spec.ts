import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DEBOUNCE_TIMER, GameAnswerChoiceCardComponent } from './game-answer-choice-card.component';
import { HttpClientModule } from '@angular/common/http';

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('GameAnswerChoiceCardComponent', () => {
    let component: GameAnswerChoiceCardComponent;
    let fixture: ComponentFixture<GameAnswerChoiceCardComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [GameAnswerChoiceCardComponent],
        });
        fixture = TestBed.createComponent(GameAnswerChoiceCardComponent);
        component = fixture.componentInstance;
        component.choice = { text: 'test', isCorrect: true };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call toggle select when pressing item index on key board', () => {
        const toggleSelectSpy = spyOn(component, 'toggleSelect');
        const emitSpy = spyOn(component.enterPressed, 'emit');
        component.index = 1;
        const keyboardEvent = new KeyboardEvent('keydown', { key: '1' });
        component.handleKeyboardEvent(keyboardEvent);
        expect(toggleSelectSpy).toHaveBeenCalled();
        expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should call toggle select when pressing item index on key board', () => {
        const toggleSelectSpy = spyOn(component, 'toggleSelect');
        const emitSpy = spyOn(component.enterPressed, 'emit');
        component.index = 1;
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.handleKeyboardEvent(keyboardEvent);
        expect(toggleSelectSpy).not.toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('should call show Result during validation state', () => {
        const showResultSpy = spyOn<any>(component, 'showResult');
        component['gameService'].isTestMode = false;
        component['gameService'].gameRealService.validated = true;
        component.ngOnChanges();
        expect(showResultSpy).toHaveBeenCalled();
    });

    it('should not call show Result if not during validation state', () => {
        const showResultSpy = spyOn<any>(component, 'showResult');
        component['gameService'].isTestMode = false;
        component['gameService'].gameRealService.validated = false;
        component.ngOnChanges();
        expect(showResultSpy).not.toHaveBeenCalled();
    });

    it('should change isSelected value to true and show the appropriate feedback and emit the right number', fakeAsync(() => {
        const showSelectionFeedbackSpy = spyOn<any>(component, 'showSelectionFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        const emitSpy = spyOn(component.selectEvent, 'emit');
        component['isSelected'] = false;
        component.index = 1;
        component.toggleSelect();
        tick(DEBOUNCE_TIMER);
        expect(showSelectionFeedbackSpy).toHaveBeenCalled();
        expect(resetSpy).not.toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(0);
    }));

    it('should change isSelected value to false and show the appropriate feedback and emit the right number', fakeAsync(() => {
        const showSelectionFeedbackSpy = spyOn<any>(component, 'showSelectionFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        const emitSpy = spyOn(component.selectEvent, 'emit');
        component['isSelected'] = true;
        component.index = 1;
        component.toggleSelect();
        tick(DEBOUNCE_TIMER);
        expect(showSelectionFeedbackSpy).not.toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(0);
    }));

    it('should change isSelected value to false and show the appropriate feedback and emit the right number', fakeAsync(() => {
        const toggleSpy = spyOn<any>(component, 'toggleSelect');
        component['isSelected'] = false;
        component.index = 1;
        component.toggleSelect();
        component['isSelected'] = true;
        tick(DEBOUNCE_TIMER);
        expect(toggleSpy).toHaveBeenCalled();
    }));

    it('should show the appropriate feedback according to choice correctness value', () => {
        const showGoodAnswerFeedBackSpy = spyOn<any>(component, 'showGoodAnswerFeedBack');
        const showBadAnswerFeedBackSpy = spyOn<any>(component, 'showBadAnswerFeedBack');
        component.choice.text = 'test';
        component.choice.isCorrect = false;
        component['showResult']();
        expect(showGoodAnswerFeedBackSpy).not.toHaveBeenCalled();
        expect(showBadAnswerFeedBackSpy).toHaveBeenCalled();
        showBadAnswerFeedBackSpy.calls.reset();
        component.choice.isCorrect = true;
        component['showResult']();
        expect(showGoodAnswerFeedBackSpy).toHaveBeenCalled();
        expect(showBadAnswerFeedBackSpy).not.toHaveBeenCalled();
    });

    it('should set the class to normal when calling reset', () => {
        component['reset']();
        expect(component.feedbackDisplay).toEqual('active');
    });

    it('should set the class to selected when calling showSelectionFeedback', () => {
        component['showSelectionFeedback']();
        expect(component.feedbackDisplay).toEqual('selected');
    });

    it('should set the class to selected when calling showSelectionFeedback', () => {
        component['showGoodAnswerFeedBack']();
        expect(component.feedbackDisplay).toEqual('good-answer');
    });

    it('should set the class to selected when calling showSelectionFeedback', () => {
        component['showBadAnswerFeedBack']();
        expect(component.feedbackDisplay).toEqual('bad-answer');
    });

    it('should handle hover effect', () => {
        component['gameService'].isTestMode = false;
        component['gameService'].gameRealService.locked = true;
        expect(component.handleHoverEffect()).toEqual('');
        component['gameService'].gameRealService.locked = false;
        expect(component.handleHoverEffect()).toEqual('active');
    });
});
