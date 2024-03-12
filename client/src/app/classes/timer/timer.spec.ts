import { Timer } from './timer';

describe('Timer', () => {
    let timer: Timer;
    const INITIALTIMEVALUE = 60;
    const SETTIMEVALUE = 45;
    const SETINTERVALVALUE = 1000;
    beforeEach(() => {
        timer = new Timer(INITIALTIMEVALUE);
    });

    it('should initialize with the correct initial time', () => {
        expect(timer.initialTime).toBe(INITIALTIMEVALUE);
    });

    it('should initialize with the correct current time', () => {
        expect(timer.time).toBe(INITIALTIMEVALUE);
    });

    it('should set the time correctly', () => {
        timer.setTime(SETTIMEVALUE);
        expect(timer.time).toBe(SETTIMEVALUE);
    });

    it('should set the interval value correctly', () => {
        timer.setIntervalValue(SETINTERVALVALUE);
        expect(timer.intervalValue).toBe(SETINTERVALVALUE);
    });
});
