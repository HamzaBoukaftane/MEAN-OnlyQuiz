import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GameInfo } from '@common/interfaces/game-info.interface';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService {
    readonly baseUrl = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<GameInfo[]> {
        return this.http.get<GameInfo[]>(`${this.baseUrl}/history`).pipe(catchError(this.handleError<GameInfo[]>('getAll')));
    }

    deleteAll() {
        return this.http.delete(`${this.baseUrl}/history`);
    }

    private handleError<T>(_: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
