import { Component, Input } from '@angular/core';
import { Quiz } from '@common/interfaces/quiz.interface';

@Component({
    selector: 'app-quiz-info',
    templateUrl: './quiz-info.component.html',
    styleUrls: ['./quiz-info.component.scss'],
})
export class QuizInfoComponent {
    @Input() selectedQuiz: Quiz | null;
}
