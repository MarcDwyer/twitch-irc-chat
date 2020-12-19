export function removeBreaks(s: string) {
    return s.replace(/(\r\n|\n|\r)/gm, '');
}

export interface Deferred<T> extends Promise<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    // deno-lint-ignore no-explicit-any
    reject: (reason?: any) => void;
}
/** Creates a Promise with the `reject` and `resolve` functions
 * placed as methods on the promise object itself. It allows you to do:
 *
 *     const p = deferred<number>();
 *     // ...
 *     p.resolve(42);
 */
export function deferred<T>(): Deferred<T> {
    let methods;
    const promise = new Promise<T>((resolve, reject): void => {
        methods = { resolve, reject };
    });
    return Object.assign(promise, methods) as Deferred<T>;
}

export function delay(ms: number): Promise<void> {
    return new Promise((res): number =>
        setTimeout((): void => {
            res();
        }, ms)
    );
}
