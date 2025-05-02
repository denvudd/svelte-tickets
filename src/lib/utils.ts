import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Database, TablesInsert, TablesUpdate } from './database.types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

type TableKeys = keyof DefaultSchema['Tables'];

export type TablesInsertWithoutId<T extends TableKeys> = Omit<TablesInsert<T>, 'id'>;
export type TablesUpdateWithoutId<T extends TableKeys> = Omit<TablesUpdate<T>, 'id'>;
