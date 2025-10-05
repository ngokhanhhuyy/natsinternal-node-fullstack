import type { IPermissionSqlProvider } from "./IPermissionSqlProvider.js";
import { MySqlDbConnector } from "@backend/core/infrastructure/db/dbConnector/MySqlDbConnector.js";

export class MySqlPermissionSqlProvider implements IPermissionSqlProvider {
  private readonly _connector: MySqlDbConnector;

  public constructor(connector: MySqlDbConnector) {
    this._connector = connector;
  }

  public selectPermissionsByUserIds(userIds:string[]): string {
    return this._connector.format(`
      SELECT
        permissions.id,
        permissions.name,
        permissions.role_id AS roleId
      FROM permissions
      INNER JOIN roles ON permissions.role_id = roles.id
      INNER JOIN user_roles ON roles.id = user_roles.role_id
      WHERE user_roles.user_id IN (${userIds.map(_ => "?").join(", ")});
    `, [userIds]);
  }
}