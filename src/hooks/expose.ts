import {type Dispatch, type SetStateAction, useEffect, useId} from "react";

const listeners = new Map<string, Set<Function>>();

type ExposedState = {
    state: any;
    setState: any;
    subscribe: (callback: Function) => (() => void);
    unsubscribe: (callback: Function) => void;
}

const exposedStates = new Map<string, ExposedState>();

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface Window {
        exposed: typeof exposedStates
    }
}
window.exposed = exposedStates;

const expose = <T>(useStateReturn: [T, Dispatch<SetStateAction<T>>], uniqueName?: string): [T, Dispatch<SetStateAction<T>>] => {
    const [state, setState] = useStateReturn;

    const id = useId();

    const key = uniqueName || id;

    useEffect(() => {
        exposedStates.set(key, {
            state,
            setState: ((v) => {
                setState(v);
                exposedStates.get(key)!.state = v;
                listeners.get(key)?.forEach(l => l(v));
            }) as typeof setState,
            subscribe: (callback: Function) => {

                if (!listeners.has(key)) {
                    listeners.set(key, new Set());
                }

                listeners.get(key)!.add(callback);
                return () => {
                    exposedStates.get(key)?.unsubscribe(callback);
                }
            },
            unsubscribe: (callback: Function) => {
                listeners.get(key)?.delete(callback);
            }
        });

        return () => {
            exposedStates.delete(key);
            listeners.delete(key);
        }
    }, []);

    return [
        state,
        ((v) => {
            setState(v);
            exposedStates.get(key)!.state = v;
            listeners.get(key)?.forEach(l => l(v));
        }) as typeof setState
    ]
}

export default expose;