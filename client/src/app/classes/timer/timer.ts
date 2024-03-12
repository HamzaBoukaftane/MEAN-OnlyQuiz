export class Timer {
    private interval: number | undefined;
    private counter = 0;
    private startValue = 0;

    constructor(startValue: number) {
        this.counter = startValue;
        this.startValue = startValue;
    }

    get initialTime() {
        return this.startValue;
    }

    get time() {
        return this.counter;
    }
    get intervalValue() {
        return this.interval;
    }

    setTime(newTime: number) {
        this.counter = newTime;
    }

    setIntervalValue(interval: number | undefined) {
        this.interval = interval;
    }
}
