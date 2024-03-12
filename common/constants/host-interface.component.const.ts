import { QuizQuestion } from '../interfaces/quiz.interface';

export const PLAYER_NOT_FOUND_INDEX = -1;
export const QLR_PANIC_MODE_ENABLED = 20;
export const QCM_PANIC_MODE_ENABLED = 10;
export const ACTIVE = 'Actif';
export const INACTIVE = 'Inactif';
export const ACTIVE_STATUS = 0;
export const INACTIVE_STATUS = 1;
export const VALUE = 0;
export const RESPONSE = 1;
export const NEXT_QUESTION = 'Prochaine question';
export const SHOW_RESULT = 'Montrer résultat';

export type TransportStatsFormat = [[string, boolean][], [string, number][], QuizQuestion][];
