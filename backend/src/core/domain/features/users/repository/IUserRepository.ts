import type { User } from "../entities/User.js";
import type { Role } from "../entities/Role.js";

export interface IUserRepository {
  getUserByIdAsync(id: string): Promise<User | null>;
  createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User;
  addUserAsync(user: User): Promise<string>;
  updateUserAsync(user: User): Promise<void>;
  removeUserAsync(user: User): Promise<void>;
}

export const IUserRepositoryToken: DependencyToken<IUserRepository> = Symbol("IUserRepository");