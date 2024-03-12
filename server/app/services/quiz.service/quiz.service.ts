import { Quiz } from '@common/interfaces/quiz.interface';
import { DatabaseService } from '@app/services/database.service/database.service';
import * as process from 'process';
import { Service } from 'typedi';

@Service()
export class QuizService {
    constructor(private readonly dbService: DatabaseService) {}

    get collection() {
        return this.dbService.database.collection(process.env.DATABASE_COLLECTION_QUIZZES);
    }

    async getAll() {
        return (await this.collection.find({}, { projection: { _id: 0 } }).toArray()) as unknown[] as Quiz[];
    }

    async getAllVisible() {
        return (await this.collection.find({ visible: true }, { projection: { _id: 0 } }).toArray()) as unknown[] as Quiz[];
    }

    async getById(id: string) {
        const quiz = await this.collection.findOne({ id }, { projection: { _id: 0 } });
        return quiz as unknown as Quiz;
    }

    async add(quiz: Quiz) {
        await this.collection.insertOne(quiz);
    }

    async update(quizId: string, quizVisibility: boolean) {
        await this.collection.updateOne({ id: quizId }, { $set: { visible: quizVisibility } }, { upsert: true });
    }

    async isTitleUnique(title: string): Promise<boolean> {
        const quiz = await this.collection.findOne({ title });
        return quiz === null;
    }

    async replace(quiz: Quiz) {
        await this.collection.replaceOne({ id: quiz.id }, quiz, { upsert: true });
    }

    async delete(id: string) {
        await this.collection.deleteOne({ id });
    }
}
