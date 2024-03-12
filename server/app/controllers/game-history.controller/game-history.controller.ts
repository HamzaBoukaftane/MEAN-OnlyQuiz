import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { HistoryService } from '@app/services/history.service/history.service';

@Service()
export class GameHistoryController {
    router: Router;

    constructor(private readonly historyService: HistoryService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.historyService.getAll());
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        this.router.delete('/', async (req: Request, res: Response) => {
            try {
                res.json(await this.historyService.deleteAll());
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });
    }
}
