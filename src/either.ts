import { Fail, Success } from "./types";

export function success<T>(data: T): Success<T> {
  return { type: "success", data } as const;
}

export function fail<T>(error: T): Fail<T> {
  return { type: "fail", error } as const;
}
