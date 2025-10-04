import { User } from "@backend/core/domain/features/users/entities/user.js";
import { Role } from "@backend/core/domain/features/users/entities/role.js";
import type { IUserRepository } from "@backend/core/domain/features/users/repository.js";
import { IDbConnector } from "@backend/core/infrastructure/db/dbConnector/IDbConnector.js";
import { AbstractRepository } from "./abstractRepository.js";
import { PersistenceUser } from "@backend/core/infrastructure/entities/users/persistenceUser.js";
// import { PersistenceError } from "@backend/core/application/unitOfWork/persistenceError.js";
import { PersistenceRole } from "@backend/core/infrastructure/entities/users/persistenceRole.js";
import { PersistencePermission } from "@backend/core/infrastructure/entities/users/persistencePermission.js";
import { IUserSqlProvider } from "../db/sqlProviders/user/IUserSqlProvider.js";

export class UserRepository extends AbstractRepository implements IUserRepository {
  private readonly _dbConnector: IDbConnector;
  private readonly _userSqlProvider: IUserSqlProvider;

  public constructor(dbConnector: IDbConnector, userSqlProvider: IUserSqlProvider) {
    super();
    this._dbConnector = dbConnector;
    this._userSqlProvider = userSqlProvider;
  }

  public async getUserByIdAsync(id: string): Promise<User | null> {
    type UserRecord = {
      id: string;
      userName: string;
      passwordHash: string;
      createdDateTime: Date;
      deletedDateTime: Date | null;
      rowVersion: number;
    }

    type RoleRecord = {
      id: string;
      name: string;
      displayName: string;
      powerLevel: number;
    };

    type PermissionRecord = {
      id: string;
      name: string;
      roleId: string;
    };

    type DataSets = [UserRecord[], RoleRecord[], PermissionRecord[]];
    const [userRecords, roleRecords, permissionRecords] = await this._dbConnector.queryMultipleAsync<DataSets>([
      {
        sql: `
          SELECT
            id,
            user_name AS userName,
            password_hash AS passwordHash,
            created_datetime AS createdDateTime,
            deleted_datetime AS deletedDateTime,
            row_version AS rowVersion
          FROM users
          WHERE id = ? AND deleted_datetime IS NULL;
        `,
        params: [id]
      },
      {
        sql: `
          SELECT
            roles.id,
            roles.name,
            roles.display_name AS displayName,
            roles.power_level AS powerLevel
          FROM roles
          INNER JOIN user_roles ON roles.id = user_roles.role_id
          WHERE user_roles.user_id = ?;
        `,
        params: [id]
      },
      {
        sql: `
          SELECT
            id,
            name,
            role_id AS roleId
          FROM permissions
          WHERE role_id IN (
            SELECT role_id
            FROM user_roles
            WHERE user_id = ?
          );
        `,
        params: [id]
      }
    ]);

    if (userRecords.length === 0) {
      return null;
    }

    const roles: PersistenceRole[] = [];
    for (const roleRecord of roleRecords) {
      const permissions: PersistencePermission[] = [];
      for (const permissionRecord of permissionRecords) {
        if (permissionRecord.roleId !== roleRecord.id) {
          continue;
        }

        permissions.push(PersistencePermission.rehydrateFromDatabase(
          permissionRecord.id,
          permissionRecord.name,
          permissionRecord.roleId
        ));
      }

      roles.push(PersistenceRole.rehydrateFromDatabase(
        roleRecord.id,
        roleRecord.name,
        roleRecord.displayName,
        roleRecord.powerLevel,
        permissions
      ));
    }


    const [userRecord] = userRecords;
    return PersistenceUser.rehydrateFromDatabase(
      userRecord.id,
      userRecord.userName,
      userRecord.passwordHash,
      userRecord.createdDateTime,
      userRecord.deletedDateTime,
      roles,
      userRecord.rowVersion
    );
  }

  public createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User {
    return PersistenceUser.newPersistenceUser(userName, passwordHash, createdDateTime, roles);
  }

  public async addUserAsync(user: User): Promise<string> {
    const persistenceUser = AbstractRepository.ensureDomainEntityIsPersistenceEntity(user, PersistenceUser);
    const operation = async () => {
      const insertUserSql = this._userSqlProvider.insertUsersSql([persistenceUser]);
      await this._dbConnector.executeAsync(insertUserSql);

      if (persistenceUser.roles.length) {
        await this._dbConnector.executeAsync(`
          INSERT INTO user_roles (user_id, role_id)
          VALUES ?;
        `, persistenceUser.roles.map<[string, string]>(role => [persistenceUser.id, role.id]));
      }

      return persistenceUser.id;
    };

    return await this._dbConnector.useTransactionIfNotBegunAsync(operation);
  }

  public async updateUserAsync(user: User): Promise<boolean> {
    const operation = async () => {
      let rowVersionCondition: string = "";
      let params: [string] | [string, number] = [user.passwordHash];
      if (user instanceof PersistenceUser) {
        rowVersionCondition = "AND row_version = ?";
        params = [...params, user.rowVersion];
      }

      const updatedRecordCount = await this._dbConnector.executeAsync(`
        UPDATE users
        SET
          password_hash = ?,
          row_version = row_version + 1
        WHERE id = ? ${rowVersionCondition};
      `, params);

      if (!updatedRecordCount) {
        return false;
      }

      if (user instanceof PersistenceUser) {
        await this._dbConnector.executeMultipleAsync([
          {
            sql: `
              INSERT INTO user_roles (user_id, role_id)
              VALUES ?;
            `,
            params: user.addedRoles.map(role => [user.id, role.id])
          },
          {
            sql: `
              DELETE FROM user_roles
              WHERE user_id = ? AND role_id NOT IN (${user.roles.map(_ => "?").join(", ")});
            `,
            params: [user.id, ...user.roles.map(role => role.id)]
          }
        ]);
      };

      return true;
    }

    return await this._dbConnector.useTransactionIfNotBegunAsync(operation);
  }

  public async removeUserAsync(user: User): Promise<boolean> {
    const operation = async () => {
      const deletedRowCount = await this._dbConnector.executeAsync(`
        UPDATE users
        SET deleted_datetime = ?, row_version = row_version + 1
        WHERE id = ?;
      `, [user.id, user.deletedDateTime]);

      if (!deletedRowCount) {
        return false;
      }

      await this._dbConnector.executeAsync(`
        DELETE FROM user_roles
        WHERE user_id = ?  
      `, [user.id]);

      return true;
    };

    return await this._dbConnector.useTransactionIfNotBegunAsync(operation);
  }
}