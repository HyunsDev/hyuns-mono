export type NestedValueOf<T> = T[keyof T] extends infer U
  ? U extends object
    ? U[keyof U]
    : never
  : never;
