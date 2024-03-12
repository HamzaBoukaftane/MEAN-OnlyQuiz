import { QuizQuestion } from './quiz.interface';

export interface InitialQuestionData {
    question: QuizQuestion;
    username: string;
    index: number;
    numberOfQuestions: number;
}

export interface NextQuestionData {
    question: QuizQuestion;
    index: number;
    isLast: boolean;
}
