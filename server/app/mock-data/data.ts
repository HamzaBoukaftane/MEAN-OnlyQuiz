import { QuestionType } from '@common/enums/question-type.enum';

export const gameInfoMocks = [
    {
        gameName: 'Quiz 1',
        startTime: '2023-11-13 15:30:00',
        playersCount: 4,
        bestScore: 30,
    },
    {
        gameName: 'Quiz 2',
        startTime: '2023-11-14 10:45:00',
        playersCount: 2,
        bestScore: 25,
    },
    {
        gameName: 'Quiz 3',
        startTime: '2023-11-15 20:00:00',
        playersCount: 3,
        bestScore: 40,
    },
];

export const fillerQuizzes = [
    {
        id: '1',
        title: 'Math Quiz',
        description: 'its a math quiz.',
        duration: 30,
        lastModification: '2023-10-02 19:58:41',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is 2 + 2?',
                points: 50,
                choices: [
                    { text: '3', isCorrect: false },
                    { text: '4', isCorrect: true },
                    { text: '5', isCorrect: false },
                ],
            },
            {
                type: QuestionType.QRL,
                text: 'What do you find most intriguing about the process of photosynthesis?',
                points: 30,
            },
        ],
        visible: true,
    },
    {
        id: '2',
        title: 'Science Quiz',
        description: 'its a science quiz!',
        duration: 45,
        lastModification: '2023-10-02 19:58:41',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is the chemical symbol for water?',
                points: 50,
                choices: [
                    { text: 'O2', isCorrect: false },
                    { text: 'H2O', isCorrect: true },
                    { text: 'CO2', isCorrect: false },
                ],
            },
            {
                type: QuestionType.QCM,
                text: 'What is the boiling point of water in Celsius?',
                points: 20,
                choices: [
                    { text: '0°C', isCorrect: false },
                    { text: '100°C', isCorrect: true },
                    { text: '50°C', isCorrect: false },
                    { text: '-10°C', isCorrect: false },
                ],
            },
        ],
        visible: false,
    },
];
