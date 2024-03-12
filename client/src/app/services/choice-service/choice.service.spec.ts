import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormChoice, FormQuestion } from '@common/interfaces/quiz-form.interface';
import { QuestionType } from '@common/enums/question-type.enum';
import { ChoiceService } from '@app/services/choice-service/choice.service';
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';
import { ItemMovingDirection } from 'src/enums/item-moving-direction';
import { QuestionChoicePosition } from '@app/interfaces/question-choice-position/question-choice-position';
import { createFormQuestionFormGroup } from 'src/utils/create-form-question/create-form-question';

describe('ChoiceService', () => {
    let service: ChoiceService;
    let formQuestionsArrayAllSaved: FormArray;

    const fb: FormBuilder = new FormBuilder();
    const LENGTH_FOUR = 4;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ChoiceService, FormBuilder, QuizFormService],
        });
        service = TestBed.inject(ChoiceService);
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

        const question3: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 3',
            points: 15,
            choices: [choice1, choice2],
            beingModified: false,
        };

        formQuestionsArrayAllSaved = fb.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)]);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call initChoice when adding a new Choice', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const questionFormArray = formQuestionsArrayAllSaved;
        spyOn(service['quizFormService'], 'initChoice').and.returnValue(new FormGroup([]));
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        expect(service['quizFormService'].initChoice).toHaveBeenCalled();
    });

    it('should add a choice to the specified question', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const questionFormArray = formQuestionsArrayAllSaved;
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        const choicesArray = questionFormArray.at(questionIndex)?.get('choices') as FormArray;
        expect(choicesArray.length).toBe(3);
    });

    it('should not add a choice if choicesArray length exceeds the limit', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const questionFormArray = formQuestionsArrayAllSaved;
        // adds to four elements
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        const choicesArray = questionFormArray.at(questionIndex)?.get('choices') as FormArray;
        expect(choicesArray.length).toBe(LENGTH_FOUR);
    });

    it('should call swapElements and getChoicesArray when moving choice up or down', () => {
        // Arrange
        const questionsFormArray = formQuestionsArrayAllSaved;
        const questionToModifyIndex = 0;
        const choiceToMoveUpIndex = 1;
        const moveQuestionChoicePosition = { questionNumber: questionToModifyIndex, choiceNumber: choiceToMoveUpIndex };

        spyOn(service, 'swapElements');
        spyOn(service, 'getChoicesArray').and.returnValue(new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]));
        service.moveChoice(ItemMovingDirection.UP, moveQuestionChoicePosition, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalled();
        expect(service.getChoicesArray).toHaveBeenCalled();
        moveQuestionChoicePosition.choiceNumber = 0;
        service.moveChoice(ItemMovingDirection.DOWN, moveQuestionChoicePosition, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalled();
        expect(service.getChoicesArray).toHaveBeenCalled();
    });

    it('should move a choice up or move choice down within the specified question', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const choicePosition: QuestionChoicePosition = {
            questionNumber: questionIndex,
            choiceNumber: choiceIndex,
        };
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        const questionFormGroup = new FormGroup({
            choices: choicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        service.moveChoice(ItemMovingDirection.UP, choicePosition, questionFormArray);
        expect(choicesArray.value).toEqual(['Choice 2', 'Choice 1']);
        choicePosition.choiceNumber = 0;
        service.moveChoice(ItemMovingDirection.DOWN, choicePosition, questionFormArray);
        expect(choicesArray.value).toEqual(['Choice 1', 'Choice 2']);
    });

    it('should remove a choice at a given index if number of choices is superior to two', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2'), new FormControl('Choice 3')]);
        const questionFormGroup = new FormGroup({
            choices: choicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        service.removeChoice(questionIndex, choiceIndex, questionFormArray);
        expect(choicesArray.length).toBe(2);
        expect(choicesArray.value).toEqual(['Choice 1', 'Choice 3']);
    });

    it('should not remove a choice at a given index if number of choices is inferior to three', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        const questionFormGroup = new FormGroup({
            choices: choicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        service.removeChoice(questionIndex, choiceIndex, questionFormArray);
        expect(choicesArray.length).toBe(2);
        expect(choicesArray.value).toEqual(['Choice 1', 'Choice 2']);
    });

    it('should return the choices array for a given index', () => {
        const questionIndex = 0;
        const initialChoicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        const questionFormGroup = new FormGroup({
            choices: initialChoicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        const choicesReturned = service.getChoicesArray(questionIndex, questionFormArray);
        expect(choicesReturned).toBeTruthy();
        expect(choicesReturned.value).toEqual(initialChoicesArray.value);
    });

    it('should return null if the form array is undefined', () => {
        const questionIndex = 0;
        const choicesArray = service.getChoicesArray(questionIndex);
        expect(choicesArray).toBeUndefined();
    });

    it('should swap two elements in the form array', () => {
        const firstIndex = 0;
        const secondIndex = 1;
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        service.swapElements(firstIndex, secondIndex, choicesArray);

        const elementA = choicesArray.at(firstIndex).value;
        const elementB = choicesArray.at(secondIndex).value;

        expect(elementA).toBe('Choice 2');
        expect(elementB).toBe('Choice 1');
    });
});
