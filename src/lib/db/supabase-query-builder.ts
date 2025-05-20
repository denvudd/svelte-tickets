import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SupabaseQueryBuilder - класс для создания и выполнения запросов к Supabase
 */
export class SupabaseQueryBuilder<T = any> {
	private query: any;
	private client: SupabaseClient;
	private tableName: string;

	/**
	 * Создает новый экземпляр построителя запросов
	 * @param supabase - Клиент Supabase
	 * @param tableName - Название таблицы
	 * @param selectStr - Поля для выборки (по умолчанию '*')
	 * @param options - Дополнительные опции запроса
	 */
	constructor(
		supabase: SupabaseClient,
		tableName: string,
		selectStr: string = '*',
		options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }
	) {
		this.client = supabase;
		this.tableName = tableName;
		this.query = supabase.from(tableName).select(selectStr, options);
	}

	/**
	 * Создает новый экземпляр построителя запросов
	 * @param supabase - Клиент Supabase
	 * @param tableName - Название таблицы
	 * @param selectStr - Поля для выборки (по умолчанию '*')
	 * @param options - Дополнительные опции запроса
	 */
	static create<T = any>(
		supabase: SupabaseClient,
		tableName: string,
		selectStr: string = '*',
		options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }
	): SupabaseQueryBuilder<T> {
		return new SupabaseQueryBuilder<T>(supabase, tableName, selectStr, options);
	}

	/**
	 * Применяет фильтры к запросу
	 * @param filters - Массив фильтров
	 */
	filter(
		filters: {
			column: string;
			operator:
				| 'eq'
				| 'neq'
				| 'gt'
				| 'lt'
				| 'gte'
				| 'lte'
				| 'like'
				| 'ilike'
				| 'in'
				| 'is'
				| 'not'
				| 'contains'
				| 'overlaps';
			value: any;
		}[]
	): this {
		if (filters && filters.length > 0) {
			filters.forEach((filter) => {
				switch (filter.operator) {
					case 'eq':
						this.query = this.query.eq(filter.column, filter.value);
						break;
					case 'neq':
						this.query = this.query.neq(filter.column, filter.value);
						break;
					case 'gt':
						this.query = this.query.gt(filter.column, filter.value);
						break;
					case 'lt':
						this.query = this.query.lt(filter.column, filter.value);
						break;
					case 'gte':
						this.query = this.query.gte(filter.column, filter.value);
						break;
					case 'lte':
						this.query = this.query.lte(filter.column, filter.value);
						break;
					case 'like':
						this.query = this.query.like(filter.column, filter.value);
						break;
					case 'ilike':
						this.query = this.query.ilike(filter.column, filter.value);
						break;
					case 'in':
						this.query = this.query.in(filter.column, filter.value);
						break;
					case 'is':
						this.query = this.query.is(filter.column, filter.value);
						break;
					case 'not':
						this.query = this.query.not(filter.column, 'eq', filter.value);
						break;
					case 'contains':
						this.query = this.query.contains(filter.column, filter.value);
						break;
					case 'overlaps':
						this.query = this.query.overlaps(filter.column, filter.value);
						break;
				}
			});
		}
		return this;
	}

	/**
	 * Применяет одиночный фильтр
	 */
	applyFilter(
		column: string,
		operator:
			| 'eq'
			| 'neq'
			| 'gt'
			| 'lt'
			| 'gte'
			| 'lte'
			| 'like'
			| 'ilike'
			| 'in'
			| 'is'
			| 'not'
			| 'contains'
			| 'overlaps',
		value: any
	): this {
		return this.filter([{ column, operator, value }]);
	}

	/**
	 * Применяет сортировку к запросу
	 * @param sorts - Массив параметров сортировки
	 */
	sort(sorts: { column: string; order?: 'asc' | 'desc' }[]): this {
		if (sorts && sorts.length > 0) {
			sorts.forEach((sort) => {
				this.query = this.query.order(sort.column, { ascending: sort.order !== 'desc' });
			});
		}
		return this;
	}

	/**
	 * Применяет лимит к запросу
	 * @param limit - Максимальное количество результатов
	 */
	limit(limit: number): this {
		this.query = this.query.limit(limit);
		return this;
	}

	/**
	 * Применяет смещение к запросу (для пагинации)
	 * @param offset - Смещение
	 * @param limitSize - Размер страницы (по умолчанию 10)
	 */
	offset(offset: number, limitSize?: number): this {
		this.query = this.query.range(offset, offset + (limitSize || 10) - 1);
		return this;
	}

	/**
	 * Выполняет запрос и возвращает результаты
	 * @returns - Массив результатов
	 */
	async execute(): Promise<T[]> {
		const { data, error } = await this.query;

		if (error) {
			console.error(`Ошибка при запросе к таблице ${this.tableName}:`, error);
			throw error;
		}

		return data as T[];
	}

	/**
	 * Выполняет запрос и возвращает один результат или null
	 * @returns - Один результат или null
	 */
	async executeSingle(): Promise<T | null> {
		const results = await this.limit(1).execute();
		return results.length > 0 ? results[0] : null;
	}
}

// Примеры использования:

/*
// Пример 1: Получение списка профилей с фильтрацией и сортировкой
const profiles = await SupabaseQueryBuilder.create(supabase, 'profiles', 'id, full_name, avatar_url')
  .filter([
    { column: 'full_name', operator: 'ilike', value: `%${profileSearchTerm || ''}%` },
    { column: 'id', operator: 'not', value: profile.id }
  ])
  .sort([{ column: 'full_name', order: 'asc' }])
  .limit(5)
  .execute();

// Пример 2: Получение всех тикетов с помощью класса-построителя
const tickets = await SupabaseQueryBuilder.create(supabase, 'tickets')
  .filter([
    { column: 'status', operator: 'eq', value: 'open' }
  ])
  .sort([{ column: 'created_at', order: 'desc' }])
  .limit(10)
  .offset(0)
  .execute();

// Пример 3: Цепочки методов для построения сложных запросов
const queryBuilder = SupabaseQueryBuilder.create(supabase, 'users', 'id, username, email');

if (searchTerm) {
  queryBuilder.applyFilter('username', 'ilike', `%${searchTerm}%`);
}

if (role) {
  queryBuilder.applyFilter('role', 'eq', role);
}

if (sortBy) {
  queryBuilder.sort([{ column: sortBy, order: sortOrder }]);
}

const users = await queryBuilder
  .limit(pageSize)
  .offset(pageSize * (pageNumber - 1), pageSize)
  .execute();
*/
