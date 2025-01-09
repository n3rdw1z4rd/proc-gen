export type Listener = (...args: any[]) => void;

export class Emitter {
    private listeners: Map<string, Listener[]> = new Map<string, Listener[]>();

    public on(eventName: string, listener: Listener) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Array<Listener>());
        }

        this.listeners.get(eventName)?.push(listener);
    }

    public emit(eventName: string, ...args: any[]) {
        this.listeners.get(eventName)?.forEach((listener: Listener) => listener(...args, eventName));
    }
}