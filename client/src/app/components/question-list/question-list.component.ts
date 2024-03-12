import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { POPUP_TIMEOUT } from '@common/constants/quiz-creation.component.const';
import { ChoiceService } from '@app/services/choice-service/choice.service';
import { QuestionService } from '@app/services/question-service/question.service';
import { ItemMovingDirection } from 'src/enums/item-moving-direction';
import { QuestionChoicePosition } from '@app/interfaces/question-choice-position/question-choice-position';

@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent {
    @Input() questionsArray: FormArray | undefined;
    @Input() parentGroup: FormGroup;
    isPopUpVisible: boolean = false;
    questionErrors: string[] = [];
    protected readonly itemMovingDirection = ItemMovingDirection;

    constructor(
        private questionService: QuestionService,
        private choiceService: ChoiceService,
    ) {}
    showPopupIfConditionMet(condition: boolean) {
        if (condition) {
            this.isPopUpVisible = true;
            setTimeout(() => {
                this.isPopUpVisible = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    addQuestion(index: number) {
        this.questionErrors = this.questionService.addQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }

    removeQuestion(index: number) {
        this.questionService.removeQuestion(index, this.questionsArray);
    }

    modifyQuestion(index: number) {
        this.questionErrors = this.questionService.modifyQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }
    saveQuestion(index: number) {
        this.questionErrors = this.questionService.saveQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }

    moveQuestionUp(index: number) {
        this.questionService.moveQuestionUp(index, this.questionsArray);
    }

    moveQuestionDown(index: number) {
        this.questionService.moveQuestionDown(index, this.questionsArray);
    }

    moveChoice(direction: ItemMovingDirection, questionIndex: number, choiceIndex: number) {
        const choicePosition: QuestionChoicePosition = { questionNumber: questionIndex, choiceNumber: choiceIndex };
        this.choiceService.moveChoice(direction, choicePosition, this.questionsArray);
    }

    addChoice(questionIndex: number, choiceIndex: number) {
        this.choiceService.addChoice(questionIndex, choiceIndex, this.questionsArray);
    }

    removeChoice(questionIndex: number, choiceIndex: number) {
        this.choiceService.removeChoice(questionIndex, choiceIndex, this.questionsArray);
    }
    getChoicesArray(index: number) {
        return this.choiceService.getChoicesArray(index, this.questionsArray);
    }
}
