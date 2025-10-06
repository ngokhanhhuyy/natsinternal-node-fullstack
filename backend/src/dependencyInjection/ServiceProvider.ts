type ServiceGetter = <T>(token: DependencyToken<T>) => T;
type SingletonServiceFactory<T> = (token: DependencyToken<T>, singletonServiceGetter: ServiceGetter) => T;
type Service<T extends object> = { instance: T | null, factory: SingletonServiceFactory<T> };

class ServiceProvider {
  private readonly transientServiceFactories = new Map<DependencyToken<object>, SingletonServiceFactory<object>>();
  private readonly scopedServices = new Map<DependencyToken<object>, Service<object>>();
  private readonly
}