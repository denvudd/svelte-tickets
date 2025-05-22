import { UserRole } from '$lib/role-manager';
import * as m from '$lib/paraglide/messages';

export const USER_ROLES_DESCRIPTION = () => [
	{
		role: UserRole.User,
		label: m.signup_role_user_label(),
		description: [
			m.signup_role_user_description1(),
			m.signup_role_user_description2(),
		]
	},
	{
		role: UserRole.Agent,
		label:  m.signup_role_agent_label(),
		description: [
			m.signup_role_agent_description1(),
			m.signup_role_agent_description2(),
		]
	}
];
