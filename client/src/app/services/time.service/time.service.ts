import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer/timer';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private timers: Timer[] = [];
    private readonly tick = 1000;

    get timersArray() {
        return this.timers;
    }

    createTimer(startValue: number): Timer {
        const timer = new Timer(startValue);
        this.timers.push(timer);
        return timer;
    }

    deleteTimerByIndex(index: number) {
        this.timers.splice(index, 1);
    }

    deleteAllTimers() {
        for (let i = 0; i < this.timers.length; i++) {
            this.stopTimer(i);
        }
        this.timers = [];
    }

    getTimer(index: number) {
        return this.timers[index];
    }

    getInitialValue(index: number) {
        return this.timers[index].initialTime;
    }

    getTime(index: number) {
        return this.timers[index].time;
    }

    setTime(index: number, newTime: number) {
        this.timers[index].setTime(newTime);
    }

    startTimer(index: number) {
        this.setTime(index, this.getInitialValue(index));
        if (this.timers[index].intervalValue) return;
        this.timers[index].setIntervalValue(
            window.setInterval(() => {
                if (this.getTime(index) > 0) {
                    this.setTime(index, this.getTime(index) - 1);
                } else {
                    this.stopTimer(index);
                }
            }, this.tick),
        );
    }

    stopTimer(index: number) {
        clearInterval(this.timers[index].intervalValue);
        this.timers[index].setIntervalValue(undefined);
    }
}
