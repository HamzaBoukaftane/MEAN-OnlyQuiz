import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Quiz } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { Router } from '@angular/router';
import { QUIZ_CREATION } from '@common/page-url/page-url';

@Component({
    selector: 'app-game-item',
    templateUrl: './game-item.component.html',
    styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent {
    @ViewChild('downloadLink', { static: false }) downloadLink!: ElementRef;
    @Input() quiz: Quiz;
    @Input() isAdmin: boolean;
    @Output() removeQuiz: EventEmitter<string> = new EventEmitter<string>();
    constructor(
        private quizService: QuizService,
        private router: Router,
    ) {}

    deleteGame(): void {
        this.quizService.basicDelete(this.quiz.id).subscribe();
        this.removeQuiz.emit(this.quiz.id);
    }

    updateGame(): void {
        this.router.navigate([QUIZ_CREATION, `${this.quiz.id}`]);
    }

    formatQuiz(): object {
        const { ...exportedQuiz } = this.quiz;
        delete exportedQuiz.visible;
        return exportedQuiz;
    }

    buildJSONFile(formattedQuiz: object): string {
        const blob = new Blob([JSON.stringify(formattedQuiz)], { type: 'application/json' });
        return window.URL.createObjectURL(blob);
    }

    startExportFile(url: string): void {
        const a = this.downloadLink.nativeElement;
        a.href = url;
        a.download = this.quiz.title + '.json';
        a.click();
    }

    exportGame(): void {
        const url = this.buildJSONFile(this.formatQuiz());
        this.startExportFile(url);
        window.URL.revokeObjectURL(url);
    }
}
