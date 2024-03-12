import { Message } from './message.interface';

export interface PlayerUsername {
    roomId: number;
    username: string;
}

export interface PlayerMessage {
    roomId: number;
    message: Message;
}

export interface RemainingTime {
    roomId: number;
    time: number;
}
export interface PlayerAnswerData {
    roomId: number;
    answers: string[] | string;
    timer: number;
    username: string;
}

export interface PlayerSelection {
    roomId: number;
    isSelected: boolean;
    index: number;
}

export interface RoomValidationResult {
    isRoom: boolean;
    isLocked: boolean;
}

export interface PanicModeData {
    roomId: number;
    timer: number;
}

export interface GameStats {
    roomId: number;
    stats: string;
}

export interface UsernameValidation {
    isValid: boolean;
    error: string
}
