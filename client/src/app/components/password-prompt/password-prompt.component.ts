import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service/admin-authenticator.service';
import { ErrorDictionary } from '@common/browser-message/error-message/error-message';
import { GAME_ADMIN_PAGE } from '@common/page-url/page-url';
import { NO_COLOR, RED_BORDER, RED_TEXT } from '@common/style/style';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    @ViewChild('enterButton', { static: false }) enterButton: ElementRef;
    loginStatus: string | null = null;
    inputBorderColor: string = '';
    textColor: string = '';
    private errorMessage: string = ErrorDictionary.WRONG_PASSWORD;

    constructor(
        public router: Router,
        public authenticatorService: AdminAuthenticatorService,
    ) {}

    @HostListener('document:keydown.enter')
    handleKeyboardEvent() {
        this.enterButton.nativeElement.click();
    }

    updateStatus() {
        this.router.navigate([`/${GAME_ADMIN_PAGE}`]).then((res) => {
            this.treatResponse(res);
        });
    }

    treatResponse(res: boolean): void {
        if (!res) {
            this.loginStatus = this.errorMessage;
            this.showErrorFeedback();
        } else {
            this.reset();
        }
    }

    reset() {
        this.loginStatus = null;
        this.textColor = NO_COLOR;
        this.inputBorderColor = NO_COLOR;
    }

    showErrorFeedback() {
        this.textColor = RED_TEXT;
        this.inputBorderColor = RED_BORDER;
    }
}
