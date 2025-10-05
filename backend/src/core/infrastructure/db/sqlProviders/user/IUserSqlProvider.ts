import { PersistenceUser } from "@backend/core/infrastructure/entities/users/persistenceUser.js";

export interface IUserSqlProvider {
  selectUsersByIdAndIsDeletedWithLimitSql(id: string, isDeleted: boolean, limit: number): string;
  insertUsersSql(users: PersistenceUser[]): string;
  updateUserSql(user: PersistenceUser): string;
  deleteUserSql(user: PersistenceUser): string;
}

class TestingUserSqlProvider implements IUserSqlProvider {
  constructor(sqlProvider: IUserSqlProvider) {
  }

  selectUsersByIdAndIsDeletedWithLimitSql(id: string, isDeleted: boolean, limit: number): string {
    return "";
  }

  insertUsersSql(users: PersistenceUser[]): string {
    return "";
  }

  updateUserSql(user: PersistenceUser): string {
    return "";
  }

  deleteUserSql(user: PersistenceUser): string {
    return "";
  }
}

type Token<T> = symbol & { __type?: T };
export const IUserSqlProvider: Token<IUserSqlProvider> = Symbol("IUserSqlProvider");

function add<T>(symbol: Token<T>, implementationFactory: (getService: <K>(token: Token<K>) => K) => T): void {

}

add<IUserSqlProvider>(IUserSqlProvider, (getService) => new TestingUserSqlProvider(getService(IUserSqlProvider)));