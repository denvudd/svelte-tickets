import { ROUTES } from '$lib/constants';
import type { Tables } from '$lib/database.types';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getProfileList } from '$lib/db/profile';
import { createChatMembers, getChatMembersList } from '$lib/db/chat-members';
import { getMessageReadsList } from '$lib/db/message-reads';
import { createChat } from '$lib/db/chats';

type ChatWithProfile = Tables<'chat_members'> & {
	profiles: Tables<'profiles'>;
};

type ChatWithInfo = {
	chat_id: string;
	profile: Tables<'profiles'>;
	unread_count: number;
	last_message?: {
		content: string;
		created_at: string;
		profile_id: string;
	};
};

type UnreadMessageWithCount = Tables<'messages'> & {
	count: number;
};

export const load: PageServerLoad = async ({
	locals: { supabase, user, profile },
	url,
	depends
}) => {
	depends('chats');

	if (!user || !profile) throw redirect(303, ROUTES.auth.login);

	const profileSearchTerm = url.searchParams.get('q');

	const { data: profiles } = await getProfileList(supabase, {
		select: 'id, full_name, avatar_url',
		filters: [
			{
				column: 'full_name',
				operator: 'ilike',
				value: `%${profileSearchTerm || ''}%`
			},
			{
				column: 'id',
				operator: 'not',
				value: profile.id
			}
		],
		limit: 5
	});

	const { data: chatMembers, error: chatMembersError } = await getChatMembersList(supabase, {
		select: 'chat_id',
		filters: [
			{
				column: 'profile_id',
				operator: 'eq',
				value: profile.id
			}
		]
	});

	if (chatMembersError) {
		return fail(500, { message: chatMembersError.message });
	}

	const chatIds = chatMembers?.map((c) => c.chat_id) ?? [];

	if (chatIds.length === 0) {
		return {
			chats: [],
			profiles: profiles || []
		};
	}

	const { data: chatProfiles, error: chatProfilesError } =
		await getChatMembersList<ChatWithProfile>(supabase, {
			select: 'chat_id, profiles(id, full_name, avatar_url, occupation)',
			filters: [
				{
					column: 'chat_id',
					operator: 'in',
					value: chatIds
				},
				{
					column: 'profile_id',
					operator: 'neq',
					value: profile.id
				}
			]
		});

	if (chatProfilesError) {
		console.log('🚀 ~ load: ~ chatProfilesError:', chatProfilesError);
		return fail(500, { message: chatProfilesError.message });
	}

	const { data: messageReads, error: messageReadsError } = await getMessageReadsList(supabase, {
		select: 'chat_id, last_read_at',
		filters: [
			{
				column: 'profile_id',
				operator: 'eq',
				value: profile.id
			},
			{
				column: 'chat_id',
				operator: 'in',
				value: chatIds
			}
		]
	});

	if (messageReadsError) {
		console.log('🚀 ~ load: ~ messageReadsError:', messageReadsError);
		return fail(500, { message: messageReadsError.message });
	}

	const lastReadsMap = Object.fromEntries(
		(messageReads || []).map((read) => [read.chat_id, read.last_read_at])
	);

	const {
		data: lastMessages,
		error: lastMessagesError
	}: PostgrestSingleResponse<Tables<'messages'>[]> = await supabase.rpc(
		'get_last_messages_for_chats',
		{ chat_ids: chatIds }
	);

	if (lastMessagesError) {
		console.log('🚀 ~ load: ~ lastMessagesError:', lastMessagesError);
		return fail(500, { message: lastMessagesError.message });
	}

	const lastMessageMap = Object.fromEntries(
		(lastMessages || []).map((msg) => [
			msg.chat_id,
			{
				content: msg.content || '',
				created_at: msg.created_at || '',
				profile_id: msg.profile_id
			}
		])
	);

	const {
		data: unreadCounts,
		error: unreadCountsError
	}: PostgrestSingleResponse<UnreadMessageWithCount[]> = await supabase.rpc(
		'get_unread_counts_for_chats',
		{
			p_chat_ids: chatIds,
			p_profile_id: profile.id,
			p_last_reads: lastReadsMap
		}
	);

	if (unreadCountsError) {
		console.log('🚀 ~ load: ~ unreadCountsError:', unreadCountsError);
		return fail(500, { message: unreadCountsError.message });
	}

	const unreadCountsMap = Object.fromEntries(
		(unreadCounts || []).map((item) => [item.chat_id, item.count])
	);

	const chats: ChatWithInfo[] = (chatProfiles || []).map((chat) => ({
		chat_id: chat.chat_id,
		profile: chat.profiles,
		unread_count: unreadCountsMap[chat.chat_id] || 0,
		last_message: lastMessageMap[chat.chat_id]
	}));

	chats.sort((a, b) => {
		const dateA = a.last_message?.created_at ? new Date(a.last_message.created_at) : new Date(0);
		const dateB = b.last_message?.created_at ? new Date(b.last_message.created_at) : new Date(0);
		return dateB.getTime() - dateA.getTime();
	});

	return {
		chats: chats || [],
		profiles: profiles || []
	};
};

