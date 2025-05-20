import { z } from 'zod';

export const CreateChatSchema = z.object({
	searchTerm: z.string()
});
