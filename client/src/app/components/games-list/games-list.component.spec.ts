/* eslint-disable max-lines */
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '@app/components/alert-dialog/alert-dialog.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { ErrorDictionary } from '@common/browser-message/error-message/error-message';
import { QuestionType } from '@common/enums/question-type.enum';
import { Quiz } from '@common/interfaces/quiz.interface';
import { of } from 'rxjs';
import { getCurrentDateService } from 'src/utils/current-date-format/current-date-format';
import { GamesListComponent } from './games-list.component';
import SpyObj = jasmine.SpyObj;

describe('GamesListComponent Admin view', () => {
    let quizServiceSpy: SpyObj<QuizService>;
    let component: GamesListComponent;
    let fixture: ComponentFixture<GamesListComponent>;
    const quizzesMock = [
        {
            id: '0',
            title: 'Filler',
            description: 'filler description',
            duration: 30,
            lastModification: '2023-09-15',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'What is 2 + 2?',
                    points: 5,
                    choices: [
                        { text: '3', isCorrect: false },
                        { text: '4', isCorrect: true },
                        { text: '5', isCorrect: false },
                    ],
                },
            ],
            visible: true,
        },
        {
            id: '1',
            title: 'Test Quiz',
            description: 'This is a test quiz',
            duration: 30,
            lastModification: '2023-09-28',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Sample Question',
                    points: 20,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
            visible: true,
        },
        {
            id: '2',
            title: 'Science Quiz',
            description: 'its a science quiz!',
            duration: 45,
            lastModification: '2023-09-15',
            questions: [],
            visible: false,
        },
    ];
    beforeEach(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', [
            'basicGetAll',
            'basicGetAllVisible',
            'basicPatch',
            'checkTitleUniqueness',
            'basicPost',
            'basicGetById',
        ]);
        quizServiceSpy.basicGetAll.and.returnValue(of([]));
        quizServiceSpy.basicGetAllVisible.and.returnValue(of([]));
        quizServiceSpy.basicPatch.and.returnValue(of());
        quizServiceSpy.basicPost.and.returnValue(of());
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GamesListComponent],
            imports: [HttpClientModule, FormsModule, AppMaterialModule],
            providers: [MatDialog, { provide: QuizService, useValue: quizServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GamesListComponent);
        component = fixture.componentInstance;
        component.isAdmin = true;
        fixture.detectChanges();
    });
    it('should create', () => {
        quizServiceSpy.basicGetAll.and.returnValue(of([]));
        expect(component).toBeTruthy();
    });
    it('should populate game list for admin', () => {
        quizServiceSpy.basicGetAll.and.returnValue(of([]));
        component.populateGameList();
        expect(quizServiceSpy.basicGetAll).toHaveBeenCalled();
    });
    it('should populate game list for non-admin', () => {
        component.isAdmin = false;
        component.populateGameList();
        expect(quizServiceSpy.basicGetAllVisible).toHaveBeenCalled();
    });
    it('should update visibility', () => {
        component.quizzes = quizzesMock;
        component.updateVisibility(component.quizzes[0]);
        expect(quizServiceSpy.basicPatch).toHaveBeenCalledWith(component.quizzes[0].id, false);
    });
    it('should remove a quiz by ID', () => {
        component.quizzes = quizzesMock;
        const quizIdToRemove = '2';
        component.removeQuiz(quizIdToRemove);
        const removedQuiz = component.quizzes.find((quiz) => quiz.id === quizIdToRemove);
        expect(removedQuiz).toBeUndefined();
        expect(component.quizzes.length).toEqual(2);
    });
    it('should terminate the error feeback on user manipulation', () => {
        component.isErrors = true;
        component.errors = 'There is some errors';
        component.isQuizUnique = false;
        component.killErrorFeedback(true);
        expect(component.isErrors).toBeFalsy();
        expect(component.isQuizUnique).toBeTruthy();
        expect(component.errors).toBeNull();
    });
    it('should set the selectedQuiz property to the provided quiz', () => {
        const sampleQuiz: Quiz = component.quizzes[0];
        component.selectQuiz(sampleQuiz);
        expect(component.selectedQuiz).toEqual(sampleQuiz);
    });
    it('should call addImportedQuiz if name is unique', () => {
        component.importedQuiz = quizzesMock[0];
        quizServiceSpy.checkTitleUniqueness.and.returnValue(
            of(
                new HttpResponse({
                    body: { isUnique: true },
                    status: 201,
                    statusText: 'Created',
                }),
            ),
        );
        component.checkQuizNameUnique();
        expect(quizServiceSpy.checkTitleUniqueness).toHaveBeenCalled();
    });
    it('should call readFile when a valid JSON file is selected', () => {
        const mockFile = new File(['{}'], 'mock.json', { type: 'application/json' });
        const event = new Event('change');
        const list = new DataTransfer();
        list.items.add(mockFile);
        const mockFileList = list.files;
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.files = mockFileList;
        Object.defineProperty(event, 'target', { value: inputElement });
        const readFileSpy = spyOn(component, 'readFile');
        component.selectFile(event);
        expect(readFileSpy).toHaveBeenCalledWith(mockFile);
        expect(inputElement.value).toEqual('');
    });
    it('should trigger file input click and validate file data', fakeAsync(() => {
        component.importedQuiz = quizzesMock[0];
        const clickSpy = spyOn(component.fileInput.nativeElement, 'click').and.returnValue();
        const waitForFileReadSpy = spyOn(component, 'waitForFileRead').and.returnValue(Promise.resolve());
        component.uploadFile();
        expect(clickSpy).toHaveBeenCalled();
        tick();
        expect(waitForFileReadSpy).toHaveBeenCalled();
    }));
    it('should read a file as Text', () => {
        component['fileReader'] = new FileReader();
        const selectedFile = new File(['{}'], 'mock.json', { type: 'application/json' });
        const fileReaderSpy = spyOn(component['fileReader'], 'readAsText');
        component.readFile(selectedFile);
        expect(fileReaderSpy).toHaveBeenCalledWith(selectedFile);
    });
    it('should return an error message if validation is not succesful ', () => {
        const errors = ['Error 1', 'Error 2', 'Error 3'];
        const expectedErrorMessage =
            "Le fichier que vous tenter d'importer contient les problèmes suivants :\n\n " +
            '\n1- Error 1\n' +
            '\n2- Error 2\n' +
            '\n3- Error 3\n' +
            '\n\n Veuillez corriger cela avant de réessayer. ';
        const errorMessage = component.setValidatorError(errors);
        expect(errorMessage).toEqual(expectedErrorMessage);
    });
    it('should return an error message if validation is not succesful ', () => {
        const errors = ['Error 1'];
        const expectedErrorMessage =
            "Le fichier que vous tenter d'importer contient le problème suivant :\n\n " +
            '\n1- Error 1\n' +
            '\n\n Veuillez corriger cela avant de réessayer. ';
        const errorMessage = component.setValidatorError(errors);
        expect(errorMessage).toEqual(expectedErrorMessage);
    });
    it('should call basicPost and populateGameList when response status is CREATED', () => {
        component.importedQuiz = quizzesMock[0];
        const populateSpy = spyOn(component, 'populateGameList');
        quizServiceSpy.basicPost.and.returnValue(
            of(
                new HttpResponse({
                    body: '',
                    status: 201,
                    statusText: 'CREATED',
                }),
            ),
        );
        component.addImportedQuiz();
        expect(populateSpy).toHaveBeenCalled();
    });
    it('should not call populateGameList when response status is not CREATED', () => {
        component.importedQuiz = quizzesMock[0];
        const populateSpy = spyOn(component, 'populateGameList');
        quizServiceSpy.basicPost.and.returnValue(
            of(
                new HttpResponse({
                    body: '',
                    status: 404,
                    statusText: 'NOT FOUND',
                }),
            ),
        );
        component.addImportedQuiz();
        expect(populateSpy).not.toHaveBeenCalled();
    });
    it('should check if quiz name is unique if quiz is valid', () => {
        component.importedQuiz = quizzesMock[1];
        quizServiceSpy.checkTitleUniqueness.and.returnValue(
            of(
                new HttpResponse({
                    body: { isUnique: true },
                    status: 201,
                    statusText: 'Created',
                }),
            ),
        );
        component.validateFileData();
        expect(quizServiceSpy.checkTitleUniqueness).toHaveBeenCalled();
        expect(component.errors).toBeNull();
    });
    it('should update the error message if quiz is not valid', () => {
        const setValidatorErrorSpy = spyOn(component, 'setValidatorError');
        const expectedError = [
            'Question 1 : les points doivent être entre 10 et 100',
            'Question 1 : les points de la question doivent être divisible par 10',
        ];
        component.importedQuiz = quizzesMock[0];
        component.validateFileData();
        expect(component.errors).not.toBeNull();
        expect(setValidatorErrorSpy).toHaveBeenCalledWith(expectedError);
    });

    it('should change component isQuizUnique to false if quiz is not unique', () => {
        component.importedQuiz = quizzesMock[0];
        component.isQuizUnique = true;
        component.treatResponse(false);
        expect(component.isQuizUnique).toBeFalsy();
    });
    it('should change component isQuizUnique to false if quiz is not unique', () => {
        component.importedQuiz = quizzesMock[0];
        const addImportedQuizSpy = spyOn(component, 'addImportedQuiz');
        component.treatResponse(true);
        expect(component.isQuizUnique).toBeTruthy();
        expect(addImportedQuizSpy).toHaveBeenCalled();
    });
    it('should verify uniqueness of a user provided name for quiz', () => {
        const newName = 'test';
        component.importedQuiz = quizzesMock[0];
        component.isQuizUnique = false;
        quizServiceSpy.checkTitleUniqueness.and.returnValue(
            of(
                new HttpResponse({
                    body: { isUnique: true },
                    status: 201,
                    statusText: 'Created',
                }),
            ),
        );
        component.receiveQuizName(newName);
        expect(component.importedQuiz.title).toEqual(newName);
        expect(component.isQuizUnique).toBeTruthy();
        expect(quizServiceSpy.checkTitleUniqueness).toHaveBeenCalled();
    });
    it('should correctly parse and handle a valid JSON result', fakeAsync(() => {
        const mockData = JSON.stringify(quizzesMock[0]);
        const parseSpy = spyOn(JSON, 'parse').and.returnValue(quizzesMock[0]);
        spyOn(component, 'resolveAsyncFileRead').and.callFake(async () => {
            component.isErrors = true;
        });
        spyOn(component, 'rejectAsyncFileRead').and.returnValue();
        const event: ProgressEvent<FileReader> = {
            target: {
                result: mockData,
            },
        } as ProgressEvent<FileReader>;
        component.waitForFileRead();
        tick();
        component.extractQuizData(event);
        expect(component.isErrors).toBeTruthy();
        expect(parseSpy).toHaveBeenCalledWith(event.target?.result as string);
        expect(component.importedQuiz.lastModification).toEqual(getCurrentDateService());
    }));
    it('should handle an error when parsing invalid JSON result', () => {
        const parseSpy = spyOn(JSON, 'parse');
        spyOn(component, 'resolveAsyncFileRead').and.callFake(async () => {
            component.isErrors = true;
        });
        spyOn(component, 'rejectAsyncFileRead').and.returnValue();
        const event: ProgressEvent<FileReader> = {
            target: { result: 'invalidJSON' },
        } as ProgressEvent<FileReader>;
        component.extractQuizData(event);
        expect(parseSpy).toHaveBeenCalledWith(event.target?.result as string);
    });
    it('should seize resolve callback promise', () => {
        component['asyncFileResolver'] = () => {
            component.isQuizUnique = false;
        };
        component.resolveAsyncFileRead();
        expect(component.isQuizUnique).toBeFalsy();
    });
    it('should seize reject callback promise', () => {
        component['asyncFileRejecter'] = (error) => {
            component.isQuizUnique = !!error;
        };
        component.rejectAsyncFileRead(false);
        expect(component.isQuizUnique).toBeFalsy();
    });
    it('should test the game and navigate to quiz-testing-page', fakeAsync(() => {
        const navigateSpy = spyOn(component['router'], 'navigate');
        component.selectedQuiz = { id: '1', visible: true } as Quiz;
        const basicGetByIdResponse = { id: '1', visible: true } as Quiz;
        quizServiceSpy.basicGetById.and.returnValue(of(basicGetByIdResponse));
        component.testGame();
        tick();
        expect(navigateSpy).toHaveBeenCalledWith(['/quiz-testing-page/', '1']);
        expect(component.selectedQuiz).toBeNull();
    }));
    it('should play the game and navigate to waiting-room-host-page', fakeAsync(() => {
        const navigateSpy = spyOn(component['router'], 'navigate');
        component.selectedQuiz = { id: '1', visible: true } as Quiz;
        const basicGetByIdResponse = { id: '1', visible: true } as Quiz;
        quizServiceSpy.basicGetById.and.returnValue(of(basicGetByIdResponse));
        component.playGame();
        tick();
        expect(navigateSpy).toHaveBeenCalledWith(['/waiting-room-host-page/', '1']);
        expect(component.selectedQuiz).toBeNull();
    }));
    it('should handle deleted and invisible quizzes', fakeAsync(() => {
        component.selectedQuiz = { id: '1', visible: true } as Quiz;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const alertSpy = spyOn(component, 'showError' as any);
        quizServiceSpy.basicGetById.and.returnValue(of(null as unknown as Quiz));
        component.testGame();
        tick();
        expect(alertSpy).toHaveBeenCalledWith('Ce quiz a été supprimé, veuillez choisir un autre.');
    }));
    it('should handle invisible quizzes', fakeAsync(() => {
        component.selectedQuiz = { id: '1', visible: false } as Quiz;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const alertSpy = spyOn(component, 'showError' as any);
        quizServiceSpy.basicGetById.and.returnValue(of(component.selectedQuiz));
        component.testGame();
        tick();
        expect(alertSpy).toHaveBeenCalledWith('Ce quiz est maintenant caché, veuillez choisir un autre.');
    }));
    it('should not handle when no quiz is selected', fakeAsync(() => {
        component.selectedQuiz = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const alertSpy = spyOn(component, 'showError' as any);
        quizServiceSpy.basicGetById.and.returnValue(of());
        component.handleQuizAction('');
        tick();
        expect(alertSpy).not.toHaveBeenCalled();
    }));
    it('should call dialog open function when calling openQuizExistsDialog', () => {
        const dialogOpenSpy = spyOn(component['dialog'], 'open');
        component['showError'](ErrorDictionary.ISSUE);
        expect(dialogOpenSpy).toHaveBeenCalledWith(AlertDialogComponent, {
            data: {
                title: "Erreur lors de l'importation",
                content: ErrorDictionary.ISSUE,
            },
        });
    });
});
