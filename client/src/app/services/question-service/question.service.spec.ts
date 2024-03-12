/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FormChoice, FormQuestion } from '@common/interfaces/quiz-form.interface';
import { QuestionType } from '@common/enums/question-type.enum';

import SpyObj = jasmine.SpyObj;
import { QuestionService } from '@app/services/question-service/question.service';
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';
import { createFormQuestionFormGroup } from 'src/utils/create-form-question/create-form-question';
import { QuizValidationService } from '@app/services/quiz-validation.service/quiz-validation.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let quizValidationServiceSpy: SpyObj<QuizValidationService>;
    let formQuestionsArrayOneUnsaved: FormArray;
    let formQuestionsArrayAllSaved: FormArray;
    let formQuestionsArrayOneUnsavedAndInvalid: FormArray;
    let invalidQuestion: FormQuestion;
    let validQuestion: FormQuestion;

    const NON_EXISTANT_INDEX = -1;
    const LENGTH_TWO = 2;
    const LENGTH_THREE = 3;
    const LENGTH_FOUR = 4;
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
                QuestionService,
                FormBuilder,
                {
                    provide: QuizValidationService,
                    useValue: quizValidationServiceSpy,
                },
                QuizFormService,
            ],
        });
        service = TestBed.inject(QuestionService);
        service.modifiedQuestionIndex = NON_EXISTANT_INDEX;
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

        const question1: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 1',
            points: 10,
            choices: [choice1, choice2],
            beingModified: false,
        };

        const question2: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 2',
            points: 5,
            choices: [choice1],
            beingModified: true,
        };

        const question3: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 3',
            points: 15,
            choices: [choice1, choice2],
            beingModified: false,
        };

        invalidQuestion = {
            type: QuestionType.QCM,
            text: '',
            points: 15,
            choices: [choice1, choice2],
            beingModified: true,
        };

        validQuestion = {
            type: QuestionType.QCM,
            text: 'texte',
            points: 40,
            choices: [choice1, choice2],
            beingModified: true,
        };

        // Create FormArray with FormGroup objects for FormQuestion
        formQuestionsArrayOneUnsaved = fb.array([
            createFormQuestionFormGroup(question1),
            createFormQuestionFormGroup(question2),
            createFormQuestionFormGroup(question3),
        ]);

        formQuestionsArrayOneUnsavedAndInvalid = fb.array([
            createFormQuestionFormGroup(question1),
            createFormQuestionFormGroup(invalidQuestion),
            createFormQuestionFormGroup(question3),
        ]);

        formQuestionsArrayAllSaved = fb.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)]);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call initQuestion and not call saveQuestion when modifiedQuestionIndex is NON_EXISTANT_INDEX', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        spyOn(service['quizFormService'], 'initQuestion').and.returnValue(createFormQuestionFormGroup(invalidQuestion));
        spyOn(service, 'saveQuestion');
        expect(service.modifiedQuestionIndex).toBe(NON_EXISTANT_INDEX);
        service.addQuestion(NON_EXISTANT_INDEX, questionsArrayForm);
        expect(service['quizFormService'].initQuestion).toHaveBeenCalled();
        expect(service.saveQuestion).not.toHaveBeenCalled();
    });

    it('should call saveQuestion when modifiedQuestionIndex is not NON_EXISTANT_INDEX', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        service.modifiedQuestionIndex = 0;
        // Arrange
        spyOn(service, 'saveQuestion').and.returnValue([]); // Mock saveQuestion to return an empty array
        // Act
        service.addQuestion(0, questionsArrayForm);
        expect(service.saveQuestion).toHaveBeenCalled();
    });

    it('should call initQuestion when the question has been successfully saved', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        service.modifiedQuestionIndex = 0;
        spyOn(service['quizFormService'], 'initQuestion').and.returnValue(createFormQuestionFormGroup(invalidQuestion));
        spyOn(service, 'saveQuestion').and.returnValue([]);
        service.addQuestion(NON_EXISTANT_INDEX, questionsArrayForm);
        expect(service['quizFormService'].initQuestion).toHaveBeenCalled();
    });

    it('should not call initQuestion when saveQuestion returns validation errors', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        service.modifiedQuestionIndex = 0;
        spyOn(service['quizFormService'], 'initQuestion');
        spyOn(service, 'saveQuestion').and.returnValue(['Validation Error 1', 'Validation Error 2']);
        const result = service.addQuestion(0, questionsArrayForm);
        expect(service['quizFormService'].initQuestion).not.toHaveBeenCalled();
        expect(result.length).toBeGreaterThan(0);
    });

    it('should add a question element to an empty array', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        const questionToAddForm = createFormQuestionFormGroup(validQuestion);
        spyOn(service['quizFormService'], 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(0);
        service.addQuestion(NON_EXISTANT_INDEX, questionsArrayForm);
        expect(service['quizFormService'].initQuestion).toHaveBeenCalled();
        expect(questionsArrayForm.length).toBe(1);
    });

    it('should add a question element in the right index', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const index = 1;
        const questionToAddForm = createFormQuestionFormGroup(validQuestion);
        spyOn(service['quizFormService'], 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
        service.addQuestion(index, questionsArrayForm);
        expect(questionsArrayForm.at(index + 1).get('text')?.value).toEqual(validQuestion.text);
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
    });

    it('should save the unsaved valid question before adding a new question', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const index = 2;
        const questionToAddForm = createFormQuestionFormGroup(validQuestion);
        spyOn(service['quizFormService'], 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(3);
        expect(questionsArrayForm.at(service.modifiedQuestionIndex).get('beingModified')).toBeTruthy();
        service.addQuestion(index, questionsArrayForm);
        expect(service.modifiedQuestionIndex).toBe(index + 1);
        expect(questionsArrayForm.at(index + 1).get('text')?.value).toEqual(validQuestion.text);
        expect(questionsArrayForm.length).toBe(LENGTH_FOUR);
    });

    it('should not add a new question if saving an invalid question', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsavedAndInvalid;
        service.modifiedQuestionIndex = 1;
        const index = 2;
        const questionToAddForm = createFormQuestionFormGroup(invalidQuestion);
        spyOn(service['quizFormService'], 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(3);
        expect(questionsArrayForm.at(service.modifiedQuestionIndex).get('beingModified')).toBeTruthy();
        spyOn(service, 'saveQuestion').and.returnValue(['Validation error']);
        const validationErrors = service.addQuestion(index, questionsArrayForm);
        expect(validationErrors.length).toBeGreaterThan(0);
        expect(service['quizFormService'].initQuestion).not.toHaveBeenCalled();
        expect(service.modifiedQuestionIndex).toBe(1);
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
    });

    it('should remove the question that is specified by its index in the array', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const indexToRemove = 1;
        expect(service.modifiedQuestionIndex).toBe(NON_EXISTANT_INDEX);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
        service.removeQuestion(indexToRemove, questionsArrayForm);
        expect(questionsArrayForm.length).toBe(1);
    });

    it('should remove reset the modified question index if the modified question is removed', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const indexToRemove = 1;
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
        service.removeQuestion(indexToRemove, questionsArrayForm);
        expect(service.modifiedQuestionIndex).toBe(NON_EXISTANT_INDEX);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
    });

    it('should change the modified question index accordingly if the modified question is after the removed one', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const indexToRemove = 0;
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
        service.removeQuestion(indexToRemove, questionsArrayForm);
        // Assert
        expect(service.modifiedQuestionIndex).toBe(0);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
    });

    it('should not call saveQuestion and set beingModified to true when modifiedQuestionIndex is NON_EXISTANT_INDEX', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        service.modifiedQuestionIndex = NON_EXISTANT_INDEX;
        const indexToModify = 0;
        const result = service.modifyQuestion(indexToModify, questionsArrayForm);
        expect(result).toEqual([]);
        spyOn(service, 'saveQuestion').and.returnValue([]);
        expect(service.saveQuestion).not.toHaveBeenCalled();
        expect(questionsArrayForm.at(indexToModify).get('beingModified')?.value).toBeTruthy();
    });

    it('should call saveQuestion and set beingModified to true when modifiedQuestionIndex is not NON_EXISTANT_INDEX', () => {
        // Arrange
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const indexToModify = 0;
        spyOn(service, 'saveQuestion').and.returnValue([]); // Mock saveQuestion to return an empty array
        service.modifiedQuestionIndex = indexToModify;
        const result = service.modifyQuestion(indexToModify, questionsArrayForm);
        expect(result).toEqual([]);
        expect(service.saveQuestion).toHaveBeenCalledWith(indexToModify, questionsArrayForm);
        // Check that beingModified is set to true for the modified question
        expect(questionsArrayForm.at(indexToModify).get('beingModified')?.value).toBeTruthy();
    });

    it('should call saveQuestion and set beingModified to false when saveQuestion returns a non-empty string array', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const indexToModify = 0;
        spyOn(service, 'saveQuestion').and.returnValue(['Validation Error']);
        service.modifiedQuestionIndex = indexToModify;
        const result = service.modifyQuestion(indexToModify, questionsArrayForm);
        expect(service.saveQuestion).toHaveBeenCalledWith(indexToModify, questionsArrayForm);
        expect(questionsArrayForm.at(indexToModify).get('beingModified')?.value).toBe(false);
        expect(result).toEqual(['Validation Error']);
    });

    it('should call extractQuestion and validateQuestion when the question is invalid and should not save', () => {
        // the second question of this array is unsaved and invalid
        const questionsFormArray = formQuestionsArrayOneUnsavedAndInvalid;
        const unsavedQuestionIndex = 1;
        quizValidationServiceSpy.validateQuestion.and.returnValue(['Validation error']);
        spyOn(service['quizFormService'], 'extractQuestion').and.returnValue(invalidQuestion);
        const result = service.saveQuestion(unsavedQuestionIndex, questionsFormArray);
        expect(quizValidationServiceSpy.validateQuestion).toHaveBeenCalled();
        expect(service['quizFormService'].extractQuestion).toHaveBeenCalled();
        expect(questionsFormArray.at(unsavedQuestionIndex).get('beingModified')?.value).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
    });

    it('should return an empty array and set beingModified to false for a valid question', () => {
        // the second question of this array is unsaved
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        const unsavedQuestionIndex = 1;
        quizValidationServiceSpy.validateQuestion.and.returnValue(['Validation error']);
        spyOn(service['quizFormService'], 'extractQuestion').and.returnValue(invalidQuestion);
        const result = service.saveQuestion(unsavedQuestionIndex, questionsFormArray);
        expect(quizValidationServiceSpy.validateQuestion).not.toHaveBeenCalled();
        expect(service['quizFormService'].extractQuestion).not.toHaveBeenCalled();
        expect(questionsFormArray.at(unsavedQuestionIndex).get('beingModified')?.value).toBeFalsy();
        expect(result.length).toBe(0);
    });

    it('should return a FormGroup with default values when no quiz is provided', () => {
        spyOn(service['quizFormService'], 'fillQuestions');
        const quizForm: FormGroup = service['quizFormService'].fillForm();
        expect(quizForm.get('title')?.value).toBe(null);
        expect(service['quizFormService'].fillQuestions).toHaveBeenCalled();
        expect(quizForm.get('duration')?.value).toBe(null);
        expect(quizForm.get('description')?.value).toBe(null);
        expect(quizForm.get('questions')).toBeTruthy();
    });

    it('should call swapElements with the correct arguments when moveQuestionUp or down', () => {
        const questionsFormArray = formQuestionsArrayAllSaved;
        const questionToMoveUpIndex = 1;
        spyOn(service, 'swapElements');
        service.moveQuestionUp(1, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalledWith(questionToMoveUpIndex, questionToMoveUpIndex - 1, questionsFormArray);
        service.moveQuestionDown(0, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalledWith(0, 1, questionsFormArray);
    });

    it('should swap questions accordingly when moveQuestionUp is called', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        const firstQuestionText = formQuestionsArrayOneUnsaved.at(0).get('text')?.value;
        const secondQuestionText = formQuestionsArrayOneUnsaved.at(1).get('text')?.value;
        service.modifiedQuestionIndex = 1;
        service.moveQuestionUp(1, questionsFormArray);
        expect(questionsFormArray.at(0).get('text')?.value).toEqual(secondQuestionText);
        expect(questionsFormArray.at(1).get('text')?.value).toEqual(firstQuestionText);
        expect(service.modifiedQuestionIndex).toBe(0);
    });

    it('should swap questions accordingly when moveQuestionDown is called', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        const firstQuestionText = formQuestionsArrayOneUnsaved.at(1).get('text')?.value;
        const secondQuestionText = formQuestionsArrayOneUnsaved.at(2).get('text')?.value;
        service.modifiedQuestionIndex = 1;
        service.moveQuestionDown(1, questionsFormArray);
        expect(questionsFormArray.at(1).get('text')?.value).toEqual(secondQuestionText);
        expect(questionsFormArray.at(2).get('text')?.value).toEqual(firstQuestionText);
        expect(service.modifiedQuestionIndex).toBe(2);
    });

    it('should change modifiedQuestionIndex when its equal to the index of the method moveQuestionUp or moveQuestionDown', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const questionToMoveUpIndex = 1;
        spyOn(service, 'swapElements');
        service.moveQuestionUp(questionToMoveUpIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(0);
        const questionToMoveDownIndex = 0;
        service.moveQuestionDown(questionToMoveDownIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(1);
    });

    it('should change modifiedQuestionIndex when the input index is not the modifiedQuestionIndex', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 0;
        const questionToMoveUpIndex = 1;
        spyOn(service, 'swapElements');
        service.moveQuestionUp(questionToMoveUpIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(1);
        const questionToMoveDownIndex = 0;
        service.moveQuestionDown(questionToMoveDownIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(0);
    });
});
