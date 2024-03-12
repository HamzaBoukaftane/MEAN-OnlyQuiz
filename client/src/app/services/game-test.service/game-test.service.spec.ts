import { TestBed } from '@angular/core/testing';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { Quiz } from '@common/interfaces/quiz.interface';
import { GameTestService } from './game-test.service';
import { of } from 'rxjs';
import { QuestionType } from '@common/enums/question-type.enum';
import { QRL_DURATION } from '@app/services/game-test.service/game-test.service.const';
/* eslint-disable  @typescript-eslint/no-explicit-any */
const TICK = 1000;
const TRANSITION_TIMER_DELAY = 3;

describe('GameTestService', () => {
    let gameTestService: GameTestService;
    let quizService: jasmine.SpyObj<QuizService>;
    let extractCorrectChoicesSpy: jasmine.Spy;
    const mockQuiz: Quiz = {
        id: '123',
        title: 'Math Quiz',
        description: 'its a math quiz.',
        duration: 1,
        lastModification: '2023-09-15',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is 2 + 2?',
                points: 50,
                choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
            },
            {
                type: QuestionType.QCM,
                text: 'What is 2 + 2?',
                points: 20,
                choices: [
                    { text: '1', isCorrect: false },
                    { text: '2', isCorrect: true },
                    { text: '3', isCorrect: true },
                ],
            },
            {
                type: QuestionType.QRL,
                text: 'What is 2 + 2?',
                points: 20,
            },
        ],
        visible: true,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameTestService, { provide: QuizService, useValue: jasmine.createSpyObj('QuizService', ['basicGetById']) }],
        });

        gameTestService = TestBed.inject(GameTestService);
        quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        gameTestService.reset();
    });

    it('should call quizService.basicGetById with the provided quizId', () => {
        const quizId = '123';
        gameTestService.getQuiz(quizId);

        expect(quizService.basicGetById).toHaveBeenCalledWith(quizId);
    });

    it('should return false when currQuestionIndex is at the end of questions', () => {
        const TIMER_VALUE = 10;
        const TIMER1 = gameTestService.timeService.createTimer(TIMER_VALUE);
        gameTestService.timeService.getTimer(0);
        expect(gameTestService.timeService.getTimer(0)).toBe(TIMER1);

        gameTestService.currQuestionIndex = 2;
        gameTestService['quiz'] = mockQuiz;
        expect(gameTestService.next()).toBe(false);
    });

    it('should increment currQuestionIndex when it is less than quiz questions length -1', () => {
        const TIMER_VALUE = 10;
        gameTestService.timeService.createTimer(TIMER_VALUE);
        gameTestService.timeService.getTimer(0);
        gameTestService['quiz'] = mockQuiz;
        gameTestService.currQuestionIndex = 0;
        gameTestService.next();
        expect(gameTestService.currQuestionIndex).toBe(1);
    });

    it('should set isBonus to false and return when the correct answer length is false', () => {
        gameTestService['quiz'] = mockQuiz;

        const answers = new Map<number, string | null>([
            [0, 'Choice 1'],
            [1, 'Choice 2'],
        ]);

        gameTestService.currQuestionIndex = 0;

        gameTestService.updateScore(answers);

        expect(gameTestService.isBonus).toBe(false);
    });

    it('should set isBonus to false and return when at least 1 answer is incorrect', () => {
        gameTestService['quiz'] = mockQuiz;

        const answers = new Map<number, string | null>([
            [0, 'Choice 1'],
            [2, 'Choice 2'],
        ]);

        gameTestService.currQuestionIndex = 1;

        gameTestService.updateScore(answers);

        expect(gameTestService.isBonus).toBe(false);
    });

    it('should set isBonus to true and add the bonus to the player score', () => {
        const BONUS_MULTIPLIER = 1.2;
        gameTestService['quiz'] = mockQuiz;

        const answers = new Map<number, string | null>([
            [1, '2'],
            [2, '3'],
        ]);

        gameTestService.currQuestionIndex = 1;
        gameTestService.question = mockQuiz.questions[1];
        gameTestService.updateScore(answers);

        expect(gameTestService.isBonus).toBe(true);
        expect(gameTestService.playerScore).toBe(mockQuiz.questions[1].points * BONUS_MULTIPLIER);
        gameTestService.question = mockQuiz.questions[2];
        gameTestService.playerScore = 0;
        gameTestService.updateScore(answers);
        expect(gameTestService.isBonus).toBe(false);
        expect(gameTestService.playerScore).toBe(mockQuiz.questions[2].points);
    });

    it('should set isBonus to false if the number of answers submitted is not equal to the number of correct choices', () => {
        gameTestService['quiz'] = mockQuiz;

        const answers = new Map<number, string | null>([[1, '2']]);

        gameTestService.currQuestionIndex = 1;
        gameTestService.question = mockQuiz.questions[1];
        gameTestService.updateScore(answers);
        expect(gameTestService.isBonus).toBe(false);
    });

    it('should set isBonus to false if one of the choices submitted is incorrect', () => {
        gameTestService['quiz'] = mockQuiz;

        const answers = new Map<number, string | null>([
            [1, '2'],
            [2, '4'],
        ]);
        gameTestService.currQuestionIndex = 1;
        gameTestService.question = mockQuiz.questions[1];
        gameTestService.updateScore(answers);
        expect(gameTestService.isBonus).toBe(false);
    });

    it('should start a timer from the timeService', () => {
        const DURATION = 20;
        spyOn(gameTestService.timeService, 'deleteAllTimers');
        spyOn(gameTestService.timeService, 'startTimer');
        gameTestService.timeService.createTimer(DURATION);
        gameTestService.startTimer(DURATION);
        expect(gameTestService.timeService.deleteAllTimers).toHaveBeenCalled();
        expect(gameTestService.timer).toEqual(gameTestService.timeService.createTimer(DURATION));
        expect(gameTestService.timeService.startTimer).toHaveBeenCalledWith(0);
    });

    it('should reset the question parameters', () => {
        spyOn(gameTestService.timeService, 'deleteAllTimers');
        gameTestService.reset();
        expect(gameTestService.timeService.deleteAllTimers).toHaveBeenCalled();
        expect(gameTestService.playerScore).toBe(0);
        expect(gameTestService.currQuestionIndex).toBe(0);
        expect(gameTestService.isBonus).toBe(false);
    });

    it('should return the correct answers of a question choices', () => {
        gameTestService['quiz'] = mockQuiz;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extractCorrectChoicesSpy = spyOn<any>(gameTestService, 'extractCorrectChoices').and.callThrough();
        expect(extractCorrectChoicesSpy(mockQuiz.questions[1].choices)).toEqual([
            { text: '2', isCorrect: true },
            { text: '3', isCorrect: true },
        ]);
    });

    it('should initialize component properly when calling init method if socket connected', () => {
        spyOn(gameTestService, 'getQuiz').and.returnValue(of(mockQuiz));
        const deleteTimersSpy = spyOn(gameTestService.timeService, 'deleteAllTimers');
        const startTimersSpy = spyOn(gameTestService, 'startTimer');
        const handleQuestionTimerSpy = spyOn<any>(gameTestService, 'handleQuestionTimerEnd');
        gameTestService.init();
        expect(gameTestService.getQuiz).toHaveBeenCalledWith(gameTestService.quizId);
        expect(deleteTimersSpy).toHaveBeenCalled();
        expect(startTimersSpy).toHaveBeenCalledWith(mockQuiz.duration);
        expect(handleQuestionTimerSpy).toHaveBeenCalled();
        gameTestService.currQuestionIndex = 2;
        gameTestService.init();
        expect(startTimersSpy).toHaveBeenCalledWith(QRL_DURATION);
    });

    it('should send answer properly if socket not connected', () => {
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');
        const updateScoreSpy = spyOn(gameTestService, 'updateScore');
        const startTimersSpy = spyOn(gameTestService, 'startTimer');
        const handleTransitionTimerSpy = spyOn<any>(gameTestService, 'handleTransitionTimer');
        gameTestService.sendAnswer();
        expect(gameTestService.validated).toBeTruthy();
        expect(gameTestService.locked).toBeTruthy();
        expect(clearTimeoutSpy).toHaveBeenCalledWith(gameTestService['timeouts'][0]);
        expect(updateScoreSpy).toHaveBeenCalledWith(gameTestService.answers);
        expect(startTimersSpy).toHaveBeenCalledWith(3);
        expect(handleTransitionTimerSpy).toHaveBeenCalled();
    });

    it('should handle question timer end correctly', (done) => {
        // Spy on the sendAnswer method
        gameTestService['quiz'] = mockQuiz;
        spyOn(gameTestService, 'sendAnswer');
        gameTestService['handleQuestionTimerEnd']();
        setTimeout(() => {
            expect(gameTestService.sendAnswer).toHaveBeenCalled();
            done();
        }, mockQuiz.duration * TICK);
    });

    it('should handle transition timer end correctly if next question is not available', (done) => {
        gameTestService['quiz'] = mockQuiz;
        gameTestService.answers = new Map();
        spyOn<any>(gameTestService, 'showFinalFeedBack');
        spyOn(gameTestService, 'next').and.returnValue(false);
        gameTestService['handleTransitionTimer']();
        setTimeout(() => {
            expect(gameTestService['showFinalFeedBack']).toHaveBeenCalled();
            done();
        }, TRANSITION_TIMER_DELAY * TICK);
    });

    it('should handle transition timer end correctly if next question is not available', (done) => {
        gameTestService['quiz'] = mockQuiz;
        spyOn<any>(gameTestService, 'hideFeedback');
        spyOn(gameTestService, 'next').and.returnValue(true);
        const startTimersSpy = spyOn(gameTestService, 'startTimer');
        const handleQuestionTimerSpy = spyOn<any>(gameTestService, 'handleQuestionTimerEnd');
        gameTestService['handleTransitionTimer']();
        setTimeout(() => {
            expect(gameTestService['hideFeedback']).toHaveBeenCalled();
            expect(startTimersSpy).toHaveBeenCalledWith(mockQuiz.duration);
            expect(handleQuestionTimerSpy).toHaveBeenCalled();
            done();
        }, TRANSITION_TIMER_DELAY * TICK);
    });

    it('should affect the correct values when hide feedback is called', () => {
        gameTestService.answers = new Map();
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');
        gameTestService['hideFeedback']();
        expect(gameTestService.validated).toBeFalsy();
        expect(gameTestService.locked).toBeFalsy();
        expect(gameTestService.isBonus).toBeFalsy();
        expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);
    });

    it('should affect the correct values when show feedback is called', () => {
        gameTestService['showFinalFeedBack']();
        expect(gameTestService.validated).toBeTruthy();
        expect(gameTestService.locked).toBeTruthy();
        expect(gameTestService.gameOver).toBeTruthy();
    });
});
