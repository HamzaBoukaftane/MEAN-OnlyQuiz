import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import {
    DIVIDER,
    MIN_QUESTION_POINTS,
    MAX_QUESTION_POINTS,
    MAX_DURATION,
    MIN_DURATION,
    MIN_NUMBER_OF_CHOICES,
    MAX_NUMBER_OF_CHOICES,
    TITLE_REQUIRED,
    DESCRIPTION_REQUIRED,
    INVALID_DURATION,
    MINIMUM_NUMBER_OF_QUESTIONS_REQUIRED,
    TEXT_REQUIRED,
    QUESTION_POINTS_REQUIRED,
    INVALID_POINTS,
    NON_DIVISIBLE_BY_TEN,
    INVALID_NUMBER_OF_CHOICES,
    INVALID_CHOICE,
    INVALID_QUESTION_CHOICES,
} from '@common/constants/quiz-validation.service.const';
import { QuestionType } from '@common/enums/question-type.enum';

@Injectable({
    providedIn: 'root',
})
export class QuizValidationService {
    isQuiz(quiz: unknown): quiz is Quiz {
        const isValid =
            typeof quiz === 'object' &&
            quiz !== null &&
            typeof (quiz as Quiz).title === 'string' &&
            typeof (quiz as Quiz).description === 'string' &&
            typeof (quiz as Quiz).duration === 'number' &&
            typeof (quiz as Quiz).lastModification === 'string' &&
            this.isQuestion(quiz as Quiz);
        return isValid;
    }

    validateChoicesForm(control: AbstractControl): { [key: string]: boolean } | null {
        const choices = control.value;
        if (
            choices.some((choice: QuizChoice) => (choice.isCorrect as unknown as string) === 'true') &&
            choices.some((choice: QuizChoice) => (choice.isCorrect as unknown as string) === 'false')
        ) {
            return null;
        } else {
            return { invalidChoices: true };
        }
    }

    divisibleByTen(control: AbstractControl): { [key: string]: boolean } | null {
        const value = control.value;
        return value % DIVIDER === 0 ? null : { notDivisibleByTen: true };
    }

    validateQuiz(quiz: Quiz): string[] {
        const errors: string[] = [];

        if (!quiz.title || !quiz.title.trim()) {
            errors.push(TITLE_REQUIRED);
        }

        if (!quiz.description || !quiz.description.trim()) {
            errors.push(DESCRIPTION_REQUIRED);
        }

        if (isNaN(quiz.duration) || quiz.duration < MIN_DURATION || quiz.duration > MAX_DURATION) {
            errors.push(INVALID_DURATION);
        }

        if (!quiz.questions || quiz.questions.length === 0) {
            errors.push(MINIMUM_NUMBER_OF_QUESTIONS_REQUIRED);
        } else {
            quiz.questions.forEach((question, index) => {
                const questionErrors = this.validateQuestion(question, index);
                errors.push(...questionErrors);
            });
        }

        return errors;
    }

    validateQuestion(question: QuizQuestion, index: number): string[] {
        const errors: string[] = [];

        if (!question.text || !question.text.trim()) {
            errors.push(`Question ${index + 1} : ${TEXT_REQUIRED}.`);
        }

        if (!question.points) {
            errors.push(`Question ${index + 1} : ${QUESTION_POINTS_REQUIRED}`);
        }

        if (question.points < MIN_QUESTION_POINTS || question.points > MAX_QUESTION_POINTS) {
            errors.push(`Question ${index + 1} : ${INVALID_POINTS}`);
        }

        if (question.points % DIVIDER !== 0) {
            errors.push(`Question ${index + 1} : ${NON_DIVISIBLE_BY_TEN}`);
        }

        if (question.type === QuestionType.QCM) {
            const choicesErrors = this.validateQuestionChoices(index, question.choices);
            errors.push(...choicesErrors);
        }

        return errors;
    }

    validateQuestionChoices(questionIndex: number, choices?: QuizChoice[]): string[] {
        const errors: string[] = [];

        if (!choices || choices.length < MIN_NUMBER_OF_CHOICES || choices.length > MAX_NUMBER_OF_CHOICES) {
            errors.push(`Question ${questionIndex + 1} : ${INVALID_NUMBER_OF_CHOICES}`);
        } else {
            choices.forEach((choice, choiceIndex) => {
                if (!choice.text || !choice.text.trim()) {
                    errors.push(`Question ${questionIndex + 1}, Choix ${choiceIndex + 1} : ${TEXT_REQUIRED}`);
                }

                if (choice.isCorrect === null || choice.isCorrect === undefined) {
                    errors.push(`Question ${questionIndex + 1}, Choix ${choiceIndex + 1} : ${INVALID_CHOICE}`);
                }
            });

            const hasCorrectChoice = choices.some((choice) => choice.isCorrect);
            const hasIncorrectChoice = choices.some((choice) => !choice.isCorrect);

            if (!hasCorrectChoice || !hasIncorrectChoice) {
                errors.push(`Question ${questionIndex + 1} : ${INVALID_QUESTION_CHOICES}`);
            }
        }
        return errors;
    }

    private isQuestion(quiz: Quiz): boolean {
        return (
            Array.isArray(quiz.questions) &&
            quiz.questions.every(
                (question) =>
                    typeof question.type === 'number' &&
                    typeof question.text === 'string' &&
                    typeof question.points === 'number' &&
                    Array.isArray(question.choices) &&
                    question.choices.every(
                        (choice) => typeof choice.text === 'string' && (choice.isCorrect === undefined || typeof choice.isCorrect === 'boolean'),
                    ),
            )
        );
    }
}
