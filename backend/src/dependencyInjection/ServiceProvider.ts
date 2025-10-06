import { ServiceLifetime, type IServiceProvider, type Service } from "@backend/dependencyInjection/IServiceProvider.js";

export type ServiceRegisteredInfo = Omit<Service<object>, "instance">;

export class ServiceProvider implements IServiceProvider {
  private readonly _services = new Map<DependencyToken<object>, Service<object>>();

  public constructor(serviceRegisteredInfos: ServiceRegisteredInfo[]) {
    for (const info of serviceRegisteredInfos) {
      this._services.set(info.token, { ...info, instance: null });
    }
  }

  public getService<T extends object>(token: DependencyToken<T>, dependentService?: Service<object>): T | null {
    let service = this._services.get(token) as Service<T> | undefined;
    if (!service) {
      return null
    }

    if (dependentService != null && dependentService.lifetime > service.lifetime) {
      const errorMessage =
        `Cannot resolve dependency with token ${ServiceProvider.getTokenDescription(dependentService.token)} and ` +
        `lifetime [${ServiceLifetime[dependentService.lifetime]}] for service with token ` +
        `[${ServiceProvider.getTokenDescription(token)}] and lifetime [${ServiceLifetime[service.lifetime]}] due to` +
        "lifetime conflict.";
      throw new Error(errorMessage);
    }

    const factory = service.factory((t) => this.getRequiredService(t, service));
    if (service.lifetime === ServiceLifetime.Transient) {
      return factory;
    }

    if (!service.instance) {
      service.instance = service.factory((t) => this.getRequiredService(t, service));
    }

    return service.instance;
  }

  public getRequiredService<T extends object>(token: DependencyToken<T>, dependentService?: Service<object>): T {
    const service = this.getService(token, dependentService);
    if (!service) {
      const message = `Service with token [${ServiceProvider.getTokenDescription(token)}] has not been registered.`;
      throw new Error(message);
    }

    return service;
  }

  public clearScopedServices(): void {
    this._services
      .values()
      .filter(service => service.lifetime === ServiceLifetime.Scoped)
      .forEach(service => service.instance = null);
  }

  private static getTokenDescription(token: DependencyToken<object>): string {
    if (typeof token === "function") {
      return token.name;
    }

    return token.description ?? "UnknownSymbolDescription";
  }
}