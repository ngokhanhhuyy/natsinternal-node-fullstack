import { createPool } from "mysql2/promise";
import { ServiceCollection } from "@backend/dependencyInjection/ServiceCollection.js";
import { IDbConnectorToken } from "../db/dbConnector/IDbConnector.js";
import { MySqlDbConnector } from "../db/dbConnector/MySqlDbConnector.js";
import { IUserSqlProviderToken } from "../db/sqlProviders/user/IUserSqlProvider.js";
import { IRoleSqlProviderToken } from "../db/sqlProviders/role/IRoleSqlProvider.js";
import { IUserRoleSqlProviderToken } from "../db/sqlProviders/userRole/IUserRoleSqlProvider.js";
import { IPermissionSqlProviderToken } from "../db/sqlProviders/permission/IPermissionSqlProvider.js";
import { MySqlUserSqlProvider } from "../db/sqlProviders/user/MySqlUserSqlProvider.js";
import { MySqlRoleSqlProvider } from "../db/sqlProviders/role/MySqlRoleSqlProvider.js";
import { MySqlUserRoleSqlProvider } from "../db/sqlProviders/userRole/MySqlUserRoleSqlProvider.js";
import { MySqlPermissionSqlProvider } from "../db/sqlProviders/permission/MySqlPermissionSqlProvider.js";
import { IUserRepositoryToken } from "@backend/core/domain/features/users/repository/IUserRepository.js";
import { UserRepository } from "@backend/core/infrastructure/repositories/userRepository.js";

declare module "@backend/dependencyInjection/ServiceCollection.js" {
  interface ServiceCollection {
    addInfrastructureServices(connectionString: string, connectionLimit?: number): ServiceCollection;
  }
}


// uri: process.env.DATABASE_URL as string,
// waitForConnections: true,
// connectionLimit: !isNaN(connectionLimit) ? connectionLimit : undefined,
// multipleStatements: true

ServiceCollection.prototype.addInfrastructureServices = function(connectionString: string, connectionLimit?: number) {
  const serviceCollection = this;
  const IMySqlDbPool = Symbol("IMySqlDbPool");

  return serviceCollection
    // DbPool.
    .addSingleton(IMySqlDbPool, () => {
      return createPool({
        uri: connectionString,
        waitForConnections: true,
        connectionLimit: (connectionLimit != null && !isNaN(connectionLimit)) ? connectionLimit : undefined,
        multipleStatements: true
      });
    })

    // DbConnector.
    .addScoped(MySqlDbConnector, () => new MySqlDbConnector())
    .addScoped(IDbConnectorToken, (grs) => grs(MySqlDbConnector))

    // SqlProviders.
    .addScoped(IUserSqlProviderToken, (grs) => new MySqlUserSqlProvider(grs(MySqlDbConnector)))
    .addScoped(IRoleSqlProviderToken, (grs) => new MySqlRoleSqlProvider(grs(MySqlDbConnector)))
    .addScoped(IUserRoleSqlProviderToken, (grs) => new MySqlUserRoleSqlProvider(grs(MySqlDbConnector)))
    .addScoped(IPermissionSqlProviderToken, (grs) => new MySqlPermissionSqlProvider(grs(MySqlDbConnector)))

    // Repositories.
    .addScoped(IUserRepositoryToken, (grs) => new UserRepository(
      grs(IDbConnectorToken),
      grs(IUserSqlProviderToken),
      grs(IRoleSqlProviderToken),
      grs(IUserRoleSqlProviderToken),
      grs(IPermissionSqlProviderToken)
    ));
}