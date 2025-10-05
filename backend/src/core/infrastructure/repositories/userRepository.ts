import { User } from "@backend/core/domain/features/users/entities/user.js";
import { Role } from "@backend/core/domain/features/users/entities/role.js";
import type { IUserRepository } from "@backend/core/domain/features/users/repository.js";
import { IDbConnector } from "@backend/core/infrastructure/db/dbConnector/IDbConnector.js";
import { AbstractRepository } from "./abstractRepository.js";
import { PersistenceUser } from "@backend/core/infrastructure/entities/users/persistenceUser.js";
import { PersistenceError } from "@backend/core/application/unitOfWork/persistenceError.js";
import { PersistenceRole } from "@backend/core/infrastructure/entities/users/persistenceRole.js";
import { PersistencePermission } from "@backend/core/infrastructure/entities/users/persistencePermission.js";
import { IUserSqlProvider } from "@backend/core/infrastructure/db/sqlProviders/user/IUserSqlProvider.js";
import { IRoleSqlProvider } from "@backend/core/infrastructure/db/sqlProviders/role/IRoleSqlProvider.js";
import { IUserRoleSqlProvider } from "@backend/core/infrastructure/db/sqlProviders/userRole/IUserRoleSqlProvider.js";
import { IPermissionSqlProvider } from "../db/sqlProviders/permission/IPermissionSqlProvider.js";

export class UserRepository extends AbstractRepository implements IUserRepository {
  private readonly _dbConnector: IDbConnector;
  private readonly _userSqlProvider: IUserSqlProvider;
  private readonly _roleSqlProvider: IRoleSqlProvider;
  private readonly _userRoleSqlProvider: IUserRoleSqlProvider;
  private readonly _permissionSqlProvider: IPermissionSqlProvider;

  public constructor(
      dbConnector: IDbConnector,
      userSqlProvider: IUserSqlProvider,
      roleSqlProvider: IRoleSqlProvider,
      userRoleSqlProvider: IUserRoleSqlProvider,
      permissionSqlProvider: IPermissionSqlProvider) {
    super();
    this._dbConnector = dbConnector;
    this._userSqlProvider = userSqlProvider;
    this._roleSqlProvider = roleSqlProvider;
    this._userRoleSqlProvider = userRoleSqlProvider;
    this._permissionSqlProvider = permissionSqlProvider;
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
      this._userSqlProvider.selectUsersByIdAndIsDeletedWithLimitSql(id, false, 1),
      this._roleSqlProvider.selectRolesByUserIdsSql([id]),
      this._permissionSqlProvider.selectPermissionsByUserIds([id])
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
        const insertUserRolesSqlStatement = this._userRoleSqlProvider
            .insertUserRolesSql(persistenceUser.roles.map(role => ({ userId: persistenceUser.id, roleId: role.id })));
        await this._dbConnector.executeAsync(insertUserRolesSqlStatement);
      }

      return persistenceUser.id;
    };

    return await this._dbConnector.useTransactionIfNotBegunAsync(operation);
  }

  public async updateUserAsync(user: User): Promise<void> {
    const persistenceUser = AbstractRepository.ensureDomainEntityIsPersistenceEntity(user, PersistenceUser);
    const operation = async () => {
      const updateUserSqlStatement = this._userSqlProvider.updateUserSql(persistenceUser);
      const updatedRecordCount = await this._dbConnector.executeAsync(updateUserSqlStatement);

      if (!updatedRecordCount) {
        throw PersistenceError.forConcurrencyConflict();
      }

      if (user instanceof PersistenceUser) {
        const insertUserRolesSqlStatement = this._userRoleSqlProvider
            .insertUserRolesSql(persistenceUser.roles.map(role => ({ userId: persistenceUser.id, roleId: role.id })));
        const deleteUserRolesSqlStatement = this._userRoleSqlProvider
            .deleteUserRolesByUserIdAndRoleIdsSql(persistenceUser.id, persistenceUser.roles.map(role => role.id));
        await this._dbConnector.executeMultipleAsync([insertUserRolesSqlStatement, deleteUserRolesSqlStatement]);
      }
    }

    await this._dbConnector.useTransactionIfNotBegunAsync(operation);
  }

  public async removeUserAsync(user: User): Promise<void> {
    const persistenceUser = AbstractRepository.ensureDomainEntityIsPersistenceEntity(user, PersistenceUser);
    const operation = async () => {
      const deleteUserSqlStatement = this._userSqlProvider.deleteUserSql(persistenceUser);
      const deletedRowCount = await this._dbConnector.executeAsync(deleteUserSqlStatement);

      if (!deletedRowCount) {
        throw PersistenceError.forConcurrencyConflict();
      }

      const deleteUserRolesSqlStatement = this._userRoleSqlProvider
          .deleteUserRolesByUserIdAndRoleIdsSql(persistenceUser.id, persistenceUser.roles.map(role => role.id));
      await this._dbConnector.executeAsync(deleteUserRolesSqlStatement);
    };

    await this._dbConnector.useTransactionIfNotBegunAsync(operation);
  }
}