import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HTTP_STATUS_CODE_OK } from '@common/constants/admin-authenticator.service.const';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthenticatorService {
    password: string = '';
    readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    validatePassword(): Observable<boolean> {
        return this.http.post(`${this.baseUrl}/auth/admin-password`, { password: this.password }, { observe: 'response', responseType: 'text' }).pipe(
            map((res: HttpResponse<string>) => {
                return res.status === HTTP_STATUS_CODE_OK;
            }),
            catchError(() => {
                return of(false);
            }),
        );
    }
}
