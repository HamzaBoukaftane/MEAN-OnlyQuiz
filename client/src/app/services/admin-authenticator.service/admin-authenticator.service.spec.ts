import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminAuthenticatorService } from './admin-authenticator.service';
import { HttpStatusCode } from '@angular/common/http';

describe('AdminAuthenticatorService', () => {
    let service: AdminAuthenticatorService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AdminAuthenticatorService],
        });
        service = TestBed.inject(AdminAuthenticatorService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should POST correctly', () => {
        service.password = 'test';
        service.validatePassword().subscribe();
        const req = httpMock.expectOne(`${service.baseUrl}/auth/admin-password`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ password: 'test' });
    });

    it('should validate the password', () => {
        const testPasswordValidation = (mockPassword: string, status: number, expectedResult: boolean) => {
            service.password = mockPassword;

            let result: boolean | undefined;
            service.validatePassword().subscribe((response) => {
                result = response;
            });

            const req = httpMock.expectOne(`${service.baseUrl}/auth/admin-password`);
            expect(req.request.method).toBe('POST');

            req.flush('', { status, statusText: 'OK' });

            expect(result).toBe(expectedResult);
        };

        testPasswordValidation('successTest', HttpStatusCode.Ok, true);
        testPasswordValidation('errorTest', HttpStatusCode.Unauthorized, false);
    });
});
