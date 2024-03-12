import { Component, Injector } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertDialogComponent } from '@app/components/alert-dialog/alert-dialog.component';
import { POPUP_TIMEOUT } from '@common/constants/quiz-creation.component.const';
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';
import { QuizValidationService } from '@app/services/quiz-validation.service/quiz-validation.service';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { ErrorDictionary } from '@common/browser-message/error-message/error-message';
import { Quiz } from '@common/interfaces/quiz.interface';
import { PageMode } from 'src/enums/page-mode.enum';
import { generateRandomId } from 'src/utils/random-id-generator/random-id-generator';
import { GAME_ADMIN_PAGE } from '@common/page-url/page-url';

@Component({
    selector: 'app-quiz-creation',
    templateUrl: './quiz-creation.component.html',
    styleUrls: ['./quiz-creation.component.scss'],
})
export class QuizCreationComponent {
    quizForm: FormGroup;
    quiz: Quiz;
    mode: PageMode;
    isPopupVisibleDuration: boolean;
    isPopupVisibleForm: boolean;
    formErrors: string[];
    protected readonly pageModel = PageMode;
    private quizFormService: QuizFormService;
    private quizValidationService: QuizValidationService;
    private quizService: QuizService;
    private route: ActivatedRoute;
    private navigateRoute: Router;

    constructor(
        injector: Injector,
        private dialog: MatDialog,
    ) {
        this.quizFormService = injector.get<QuizFormService>(QuizFormService);
        this.quizValidationService = injector.get<QuizValidationService>(QuizValidationService);
        this.quizService = injector.get<QuizService>(QuizService);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.navigateRoute = injector.get<Router>(Router);
        this.isPopupVisibleDuration = false;
        this.isPopupVisibleForm = false;
        this.formErrors = [];
        this.quizForm = this.quizFormService.fillForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode = PageMode.MODIFICATION;
            this.quizService.basicGetById(id).subscribe((quiz: Quiz) => {
                this.quiz = quiz;
                this.quizForm = this.quizFormService.fillForm(quiz);
            });
        } else {
            this.mode = PageMode.CREATION;
            this.quizForm = this.quizFormService.fillForm();
        }
    }

    get questionsArray() {
        return this.quizForm.get('questions') as FormArray;
    }

    showPopupIfFormConditionMet(condition: boolean) {
        if (condition) {
            this.isPopupVisibleForm = true;
            setTimeout(() => {
                this.isPopupVisibleForm = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    onSubmit() {
        const quiz = this.quizFormService.extractQuizFromForm(this.quizForm, this.questionsArray);
        if (this.quizForm?.valid) {
            const title = this.quizForm.get('title')?.value;
            this.quizService.checkTitleUniqueness(title).subscribe((response) => {
                if (response.body?.isUnique || this.mode === PageMode.MODIFICATION) {
                    this.addOrUpdateQuiz(quiz);
                } else {
                    this.openQuizExistsDialog();
                }
            });
        } else {
            this.formErrors = this.quizValidationService.validateQuiz(quiz);
            this.showPopupIfFormConditionMet(true);
        }
    }

    private addOrUpdateQuiz(quiz: Quiz) {
        const navigateToAdminCallBack = () => {
            this.navigateRoute.navigate([`/${GAME_ADMIN_PAGE}`]);
        };
        if (this.mode === PageMode.MODIFICATION) {
            quiz.id = this.quiz.id;
            this.quizService.basicPut(quiz).subscribe(navigateToAdminCallBack);
        } else {
            quiz.id = generateRandomId();
            this.quizService.basicPost(quiz).subscribe(navigateToAdminCallBack);
        }
    }

    private openQuizExistsDialog() {
        this.dialog.open(AlertDialogComponent, {
            data: {
                title: 'Le titre existe déjà',
                content: ErrorDictionary.QUIZ_ALREADY_EXIST,
            },
        });
    }
}
