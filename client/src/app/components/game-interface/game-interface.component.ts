import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionType } from '@common/enums/question-type.enum';
import { GameInterfaceManagementService } from '@app/services/game-interface-management.service/game-interface-management.service';
import { HOST_USERNAME } from '@common/names/host-username';
import { QUIZ_TESTING_PAGE } from '@common/page-url/page-url';

@Component({
    selector: 'app-game-interface',
    templateUrl: './game-interface.component.html',
    styleUrls: ['./game-interface.component.scss'],
})
export class GameInterfaceComponent implements OnInit, OnDestroy {
    protected readonly questionType = QuestionType;
    constructor(
        public gameInterfaceManagementService: GameInterfaceManagementService,
        private route: ActivatedRoute,
    ) {}

    get score() {
        this.gameInterfaceManagementService.playerScore = this.gameInterfaceManagementService.gameService.isTestMode
            ? this.gameInterfaceManagementService.gameService.playerScore
            : this.gameInterfaceManagementService.playerScore;
        return this.gameInterfaceManagementService.playerScore;
    }

    get bonusStatus() {
        this.gameInterfaceManagementService.isBonus = this.gameInterfaceManagementService.gameService.isTestMode
            ? this.gameInterfaceManagementService.gameService.isBonus
            : this.gameInterfaceManagementService.isBonus;
        return this.gameInterfaceManagementService.isBonus;
    }

    ngOnInit() {
        if (this.gameInterfaceManagementService.gameService.username !== HOST_USERNAME) {
            this.gameInterfaceManagementService.gameService.isTestMode = this.route.snapshot.url[0].path === QUIZ_TESTING_PAGE;
            const pathId = this.route.snapshot.paramMap.get('id') as string;
            this.gameInterfaceManagementService.setup(pathId);
        }
    }

    ngOnDestroy() {
        this.gameInterfaceManagementService.reset();
    }
}
