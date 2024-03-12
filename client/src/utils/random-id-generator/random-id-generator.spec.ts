import { generateRandomId, ID_LENGTH } from './random-id-generator';

describe('generateRandomId', () => {
    it('should generate a random id sequence of the specified length', () => {
        const id = generateRandomId();
        expect(id.length).toBe(ID_LENGTH);
    });

    it('should generate an id consisting of alphanumerical characters', () => {
        const characters = 'AYqLRwfYkcVyDG3iUWKNsrQhD6GzV5JEQFmWnJv0123456789';
        const id = generateRandomId();
        for (let i = 0; i < id.length; i++) {
            expect(characters.includes(id.charAt(i))).toBe(true);
        }
    });

    it('should generate different ids on multiple calls', () => {
        const maxRange = 2000;
        const firstId = generateRandomId();
        for (let i = 0; i < maxRange; i++) {
            const secondId = generateRandomId();
            expect(firstId).not.toBe(secondId);
        }
    });
});
