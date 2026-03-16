/* eslint-disable @typescript-eslint/no-explicit-any */
export function omitUndefined<const T extends Record<string, any>>(
  obj: T,
): {
  [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>;
} {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as any;
}
