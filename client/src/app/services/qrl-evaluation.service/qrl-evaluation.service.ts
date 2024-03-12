import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GameService } from '@app/services/game.service/game.service';
import { FULL, HALF, HALF_SCORE, PERFECT_SCORE, INITIAL_ARRAY_VALUE, NULL, NULL_SCORE } from '@common/constants/qrl-evaluation.service.const';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import { QuestionStatistics } from '@common/constants/statistic-zone.component.const';

@Injectable({
    providedIn: 'root',
})
export class QrlEvaluationService {
    usernames: string[] = [];
    scores: number[] = [NULL, HALF, FULL];
    currentAnswer: string = '';
    currentUsername: string = '';
    inputPoint: number = 0;
    isCorrectionFinished: boolean = false;
    isValid: boolean = true;
    points: number[] = [];
    private correctedQrlAnswers = new Map<string, number>();
    private answers: string[] = [];
    private indexPlayer: number = INITIAL_ARRAY_VALUE;
    private questionStats = new Map<string, number>([
        [NULL_SCORE, 0],
        [HALF_SCORE, 0],
        [PERFECT_SCORE, 0],
    ]);

    constructor(
        private socketClientService: SocketClientService,
        private gameService: GameService,
    ) {}

    initialize(qrlAnswers: Map<string, { answers: string; time: number }>) {
        this.indexPlayer = -1;
        this.isCorrectionFinished = false;
        this.initializePlayerAnswers(qrlAnswers);
        this.nextAnswer();
    }

    getCorrection(point: number) {
        this.points[this.indexPlayer] = point;
    }

    nextAnswer() {
        this.indexPlayer++;
        if (this.indexPlayer <= this.usernames.length) {
            this.currentAnswer = this.answers[this.indexPlayer];
            this.currentUsername = this.usernames[this.indexPlayer];
        }
    }

    reset() {
        this.clearAll();
        this.isCorrectionFinished = false;
        this.isValid = true;
        this.currentAnswer = '';
        this.currentUsername = '';
    }

    clearAll() {
        this.usernames.splice(0, this.usernames.length);
        this.answers.splice(0, this.answers.length);
        this.points.splice(0, this.points.length);
        this.correctedQrlAnswers.clear();
        this.questionStats = new Map<string, number>([
            [NULL_SCORE, 0],
            [HALF_SCORE, 0],
            [PERFECT_SCORE, 0],
        ]);
        this.indexPlayer = -1;
    }

    submitPoint(gameStats: QuestionStatistics[]) {
        this.isValid = this.scores.includes(Number(this.inputPoint));
        if (this.indexPlayer < this.usernames.length) {
            if (this.isValid) {
                this.getCorrection(this.inputPoint);
                this.nextAnswer();
                this.inputPoint = 0;
            }
            if (this.indexPlayer >= this.usernames.length) {
                this.isCorrectionFinished = true;
                this.endCorrection(gameStats);
                this.sendPlayerEvaluations();
            }
        }
    }

    private endCorrection(gameStats: QuestionStatistics[]) {
        for (let i = 0; i < this.usernames.length; i++) {
            this.correctedQrlAnswers.set(this.usernames[i], this.points[i]);
            this.questionStats.set(String(this.points[i]), (this.questionStats.get(String(this.points[i])) as number) + 1);
        }
        const emptyMap = new Map<string, boolean>([
            [NULL_SCORE, false],
            [HALF_SCORE, false],
            [PERFECT_SCORE, true],
        ]);
        const newQuestionMap = new Map(this.questionStats);
        gameStats.push([emptyMap, newQuestionMap, this.gameService.gameRealService.question as QuizQuestion]);
    }

    private sendPlayerEvaluations() {
        const playerQrlCorrectionFormatted = JSON.stringify(Array.from(this.correctedQrlAnswers));
        this.socketClientService.send(SocketEvent.PLAYER_QRL_CORRECTION, {
            roomId: this.gameService.gameRealService.roomId,
            playerCorrection: playerQrlCorrectionFormatted,
        });
    }

    private initializePlayerAnswers(qrlAnswers: Map<string, { answers: string; time: number }>) {
        const sortedMap = new Map([...qrlAnswers.entries()].sort((a, b) => a[0].localeCompare(b[0])));
        sortedMap.forEach((value: { answers: string; time: number }, key: string) => {
            this.usernames.push(key);
            this.answers.push(value.answers);
        });
    }
}
