export type RequiredServiceGetter = <T extends object>(token: DependencyToken<T>) => T;
export type ServiceFactory<T extends object> = (getRequiredService: RequiredServiceGetter) => T;
export type Service<T extends object> = {
  token: DependencyToken<T>,
  lifetime: ServiceLifetime,
  instance: T | null,
  factory: ServiceFactory<T>
};

export enum ServiceLifetime {
  Singleton = 0,
  Scoped = 1,
  Transient = 2
}

export interface IServiceProvider {
  getService<T extends object>(token: DependencyToken<T>): T | null;
  getRequiredService<T extends object>(token: DependencyToken<T>): T;
  clearScopedServices(): void;
}