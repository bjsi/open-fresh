export function filterAsync<T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T[]> {
  return Promise.all(arr.map(predicate)).then((results) => {
    return arr.filter((_v, index) => results[index]);
  });
}
