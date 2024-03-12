export const ID_LENGTH = 16;
export const generateRandomId = (): string => {
    let result = '';
    const characters = 'AYqLRwfYkcVyDG3iUWKNsrQhD6GzV5JEQFmWnJv0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < ID_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
};
