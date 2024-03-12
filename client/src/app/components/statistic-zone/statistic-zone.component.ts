import { Component, Input, OnInit } from '@angular/core';
import { ResponsesValues, ResponsesNumber } from '@common/constants/statistic-histogram.component.const';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuestionStatistics, QuestionStats } from '@common/constants/statistic-zone.component.const';

@Component({
    selector: 'app-statistic-zone',
    templateUrl: './statistic-zone.component.html',
    styleUrls: ['./statistic-zone.component.scss'],
})
export class StatisticZoneComponent implements OnInit {
    @Input() gameStats: QuestionStatistics[];
    currentStat: QuestionStatistics = [new Map(), new Map(), undefined];
    responseValue: ResponsesValues = new Map<string, boolean>();
    responseNumber: ResponsesNumber = new Map<string, number>();
    question: QuizQuestion | undefined = undefined;
    index: number = 0;

    ngOnInit() {
        if (this.gameStats.length !== 0) {
            this.currentStat = this.gameStats[this.index];
            this.setUpData();
        }
    }

    next() {
        this.currentStat = this.gameStats[++this.index];
        this.setUpData();
    }

    previous() {
        this.currentStat = this.gameStats[--this.index];
        this.setUpData();
    }

    isEnd() {
        return this.gameStats.length !== 0 ? this.index === this.gameStats.length - 1 : true;
    }

    isFirst() {
        return this.index === 0;
    }

    private setUpData() {
        this.responseValue = this.currentStat[QuestionStats.RESPONSES_VALUES_INDEX];
        this.responseNumber = this.currentStat[QuestionStats.RESPONSES_NUMBER_INDEX];
        this.question = this.currentStat[QuestionStats.QUIZ_QUESTION_INDEX];
    }
}
