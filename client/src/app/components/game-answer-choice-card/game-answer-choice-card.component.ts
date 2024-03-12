import { Component, EventEmitter, Input, OnChanges, Output, HostListener } from '@angular/core';
import { QuizChoice } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service/game.service';
import {
    ACTIVE_DISPLAY,
    BAD_ANSWER_DISPLAY,
    GOOD_ANSWER_DISPLAY,
    NO_EFFECT_DISPLAY,
    NORMAL_DISPLAY,
    SELECTED_DISPLAY,
} from '@common/constants/game-answer-choice-card.component.const';
import { ENTER_KEY } from '@common/shortcuts/shortcuts';

export const DEBOUNCE_TIMER = 10;

@Component({
    selector: 'app-game-answer-choice-card',
    templateUrl: './game-answer-choice-card.component.html',
    styleUrls: ['./game-answer-choice-card.component.scss'],
})
export class GameAnswerChoiceCardComponent implements OnChanges {
    @Input() choice: QuizChoice;
    @Input() index: number;
    @Output() selectEvent = new EventEmitter<number>();
    @Output() enterPressed = new EventEmitter<void>();
    isCorrect: boolean = false;
    feedbackDisplay: string = NORMAL_DISPLAY;
    private isSelected: boolean = false;

    constructor(public gameService: GameService) {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === String(this.index)) this.toggleSelect();
        else if (event.key === ENTER_KEY) this.enterPressed.emit();
    }

    ngOnChanges() {
        if (this.gameService.validatedStatus) this.showResult();
    }

    handleHoverEffect() {
        return this.gameService.lockedStatus ? NO_EFFECT_DISPLAY : ACTIVE_DISPLAY;
    }

    // ToggleSelect() has a debounce method to make sure that user selected the component
    // before sending an event to the game-answer-list. This is an added security on client
    // in order to send the right infos to server.
    toggleSelect() {
        if (!this.gameService.lockedStatus && !this.gameService.isInputFocused) {
            this.isSelected = !this.isSelected;
            const isSelected = this.isSelected;
            if (this.isSelected) this.showSelectionFeedback();
            else this.reset();
            setTimeout(() => {
                if (isSelected === this.isSelected) {
                    this.selectEvent.emit(this.index - 1);
                }
            }, DEBOUNCE_TIMER);
        }
    }

    private showResult() {
        if (this.choice.isCorrect) this.showGoodAnswerFeedBack();
        else this.showBadAnswerFeedBack();
    }

    private showSelectionFeedback() {
        this.feedbackDisplay = SELECTED_DISPLAY;
    }

    private reset() {
        this.feedbackDisplay = ACTIVE_DISPLAY;
    }

    private showGoodAnswerFeedBack() {
        this.feedbackDisplay = GOOD_ANSWER_DISPLAY;
    }

    private showBadAnswerFeedBack() {
        this.feedbackDisplay = BAD_ANSWER_DISPLAY;
    }
}
