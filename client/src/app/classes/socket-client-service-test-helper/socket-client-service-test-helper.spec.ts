import { SocketClientServiceTestHelper } from './socket-client-service-test-helper';

describe('SocketClientServiceTestHelper', () => {
    let helper: SocketClientServiceTestHelper;

    beforeEach(() => {
        helper = new SocketClientServiceTestHelper();
    });

    it('should return void from isSocketAlive()', () => {
        expect(helper.isSocketAlive()).toBe();
    });

    it('should return void from connect()', () => {
        expect(helper.connect()).toBe();
    });

    it('should return void from disconnect()', () => {
        expect(helper.disconnect()).toBe();
    });

    it('should return the event and action from on()', () => {
        const event = 'event';
        const action = jasmine.createSpy();
        const onResult = helper.on(event, action);
        expect(onResult).toEqual({ event, action });
    });

    it('should return the event, data, and callback from send()', () => {
        const event = 'event';
        const data = {};
        const callback = jasmine.createSpy();
        const sendResult = helper.send(event, data, callback);
        expect(sendResult).toEqual({ event, data, callback });
    });
});
