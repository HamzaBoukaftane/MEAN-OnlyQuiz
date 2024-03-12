import { FormQuestion } from '@common/interfaces/quiz-form.interface';
import { FormArray, FormGroup } from '@angular/forms';
import { createFormQuestionFormGroup } from './create-form-question';
import { QuestionType } from '@common/enums/question-type.enum';

const QUESTION_POINTS = 10;

describe('createFormQuestionFormGroup', () => {
    it('should create a FormGroup with the correct structure', () => {
        const question: FormQuestion = {
            type: QuestionType.QCM,
            text: 'What is 2 + 2?',
            points: 10,
            choices: [
                { text: '3', isCorrect: false },
                { text: '4', isCorrect: true },
            ],
            beingModified: false,
        };

        const formGroup: FormGroup = createFormQuestionFormGroup(question);

        expect(formGroup.get('type')?.value).toEqual('QCM');
        expect(formGroup.get('text')?.value).toEqual('What is 2 + 2?');
        expect(formGroup.get('points')?.value).toEqual(QUESTION_POINTS);

        const choicesArray = formGroup.get('choices') as FormArray;
        expect(choicesArray.length).toEqual(2);

        const choice1 = choicesArray.at(0) as FormGroup;
        expect(choice1.get('text')?.value).toEqual('3');
        expect(choice1.get('isCorrect')?.value).toEqual(false);

        const choice2 = choicesArray.at(1) as FormGroup;
        expect(choice2.get('text')?.value).toEqual('4');
        expect(choice2.get('isCorrect')?.value).toEqual(true);

        expect(formGroup.get('beingModified')?.value).toEqual(false);
    });
});
