import { QuestionType } from '../enums/question-type.enum';
import { QuizQuestion } from '../interfaces/quiz.interface';
import { ResponsesNumber, ResponsesValues } from '../constants/statistic-histogram.component.const';

export type QuestionStatistics = [ResponsesValues, ResponsesNumber, QuizQuestion | undefined];

export enum QuestionStats {
    RESPONSES_VALUES_INDEX,
    RESPONSES_NUMBER_INDEX,
    QUIZ_QUESTION_INDEX,
}

const responses1: Map<string, boolean> = new Map<string, boolean>([
    ['Option A', true],
    ['Option B', false],
    ['Option C', true],
]);

const numberOfResponses1: Map<string, number> = new Map<string, number>([
    ['Option A', 0],
    ['Option B', 0],
    ['Option C', 0],
]);

// Responses 2
const responses2: Map<string, boolean> = new Map<string, boolean>([
    ['Option X', true],
    ['Option Y', false],
    ['Option Z', true],
]);

const numberOfResponses2: Map<string, number> = new Map<string, number>([
    ['Option X', 0],
    ['Option Y', 0],
    ['Option Z', 0],
]);

// Responses 3
const responses3: Map<string, boolean> = new Map<string, boolean>([
    ['Choice 1', true],
    ['Choice 2', false],
    ['Choice 3', true],
]);

const numberOfResponses3: Map<string, number> = new Map<string, number>([
    ['Choice 1', 0],
    ['Choice 2', 0],
    ['Choice 3', 0],
]);

export const question: QuizQuestion = {
    type: QuestionType.QCM,
    text: 'Which of the following options is correct?',
    points: 1,
    choices: [
        { text: 'Option A', isCorrect: true },
        { text: 'Option B', isCorrect: false },
        { text: 'Option C', isCorrect: true },
    ],
};

const question2: QuizQuestion = {
    type: QuestionType.QCM,
    text: 'Choose the right answer from the following options:',
    points: 1,
    choices: [
        { text: 'Option X', isCorrect: true },
        { text: 'Option Y', isCorrect: false },
        { text: 'Option Z', isCorrect: true },
    ],
};

const question3: QuizQuestion = {
    type: QuestionType.QCM,
    text: 'Select the correct option from the choices below:',
    points: 1,
    choices: [
        { text: 'Option 1', isCorrect: true },
        { text: 'Option 2', isCorrect: false },
        { text: 'Option 3', isCorrect: true },
    ],
};

export const mockStats: QuestionStatistics[] = [
    [responses1, numberOfResponses1, question],
    [responses2, numberOfResponses2, question2],
    [responses3, numberOfResponses3, question3],
];
