import { PersistenceUser } from "@backend/core/infrastructure/entities/users/persistenceUser.js";
import type { IUserSqlProvider } from "./IUserSqlProvider.js";
import { MySqlDbConnector } from "@backend/core/infrastructure/db/dbConnector/MySqlDbConnector.js";

export class MySqlUserSqlProvider implements IUserSqlProvider {
  private readonly _connector: MySqlDbConnector;

  public constructor(connector: MySqlDbConnector) {
    this._connector = connector;
  }

  public selectUsersByIdAndIsDeletedWithLimitSql(id: string, isDeleted: boolean, limit: number): string {
    return this._connector.format(`
      SELECT
        id,
        user_name AS userName,
        password_hash AS passwordHash,
        created_datetime AS createdDateTime,
        deleted_datetime AS deletedDateTime,
        row_version AS rowVersion
      FROM users
      WHERE id = ?
      AND (IF(?, deleted_datetime IS NOT NULL, deleted_datetime IS NULL))
      LIMIT ?;
    `, [id, isDeleted, limit]);
  }

  public insertUsersSql(users: PersistenceUser[]): string {
    return this._connector.format(`
      INSERT INTO users (id, user_name, password_hash, created_datetime)
      VALUES ?
    `, users.map(u => [u.id, u.userName, u.passwordHash, u.createdDateTime]));
  }

  public updateUserSql(user: PersistenceUser): string {
    return this._connector.format(`
      UPDATE users
      SET
        password_hash = ?,
        row_version = row_version + 1
      WHERE id = ?
      AND deleted_datetime IS NULL
      AND row_version = ?
      LIMIT 1;
    `, [user.passwordHash, user.id, user.rowVersion]);
  }

  public deleteUserSql(user: PersistenceUser): string {
    return this._connector.format(`
      UPDATE users
      SET deleted_datetime = NOW()
      WHERE id = ?
      AND row_version = ?
    `, [user.id, user.rowVersion]);
  }
}