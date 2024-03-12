import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import { HistoryService } from '@app/services/history.service/history.service';
import { gameInfoMocks } from '@app/mock-data/data';
import { Application } from '@app/app';
import { Container } from 'typedi';
import * as supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';

describe('QuizController', () => {
    let historyService: SinonStubbedInstance<HistoryService>;
    let expressApp: Express.Application;

    before(() => {
        restore();
    });

    beforeEach(async () => {
        historyService = createStubInstance(HistoryService);
        historyService.getAll.resolves(gameInfoMocks);
        const APP = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(APP['historyController'], 'historyService', { value: historyService, writable: true });
        expressApp = APP.app;
    });

    it('should return full game History from history service on valid get request', async () => {
        return supertest(expressApp)
            .get('/api/history')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(gameInfoMocks);
            });
    });

    it('should return full game History from history service on valid get request', async () => {
        const RES = await supertest(expressApp).delete('/api/history');
        expect(RES.status).to.equal(StatusCodes.OK);
        expect(historyService.deleteAll.called).to.equal(true);
    });

    it('should handle the Internal Server error for all requests', async () => {
        historyService.getAll.throws(new Error('test error!'));
        historyService.deleteAll.throws(new Error('test error!'));

        supertest(expressApp)
            .get('/api/history')
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
        supertest(expressApp)
            .delete('/api/history')
            .then((res) => expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR));
    });
});
