import type { IDbConnector } from "@backend/core/infrastructure/db/IDbConnector.js";
import { MySqlDbConnector } from "@backend/core/infrastructure/db/MySqlDbConnector.js";
import { IDbContext } from "@backend/core/infrastructure/db/dbContext/IDbContext.js";
import { MySqlManualDbContext } from "@backend/core/infrastructure/db/dbContext/MySqlManualDbContext.js";

type ServiceInstanceAndInitializer<T = object> = { instance: T, initializer: () => T };

type ServiceGetter<TService extends object> = <TService>(key: string) => TService;

export class ServiceProvider {
  private readonly _singletonServices = new Map<string, ServiceInstanceAndInitializer>();
  private readonly _scopedServices = new Map<string, ServiceInstanceAndInitializer>();

  public getDbConnector(): IDbConnector {
    return new MySqlDbConnector();
  }

  public getDbContext(): IDbContext {
    return new MySqlManualDbContext(this.getDbConnector());
  }
}