import { PersistenceUser } from "@backend/core/infrastructure/entities/users/persistenceUser.js";

export interface IUserSqlProvider {
  selectUsersByIdAndIsDeletedWithLimitSql(id: string, isDeleted: boolean, limit: number): string;
  insertUsersSql(users: PersistenceUser[]): string;
  updateUserSql(user: PersistenceUser): string;
  deleteUserSql(user: PersistenceUser): string;
}