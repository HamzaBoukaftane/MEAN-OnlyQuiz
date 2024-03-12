import { SocketEvent } from '@common/socket-event-name/socket-event-name';
import {
    GameStats,
    PanicModeData,
    PlayerAnswerData,
    PlayerSelection,
    PlayerUsername,
    RemainingTime,
} from '@common/interfaces/socket-manager.interface';
import { Game } from '@app/classes/game/game';
import { QuestionType } from '@common/enums/question-type.enum';
import { QRL_DURATION, QUARTER_SECOND_DELAY, TRANSITION_QUESTIONS_DELAY } from '@common/constants/socket-manager.service.const';
import { HOST_USERNAME } from '@common/names/host-username';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as io from 'socket.io';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { HistoryService } from '@app/services/history.service/history.service';
import { TimerService } from '@app/services/timer.service/timer.service';
import { Service } from 'typedi';

@Service()
export class GameManagementService {
    private timerService: TimerService;
    constructor(
        private quizService: QuizService,
        private historyService: HistoryService,
    ) {}

    configureGameManagingSockets(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        this.timerService = new TimerService(roomManager, sio);
        this.handleStartGame(roomManager, socket);
        this.handleGetQuestion(roomManager, socket);
        this.handleSubmitAnswer(roomManager, socket, sio);
        this.handleUpdateSelection(roomManager, socket, sio);
        this.handleActivityStatus(roomManager, socket, sio);
        this.handleGetPlayerAnswer(roomManager, socket);
        this.handleQRLCorrection(roomManager, socket, sio);
        this.handleNewResponseInteraction(roomManager, socket, sio);
        this.handleStartTransition(roomManager, socket);
        this.handleGetScore(roomManager, socket);
        this.handleNextQuestion(roomManager, socket, sio);
        this.handleShowResult(roomManager, socket);
        this.handlePauseTimer(roomManager, socket, sio);
        this.handlePanicMode(roomManager, socket, sio);
        this.handleGameStatusDistribution(socket, sio);
    }

