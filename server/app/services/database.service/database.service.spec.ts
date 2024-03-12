import * as chai from 'chai';
import { fillerQuizzes } from '@app/mock-data/data';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised);
import 'dotenv/config';
import { restore } from 'sinon';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    const QUIZZES_LENGTH = fillerQuizzes.length;

    before(() => {
        restore();
    });

    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = await MongoMemoryServer.create();
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    it('should connect to the database when start is called', async () => {
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.not.equal(undefined);
        expect(databaseService['db'].databaseName).to.equal('OnlyQuiz');
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        try {
            await databaseService.start('Fake URL test');
        } catch {
            expect(databaseService['client']).to.equal(undefined);
        }
    });

    it('should populate the database populateDB function', async () => {
        const mongoUri = mongoServer.getUri();
        const client = new MongoClient(mongoUri);
        await client.connect();
        databaseService['db'] = client.db('OnlyQuiz');
        await databaseService.populateDB(process.env.DATABASE_COLLECTION_QUIZZES);
        const quizzes = await databaseService.database.collection('quizzes').find({}).toArray();
        expect(quizzes.length).to.equal(QUIZZES_LENGTH);
    });

    it('should not populate the database with start function if it is already populated', async () => {
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        let quizzes = await databaseService.database.collection('quizzes').find({}).toArray();
        expect(quizzes.length).to.equal(QUIZZES_LENGTH);
        await databaseService.closeConnection();

        await databaseService.start(mongoUri);
        quizzes = await databaseService.database.collection('quizzes').find({}).toArray();
        expect(quizzes.length).to.equal(QUIZZES_LENGTH);
    });
});
