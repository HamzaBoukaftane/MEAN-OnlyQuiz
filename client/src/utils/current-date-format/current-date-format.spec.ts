import { getCurrentDateService, padZero } from './current-date-format';

describe('DateService', () => {
    it('should return the valid date string format AAAA-MM-DD hh:mm:ss', () => {
        const expectedDateFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        expect(getCurrentDateService()).toMatch(expectedDateFormat);
    });
});

describe('padZero', () => {
    it('should pad a single-digit number with zero', () => {
        const singleDigitNumber = 5;
        expect(padZero(singleDigitNumber)).toBe('05');
    });

    it('should not pad a double-digit number', () => {
        const doubleDigitNumber = 12;
        expect(padZero(doubleDigitNumber)).toBe('12');
    });
});
