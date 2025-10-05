import { MySqlDbConnector } from "@backend/core/infrastructure/db/dbConnector/MySqlDbConnector.js";
import { IUserRoleSqlProvider } from "@backend/core/infrastructure/db/sqlProviders/userRole/IUserRoleSqlProvider.js";

export class MySqlUserRoleSqlProvider implements IUserRoleSqlProvider {
  private readonly _dbConnector: MySqlDbConnector;

  public constructor(dbConnector: MySqlDbConnector) {
    this._dbConnector = dbConnector;
  }

  public insertUserRolesSql(args: { userId: string; roleId: string }[]): string {
    return this._dbConnector.format(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ?;
    `, args.map(arg => [arg.userId, arg.roleId]));
  }

  public deleteUserRolesByUserIdAndRoleIdsSql(userId: string, roleIds: string[]): string {
    return this._dbConnector.format(`
      DELETE FROM user_roles
      WHERE user_id = ? AND role_id NOT IN (${roleIds.map(_ => "?").join(", ")});
    `, [userId, ...roleIds]);
  }
}