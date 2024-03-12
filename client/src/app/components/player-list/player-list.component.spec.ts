import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SortType } from '@common/constants/player-list.component.const';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';
import { PlayerStatus } from '@common/player-status/player-status';
import { PlayerListComponent } from './player-list.component';
import { MatDialog } from '@angular/material/dialog';
import { AppMaterialModule } from '@app/modules/material.module';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let interactiveListService: InteractiveListSocketService;
    let getPlayersListSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [
                MatDialog,
                InteractiveListSocketService,
                SortListService,
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
            ],
            imports: [AppMaterialModule],
        });
        TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        TestBed.inject(SortListService);
        interactiveListService = TestBed.inject(InteractiveListSocketService);
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        interactiveListService.players = [
            ['karim', 0, 0, PlayerStatus.LEFT, true],
            ['player1', 0, 0, PlayerStatus.INTERACTION, true],
        ];
        component['order'] = 1;
        component.orderIcon = 'fa-solid fa-up-long';
        getPlayersListSpy = spyOn(interactiveListService, 'getPlayersList');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change order correctly', () => {
        const expectedValue = -1;
        component.changeOrder();
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
        expect(component['order']).toEqual(expectedValue);
        expect(component.orderIcon).toEqual('fa-solid fa-down-long');
        getPlayersListSpy.calls.reset();
        component.changeOrder();
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
        expect(component['order']).toEqual(1);
        expect(component.orderIcon).toEqual('fa-solid fa-up-long');
    });

    it('should sort by status', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sort(SortType.SORT_BY_STATUS);
        expect(updateOptionSelections).toHaveBeenCalledWith(SortType.SORT_BY_STATUS);
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
    });

    it('should sort by score', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sort(SortType.SORT_BY_SCORE);
        expect(updateOptionSelections).toHaveBeenCalledWith(SortType.SORT_BY_SCORE);
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
    });

    it('should sort by name', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sort(SortType.SORT_BY_NAME);
        expect(updateOptionSelections).toHaveBeenCalledWith(SortType.SORT_BY_NAME);
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
    });

    it('should toggle Chat Permission', () => {
        const toggleSpy = spyOn(interactiveListService, 'toggleChatPermission');
        component.roomId = 1;
        interactiveListService.players = [['karim', 0, 0, PlayerStatus.LEFT, true]];
        component.toggleChatPermission('karim');
        expect(toggleSpy).toHaveBeenCalledWith('karim', 1);
    });

    it('should correctly modify optionSelections', () => {
        const expectedResult = new Map([
            [SortType.SORT_BY_NAME, false],
            [SortType.SORT_BY_SCORE, true],
            [SortType.SORT_BY_STATUS, false],
        ]);
        component.optionSelections = new Map([
            [SortType.SORT_BY_NAME, true],
            [SortType.SORT_BY_SCORE, false],
            [SortType.SORT_BY_STATUS, false],
        ]);
        component['updateOptionSelections'](SortType.SORT_BY_SCORE);
        expect(component.optionSelections).toEqual(expectedResult);
    });
});
