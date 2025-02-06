export type Listener = (...args: any[]) => void;

export class Emitter {
    private listeners: Map<string, Listener[]> = new Map<string, Listener[]>();

    private static _instance: Emitter;
    private constructor() { }

    public static get instance(): Emitter {
        if (!Emitter._instance) {
            Emitter._instance = new Emitter();
        }

        return Emitter._instance;
    }

    public on(eventName: string, listener: Listener): this {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Array<Listener>());
        }

        this.listeners.get(eventName)?.push(listener);

        return this;
    }

    public emit(eventName: string, ...args: any[]): this {
        this.listeners.get(eventName)?.forEach((listener: Listener) => listener(...args, eventName));

        return this;
    }
}
