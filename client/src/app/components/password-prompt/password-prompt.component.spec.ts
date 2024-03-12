import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PasswordPromptComponent } from './password-prompt.component';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

describe('PasswordPromptComponent', () => {
    let component: PasswordPromptComponent;
    let fixture: ComponentFixture<PasswordPromptComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PasswordPromptComponent],
            imports: [HttpClientModule, FormsModule],
            providers: [{ provide: Router }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PasswordPromptComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should try to navigate to /game-admin-page when updatingStatus', () => {
        const routerSpy = spyOn(component.router, 'navigate').and.resolveTo();
        component.updateStatus();
        expect(routerSpy).toHaveBeenCalledWith(['/game-admin-page']);
    });

    it('should show error feedback on server negative response ', () => {
        const showFeedbackSpy = spyOn(component, 'showErrorFeedback');
        component.treatResponse(false);
        expect(showFeedbackSpy).toHaveBeenCalled();
        expect(component.loginStatus).toEqual(component['errorMessage']);
    });

    it('should remove error feedback on server positive response ', () => {
        const resetSpy = spyOn(component, 'reset');
        component.treatResponse(true);
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should reset loginStatus, inputBorderColor, and textColor on successful updateStatus', () => {
        const unEmptyString = 'notEmpty';
        component.loginStatus = unEmptyString;
        component.inputBorderColor = unEmptyString;
        component.textColor = unEmptyString;
        component.reset();
        expect(component.loginStatus).toBeNull();
        expect(component.inputBorderColor).toEqual('');
        expect(component.textColor).toEqual('');
    });

    it('should reset loginStatus, inputBorderColor, and textColor', () => {
        component.showErrorFeedback();
        expect(component.inputBorderColor).toEqual('red-border');
        expect(component.textColor).toEqual('red-text');
    });

    it('should handle keyboard event (Enter key) and click enterButton', () => {
        const enterBtn = fixture.debugElement.nativeElement.querySelector('.enter');
        const clickSpy = spyOn(enterBtn, 'click');
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
        });
        spyOnProperty(event, 'code', 'get').and.returnValue('Enter');
        document.dispatchEvent(event);
        expect(clickSpy).toHaveBeenCalled();
    });
});
