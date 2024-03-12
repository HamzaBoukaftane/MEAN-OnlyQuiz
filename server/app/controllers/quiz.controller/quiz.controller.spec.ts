import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { Application } from '@app/app';
import { Container } from 'typedi';
import * as supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';

describe('QuizController', () => {
    let quizService: SinonStubbedInstance<QuizService>;
    let expressApp: Express.Application;
    const TEST_ID = '1';
    const MOCK_QUIZ = {
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

    before(() => {
        restore();
    });

    beforeEach(async () => {
        quizService = createStubInstance(QuizService);
        quizService.getAll.resolves([MOCK_QUIZ, MOCK_QUIZ, MOCK_QUIZ]);
        quizService.getAllVisible.resolves([MOCK_QUIZ, MOCK_QUIZ]);
        quizService.getById.resolves(MOCK_QUIZ);
        const APP = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(APP['quizController'], 'quizService', { value: quizService, writable: true });
        expressApp = APP.app;
    });

    it('should return quizzes from quiz service on valid get request', async () => {
        return supertest(expressApp)
            .get('/api/quiz')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal([MOCK_QUIZ, MOCK_QUIZ, MOCK_QUIZ]);
            });
    });

    it('should return visible quizzes from quiz service on valid get request', async () => {
        return supertest(expressApp)
            .get('/api/quiz/visible')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal([MOCK_QUIZ, MOCK_QUIZ]);
            });
    });

    it('should return a specific quiz by id from quiz service on valid get request', async () => {
        return supertest(expressApp)
            .get(`/api/quiz/${TEST_ID}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(MOCK_QUIZ);
            });
    });

    it('should properly handle post request of a specific quiz and call add method of quizService', async () => {
        const RES = await supertest(expressApp).post('/api/quiz').send({ quiz: MOCK_QUIZ });
        expect(RES.status).to.equal(StatusCodes.CREATED);
        expect(quizService.add.calledWith(MOCK_QUIZ)).to.equal(true);
    });

    it('should properly handle put request of a specific quiz and call replace method of quizService', async () => {
        const RES = await supertest(expressApp).put('/api/quiz').send({ quiz: MOCK_QUIZ });
        expect(RES.status).to.equal(StatusCodes.OK);
        expect(quizService.replace.calledWith(MOCK_QUIZ)).to.equal(true);
    });

    it('should properly handle patch request of a specific quiz with id and call update method of quizService', async () => {
        const updatedVisibility = false;
        const RES = await supertest(expressApp).patch(`/api/quiz/${TEST_ID}`).send({ visible: updatedVisibility });

        expect(RES.status).to.equal(StatusCodes.OK);
        expect(quizService.update.calledWith(TEST_ID, updatedVisibility)).to.equal(true);
    });

    it('should properly handle title uniqueness check request and call isTitleUnique method of quizService', async () => {
        const titleToCheck = 'New Quiz Title';
        const RES = await supertest(expressApp).post('/api/quiz/checkTitleUniqueness').send({ title: titleToCheck });

        expect(RES.status).to.equal(StatusCodes.OK);
        expect(quizService.isTitleUnique.calledWith(titleToCheck)).to.equal(true);
    });

    it('should properly handle delete request of a specific quiz by id and call delete method of quizService', async () => {
        const RES = await supertest(expressApp).delete(`/api/quiz/${TEST_ID}`);
        expect(RES.status).to.equal(StatusCodes.OK);
        expect(quizService.delete.calledWith(TEST_ID)).to.equal(true);
    });

    it('should handle the Internal Server error for all requests', async () => {
        quizService.getAll.throws(new Error('test error!'));
        quizService.getAllVisible.throws(new Error('test error!'));
        quizService.getById.throws(new Error('test error!'));
        quizService.add.throws(new Error('test error!'));
        quizService.replace.throws(new Error('test error!'));
        quizService.update.throws(new Error('test error!'));
        quizService.isTitleUnique.throws(new Error('test error!'));
        quizService.delete.throws(new Error('test error!'));

        supertest(expressApp)
            .get('/api/quiz')
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .get('/api/quiz/visible')
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .post('/api/quiz')
            .send({ quiz: MOCK_QUIZ })
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .put('/api/quiz')
            .send({ quiz: MOCK_QUIZ })
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .patch(`/api/quiz/${TEST_ID}`)
            .send({ visible: false })
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .post('/api/quiz/checkTitleUniqueness')
            .send({ title: 'New Quiz Title' })
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .delete(`/api/quiz/${TEST_ID}`)
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .get(`/api/quiz/${TEST_ID}`)
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
    });
});
