export interface IUserRoleSqlProvider {
  insertUserRolesSql(args: { userId: string, roleId: string }[]): string;
  deleteUserRolesByUserIdAndRoleIdsSql(userId: string, roleIds: string[]): string;
}