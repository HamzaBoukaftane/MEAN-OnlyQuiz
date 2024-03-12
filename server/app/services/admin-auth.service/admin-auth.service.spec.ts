import { expect } from 'chai';
import { restore } from 'sinon';
import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
    let adminAuthService: AdminAuthService;

    before(() => {
        restore();
    });

    beforeEach(() => {
        adminAuthService = new AdminAuthService();
    });

    it('should authenticate the correct admin password', () => {
        const submittedPassword = process.env.PASSWORD;
        const isAuthenticated = adminAuthService.authentificatePassword(submittedPassword);
        expect(isAuthenticated).to.equal(true);
    });

    it('should not authenticate an incorrect admin password', () => {
        const submittedPassword = 'incorrectPassword';
        const isAuthenticated = adminAuthService.authentificatePassword(submittedPassword);
        expect(isAuthenticated).to.equal(false);
    });
});
