import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';
import { QuizValidationService } from '@app/services/quiz-validation.service/quiz-validation.service';
import { NON_EXISTANT_INDEX } from '@common/constants/question.service.const';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    modifiedQuestionIndex: number = NON_EXISTANT_INDEX;

    constructor(
        private validationService: QuizValidationService,
        private quizFormService: QuizFormService,
    ) {}

    addQuestion(index: number, questionsFormArray?: FormArray) {
        if (this.modifiedQuestionIndex !== NON_EXISTANT_INDEX) {
            const validationErrors = this.saveQuestion(this.modifiedQuestionIndex, questionsFormArray);
            if (validationErrors.length !== 0) {
                return validationErrors;
            }
        }
        const newQuestion = this.quizFormService.initQuestion();
        questionsFormArray?.insert(index + 1, newQuestion);
        this.modifiedQuestionIndex = index + 1;
        return [];
    }

    removeQuestion(index: number, questionsFormArray?: FormArray) {
        if (index === this.modifiedQuestionIndex) {
            this.modifiedQuestionIndex = -1;
        } else if (index < this.modifiedQuestionIndex) {
            this.modifiedQuestionIndex--;
        }
        questionsFormArray?.removeAt(index);
    }

    modifyQuestion(index: number, questionFormArray?: FormArray) {
        if (this.modifiedQuestionIndex !== NON_EXISTANT_INDEX) {
            const validationErrors = this.saveQuestion(this.modifiedQuestionIndex, questionFormArray);
            if (validationErrors.length !== 0) {
                return validationErrors;
            }
        }
        questionFormArray?.at(index).patchValue({ beingModified: true });
        this.modifiedQuestionIndex = index;
        return [];
    }

    saveQuestion(index: number, questionsFormArray?: FormArray): string[] {
        const questionToSave = questionsFormArray?.at(index);
        if (questionToSave?.valid) {
            questionsFormArray?.at(index).patchValue({ beingModified: false });
            return [];
        }
        const question = this.quizFormService.extractQuestion(questionToSave);
        return this.validationService.validateQuestion(question, index);
    }

    moveQuestionUp(index: number, questionsFormArray?: FormArray) {
        this.swapElements(index, index - 1, questionsFormArray);
        if (this.modifiedQuestionIndex === index) {
            this.modifiedQuestionIndex--;
        } else if (this.modifiedQuestionIndex === index - 1) {
            this.modifiedQuestionIndex = index;
        }
    }

    moveQuestionDown(index: number, questionsFormArray?: FormArray) {
        this.swapElements(index, index + 1, questionsFormArray);
        if (this.modifiedQuestionIndex === index) {
            this.modifiedQuestionIndex++;
        } else if (this.modifiedQuestionIndex === index + 1) {
            this.modifiedQuestionIndex = index;
        }
    }

    swapElements(firstIndex: number, secondIndex: number, arrayForm?: FormArray) {
        const elementA = arrayForm?.at(firstIndex) as FormGroup;
        const elementB = arrayForm?.at(secondIndex) as FormGroup;
        arrayForm?.setControl(firstIndex, elementB);
        arrayForm?.setControl(secondIndex, elementA);
    }
}
