export const ROUTES = {
	private: {
		tickets: '/private/tickets',
		projects: '/private/projects',
        messages: '/private/messages',
		account: {
			profile: '/private/account/profile',
			settings: '/private/account/settings',
			appearence: '/private/account/appearance'
		}
	},
	auth: {
		login: '/auth/login',
		signUp: '/auth/sign-up',
		completeProfile: '/auth/complete-profile',
		checkEmail: '/auth/check-email',
		forgotPassword: '/auth/forgot-password',
		resetPassword: '/auth/reset-password',
		callback: '/auth/callback',
		confirm: '/auth/confirm',
		emailChanging: '/auth/email-changing',
		error: '/auth/error'
	}
} as const;
