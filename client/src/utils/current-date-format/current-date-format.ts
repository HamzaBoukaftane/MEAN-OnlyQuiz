const DATE_ZERO_BUFFER = 2;

export const getCurrentDateService = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = padZero(currentDate.getMonth() + 1);
    const day = padZero(currentDate.getDate());
    const hours = padZero(currentDate.getHours());
    const minutes = padZero(currentDate.getMinutes());
    const seconds = padZero(currentDate.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const padZero = (num: number) => {
    return num.toString().padStart(DATE_ZERO_BUFFER, '0');
};
