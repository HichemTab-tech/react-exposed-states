import React, {type Dispatch, type SetStateAction, useEffect} from "react";

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
if (typeof window !== 'undefined') {
    window.exposed = exposedStates;
}
else{
    console.warn('window is undefined');
}

const expose = <T>(useStateReturn: [T, Dispatch<SetStateAction<T>>], uniqueName?: string): [T, Dispatch<SetStateAction<T>>] => {
    const [state, setState] = useStateReturn;

    const id = React.useId();
    console.log("id", id);

    const key = uniqueName || id;

    useEffect(() => {
        if (exposedStates.get(key)) {
            exposedStates.get(key)!.state = state;
            listeners.get(key)?.forEach(l => l(state));
        }
    }, [state]);

    useEffect(() => {
        exposedStates.set(key, {
            state,
            setState,
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
        setState
    ]
}

export default expose;