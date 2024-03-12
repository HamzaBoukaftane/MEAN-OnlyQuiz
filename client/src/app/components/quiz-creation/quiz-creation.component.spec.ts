import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertDialogComponent } from '@app/components/alert-dialog/alert-dialog.component';
import { QuestionListComponent } from '@app/components/question-list/question-list.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';
import { QuizValidationService } from '@app/services/quiz-validation.service/quiz-validation.service';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { ErrorDictionary } from '@common/browser-message/error-message/error-message';
import { QuestionType } from '@common/enums/question-type.enum';
import { FormChoice, FormQuestion } from '@common/interfaces/quiz-form.interface';
import { Quiz } from '@common/interfaces/quiz.interface';
import { of } from 'rxjs';
import { PageMode } from 'src/enums/page-mode.enum';
import { createFormQuestionFormGroup } from 'src/utils/create-form-question/create-form-question';
import { QuizCreationComponent } from './quiz-creation.component';
import SpyObj = jasmine.SpyObj;

describe('QuizCreationComponent', () => {
    let component: QuizCreationComponent;
    let fixture: ComponentFixture<QuizCreationComponent>;
    let quizFormServiceMock: SpyObj<QuizFormService>;
    let quizValidationServiceMock: SpyObj<QuizValidationService>;
    let quizServiceMock: SpyObj<QuizService>;
    let activatedRoute: ActivatedRoute;
    let routerMock: SpyObj<Router>;
    let mockQuiz: Quiz;
    let question1: FormQuestion;
    let question3: FormQuestion;
    let formBuilder: FormBuilder;
    const POPUP_DELAY = 3000;
    beforeEach(() => {
        quizFormServiceMock = jasmine.createSpyObj('QuizFormService', ['fillForm', 'extractQuizFromForm']);
        quizValidationServiceMock = jasmine.createSpyObj('quizValidationService', ['validateQuiz']);
        quizServiceMock = jasmine.createSpyObj('QuizService', ['basicGetById', 'basicPut', 'basicPost', 'checkTitleUniqueness']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        mockQuiz = {
            id: '1',
            title: 'Sample Quiz',
            description: 'This is a sample quiz',
            duration: 30,
            lastModification: '2023-10-10T12:00:00Z',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'What is the capital of France?',
                    points: 10,
                    choices: [
                        { text: 'Paris', isCorrect: true },
                        { text: 'Berlin', isCorrect: false },
                        { text: 'Madrid', isCorrect: false },
                    ],
                },
                {
                    type: QuestionType.QRL,
                    text: 'What is 2 + 2?',
                    points: 5,
                },
            ],
            visible: false,
        };
        const choice1: FormChoice = {
            text: 'Choice 1',
            isCorrect: true,
        };

        const choice2: FormChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        // Create FormQuestion objects
        question1 = {
            type: QuestionType.QCM,
            text: 'Question 1',
            points: 10,
            choices: [choice1, choice2],
            beingModified: false,
        };

        question3 = {
            type: QuestionType.QRL,
            text: 'Question 3',
            points: 15,
            choices: [choice1, choice2],
            beingModified: false,
        };
        quizServiceMock.basicGetById.and.returnValue(of(mockQuiz));
        quizServiceMock.basicPut.and.returnValue(of());
        quizServiceMock.basicPost.and.returnValue(of());
        quizServiceMock.checkTitleUniqueness.and.returnValue(of(new HttpResponse({ body: { isUnique: true } })));
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuizCreationComponent, QuestionListComponent],
            imports: [ReactiveFormsModule, FormsModule, HttpClientModule, AppMaterialModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => '123',
                            },
                        },
                    },
                },
                {
                    provide: Router,
                    useValue: routerMock,
                },
                FormBuilder,
                MatDialog,
                { provide: QuizFormService, useValue: quizFormServiceMock },
                { provide: QuizValidationService, useValue: quizValidationServiceMock },
                {
                    provide: QuizService,
                    useValue: quizServiceMock,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        formBuilder = TestBed.inject(FormBuilder);
        fixture = TestBed.createComponent(QuizCreationComponent);
        component = fixture.componentInstance;
        activatedRoute = TestBed.inject(ActivatedRoute);
        component.quizForm = formBuilder.group({
            title: ['titre', Validators.required],
            duration: [0, Validators.required],
            description: ['description', Validators.required],
            questions: formBuilder.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)], Validators.required),
            visible: [false, Validators.required],
        });
        component['quizService'] = TestBed.inject(QuizService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize in CREATION mode with null ID', () => {
        const customGet = () => {
            return null;
        };
        spyOn(activatedRoute.snapshot.paramMap, 'get').and.callFake(customGet);
        fixture = TestBed.createComponent(QuizCreationComponent);
        component = fixture.componentInstance;
        expect(component['quizFormService'].fillForm).toHaveBeenCalledWith();
        expect(component.mode).toBe(PageMode.CREATION);
    });

    it('should initialize in MODIFICATION mode when existing ID', () => {
        const customGet = (paramName: string) => {
            if (paramName === 'id') {
                return '4';
            }
            return null;
        };
        spyOn(activatedRoute.snapshot.paramMap, 'get').and.callFake(customGet);
        fixture = TestBed.createComponent(QuizCreationComponent);
        component = fixture.componentInstance;
        expect(component['quizService'].basicGetById).toHaveBeenCalledWith(customGet('id') as string);
        expect(component['quizFormService'].fillForm).toHaveBeenCalledWith(mockQuiz);
        expect(component.mode).toBe(PageMode.MODIFICATION);
    });

    it('should return the questions FormArray', () => {
        const questionsArray = component.questionsArray;
        // Check the length of the FormArray
        expect(questionsArray.length).toBe(2); // Assuming two questions were mocked
    });

    it('should set isPopupVisibleForm to true and then false when condition is true', fakeAsync(() => {
        component.isPopupVisibleForm = false;
        const condition = true;
        component.showPopupIfFormConditionMet(condition);
        expect(component.isPopupVisibleForm).toBeTruthy();
        tick(POPUP_DELAY);
        expect(component.isPopupVisibleForm).toBeFalsy();
    }));

    it('should not change isPopupVisibleForm when condition is false', () => {
        component.isPopupVisibleForm = false;
        const condition = false;
        component.showPopupIfFormConditionMet(condition);
        expect(component.isPopupVisibleForm).toBe(false);
    });

    it('should call basicPost when mode is CREATION', fakeAsync(() => {
        component.mode = PageMode.CREATION;
        quizServiceMock.basicPost.and.returnValue(of(new HttpResponse({ body: 'success' })));
        component['addOrUpdateQuiz'](mockQuiz);
        expect(mockQuiz.id).toBeDefined();
        expect(quizServiceMock.basicPost).toHaveBeenCalledWith(mockQuiz);
        expect(quizServiceMock.basicPut).not.toHaveBeenCalled();
        tick();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game-admin-page']);
    }));

    it('should call basicPut when mode is MODIFICATION', fakeAsync(() => {
        component.mode = PageMode.MODIFICATION;
        quizServiceMock.basicPut.and.returnValue(of(new HttpResponse({ body: 'success' })));
        component['addOrUpdateQuiz'](mockQuiz);
        expect(mockQuiz.id).toBeDefined();
        expect(quizServiceMock.basicPut).toHaveBeenCalledWith(mockQuiz);
        expect(quizServiceMock.basicPost).not.toHaveBeenCalled();
        tick();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game-admin-page']);
    }));

    it('should call addOrUpdateQuiz when form is valid and title is unique', () => {
        component.mode = PageMode.CREATION;
        const title = component.quizForm.value['title'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'addOrUpdateQuiz' as any);
        quizServiceMock.checkTitleUniqueness.and.returnValue(of(new HttpResponse({ body: { isUnique: true } })));
        component.onSubmit();
        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledWith(title);
        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledTimes(1);
        expect(component['quizFormService'].extractQuizFromForm).toHaveBeenCalledTimes(1);
        expect(component['addOrUpdateQuiz']).toHaveBeenCalled();
    });

    it('should show an alert when form is valid but title is not unique', () => {
        component.mode = PageMode.CREATION;
        const title = component.quizForm.value['title'];
        // Mock a response with a non-unique title
        quizServiceMock.checkTitleUniqueness.and.returnValue(of(new HttpResponse({ body: { isUnique: false } })));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const openQuizExistsDialogSpy = spyOn(component, 'openQuizExistsDialog' as any);

        component.onSubmit();

        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledWith(title);
        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledTimes(1);
        expect(openQuizExistsDialogSpy).toHaveBeenCalled();
    });

    it('should set form errors and show a popup when form is not valid', () => {
        const showPopupIfFormConditionMetSpy = spyOn(component, 'showPopupIfFormConditionMet');
        // make the quizForm invalid by giving an empty title
        component.quizForm.get('title')?.patchValue('');
        component.onSubmit();
        expect(quizValidationServiceMock.validateQuiz).toHaveBeenCalled();
        expect(showPopupIfFormConditionMetSpy).toHaveBeenCalledWith(true);
    });

    it('should call dialog open function when calling openQuizExistsDialog', () => {
        const dialogOpenSpy = spyOn(component['dialog'], 'open');
        component['openQuizExistsDialog']();
        expect(dialogOpenSpy).toHaveBeenCalledWith(AlertDialogComponent, {
            data: {
                title: 'Le titre existe déjà',
                content: ErrorDictionary.QUIZ_ALREADY_EXIST,
            },
        });
    });
});
