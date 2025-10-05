import { MySqlDbConnector } from "@backend/core/infrastructure/db/dbConnector/MySqlDbConnector.js";
import { IRoleSqlProvider } from "@backend/core/infrastructure/db/sqlProviders/role/IRoleSqlProvider.js";

export class MySqlRoleSqlProvider implements IRoleSqlProvider {
  private readonly _dbConnector: MySqlDbConnector;

  public constructor(dbConnector: MySqlDbConnector) {
    this._dbConnector = dbConnector;
  }

  public selectRolesByUserIdsSql(userIds: string[]): string {
    return this._dbConnector.format(`
      SELECT
        roles.id,
        roles.name,
        roles.display_name AS displayName,
        roles.power_level AS powerLevel
      FROM roles
      INNER JOIN user_roles ON roles.id = user_roles.role_id
      WHERE user_roles.user_id IN (${userIds.map(_ => "?").join(", ")});
    `, [userIds]);
  }
}