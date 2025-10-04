export type RoleDbRecord = {
  id: string;
  name: string;
  displayName: string;
  powerLevel: number;
}

export interface IRoleSqlProvider {
  getRolesByUserIdsAsync(userIds: string[]): Promise<RoleDbRecord[]>;
}