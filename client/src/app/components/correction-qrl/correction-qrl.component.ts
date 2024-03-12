import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { QuestionStatistics } from '@common/constants/statistic-zone.component.const';
import { QrlEvaluationService } from '@app/services/qrl-evaluation.service/qrl-evaluation.service';

@Component({
    selector: 'app-correction-qrl',
    templateUrl: './correction-qrl.component.html',
    styleUrls: ['./correction-qrl.component.scss'],
})
export class CorrectionQRLComponent implements OnChanges, OnInit, OnDestroy {
    @Input() gameStats: QuestionStatistics[] = [];
    @Input() qrlAnswers = new Map<string, { answers: string; time: number }>();
    @Input() isHostEvaluating: boolean = false;

    constructor(public qrlEvaluationService: QrlEvaluationService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.qrlAnswers) {
            this.qrlEvaluationService.clearAll();
            this.qrlEvaluationService.initialize(this.qrlAnswers);
        }
    }

    ngOnInit() {
        this.qrlEvaluationService.initialize(this.qrlAnswers);
    }

    ngOnDestroy() {
        this.qrlEvaluationService.reset();
    }

    submitPoint() {
        this.qrlEvaluationService.submitPoint(this.gameStats);
    }
}
