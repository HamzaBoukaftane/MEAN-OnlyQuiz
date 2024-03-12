import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { GameItemComponent } from './game-item.component';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import SpyObj = jasmine.SpyObj;
import { MatDialog } from '@angular/material/dialog';
import { AppMaterialModule } from '@app/modules/material.module';

describe('GameItemComponent', () => {
    let quizServiceSpy: SpyObj<QuizService>;
    let component: GameItemComponent;
    let fixture: ComponentFixture<GameItemComponent>;
    let removeQuizSpy: jasmine.Spy;

    beforeEach(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['basicDelete']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameItemComponent],
            imports: [HttpClientModule, RouterTestingModule, AppMaterialModule],
            providers: [MatDialog, { provide: QuizService, useValue: quizServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameItemComponent);
        component = fixture.componentInstance;
        component.quiz = {
            id: '1',
            title: 'Filler',
            description: 'filler description',
            duration: 30,
            lastModification: '2023-09-15',
            questions: [
                {
                    type: 0,
                    text: 'What is 2 + 2?',
                    points: 5,
                    choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
                },
            ],
            visible: true,
        };
        component.isAdmin = true;
        removeQuizSpy = spyOn(component.removeQuiz, 'emit');
        spyOn(fixture.debugElement.nativeElement.querySelector('.download'), 'click').and.stub();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call the basicDelete and emit an event with good quiz id when delete bouton is clicked', () => {
        const deleteBtn = fixture.debugElement.nativeElement.querySelector('.delete-button');
        quizServiceSpy.basicDelete.and.returnValue(of({}));
        deleteBtn.click();
        expect(quizServiceSpy.basicDelete).toHaveBeenCalledWith(component.quiz.id);
        expect(removeQuizSpy).toHaveBeenCalledWith(component.quiz.id);
    });

    it('should navigate /quiz-creation/:id when update bouton is clicked', () => {
        const updateBtn = fixture.debugElement.nativeElement.querySelector('.update-button');
        const routerNavigateSpy = spyOn(TestBed.inject(Router), 'navigate');
        updateBtn.click();
        expect(routerNavigateSpy).toHaveBeenCalledWith(['quiz-creation', component.quiz.id]);
    });

    it('should call formatQuiz when exporting game', () => {
        const formatQuizSpy = spyOn(component, 'formatQuiz');
        const buildJSONFileSpy = spyOn(component, 'buildJSONFile').and.returnValue('fakeBlobUrl');
        const startExportFileSpy = spyOn(component, 'startExportFile');
        component.exportGame();
        expect(formatQuizSpy).toHaveBeenCalled();
        expect(buildJSONFileSpy).toHaveBeenCalled();
        expect(startExportFileSpy).toHaveBeenCalledWith('fakeBlobUrl');
    });

    it('should call buildJSONFile when exporting game without the visible property', () => {
        const formatedQuiz = {
            id: '1',
            title: 'Filler',
            description: 'filler description',
            duration: 30,
            lastModification: '2023-09-15',
            questions: [
                {
                    type: 0,
                    text: 'What is 2 + 2?',
                    points: 5,
                    choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
                },
            ],
        };
        const buildJSONFileSpy = spyOn(component, 'buildJSONFile');
        const startExportFileSpy = spyOn(component, 'startExportFile');
        component.exportGame();
        expect(buildJSONFileSpy).toHaveBeenCalledWith(formatedQuiz);
        expect(startExportFileSpy).toHaveBeenCalled();
    });

    it('should call startExportFile when exporting game ', () => {
        spyOn(component, 'buildJSONFile').and.stub();
        const startExportFileSpy = spyOn(component, 'startExportFile');
        const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL');
        component.exportGame();
        expect(startExportFileSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should correctly format the quiz', () => {
        const formattedQuiz = component.formatQuiz();
        expect(formattedQuiz).toEqual({
            id: '1',
            title: 'Filler',
            description: 'filler description',
            duration: 30,
            lastModification: '2023-09-15',
            questions: [
                {
                    type: 0,
                    text: 'What is 2 + 2?',
                    points: 5,
                    choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
                },
            ],
        });
    });

    it('should correctly build a JSON file URL when exporting game ', () => {
        const formattedQuiz = {
            id: '1',
            title: 'Filler',
            description: 'filler description',
            duration: 30,
            lastModification: '2023-09-15',
            questions: [
                {
                    type: 0,
                    text: 'What is 2 + 2?',
                    points: 5,
                    choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
                },
            ],
        };
        const jsonBlobURL = component.buildJSONFile(formattedQuiz);
        expect(jsonBlobURL).toBeTruthy();
    });

    it('should start the export file process when exporting a game', () => {
        const aElement: HTMLAnchorElement = component.downloadLink.nativeElement;
        const startExportFileSpy = spyOn(component, 'startExportFile').and.callThrough();
        component.exportGame();
        expect(aElement.download).toBe(component.quiz.title + '.json');
        expect(startExportFileSpy).toHaveBeenCalled();
    });
});
