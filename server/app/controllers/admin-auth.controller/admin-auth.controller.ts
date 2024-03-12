import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { AdminAuthService } from '@app/services/admin-auth.service/admin-auth.service';
import { AUTH_FAILED, AUTH_SUCCES, SERVER_ERROR } from '@common/browser-message/http-exchange-message/http-exchange-message';

@Service()
export class AdminAuthController {
    router: Router;

    constructor(private readonly adminAuthService: AdminAuthService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/', (req: Request, res: Response) => {
            try {
                const result: boolean = this.adminAuthService.authentificatePassword(req.body.password);
                if (result) {
                    res.status(StatusCodes.OK).json({ message: AUTH_SUCCES });
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json({ message: AUTH_FAILED });
                }
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
            }
        });
    }
}
