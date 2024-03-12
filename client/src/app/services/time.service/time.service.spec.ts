import { TimeService } from './time.service';
import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';

describe('TimeService', () => {
    let component: TimeService;
    let stopTimerSpy: jasmine.Spy;
    const DEFAULT_TIMER_VALUE = 10;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        component = TestBed.inject(TimeService);
        component.deleteAllTimers();
    });

    it('should create a timer', () => {
        const TIMER = component.createTimer(DEFAULT_TIMER_VALUE);
        expect(TIMER).toBeDefined();
        expect(component.timersArray).toContain(TIMER);
    });

    it('should delete a timer by index', () => {
        const TIMER1 = component.createTimer(DEFAULT_TIMER_VALUE);
        const TEMP_TIMER_VALUE = 20;
        const TIMER2 = component.createTimer(TEMP_TIMER_VALUE);

        component.deleteTimerByIndex(0);

        expect(component.timersArray).not.toContain(TIMER1);
        expect(component.timersArray).toContain(TIMER2);
    });

    it('should delete all timers', () => {
        const TIMER1 = component.createTimer(DEFAULT_TIMER_VALUE);
        const TEMP_TIMER_VALUE = 20;
        const TIMER2 = component.createTimer(TEMP_TIMER_VALUE);
        stopTimerSpy = spyOn(component, 'stopTimer');

        component.deleteAllTimers();

        expect(stopTimerSpy).toHaveBeenCalledWith(0);
        expect(stopTimerSpy).toHaveBeenCalledWith(1);
        expect(component.timersArray).not.toContain(TIMER1);
        expect(component.timersArray).not.toContain(TIMER2);
    });

    it('should get a timer by index', () => {
        const TIMER1 = component.createTimer(DEFAULT_TIMER_VALUE);

        component.getTime(0);

        expect(component.getTimer(0)).toBe(TIMER1);
    });

    it('should get the initial value of a timer by index', () => {
        component.createTimer(DEFAULT_TIMER_VALUE);

        component.getInitialValue(0);

        expect(component.getInitialValue(0)).toBe(DEFAULT_TIMER_VALUE);
    });

    it('should set the time of a timer by index', () => {
        const TEMP_TIMER_VALUE = 20;
        component.createTimer(TEMP_TIMER_VALUE);

        component.setTime(0, DEFAULT_TIMER_VALUE);

        expect(component.getTime(0)).toBe(DEFAULT_TIMER_VALUE);
    });

    it('should not setIntervalValue if intervalValue is already defined', () => {
        const TEMP_INTERVAL_VALUE = 123;
        component.createTimer(DEFAULT_TIMER_VALUE).setIntervalValue(TEMP_INTERVAL_VALUE);
        component.startTimer(0);

        expect(component.getTimer(0).intervalValue).toBeDefined();
    });

    it('should setIntervalValue if intervalValue is undefined', () => {
        component.createTimer(DEFAULT_TIMER_VALUE).setIntervalValue(undefined);
        component.startTimer(0);

        expect(component.getTimer(0).intervalValue).toBeDefined();
    });

    it('should decrement the timer correctly', fakeAsync(() => {
        const TICK_VALUE = 1000;
        stopTimerSpy = spyOn(component, 'stopTimer');
        component.createTimer(DEFAULT_TIMER_VALUE);

        component.startTimer(0);
        tick(TICK_VALUE);
        expect(component.getTime(0)).toBe(DEFAULT_TIMER_VALUE - 1);
        tick(TICK_VALUE);
        expect(component.getTime(0)).toBe(DEFAULT_TIMER_VALUE - 2);
        discardPeriodicTasks();

        component.setTime(0, 0);
        tick(TICK_VALUE);
        expect(stopTimerSpy).toHaveBeenCalledWith(0);
        discardPeriodicTasks();
    }));

    it('should stop the timer and set intervalValue to undefined', () => {
        const TIMER = component.createTimer(DEFAULT_TIMER_VALUE);
        component.startTimer(0);
        const SPY_SET_INTERVAL_VALUE = spyOn(TIMER, 'setIntervalValue');
        spyOn(window, 'clearInterval');

        component.stopTimer(0);

        expect(window.clearInterval).toHaveBeenCalledWith(component.getTimer(0).intervalValue);
        expect(SPY_SET_INTERVAL_VALUE).toHaveBeenCalledWith(undefined);
    });
});
