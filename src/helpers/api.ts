import { ObjectId } from 'mongoose';
import { IDictionaryEntry, IDictionaryTag } from '../Document/Dictionary';

export type DictionaryEntryField =
	| 'word'
	| 'translation'
	| 'createdAt'
	| 'updatedAt';

const ApiStatuses = {
	OK: 1,
	UNAUTHANTICATED: 2,
	UNAUTHORIZED: 3,
	INVALIDARGUMENT: 4,
	ERROR: 5,
} as const;
type ApiStatus = typeof ApiStatuses[keyof typeof ApiStatuses];
export { ApiStatus, ApiStatuses };

type ApiMethod = 'post' | 'put' | 'patch' | 'get' | 'delete';

interface ApiEndpoint {
	path: string;
	method: ApiMethod;
}
interface ApiPath {
	path: string;
	endpoints: {
		[key: string]: ApiEndpoint;
	};
}

const ApiPaths: { [key: string]: ApiPath } = {
	user: {
		path: 'user',
		endpoints: {
			login: {
				path: 'login',
				method: 'post',
			},
			register: {
				path: 'register',
				method: 'post',
			},
			auth: {
				path: 'auth',
				method: 'get',
			},
			verify: {
				path: 'verify',
				method: 'post',
			},
		},
	},
	document: {
		path: 'document',
		endpoints: {
			save: {
				path: 'entries',
				method: 'post',
			},
			list: {
				path: 'entries/list',
				method: 'post',
			},
			getById: {
				path: 'entries',
				method: 'get',
			},
		},
	},
	tags: {
		path: 'tags',
		endpoints: {
			getMany: {
				path: 'retrieve',
				method: 'post',
			},
			getAll: {
				path: 'entries',
				method: 'get',
			},
			applyDelta: {
				path: 'delta',
				method: 'post',
			},
		},
	},
	dict: {
		path: 'dict',
		endpoints: {
			getMany: {
				path: 'retrieve',
				method: 'post',
			},
			add: {
				path: 'entries',
				method: 'post',
			},
			applyDelta: {
				path: 'delta',
				method: 'post',
			},
			modify: {
				path: 'entry',
				method: 'patch',
			},
			delete: {
				path: 'entry',
				method: 'delete',
			},
			getAll: {
				path: 'entries',
				method: 'get',
			},
			list: {
				path: 'list',
				method: 'post',
			},
			search: {
				path: 'search',
				method: 'get',
			},
			get: {
				path: 'entry',
				method: 'get',
			},
			fetch: {
				path: 'entry/fetch',
				method: 'post',
			},
			analyze: {
				path: 'analyze',
				method: 'post',
			},
		},
	},
};

export { ApiPaths };

export interface IRegisterParams {
	username: string;
	email: string;
	password: string;
}

export interface IVerifyEmailParams {
	token: string;
}

export interface ILoginParams {
	email: string;
	password: string;
}

export interface IUserResponseData {
	id?: ObjectId;
	email: string;
	username: string;
}

export interface ILoginResponseData {
	user: IUserResponseData;
	token: string;
}

export interface IUserData {
	id: string;
}

export interface ITokenData {
	user: IUserData;
}

export interface IApiResponse<T = null> {
	status: ApiStatus;
	message: string;
	payload: T;
}

export interface IDictionaryEntryParams {
	word: string;
	translation: string;
	lang: string;
}

export interface IDictionaryDelta {
	removedEntries: Array<string>;
	updatedEntries: Array<IDictionaryEntry>;
	addedEntries: Array<IDictionaryEntry>;
}

export interface ITagDelta {
	removedTags: Array<string>;
	updatedTags: Array<IDictionaryTag>;
	addedTags: Array<IDictionaryTag>;
}

export interface IDictionaryFetchParams {
	sortBy: DictionaryEntryField;
	lang: string;
	limit: number;
	skip: number;
}

export interface IGetManyDictEntriesPrams {
	lang: string;
	ids: Array<string>;
}

export interface IGetManyTagsPrams {
	lang: string;
	ids: Array<string>;
}

export interface IListDocumentsParams {
	sortBy: 'title' | 'createdAt';
	skip: number;
	limit: number;
	excerptLength: number;
}

export interface IListDictionaryParams {
	sortBy: {
		key: keyof Pick<
			IDictionaryEntry,
			'comment' | 'key' | 'spelling' | 'translations'
		>;
		order: 'ascend' | 'descend';
	};
	filter?: {
		[key in keyof Pick<
			IDictionaryEntry,
			'comment' | 'key' | 'spelling' | 'translations'
		>]?: Array<string> | null;
	};
	skip: number;
	limit: number;
	excerptLength: number;
	lang: string;
}

export interface IDocumentExcerpt {
	id: string;
	title: string;
	excerpt: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface IListDocumentResult {
	total: number;
	excerpts: Array<IDocumentExcerpt>;
}

export interface IListDictionaryResult {
	total: number;
	entries: Array<IDictionaryEntry>;
}
