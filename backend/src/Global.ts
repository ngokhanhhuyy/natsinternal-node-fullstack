declare global {
  type DependencyToken<T> = symbol & { __type?: T };
}