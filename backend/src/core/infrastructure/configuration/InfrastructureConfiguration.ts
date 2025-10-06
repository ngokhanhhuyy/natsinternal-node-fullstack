import { ServiceCollection } from "@backend/dependencyInjection/ServiceCollection.js";
import { type IDbConnector, IDbConnectorToken } from "../db/dbConnector/IDbConnector.js";
import { MySqlDbConnector } from "../db/dbConnector/MySqlDbConnector.js";
import { type IUserSqlProvider, IUserSqlProviderToken } from "../db/sqlProviders/user/IUserSqlProvider.js";
import { IRoleSqlProvider } from "../db/sqlProviders/role/IRoleSqlProvider.js";
import { IUserRoleSqlProvider } from "../db/sqlProviders/userRole/IUserRoleSqlProvider.js";
import { IPermissionSqlProvider } from "../db/sqlProviders/permission/IPermissionSqlProvider.js";
import { MySqlUserSqlProvider } from "../db/sqlProviders/user/MySqlUserSqlProvider.js";
import { MySqlRoleSqlProvider } from "../db/sqlProviders/role/MySqlRoleSqlProvider.js";
import { MySqlUserRoleSqlProvider } from "../db/sqlProviders/userRole/MySqlUserRoleSqlProvider.js";
import { MySqlPermissionSqlProvider } from "../db/sqlProviders/permission/MySqlPermissionSqlProvider.js";

declare module "@backend/dependencyInjection/ServiceCollection.js" {
  interface ServiceCollection {
    addInfrastructureServices(): ServiceCollection;
  }
}

ServiceCollection.prototype.addInfrastructureServices = function() {
  this.addScoped(IDbConnectorToken, () => new MySqlDbConnector())
    .addScoped(IUserSqlProviderToken, (getRequiredService) => new MySqlUserSqlProvider()));
}