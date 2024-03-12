import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Quiz } from '@common/interfaces/quiz.interface';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGetAll(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}/quiz`).pipe(catchError(this.handleError<Quiz[]>('basicGetAll')));
    }

    basicGetAllVisible(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}/quiz/visible`).pipe(catchError(this.handleError<Quiz[]>('basicGetAllVisible')));
    }

    basicGetById(id: string): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.baseUrl}/quiz/${id}`).pipe(catchError(this.handleError<Quiz>('basicGetById')));
    }

    basicPost(quiz: Quiz): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/quiz/`, { quiz }, { observe: 'response', responseType: 'text' });
    }

    basicPut(quiz: Quiz): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/quiz/`, { quiz }, { observe: 'response', responseType: 'text' });
    }

    basicPatch(quizId: string, quizVisibility: boolean): Observable<HttpResponse<string>> {
        return this.http.patch(`${this.baseUrl}/quiz/${quizId}`, { visible: quizVisibility }, { observe: 'response', responseType: 'text' });
    }

    basicDelete(id: string) {
        return this.http.delete(`${this.baseUrl}/quiz/${id}`);
    }

    checkTitleUniqueness(title: string): Observable<HttpResponse<{ isUnique: boolean }>> {
        return this.http.post<{ isUnique: boolean }>(
            `${this.baseUrl}/quiz/checkTitleUniqueness`,
            { title },
            { observe: 'response', responseType: 'json' },
        );
    }

    private handleError<T>(_: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
