import { z } from 'zod';

export const ProfileSchema = z.object({
	full_name: z
		.string({
			required_error: 'Name is required'
		})
		.min(2, { message: 'Name must be at least 2 characters' }),
	avatar: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 5 * 1024 * 1024, 'Max 5 MB upload size.')
		.optional(),
	occupation: z.string().optional()
});
