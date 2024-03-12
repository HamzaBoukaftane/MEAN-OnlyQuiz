export type CallbackSignature = (params: unknown) => object;

export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();

    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event)?.push(callback);
    }

    emit(event: string, ...params: unknown[]): unknown[] {
        return [event, ...params];
    }

    disconnect(): void {
        return;
    }

    connect(): void {
        return;
    }
}
