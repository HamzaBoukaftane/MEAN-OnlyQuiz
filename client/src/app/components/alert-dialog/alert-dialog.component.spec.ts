import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertDialogComponent } from '@app/components/alert-dialog/alert-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('AlertDialogComponent', () => {
    let component: AlertDialogComponent;
    let fixture: ComponentFixture<AlertDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AlertDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { title: 'Test Title', content: 'Test Content' } },
                { provide: MatDialogRef, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(AlertDialogComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
