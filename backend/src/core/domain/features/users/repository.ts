import type { User } from "@/core/domain/features/users/entities/user.js";
import type { Role } from "@/core/domain/features/users/entities/role.js";
import type { Permission } from "@/core/domain/features/users/entities/permission.js";

export interface IUserRepository {
  getUserByIdAsync(id: string): Promise<User>;
  createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User;
  addUserAsync(user: User): Promise<string>;
  updateUserAsync(user: User): void;
  removeUserAsync(user: User): void;
}

