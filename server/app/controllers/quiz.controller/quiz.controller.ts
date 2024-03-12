import { QuizService } from '@app/services/quiz.service/quiz.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { SERVER_ERROR } from '@common/browser-message/http-exchange-message/http-exchange-message';

@Service()
export class QuizController {
    router: Router;

    constructor(private readonly quizService: QuizService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         * tags:
         *   name: Quiz
         *   description: Quiz management
         */

        /**
         * @swagger
         * /api/quiz:
         *   get:
         *     summary: Get all quizzes
         *     tags: [Quiz]
         *     responses:
         *       200:
         *         description : A list of quizzes
         *       500 :
         *         description : Internal server error
         */
        this.router.get('/', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getAll());
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        this.router.get('/visible', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getAllVisible());
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz/{id}:
         *   get:
         *     summary: Get a quiz by ID
         *     tags: [Quiz]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the quiz
         *     responses:
         *       200:
         *         description: The requested quiz
         *       500:
         *         description: Internal server error
         */
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getById(req.params.id));
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz:
         *   post:
         *     summary: Create a new quiz
         *     tags: [Quiz]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       201:
         *         description: The newly created quiz
         *       500:
         *         description: Internal server error
         */
        this.router.post('/', async (req: Request, res: Response) => {
            const quiz = req.body.quiz;
            try {
                await this.quizService.add(quiz);
                res.status(StatusCodes.CREATED).json(quiz);
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz:
         *   put:
         *     summary: Update a quiz
         *     tags: [Quiz]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: Quiz updated successfully
         *       500:
         *         description: Internal server error
         */
        this.router.put('/', async (req: Request, res: Response) => {
            try {
                await this.quizService.replace(req.body.quiz);
                res.status(StatusCodes.OK).json(req.body.quiz);
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        this.router.patch('/:id', async (req: Request, res: Response) => {
            try {
                await this.quizService.update(req.params.id, req.body.visible);
                res.status(StatusCodes.OK).json({ visible: (await this.quizService.getById(req.params.id)).visible });
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz/checkTitleUniqueness:
         *   post:
         *     summary: Check title uniqueness
         *     tags: [Quiz]
         *     description: Check if a title is unique for a Quiz.
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               title:
         *                 type: string
         *     responses:
         *       200:
         *         description: Success. Returns whether the title is unique.
         *         content:
         *           application/json:
         *             schema:
         *               existingQuiz: boolean
         *               properties:
         *                 isUnique:
         *                   type: boolean
         *       400:
         *         description: Bad Request. Title is not unique.
         *         content:
         *           application/json:
         *             schema:
         *               existingQuiz: boolean
         *               properties:
         *                 error:
         *                   type: string
         *       500:
         *         description: Internal Server Error.
         *         content:
         *           application/json:
         *             schema:
         *               existingQuiz: boolean
         *               properties:
         *                 error:
         *                   type: string
         */
        this.router.post('/checkTitleUniqueness', async (req, res) => {
            const { title } = req.body;
            try {
                const isUnique = await this.quizService.isTitleUnique(title);
                res.json({ isUnique });
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: SERVER_ERROR });
            }
        });

        /**
         * @swagger
         * /api/quiz/{id}:
         *   delete:
         *     summary: Delete a quiz by ID
         *     tags: [Quiz]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the quiz to delete
         *     responses:
         *       200:
         *         description: Quiz deleted successfully
         *       500:
         *         description: Internal server error
         */
        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                res.json(await this.quizService.delete(req.params.id));
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });
    }
}
