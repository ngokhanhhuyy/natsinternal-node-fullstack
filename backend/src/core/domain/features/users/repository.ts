import type { User } from "@backend/core/domain/features/users/entities/user.js";
import type { Role } from "@backend/core/domain/features/users/entities/role.js";
import type { Permission } from "@backend/core/domain/features/users/entities/permission.js";

export interface IUserRepository {
  getUserByIdAsync(id: string): Promise<User | null>;
  createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User;
  addUserAsync(user: User): Promise<string>;
  updateUserAsync(user: User): Promise<boolean>;
  removeUserAsync(user: User): Promise<boolean>;
}