export interface Fail<L> {
  readonly type: "fail";
  readonly error: L;
}

export interface Success<R> {
  readonly type: "success";
  readonly data: R;
}

export type Either<L, R> = Fail<L> | Success<R>;

export function success<T>(data: T): Success<T> {
  return { type: "success", data } as const;
}

export function fail<T>(error: T): Fail<T> {
  return { type: "fail", error } as const;
}
