import { IServiceProvider, ServiceFactory, ServiceLifetime } from "@backend/dependencyInjection/IServiceProvider.js";
import { ServiceProvider, type ServiceRegisteredInfo } from "@backend/dependencyInjection/ServiceProvider.js";

export class ServiceCollection {
  private readonly _serviceRegisteredInfos: ServiceRegisteredInfo[] = [];

  public addSingleton<T extends object>(token: DependencyToken<T>, factory: ServiceFactory<T>): ServiceCollection {
    return this.add(token, ServiceLifetime.Singleton, factory);
  }

  public addScoped<T extends object>(token: DependencyToken<T>, factory: ServiceFactory<T>): ServiceCollection {
    return this.add(token, ServiceLifetime.Scoped, factory);
  }

  public addTransient<T extends object>(token: DependencyToken<T>, factory: ServiceFactory<T>): ServiceCollection {
    return this.add(token, ServiceLifetime.Transient, factory);
  }

  public add<T extends object>(
      token: DependencyToken<T>,
      lifetime: ServiceLifetime,
      factory: ServiceFactory<T>): ServiceCollection {
    this._serviceRegisteredInfos.push({ token, lifetime, factory });
    return this;
  }

  public build(): IServiceProvider {
    return new ServiceProvider(this._serviceRegisteredInfos);
  }
}