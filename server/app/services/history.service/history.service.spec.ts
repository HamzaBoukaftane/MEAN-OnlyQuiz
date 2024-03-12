import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient, ObjectId } from 'mongodb';
import { DatabaseServiceMock } from '@app/services/database.service/database.service.mock';
import { DatabaseService } from '@app/services/database.service/database.service';
import { restore } from 'sinon';
import { HistoryService } from '@app/services/history.service/history.service';
import { gameInfoMocks } from '@app/mock-data/data';
chai.use(chaiAsPromised);

interface GameInfoMock {
    _id: ObjectId;
    gameName: string;
    startTime: string;
    playersCount: number;
    bestScore: number;
}

describe('History Service', () => {
    let historyService: HistoryService;
    let databaseService: DatabaseServiceMock;
    let infoMocks: GameInfoMock[];

    const extraFakeInfo: GameInfoMock = {
        _id: new ObjectId(),
        gameName: 'Sample Quiz',
        startTime: '2023-11-13 15:30:00', // Replace with the actual start time
        playersCount: 3,
        bestScore: 20,
    };

    before(() => {
        restore();
    });

    beforeEach(async () => {
        infoMocks = gameInfoMocks as unknown[] as GameInfoMock[];
        databaseService = new DatabaseServiceMock();
        (await databaseService.start()) as MongoClient;
        historyService = new HistoryService(databaseService as unknown as DatabaseService);
        for (const gameInfo of infoMocks) {
            delete gameInfo['_id'];
            await historyService.collection.insertOne(gameInfo);
        }
    });

    const removeIds = () => {
        infoMocks.forEach((mock) => {
            delete mock['_id'];
        });
    };

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('should get all quizzes from DB', async () => {
        const allGameInfos = await historyService.getAll();
        removeIds();
        expect(allGameInfos).to.deep.equals(gameInfoMocks);
    });

    it('should add quiz', async () => {
        await historyService.add(extraFakeInfo);
        const finalArray = await historyService.collection.find({}).toArray();
        expect(finalArray.find((x) => x.gameName === extraFakeInfo.gameName)).to.deep.equals(extraFakeInfo);
    });

    it('should delete all quizzes', async () => {
        await historyService.deleteAll();
        const finalArray = await historyService.collection.find({}).toArray();
        expect(finalArray).to.deep.equal([]);
    });
});
