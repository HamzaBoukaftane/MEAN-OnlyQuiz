import { Component } from '@angular/core';
import { GameService } from '@app/services/game.service/game.service';

@Component({
    selector: 'app-game-answers-list',
    templateUrl: './game-answers-list.component.html',
    styleUrls: ['./game-answers-list.component.scss'],
})
export class GameAnswersListComponent {
    private receptionDebounce: number = 0;

    constructor(public gameService: GameService) {}

    selectChoice(index: number) {
        this.gameService.selectChoice(index);
    }

    handleMultipleEmission() {
        if (!this.gameService.isInputFocused) {
            this.receptionDebounce += 1;
            if (this.receptionDebounce === this.gameService.question?.choices?.length) {
                this.validate();
                this.receptionDebounce = 0;
            }
        }
    }

    validate() {
        if (!this.gameService.validatedStatus) this.gameService.sendAnswer();
    }
}
