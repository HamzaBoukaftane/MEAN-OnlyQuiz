import { expect } from 'chai';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuestionType } from '@common/enums/question-type.enum';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { QuizService } from '@app/services/quiz.service/quiz.service';
chai.use(chaiAsPromised);
import { MongoClient, ObjectId } from 'mongodb';
import { DatabaseServiceMock } from '@app/services/database.service/database.service.mock';
import { Game } from './game';
import * as sinon from 'sinon';
import { DatabaseService } from '@app/services/database.service/database.service';
import { HistoryService } from '@app/services/history.service/history.service';

const MAX_TIME = 800;
const MID_TIME = 1000;
const MIN_TIME = 1200;

interface QuizMock {
    _id: ObjectId;
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: string | null;
    questions: QuizQuestion[];
    visible: boolean;
}

describe('Game', () => {
    let game: Game;
    let databaseService: DatabaseServiceMock;
    let quizService: QuizService;
    let historyService: HistoryService;
    const testQuiz: QuizMock = {
        _id: new ObjectId(),
        id: 'quiz123',
        title: 'Sample Quiz',
        description: 'This is a sample quiz for testing purposes.',
        duration: 180,
        lastModification: 'none',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'London', isCorrect: false },
                    { text: 'Berlin', isCorrect: false },
                    { text: 'Madrid', isCorrect: false },
                ],
            },
            {
                type: QuestionType.QCM,
                text: 'Which of the following are prime numbers?',
                points: 15,
                choices: [
                    { text: '2', isCorrect: true },
                    { text: '4', isCorrect: false },
                    { text: '7', isCorrect: true },
                    { text: '10', isCorrect: false },
                ],
            },
            {
                type: QuestionType.QRL,
                text: 'What do you find most intriguing about the process of photosynthesis?',
                points: 30,
            },
        ],
        visible: true,
    };

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        (await databaseService.start()) as MongoClient;
        quizService = new QuizService(databaseService as unknown as DatabaseService);
        historyService = new HistoryService(databaseService as unknown as DatabaseService);
        delete testQuiz['_id'];
        await quizService.collection.insertOne(testQuiz);
        game = new Game(['Player1', 'Player2'], quizService, historyService);
        await game.setup(testQuiz.id);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
        sinon.restore();
    });

    it('should initialize instance game correctly', () => {
        const getQuizSpy = sinon.spy(game['getQuiz']);

        expect(game.players.size).to.equal(2);
        expect(getQuizSpy.called);
    });

    it('should upload next question when calling next', () => {
        game.next();
        expect(game.currIndex).to.equal(1);
        expect(game.question).to.equal(testQuiz.questions[game.currIndex].text);
        expect(game.playersAnswers.size).to.equal(0);
    });

    it('should correctly validate answers', () => {
        game.correctChoices = ['choice1', 'choice2'];
        const invalidAnswer = ['choice1', 'choice3'];
        const invalidLength = ['choice1', 'choice2', 'plus'];
        expect(game['validateAnswer'](game.correctChoices)).to.equal(true);
        expect(game['validateAnswer'](invalidLength)).to.equal(false);
        expect(game['validateAnswer'](invalidAnswer)).to.equal(false);
    });

    it('should return false if no answer is valid', () => {
        game.playersAnswers = new Map();
        expect(game['validateAnswer']([])).to.equal(false);
    });

    it('should remove a player', () => {
        game.storePlayerAnswer('Player1', MID_TIME, ['Paris']);
        game.storePlayerAnswer('Player2', MIN_TIME, ['Paris']);
        game.storePlayerAnswer('Player3', MAX_TIME, ['Paris']);
        expect(game.playersAnswers.size).to.equal(3);
        game.removePlayer('Player2');
        expect(game.playersAnswers.size).to.equal(2);
        expect(game.playersAnswers.has('Player2')).to.equal(false);
    });

    it('should handle wrong answers', () => {
        game.currentQuizQuestion = testQuiz.questions[0];
        game.correctChoices = ['Paris'];
        game.players = new Map([
            ['Player1', { points: 100, bonusCount: 5, isBonus: true }],
            ['Player2', { points: 75, bonusCount: 3, isBonus: false }],
            ['Player3', { points: 1, bonusCount: 5, isBonus: false }],
        ]);

        game['handleWrongAnswer']('Player1');
        game['handleWrongAnswer']('Player2');
        game['handleWrongAnswer']('Player3');
        expect(game.playersAnswers.size).to.equal(0);
    });

    it('should get all players with correct answers', () => {
        game.currentQuizQuestion = testQuiz.questions[0];
        game.correctChoices = ['Paris'];
        game.storePlayerAnswer('Player1', MAX_TIME, ['Paris']);
        game.storePlayerAnswer('Player2', MID_TIME, ['Paris']);
        game.storePlayerAnswer('Player3', MAX_TIME, ['London']);
        game.storePlayerAnswer('Player4', MID_TIME, ['Paris']);
        game.storePlayerAnswer('Player5', MAX_TIME, ['Paris']);
        const playersWithCorrectAnswers = game['getAllPlayersCorrectAnswer']();
        const expectedNumberOfCorrectAns = 4;
        expect(playersWithCorrectAnswers.size).to.equal(expectedNumberOfCorrectAns);
        expect(playersWithCorrectAnswers.has('Player1')).to.equal(true);
        expect(playersWithCorrectAnswers.has('Player2')).to.equal(true);
        expect(playersWithCorrectAnswers.has('Player4')).to.equal(true);
        expect(playersWithCorrectAnswers.has('Player5')).to.equal(true);
    });

    it('should correctly add bonus points', () => {
        const points = 10;
        const bonusPoints = game['addBonusPoint'](points);
        const expectedScore = 12;
        expect(bonusPoints).to.equal(expectedScore);
    });

    it('should not add bonus points if no player is faster than all the others', () => {
        game.storePlayerAnswer('Player1', MID_TIME, ['Paris']);
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const getFasterPlayerSpy = sinon.stub(game, 'getFastestPlayer' as any);
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        getFasterPlayerSpy.returns(null);
        const points = 10;
        const expectedNewScore = {
            points,
            bonusCount: 0,
        };
        game['handleGoodAnswer']('Player1');
        expect(game.players.get('Player1').points).to.equal(expectedNewScore.points);
        expect(game.players.get('Player1').bonusCount).to.equal(expectedNewScore.bonusCount);
    });

    it('should configure players correctly', () => {
        expect(game.players.size).to.equal(2);
        expect(game.players.get('Player1')).to.deep.equal({ points: 0, isBonus: false, bonusCount: 0 });
        expect(game.players.get('Player2')).to.deep.equal({ points: 0, isBonus: false, bonusCount: 0 });
    });

    it('should set values correctly for a qcm', () => {
        game['setValues']();
        const expectedSizeOfChoicesStats = 4;
        expect(game.currentQuizQuestion).to.deep.equal(testQuiz.questions[0]);
        expect(game.question).to.equal('What is the capital of France?');
        expect(game.choicesStats.size).to.equal(expectedSizeOfChoicesStats);
        expect(game.choicesStats.get('Paris')).to.equal(0);
        expect(game.choicesStats.get('London')).to.equal(0);
        expect(game.choicesStats.get('Berlin')).to.equal(0);
        expect(game.choicesStats.get('Madrid')).to.equal(0);
    });

    it('should set values correctly for a qrl', () => {
        game.currIndex = 2;
        game['setValues']();
        expect(game.currentQuizQuestion).to.deep.equal(testQuiz.questions[2]);
        expect(game.question).to.equal('What do you find most intriguing about the process of photosynthesis?');
        expect(game.currentQuizQuestion.choices).to.equal(undefined);
    });

    it('should correctly handle cases where there is one fastest player', () => {
        game.duration = 2000;
        game.storePlayerAnswer('Player1', MID_TIME, ['Paris']);
        game.storePlayerAnswer('Player2', MIN_TIME, ['Paris']);
        game.storePlayerAnswer('Player3', MAX_TIME, ['Paris']);

        const fastestPlayer = game['getFastestPlayer']();
        expect(fastestPlayer.get('Player2').time).to.equal(game.duration - MIN_TIME);
    });

    it('should update choicesStats correctly', () => {
        game.currentQuizQuestion = testQuiz.questions[0];
        game.choicesStats.set('Paris', 2);
        game.choicesStats.set('London', 1);
        const playerAnswerOne = 0;
        const playerAnswerTwo = 1;
        game['updateChoicesStats'](false, playerAnswerOne);
        expect(game.choicesStats.get('Paris')).to.equal(1);
        game['updateChoicesStats'](true, playerAnswerTwo);
        expect(game.choicesStats.get('London')).to.equal(2);
    });

    it('should update player scores correctly when the question is open ended', () => {
        game.currentQuizQuestion = testQuiz.questions[2];
        const HALF_MULTIPLIER = 0.5;
        const HALF = 50;
        const FULL = 100;
        const playerEvaluations = new Map<string, number>([
            ['Player1', 0],
            ['Player2', HALF],
            ['Player3', FULL],
        ]);
        game.updatePlayerScores(playerEvaluations);
        expect(game.players.get('Player1')).to.deep.equal({ points: 0, isBonus: false, bonusCount: 0 });
        expect(game.players.get('Player2')).to.deep.equal({
            points: game.currentQuizQuestion.points * HALF_MULTIPLIER,
            isBonus: false,
            bonusCount: 0,
        });
    });

    it('should update the validity stats correctly', () => {
        game.activityStatusStats = [1, 1];
        game.switchActivityStatus(true);
        expect(game.activityStatusStats).to.deep.equal([2, 0]);
        game.switchActivityStatus(false);
        expect(game.activityStatusStats).to.deep.equal([1, 1]);
    });

    it('should update game history correctly', async () => {
        const addSpy = sinon.spy(game['historyService'], 'add');
        await game.updateGameHistory();
        expect(game.gameHistoryInfo.gameName).to.equal(testQuiz.title);
        expect(game.gameHistoryInfo.bestScore).to.equal(0);
        expect(addSpy.calledWith(game.gameHistoryInfo));
    });

    it('should correctly handle cases where there is no fastest player', () => {
        game.storePlayerAnswer('Player1', MID_TIME, ['Paris']);
        game.storePlayerAnswer('Player2', MID_TIME, ['Paris']);
        const fastestPlayer = game['getFastestPlayer']();
        expect(fastestPlayer).to.equal(null);
    });

    it('should update scores correctly for good answers', () => {
        game.currentQuizQuestion = testQuiz.questions[0];
        game.correctChoices = ['Paris'];
        game.duration = 2000;
        game.playersAnswers = new Map();
        game.players.set('Player1', { points: 0, bonusCount: 0, isBonus: false });
        game.players.set('Player2', { points: 0, bonusCount: 0, isBonus: false });
        game.players.set('Player3', { points: 0, bonusCount: 0, isBonus: false });
        game.storePlayerAnswer('Player1', MID_TIME, ['Paris']);
        game.storePlayerAnswer('Player2', MIN_TIME, ['Paris']);
        game.storePlayerAnswer('Player3', MAX_TIME, ['London']);
        game['updateScores']();
        const expectedScore = 10;
        const expectedScoreBonus = 12;
        const player1Score = game.players.get('Player1');
        expect(player1Score.points).to.equal(expectedScore);
        expect(player1Score.bonusCount).to.equal(0);
        const player2Score = game.players.get('Player2');
        expect(player2Score.points).to.equal(expectedScoreBonus);
        expect(player2Score.bonusCount).to.equal(1);
        const player3Score = game.players.get('Player3');
        expect(player3Score.points).to.equal(0);
        expect(player3Score.bonusCount).to.equal(0);
    });

    it('should handle the case where there are no correct choices for a question', () => {
        game.currentQuizQuestion = testQuiz.questions[1];
        game.correctChoices = [];
        game.playersAnswers = new Map();
        game.players.set('Player1', { points: 0, bonusCount: 0, isBonus: false });
        game.players.set('Player2', { points: 0, bonusCount: 0, isBonus: false });
        game.storePlayerAnswer('Player1', MID_TIME, ['Paris']);
        game.storePlayerAnswer('Player2', MIN_TIME, ['London']);
        game['updateScores']();
        const player1Score = game.players.get('Player1');
        expect(player1Score.points).to.equal(0);
        expect(player1Score.bonusCount).to.equal(0);
        const player2Score = game.players.get('Player2');
        expect(player2Score.points).to.equal(0);
        expect(player2Score.bonusCount).to.equal(0);
    });

    it('should correctly handle cases where there are multiple fastest players with the same time', () => {
        game.currentQuizQuestion = testQuiz.questions[0];
        game.correctChoices = ['Paris'];
        game.playersAnswers = new Map();
        game.players.set('Player1', { points: 0, bonusCount: 0, isBonus: false });
        game.players.set('Player2', { points: 0, bonusCount: 0, isBonus: false });
        game.players.set('Player3', { points: 0, bonusCount: 0, isBonus: false });
        game.storePlayerAnswer('Player1', MIN_TIME, ['Paris']);
        game.storePlayerAnswer('Player2', MIN_TIME, ['Paris']);
        game.storePlayerAnswer('Player3', MIN_TIME, ['Paris']);
        const fastestPlayers = game['getFastestPlayer']();
        expect(fastestPlayers).to.equal(null);
    });
});
