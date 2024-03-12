import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LeaveButtonComponent } from '@app/components/leave-boutton/leave-boutton.component';
import { WaitingRoomComponent } from '@app/components/waiting-room/waiting-room.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { WaitingRoomHostPageComponent } from './waiting-room-host-page.component';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, FormsModule, RouterTestingModule, AppMaterialModule],
            declarations: [WaitingRoomHostPageComponent, LeaveButtonComponent, WaitingRoomComponent],
            providers: [MatDialog, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }],
        });
        fixture = TestBed.createComponent(WaitingRoomHostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
