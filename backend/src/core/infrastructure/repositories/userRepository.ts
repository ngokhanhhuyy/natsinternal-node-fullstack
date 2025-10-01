import { User } from "@/core/domain/features/users/entities/user.js";
import { Role } from "@/core/domain/features/users/entities/role.js";
import { PersistenceUser } from "@/core/infrastructure/entities/users/persistence-user.js";
import type { IUserRepository } from "@/core/domain/features/users/repository.js";

export class UserRepository implements IUserRepository {
  private readonly _newUsers: PersistenceUser[] = [];
  private readonly _modifiedUsers: PersistenceUser[] = [];
  private readonly _removedUsers: PersistenceUser[] = [];
  private readonly _cachedUsers: PersistenceUser[] = [];

  public getUserById(id: string): Promise<User> {
  }

  public createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User {
    const user = PersistenceUser.newPersistenceUser(userName, passwordHash, createdDateTime, roles);
    this._newUsers.push(user);
    return user;
  }

  public updateUser(user: User): void {
    const persistenceUser = user as PersistenceUser;
    
  }

  public removeUser(user: User): void {
    const
  }
}