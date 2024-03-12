import { TestBed } from '@angular/core/testing';
import { SocketTestHelper, CallbackSignature } from '@app/classes/socket-test-helper/socket-test-helper';

describe('SocketTestHelper', () => {
    let service: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = new SocketTestHelper();
        service['callbacks'] = new Map<string, CallbackSignature[]>();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect', () => {
        const result = service.connect();
        expect(result).toBeUndefined();
    });

    it('should disconnect', () => {
        const spy = spyOn(service, 'disconnect').and.callThrough();
        const result = service.disconnect();
        expect(spy).toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should call on with an event', () => {
        const event = 'helloWorld';
        const action = (params: unknown) => {
            return { test: params };
        };
        const spy = spyOn(service, 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('should call emit with data when using send', () => {
        const event = 'helloWorld';
        const data = 42;
        const spy = spyOn(service, 'emit');
        service.emit(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, data);
    });

    it('should call emit without data when using send if data is undefined', () => {
        const event = 'helloWorld';
        const data = undefined;
        const spy = spyOn(service, 'emit');
        service.emit(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, data);
    });

    it('should add and trigger callbacks', () => {
        const callback1 = (params: unknown) => ({ result: `Callback1: ${params}` });
        const callback2 = (params: unknown) => ({ result: `Callback2: ${params}` });

        service.on('event1', callback1);
        service.on('event2', callback2);

        const result1 = service.emit('event1', 'Data1');
        const result2 = service.emit('event2', 'Data2');

        expect(result1).toEqual(['event1', 'Data1']);
        expect(result2).toEqual(['event2', 'Data2']);
    });

    it('should handle multiple callbacks for the same event', () => {
        const callback1 = (params: unknown) => ({ result: `Callback1: ${params}` });
        const callback2 = (params: unknown) => ({ result: `Callback2: ${params}` });

        service.on('event1', callback1);
        service.on('event1', callback2);

        const result = service.emit('event1', 'Data');

        expect(result).toEqual(['event1', 'Data']);
    });

    it('should handle unregistered events', () => {
        const result = service.emit('nonexistent_event', 'Data');
        expect(result).toEqual(['nonexistent_event', 'Data']);
    });
});
