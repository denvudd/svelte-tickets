import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import type { Tables } from '$lib/database.types';
import { getChatMembersList } from '$lib/db/chat-members';
import { deleteMessage, getMessagesList } from '$lib/db/messages';
import { ROUTES } from '$lib/constants';

export type ChatMemberWithProfile = {
	profile_id: string;
	profiles: Tables<'profiles'>;
};

export type MessageWithProfile = Tables<'messages'> & {
	profiles: Tables<'profiles'>;
};

export const load: PageServerLoad = async ({
	params,
	locals: { supabase, user, profile },
	depends
}) => {
	depends('messages');
	if (!user || !profile) throw redirect(303, ROUTES.auth.login);

	const chatId = params.chatId;
	if (!chatId) throw redirect(303, ROUTES.private.messages);

	const { data: chatMembers, error: chatMemberError } =
		await getChatMembersList<ChatMemberWithProfile>(supabase, {
			select: 'profile_id, profiles(full_name, avatar_url, occupation)',
			filters: [
				{
					column: 'chat_id',
					operator: 'eq',
					value: chatId
				},
				{
					column: 'profile_id',
					operator: 'neq',
					value: profile.id
				}
			]
		});

	const chatMember = chatMembers?.[0];

	if (chatMemberError) {
		console.log('🚀 ~ load: ~ chatMemberError:', chatMemberError);
		return fail(500, { message: chatMemberError.message });
	}
	if (!chatMember) throw redirect(303, ROUTES.private.messages);

	const { data: messages, error: messagesError } = await getMessagesList<MessageWithProfile>(
		supabase,
		{
			select: 'id, content, created_at, profile_id, profiles(full_name)',
			filters: [
				{
					column: 'chat_id',
					operator: 'eq',
					value: chatId
				}
			],
			sort: [
				{
					column: 'created_at',
					order: 'asc'
				}
			]
		}
	);

	if (messagesError) {
		console.log('🚀 ~ load: ~ messagesError:', messagesError);
		return fail(500, { message: messagesError.message });
	}

	if (!messages || messages.length === 0) {
		return { messages: [], chatId, chatMember, profileId: profile.id };
	}

	const lastMessage = messages[messages.length - 1];

	const { error: upsertError } = await supabase.from('message_reads').upsert({
		profile_id: profile.id,
		chat_id: chatId,
		last_read_message_id: lastMessage.id,
		last_read_at: lastMessage.created_at
	});

	if (upsertError) {
		console.error('Failed to update message_reads:', upsertError);
		return fail(500, { message: upsertError.message });
	}

	return {
		messages,
		chatId,
		chatMember,
		profileId: profile.id
	};
};

export const actions: Actions = {
	deleteMessage: async ({ locals: { supabase, user, profile }, url }) => {
		if (!user || !profile) throw redirect(303, ROUTES.auth.login);

		const messageId = url.searchParams.get('messageId');

		if (!messageId) {
			return fail(400, { message: 'Message not found' });
		}

		const { error: deleteError } = await deleteMessage(supabase, messageId);

		if (deleteError) {
			console.log('🚀 ~ deleteMessage: ~ deleteError:', deleteError);
			return fail(500, { message: deleteError.message });
		}

		return { success: true };
	}
};
