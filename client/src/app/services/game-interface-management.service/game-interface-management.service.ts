import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MAX_PERCENTAGE } from '@common/constants/game-interface.component.const';
import { TransportStatsFormat } from '@common/constants/host-interface.component.const';
import { QuestionStatistics } from '@common/constants/statistic-zone.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { TimerMessage } from '@common/browser-message/displayable-message/timer-message';
import { QuestionType } from '@common/enums/question-type.enum';
import { Score } from '@common/interfaces/score.interface';
import { HOST_USERNAME } from '@common/names/host-username';
import { SocketEvent } from '@common/socket-event-name/socket-event-name';

type Player = [string, number];

@Injectable({
    providedIn: 'root',
})
export class GameInterfaceManagementService {
    isBonus: boolean = false;
    isGameOver: boolean = false;
    playerScore: number = 0;
    timerText: string = TimerMessage.TIME_LEFT;
    players: Player[] = [];
    inPanicMode: boolean = false;
    gameStats: QuestionStatistics[] = [];
    private router: Router = inject(Router);

    constructor(
        public gameService: GameService,
        private socketService: SocketClientService,
        private interactiveListService: InteractiveListSocketService,
    ) {}

    setup(pathId: string) {
        if (this.gameService.isTestMode) {
            if (this.socketService.isSocketAlive()) this.socketService.disconnect();
        }
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init(pathId);
    }

    reset() {
        this.players = [];
        this.isGameOver = false;
        this.playerScore = 0;
        this.gameStats = [];
        this.isBonus = false;
        this.inPanicMode = false;
        this.timerText = TimerMessage.TIME_LEFT;
    }

    configureBaseSocketFeatures() {
        this.handleEndQuestion();
        this.handleEvaluationOver();
        this.handleTimeTransition();
        this.handleFinalTimeTransition();
        this.handleRemovedFromGame();
        this.handlePanicMode();
        this.handlePauseTimer();
        this.handleGameStatusDistribution();
    }

    private resetData() {
        this.gameService.audio.pause();
        this.gameService.audio.currentTime = 0;
        this.gameService.gameRealService.audioPaused = false;
        this.inPanicMode = false;
        this.gameService.gameRealService.locked = false;
        this.gameService.gameRealService.validated = false;
        this.isBonus = false;
        this.timerText = TimerMessage.TIME_LEFT;
    }

    private handleEndQuestion() {
        this.socketService.on(SocketEvent.END_QUESTION, () => {
            this.gameService.audio.pause();
            this.gameService.audio.currentTime = 0;
            this.gameService.gameRealService.audioPaused = false;
            this.inPanicMode = false;
            if (this.gameService.question?.type === QuestionType.QCM) {
                this.getScore();
            } else {
                this.gameService.qrlAnswer = '';
                this.gameService.gameRealService.validated = true;
            }
        });
    }

    private handleEvaluationOver() {
        this.socketService.on(SocketEvent.EVALUATION_OVER, () => {
            this.getScore();
        });
    }

    private handleTimeTransition() {
        this.socketService.on(SocketEvent.TIME_TRANSITION, (timeValue: number) => {
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.resetData();
            }
        });
    }

    private handleFinalTimeTransition() {
        this.socketService.on(SocketEvent.FINAL_TIME_TRANSITION, (timeValue: number) => {
            this.timerText = TimerMessage.FINAL_RESULT;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.isGameOver = true;
                this.interactiveListService.isFinal = true;
                this.interactiveListService.getPlayersList(this.gameService.gameRealService.roomId, []);
            }
        });
    }

    private handleRemovedFromGame() {
        this.socketService.on(SocketEvent.REMOVED_FROM_GAME, () => {
            this.router.navigate(['/']);
        });
    }

    private handlePanicMode() {
        this.socketService.on(SocketEvent.PANIC_MODE, () => {
            if (this.gameService.timer > 0 && !this.gameService.gameRealService.audioPaused) {
                this.gameService.audio.play();
            }
            this.inPanicMode = true;
        });
    }

    private handlePauseTimer() {
        this.socketService.on(SocketEvent.PAUSE_TIMER, () => {
            if (this.gameService.gameRealService.audioPaused && this.inPanicMode) {
                this.gameService.audio.play();
            } else if (!this.gameService.gameRealService.audioPaused && this.inPanicMode) {
                this.gameService.audio.pause();
            }
            this.gameService.gameRealService.audioPaused = !this.gameService.gameRealService.audioPaused;
        });
    }

    private handleGameStatusDistribution() {
        this.socketService.on(SocketEvent.GAME_STATUS_DISTRIBUTION, (gameStats: string) => {
            this.unpackStats(this.parseGameStats(gameStats));
        });
    }

    private parseGameStats(stringifyStats: string) {
        return JSON.parse(stringifyStats);
    }

    private unpackStats(stats: TransportStatsFormat) {
        stats.forEach((stat) => {
            const values = new Map<string, boolean>(stat[0]);
            const responses = new Map<string, number>(stat[1]);
            this.gameStats.push([values, responses, stat[2]]);
        });
    }

    private getScore() {
        if (this.gameService.gameRealService.username !== HOST_USERNAME) {
            this.socketService.send(
                SocketEvent.GET_SCORE,
                {
                    roomId: this.gameService.gameRealService.roomId,
                    username: this.gameService.gameRealService.username,
                },
                (score: Score) => {
                    this.gameService.gameRealService.validated = true;
                    this.updateScore(score.points);
                    this.isBonus = score.isBonus;
                },
            );
        }
    }

    private updateScore(score: number) {
        const oldScore = this.playerScore;
        this.playerScore = score;
        if (this.gameService.question?.type === QuestionType.QRL) {
            this.gameService.lastQrlScore =
                ((this.playerScore - oldScore) / (this.gameService.gameRealService.question?.points as number)) * MAX_PERCENTAGE;
        }
    }
}
