import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ErrorDictionary } from '@common/browser-message/error-message/error-message';
import { NO_COLOR, RED_BORDER, RED_TEXT } from '@common/style/style';

@Component({
    selector: 'app-unique-quiz-error-feedback',
    templateUrl: './unique-quiz-error-feedback.component.html',
    styleUrls: ['./unique-quiz-error-feedback.component.scss'],
})
export class UniqueQuizErrorFeedbackComponent {
    @Input() quizName: string;
    @Output() sendNewQuizName: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancelOperation: EventEmitter<boolean> = new EventEmitter<boolean>();

    newQuizName: string | undefined = '';
    inputBorderColor: string = NO_COLOR;
    textColor: string = NO_COLOR;
    error: string = '';

    emitQuizName() {
        if (this.newQuizName === undefined) {
            this.error = ErrorDictionary.NAME_EMPTY;
            this.showErrorFeedback();
        } else {
            this.sendNewQuizName.emit(this.newQuizName);
            this.reset();
        }
    }

    returnToList() {
        this.cancelOperation.emit(true);
    }

    private reset() {
        this.textColor = NO_COLOR;
        this.inputBorderColor = NO_COLOR;
        this.newQuizName = '';
    }

    private showErrorFeedback() {
        this.textColor = RED_TEXT;
        this.inputBorderColor = RED_BORDER;
    }
}
