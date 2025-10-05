import type { User } from "@backend/core/domain/features/users/entities/user.js";
import type { Role } from "@backend/core/domain/features/users/entities/role.js";

export interface IUserRepository {
  getUserByIdAsync(id: string): Promise<User | null>;
  createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User;
  addUserAsync(user: User): Promise<string>;
  updateUserAsync(user: User): Promise<void>;
  removeUserAsync(user: User): Promise<void>;
}