import { Game } from '@app/classes/game/game';
import { Message } from '@common/interfaces/message.interface';

export interface RoomData {
    room: number;
    quizId: string;
    players: Map<string, string>;
    locked: boolean;
    game: Game;
    timer: NodeJS.Timer;
    bannedNames: string[];
    messages?: Message[];
}
