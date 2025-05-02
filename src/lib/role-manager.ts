export enum UserRole {
	User = 'user',
	Agent = 'agent',
	Admin = 'admin'
}

export type UserRoleType = keyof typeof UserRole;
export type UserRoleValue = (typeof UserRole)[UserRoleType];

export class UserRoleManager {
	static getAllRoles(): UserRoleValue[] {
		return Object.values(UserRole);
	}

	static getAllRolesExcept(excludedRoles: UserRoleValue | UserRoleValue[]): UserRoleValue[] {
		if (Array.isArray(excludedRoles)) {
			return this.getAllRoles().filter((role) => !excludedRoles.includes(role));
		}

		return this.getAllRoles().filter((role) => role !== excludedRoles);
	}

	static getAllRoleEntriesExcept(
		excludedRoles: UserRoleValue | UserRoleValue[]
	): [UserRoleType, UserRoleValue][] {
		const excludedArray = Array.isArray(excludedRoles) ? excludedRoles : [excludedRoles];

		return Object.entries(UserRole).filter(
			([_, value]) => !excludedArray.includes(value as UserRoleValue)
		) as [UserRoleType, UserRoleValue][];
	}
}
