export interface Fail<L> {
    readonly type: 'fail';
    readonly error: L;
}

export interface Success<R> {
    readonly type: 'success';
    readonly data: R;
}

export type Either<L, R> = Fail<L> | Success<R>;