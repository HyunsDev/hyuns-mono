export type NarrowObject<T> = {
  [K in keyof T]: T[K];
};
