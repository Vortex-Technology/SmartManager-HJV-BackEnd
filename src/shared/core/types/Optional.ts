/**
 *  @type Optional - Define an object type with the properties of T, but with the keys of K set to optional
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
