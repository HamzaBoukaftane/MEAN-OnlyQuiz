import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service/admin-authenticator.service';
import { of } from 'rxjs';
import { authGuardAuthentification } from './auth.guard';

describe('authGuardAuthentification', () => {
    const mockRouter = jasmine.createSpyObj<Router>(['navigate']);
    const setup = (mockAuthenticatorService: unknown) => {
        TestBed.configureTestingModule({
            providers: [
                authGuardAuthentification,
                { provide: AdminAuthenticatorService, useValue: mockAuthenticatorService },
                { provide: Router, useValue: mockRouter },
            ],
        });
        return TestBed.runInInjectionContext(authGuardAuthentification);
    };

    it('should allow to continue if authentication is valid', () => {
        const mockAuthenticatorService: unknown = {
            validatePassword: () => of(true),
        };
        const guard = setup(mockAuthenticatorService);
        guard.subscribe((isValid: unknown) => {
            expect(isValid).toBe(true);
        });
    });

    it('should navigate to /game-admin-prompt if authentication is invalid', () => {
        const mockAuthenticatorService: unknown = {
            validatePassword: () => of(false),
        };
        const guard = setup(mockAuthenticatorService);
        guard.subscribe((isValid: unknown) => {
            expect(isValid).toBe(false);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/game-admin-prompt']);
        });
    });
});
