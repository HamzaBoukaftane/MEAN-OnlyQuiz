import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service/admin-authenticator.service';
import { tap } from 'rxjs';
import { GAME_ADMIN_PROMPT } from '@common/page-url/page-url';

export const authGuardAuthentification = () => {
    const router = inject(Router);
    const authServices = inject(AdminAuthenticatorService);
    return authServices.validatePassword().pipe(
        tap((isValid) => {
            if (!isValid) router.navigate([`/${GAME_ADMIN_PROMPT}`]);
            return isValid;
        }),
    );
};