    private handleStartGame(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.START, async (data: RemainingTime) => {
            const room = roomManager.getRoomById(data.roomId);
            const quizId = room.quizId;
            const usernames = roomManager.getUsernamesArray(data.roomId);
            room.game = new Game(usernames, this.quizService, this.historyService);
            await room.game.setup(quizId);
            this.timerService.startTimer({ roomId: data.roomId, time: data.time });
        });
    }

    private handleGetQuestion(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.GET_QUESTION, (roomId: number) => {
            const game = roomManager.getGameByRoomId(roomId);
            const question = game.currentQuizQuestion;
            const index = game.currIndex + 1;
            const username = roomManager.getUsernameBySocketId(roomId, socket.id);
            socket.emit(SocketEvent.GET_INITIAL_QUESTION, { question, username, index, numberOfQuestions: game.quiz.questions.length });
            const isChoiceQuestion = game.currentQuizQuestion.type === QuestionType.QCM;
            const duration = isChoiceQuestion ? roomManager.getGameByRoomId(roomId).duration : QRL_DURATION;
            if (roomManager.getUsernameBySocketId(roomId, socket.id) === HOST_USERNAME) {
                roomManager.clearRoomTimer(roomId);
                this.timerService.startTimer({ roomId, time: duration });
            }
        });
    }

    private handleSubmitAnswer(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.SUBMIT_ANSWER, (data: PlayerAnswerData) => {
            const game = roomManager.getGameByRoomId(data.roomId);
            roomManager.getGameByRoomId(data.roomId).storePlayerAnswer(data.username, data.timer, data.answers);
            if (data.timer !== 0) {
                const hostSocketId = roomManager.getSocketIdByUsername(data.roomId, HOST_USERNAME);
                sio.to(hostSocketId).emit(SocketEvent.SUBMIT_ANSWER, data.username);
            }
            if (game.playersAnswers.size === game.players.size) {
                if (game.currentQuizQuestion.type === QuestionType.QCM) roomManager.getGameByRoomId(data.roomId).updateScores();
                roomManager.clearRoomTimer(data.roomId);
                sio.to(String(data.roomId)).emit(SocketEvent.END_QUESTION);
            }
        });
    }

    private handleUpdateSelection(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.UPDATE_SELECTION, (data: PlayerSelection) => {
            const game = roomManager.getGameByRoomId(data.roomId);
            game.updateChoicesStats(data.isSelected, data.index);
            const hostSocketId = roomManager.getSocketIdByUsername(data.roomId, HOST_USERNAME);
            const username = roomManager.getUsernameBySocketId(data.roomId, socket.id);
            const choicesStatsValues = Array.from(game.choicesStats.values());
            sio.to(hostSocketId).emit(SocketEvent.REFRESH_CHOICES_STATS, choicesStatsValues);
            sio.to(hostSocketId).emit(SocketEvent.UPDATE_INTERACTION, username);
        });
    }

    private handleActivityStatus(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.SEND_ACTIVITY_STATUS, (data: { roomId: number; isActive: boolean }) => {
            const game = roomManager.getGameByRoomId(data.roomId);
            game.switchActivityStatus(data.isActive);
            const hostSocketId = roomManager.getSocketIdByUsername(data.roomId, HOST_USERNAME);
            sio.to(hostSocketId).emit(SocketEvent.REFRESH_ACTIVITY_STATS, game.activityStatusStats);
        });
    }

    private handleGetPlayerAnswer(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.GET_PLAYER_ANSWERS, (roomId: number, callback) => {
            const game = roomManager.getGameByRoomId(roomId);
            const formattedPlayerAnswers = JSON.stringify(Array.from(game.playersAnswers));
            callback(formattedPlayerAnswers);
        });
    }

    private handleQRLCorrection(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.PLAYER_QRL_CORRECTION, (data: { roomId: number; playerCorrection: string }) => {
            const game = roomManager.getGameByRoomId(data.roomId);
            const playerCorrectionMap = new Map(JSON.parse(data.playerCorrection));
            game.updatePlayerScores(playerCorrectionMap as Map<string, number>);
            sio.to(String(data.roomId)).emit(SocketEvent.EVALUATION_OVER);
        });
    }

    private handleNewResponseInteraction(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.NEW_RESPONSE_INTERACTION, (roomId: number) => {
            const hostSocketId = roomManager.getSocketIdByUsername(roomId, HOST_USERNAME);
            const username = roomManager.getUsernameBySocketId(roomId, socket.id);
            sio.to(hostSocketId).emit(SocketEvent.UPDATE_INTERACTION, username);
        });
    }

    private handleStartTransition(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.START_TRANSITION, (roomId: number) => {
            roomManager.clearRoomTimer(roomId);
            this.timerService.startTimer({ roomId, time: TRANSITION_QUESTIONS_DELAY }, SocketEvent.TIME_TRANSITION);
        });
    }

    private handleGetScore(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.GET_SCORE, (data: PlayerUsername, callback) => {
            const playerScore = roomManager.getGameByRoomId(data.roomId).players.get(data.username);
            callback(playerScore);
        });
    }

    private handleNextQuestion(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.NEXT_QUESTION, (roomId: number) => {
            const game = roomManager.getGameByRoomId(roomId);
            roomManager.clearRoomTimer(roomId);
            const lastIndex = game.quiz.questions.length - 1;
            game.next();
            let index = game.currIndex;
            const isLast = index === lastIndex;
            const nextQuestionNumber = ++index;
            const nextQuestion = game.currentQuizQuestion;
            sio.to(String(roomId)).emit(SocketEvent.GET_NEXT_QUESTION, { question: nextQuestion, index: nextQuestionNumber, isLast });
            this.timerService.startTimer({ roomId, time: game.currentQuizQuestion.type === QuestionType.QCM ? game.duration : QRL_DURATION });
        });
    }

    private handleShowResult(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(SocketEvent.SHOW_RESULT, (roomId: number) => {
            roomManager.clearRoomTimer(roomId);
            this.timerService.startTimer({ roomId, time: TRANSITION_QUESTIONS_DELAY }, SocketEvent.FINAL_TIME_TRANSITION);
            roomManager.getGameByRoomId(roomId).updateGameHistory();
        });
    }

    private handlePauseTimer(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.PAUSE_TIMER, (roomId: number) => {
            const game = roomManager.getGameByRoomId(roomId);
            game.paused = !game.paused;
            sio.to(String(roomId)).emit(SocketEvent.PAUSE_TIMER, roomId);
        });
    }

    private handlePanicMode(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.PANIC_MODE, (data: PanicModeData) => {
            roomManager.clearRoomTimer(data.roomId);
            this.timerService.startTimer({ roomId: data.roomId, time: data.timer }, undefined, QUARTER_SECOND_DELAY);
            sio.to(String(data.roomId)).emit(SocketEvent.PANIC_MODE, data);
        });
    }

    private handleGameStatusDistribution(socket: io.Socket, sio: io.Server) {
        socket.on(SocketEvent.GAME_STATUS_DISTRIBUTION, (data: GameStats) => {
            sio.to(String(data.roomId)).emit(SocketEvent.GAME_STATUS_DISTRIBUTION, data.stats);
        });
    }
}
