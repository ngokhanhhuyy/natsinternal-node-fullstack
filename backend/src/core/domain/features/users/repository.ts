import type { User } from "@/core/domain/features/users/entities/user.js";
import type { Role } from "@/core/domain/features/users/entities/role.js";
import type { Permission } from "@/core/domain/features/users/entities/permission.js";

export interface IUserRepository {
  getUserById(id: string): Promise<User>;
  createUser(userName: string, passwordHash: string, createdDateTime: Date, roles: Role[]): User;
  updateUser(user: User): void;
  removeUser(user: User): void;
}

