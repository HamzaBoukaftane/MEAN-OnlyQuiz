import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient, ObjectId } from 'mongodb';
import { DatabaseServiceMock } from '@app/services/database.service/database.service.mock';
import { QuizService } from './quiz.service';
import { fillerQuizzes } from '@app/mock-data/data';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { DatabaseService } from '@app/services/database.service/database.service';
import { restore } from 'sinon';
chai.use(chaiAsPromised);

interface QuizMock {
    _id: ObjectId;
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: string | null;
    questions: QuizQuestion[];
    visible: boolean;
}

describe('Quiz Service', () => {
    let quizService: QuizService;
    let databaseService: DatabaseServiceMock;
    let testQuizzes: QuizMock[];

    const extraQuiz: QuizMock = {
        _id: new ObjectId(),
        id: '3',
        title: 'History Quiz',
        description: 'Test your knowledge of historical events!',
        duration: 60,
        lastModification: '2023-09-16',
        questions: [],
        visible: true,
    };

    before(() => {
        restore();
    });

    beforeEach(async () => {
        testQuizzes = fillerQuizzes as unknown[] as QuizMock[]; // Note : First quiz is visible, Second quiz is not visible !
        databaseService = new DatabaseServiceMock();
        (await databaseService.start()) as MongoClient;

        quizService = new QuizService(databaseService as unknown as DatabaseService);
        for (const quiz of testQuizzes) {
            delete quiz['_id'];
            await quizService.collection.insertOne(quiz);
        }
    });

    const removeIds = () => {
        testQuizzes.forEach((quiz) => {
            delete quiz['_id'];
        });
    };

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('should get all quizzes from DB', async () => {
        const quizzes = await quizService.getAll();
        removeIds();
        expect(testQuizzes).to.deep.equals(quizzes);
    });

    it('should get all visible quizzes from DB', async () => {
        const quizzes = await quizService.getAllVisible();
        removeIds();
        expect([testQuizzes[0]]).to.deep.equals(quizzes); // getAllVisible should return only the first quiz, since it's the only visible
    });

    it('should get quiz by id', async () => {
        const TEST_ID = '2';
        const quizz = await quizService.getById(TEST_ID);
        removeIds();
        expect(testQuizzes[1]).to.deep.equals(quizz); // ID = 2  corresponds to the second quiz in data.ts
    });

    it('should add quiz', async () => {
        await quizService.add(extraQuiz);
        const quizzes = await quizService.collection.find({}).toArray();
        expect(quizzes.find((x) => x.id === extraQuiz.id)).to.deep.equals(extraQuiz);
    });

    it('should update a quiz', async () => {
        const TEST_ID = '1';
        await quizService.update(TEST_ID, false);
        const quizz = await quizService.getById(TEST_ID);
        expect(quizz.visible).to.equal(false); // quizz at id 1 was initially at true, now should be false
    });

    it('should check if a title is unique', async () => {
        const titleOne = 'Science Quiz';
        const resOne = await quizService.isTitleUnique(titleOne);
        expect(resOne).to.equal(false);

        const titleTwo = 'This title is for sure not in the database!!';
        const resTwo = await quizService.isTitleUnique(titleTwo);
        expect(resTwo).to.equal(true);
    });

    it('should replace a quizz', async () => {
        const TEST_ID = '1';
        const TEST_TITLE = 'This is a test title replacing the first quiz title';
        extraQuiz.id = TEST_ID;
        extraQuiz.title = TEST_TITLE;
        delete extraQuiz['_id'];
        // eslint-disable-next-line no-console
        await quizService.replace(extraQuiz);
        const quizzes = await quizService.collection.find({}).toArray();
        expect(quizzes[0].title).to.equal(TEST_TITLE);
    });

    it('should delete a quizz', async () => {
        const TEST_ID = '1';
        await quizService.delete(TEST_ID);
        const quizzes = await quizService.collection.find({}).toArray();
        expect(quizzes.find((x) => x.id === TEST_ID)).to.equals(undefined);
    });
});
