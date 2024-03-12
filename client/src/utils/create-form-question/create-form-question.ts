import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormChoice, FormQuestion } from '@common/interfaces/quiz-form.interface';
import { QuestionType } from '@common/enums/question-type.enum';

const formBuilder = new FormBuilder();

export const createFormQuestionFormGroup = (question: FormQuestion): FormGroup => {
    return formBuilder.group({
        type: [question.type === QuestionType.QCM ? 'QCM' : 'QRL'],
        text: [question.text, Validators.required],
        points: [question.points],
        choices: formBuilder.array(
            question.choices.map((choice: FormChoice) =>
                formBuilder.group({
                    text: [choice.text],
                    isCorrect: [choice.isCorrect],
                }),
            ),
        ),
        beingModified: [question.beingModified],
    });
};
