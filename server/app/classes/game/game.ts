import { Answers } from '@app/interface/game-interface';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { Score } from '@common/interfaces/score.interface';
import { BONUS_MULTIPLIER, MAX_PERCENTAGE } from '@common/constants/game.const';
import { format } from 'date-fns-tz';
import { GameInfo } from '@common/interfaces/game-info.interface';
import { HistoryService } from '@app/services/history.service/history.service';

type Username = string;
type Players = Map<Username, Score>;
type PlayerAnswers = Map<Username, Answers>;
type ChoiceStats = Map<string, number>;

export class Game {
    currIndex: number = 0;
    quiz: Quiz;
    players: Players = new Map();
    playersAnswers: PlayerAnswers = new Map();
    currentQuizQuestion: QuizQuestion;
    question: string;
    choicesStats: ChoiceStats = new Map();
    activityStatusStats: [number, number] = [0, 0];
    correctChoices: string[] = [];
    duration: number;
    paused = false;

    gameHistoryInfo: GameInfo = { gameName: '', startTime: '', playersCount: 0, bestScore: 0 };

    constructor(
        usernames: string[],
        private readonly quizService: QuizService,
        private readonly historyService: HistoryService,
    ) {
        this.configurePlayers(usernames);
        this.gameHistoryInfo.playersCount = usernames.length;
        this.gameHistoryInfo.startTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'America/Montreal' });
    }

    async setup(id: string) {
        await this.getQuiz(id);
    }

    next() {
        this.playersAnswers.clear();
        this.choicesStats.clear();
        this.currIndex++;
        this.setValues();
    }

    storePlayerAnswer(username: string, time: number, playerAnswer: string[] | string) {
        this.playersAnswers.set(username, { answers: playerAnswer, time: this.duration - time });
    }

    removePlayer(username: string) {
        this.playersAnswers.delete(username);
        this.players.delete(username);
    }

    updateScores() {
        this.playersAnswers.forEach((player, username) => {
            if (this.validateAnswer(player.answers as string[])) this.handleGoodAnswer(username);
            else this.handleWrongAnswer(username);
        });
    }

    updateChoicesStats(isSelected: boolean, index: number) {
        const answer = this.currentQuizQuestion.choices[index].text;
        const oldValue = this.choicesStats.get(answer);
        this.choicesStats.set(answer, isSelected ? oldValue + 1 : oldValue - 1);
    }

    updatePlayerScores(playerCorrections: Map<string, number>) {
        playerCorrections.forEach((percentage, username) => {
            const playerScore = this.players.get(username);
            if (playerScore) {
                playerScore.points = playerScore.points + this.currentQuizQuestion.points * (percentage / MAX_PERCENTAGE);
                playerScore.isBonus = false;
            }
        });
    }

    switchActivityStatus(isActive: boolean) {
        this.activityStatusStats[0] = isActive ? this.activityStatusStats[0] + 1 : this.activityStatusStats[0] - 1;
        this.activityStatusStats[1] = isActive ? this.activityStatusStats[1] - 1 : this.activityStatusStats[1] + 1;
    }

    async updateGameHistory() {
        this.gameHistoryInfo.gameName = this.quiz.title;
        let maxPts = 0;
        for (const score of this.players.values()) {
            maxPts = Math.max(maxPts, score.points);
        }
        this.gameHistoryInfo.bestScore = maxPts;
        await this.historyService.add(this.gameHistoryInfo);
    }

    private validateAnswer(playerAnswers: string[]) {
        if (playerAnswers.length === 0) return false;
        for (const answer of playerAnswers) {
            if (!this.correctChoices.includes(answer)) {
                return false;
            }
        }
        return true;
    }

    private handleGoodAnswer(username: string) {
        const oldScore = this.players.get(username);
        const points = this.currentQuizQuestion.points;
        let newScore: Score;
        const fastestPlayers = this.getFastestPlayer();
        if (fastestPlayers) {
            newScore = {
                points: fastestPlayers.has(username) ? oldScore.points + this.addBonusPoint(points) : oldScore.points + points,
                bonusCount: fastestPlayers.has(username) ? oldScore.bonusCount + 1 : oldScore.bonusCount,
                isBonus: fastestPlayers.has(username),
            };
        } else {
            newScore = {
                points: oldScore.points + points,
                bonusCount: oldScore.bonusCount,
                isBonus: false,
            };
        }
        this.players.set(username, newScore);
    }

    private addBonusPoint(points: number) {
        return points * BONUS_MULTIPLIER;
    }

    private handleWrongAnswer(username: string) {
        this.players.get(username).isBonus = false;
        this.playersAnswers.delete(username);
    }

    private getAllPlayersCorrectAnswer() {
        const playersCorrectAnswer: PlayerAnswers = new Map();
        this.playersAnswers.forEach((player, username) => {
            if (this.validateAnswer(player.answers as string[])) {
                playersCorrectAnswer.set(username, player);
            }
        });
        return playersCorrectAnswer;
    }

    private getFastestPlayer() {
        let lowestTime = Infinity;
        const lowestTimePlayers: PlayerAnswers = new Map();
        const playerAnswers = this.getAllPlayersCorrectAnswer();
        for (const [username, answers] of playerAnswers) {
            if (answers.time < lowestTime) {
                lowestTime = answers.time;
                lowestTimePlayers.clear();
                lowestTimePlayers.set(username, answers);
            } else if (answers.time === lowestTime) {
                lowestTimePlayers.set(username, answers);
            }
        }
        return lowestTimePlayers.size === 1 ? lowestTimePlayers : null;
    }

    private configurePlayers(usernames: string[]) {
        usernames.forEach((username) => {
            const score = { points: 0, bonusCount: 0, isBonus: false };
            this.players.set(username, score);
        });
    }

    private setValues() {
        this.currentQuizQuestion = this.quiz.questions[this.currIndex];
        this.question = this.currentQuizQuestion.text;
        this.getAllCorrectChoices();
        this.duration = this.quiz.duration;
        this.currentQuizQuestion.choices?.forEach((choice) => {
            this.choicesStats.set(choice.text, 0);
        });
        this.activityStatusStats = [0, this.players.size];
    }

    private getAllCorrectChoices() {
        this.currentQuizQuestion.choices?.forEach((choice: QuizChoice) => {
            if (choice.isCorrect) this.correctChoices.push(choice.text);
        });
    }

    private async getQuiz(quizId: string) {
        this.quiz = await this.quizService.getById(quizId);
        this.setValues();
    }
}
