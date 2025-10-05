export type RoleDbRecord = {
  id: string;
  name: string;
  displayName: string;
  powerLevel: number;
}

export interface IRoleSqlProvider {
  selectRolesByUserIdsSql(userIds: string[]): string;
}