import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizService } from './quiz.service';
import { Quiz } from '@common/interfaces/quiz.interface';

describe('QuizService', () => {
    let service: QuizService;
    let httpMock: HttpTestingController;
    const mockQuizzes: Quiz[] = [
        {
            id: '1',
            title: 'Quiz 1',
            description: 'Description for Quiz 1',
            duration: 60,
            lastModification: '2023-09-19',
            questions: [],
            visible: true,
        },
        {
            id: '2',
            title: 'Quiz 2',
            description: 'Description for Quiz 2',
            duration: 45,
            lastModification: '2023-09-20',
            questions: [],
            visible: false,
        },
    ];

    const putAndPatchResponse = { status: 200, statusText: 'Quiz updated successfully' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuizService],
        });

        service = TestBed.inject(QuizService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    const expectRequestTypeAndFlush = <T>(url: string, method: string, response: T extends object ? T : never) => {
        const req = httpMock.expectOne(`${service.baseUrl}${url}`);
        expect(req.request.method).toBe(method);
        req.flush(response);
    };

    it('should retrieve all quizzes or visible quizzes', () => {
        service.basicGetAll().subscribe((quizzes) => {
            expect(quizzes).toEqual(mockQuizzes);
        });
        expectRequestTypeAndFlush('/quiz', 'GET', mockQuizzes);
    });

    it('should retrieve all visible quizzes', () => {
        service.basicGetAllVisible().subscribe((quizzes) => {
            expect(quizzes).toEqual(mockQuizzes);
        });
        expectRequestTypeAndFlush('/quiz/visible', 'GET', mockQuizzes);
    });

    it('should retrieve quiz by id', () => {
        const testId = '1';
        service.basicGetById(testId).subscribe((quizz) => {
            expect(quizz).toEqual(mockQuizzes[0]);
        });
        expectRequestTypeAndFlush(`/quiz/${testId}`, 'GET', mockQuizzes[0]);
    });

    it('should post a quiz', () => {
        service.basicPost(mockQuizzes[0]).subscribe();
        expectRequestTypeAndFlush('/quiz/', 'POST', mockQuizzes[0]);
    });

    it('should update a quiz', () => {
        service.basicPut(mockQuizzes[0]).subscribe();
        expectRequestTypeAndFlush('/quiz/', 'PUT', putAndPatchResponse);
    });

    it('should patch a quiz', () => {
        const quizId = '1';
        const visibility = true;
        service.basicPatch(quizId, visibility).subscribe();
        expectRequestTypeAndFlush(`/quiz/${quizId}`, 'PATCH', putAndPatchResponse);
    });

    it('should check title uniqueness', () => {
        service.checkTitleUniqueness(mockQuizzes[0].title).subscribe();
        expectRequestTypeAndFlush('/quiz/checkTitleUniqueness', 'POST', putAndPatchResponse);
    });

    it('should delete quiz', () => {
        const quizId = '1';
        service.basicDelete(quizId).subscribe();
        expectRequestTypeAndFlush(`/quiz/${quizId}`, 'DELETE', putAndPatchResponse);
    });
});