export const actions: Actions = {
	createChat: async ({ locals: { supabase, user, profile }, request }) => {
		const form = await request.formData();
		const otherProfileId = form.get('profile_id');

		if (!user || !profile || !otherProfileId || typeof otherProfileId !== 'string') {
			return redirect(303, ROUTES.auth.login);
		}

		const { data: chatsByCurrentUser, error: chatsByCurrentUserError } = await getChatMembersList(
			supabase,
			{
				select: 'chat_id',
				filters: [
					{
						column: 'profile_id',
						operator: 'eq',
						value: profile.id
					}
				]
			}
		);

		if (chatsByCurrentUserError) {
			console.log('🚀 ~ createChat: ~ myChatsErr:', chatsByCurrentUserError);
			return fail(500, { message: chatsByCurrentUserError.message });
		}

		const chatIds = chatsByCurrentUser.map((c) => c.chat_id);

		if (chatIds.length > 0) {
			const { data: members, error: membersErr } = await getChatMembersList(supabase, {
				select: 'chat_id, profile_id',
				filters: [
					{
						column: 'chat_id',
						operator: 'in',
						value: chatIds
					},
					{
						column: 'profile_id',
						operator: 'in',
						value: [profile.id, otherProfileId]
					}
				]
			});

			if (membersErr) {
				console.log('🚀 ~ createChat: ~ membersErr:', membersErr);
				return fail(500, { message: membersErr.message });
			}

			const chatMap = new Map<string, Set<string>>();

			for (const entry of members) {
				if (!chatMap.has(entry.chat_id)) {
					chatMap.set(entry.chat_id, new Set());
				}
				chatMap.get(entry.chat_id)!.add(entry.profile_id);
			}

			// Find existing chat where both users are present (current user and selected user)
			for (const [chatId, membersSet] of chatMap.entries()) {
				if (membersSet.size === 2 && membersSet.has(profile.id) && membersSet.has(otherProfileId)) {
					// If it exists, redirect to the existing chat
					throw redirect(303, ROUTES.private.chatId(chatId));
				}
			}
		}

		const { data: chat, error: chatErr } = await createChat(supabase, {
			created_by: user.id
		});

		if (chatErr || !chat) {
			console.log('🚀 ~ createChat: ~ chatErr:', chatErr);
			return fail(500, { message: chatErr?.message ?? 'Failed to create chat' });
		}

		const { error: membersInsertErr } = await createChatMembers(supabase, [
			{ chat_id: chat.id, profile_id: profile.id },
			{ chat_id: chat.id, profile_id: otherProfileId }
		])

		if (membersInsertErr) {
			console.log('🚀 ~ createChat: ~ membersInsertErr:', membersInsertErr);
			return fail(500, { message: membersInsertErr.message });
		}

		throw redirect(303, ROUTES.private.chatId(chat.id));
	}
};
