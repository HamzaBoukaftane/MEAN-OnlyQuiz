import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormChoice, FormQuestion } from '@common/interfaces/quiz-form.interface';
import { Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuestionType } from '@common/enums/question-type.enum';
import SpyObj = jasmine.SpyObj;
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';
import { createFormQuestionFormGroup } from 'src/utils/create-form-question/create-form-question';
import { QuizValidationService } from '@app/services/quiz-validation.service/quiz-validation.service';

describe('QuizFormService', () => {
    let service: QuizFormService;
    let quizValidationServiceSpy: SpyObj<QuizValidationService>;
    let formQuestionsArrayAllSaved: FormArray;
    let firstQuestion: QuizQuestion;
    let secondQuestion: QuizQuestion;
    let firstChoice: QuizChoice;
    let secondChoice: QuizChoice;
    let validQuiz: Quiz;
    let mockQuizForm: FormGroup;

    const fb: FormBuilder = new FormBuilder();

    beforeEach(() => {
        quizValidationServiceSpy = jasmine.createSpyObj('QuizValidationService', [
            'validateQuiz',
            'validateQuestion',
            'divisibleByTen',
            'validateChoicesForm',
        ]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                QuizFormService,
                FormBuilder,
                {
                    provide: QuizValidationService,
                    useValue: quizValidationServiceSpy,
                },
            ],
        });
        service = TestBed.inject(QuizFormService);
    });

    beforeEach(() => {
        const choice1: FormChoice = {
            text: 'Choice 1',
            isCorrect: true,
        };

        const choice2: FormChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        firstChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        secondChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        const question1: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 1',
            points: 10,
            choices: [choice1, choice2],
            beingModified: false,
        };

        const question3: FormQuestion = {
            type: QuestionType.QRL,
            text: 'Question 3',
            points: 15,
            choices: [],
            beingModified: false,
        };

        formQuestionsArrayAllSaved = fb.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)]);

        firstQuestion = {
            type: QuestionType.QCM,
            text: 'first question',
            points: 50,
            choices: [],
        };

        secondQuestion = {
            type: QuestionType.QCM,
            text: 'second question',
            points: 40,
            choices: [],
        };

        validQuiz = {
            id: '1',
            title: 'Test Quiz',
            description: 'This is a test quiz',
            duration: 30,
            lastModification: '2023-09-28',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Sample Question 1',
                    points: 20,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
            visible: false,
        };

        mockQuizForm = fb.group({
            title: ['titre', Validators.required],
            duration: [0, Validators.required],
            description: ['description', Validators.required],
            questions: fb.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)], Validators.required),
            visible: [false, Validators.required],
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a FormGroup with default values when no quiz is provided', () => {
        spyOn(service, 'fillQuestions');
        const quizForm: FormGroup = service.fillForm();
        expect(quizForm.get('title')?.value).toBe(null);
        expect(service.fillQuestions).toHaveBeenCalled();
        expect(quizForm.get('duration')?.value).toBe(null);
        expect(quizForm.get('description')?.value).toBe(null);
        expect(quizForm.get('questions')).toBeTruthy();
    });

    it('should return a FormGroup with values from the provided quiz when calling fillForm', () => {
        const quizForm: FormGroup = service.fillForm(validQuiz);
        expect(quizForm.get('title')?.value).toBe(validQuiz.title);
        expect(quizForm.get('duration')?.value).toBe(validQuiz.duration);
        expect(quizForm.get('description')?.value).toBe(validQuiz.description);
        expect(quizForm.get('questions')).toBeTruthy();
        expect((quizForm.get('questions') as FormArray).at(0).get('text')?.value).toEqual(validQuiz.questions[0].text);
    });

    it('should call initQuestion for each question in the array', () => {
        const quizQuestions = [firstQuestion, secondQuestion];
        spyOn(service, 'initQuestion').and.callThrough();
        service.fillQuestions(formQuestionsArrayAllSaved, quizQuestions);
        expect(service.initQuestion).toHaveBeenCalledTimes(quizQuestions.length);
    });

    it('should not call initQuestion if questions array is empty', () => {
        const emptyQuestionsArray: QuizQuestion[] = [];
        spyOn(service, 'initQuestion').and.callThrough();
        service.fillQuestions(formQuestionsArrayAllSaved, emptyQuestionsArray);
        expect(service.initQuestion).not.toHaveBeenCalled();
    });

    it('should call initChoice for each choice in the array', () => {
        const quizChoices = [firstChoice, secondChoice];
        spyOn(service, 'initChoice').and.callThrough();
        service.fillChoices(formQuestionsArrayAllSaved, quizChoices);
        expect(service.initChoice).toHaveBeenCalledTimes(quizChoices.length);
    });

    it('should not call initQuestion if questions array is empty', () => {
        const emptyChoicesArray: QuizChoice[] = [];
        spyOn(service, 'initChoice').and.callThrough();
        service.fillChoices(formQuestionsArrayAllSaved, emptyChoicesArray);
        expect(service.initChoice).not.toHaveBeenCalled();
    });

    it('should call fillChoices method when calling initQuestion', () => {
        spyOn(service, 'fillChoices');
        quizValidationServiceSpy.divisibleByTen.and.returnValue({ notDivisibleByTen: true });
        quizValidationServiceSpy.validateChoicesForm.and.returnValue({ invalidChoices: true });
        service.initQuestion(firstQuestion);
        expect(service.fillChoices).toHaveBeenCalled();
        expect(quizValidationServiceSpy.divisibleByTen).toHaveBeenCalled();
        expect(quizValidationServiceSpy.validateChoicesForm).toHaveBeenCalled();
    });

    it('should create a FormGroup for a new QCM question with provided values', () => {
        const questionForm = service.initQuestion(firstQuestion);
        expect(questionForm.value).toEqual({
            type: 'QCM',
            text: firstQuestion.text,
            points: firstQuestion.points,
            choices: firstQuestion.choices,
            beingModified: false,
        });
    });

    it('should create a FormGroup with default values if no question is provided', () => {
        const questionForm = service.initQuestion();
        expect(questionForm.value).toEqual({
            type: 'QRL',
            text: '',
            points: 0,
            choices: [],
            beingModified: true,
        });
    });

    it('should create a FormGroup for a new choice with provided values', () => {
        const choiceForm = service.initChoice(firstChoice);
        expect(choiceForm.value).toEqual({
            text: firstChoice.text,
            isCorrect: firstChoice.isCorrect ? 'true' : 'false',
        });
    });

    it('should extract values from a QCM question form', () => {
        const questionForm = fb.group({
            type: 'QCM',
            text: 'Sample QCM Question',
            points: 60,
            choices: fb.array([
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ]),
        });

        const extractedQuestion = service.extractQuestion(questionForm);
        expect(extractedQuestion).toEqual({
            type: QuestionType.QCM,
            text: 'Sample QCM Question',
            points: 60,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        });
    });

    it('should return an empty QuizQuestion when the form is empty', () => {
        const questionForm = fb.group({
            type: '',
            text: '',
            points: 0,
            choices: fb.array([]),
        });
        const extractedQuestion = service.extractQuestion(questionForm);
        expect(extractedQuestion).toEqual({
            type: QuestionType.QRL,
            text: '',
            points: 0,
            choices: undefined,
        });
    });

    it('should extract quiz data from form', () => {
        const questionsArray = mockQuizForm.get('questions') as FormArray;
        const extractedQuiz: Quiz = service.extractQuizFromForm(mockQuizForm, questionsArray);

        expect(extractedQuiz.title).toEqual(mockQuizForm.get('title')?.value);
        expect(extractedQuiz.description).toEqual(mockQuizForm.get('description')?.value);
        expect(extractedQuiz.duration).toEqual(mockQuizForm.get('duration')?.value);
        expect(extractedQuiz.visible).toEqual(mockQuizForm.get('visible')?.value);

        expect(extractedQuiz.questions.length).toEqual(questionsArray.length);

        const firstExtractedQuestion: QuizQuestion = extractedQuiz.questions[0];
        expect(firstExtractedQuestion.type).toEqual(questionsArray.at(0).get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QRL);
        expect(firstExtractedQuestion.text).toEqual(questionsArray.at(0).get('text')?.value);
        expect(firstExtractedQuestion.points).toEqual(questionsArray.at(0).get('points')?.value);
        const firstChoiceFirstChoice: QuizChoice[] = firstExtractedQuestion.choices as QuizChoice[];
        expect(firstChoiceFirstChoice[0].text).toEqual(questionsArray.at(0).get('choices')?.value[0].text);
        expect(firstChoiceFirstChoice[0].isCorrect).toEqual(questionsArray.at(0).get('choices')?.value[0].isCorrect === 'true');
        expect(firstChoiceFirstChoice[1].text).toEqual(questionsArray.at(0).get('choices')?.value[1].text);
        expect(firstChoiceFirstChoice[1].isCorrect).toEqual(questionsArray.at(0).get('choices')?.value[1].isCorrect === 'true');

        const secondExtractedQuestion: QuizQuestion = extractedQuiz.questions[1];
        expect(secondExtractedQuestion.type).toEqual(questionsArray.at(1).get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QRL);
        expect(secondExtractedQuestion.text).toEqual(questionsArray.at(1).get('text')?.value);
        expect(secondExtractedQuestion.points).toEqual(questionsArray.at(1).get('points')?.value);
    });

    it('should set validators for choices control when type is QCM', () => {
        const questionForm = (mockQuizForm.get('questions') as FormArray).at(0) as FormGroup;
        spyOn(questionForm.get('choices') as FormArray, 'setValidators');
        spyOn(questionForm.get('choices') as FormArray, 'updateValueAndValidity');
        service['attachListenerToQuestionType'](questionForm);
        questionForm.get('type')?.setValue('QCM');
        expect(questionForm.get('choices')?.setValidators).toHaveBeenCalled();
        expect(questionForm.get('choices')?.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should clear validators and values for choices control when type is not QCM', () => {
        const questionForm = (mockQuizForm.get('questions') as FormArray).at(0) as FormGroup;

        spyOn(questionForm.get('choices') as FormArray, 'clearValidators').and.callThrough();
        spyOn(questionForm.get('choices') as FormArray, 'clear').and.callThrough();
        spyOn(questionForm.get('choices') as FormArray, 'updateValueAndValidity');

        service['attachListenerToQuestionType'](questionForm);

        questionForm.get('type')?.setValue('QLR');

        expect(questionForm.get('choices')?.clearValidators).toHaveBeenCalled();
        expect((questionForm.get('choices') as FormArray)?.clear).toHaveBeenCalled();
        expect(questionForm.get('choices')?.updateValueAndValidity).toHaveBeenCalled();
    });
});
