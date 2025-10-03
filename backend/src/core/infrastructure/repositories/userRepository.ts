import { User } from "@/core/domain/features/users/entities/user.js";
import { Role } from "@/core/domain/features/users/entities/role.js";
import type { IUserRepository } from "@/core/domain/features/users/repository.js";
import { IDbConnector } from "@/core/infrastructure/dbContext/dbConnectorInterface.js";
import { PersistenceUser } from "@/core/infrastructure/entities/users/persistenceUser.js";

export class UserRepository implements IUserRepository {
  private readonly _dbConnector: IDbConnector;
  private readonly _newUsers: PersistenceUser[] = [];
  private readonly _modifiedUsers: PersistenceUser[] = [];
  private readonly _removedUsers: PersistenceUser[] = [];
  private readonly _cachedUsers: PersistenceUser[] = [];

  public UserRepository(dbConnector: IDbConnector) {
    this._dbConnector = dbConnector;
  }

  public getUserByIdAsync(id: string): Promise<User> {
    type UserRecord = {
      id: string,
      passwordHash: string;
      rowVersion: number;
    };

    const [user]: [UserRecord] =
  }

  public createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User {
    const user = PersistenceUser.newPersistenceUser(userName, passwordHash, createdDateTime, roles);
    this._newUsers.push(user);
    return user;
  }

  public updateUser(user: User): void {
    const persistenceUser = user as PersistenceUser;
    
  }

  public removeUserAsync(user: User): void {
    const
  }
}