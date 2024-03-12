import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { QuizValidationService } from './quiz-validation.service';
import { Quiz, QuizChoice } from '@common/interfaces/quiz.interface';
import { QuestionType } from '@common/enums/question-type.enum';

describe('QuizValidationService', () => {
    let service: QuizValidationService;
    let validQuiz: Quiz = {
        id: '1',
        title: 'Test Quiz',
        description: 'This is a test quiz',
        duration: 30,
        lastModification: '2023-09-28',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'Sample Question',
                points: 20,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: false },
                ],
            },
        ],
    };

    const invalidQuizMissingFields = {};
    const invalidQuizNoDuration = {
        id: '1',
        title: 'Test Quiz',
        description: 'This is a test quiz',
        lastModification: '2023-09-28',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'Sample Question',
                points: 20,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: false },
                ],
            },
        ],
    };

    const invalidQuizNoTitle = {
        id: '1',
        description: 'This is a test quiz',
        duration: 30,
        lastModification: '2023-09-28',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'Sample Question',
                points: 20,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: false },
                ],
            },
        ],
    };

    const invalidQuizNoQuestions = {
        id: '1',
        title: 'Test Quiz',
        description: 'This is a test quiz',
        duration: 30,
        lastModification: '2023-09-28',
    };

    const invalidQuizNoLastModification = {
        id: '1',
        title: 'Test Quiz',
        description: 'This is a test quiz',
        duration: 30,
        questions: [
            {
                type: QuestionType.QCM,
                text: 'Sample Question',
                points: 20,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: false },
                ],
            },
        ],
    };

    const invalidQuizWithOtherProperty = {
        bad: 'bad',
        false: 'false',
    };

    const badQuizzes = [
        invalidQuizMissingFields,
        invalidQuizNoDuration,
        invalidQuizNoTitle,
        invalidQuizNoQuestions,
        invalidQuizNoLastModification,
        invalidQuizWithOtherProperty,
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [QuizValidationService],
        });
        service = TestBed.inject(QuizValidationService);
        validQuiz = {
            id: '1',
            title: 'Test Quiz',
            description: 'This is a test quiz',
            duration: 30,
            lastModification: '2023-09-28',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Sample Question',
                    points: 20,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isQuiz method should return true if Quiz format is valid', () => {
        expect(service.isQuiz(validQuiz)).toBeTruthy();
    });

    it('isQuiz method should return false if Quiz format is not valid', () => {
        badQuizzes.forEach((badQuiz) => {
            expect(service.isQuiz(badQuiz)).toBeFalsy();
        });
    });

    it('validChoices should return null for valid choices', () => {
        const validChoices = new FormControl([
            { text: 'Choice 1', isCorrect: 'true' },
            { text: 'Choice 2', isCorrect: 'false' },
        ]);
        expect(service.validateChoicesForm(validChoices)).toEqual(null);
    });

    it('validChoices should return { invalidChoices: true } for invalid choices', () => {
        const validChoices = new FormControl([
            { text: 'Choice 1', isCorrect: 'not' },
            { text: 'Choice 2', isCorrect: 'bad' },
        ]);
        expect(service.validateChoicesForm(validChoices)).toEqual({ invalidChoices: true });
    });

    it('validChoices should return an error object for invalid choices', () => {
        const invalidChoices = new FormControl([{}]);
        const errors = service.validateChoicesForm(invalidChoices);
        expect(errors).toEqual({ invalidChoices: true });
    });

    it('divisibleByTen should return null for a value divisible by ten', () => {
        const goodNumber = 20;
        const divisibleValue = new FormControl(goodNumber);
        expect(service.divisibleByTen(divisibleValue)).toBeNull();
    });

    it('divisibleByTen should return an error object for a value not divisible by ten', () => {
        const badNumber = 15;
        const notDivisibleValue = new FormControl(badNumber);
        const errors = service.divisibleByTen(notDivisibleValue);
        expect(errors).toEqual({ notDivisibleByTen: true });
    });

    it('validateQuiz should return an empty array for a valid quiz', () => {
        const errors = service.validateQuiz(validQuiz);
        expect(errors.length).toEqual(0);
    });

    it('validateQuiz should return an array of errors for each invalid quiz', () => {
        let errors = [];
        badQuizzes.forEach((badQuiz) => {
            errors = service.validateQuiz(badQuiz as Quiz);
            expect(errors.length).toBe(errors.length);
        });
    });

    it('validateQuiz should return Le titre est requis errors for quiz without tilte', () => {
        const quizBadStub = validQuiz;
        quizBadStub.title = '';
        const error = service.validateQuiz(quizBadStub);
        expect(error).toContain('Le titre est requis');
    });

    it('validateQuiz should return La description est requise errors for quiz without description', () => {
        const quizBadStub = validQuiz;
        quizBadStub.description = '';
        const error = service.validateQuiz(quizBadStub);
        expect(error).toContain('La description est requise');
    });

    it('validateQuiz should return La durée doit être comprise entre 10 et 60 secondes errors for quiz without good duration', () => {
        const quizBadStub = validQuiz;
        quizBadStub.duration = 100;
        const errorMax = service.validateQuiz(quizBadStub);
        expect(errorMax).toContain('La durée doit être comprise entre 10 et 60 secondes');
        quizBadStub.duration = 5;
        const errorMin = service.validateQuiz(quizBadStub);
        expect(errorMin).toContain('La durée doit être comprise entre 10 et 60 secondes');
    });

    it('validateQuiz should return Le quiz devrait contenir au moins une question for quiz without question', () => {
        const quizBadStub = validQuiz;
        quizBadStub.questions = [];
        const error = service.validateQuiz(quizBadStub);
        expect(error).toContain('Le quiz devrait contenir au moins une question');
    });

    it('validateQuestion should return an empty array for a valid quiz questions', () => {
        const errors = service.validateQuestion(validQuiz.questions[0], 0);
        expect(errors.length).toBe(0);
    });

    it('validateQuestion should return Question 1 : le texte est requis if 1st questions invalid', () => {
        const stubQuestion = {
            type: QuestionType.QCM,
            text: '',
            points: 20,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        const errors = service.validateQuestion(stubQuestion, 0);
        expect(errors).toContain('Question 1 : le texte est requis.');
    });

    it("validateQuestion should return Question 1 : les points d'une question sont requis if 1st questions invalid", () => {
        const stubQuestion = {
            type: QuestionType.QCM,
            text: 'Sample Question',
            points: 0,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        const errors = service.validateQuestion(stubQuestion, 0);
        expect(errors).toContain("Question 1 : les points d'une question sont requis");
    });

    it(`validateQuestion should return Question 1 :
    les points doivent être entre 10 et 100 et être divisible par 10 if 1st questions invalid`, () => {
        const overMax = 200;
        const notFactorTen = 37;
        const stubQuestion = {
            type: QuestionType.QCM,
            text: 'Sample Question',
            points: 0,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        const errorsMin = service.validateQuestion(stubQuestion, 0);
        expect(errorsMin).toContain('Question 1 : les points doivent être entre 10 et 100');
        stubQuestion.points = overMax;
        const errorsMax = service.validateQuestion(stubQuestion, 0);
        expect(errorsMax).toContain('Question 1 : les points doivent être entre 10 et 100');
        stubQuestion.points = notFactorTen;
        const errorsTen = service.validateQuestion(stubQuestion, 0);
        expect(errorsTen).toContain('Question 1 : les points de la question doivent être divisible par 10');
        expect(errorsTen).toContain('Question 1 : les points de la question doivent être divisible par 10');
    });

    it('validateQuestionChoices should return empty array if valid question choices', () => {
        const errors = service.validateQuestionChoices(0, validQuiz.questions[0].choices);
        expect(errors).toEqual([]);
    });

    it(`validateQuestionChoices should return Question 1 :
    doit avoir au moins deux choix et au plus quatre choix if invalid number of choices`, () => {
        const stubChoicesOne = [{ text: 'Choice 1', isCorrect: true }];
        const stubChoicesFive = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: true },
            { text: 'Choice 4', isCorrect: true },
            { text: 'Choice 5', isCorrect: true },
        ];
        const errorsMin = service.validateQuestionChoices(0, stubChoicesOne as unknown[] as QuizChoice[]);
        expect(errorsMin).toContain('Question 1 : doit avoir au moins deux choix et au plus quatre choix');
        const errorsMax = service.validateQuestionChoices(0, stubChoicesFive as unknown[] as QuizChoice[]);
        expect(errorsMax).toContain('Question 1 : doit avoir au moins deux choix et au plus quatre choix');
    });

    it('validateQuestionChoices should return Question 1, Choice 1 : le texte est requis if invalid choice title', () => {
        const stubChoices = [
            { text: '', isCorrect: true },
            { text: 'Choice 1', isCorrect: false },
        ];
        const errors = service.validateQuestionChoices(0, stubChoices as unknown[] as QuizChoice[]);
        expect(errors).toContain('Question 1, Choix 1 : le texte est requis');
    });

    it('validateQuestionChoices should return Question 1, Choix 1 : un choix doit être soit vrai soit faux if invalid choice answer', () => {
        const stubChoices = [
            { text: '', isCorrect: null },
            { text: 'Choice 1', isCorrect: null },
        ];
        const errors = service.validateQuestionChoices(0, stubChoices as unknown[] as QuizChoice[]);
        expect(errors).toContain('Question 1, Choix 1 : un choix doit être soit vrai soit faux');
    });
});
