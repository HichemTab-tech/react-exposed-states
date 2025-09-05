import {describe, it, expect, beforeEach, vi} from 'vitest'
import React, {useState} from 'react'
import {render, screen, fireEvent, act, cleanup} from '@testing-library/react'
import {expose} from "../src";

beforeEach(() => {
    cleanup()
    if (window.exposed) window.exposed.clear();
})

function TestComponent({name}: { name?: string }) {
    const [count, setCount] = expose(useState(0), name)
    return (
        <div>
            <span data-testid="value">{count}</span>
            <button onClick={() => setCount((c: number) => c + 1)}>inc</button>
        </div>
    )
}

describe('expose()', () => {
    it('exposes state using a custom key', () => {
        render(<TestComponent name="counterA"/>)
        const entry = window.exposed.get('counterA');
        expect(entry).toBeTruthy()
        expect(entry!.state).toBe(0)
        expect(typeof entry!.setState).toBe('function')
        expect(typeof entry!.subscribe).toBe('function')
        expect(typeof entry!.unsubscribe).toBe('function')
    })

    it('updates exposed state when calling returned setter', () => {
        render(<TestComponent name="counterB"/>)
        const value = screen.getByTestId('value')
        expect(value.textContent).toBe('0')

        fireEvent.click(screen.getByText('inc'))
        expect(value.textContent).toBe('1')

        const entry = window.exposed.get('counterB')
        expect(entry?.state).toBe(1)
    })

    it('notifies subscribers on state changes and can unsubscribe', () => {
        render(<TestComponent name="counterC"/>)
        const entry = window.exposed.get('counterC');
        expect(entry).toBeTruthy();

        const cb = vi.fn()
        const unsubscribe = entry!.subscribe(cb)

        // trigger an update via the component
        fireEvent.click(screen.getByText('inc'))
        expect(cb).toHaveBeenCalledWith(1)

        // unsubscribe and trigger again
        unsubscribe()
        fireEvent.click(screen.getByText('inc'))
        // still 2 in DOM, but subscriber should not be called again
        expect(screen.getByTestId('value').textContent).toBe('2')
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('notifies multiple subscribers', () => {
        render(<TestComponent name="counterD"/>)
        const entry = window.exposed.get('counterD');
        expect(entry).toBeTruthy();

        const a = vi.fn();
        const b = vi.fn();
        const ua = entry!.subscribe(a);
        const ub = entry!.subscribe(b);

        fireEvent.click(screen.getByText('inc'))
        expect(a).toHaveBeenCalledWith(1)
        expect(b).toHaveBeenCalledWith(1)

        ua()
        ub()
    })

    it('updates React state when calling window.exposed.setState directly', async () => {
        render(<TestComponent name="counterE"/>)
        const entry = window.exposed.get('counterE')!;
        expect(entry).toBeTruthy();
        const value = screen.getByTestId('value')
        expect(value.textContent).toBe('0')

        await act(async () => {
            entry.setState(5)
        })
        expect(value.textContent).toBe('5')
        expect(entry.state).toBe(5)

        // functional update also works and notifies
        const spy = vi.fn()
        const off = entry.subscribe(spy)
        await act(async () => {
            entry.setState((v: number) => v + 2)
        })
        expect(value.textContent).toBe('7')
        expect(entry.state).toBe(7)
        expect(spy).toHaveBeenCalledWith(7)
        off()
    })

    it('cleans up exposed entry on unmount', () => {
        const {unmount} = render(<TestComponent name="counterF"/>)
        expect(window.exposed.has('counterF')).toBe(true)
        unmount()
        expect(window.exposed.has('counterF')).toBe(false)
    })

    it('uses useId-generated key when no name is provided (mocked useId)', async () => {
        // Dynamically import a wrapper component that mocks useId only for this test
        const spy = vi.spyOn(React, 'useId').mockReturnValue('mock-id-123' as any)

        // Re-import expose with mocked React
        const {default: exposeWithMock} = await import('../src/hooks/expose')

        function NoNameComponent() {
            const [v, setV] = exposeWithMock(useState(0))
            return (
                <div>
                    <span data-testid="value">{v}</span>
                    <button onClick={() => setV((c: number) => c + 1)}>inc</button>
                </div>
            )
        }

        render(<NoNameComponent/>)
        // the key should be the mocked useId value
        const entry = window.exposed.get('mock-id-123')
        expect(entry).toBeTruthy()

        fireEvent.click(screen.getByText('inc'))
        expect(screen.getByTestId('value').textContent).toBe('1')

        spy.mockRestore()
    })
})
