export class ObjectPool<T> {
    private pool: T[] = [];
    constructor(private factory: () => T) {};

    acquire(): T {
        return this.pool.length > 0 ? this.pool.pop()! : this.factory();
    };

    release(item: T): void {
        this.pool.push(item);
    };
};