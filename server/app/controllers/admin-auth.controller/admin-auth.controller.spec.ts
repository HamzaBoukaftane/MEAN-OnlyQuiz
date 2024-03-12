import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import { AdminAuthService } from '@app/services/admin-auth.service/admin-auth.service';
import { Application } from '@app/app';
import { Container } from 'typedi';
import * as supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';

describe('AdminAuthController', () => {
    let adminAuthService: SinonStubbedInstance<AdminAuthService>;
    let expressApp: Express.Application;

    before(() => {
        restore();
    });

    beforeEach(async () => {
        adminAuthService = createStubInstance(AdminAuthService);
        const app = Container.get(Application);
        Object.defineProperty(app['adminAuthController'], 'adminAuthService', { value: adminAuthService, writable: true });
        expressApp = app.app;
    });

    it('should handle post request with successful authentication with OK code', async () => {
        const message = { title: 'Hello', body: 'World' };
        adminAuthService.authentificatePassword.returns(true);
        return supertest(expressApp).post('/api/auth/admin-password').send(message).expect(StatusCodes.OK);
    });

    it('should handle post request with failed authentication by returning UNAUTHORIZED code', async () => {
        const message = { title: 'Hello', body: 'World' };
        adminAuthService.authentificatePassword.returns(false);
        return supertest(expressApp).post('/api/auth/admin-password').send(message).expect(StatusCodes.UNAUTHORIZED);
    });

    it('should handle post request with error', async () => {
        const message = { title: 'Hello', body: 'World' };
        adminAuthService.authentificatePassword.throws(new Error('test error!'));
        return supertest(expressApp).post('/api/auth/admin-password').send(message).expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});
