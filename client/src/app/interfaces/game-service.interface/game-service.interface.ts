import { QuizQuestion } from '@common/interfaces/quiz.interface';

export interface GameServiceInterface {
    question: QuizQuestion | null;
    locked: boolean;
    validated: boolean;
}
