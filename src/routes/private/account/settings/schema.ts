import { z } from 'zod';

export const PasswordManagementSchema = z
	.object({
		current_password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
		new_password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
		confirm_password: z.string().min(6, { message: 'Password must be at least 6 characters' })
	})
	.refine((data) => data.new_password === data.confirm_password, {
		path: ['confirm_password'],
		message: 'Passwords do not match'
	});

export const EmailManagementSchema = z.object({
	new_email: z.string().email({ message: 'Invalid email address' })
});
