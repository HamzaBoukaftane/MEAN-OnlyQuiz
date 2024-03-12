import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { of } from 'rxjs';
import { LeaveButtonComponent } from './leave-boutton.component';

describe('QuitterButtonComponent', () => {
    let component: LeaveButtonComponent;
    let fixture: ComponentFixture<LeaveButtonComponent>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(() => {
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [LeaveButtonComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: Router, useValue: mockRouter },
            ],
        });

        fixture = TestBed.createComponent(LeaveButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open confirmation dialog and navigate on confirmation', () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        component.openConfirmationDialog();
        expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            width: '300px',
            data: { message: 'Etes-vous sur de vouloir quitter?' },
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['./home']);
    });

    it('should set isGame correctly', () => {
        component.isGame = false;
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        component.openConfirmationDialog();
        expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            width: '300px',
            data: { message: 'Etes-vous sur de vouloir supprimer?' },
        });
    });
});
