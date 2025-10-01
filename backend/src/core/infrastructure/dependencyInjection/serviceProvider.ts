import type { IDbConnector } from "@/core/infrastructure/dbContext/dbConnectorInterface.js";
import { MySqlDbConnector } from "@/core/infrastructure/dbContext/mysqlDbConnector.js";
import { IDbContext } from "@/core/infrastructure/dbContext/dbContextInterface.js";
import { MySqlManualDbContext } from "@/core/infrastructure/dbContext/mySqlManualDbContext.js";

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