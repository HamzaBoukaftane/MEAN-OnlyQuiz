import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {
    ResponsesValues,
    ResponsesNumber,
    CORRECT_ANSWERS,
    INCORRECT_ANSWERS,
    INACTIVE,
    ACTIVE,
    BAR,
} from '@common/constants/statistic-histogram.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { QuestionType } from '@common/enums/question-type.enum';
import { GREEN_INDEX, LIGHTGREEN_COLOR, RED_COLOR, RED_INDEX } from '@common/style/style';

@Component({
    selector: 'app-statistic-histogram',
    templateUrl: './statistic-histogram.component.html',
    styleUrls: ['./statistic-histogram.component.scss'],
})
export class StatisticHistogramComponent implements OnChanges {
    @Input() changingResponses: ResponsesNumber;
    @Input() valueOfResponses: ResponsesValues;
    @Input() isGameOver: boolean = false;
    legendLabels: string[] = [];
    barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };
    barChartType: ChartType = BAR;
    barChartData: ChartData<'bar'>;

    constructor(private gameService: GameService) {}

    ngOnChanges() {
        const labels = Array.from(this.valueOfResponses.keys());
        const changingResponsesData = [];
        if (this.isGameOver) {
            this.legendLabels[RED_INDEX] = INCORRECT_ANSWERS;
            this.legendLabels[GREEN_INDEX] = CORRECT_ANSWERS;
        } else {
            this.legendLabels[RED_INDEX] = this.gameService.question?.type === QuestionType.QRL ? INACTIVE : INCORRECT_ANSWERS;
            this.legendLabels[GREEN_INDEX] = this.gameService.question?.type === QuestionType.QRL ? ACTIVE : CORRECT_ANSWERS;
        }

        for (const key of labels) {
            changingResponsesData.push(this.changingResponses.get(key) ?? 0);
        }

        const changingResponseColors = labels.map((label) => (this.valueOfResponses.get(label) ? LIGHTGREEN_COLOR : RED_COLOR));

        this.barChartData = {
            labels,
            datasets: [
                {
                    data: changingResponsesData,
                    backgroundColor: changingResponseColors,
                },
            ],
        };
    }
}
